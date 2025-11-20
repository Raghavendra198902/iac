import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

// JWT secret must be set in environment variables
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
    username: string;
  };
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (req as any).user = {
        id: decoded.id,
        tenantId: decoded.tenantId,
        role: decoded.role,
        username: decoded.username,
      };
      next();
    } catch (error) {
      logger.error('JWT verification failed', { error });
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error: any) {
    logger.error('Auth middleware error', { error: error.message });
    return res.status(500).json({ error: 'Internal server error' });
  }
};
