import { redis } from '../config/redis';

/**
 * Redis caching service with type-safe operations
 */
export class CacheService {
  private prefix: string;

  constructor(prefix: string = 'cache') {
    this.prefix = prefix;
  }

  /**
   * Generate cache key with prefix
   */
  private getKey(key: string): string {
    return `${this.prefix}:${key}`;
  }

  /**
   * Get value from cache with type safety
   * @param key - Cache key
   * @returns Parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getKey(key);
    const value = await redis.get(fullKey);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      // If parsing fails, return raw string as type T
      return value as unknown as T;
    }
  }

  /**
   * Set value in cache with optional TTL
   * @param key - Cache key
   * @param value - Value to cache (will be JSON stringified)
   * @param ttl - Time to live in seconds (optional)
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const fullKey = this.getKey(key);
    const serialized = JSON.stringify(value);

    if (ttl) {
      await redis.setex(fullKey, ttl, serialized);
    } else {
      await redis.set(fullKey, serialized);
    }
  }

  /**
   * Delete key from cache
   * @param key - Cache key
   * @returns Number of keys deleted (0 or 1)
   */
  async del(key: string): Promise<number> {
    const fullKey = this.getKey(key);
    return redis.del(fullKey);
  }

  /**
   * Check if key exists in cache
   * @param key - Cache key
   * @returns True if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    const result = await redis.exists(fullKey);
    return result === 1;
  }

  /**
   * Get time to live for a key
   * @param key - Cache key
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    const fullKey = this.getKey(key);
    return redis.ttl(fullKey);
  }

  /**
   * Set expiry on existing key
   * @param key - Cache key
   * @param ttl - Time to live in seconds
   * @returns True if expiry was set
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    const fullKey = this.getKey(key);
    const result = await redis.expire(fullKey, ttl);
    return result === 1;
  }

  /**
   * Set value with distributed lock to prevent race conditions
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Cache TTL in seconds
   * @param lockTtl - Lock TTL in seconds (default: 10)
   * @returns True if lock was acquired and value was set
   */
  async setWithLock(
    key: string,
    value: any,
    ttl: number,
    lockTtl: number = 10
  ): Promise<boolean> {
    const lockKey = `${this.prefix}:lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;

    // Try to acquire lock using SET NX EX
    const lockAcquired = await redis.set(lockKey, lockValue, 'EX', lockTtl, 'NX');

    if (!lockAcquired) {
      // Lock already held by another process
      return false;
    }

    try {
      // Set the actual value
      await this.set(key, value, ttl);
      return true;
    } finally {
      // Release lock only if we still own it
      const currentLockValue = await redis.get(lockKey);
      if (currentLockValue === lockValue) {
        await redis.del(lockKey);
      }
    }
  }

  /**
   * Get or compute value with distributed locking
   * Prevents cache stampede by ensuring only one process computes the value
   * @param key - Cache key
   * @param computeFn - Function to compute value if not cached
   * @param ttl - Cache TTL in seconds
   * @param lockTtl - Lock TTL in seconds (should be > compute time)
   * @returns Cached or computed value
   */
  async getOrCompute<T>(
    key: string,
    computeFn: () => Promise<T>,
    ttl: number,
    lockTtl: number = 30
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const lockKey = `${this.prefix}:lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;

    // Try to acquire lock
    const lockAcquired = await redis.set(lockKey, lockValue, 'EX', lockTtl, 'NX');

    if (!lockAcquired) {
      // Another process is computing, wait briefly and retry getting from cache
      await new Promise((resolve) => setTimeout(resolve, 100));

      const retried = await this.get<T>(key);
      if (retried !== null) {
        return retried;
      }

      // If still not available, compute anyway (failsafe)
      return computeFn();
    }

    try {
      // Compute value
      const value = await computeFn();

      // Store in cache
      await this.set(key, value, ttl);

      return value;
    } finally {
      // Release lock only if we still own it
      const currentLockValue = await redis.get(lockKey);
      if (currentLockValue === lockValue) {
        await redis.del(lockKey);
      }
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param pattern - Redis key pattern (e.g., "user:*")
   * @returns Number of keys deleted
   */
  async deleteByPattern(pattern: string): Promise<number> {
    const fullPattern = this.getKey(pattern);
    const keys = await redis.keys(fullPattern);

    if (keys.length === 0) {
      return 0;
    }

    return redis.del(...keys);
  }

  /**
   * Increment a numeric value in cache
   * @param key - Cache key
   * @param amount - Amount to increment by (default: 1)
   * @returns New value after increment
   */
  async increment(key: string, amount: number = 1): Promise<number> {
    const fullKey = this.getKey(key);
    return redis.incrby(fullKey, amount);
  }

  /**
   * Decrement a numeric value in cache
   * @param key - Cache key
   * @param amount - Amount to decrement by (default: 1)
   * @returns New value after decrement
   */
  async decrement(key: string, amount: number = 1): Promise<number> {
    const fullKey = this.getKey(key);
    return redis.decrby(fullKey, amount);
  }
}

/**
 * Default cache service instance
 */
export const cacheService = new CacheService('cache');

/**
 * Create a cache service with custom prefix
 */
export function createCacheService(prefix: string): CacheService {
  return new CacheService(prefix);
}
