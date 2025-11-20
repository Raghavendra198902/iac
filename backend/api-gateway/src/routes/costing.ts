import { Router } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const router = Router();
const COSTING_SERVICE_URL = process.env.COSTING_SERVICE_URL || 'http://costing-service:3004';

// Calculate cost estimate
router.post('/estimate', async (req: AuthRequest, res) => {
  try {
    const response = await axios.post(`${COSTING_SERVICE_URL}/estimate`, req.body, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to calculate cost estimate',
      message: error.message
    });
  }
});

// Get TCO analysis
router.post('/tco', async (req: AuthRequest, res) => {
  try {
    const response = await axios.post(`${COSTING_SERVICE_URL}/tco`, req.body, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to calculate TCO',
      message: error.message
    });
  }
});

export default router;
