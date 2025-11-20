import express from 'express';
import cron from 'node-cron';
import { DriftDetector } from './drift-detector';
import { HealthMonitor } from './health-monitor';
import { CostMonitor } from './cost-monitor';
import { RemediationEngine } from './remediation-engine';
import { logger } from './utils/logger';

const app = express();

// Security: Disable X-Powered-By header to prevent information disclosure
app.disable('x-powered-by');

app.use(express.json());

const driftDetector = new DriftDetector();
const healthMonitor = new HealthMonitor();
const costMonitor = new CostMonitor();
const remediationEngine = new RemediationEngine();

// Register deployment for monitoring
app.post('/api/monitoring/register', async (req, res) => {
  try {
    const { deploymentId, blueprintId, environment, monitoringConfig } = req.body;
    
    await driftDetector.registerDeployment({
      deploymentId,
      blueprintId,
      environment,
      enabled: monitoringConfig.driftDetection
    });
    
    await healthMonitor.registerDeployment({
      deploymentId,
      blueprintId,
      environment,
      enabled: monitoringConfig.healthChecks
    });
    
    await costMonitor.registerDeployment({
      deploymentId,
      blueprintId,
      environment,
      enabled: monitoringConfig.costMonitoring
    });
    
    res.json({ success: true, message: 'Deployment registered for monitoring' });
  } catch (error: any) {
    logger.error('Failed to register deployment', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get monitoring status
app.get('/api/monitoring/deployments/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    
    const [drift, health, cost] = await Promise.all([
      driftDetector.getStatus(deploymentId),
      healthMonitor.getStatus(deploymentId),
      costMonitor.getStatus(deploymentId)
    ]);
    
    res.json({
      deploymentId,
      status: health.status,
      lastChecked: new Date(),
      drift,
      health,
      cost
    });
  } catch (error: any) {
    logger.error('Failed to get monitoring status', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Trigger manual remediation
app.post('/api/monitoring/remediate/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const { action, approve } = req.body;
    
    if (!approve) {
      return res.status(400).json({ error: 'Approval required for remediation' });
    }
    
    const result = await remediationEngine.executeRemediation({
      deploymentId,
      action
    });
    
    res.json(result);
  } catch (error: any) {
    logger.error('Remediation failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Get drift report
app.get('/api/monitoring/drift/:deploymentId', async (req, res) => {
  try {
    const { deploymentId } = req.params;
    const driftReport = await driftDetector.getDriftReport(deploymentId);
    res.json(driftReport);
  } catch (error: any) {
    logger.error('Failed to get drift report', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'monitoring-service' });
});

// Schedule monitoring tasks
cron.schedule('*/5 * * * *', async () => {
  logger.info('Running drift detection scan');
  await driftDetector.scanAll();
});

cron.schedule('* * * * *', async () => {
  logger.info('Running health checks');
  await healthMonitor.checkAll();
});

cron.schedule('0 * * * *', async () => {
  logger.info('Running cost analysis');
  await costMonitor.analyzeAll();
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  logger.info(`Monitoring service listening on port ${PORT}`);
});

export default app;
