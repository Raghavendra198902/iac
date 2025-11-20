/**
 * SE (Software Engineer) Routes Index
 * Main router that mounts all SE-specific route modules
 */

import { Router } from 'express';
import deploymentsRouter from './deployments';
import deploymentLogsRouter from './deployment-logs';
import incidentsRouter from './incidents';
import healthRouter from './health';

const router = Router();

// Mount sub-routers
router.use('/deployments', deploymentsRouter);
router.use('/deployment-logs', deploymentLogsRouter);
router.use('/incidents', incidentsRouter);
router.use('/health', healthRouter);

export default router;
