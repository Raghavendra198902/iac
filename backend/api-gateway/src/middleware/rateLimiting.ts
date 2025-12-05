import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

// Redis client for rate limiting
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected for rate limiting'));

// Initialize Redis connection
redisClient.connect().catch(console.error);

// Default rate limiter - 100 requests per 15 minutes per IP
export const defaultLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:default:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and internal services
    return req.path === '/health' || 
           req.path === '/api/health' ||
           req.headers['x-internal-service'] === 'true';
  }
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 attempts
  message: {
    error: 'Too many login attempts, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful logins
});

// API rate limiter - 1000 requests per hour
export const apiLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  message: {
    error: 'API rate limit exceeded. Please reduce request frequency.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use API key if present, otherwise IP
    return req.headers['x-api-key'] as string || req.ip;
  }
});

// Heavy operation limiter (e.g., AI generation, large queries)
export const heavyOperationLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:heavy:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 heavy operations per minute
  message: {
    error: 'Heavy operation rate limit exceeded. Please wait before retrying.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// File upload limiter
export const uploadLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:upload:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Max 20 uploads per hour
  message: {
    error: 'Upload rate limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// WebSocket connection limiter
export const wsConnectionLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:ws:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 connection attempts per minute
  message: {
    error: 'Too many WebSocket connection attempts. Please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Admin operation limiter
export const adminLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:admin:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 admin operations per minute
  message: {
    error: 'Admin operation rate limit exceeded.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Only apply to admin users
    return !req.user || req.user.role !== 'admin';
  }
});

// Search limiter (prevent abuse of search endpoints)
export const searchLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:search:',
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 searches per minute
  message: {
    error: 'Search rate limit exceeded. Please slow down your requests.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Export rate limiter - prevent mass data extraction
export const exportLimiter = rateLimit({
  store: new RedisStore({
    // @ts-ignore
    client: redisClient,
    prefix: 'rl:export:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 exports per hour
  message: {
    error: 'Export rate limit exceeded. Please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Distributed rate limiter using user ID (for authenticated users)
export const createUserRateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    store: new RedisStore({
      // @ts-ignore
      client: redisClient,
      prefix: 'rl:user:',
    }),
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    }
  });
};

// IP-based rate limiter with dynamic limits
export const createDynamicRateLimiter = (options: {
  windowMs: number;
  maxDefault: number;
  maxTrusted: number;
  prefix: string;
}) => {
  return rateLimit({
    store: new RedisStore({
      // @ts-ignore
      client: redisClient,
      prefix: `rl:${options.prefix}:`,
    }),
    windowMs: options.windowMs,
    max: (req) => {
      // Higher limits for authenticated users
      if (req.user) {
        return options.maxTrusted;
      }
      return options.maxDefault;
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

export default {
  defaultLimiter,
  authLimiter,
  apiLimiter,
  heavyOperationLimiter,
  uploadLimiter,
  wsConnectionLimiter,
  adminLimiter,
  searchLimiter,
  exportLimiter,
  createUserRateLimiter,
  createDynamicRateLimiter,
  redisClient
};
