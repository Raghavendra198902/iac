import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware for request body validation
 */
export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Simple validation - in production use joi or zod
      if (schema.required) {
        for (const field of schema.required) {
          if (!req.body[field]) {
            res.status(400).json({
              error: 'Validation Error',
              message: `Missing required field: ${field}`
            });
            return;
          }
        }
      }
      next();
    } catch (error) {
      res.status(400).json({
        error: 'Validation Error',
        message: error instanceof Error ? error.message : 'Invalid request data'
      });
    }
  };
};
