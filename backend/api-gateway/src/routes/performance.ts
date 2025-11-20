import { Router, Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import {
  getPerformanceStats,
  getSlowEndpoints,
  resetPerformanceMetrics,
  exportPerformanceData,
} from '../utils/performance';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/performance/stats
 * Get performance statistics
 */
router.get(
  '/stats',
  requireRole('SA', 'TA'),
  async (req: AuthRequest, res: Response) => {
    try {
      const stats = getPerformanceStats();
      
      logger.info('Performance stats requested', {
        user: req.user!.email,
        totalRequests: stats.totalRequests,
      });

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      logger.error('Error fetching performance stats', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch performance statistics',
      });
    }
  }
);

/**
 * GET /api/performance/slow-endpoints
 * Get list of slow endpoints
 */
router.get(
  '/slow-endpoints',
  requireRole('SA', 'TA'),
  async (req: AuthRequest, res: Response) => {
    try {
      const slowEndpoints = getSlowEndpoints();
      
      logger.info('Slow endpoints requested', {
        user: req.user!.email,
        count: slowEndpoints.length,
      });

      res.json({
        success: true,
        data: slowEndpoints,
      });
    } catch (error: any) {
      logger.error('Error fetching slow endpoints', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch slow endpoints',
      });
    }
  }
);

/**
 * POST /api/performance/reset
 * Reset performance metrics
 */
router.post(
  '/reset',
  requireRole('SA'),
  async (req: AuthRequest, res: Response) => {
    try {
      resetPerformanceMetrics();
      
      logger.info('Performance metrics reset', {
        user: req.user!.email,
      });

      res.json({
        success: true,
        message: 'Performance metrics reset successfully',
      });
    } catch (error: any) {
      logger.error('Error resetting performance metrics', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to reset performance metrics',
      });
    }
  }
);

/**
 * GET /api/performance/export
 * Export raw performance data
 */
router.get(
  '/export',
  requireRole('SA', 'TA'),
  async (req: AuthRequest, res: Response) => {
    try {
      const data = exportPerformanceData();
      
      logger.info('Performance data exported', {
        user: req.user!.email,
        recordCount: data.history.length,
      });

      res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      logger.error('Error exporting performance data', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to export performance data',
      });
    }
  }
);

export default router;
