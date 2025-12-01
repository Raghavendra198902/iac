import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roles: string[];
    tenantId: string;
    teamId?: string;
    projectIds?: string[];
    subscription?: 'free' | 'basic' | 'pro' | 'enterprise' | 'admin';
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip auth for public endpoints
    const publicPaths = ['/health', '/auth/login', '/auth/refresh', '/auth/sso', '/ai/generate', '/ai/optimize', '/ai/validate', '/downloads', '/telemetry', '/agents/heartbeat'];
    if (publicPaths.some(path => req.path.startsWith(path))) {
      return next();
    }

    // Allow CMDB agent endpoints with API key authentication
    if (req.path.startsWith('/cmdb')) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const apiKey = authHeader.substring(7);
        // For development, accept any API key. In production, validate against stored keys
        if (apiKey) {
          req.user = {
            id: 'agent-system',
            email: 'agent@system',
            roles: ['agent'],
            tenantId: 'default-tenant'
          };
          return next();
        }
      }
    }

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Require JWT_SECRET - no fallback for security
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      logger.error('JWT_SECRET environment variable is not configured');
      res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Authentication not properly configured'
      });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      roles: decoded.roles || [],
      tenantId: decoded.tenantId
    };

    logger.debug(`Authenticated user: ${req.user.email}`);
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const hasRole = allowedRoles.some(role => req.user!.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      });
      return;
    }

    next();
  };
};

// Flexible authorization that accepts both array and spread args
export const authorize = (roles: string | string[]) => {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return requireRole(...rolesArray);
};

// Export aliases for backward compatibility
export const authenticate = authMiddleware;
