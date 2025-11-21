import { Router } from 'express';
import { AuthRequest } from '../middleware/auth';
import { services } from '../utils/httpService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Calculate cost estimate
router.post('/estimate', asyncHandler(async (req: AuthRequest, res) => {
  const response = await services.costing.post('/estimate', req.body, {
    headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
  });
  res.json(response.data);
}));

// Get TCO analysis
router.post('/tco', asyncHandler(async (req: AuthRequest, res) => {
  const response = await services.costing.post('/tco', req.body, {
    headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
  });
  res.json(response.data);
}));

export default router;
