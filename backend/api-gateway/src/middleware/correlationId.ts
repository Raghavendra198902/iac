import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Add correlation ID to all requests
export const correlationIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Use existing correlation ID or generate new one
  const correlationId = 
    req.headers['x-correlation-id'] as string || 
    req.headers['x-request-id'] as string ||
    uuidv4();

  // Attach to request for use in handlers
  (req as any).correlationId = correlationId;

  // Set response header
  res.setHeader('X-Correlation-Id', correlationId);

  next();
};

// Extract user context from JWT token
export const userContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as any).user;
  
  if (user) {
    // Attach user context for logging
    (req as any).userContext = {
      id: user.id,
      email: user.email,
      role: user.role,
      subscription: user.subscription,
    };
  }

  next();
};
