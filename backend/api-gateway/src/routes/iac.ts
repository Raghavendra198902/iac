import { Router } from 'express';
import axios from 'axios';
import { AuthRequest, requireRole } from '../middleware/auth';

const router = Router();
const IAC_SERVICE_URL = process.env.IAC_SERVICE_URL || 'http://iac-generator:3002';

// Generate IaC from blueprint
router.post('/generate', requireRole('EA', 'SA', 'TA'), async (req: AuthRequest, res) => {
  try {
    const response = await axios.post(`${IAC_SERVICE_URL}/generate`, req.body, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to generate IaC',
      message: error.message
    });
  }
});

// Get IaC generation status
router.get('/status/:jobId', async (req: AuthRequest, res) => {
  try {
    const response = await axios.get(`${IAC_SERVICE_URL}/status/${req.params.jobId}`, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch IaC status',
      message: error.message
    });
  }
});

export default router;
