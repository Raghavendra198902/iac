/**
 * TA (Technical Architect) Routes
 * Aggregates all TA-specific routes
 */

import { Router } from 'express';
import iacRouter from './iac';
import guardrailsRouter from './guardrails';

const router = Router();

// Mount TA sub-routes
router.use('/iac', iacRouter);
router.use('/guardrails', guardrailsRouter);

export default router;
