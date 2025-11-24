import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { rateLimiters } from '../middleware/rate-limit.middleware';
import { AnalysisModel } from '../models/analysis.model';
import { ApiResponse, PaginatedResponse } from '@ai-stock-analyser/shared';

/**
 * Request parameter schemas
 */
const tickerParamSchema = z.object({
  ticker: z.string().min(1, 'Ticker symbol is required').toUpperCase(),
});

const analysisRequestSchema = z.object({
  includeNews: z.boolean().optional().default(true),
  includePredictions: z.boolean().optional().default(true),
});

const historyQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

/**
 * AI analysis routes
 */
export async function analysisRoutes(fastify: FastifyInstance) {
  /**
   * POST /analysis/:ticker
   * Request new AI analysis (requires auth, rate limited)
   */
  fastify.post<{
    Params: z.infer<typeof tickerParamSchema>;
    Body: z.infer<typeof analysisRequestSchema>;
  }>(
    '/:ticker',
    { preHandler: [requireAuth, rateLimiters.analysis] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = tickerParamSchema.parse(request.params);
        const body = analysisRequestSchema.parse(request.body);
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

        const { ticker } = params;
        const userId = authRequest.user.mongoUserId;

        request.log.info({ ticker, userId, options: body }, 'Creating new analysis request');

        // Check if there's a recent analysis (less than 1 hour old)
        const recentAnalysis = await AnalysisModel.findOne({
          ticker,
          generatedAt: { $gte: new Date(Date.now() - 3600000) }, // 1 hour ago
        }).sort({ generatedAt: -1 });

        if (recentAnalysis) {
          const response: ApiResponse = {
            success: true,
            data: {
              analysis: recentAnalysis.toJSON(),
              cached: true,
              message: 'Recent analysis found',
            },
            timestamp: Date.now(),
          };
          return reply.status(200).send(response);
        }

        // TODO: Queue analysis job and return job ID
        // For now, return pending status
        const jobId = `analysis-${ticker}-${Date.now()}`;

        const response: ApiResponse = {
          success: true,
          data: {
            jobId,
            ticker,
            status: 'pending',
            message: 'Analysis request queued',
            estimatedTime: 30, // seconds
          },
          timestamp: Date.now(),
        };

        return reply.status(202).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to create analysis request');

        if (error instanceof z.ZodError) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid request parameters',
              details: error.errors,
            },
            timestamp: Date.now(),
          };
          return reply.status(400).send(response);
        }

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'ANALYSIS_REQUEST_FAILED',
            message: 'Failed to create analysis request',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * GET /analysis/:ticker
   * Get cached analysis or pending status
   * Optional auth for tracking
   */
  fastify.get<{
    Params: z.infer<typeof tickerParamSchema>;
  }>(
    '/:ticker',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = tickerParamSchema.parse(request.params);
        const { ticker } = params;

        request.log.info({ ticker }, 'Fetching analysis');

        // Find latest analysis for ticker
        const analysis = await AnalysisModel.findLatestByTicker(ticker);

        if (!analysis) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'ANALYSIS_NOT_FOUND',
              message: `No analysis found for ticker ${ticker}`,
            },
            timestamp: Date.now(),
          };
          return reply.status(404).send(response);
        }

        // Check if analysis has expired
        const isExpired = analysis.expiresAt < new Date();

        const response: ApiResponse = {
          success: true,
          data: {
            analysis: analysis.toJSON(),
            expired: isExpired,
            age: Date.now() - analysis.generatedAt.getTime(),
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to fetch analysis');

        if (error instanceof z.ZodError) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid ticker symbol',
              details: error.errors,
            },
            timestamp: Date.now(),
          };
          return reply.status(400).send(response);
        }

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FETCH_ANALYSIS_FAILED',
            message: 'Failed to fetch analysis',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * GET /analysis/history
   * Get user's analysis history (requires auth)
   * Paginated response
   */
  fastify.get<{
    Querystring: z.infer<typeof historyQuerySchema>;
  }>(
    '/history',
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

        const query = historyQuerySchema.parse(request.query);
        const { page, limit } = query;
        const skip = (page - 1) * limit;

        const userId = authRequest.user.mongoUserId;

        request.log.info({ userId, page, limit }, 'Fetching analysis history');

        // Get user's analysis history with pagination
        const [analyses, total] = await Promise.all([
          AnalysisModel.find({ requestedBy: userId })
            .sort({ generatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec(),
          AnalysisModel.countDocuments({ requestedBy: userId }),
        ]);

        const paginatedResponse: PaginatedResponse<any> = {
          data: analyses.map((a) => a.toJSON()),
          pagination: {
            total,
            page,
            limit,
            hasMore: skip + analyses.length < total,
          },
        };

        const response: ApiResponse = {
          success: true,
          data: paginatedResponse,
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to fetch analysis history');

        if (error instanceof z.ZodError) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid query parameters',
              details: error.errors,
            },
            timestamp: Date.now(),
          };
          return reply.status(400).send(response);
        }

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FETCH_HISTORY_FAILED',
            message: 'Failed to fetch analysis history',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );
}
