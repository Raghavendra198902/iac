import { Router } from 'express';
import axios from 'axios';
import { AuthRequest, requireRole } from '../middleware/auth';
import { operationRateLimit } from '../middleware/rateLimit';

const router = Router();
const BLUEPRINT_SERVICE_URL = process.env.BLUEPRINT_SERVICE_URL || 'http://blueprint-service:3001';

// Get all blueprints
router.get('/', async (req: AuthRequest, res) => {
  try {
    const response = await axios.get(`${BLUEPRINT_SERVICE_URL}/api/blueprints`, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch blueprints',
      message: error.message
    });
  }
});

// Get blueprint by ID
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const response = await axios.get(`${BLUEPRINT_SERVICE_URL}/api/blueprints/${req.params.id}`, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch blueprint',
      message: error.message
    });
  }
});

// Create blueprint (EA, SA, TA only)
router.post('/', requireRole('EA', 'SA', 'TA'), operationRateLimit('blueprint_create'), async (req: AuthRequest, res) => {
  try {
    const response = await axios.post(`${BLUEPRINT_SERVICE_URL}/api/blueprints`, req.body, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.status(201).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to create blueprint',
      message: error.message
    });
  }
});

// Update blueprint
router.put('/:id', requireRole('EA', 'SA', 'TA'), async (req: AuthRequest, res) => {
  try {
    const response = await axios.put(`${BLUEPRINT_SERVICE_URL}/api/blueprints/${req.params.id}`, req.body, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to update blueprint',
      message: error.message
    });
  }
});

// Delete blueprint
router.delete('/:id', requireRole('EA', 'SA'), async (req: AuthRequest, res) => {
  try {
    await axios.delete(`${BLUEPRINT_SERVICE_URL}/api/blueprints/${req.params.id}`, {
      headers: { 'X-User-Id': req.user?.id, 'X-Tenant-Id': req.user?.tenantId }
    });
    res.status(204).send();
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: 'Failed to delete blueprint',
      message: error.message
    });
  }
});

export default router;
