import { Router } from 'express';
import AWS from 'aws-sdk';

const router = Router();

// Configure AWS SDK
const configureAWS = (credentials: any) => {
  AWS.config.update({
    accessKeyId: credentials.accessKeyId,
    secretAccessKey: credentials.secretAccessKey,
    region: credentials.region || 'us-east-1'
  });
};

// Get AWS regions
router.get('/regions', async (req, res) => {
  try {
    const ec2 = new AWS.EC2({ region: 'us-east-1' });
    const regions = await ec2.describeRegions().promise();
    
    res.json({
      provider: 'aws',
      regions: regions.Regions?.map(r => ({
        name: r.RegionName,
        endpoint: r.Endpoint
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get EC2 instances
router.post('/instances', async (req, res) => {
  try {
    const { credentials } = req.body;
    configureAWS(credentials);
    
    const ec2 = new AWS.EC2();
    const instances = await ec2.describeInstances().promise();
    
    const instanceList = instances.Reservations?.flatMap(r =>
      r.Instances?.map(i => ({
        id: i.InstanceId,
        type: i.InstanceType,
        state: i.State?.Name,
        availabilityZone: i.Placement?.AvailabilityZone,
        launchTime: i.LaunchTime,
        tags: i.Tags
      }))
    );
    
    res.json({ instances: instanceList });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get S3 buckets
router.post('/buckets', async (req, res) => {
  try {
    const { credentials } = req.body;
    configureAWS(credentials);
    
    const s3 = new AWS.S3();
    const buckets = await s3.listBuckets().promise();
    
    res.json({
      buckets: buckets.Buckets?.map(b => ({
        name: b.Name,
        creationDate: b.CreationDate
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get RDS instances
router.post('/rds', async (req, res) => {
  try {
    const { credentials } = req.body;
    configureAWS(credentials);
    
    const rds = new AWS.RDS();
    const dbInstances = await rds.describeDBInstances().promise();
    
    res.json({
      databases: dbInstances.DBInstances?.map(db => ({
        id: db.DBInstanceIdentifier,
        engine: db.Engine,
        status: db.DBInstanceStatus,
        endpoint: db.Endpoint?.Address
      }))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get cost estimation
router.post('/cost-estimate', async (req, res) => {
  try {
    const { resources } = req.body;
    
    // Simplified cost estimation logic
    const estimates = resources.map((resource: any) => {
      let monthlyCost = 0;
      
      switch (resource.type) {
        case 'ec2':
          monthlyCost = resource.instanceType === 't2.micro' ? 8.50 : 
                       resource.instanceType === 't2.small' ? 17 : 
                       resource.instanceType === 't2.medium' ? 34 : 68;
          break;
        case 's3':
          monthlyCost = (resource.storageGB || 0) * 0.023;
          break;
        case 'rds':
          monthlyCost = resource.instanceClass === 'db.t3.micro' ? 15 :
                       resource.instanceClass === 'db.t3.small' ? 30 : 60;
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
      provider: 'aws',
      estimates,
      totalMonthlyCost: estimates.reduce((sum: number, e: any) => sum + e.monthlyCost, 0)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as awsRouter };
