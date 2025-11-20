/**
 * SA (Solutions Architect) Routes
 * Aggregates all SA-specific routes
 */

import { Router } from 'express';
import blueprintsRouter from './blueprints';
import aiRecommendationsRouter from './ai-recommendations';

const router = Router();

// Mount SA sub-routes
router.use('/blueprints', blueprintsRouter);
router.use('/ai-recommendations', aiRecommendationsRouter);

export default router;
