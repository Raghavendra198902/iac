import { Request, Response, NextFunction } from 'express';
import { logger, logError, redactSensitiveData } from '../utils/logger';

// Custom error class
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(
    statusCode: number,
    message: string,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;
    
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation error
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', true, details);
  }
}

// Authentication error
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(401, message, 'AUTHENTICATION_ERROR', true);
  }
}

// Authorization error
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, message, 'AUTHORIZATION_ERROR', true);
  }
}

// Not found error
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, `${resource} not found`, 'NOT_FOUND', true);
  }
}

// Conflict error
export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT', true);
  }
}

// Rate limit error
export class RateLimitError extends AppError {
  constructor(message?: string, retryAfter?: number) {
    super(429, message || 'Too many requests', 'RATE_LIMIT_EXCEEDED', true, { retryAfter });
  }
}

// Service unavailable error
export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(503, `${service} is temporarily unavailable`, 'SERVICE_UNAVAILABLE', true);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorCode = 'INTERNAL_ERROR';
  let details: any = undefined;

  // Handle AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    details = err.details;
  } 
  // Handle MongoDB/Mongoose errors
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Validation failed';
  } 
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
    message = 'Authentication token expired';
  }

  // Log the error with context
  const errorContext = {
    statusCode,
    errorCode,
    path: req.path,
    method: req.method,
    correlationId: req.headers['x-correlation-id'],
    userId: (req as any).user?.id,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  if (statusCode >= 500) {
    logError(err, errorContext);
  } else {
    logger.warn('Client error occurred', {
      message: err.message,
      ...errorContext,
    });
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Send error response
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      ...(details && { details: redactSensitiveData(details) }),
      ...(isDevelopment && { stack: err.stack }),
      timestamp: new Date().toISOString(),
      correlationId: req.headers['x-correlation-id'],
    },
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.path}`));
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation middleware wrapper
export const validateRequest = (schema: any, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail: any) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      throw new ValidationError('Validation failed', details);
    }

    req[property] = value;
    next();
  };
};
