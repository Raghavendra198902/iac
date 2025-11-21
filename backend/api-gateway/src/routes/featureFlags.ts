/**
 * Feature Flags API Routes
 * 
 * Endpoints for managing and querying feature flags
 */

import { Router, Request, Response } from 'express';
import {
  getAllFeatureFlags,
  getFeatureFlag,
  setFeatureFlag,
  deleteFeatureFlag,
  evaluateFeatureFlag,
  getFlagHistory,
  FlagEvaluationContext,
} from '../utils/featureFlags';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/feature-flags
 * Get all feature flags
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const flags = getAllFeatureFlags();
    res.json({
      success: true,
      count: flags.length,
      flags,
    });
  } catch (error: any) {
    logger.error('Error fetching feature flags', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flags',
    });
  }
});

/**
 * GET /api/feature-flags/:name
 * Get a specific feature flag
 */
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const flag = getFeatureFlag(name);

    if (!flag) {
      return res.status(404).json({
        success: false,
        error: 'Feature flag not found',
      });
    }

    res.json({
      success: true,
      flag,
    });
  } catch (error: any) {
    logger.error('Error fetching feature flag', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feature flag',
    });
  }
});

/**
 * POST /api/feature-flags/:name/evaluate
 * Evaluate a feature flag for current user
 */
router.post('/:name/evaluate', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const user = (req as any).user;

    const context: FlagEvaluationContext = {
      userId: user?.id,
      email: user?.email,
      subscription: user?.subscription,
      environment: process.env.NODE_ENV,
    };

    const evaluation = evaluateFeatureFlag(name, context);

    res.json({
      success: true,
      flagName: name,
      ...evaluation,
    });
  } catch (error: any) {
    logger.error('Error evaluating feature flag', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate feature flag',
    });
  }
});

/**
 * PUT /api/feature-flags/:name
 * Create or update a feature flag (admin only)
 */
router.put('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const flagData = req.body;
    const user = (req as any).user;

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const flag = await setFeatureFlag(name, flagData, user.email || user.id);

    res.json({
      success: true,
      message: 'Feature flag updated',
      flag,
    });
  } catch (error: any) {
    logger.error('Error updating feature flag', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to update feature flag',
    });
  }
});

/**
 * DELETE /api/feature-flags/:name
 * Delete a feature flag (admin only)
 */
router.delete('/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const user = (req as any).user;

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    await deleteFeatureFlag(name);

    res.json({
      success: true,
      message: 'Feature flag deleted',
    });
  } catch (error: any) {
    logger.error('Error deleting feature flag', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to delete feature flag',
    });
  }
});

/**
 * GET /api/feature-flags/:name/history
 * Get flag change history (admin only)
 */
router.get('/:name/history', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const user = (req as any).user;

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required',
      });
    }

    const history = await getFlagHistory(name);

    res.json({
      success: true,
      flagName: name,
      count: history.length,
      history,
    });
  } catch (error: any) {
    logger.error('Error fetching flag history', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch flag history',
    });
  }
});

/**
 * POST /api/feature-flags/bulk-evaluate
 * Evaluate multiple flags at once
 */
router.post('/bulk-evaluate', async (req: Request, res: Response) => {
  try {
    const { flags: flagNames } = req.body;
    const user = (req as any).user;

    if (!Array.isArray(flagNames)) {
      return res.status(400).json({
        success: false,
        error: 'flags must be an array of flag names',
      });
    }

    const context: FlagEvaluationContext = {
      userId: user?.id,
      email: user?.email,
      subscription: user?.subscription,
      environment: process.env.NODE_ENV,
    };

    const evaluations: Record<string, any> = {};
    for (const flagName of flagNames) {
      evaluations[flagName] = evaluateFeatureFlag(flagName, context);
    }

    res.json({
      success: true,
      count: Object.keys(evaluations).length,
      evaluations,
    });
  } catch (error: any) {
    logger.error('Error bulk evaluating flags', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to evaluate flags',
    });
  }
});

export default router;
