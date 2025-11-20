import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { requirePermission, requireAnyRole, canPerform } from '../permissions';
import { AuthRequest } from '../auth';
import { UserRole } from '../../types/permissions';

describe('Permission Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: undefined,
      permission: undefined,
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  describe('requirePermission', () => {
    it('should deny access when user is not authenticated', () => {
      const middleware = requirePermission('blueprint', 'create');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should grant access when EA user has governance permissions', () => {
      mockReq.user = {
        id: 'user-1',
        email: 'ea@demo.com',
        roles: ['EA'],
        tenantId: 'tenant-1',
      };

      const middleware = requirePermission('policy', 'create', 'tenant');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.permission).toEqual({
        resource: 'policy',
        action: 'create',
        scope: 'tenant',
      });
    });

    it('should deny access when SA tries to create policies', () => {
      mockReq.user = {
        id: 'user-2',
        email: 'sa@demo.com',
        roles: ['SA'],
        tenantId: 'tenant-1',
      };

      const middleware = requirePermission('policy', 'create', 'tenant');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Forbidden',
          message: 'Insufficient permissions to create policy',
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should grant access when PM approves deployments', () => {
      mockReq.user = {
        id: 'user-3',
        email: 'pm@demo.com',
        roles: ['PM'],
        tenantId: 'tenant-1',
      };

      const middleware = requirePermission('deployment', 'approve', 'project');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should grant access when SE executes deployments', () => {
      mockReq.user = {
        id: 'user-4',
        email: 'se@demo.com',
        roles: ['SE'],
        tenantId: 'tenant-1',
      };

      const middleware = requirePermission('deployment', 'execute', 'project');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should grant access when Admin has manage permission', () => {
      mockReq.user = {
        id: 'admin-1',
        email: 'admin@demo.com',
        roles: ['Admin'],
        tenantId: 'tenant-1',
      };

      const middleware = requirePermission('blueprint', 'create', 'tenant');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle users with multiple roles', () => {
      mockReq.user = {
        id: 'user-5',
        email: 'multi@demo.com',
        roles: ['SA', 'TA'],
        tenantId: 'tenant-1',
      };

      const middleware = requirePermission('iac', 'create', 'project');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAnyRole', () => {
    it('should grant access when user has one of the allowed roles', () => {
      mockReq.user = {
        id: 'user-1',
        email: 'ea@demo.com',
        roles: ['EA'],
        tenantId: 'tenant-1',
      };

      const middleware = requireAnyRole('EA', 'SA', 'TA');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should deny access when user does not have any allowed role', () => {
      mockReq.user = {
        id: 'user-2',
        email: 'consultant@demo.com',
        roles: ['Consultant'],
        tenantId: 'tenant-1',
      };

      const middleware = requireAnyRole('EA', 'SA', 'TA');
      middleware(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('canPerform', () => {
    it('should return true when user has permission', () => {
      mockReq.user = {
        id: 'user-1',
        email: 'pm@demo.com',
        roles: ['PM'],
        tenantId: 'tenant-1',
      };

      const result = canPerform(
        mockReq as AuthRequest,
        'deployment',
        'approve',
        'project'
      );

      expect(result).toBe(true);
    });

    it('should return false when user does not have permission', () => {
      mockReq.user = {
        id: 'user-2',
        email: 'consultant@demo.com',
        roles: ['Consultant'],
        tenantId: 'tenant-1',
      };

      const result = canPerform(
        mockReq as AuthRequest,
        'deployment',
        'execute',
        'project'
      );

      expect(result).toBe(false);
    });

    it('should return false when user is not authenticated', () => {
      const result = canPerform(
        mockReq as AuthRequest,
        'deployment',
        'execute',
        'project'
      );

      expect(result).toBe(false);
    });
  });
});
