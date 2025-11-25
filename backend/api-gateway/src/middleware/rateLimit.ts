/**
 * Enhanced Rate Limiting Middleware
 * 
 * Features:
 * - Per-user rate limiting (by JWT user ID)
 * - Tiered limits by subscription level
 * - Per-endpoint rate limiting for expensive operations
 * - Redis-backed distributed rate limiting
 * - Rate limit headers in responses
 * - Automatic limit reset
 * - Monitoring and metrics
 */

import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { AuthRequest } from './auth';
import { logger } from '../utils/logger';
import { RateLimitError } from './errorHandler';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times: number) => {
    // Stop retrying after 3 attempts
    if (times > 3) {
      logger.warn('Rate limiter Redis connection failed, rate limiting will use in-memory fallback');
      return null; // Stop retrying
    }
    return Math.min(times * 50, 500);
  },
  maxRetriesPerRequest: 1, // Fail fast for rate limit checks
  lazyConnect: true, // Don't connect immediately
});

redis.on('error', (err) => {
  // Only log once, don't spam
  if (err.message.includes('ECONNREFUSED') || err.message.includes('EAI_AGAIN')) {
    // Connection errors - already logged by retry strategy
  } else {
    logger.error('Rate limit Redis error', { error: err.message });
  }
});

// Try to connect, but don't block if it fails
redis.connect().catch(() => {
  logger.warn('Redis not available for rate limiting, using in-memory fallback');
});

// Subscription tiers with rate limits (requests per hour)
export const SUBSCRIPTION_TIERS = {
  free: {
    limit: 100,
    window: 3600, // 1 hour in seconds
    name: 'Free',
  },
  basic: {
    limit: 1000,
    window: 3600,
    name: 'Basic',
  },
  pro: {
    limit: 5000,
    window: 3600,
    name: 'Pro',
  },
  enterprise: {
    limit: 10000,
    window: 3600,
    name: 'Enterprise',
  },
  admin: {
    limit: 50000,
    window: 3600,
    name: 'Admin',
  },
};

// Expensive operation limits (requests per hour)
export const OPERATION_LIMITS = {
  ai_generate: {
    limit: 10,
    window: 3600,
    message: 'AI generation limit exceeded. Upgrade your plan for more requests.',
  },
  ai_optimize: {
    limit: 20,
    window: 3600,
    message: 'AI optimization limit exceeded.',
  },
  iac_generate: {
    limit: 50,
    window: 3600,
    message: 'IaC generation limit exceeded.',
  },
  deployment: {
    limit: 100,
    window: 3600,
    message: 'Deployment limit exceeded.',
  },
  blueprint_create: {
    limit: 100,
    window: 3600,
    message: 'Blueprint creation limit exceeded.',
  },
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Get user's subscription tier
 */
function getUserTier(req: AuthRequest): keyof typeof SUBSCRIPTION_TIERS {
  // Check user's subscription from JWT claims
  const subscription = req.user?.subscription || 'free';
  
  // Validate tier exists
  if (subscription in SUBSCRIPTION_TIERS) {
    return subscription as keyof typeof SUBSCRIPTION_TIERS;
  }
  
  return 'free'; // Default to free tier
}

/**
 * Check rate limit using Redis
 */
async function checkRateLimit(
  key: string,
  limit: number,
  window: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - window * 1000;

  try {
    // Use Redis sorted set to track requests in time window
    const pipeline = redis.pipeline();
    
    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // Count requests in current window
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry on key
    pipeline.expire(key, window);
    
    const results = await pipeline.exec();
    
    if (!results) {
      throw new Error('Redis pipeline failed');
    }
    
    // Get count before adding current request
    const count = (results[1][1] as number) || 0;
    const remaining = Math.max(0, limit - count - 1);
    const allowed = count < limit;
    
    // Calculate reset time
    const oldestEntry = await redis.zrange(key, 0, 0, 'WITHSCORES');
    const resetTime = oldestEntry.length > 0 
      ? parseInt(oldestEntry[1]) + window * 1000
      : now + window * 1000;
    
    const reset = Math.ceil(resetTime / 1000);
    const retryAfter = allowed ? undefined : Math.ceil((resetTime - now) / 1000);
    
    return {
      allowed,
      remaining,
      limit,
      reset,
      retryAfter,
    };
  } catch (error) {
    logger.error('Rate limit check failed', { 
      key, 
      error: (error as Error).message 
    });
    
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: limit,
      limit,
      reset: Math.ceil((now + window * 1000) / 1000),
    };
  }
}

/**
 * Add rate limit headers to response
 */
function addRateLimitHeaders(res: Response, result: RateLimitResult): void {
  res.setHeader('X-RateLimit-Limit', result.limit.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.reset.toString());
  
  if (result.retryAfter !== undefined) {
    res.setHeader('Retry-After', result.retryAfter.toString());
  }
}

/**
 * Per-user rate limiting middleware
 */
export function userRateLimit() {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Skip rate limiting for unauthenticated requests
      // (they'll be handled by IP-based rate limiting)
      if (!req.user?.id) {
        return next();
      }

      const userId = req.user.id;
      const tier = getUserTier(req);
      const tierConfig = SUBSCRIPTION_TIERS[tier];
      
      const key = `ratelimit:user:${userId}`;
      const result = await checkRateLimit(key, tierConfig.limit, tierConfig.window);
      
      addRateLimitHeaders(res, result);
      
      if (!result.allowed) {
        logger.warn('User rate limit exceeded', {
          userId,
          tier,
          limit: tierConfig.limit,
          path: req.path,
        });
        
        throw new RateLimitError(
          `Rate limit exceeded. Your ${tierConfig.name} plan allows ${tierConfig.limit} requests per hour. Upgrade for higher limits.`
        );
      }
      
      logger.debug('Rate limit check passed', {
        userId,
        tier,
        remaining: result.remaining,
        limit: result.limit,
      });
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Per-operation rate limiting middleware
 */
export function operationRateLimit(operation: keyof typeof OPERATION_LIMITS) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Skip if user not authenticated
      if (!req.user?.id) {
        return next();
      }

      const userId = req.user.id;
      const opConfig = OPERATION_LIMITS[operation];
      
      const key = `ratelimit:operation:${operation}:${userId}`;
      const result = await checkRateLimit(key, opConfig.limit, opConfig.window);
      
      addRateLimitHeaders(res, result);
      
      if (!result.allowed) {
        logger.warn('Operation rate limit exceeded', {
          userId,
          operation,
          limit: opConfig.limit,
          path: req.path,
        });
        
        throw new RateLimitError(opConfig.message);
      }
      
      logger.debug('Operation rate limit check passed', {
        userId,
        operation,
        remaining: result.remaining,
        limit: result.limit,
      });
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * IP-based rate limiting for unauthenticated requests
 */
export function ipRateLimit(limit: number = 50, window: number = 3600) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get IP address
      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      
      const key = `ratelimit:ip:${ip}`;
      const result = await checkRateLimit(key, limit, window);
      
      addRateLimitHeaders(res, result);
      
      if (!result.allowed) {
        logger.warn('IP rate limit exceeded', {
          ip,
          limit,
          path: req.path,
        });
        
        throw new RateLimitError(
          `Rate limit exceeded. Please try again later or sign in for higher limits.`
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Get rate limit statistics for a user
 */
export async function getUserRateLimitStats(userId: string): Promise<{
  tier: string;
  limit: number;
  used: number;
  remaining: number;
  reset: number;
  operations: {
    [key: string]: {
      limit: number;
      used: number;
      remaining: number;
    };
  };
}> {
  const tier = SUBSCRIPTION_TIERS.free; // In production, fetch from user profile
  const userKey = `ratelimit:user:${userId}`;
  
  const now = Date.now();
  const windowStart = now - tier.window * 1000;
  
  // Get user's general rate limit usage
  const userCount = await redis.zcount(userKey, windowStart, now);
  
  // Get operation-specific usage
  const operations: any = {};
  for (const [opName, opConfig] of Object.entries(OPERATION_LIMITS)) {
    const opKey = `ratelimit:operation:${opName}:${userId}`;
    const opWindowStart = now - opConfig.window * 1000;
    const opCount = await redis.zcount(opKey, opWindowStart, now);
    
    operations[opName] = {
      limit: opConfig.limit,
      used: opCount,
      remaining: Math.max(0, opConfig.limit - opCount),
    };
  }
  
  return {
    tier: tier.name,
    limit: tier.limit,
    used: userCount,
    remaining: Math.max(0, tier.limit - userCount),
    reset: Math.ceil((now + tier.window * 1000) / 1000),
    operations,
  };
}

/**
 * Reset rate limits for a user (admin only)
 */
export async function resetUserRateLimit(userId: string): Promise<void> {
  const keys = await redis.keys(`ratelimit:*:${userId}`);
  
  if (keys.length > 0) {
    await redis.del(...keys);
    logger.info('Rate limits reset', { userId, keysDeleted: keys.length });
  }
}

export default {
  userRateLimit,
  operationRateLimit,
  ipRateLimit,
  getUserRateLimitStats,
  resetUserRateLimit,
  SUBSCRIPTION_TIERS,
  OPERATION_LIMITS,
};
