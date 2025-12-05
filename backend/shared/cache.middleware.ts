import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  enableReadyCheck: true,
  lazyConnect: false
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✓ Redis connected for caching');
});

interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 300)
  key?: string; // Custom cache key
  condition?: (req: Request) => boolean; // Conditional caching
}

/**
 * Redis caching middleware for Express routes
 * @param options Cache configuration options
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const { ttl = 300, key: customKey, condition } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check conditional caching
    if (condition && !condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = customKey || `cache:${req.originalUrl || req.url}`;

    try {
      // Try to get cached response
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        const data = JSON.parse(cachedData);
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(data);
      }

      // Cache miss - intercept response
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('X-Cache-Key', cacheKey);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data: any) {
        // Cache the response
        redis.setex(cacheKey, ttl, JSON.stringify(data)).catch(err => {
          console.error('Cache set error:', err);
        });

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      // On error, bypass cache and continue
      next();
    }
  };
};

/**
 * Invalidate cache by pattern
 * @param pattern Redis key pattern (e.g., 'cache:blueprints:*')
 */
export const invalidateCache = async (pattern: string): Promise<number> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      return await redis.del(...keys);
    }
    return 0;
  } catch (error) {
    console.error('Cache invalidation error:', error);
    return 0;
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  try {
    const info = await redis.info('stats');
    const memory = await redis.info('memory');
    
    return {
      connected: redis.status === 'ready',
      info: info,
      memory: memory
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return null;
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<boolean> => {
  try {
    await redis.flushdb();
    return true;
  } catch (error) {
    console.error('Cache clear error:', error);
    return false;
  }
};

export default redis;
