/**
 * Rate Limit Management Routes
 * 
 * API endpoints for monitoring and managing rate limits
 */

import { Router, Request, Response } from 'express';
import { AuthRequest, requireRole } from '../middleware/auth';
import { 
  getUserRateLimitStats, 
  resetUserRateLimit,
  SUBSCRIPTION_TIERS,
  OPERATION_LIMITS 
} from '../middleware/rateLimit';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/rate-limits/me
 * Get current user's rate limit status
 */
router.get(
  '/me',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const stats = await getUserRateLimitStats(req.user.id);

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/rate-limits/config
 * Get rate limit configuration (tiers and operations)
 */
router.get(
  '/config',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        tiers: SUBSCRIPTION_TIERS,
        operations: OPERATION_LIMITS,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/rate-limits/user/:userId
 * Get specific user's rate limit status (admin only)
 */
router.get(
  '/user/:userId',
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const stats = await getUserRateLimitStats(userId);

    res.json({
      success: true,
      data: {
        userId,
        ...stats,
      },
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * DELETE /api/rate-limits/user/:userId
 * Reset user's rate limits (admin only)
 */
router.delete(
  '/user/:userId',
  requireRole('admin'),
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    await resetUserRateLimit(userId);

    res.json({
      success: true,
      message: `Rate limits reset for user ${userId}`,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
