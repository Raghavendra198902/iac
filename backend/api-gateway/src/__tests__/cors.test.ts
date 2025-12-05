import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  corsOptions,
  strictCorsOptions,
  devCorsOptions,
  apiCorsOptions,
  getCorsMiddleware,
  csrfProtection,
  securityHeaders,
  requestId,
} from '../middleware/cors';

describe('CORS Configuration', () => {
  describe('corsOptions', () => {
    it('should have correct origin configuration', () => {
      expect(corsOptions.origin).toBeDefined();
      expect(corsOptions.credentials).toBe(true);
      expect(corsOptions.methods).toContain('GET');
      expect(corsOptions.methods).toContain('POST');
    });

    it('should allow specific headers', () => {
      expect(corsOptions.allowedHeaders).toContain('Content-Type');
      expect(corsOptions.allowedHeaders).toContain('Authorization');
    });

    it('should expose specific headers', () => {
      expect(corsOptions.exposedHeaders).toContain('X-Request-Id');
    });
  });

  describe('strictCorsOptions', () => {
    it('should have more restrictive settings', () => {
      expect(strictCorsOptions.credentials).toBe(true);
      expect(strictCorsOptions.maxAge).toBeDefined();
    });
  });

  describe('devCorsOptions', () => {
    it('should allow all origins in development', () => {
      expect(devCorsOptions.origin).toBe(true);
    });
  });

  describe('apiCorsOptions', () => {
    it('should be configured for API endpoints', () => {
      expect(apiCorsOptions).toBeDefined();
      expect(apiCorsOptions.methods).toBeDefined();
    });
  });

  describe('getCorsMiddleware', () => {
    it('should return appropriate CORS middleware based on environment', () => {
      const middleware = getCorsMiddleware();
      expect(middleware).toBeDefined();
      expect(typeof middleware).toBe('function');
    });
  });
});

describe('CSRF Protection', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      method: 'POST',
      headers: {},
      get: vi.fn(),
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it('should allow safe methods without CSRF token', () => {
    req.method = 'GET';
    csrfProtection(req as Request, res as any, next);
    expect(next).toHaveBeenCalled();
  });

  it('should call next for valid requests', () => {
    req.method = 'OPTIONS';
    csrfProtection(req as Request, res as any, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('Security Headers', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      setHeader: vi.fn(),
      set: vi.fn(),
    };
    next = vi.fn();
  });

  it('should set security headers', () => {
    securityHeaders(req as Request, res as any, next);
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Frame-Options',
      'DENY'
    );
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-XSS-Protection',
      '1; mode=block'
    );
    expect(next).toHaveBeenCalled();
  });

  it('should set HSTS header', () => {
    securityHeaders(req as Request, res as any, next);
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'Strict-Transport-Security',
      expect.stringContaining('max-age')
    );
  });

  it('should set CSP header', () => {
    securityHeaders(req as Request, res as any, next);
    
    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Security-Policy',
      expect.any(String)
    );
  });
});

describe('Request ID Middleware', () => {
  let req: any;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      get: vi.fn(),
    };
    res = {
      setHeader: vi.fn(),
    };
    next = vi.fn();
  });

  it('should generate request ID if not provided', () => {
    requestId(req, res as any, next);
    
    expect(req.id).toBeDefined();
    expect(typeof req.id).toBe('string');
    expect(req.id.length).toBeGreaterThan(0);
  });

  it('should use existing request ID from headers', () => {
    const existingId = 'existing-request-id';
    req.get = vi.fn().mockReturnValue(existingId);
    
    requestId(req, res as any, next);
    
    expect(req.id).toBe(existingId);
  });

  it('should set X-Request-Id header in response', () => {
    requestId(req, res as any, next);
    
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.id);
  });

  it('should call next middleware', () => {
    requestId(req, res as any, next);
    
    expect(next).toHaveBeenCalled();
  });
});
