import { Request, Response, NextFunction } from 'express';
import { cacheService } from '../services/cache.service';
import { logger } from '../utils/logger';

interface CacheMiddlewareOptions {
  ttl?: number;
  prefix?: string;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

/**
 * Cache middleware for Express routes
 * Caches GET requests by default
 */
export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const {
    ttl = 300, // 5 minutes default
    prefix = 'api',
    keyGenerator = defaultKeyGenerator,
    condition = defaultCondition,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching if disabled
    if (process.env.REDIS_CACHE_ENABLED === 'false') {
      return next();
    }

    // Check condition
    if (!condition(req)) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator(req);
      
      // Try to get from cache
      const cached = await cacheService.get(cacheKey, { prefix });
      
      if (cached) {
        logger.debug(`Serving from cache: ${cacheKey}`);
        
        // Add cache header
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', `${prefix}:${cacheKey}`);
        
        return res.json(cached);
      }

      // Cache miss - intercept response
      logger.debug(`Cache miss: ${cacheKey}`);
      res.setHeader('X-Cache', 'MISS');

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(body: any) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cacheService.set(cacheKey, body, { ttl, prefix }).catch(err => {
            logger.error('Failed to cache response:', err);
          });
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Invalidate cache middleware
 * Clears cache on mutating operations (POST, PUT, PATCH, DELETE)
 */
export function invalidateCacheMiddleware(options: {
  patterns: string[];
  prefix?: string;
} = { patterns: [] }) {
  const { patterns, prefix = 'api' } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Only invalidate on mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    // Store original json/send methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Function to invalidate cache
    const invalidate = async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          for (const pattern of patterns) {
            await cacheService.deleteByPattern(pattern, { prefix });
          }
          logger.debug(`Cache invalidated for patterns: ${patterns.join(', ')}`);
        } catch (error) {
          logger.error('Cache invalidation error:', error);
        }
      }
    };

    // Override json method
    res.json = function(body: any) {
      invalidate();
      return originalJson(body);
    };

    // Override send method
    res.send = function(body: any) {
      invalidate();
      return originalSend(body);
    };

    next();
  };
}

/**
 * Default cache key generator
 * Uses URL path + query parameters
 */
function defaultKeyGenerator(req: Request): string {
  const queryString = Object.keys(req.query).length > 0
    ? `?${new URLSearchParams(req.query as any).toString()}`
    : '';
  
  return `${req.path}${queryString}`;
}

/**
 * Default caching condition
 * Cache only authenticated requests by default
 */
function defaultCondition(req: Request): boolean {
  // Can add custom logic here
  // For example, only cache for authenticated users
  // return !!req.user;
  
  return true;
}

/**
 * Cache statistics endpoint handler
 */
export async function getCacheStats(req: Request, res: Response) {
  try {
    const stats = await cacheService.getStats();
    const health = await cacheService.healthCheck();

    res.json({
      status: health ? 'healthy' : 'unhealthy',
      stats,
      config: {
        enabled: process.env.REDIS_CACHE_ENABLED !== 'false',
        defaultTTL: process.env.REDIS_CACHE_TTL || '300',
        redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    });
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({ error: 'Failed to get cache stats' });
  }
}
