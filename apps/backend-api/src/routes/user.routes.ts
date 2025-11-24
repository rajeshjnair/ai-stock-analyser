import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { UserModel } from '../models/user.model';
import { getCurrentUsage } from '../middleware/rate-limit.middleware';
import { ApiResponse } from '@ai-stock-analyser/shared';

/**
 * Request body schemas
 */
const updateWatchlistSchema = z.object({
  symbols: z.array(z.string().min(1).toUpperCase()).min(1).max(10),
  action: z.enum(['add', 'remove', 'replace']),
});

const updateSettingsSchema = z.object({
  notifications: z
    .object({
      email: z.boolean().optional(),
      push: z.boolean().optional(),
      priceAlerts: z.boolean().optional(),
      newsAlerts: z.boolean().optional(),
    })
    .optional(),
  preferences: z
    .object({
      defaultView: z.enum(['grid', 'list']).optional(),
      theme: z.enum(['light', 'dark', 'auto']).optional(),
      currency: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
  privacy: z
    .object({
      shareWatchlist: z.boolean().optional(),
      shareActivity: z.boolean().optional(),
    })
    .optional(),
});

/**
 * User data routes
 */
export async function userRoutes(fastify: FastifyInstance) {
  /**
   * GET /user/watchlist
   * Get user's watchlist (requires auth)
   */
  fastify.get(
    '/watchlist',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authRequest = request as AuthenticatedRequest;

        if (!authRequest.user) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated',
            },
            timestamp: Date.now(),
          };
          return reply.status(401).send(response);
        }

        const userId = authRequest.user.mongoUserId;

        request.log.info({ userId }, 'Fetching user watchlist');

        // Get user from database
        const user = await UserModel.findById(userId);

        if (!user) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
            timestamp: Date.now(),
          };
          return reply.status(404).send(response);
        }

        const response: ApiResponse = {
          success: true,
          data: {
            watchlist: user.watchlist,
            count: user.watchlist.length,
            maxAllowed: 10,
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to fetch watchlist');

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FETCH_WATCHLIST_FAILED',
            message: 'Failed to fetch watchlist',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * PUT /user/watchlist
   * Update user's watchlist (requires auth)
   */
  fastify.put<{
    Body: z.infer<typeof updateWatchlistSchema>;
  }>(
    '/watchlist',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authRequest = request as AuthenticatedRequest;

        if (!authRequest.user) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated',
            },
            timestamp: Date.now(),
          };
          return reply.status(401).send(response);
        }

        const body = updateWatchlistSchema.parse(request.body);
        const userId = authRequest.user.mongoUserId;

        request.log.info({ userId, action: body.action, symbols: body.symbols }, 'Updating watchlist');

        // Update watchlist using model static method
        const updatedUser = await UserModel.updateWatchlist(userId, body.action, body.symbols);

        if (!updatedUser) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
            timestamp: Date.now(),
          };
          return reply.status(404).send(response);
        }

        const response: ApiResponse = {
          success: true,
          data: {
            watchlist: updatedUser.watchlist,
            count: updatedUser.watchlist.length,
            maxAllowed: 10,
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to update watchlist');

        if (error instanceof z.ZodError) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request body',
              details: error.errors,
            },
            timestamp: Date.now(),
          };
          return reply.status(400).send(response);
        }

        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: error.message,
            },
            timestamp: Date.now(),
          };
          return reply.status(400).send(response);
        }

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UPDATE_WATCHLIST_FAILED',
            message: 'Failed to update watchlist',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * GET /user/usage
   * Get user's usage statistics (requires auth)
   */
  fastify.get(
    '/usage',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authRequest = request as AuthenticatedRequest;

        if (!authRequest.user) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated',
            },
            timestamp: Date.now(),
          };
          return reply.status(401).send(response);
        }

        const userId = authRequest.user.mongoUserId;
        const tier = authRequest.user.tier;

        request.log.info({ userId }, 'Fetching user usage statistics');

        // Get current usage from Redis rate limiter
        const [analysisUsage, stockInfoUsage] = await Promise.all([
          getCurrentUsage(userId, 'analysis'),
          getCurrentUsage(userId, 'stockInfo'),
        ]);

        const response: ApiResponse = {
          success: true,
          data: {
            tier,
            analysis: {
              current: analysisUsage.current,
              limit: analysisUsage.limit,
              remaining: Math.max(0, analysisUsage.limit - analysisUsage.current),
              resetAt: analysisUsage.resetAt.toISOString(),
            },
            stockInfo: {
              current: stockInfoUsage.current,
              limit: stockInfoUsage.limit,
              remaining: Math.max(0, stockInfoUsage.limit - stockInfoUsage.current),
              resetAt: stockInfoUsage.resetAt.toISOString(),
            },
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to fetch usage statistics');

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FETCH_USAGE_FAILED',
            message: 'Failed to fetch usage statistics',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * GET /user/settings
   * Get user settings (requires auth)
   */
  fastify.get(
    '/settings',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authRequest = request as AuthenticatedRequest;

        if (!authRequest.user) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated',
            },
            timestamp: Date.now(),
          };
          return reply.status(401).send(response);
        }

        const userId = authRequest.user.mongoUserId;

        request.log.info({ userId }, 'Fetching user settings');

        const user = await UserModel.findById(userId);

        if (!user) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
            timestamp: Date.now(),
          };
          return reply.status(404).send(response);
        }

        const response: ApiResponse = {
          success: true,
          data: {
            settings: user.settings,
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to fetch user settings');

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FETCH_SETTINGS_FAILED',
            message: 'Failed to fetch user settings',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * PUT /user/settings
   * Update user settings (requires auth)
   */
  fastify.put<{
    Body: z.infer<typeof updateSettingsSchema>;
  }>(
    '/settings',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const authRequest = request as AuthenticatedRequest;

        if (!authRequest.user) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated',
            },
            timestamp: Date.now(),
          };
          return reply.status(401).send(response);
        }

        const body = updateSettingsSchema.parse(request.body);
        const userId = authRequest.user.mongoUserId;

        request.log.info({ userId, settings: body }, 'Updating user settings');

        // Build update object with dot notation for nested fields
        const updateFields: any = {};

        if (body.notifications) {
          Object.entries(body.notifications).forEach(([key, value]) => {
            updateFields[`settings.notifications.${key}`] = value;
          });
        }

        if (body.preferences) {
          Object.entries(body.preferences).forEach(([key, value]) => {
            updateFields[`settings.preferences.${key}`] = value;
          });
        }

        if (body.privacy) {
          Object.entries(body.privacy).forEach(([key, value]) => {
            updateFields[`settings.privacy.${key}`] = value;
          });
        }

        // Update user settings
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { $set: updateFields },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
            timestamp: Date.now(),
          };
          return reply.status(404).send(response);
        }

        const response: ApiResponse = {
          success: true,
          data: {
            settings: updatedUser.settings,
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to update user settings');

        if (error instanceof z.ZodError) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request body',
              details: error.errors,
            },
            timestamp: Date.now(),
          };
          return reply.status(400).send(response);
        }

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UPDATE_SETTINGS_FAILED',
            message: 'Failed to update user settings',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );
}
