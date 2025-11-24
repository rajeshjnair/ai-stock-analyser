import Redis from 'ioredis';
import { env } from './env.js';

export const redisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  },
});

// Event handlers
redisClient.on('connect', () => {
  console.log('Redis client connected');
});

redisClient.on('ready', () => {
  console.log('Redis client ready');
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

redisClient.on('close', () => {
  console.log('Redis client connection closed');
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting');
});

// Helper functions
export async function disconnectRedis(): Promise<void> {
  try {
    await redisClient.quit();
    console.log('Redis connection closed gracefully');
  } catch (error) {
    console.error('Error closing Redis connection:', error);
    await redisClient.disconnect();
  }
}

export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redisClient.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCache(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await redisClient.setex(key, ttlSeconds, serialized);
  } else {
    await redisClient.set(key, serialized);
  }
}

export async function deleteCache(key: string): Promise<void> {
  await redisClient.del(key);
}

export async function clearCachePattern(pattern: string): Promise<void> {
  const keys = await redisClient.keys(pattern);
  if (keys.length > 0) {
    await redisClient.del(...keys);
  }
}
