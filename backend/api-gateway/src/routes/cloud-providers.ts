import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * Get all cloud providers
 * GET /api/cloud-providers
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const providers = [
      {
        id: 'aws',
        name: 'Amazon Web Services',
        regions: ['us-east-1', 'us-west-2', 'eu-west-1'],
        services: ['EC2', 'S3', 'RDS', 'Lambda']
      },
      {
        id: 'azure',
        name: 'Microsoft Azure',
        regions: ['eastus', 'westus', 'westeurope'],
        services: ['VMs', 'Storage', 'SQL', 'Functions']
      },
      {
        id: 'gcp',
        name: 'Google Cloud Platform',
        regions: ['us-central1', 'us-east1', 'europe-west1'],
        services: ['Compute', 'Storage', 'CloudSQL', 'Functions']
      }
    ];
    
    res.json(providers);
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to retrieve cloud providers',
      message: error.message
    });
  }
});

export default router;
