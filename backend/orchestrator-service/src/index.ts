import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';
import { DeploymentOrchestrator } from './orchestrator';
import { StateManager } from './state-manager';
import { DeploymentRequest, RollbackRequest } from './types';

const app = express();
const PORT = process.env.PORT || 3004;

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

app.use(express.json({ limit: '10mb' }));

const orchestrator = new DeploymentOrchestrator();
const stateManager = new StateManager();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'orchestrator-service' });
});

// Start deployment
app.post('/api/deployments', async (req: Request, res: Response) => {
  try {
    const request: DeploymentRequest = req.body;

    if (!request.blueprintId || !request.generationJobId) {
      return res.status(400).json({ 
        error: 'blueprintId and generationJobId are required' 
      });
    }

    const validEnvironments = ['dev', 'staging', 'production'];
    if (!validEnvironments.includes(request.environment)) {
      return res.status(400).json({ 
        error: 'Invalid environment. Must be: dev, staging, or production' 
      });
    }

    logger.info('Starting deployment', { 
      blueprintId: request.blueprintId,
      environment: request.environment,
      targetCloud: request.targetCloud
    });

    const deployment = await orchestrator.startDeployment(request);

    res.status(202).json({
      deploymentId: deployment.id,
      status: deployment.status,
      message: 'Deployment started'
    });
  } catch (error: any) {
    logger.error('Failed to start deployment', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deployment status
app.get('/api/deployments/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deployment = await orchestrator.getDeployment(id);

    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json(deployment);
  } catch (error: any) {
    logger.error('Failed to get deployment', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List deployments
app.get('/api/deployments', async (req: Request, res: Response) => {
  try {
    const { blueprintId, environment, status, limit = '10' } = req.query;

    const deployments = await orchestrator.listDeployments({
      blueprintId: blueprintId as string,
      environment: environment as string,
      status: status as string,
      limit: parseInt(limit as string)
    });

    res.json({ deployments, count: deployments.length });
  } catch (error: any) {
    logger.error('Failed to list deployments', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deployment logs
app.get('/api/deployments/:id/logs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const logs = await orchestrator.getDeploymentLogs(id);

    if (!logs) {
      return res.status(404).json({ error: 'Deployment not found' });
    }

    res.json({ deploymentId: id, logs });
  } catch (error: any) {
    logger.error('Failed to get logs', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel deployment
app.post('/api/deployments/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    logger.info('Cancelling deployment', { deploymentId: id });

    const success = await orchestrator.cancelDeployment(id);

    if (!success) {
      return res.status(404).json({ error: 'Deployment not found or cannot be cancelled' });
    }

    res.json({ deploymentId: id, status: 'cancelled' });
  } catch (error: any) {
    logger.error('Failed to cancel deployment', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Rollback deployment
app.post('/api/deployments/:id/rollback', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rollbackReq: RollbackRequest = {
      deploymentId: id,
      ...req.body
    };

    if (!rollbackReq.reason) {
      return res.status(400).json({ error: 'reason is required' });
    }

    logger.info('Rolling back deployment', { 
      deploymentId: id,
      reason: rollbackReq.reason 
    });

    const rollback = await orchestrator.rollback(rollbackReq);

    res.json({
      deploymentId: id,
      rollbackDeploymentId: rollback.id,
      status: rollback.status
    });
  } catch (error: any) {
    logger.error('Failed to rollback deployment', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get deployment state
app.get('/api/deployments/:id/state', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const state = await stateManager.getState(id);

    if (!state) {
      return res.status(404).json({ error: 'State not found' });
    }

    res.json(state);
  } catch (error: any) {
    logger.error('Failed to get state', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lock state
app.post('/api/deployments/:id/state/lock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { operation, who } = req.body;

    if (!operation || !who) {
      return res.status(400).json({ error: 'operation and who are required' });
    }

    const lockId = await stateManager.lockState(id, operation, who);

    res.json({ deploymentId: id, lockId, locked: true });
  } catch (error: any) {
    logger.error('Failed to lock state', { error: error.message });
    res.status(409).json({ error: 'State is already locked' });
  }
});

// Unlock state
app.post('/api/deployments/:id/state/unlock', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { lockId } = req.body;

    if (!lockId) {
      return res.status(400).json({ error: 'lockId is required' });
    }

    await stateManager.unlockState(id, lockId);

    res.json({ deploymentId: id, locked: false });
  } catch (error: any) {
    logger.error('Failed to unlock state', { error: error.message });
    res.status(400).json({ error: error.message });
  }
});

// Get state history
app.get('/api/deployments/:id/state/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '10' } = req.query;

    const history = await stateManager.getStateHistory(id, parseInt(limit as string));

    res.json({ deploymentId: id, history, count: history.length });
  } catch (error: any) {
    logger.error('Failed to get state history', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Orchestrator service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down');
  await orchestrator.shutdown();
  process.exit(0);
});

export default app;
