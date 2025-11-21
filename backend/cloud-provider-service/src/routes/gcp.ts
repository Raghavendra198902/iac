import { Router } from 'express';

const router = Router();

// Get GCP regions
router.get('/regions', async (req, res) => {
  try {
    res.json({
      provider: 'gcp',
      regions: [
        { name: 'us-central1', displayName: 'Iowa' },
        { name: 'us-east1', displayName: 'South Carolina' },
        { name: 'us-west1', displayName: 'Oregon' },
        { name: 'europe-west1', displayName: 'Belgium' },
        { name: 'europe-west2', displayName: 'London' },
        { name: 'asia-east1', displayName: 'Taiwan' },
        { name: 'asia-southeast1', displayName: 'Singapore' }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get compute instances
router.post('/instances', async (req, res) => {
  try {
    const { projectId, credentials } = req.body;
    
    res.json({
      instances: [
        {
          id: '1234567890',
          name: 'instance-1',
          zone: 'us-central1-a',
          machineType: 'n1-standard-1',
          status: 'RUNNING'
        }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get cloud storage buckets
router.post('/buckets', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    res.json({
      buckets: [
        {
          name: 'my-gcs-bucket',
          location: 'US',
          storageClass: 'STANDARD',
          creationTime: new Date()
        }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Cloud SQL instances
router.post('/sql', async (req, res) => {
  try {
    const { projectId } = req.body;
    
    res.json({
      instances: [
        {
          name: 'production-db',
          region: 'us-central1',
          databaseVersion: 'POSTGRES_14',
          state: 'RUNNABLE'
        }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get cost estimation
router.post('/cost-estimate', async (req, res) => {
  try {
    const { resources } = req.body;
    
    const estimates = resources.map((resource: any) => {
      let monthlyCost = 0;
      
      switch (resource.type) {
        case 'compute':
          monthlyCost = resource.machineType === 'f1-micro' ? 5 :
                       resource.machineType === 'n1-standard-1' ? 25 : 50;
          break;
        case 'storage':
          monthlyCost = (resource.storageGB || 0) * 0.020;
          break;
        case 'sql':
          monthlyCost = resource.tier === 'db-f1-micro' ? 7 :
                       resource.tier === 'db-n1-standard-1' ? 50 : 100;
          break;
      }
      
      return {
        resourceId: resource.id,
        type: resource.type,
        monthlyCost,
        currency: 'USD'
      };
    });
    
    res.json({
      provider: 'gcp',
      estimates,
      totalMonthlyCost: estimates.reduce((sum: number, e: any) => sum + e.monthlyCost, 0)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as gcpRouter };
