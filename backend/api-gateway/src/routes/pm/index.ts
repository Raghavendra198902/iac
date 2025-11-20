/**
 * PM (Project Manager) Routes Index
 * Main router that mounts all PM-specific route modules
 */

import { Router } from 'express';
import approvalsRouter from './approvals';
import budgetRouter from './budget';
import migrationsRouter from './migrations';
import kpisRouter from './kpis';

const router = Router();

// Mount sub-routers
router.use('/approvals', approvalsRouter);
router.use('/budget', budgetRouter);
router.use('/migrations', migrationsRouter);
router.use('/kpis', kpisRouter);

export default router;
