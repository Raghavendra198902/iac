import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { logger } from '../utils/logger';
import {
  PermissionResource,
  PermissionAction,
  PermissionScope,
  UserRole,
  getUserPermissions,
  hasPermission as checkPermission,
} from '../types/permissions';

/**
 * Permission Middleware
 * Enforces granular RBAC on API endpoints
 * 
 * Usage:
 *   router.post('/blueprints', requirePermission('blueprint', 'create', 'project'), handler)
 */
export const requirePermission = (
  resource: PermissionResource,
  action: PermissionAction,
  scope?: PermissionScope
) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
        return;
      }

      // Get user's permissions based on roles
      const userRoles = req.user.roles as UserRole[];
      const userPermissions = getUserPermissions(userRoles);

      // Check if user has the required permission
      const hasAccess = checkPermission(userPermissions, resource, action, scope);

      if (!hasAccess) {
        logger.warn(
          `Permission denied for user ${req.user.email}: ${action} on ${resource} (scope: ${scope || 'any'})`
        );
        
        res.status(403).json({
          error: 'Forbidden',
          message: `Insufficient permissions to ${action} ${resource}`,
          required: {
            resource,
            action,
            scope: scope || 'any',
          },
        });
        return;
      }

      logger.debug(
        `Permission granted for user ${req.user.email}: ${action} on ${resource} (scope: ${scope || 'any'})`
      );

      // Attach permission info to request for downstream use
      req.permission = {
        resource,
        action,
        scope: scope || 'project',
      };

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to verify permissions',
      });
    }
  };
};

/**
 * Check if user has any of the specified roles
 * Simplified role check for backwards compatibility
 */
export const requireAnyRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    const userRoles = req.user.roles as UserRole[];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }

    next();
  };
};

/**
 * Helper to check permissions programmatically within route handlers
 */
export const canPerform = (
  req: AuthRequest,
  resource: PermissionResource,
  action: PermissionAction,
  scope?: PermissionScope
): boolean => {
  if (!req.user) return false;

  const userRoles = req.user.roles as UserRole[];
  const userPermissions = getUserPermissions(userRoles);
  
  return checkPermission(userPermissions, resource, action, scope);
};

// Extend AuthRequest to include permission info
declare module './auth' {
  interface AuthRequest {
    permission?: {
      resource: PermissionResource;
      action: PermissionAction;
      scope: PermissionScope;
    };
  }
}
