import Redis from 'ioredis';
import crypto from 'crypto';
import { logger } from './logger';

// Redis client singleton
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'redis',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        logger.warn('Redis connection retry', { attempt: times, delay });
        return delay;
      },
      reconnectOnError(err) {
        logger.error('Redis connection error', { error: err.message });
        return true;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis client error', { error: err.message });
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redisClient;
}

// Cache key generator
export function generateCacheKey(prefix: string, ...args: any[]): string {
  const argsString = JSON.stringify(args);
  const hash = crypto.createHash('md5').update(argsString).digest('hex');
  return `${prefix}:${hash}`;
}

// Cache get with JSON parsing
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const cached = await redis.get(key);
    
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached);
    logger.debug('Cache hit', { key, size: cached.length });
    return parsed as T;
  } catch (error: any) {
    logger.error('Cache get error', { key, error: error.message });
    return null;
  }
}

// Cache set with JSON serialization and TTL
export async function cacheSet(
  key: string,
  value: any,
  ttl: number = 300
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const serialized = JSON.stringify(value);
    
    await redis.setex(key, ttl, serialized);
    logger.debug('Cache set', { key, ttl, size: serialized.length });
    return true;
  } catch (error: any) {
    logger.error('Cache set error', { key, error: error.message });
    return false;
  }
}

// Cache delete
export async function cacheDel(key: string | string[]): Promise<number> {
  try {
    const redis = getRedisClient();
    const keys = Array.isArray(key) ? key : [key];
    const deleted = await redis.del(...keys);
    
    logger.debug('Cache delete', { keys, deleted });
    return deleted;
  } catch (error: any) {
    logger.error('Cache delete error', { key, error: error.message });
    return 0;
  }
}

// Cache invalidation by pattern
export async function cacheInvalidatePattern(pattern: string): Promise<number> {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return 0;
    }

    const deleted = await redis.del(...keys);
    logger.info('Cache pattern invalidated', { pattern, deleted });
    return deleted;
  } catch (error: any) {
    logger.error('Cache invalidate pattern error', { pattern, error: error.message });
    return 0;
  }
}

// Cache with tags for easier invalidation
export async function cacheSetWithTags(
  key: string,
  value: any,
  ttl: number,
  tags: string[]
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const serialized = JSON.stringify(value);
    
    // Set the main cache entry
    await redis.setex(key, ttl, serialized);
    
    // Add key to each tag set
    const pipeline = redis.pipeline();
    for (const tag of tags) {
      const tagKey = `tag:${tag}`;
      pipeline.sadd(tagKey, key);
      pipeline.expire(tagKey, ttl);
    }
    await pipeline.exec();
    
    logger.debug('Cache set with tags', { key, ttl, tags });
    return true;
  } catch (error: any) {
    logger.error('Cache set with tags error', { key, error: error.message });
    return false;
  }
}

// Invalidate by tag
export async function cacheInvalidateByTag(tag: string): Promise<number> {
  try {
    const redis = getRedisClient();
    const tagKey = `tag:${tag}`;
    const keys = await redis.smembers(tagKey);
    
    if (keys.length === 0) {
      return 0;
    }

    const deleted = await redis.del(...keys, tagKey);
    logger.info('Cache tag invalidated', { tag, deleted: deleted - 1 });
    return deleted - 1; // Subtract 1 for the tag key itself
  } catch (error: any) {
    logger.error('Cache invalidate by tag error', { tag, error: error.message });
    return 0;
  }
}

// Cache decorator function
export function Cacheable(ttl: number = 300, keyPrefix?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const prefix = keyPrefix || `${target.constructor.name}:${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = generateCacheKey(prefix, ...args);

      // Try to get from cache
      const cached = await cacheGet(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      await cacheSet(cacheKey, result, ttl);

      return result;
    };

    return descriptor;
  };
}

// Cache decorator with tags
export function CacheableWithTags(ttl: number = 300, tags: string[] = [], keyPrefix?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const prefix = keyPrefix || `${target.constructor.name}:${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = generateCacheKey(prefix, ...args);

      // Try to get from cache
      const cached = await cacheGet(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache with tags
      await cacheSetWithTags(cacheKey, result, ttl, tags);

      return result;
    };

    return descriptor;
  };
}

// Cache warmup utility
export async function cacheWarmup<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  try {
    const cached = await cacheGet<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await cacheSet(key, data, ttl);
    return data;
  } catch (error: any) {
    logger.error('Cache warmup error', { key, error: error.message });
    throw error;
  }
}

// Get cache statistics
export async function getCacheStats(): Promise<{
  keys: number;
  memory: string;
  hits: number;
  misses: number;
}> {
  try {
    const redis = getRedisClient();
    const info = await redis.info('stats');
    const memory = await redis.info('memory');
    
    const dbsize = await redis.dbsize();
    
    // Parse stats
    const hitsMatch = info.match(/keyspace_hits:(\d+)/);
    const missesMatch = info.match(/keyspace_misses:(\d+)/);
    const memoryMatch = memory.match(/used_memory_human:([^\r\n]+)/);
    
    return {
      keys: dbsize,
      memory: memoryMatch ? memoryMatch[1] : 'unknown',
      hits: hitsMatch ? parseInt(hitsMatch[1]) : 0,
      misses: missesMatch ? parseInt(missesMatch[1]) : 0,
    };
  } catch (error: any) {
    logger.error('Get cache stats error', { error: error.message });
    return { keys: 0, memory: '0', hits: 0, misses: 0 };
  }
}

// Flush all cache
export async function cacheFlushAll(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.flushdb();
    logger.warn('Cache flushed');
    return true;
  } catch (error: any) {
    logger.error('Cache flush error', { error: error.message });
    return false;
  }
}

// Close Redis connection
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}
