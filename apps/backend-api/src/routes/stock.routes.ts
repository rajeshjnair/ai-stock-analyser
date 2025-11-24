import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { rateLimiters } from '../middleware/rate-limit.middleware';
import { stockService, HistoricalPeriod } from '../services/stock.service';
import { ApiResponse } from '@ai-stock-analyser/shared';

/**
 * Query parameter schemas
 */
const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required'),
});

const historyQuerySchema = z.object({
  period: z.enum(['1D', '1W', '1M', '3M', '6M', '1Y', '5Y']).optional().default('1M'),
});

const tickerParamSchema = z.object({
  ticker: z.string().min(1, 'Ticker symbol is required').toUpperCase(),
});

/**
 * Stock data routes
 */
export async function stockRoutes(fastify: FastifyInstance) {
  /**
   * GET /stocks/trending
   * Get trending stocks (cached)
   * Optional auth for tracking
   */
  fastify.get(
    '/trending',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // TODO: Implement trending stocks logic
        // This could fetch from cache, external API, or calculate based on recent activity
        const authRequest = request as AuthenticatedRequest;
        const userId = authRequest.user?.mongoUserId;

        request.log.info({ userId }, 'Fetching trending stocks');

        // Placeholder trending stocks
        const trendingStocks = [
          { ticker: 'AAPL', name: 'Apple Inc.', change: 2.5, volume: 75000000 },
          { ticker: 'TSLA', name: 'Tesla Inc.', change: 5.2, volume: 120000000 },
          { ticker: 'NVDA', name: 'NVIDIA Corporation', change: 3.8, volume: 65000000 },
          { ticker: 'MSFT', name: 'Microsoft Corporation', change: 1.9, volume: 45000000 },
          { ticker: 'GOOGL', name: 'Alphabet Inc.', change: 2.1, volume: 35000000 },
        ];

        const response: ApiResponse = {
          success: true,
          data: {
            trending: trendingStocks,
            updatedAt: Date.now(),
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to fetch trending stocks');

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'FETCH_TRENDING_FAILED',
            message: 'Failed to fetch trending stocks',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * GET /stocks/search?q=:query
   * Search stocks by ticker or company name
   * Optional auth for tracking
   */
  fastify.get<{
    Querystring: z.infer<typeof searchQuerySchema>;
  }>(
    '/search',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = searchQuerySchema.parse(request.query);
        const authRequest = request as AuthenticatedRequest;
        const userId = authRequest.user?.mongoUserId;

        request.log.info({ query: query.q, userId }, 'Searching stocks');

        // Search stocks using stock service
        const results = await stockService.searchStocks(query.q);

        const response: ApiResponse = {
          success: true,
          data: {
            results,
            query: query.q,
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Stock search failed');

        if (error instanceof z.ZodError) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid search query',
              details: error.errors,
            },
            timestamp: Date.now(),
          };
          return reply.status(400).send(response);
        }

        const response: ApiResponse = {
          success: false,
          error: {
            code: 'SEARCH_FAILED',
            message: 'Failed to search stocks',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * GET /stocks/:ticker
   * Get stock info (cached)
   * Optional auth for tracking, rate limiting if authenticated
   */
  fastify.get<{
    Params: z.infer<typeof tickerParamSchema>;
  }>(
    '/:ticker',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = tickerParamSchema.parse(request.params);
        const authRequest = request as AuthenticatedRequest;
        const userId = authRequest.user?.mongoUserId;

        request.log.info({ ticker: params.ticker, userId }, 'Fetching stock info');

        // Get stock info and quote
        const [info, quote] = await Promise.all([
          stockService.getStockInfo(params.ticker),
          stockService.getStockQuote(params.ticker),
        ]);

        if (!info && !quote) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'STOCK_NOT_FOUND',
              message: `Stock with ticker ${params.ticker} not found`,
            },
            timestamp: Date.now(),
          };
          return reply.status(404).send(response);
        }

        const response: ApiResponse = {
          success: true,
          data: {
            info,
            quote,
            ticker: params.ticker,
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to fetch stock info');

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
            code: 'FETCH_STOCK_FAILED',
            message: 'Failed to fetch stock information',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );

  /**
   * GET /stocks/:ticker/history
   * Get historical data (query params: period)
   * Optional auth for tracking
   */
  fastify.get<{
    Params: z.infer<typeof tickerParamSchema>;
    Querystring: z.infer<typeof historyQuerySchema>;
  }>(
    '/:ticker/history',
    { preHandler: optionalAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const params = tickerParamSchema.parse(request.params);
        const query = historyQuerySchema.parse(request.query);
        const authRequest = request as AuthenticatedRequest;
        const userId = authRequest.user?.mongoUserId;

        request.log.info(
          { ticker: params.ticker, period: query.period, userId },
          'Fetching stock history'
        );

        // Get historical data
        const history = await stockService.getStockHistory(
          params.ticker,
          query.period as HistoricalPeriod
        );

        const response: ApiResponse = {
          success: true,
          data: {
            ticker: params.ticker,
            period: query.period,
            history,
            count: history.length,
          },
          timestamp: Date.now(),
        };

        return reply.status(200).send(response);
      } catch (error: any) {
        request.log.error({ error }, 'Failed to fetch stock history');

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
            code: 'FETCH_HISTORY_FAILED',
            message: 'Failed to fetch stock history',
          },
          timestamp: Date.now(),
        };
        return reply.status(500).send(response);
      }
    }
  );
}
