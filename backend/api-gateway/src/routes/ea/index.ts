/**
 * EA (Enterprise Architect) Routes
 * Aggregates all EA-specific routes
 */

import { Router } from 'express';
import policiesRouter from './policies';
import patternsRouter from './patterns';
import complianceRouter from './compliance';
import costOptimizationRouter from './cost-optimization';

const router = Router();

// Mount EA sub-routes
router.use('/policies', policiesRouter);
router.use('/patterns', patternsRouter);
router.use('/compliance', complianceRouter);
router.use('/cost-optimization', costOptimizationRouter);

export default router;
