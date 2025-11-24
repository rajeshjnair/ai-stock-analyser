import { FastifyInstance } from 'fastify';
import { authRoutes } from './auth.routes';
import { stockRoutes } from './stock.routes';
import { analysisRoutes } from './analysis.routes';
import { userRoutes } from './user.routes';

/**
 * Register all application routes
 * @param fastify - Fastify instance
 */
export async function registerRoutes(fastify: FastifyInstance): Promise<void> {
  // Health check endpoint
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  // API root endpoint
  fastify.get('/api', async () => {
    return {
      name: 'AI Stock Analyser API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        stocks: '/api/stocks',
        analysis: '/api/analysis',
        user: '/api/user',
      },
      documentation: '/api/docs',
    };
  });

  // Register route modules with prefixes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(stockRoutes, { prefix: '/api/stocks' });
  await fastify.register(analysisRoutes, { prefix: '/api/analysis' });
  await fastify.register(userRoutes, { prefix: '/api/user' });

  fastify.log.info('All routes registered successfully');
}

/**
 * Route summary for logging and documentation
 */
export const routeSummary = {
  auth: {
    prefix: '/api/auth',
    routes: [
      'POST /verify - Verify Firebase token and create/update user',
      'POST /logout - Invalidate user session',
      'GET /me - Get current user profile',
    ],
  },
  stocks: {
    prefix: '/api/stocks',
    routes: [
      'GET /trending - Get trending stocks',
      'GET /search?q=:query - Search stocks by ticker or name',
      'GET /:ticker - Get stock information and current quote',
      'GET /:ticker/history - Get historical stock data',
    ],
  },
  analysis: {
    prefix: '/api/analysis',
    routes: [
      'POST /:ticker - Request new AI analysis (rate limited)',
      'GET /:ticker - Get cached analysis or pending status',
      'GET /history - Get user\'s analysis history (paginated)',
    ],
  },
  user: {
    prefix: '/api/user',
    routes: [
      'GET /watchlist - Get user\'s watchlist',
      'PUT /watchlist - Update user\'s watchlist',
      'GET /usage - Get usage statistics and rate limits',
      'GET /settings - Get user settings',
      'PUT /settings - Update user settings',
    ],
  },
};
