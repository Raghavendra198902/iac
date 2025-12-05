import { describe, it, expect } from 'vitest';

// Utility test helpers
export const createMockRequest = (overrides: any = {}) => ({
  method: 'GET',
  path: '/',
  headers: {},
  body: {},
  query: {},
  params: {},
  ...overrides,
});

export const createMockResponse = () => {
  const res: any = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  };
  return res;
};

export const createMockNext = () => vi.fn();

describe('Test Utilities', () => {
  describe('createMockRequest', () => {
    it('should create mock request with defaults', () => {
      const req = createMockRequest();
      expect(req.method).toBe('GET');
      expect(req.path).toBe('/');
      expect(req.headers).toEqual({});
    });

    it('should allow overriding defaults', () => {
      const req = createMockRequest({ method: 'POST', path: '/api/test' });
      expect(req.method).toBe('POST');
      expect(req.path).toBe('/api/test');
    });
  });

  describe('createMockResponse', () => {
    it('should create mock response with chainable methods', () => {
      const res = createMockResponse();
      const result = res.status(200).json({ success: true });
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
      expect(result).toBe(res);
    });
  });

  describe('createMockNext', () => {
    it('should create mock next function', () => {
      const next = createMockNext();
      expect(typeof next).toBe('function');
      
      const error = new Error('test');
      next(error);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});

// Export utilities
export { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
