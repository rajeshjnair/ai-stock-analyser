import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { auth } from '../config/firebase';
import { getOrCreateUser, updateLastLogin, getUserById } from '../services/auth.service';
import { redis } from '../config/redis';
import { ApiResponse } from '@ai-stock-analyser/shared';

/**
 * Request body schemas
 */
const verifyTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * Authentication routes
 */
export async function authRoutes(fastify: FastifyInstance) {
  /**
   * POST /auth/verify
   * Verify Firebase token, create/update user, return user profile
   */
  fastify.post<{
    Body: z.infer<typeof verifyTokenSchema>;
  }>('/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Validate request body
      const body = verifyTokenSchema.parse(request.body);

      // Verify Firebase ID token
      const decodedToken = await auth.verifyIdToken(body.token);

      // Get or create user in MongoDB
      const user = await getOrCreateUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
      });

      // Update last login asynchronously
      updateLastLogin(user._id.toString()).catch((error) => {
        request.log.error({ error, userId: user._id }, 'Failed to update last login');
      });

      // Create session in Redis (optional - for additional session tracking)
      const sessionKey = `session:${decodedToken.uid}`;
      await redis.setex(
        sessionKey,
        86400 * 7, // 7 days
        JSON.stringify({
          uid: decodedToken.uid,
          mongoUserId: user._id.toString(),
          email: decodedToken.email,
          createdAt: Date.now(),
        })
      );

      const response: ApiResponse = {
        success: true,
        data: {
          user: user.toJSON(),
          session: {
            expiresAt: Date.now() + 86400 * 7 * 1000,
          },
        },
        timestamp: Date.now(),
      };

      return reply.status(200).send(response);
    } catch (error: any) {
      request.log.error({ error }, 'Token verification failed');

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/id-token-expired') {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Authentication token has expired',
          },
          timestamp: Date.now(),
        };
        return reply.status(401).send(response);
      }

      if (error.code === 'auth/id-token-revoked') {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'TOKEN_REVOKED',
            message: 'Authentication token has been revoked',
          },
          timestamp: Date.now(),
        };
        return reply.status(401).send(response);
      }

      if (error.code === 'auth/argument-error') {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Invalid authentication token format',
          },
          timestamp: Date.now(),
        };
        return reply.status(401).send(response);
      }

      // Handle Zod validation errors
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

      // Generic error response
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Failed to authenticate user',
        },
        timestamp: Date.now(),
      };
      return reply.status(401).send(response);
    }
  });

  /**
   * POST /auth/logout
   * Invalidate session (clear from Redis)
   */
  fastify.post(
    '/logout',
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

        // Delete session from Redis
        const sessionKey = `session:${authRequest.user.uid}`;
        await redis.del(sessionKey);

        const response: ApiResponse = {
          success: true,
          data: {
            message: 'Successfully logged out',
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Logout failed');

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'LOGOUT_FAILED',
            message: 'Failed to logout',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * GET /auth/me
   * Get current user profile (requires auth)
   */
  fastify.get(
    '/me',
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

        // Get user from database
        const user = await getUserById(authRequest.user.mongoUserId);

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
            user: user.toJSON(),
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to get user profile');

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FETCH_USER_FAILED',
            message: 'Failed to fetch user profile',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );
}
