import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServiceUnavailableError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
} from '../errorHandler';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with message and statusCode', () => {
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test', 500);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      const error = new AuthenticationError('Not authenticated');
      expect(error.message).toBe('Not authenticated');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error with 403 status', () => {
      const error = new AuthorizationError('No permission');
      expect(error.message).toBe('No permission');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with 404 status', () => {
      const error = new NotFoundError('Resource not found');
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with 409 status', () => {
      const error = new ConflictError('Resource exists');
      expect(error.message).toBe('Resource exists');
      expect(error.statusCode).toBe(409);
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with 429 status', () => {
      const error = new RateLimitError('Too many requests');
      expect(error.message).toBe('Too many requests');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should create service unavailable error with 503 status', () => {
      const error = new ServiceUnavailableError('Service down');
      expect(error.message).toBe('Service down');
      expect(error.statusCode).toBe(503);
    });
  });
});

describe('errorHandler Middleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1',
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it('should handle AppError with correct status and message', () => {
    const error = new AppError('Test error', 400);
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Test error',
        statusCode: 400,
      })
    );
  });

  it('should handle ValidationError', () => {
    const error = new ValidationError('Validation failed');
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation failed',
      })
    );
  });

  it('should handle generic Error as 500', () => {
    const error = new Error('Generic error');
    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal Server Error',
        statusCode: 500,
      })
    );
  });

  it('should include stack trace in development', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Dev error');
    errorHandler(error, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        stack: expect.any(String),
      })
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('should not include stack trace in production', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Prod error');
    errorHandler(error, req, res, next);

    const jsonCall = res.json.mock.calls[0][0];
    expect(jsonCall.stack).toBeUndefined();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('notFoundHandler Middleware', () => {
  it('should throw NotFoundError for non-existent routes', () => {
    const req: any = { path: '/non-existent' };
    const res: any = {};
    const next: any = vi.fn();

    notFoundHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
  });
});

describe('asyncHandler Middleware', () => {
  it('should call next with error when async function throws', async () => {
    const error = new Error('Async error');
    const asyncFn = vi.fn().mockRejectedValue(error);
    const handler = asyncHandler(asyncFn);

    const req: any = {};
    const res: any = {};
    const next: any = vi.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should not call next when async function succeeds', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const handler = asyncHandler(asyncFn);

    const req: any = {};
    const res: any = {};
    const next: any = vi.fn();

    await handler(req, res, next);

    expect(next).not.toHaveBeenCalled();
  });

  it('should pass req, res, next to async function', async () => {
    const asyncFn = vi.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(asyncFn);

    const req: any = { test: 'req' };
    const res: any = { test: 'res' };
    const next: any = vi.fn();

    await handler(req, res, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
  });
});
