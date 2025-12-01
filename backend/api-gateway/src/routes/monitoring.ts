import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Get all deployments
 * GET /api/monitoring/deployments
 */
router.get('/deployments', authenticate, async (req: Request, res: Response) => {
  try {
    // Mock deployment data for testing
    const deployments = [
      {
        id: 'dep-1',
        blueprintId: 'bp-1',
        status: 'completed',
        environment: 'production',
        createdAt: new Date().toISOString(),
        resources: 15,
        cost: 250.50
      }
    ];
    
    res.json({
      deployments,
      total: deployments.length
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve deployments',
      message: error.message
    });
  }
});

export default router;
