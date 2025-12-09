import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { CostingService } from './costing-service';
import { PricingEngine } from './pricing-engine';
import { BudgetManager } from './budget-manager';
import { OptimizationEngine } from './optimization-engine';
import { IdleResourceDetector } from './idle-resource-detector';
import {
  CostEstimateRequest,
  ActualCostRequest,
  Budget,
  BudgetAlert
} from './types';
import { createLogger } from '../../../packages/logger/src/index';

const logger = createLogger({ serviceName: 'costing-service' });

config();

const app = express();

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3005;

// Initialize services
const pricingEngine = new PricingEngine();
const costingService = new CostingService(pricingEngine);
const budgetManager = new BudgetManager();
const optimizationEngine = new OptimizationEngine(pricingEngine);
const idleDetector = new IdleResourceDetector();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'costing-service', timestamp: new Date() });
});

// 1. Estimate infrastructure costs (TCO)
app.post('/api/estimates', async (req: Request, res: Response) => {
  try {
    const request: CostEstimateRequest = req.body;
    
    if (!request.blueprintId || !request.targetCloud || !request.region || !request.resources) {
      return res.status(400).json({ error: 'blueprintId, targetCloud, region, and resources are required' });
    }

    const estimate = await costingService.estimateCost(request);
    
    res.status(201).json(estimate);
  } catch (error: any) {
    logger.error('Error creating cost estimate:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Get cost estimate by ID
app.get('/api/estimates/:estimateId', async (req: Request, res: Response) => {
  try {
    const { estimateId } = req.params;
    const estimate = await costingService.getEstimate(estimateId);
    
    if (!estimate) {
      return res.status(404).json({ error: 'Estimate not found' });
    }
    
    res.json(estimate);
  } catch (error: any) {
    logger.error('Error retrieving estimate:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Get actual costs for deployment/blueprint
app.post('/api/costs/actual', async (req: Request, res: Response) => {
  try {
    const request: ActualCostRequest = req.body;
    
    if (!request.startDate || !request.endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const costs = await costingService.getActualCosts(request);
    
    res.json(costs);
  } catch (error: any) {
    logger.error('Error retrieving actual costs:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Create budget
app.post('/api/budgets', async (req: Request, res: Response) => {
  try {
    const budgetData: Omit<Budget, 'budgetId' | 'currentSpend' | 'lastUpdated' | 'status'> = req.body;
    
    if (!budgetData.name || !budgetData.amount || !budgetData.period || !budgetData.currency) {
      return res.status(400).json({ error: 'name, amount, period, and currency are required' });
    }

    const budget = await budgetManager.createBudget(budgetData);
    
    res.status(201).json(budget);
  } catch (error: any) {
    logger.error('Error creating budget:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. List budgets
app.get('/api/budgets', async (req: Request, res: Response) => {
  try {
    const { blueprintId, environment, status } = req.query;
    
    const budgets = await budgetManager.listBudgets({
      blueprintId: blueprintId as string,
      environment: environment as string,
      status: status as any
    });
    
    res.json(budgets);
  } catch (error: any) {
    logger.error('Error listing budgets:', error);
    res.status(500).json({ error: error.message });
  }
});

// 6. Get budget by ID
app.get('/api/budgets/:budgetId', async (req: Request, res: Response) => {
  try {
    const { budgetId } = req.params;
    const budget = await budgetManager.getBudget(budgetId);
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error: any) {
    logger.error('Error retrieving budget:', error);
    res.status(500).json({ error: error.message });
  }
});

// 7. Update budget
app.put('/api/budgets/:budgetId', async (req: Request, res: Response) => {
  try {
    const { budgetId } = req.params;
    const updates = req.body;
    
    const budget = await budgetManager.updateBudget(budgetId, updates);
    
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json(budget);
  } catch (error: any) {
    logger.error('Error updating budget:', error);
    res.status(500).json({ error: error.message });
  }
});

// 8. Delete budget
app.delete('/api/budgets/:budgetId', async (req: Request, res: Response) => {
  try {
    const { budgetId } = req.params;
    await budgetManager.deleteBudget(budgetId);
    
    res.status(204).send();
  } catch (error: any) {
    logger.error('Error deleting budget:', error);
    res.status(500).json({ error: error.message });
  }
});

// 9. Generate optimization report
app.post('/api/optimization/report', async (req: Request, res: Response) => {
  try {
    const { blueprintId, deploymentId } = req.body;
    
    if (!blueprintId && !deploymentId) {
      return res.status(400).json({ error: 'Either blueprintId or deploymentId is required' });
    }

    const report = await optimizationEngine.generateReport(blueprintId, deploymentId);
    
    res.json(report);
  } catch (error: any) {
    logger.error('Error generating optimization report:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10. Get cost recommendations
app.get('/api/optimization/recommendations', async (req: Request, res: Response) => {
  try {
    const { blueprintId, deploymentId, type, minSavings } = req.query;
    
    const recommendations = await optimizationEngine.getRecommendations({
      blueprintId: blueprintId as string,
      deploymentId: deploymentId as string,
      type: type as any,
      minSavings: minSavings ? parseFloat(minSavings as string) : undefined
    });
    
    res.json(recommendations);
  } catch (error: any) {
    logger.error('Error retrieving recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

// 11. Detect idle resources
app.post('/api/idle-resources/detect', async (req: Request, res: Response) => {
  try {
    const { deploymentId, blueprintId, thresholds } = req.body;
    
    if (!deploymentId && !blueprintId) {
      return res.status(400).json({ error: 'Either deploymentId or blueprintId is required' });
    }

    const idleResources = await idleDetector.detectIdleResources(
      deploymentId,
      blueprintId,
      thresholds
    );
    
    res.json({ count: idleResources.length, resources: idleResources });
  } catch (error: any) {
    logger.error('Error detecting idle resources:', error);
    res.status(500).json({ error: error.message });
  }
});

// 12. Get idle resources
app.get('/api/idle-resources', async (req: Request, res: Response) => {
  try {
    const { deploymentId, blueprintId, minCost } = req.query;
    
    const idleResources = await idleDetector.getIdleResources({
      deploymentId: deploymentId as string,
      blueprintId: blueprintId as string,
      minCost: minCost ? parseFloat(minCost as string) : undefined
    });
    
    res.json(idleResources);
  } catch (error: any) {
    logger.error('Error retrieving idle resources:', error);
    res.status(500).json({ error: error.message });
  }
});

// 13. Get cost alerts
app.get('/api/alerts', async (req: Request, res: Response) => {
  try {
    const { blueprintId, deploymentId, type, severity, acknowledged } = req.query;
    
    const alerts = await costingService.getAlerts({
      blueprintId: blueprintId as string,
      deploymentId: deploymentId as string,
      type: type as any,
      severity: severity as any,
      acknowledged: acknowledged === 'true'
    });
    
    res.json(alerts);
  } catch (error: any) {
    logger.error('Error retrieving alerts:', error);
    res.status(500).json({ error: error.message });
  }
});

// 14. Acknowledge alert
app.post('/api/alerts/:alertId/acknowledge', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    await costingService.acknowledgeAlert(alertId);
    
    res.json({ message: 'Alert acknowledged' });
  } catch (error: any) {
    logger.error('Error acknowledging alert:', error);
    res.status(500).json({ error: error.message });
  }
});

// 15. Compare costs (estimate vs actual)
app.post('/api/costs/compare', async (req: Request, res: Response) => {
  try {
    const { estimateId, deploymentId, startDate, endDate } = req.body;
    
    if (!estimateId || !deploymentId || !startDate || !endDate) {
      return res.status(400).json({ error: 'estimateId, deploymentId, startDate, and endDate are required' });
    }

    const comparison = await costingService.compareCosts(estimateId, deploymentId, startDate, endDate);
    
    res.json(comparison);
  } catch (error: any) {
    logger.error('Error comparing costs:', error);
    res.status(500).json({ error: error.message });
  }
});

// 16. Get pricing data
app.get('/api/pricing', async (req: Request, res: Response) => {
  try {
    const { cloud, region, resourceType, sku } = req.query;
    
    if (!cloud || !region || !resourceType) {
      return res.status(400).json({ error: 'cloud, region, and resourceType are required' });
    }

    const pricing = await pricingEngine.getPricing(
      cloud as string,
      region as string,
      resourceType as string,
      sku as string
    );
    
    res.json(pricing);
  } catch (error: any) {
    logger.error('Error retrieving pricing:', error);
    res.status(500).json({ error: error.message });
  }
});

// Graceful shutdown
const server = app.listen(PORT, () => {
  logger.info(`Costing service listening on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
});

export default app;
