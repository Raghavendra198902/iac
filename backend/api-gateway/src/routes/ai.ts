import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:3008';

// Generate blueprint from natural language
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userInput, targetCloud, environment, budget, region, constraints } = req.body;

    if (!userInput || !userInput.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userInput is required'
      });
    }

    // For now, return mock data since AI engine might not be fully implemented
    // In production, this would call the AI engine service
    const mockBlueprint = {
      blueprintId: `bp-${Date.now()}`,
      name: extractBlueprintName(userInput),
      description: userInput,
      targetCloud: targetCloud || detectCloudProvider(userInput),
      environment: environment || detectEnvironment(userInput),
      resources: generateMockResources(userInput, targetCloud),
      estimatedCost: 0,
      confidence: 0.85,
      createdAt: new Date().toISOString()
    };

    // Calculate total cost
    mockBlueprint.estimatedCost = mockBlueprint.resources.reduce(
      (sum, r) => sum + (r.estimatedCost || 0), 
      0
    );

    res.json(mockBlueprint);
  } catch (error: any) {
    console.error('Error generating blueprint:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to generate blueprint'
    });
  }
});

// Get optimization suggestions
router.get('/optimize/:blueprintId', async (req: Request, res: Response) => {
  try {
    const { blueprintId } = req.params;

    const suggestions = [
      {
        type: 'cost' as const,
        title: 'Use Reserved Instances',
        description: 'Commit to 1-year reserved instances for 30% cost savings',
        impact: 'high' as const,
        estimatedSavings: 450
      },
      {
        type: 'security' as const,
        title: 'Enable Encryption at Rest',
        description: 'Add encryption for all storage resources',
        impact: 'high' as const
      },
      {
        type: 'performance' as const,
        title: 'Add CDN',
        description: 'Use CDN for static content delivery',
        impact: 'medium' as const
      }
    ];

    res.json({ suggestions });
  } catch (error: any) {
    console.error('Error getting optimization suggestions:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to get suggestions'
    });
  }
});

// Validate blueprint
router.post('/validate/:blueprintId', async (req: Request, res: Response) => {
  try {
    const { blueprintId } = req.params;

    const validation = {
      valid: true,
      errors: [],
      warnings: [
        'Consider adding backup retention policy',
        'Review security group rules'
      ]
    };

    res.json(validation);
  } catch (error: any) {
    console.error('Error validating blueprint:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'Failed to validate blueprint'
    });
  }
});

// Helper functions
function extractBlueprintName(userInput: string): string {
  const words = userInput.split(' ').slice(0, 5).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1).slice(0, 50);
}

function detectCloudProvider(userInput: string): string {
  const input = userInput.toLowerCase();
  if (input.includes('azure')) return 'azure';
  if (input.includes('aws')) return 'aws';
  if (input.includes('gcp') || input.includes('google cloud')) return 'gcp';
  return 'aws'; // default
}

function detectEnvironment(userInput: string): string {
  const input = userInput.toLowerCase();
  if (input.includes('production') || input.includes('prod')) return 'production';
  if (input.includes('staging')) return 'staging';
  if (input.includes('dev') || input.includes('development')) return 'development';
  return 'production'; // default
}

function generateMockResources(userInput: string, targetCloud?: string): any[] {
  const input = userInput.toLowerCase();
  const cloud = targetCloud || detectCloudProvider(userInput);
  const resources: any[] = [];

  // Detect resource types from input
  if (input.includes('web') || input.includes('application') || input.includes('app')) {
    if (cloud === 'azure') {
      resources.push({
        type: 'Microsoft.Compute/virtualMachines',
        name: 'web-server',
        sku: 'Standard_B2s',
        quantity: 2,
        estimatedCost: 60.8,
        confidence: 0.9,
        reasoning: 'Web application requires compute instances'
      });
    } else if (cloud === 'aws') {
      resources.push({
        type: 'AWS::EC2::Instance',
        name: 'web-server',
        sku: 't3.medium',
        quantity: 2,
        estimatedCost: 66.88,
        confidence: 0.9,
        reasoning: 'Web application requires EC2 instances'
      });
    } else {
      resources.push({
        type: 'compute.v1.instance',
        name: 'web-server',
        sku: 'n1-standard-2',
        quantity: 2,
        estimatedCost: 97.12,
        confidence: 0.9,
        reasoning: 'Web application requires compute instances'
      });
    }
  }

  // Database
  if (input.includes('database') || input.includes('postgres') || input.includes('mysql') || input.includes('db')) {
    if (cloud === 'azure') {
      resources.push({
        type: 'Microsoft.DBforPostgreSQL/servers',
        name: 'primary-database',
        sku: 'GP_Gen5_2',
        quantity: 1,
        estimatedCost: 139.06,
        confidence: 0.95,
        reasoning: 'Database required for data persistence'
      });
    } else if (cloud === 'aws') {
      resources.push({
        type: 'AWS::RDS::DBInstance',
        name: 'primary-database',
        sku: 'db.t3.medium',
        quantity: 1,
        estimatedCost: 122.47,
        confidence: 0.95,
        reasoning: 'RDS instance for database workload'
      });
    }
  }

  // Load Balancer
  if (input.includes('load balancer') || input.includes('lb') || input.includes('scalable')) {
    if (cloud === 'azure') {
      resources.push({
        type: 'Microsoft.Network/loadBalancers',
        name: 'app-load-balancer',
        sku: 'Standard',
        quantity: 1,
        estimatedCost: 21.9,
        confidence: 0.85,
        reasoning: 'Load balancer for traffic distribution'
      });
    } else if (cloud === 'aws') {
      resources.push({
        type: 'AWS::ElasticLoadBalancingV2::LoadBalancer',
        name: 'app-load-balancer',
        sku: 'application',
        quantity: 1,
        estimatedCost: 22.77,
        confidence: 0.85,
        reasoning: 'Application Load Balancer for high availability'
      });
    }
  }

  // Storage
  if (input.includes('storage') || input.includes('bucket') || input.includes('blob')) {
    if (cloud === 'azure') {
      resources.push({
        type: 'Microsoft.Storage/storageAccounts',
        name: 'app-storage',
        sku: 'Standard_LRS',
        quantity: 1,
        estimatedCost: 21.0,
        confidence: 0.8,
        reasoning: 'Storage account for application data'
      });
    } else if (cloud === 'aws') {
      resources.push({
        type: 'AWS::S3::Bucket',
        name: 'app-storage',
        sku: 'Standard',
        quantity: 1,
        estimatedCost: 23.0,
        confidence: 0.8,
        reasoning: 'S3 bucket for object storage'
      });
    }
  }

  // Kubernetes
  if (input.includes('kubernetes') || input.includes('k8s') || input.includes('container')) {
    if (cloud === 'azure') {
      resources.push({
        type: 'Microsoft.ContainerService/managedClusters',
        name: 'aks-cluster',
        sku: 'Standard_D2s_v3',
        quantity: 3,
        estimatedCost: 219.0,
        confidence: 0.9,
        reasoning: 'AKS cluster for container orchestration'
      });
    } else if (cloud === 'aws') {
      resources.push({
        type: 'AWS::EKS::Cluster',
        name: 'eks-cluster',
        sku: 't3.medium',
        quantity: 3,
        estimatedCost: 173.0,
        confidence: 0.9,
        reasoning: 'EKS cluster for Kubernetes workload'
      });
    }
  }

  // Redis cache
  if (input.includes('redis') || input.includes('cache') || input.includes('caching')) {
    if (cloud === 'azure') {
      resources.push({
        type: 'Microsoft.Cache/Redis',
        name: 'redis-cache',
        sku: 'Basic_C1',
        quantity: 1,
        estimatedCost: 45.62,
        confidence: 0.85,
        reasoning: 'Redis cache for improved performance'
      });
    } else if (cloud === 'aws') {
      resources.push({
        type: 'AWS::ElastiCache::CacheCluster',
        name: 'redis-cache',
        sku: 'cache.t3.micro',
        quantity: 1,
        estimatedCost: 12.41,
        confidence: 0.85,
        reasoning: 'ElastiCache for Redis caching layer'
      });
    }
  }

  // If no specific resources detected, add default web app setup
  if (resources.length === 0) {
    resources.push({
      type: cloud === 'azure' ? 'Microsoft.Compute/virtualMachines' : 'AWS::EC2::Instance',
      name: 'app-server',
      sku: cloud === 'azure' ? 'Standard_B2s' : 't3.medium',
      quantity: 1,
      estimatedCost: cloud === 'azure' ? 30.4 : 33.44,
      confidence: 0.7,
      reasoning: 'General purpose compute instance'
    });
  }

  return resources;
}

export default router;
