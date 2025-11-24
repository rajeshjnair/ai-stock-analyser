import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthenticatedRequest } from './auth.middleware';
import { redis } from '../config/redis';

/**
 * Rate limit configuration based on user tier
 */
const RATE_LIMITS = {
  FREE: {
    analysis: 5, // 5 analyses per day
    stockInfo: 50, // 50 stock info requests per day
  },
  PRO: {
    analysis: 100, // 100 analyses per day
    stockInfo: 1000, // 1000 stock info requests per day
  },
  ENTERPRISE: {
    analysis: 1000, // 1000 analyses per day
    stockInfo: 10000, // 10000 stock info requests per day
  },
};

/**
 * Rate limiter options
 */
export interface RateLimiterOptions {
  /**
   * Resource being rate limited (e.g., 'analysis', 'stockInfo')
   */
  resource: 'analysis' | 'stockInfo';

  /**
   * Time window in seconds (default: 86400 = 24 hours)
   */
  windowSeconds?: number;

  /**
   * Custom error message
   */
  errorMessage?: string;
}

/**
 * Get the rate limit key for a user and resource
 */
function getRateLimitKey(userId: string, resource: string): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `ratelimit:${resource}:${userId}:${date}`;
}

/**
 * Get the rate limit for a user tier and resource
 */
function getRateLimit(
  tier: 'FREE' | 'PRO' | 'ENTERPRISE',
  resource: 'analysis' | 'stockInfo'
): number {
  return RATE_LIMITS[tier][resource];
}

/**
 * Create a rate limiter middleware with configurable options
 */
export function createRateLimiter(options: RateLimiterOptions) {
  const {
    resource,
    windowSeconds = 86400, // 24 hours
    errorMessage,
  } = options;

  return async function rateLimitMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const authRequest = request as AuthenticatedRequest;

    // Rate limiting only applies to authenticated users
    if (!authRequest.user) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required for rate limiting',
      });
    }

    const { mongoUserId, tier } = authRequest.user;
    const key = getRateLimitKey(mongoUserId, resource);
    const limit = getRateLimit(tier, resource);

    try {
      // Increment usage count
      const current = await redis.incr(key);

      // Set expiry on first request (when count is 1)
      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      // Get TTL for rate limit reset info
      const ttl = await redis.ttl(key);

      // Add rate limit headers
      reply.header('X-RateLimit-Limit', limit.toString());
      reply.header('X-RateLimit-Remaining', Math.max(0, limit - current).toString());
      reply.header('X-RateLimit-Reset', (Date.now() + ttl * 1000).toString());

      // Check if limit exceeded
      if (current > limit) {
        const resetDate = new Date(Date.now() + ttl * 1000);

        return reply.status(429).send({
          error: 'RateLimitExceeded',
          message:
            errorMessage ||
            `Rate limit exceeded. You have reached your ${tier} tier limit of ${limit} ${resource} requests per day.`,
          limit,
          current: current - 1, // Don't count the failed request
          resetAt: resetDate.toISOString(),
          upgradeUrl: tier === 'FREE' ? '/pricing' : undefined,
        });
      }

      // Continue to next middleware/handler
    } catch (error: any) {
      request.log.error({ error, userId: mongoUserId, resource }, 'Rate limit check failed');

      // On Redis error, fail open (allow request) but log the error
      // This prevents Redis outages from blocking all requests
      request.log.warn(
        { userId: mongoUserId, resource },
        'Allowing request due to rate limit check failure'
      );
    }
  };
}

/**
 * Pre-configured rate limiters for common resources
 */
export const rateLimiters = {
  /**
   * Rate limiter for AI analysis requests
   * FREE: 5/day, PRO: 100/day, ENTERPRISE: 1000/day
   */
  analysis: createRateLimiter({
    resource: 'analysis',
    errorMessage: 'Daily analysis limit reached. Upgrade to PRO for more analyses.',
  }),

  /**
   * Rate limiter for stock info requests
   * FREE: 50/day, PRO: 1000/day, ENTERPRISE: 10000/day
   */
  stockInfo: createRateLimiter({
    resource: 'stockInfo',
    errorMessage: 'Daily stock info limit reached. Upgrade to PRO for more requests.',
  }),
};

/**
 * Get current usage for a user and resource
 */
export async function getCurrentUsage(
  userId: string,
  resource: 'analysis' | 'stockInfo'
): Promise<{ current: number; limit: number; resetAt: Date }> {
  const key = getRateLimitKey(userId, resource);

  const [current, ttl] = await Promise.all([
    redis.get(key).then((val) => (val ? parseInt(val, 10) : 0)),
    redis.ttl(key),
  ]);

  // Default to FREE tier if we don't have tier info
  // This should be called with proper tier context in real usage
  const limit = RATE_LIMITS.FREE[resource];
  const resetAt = new Date(Date.now() + ttl * 1000);

  return {
    current,
    limit,
    resetAt,
  };
}
