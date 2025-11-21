/**
 * Circuit Breaker Routes
 * 
 * API endpoints for monitoring and managing circuit breakers
 */

import { Router, Request, Response } from 'express';
import {
  getAllCircuitBreakerStats,
  getCircuitBreakerStats,
  resetCircuitBreaker,
} from '../utils/circuitBreaker';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/circuit-breakers
 * Get all circuit breaker statistics
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const stats = getAllCircuitBreakerStats();

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      circuitBreakers: stats,
      summary: {
        total: stats.length,
        open: stats.filter((s) => s.state === 'open').length,
        halfOpen: stats.filter((s) => s.state === 'half-open').length,
        closed: stats.filter((s) => s.state === 'closed').length,
      },
    });
  })
);

/**
 * GET /api/circuit-breakers/:name
 * Get specific circuit breaker statistics
 */
router.get(
  '/:name',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    const stats = getCircuitBreakerStats(name);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: `Circuit breaker '${name}' not found`,
      });
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      circuitBreaker: stats,
    });
  })
);

/**
 * POST /api/circuit-breakers/:name/reset
 * Manually reset a circuit breaker
 */
router.post(
  '/:name/reset',
  asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;
    const success = resetCircuitBreaker(name);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: `Circuit breaker '${name}' not found`,
      });
    }

    res.json({
      success: true,
      message: `Circuit breaker '${name}' has been reset`,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
