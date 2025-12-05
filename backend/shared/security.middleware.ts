import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

/**
 * Security middleware configuration for production environment
 */

// Helmet - Security headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true,
});

// CORS configuration
export const corsConfig = cors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173',
      'http://localhost:3000',
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-User-Id',
    'X-Tenant-Id',
    'X-Request-Id',
    'X-API-Key',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Cache', 'X-RateLimit-Remaining'],
  maxAge: 86400, // 24 hours
});

// Rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: res.getHeader('Retry-After'),
    });
  },
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later.',
});

// NoSQL injection protection
export const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Sanitized potentially malicious input: ${key}`);
  },
});

// HTTP Parameter Pollution protection
export const hppProtection = hpp({
  whitelist: ['sort', 'filter', 'page', 'limit'], // Allow these params to appear multiple times
});

// API Key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];

  if (process.env.REQUIRE_API_KEY === 'true') {
    if (!apiKey || !validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or missing API key',
      });
    }
  }

  next();
};

// Request ID middleware for tracing
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-Id', req.headers['x-request-id'] as string);
  next();
};

// Security audit logging
export const auditLog = (req: Request, res: Response, next: NextFunction) => {
  const sensitiveRoutes = ['/auth', '/api/secrets', '/api/admin'];
  const isSensitive = sensitiveRoutes.some(route => req.path.startsWith(route));

  if (isSensitive) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'SECURITY_AUDIT',
      method: req.method,
      path: req.path,
      ip: req.ip,
      userId: req.headers['x-user-id'],
      tenantId: req.headers['x-tenant-id'],
      userAgent: req.headers['user-agent'],
    }));
  }

  next();
};

// Input validation helper
export const validateInput = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Validation Error',
        details: errors,
      });
    }

    next();
  };
};

// Content-Type validation
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type must be application/json',
      });
    }
  }

  next();
};

// SQL injection prevention helper
export const escapeSql = (input: string): string => {
  if (typeof input !== 'string') return input;
  return input.replace(/['";\\]/g, '\\$&');
};

// XSS prevention helper
export const escapeHtml = (input: string): string => {
  if (typeof input !== 'string') return input;
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return input.replace(/[&<>"'/]/g, (char) => map[char]);
};

// Apply all security middleware
export const applySecurityMiddleware = (app: any) => {
  app.use(requestId);
  app.use(helmetConfig);
  app.use(corsConfig);
  app.use(sanitizeInput);
  app.use(hppProtection);
  app.use(apiLimiter);
  app.use(auditLog);
  app.use(validateContentType);
  
  console.log('✅ Security middleware applied');
};
