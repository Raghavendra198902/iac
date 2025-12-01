import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// In-memory deployment storage
const deployments = new Map<string, any>();
let deploymentCounter = 1;

/**
 * Initiate deployment
 * POST /api/orchestrator/deploy
 */
router.post('/deploy', authenticate, async (req: Request, res: Response) => {
  try {
    const { blueprintId, environment, autoApprove } = req.body;
    
    if (!blueprintId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'blueprintId is required'
      });
    }
    
    const deploymentId = `dep-${Date.now()}-${deploymentCounter++}`;
    
    const deployment = {
      deploymentId,
      id: deploymentId,
      blueprintId,
      environment: environment || 'test',
      status: 'pending',
      autoApprove: autoApprove || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    deployments.set(deploymentId, deployment);
    
    res.json(deployment);
  } catch (error: any) {
    res.status(500).json({
      error: 'Deployment initiation failed',
      message: error.message
    });
  }
});

/**
 * Get deployment status
 * GET /api/orchestrator/deployments/:id
 */
router.get('/deployments/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const deployment = deployments.get(id);
    
    if (!deployment) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Deployment ${id} not found`
      });
    }
    
    res.json(deployment);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve deployment',
      message: error.message
    });
  }
});

export default router;
