import cors from 'cors';
import { Request } from 'express';

/**
 * Allowed origins based on environment
 */
const getAllowedOrigins = (): string[] => {
  const origins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  
  // Default allowed origins for different environments
  const defaultOrigins = {
    development: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ],
    staging: [
      'https://staging.iac-platform.com',
      'https://staging-app.iac-platform.com'
    ],
    production: [
      'https://iac-platform.com',
      'https://www.iac-platform.com',
      'https://app.iac-platform.com'
    ]
  };

  const env = process.env.NODE_ENV || 'development';
  
  return [
    ...origins,
    ...(defaultOrigins[env as keyof typeof defaultOrigins] || defaultOrigins.development)
  ];
};

/**
 * CORS options with dynamic origin checking
 */
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-CSRF-Token',
    'X-Internal-Service',
    'X-Request-ID'
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
    'X-Request-ID',
    'X-Total-Count'
  ],
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

/**
 * Strict CORS middleware for production
 */
export const strictCorsOptions: cors.CorsOptions = {
  ...corsOptions,
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Don't allow requests with no origin in production
    if (!origin && process.env.NODE_ENV === 'production') {
      return callback(new Error('Origin header required'));
    }

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

/**
 * Permissive CORS for development
 */
export const devCorsOptions: cors.CorsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['*'],
  exposedHeaders: ['*']
};

/**
 * API-specific CORS (for public APIs)
 */
export const apiCorsOptions: cors.CorsOptions = {
  origin: '*', // Allow all origins for public API
  credentials: false,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Accept',
    'X-API-Key',
    'X-Request-ID'
  ],
  maxAge: 86400
};

/**
 * WebSocket CORS configuration
 */
export const wsCorsOptions = {
  origin: getAllowedOrigins(),
  credentials: true
};

/**
 * Get CORS middleware based on environment
 */
export const getCorsMiddleware = () => {
  const env = process.env.NODE_ENV;
  
  if (env === 'development' || env === 'test') {
    console.log('🔓 Using permissive CORS for development');
    return cors(devCorsOptions);
  }
  
  if (env === 'production') {
    console.log('🔒 Using strict CORS for production');
    return cors(strictCorsOptions);
  }
  
  // Default to standard CORS
  console.log('🔐 Using standard CORS');
  return cors(corsOptions);
};

/**
 * CSRF token validation middleware
 */
export const csrfProtection = (req: Request, res: any, next: any) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF for API key authentication
  if (req.headers['x-api-key']) {
    return next();
  }

  // Check CSRF token
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = (req as any).session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'CSRF token validation failed'
    });
  }

  next();
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: any, next: any) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' wss: https:",
    "frame-ancestors 'none'"
  ].join('; ');
  res.setHeader('Content-Security-Policy', csp);
  
  // HSTS (HTTP Strict Transport Security)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

/**
 * Request ID middleware
 */
export const requestId = (req: any, res: any, next: any) => {
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

export default {
  corsOptions,
  strictCorsOptions,
  devCorsOptions,
  apiCorsOptions,
  wsCorsOptions,
  getCorsMiddleware,
  csrfProtection,
  securityHeaders,
  requestId
};
