import { Router } from 'express';
import { AuthRequest, requireRole } from '../middleware/auth';
import { services } from '../utils/httpService';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Generate IaC from blueprint
router.post('/generate', requireRole('EA', 'SA', 'TA'), asyncHandler(async (req: AuthRequest, res) => {
  const response = await services.iacGenerator.post('/generate', req.body, {
    headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
  });
  res.json(response.data);
}));

// Get IaC generation status
router.get('/status/:jobId', asyncHandler(async (req: AuthRequest, res) => {
  const response = await services.iacGenerator.get(`/status/${req.params.jobId}`, {
    headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
  });
  res.json(response.data);
}));

export default router;
