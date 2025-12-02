import { Request, Response, NextFunction } from 'express';
import { pool } from '../utils/database';

/**
 * Middleware to attach database pool to request object
 */
export const dbMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  req.db = pool;
  next();
};
