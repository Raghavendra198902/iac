import express from 'express';
import cors from 'cors';
import { AutomationOrchestrator } from './orchestrator';
import { ProAutomationEngine } from './ProAutomationEngine';

// Simple logger
const logger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error || ''),
  warn: (msg: string, meta?: any) => console.warn(`[WARN] ${msg}`, meta || ''),
  debug: (msg: string, meta?: any) => console.debug(`[DEBUG] ${msg}`, meta || '')
};

const app = express();
const PORT = process.env.PORT || 3010;

// Security: Disable X-Powered-By header to prevent information disclosure
app.disable('x-powered-by');

app.use(cors());
app.use(express.json());

const orchestrator = new AutomationOrchestrator();
const proEngine = new ProAutomationEngine();

// Setup Pro Engine event listeners
proEngine.on('workflow:started', (data) => logger.info('🚀 Pro Workflow Started', data));
proEngine.on('workflow:optimized', (data) => logger.info('🤖 Workflow Optimized', data));
proEngine.on('workflow:predictions', (data) => logger.info('🔮 Predictions Generated', data));
proEngine.on('workflow:self_healed', (data) => logger.info('🏥 Self-Healing Activated', data));
proEngine.on('workflow:completed', (data) => logger.info('✅ Pro Workflow Completed', data));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'automation-engine' });
});

// Start automated workflow
app.post('/api/automation/start', async (req, res) => {
  try {
    const { requirements, automationLevel = 2, environment = 'dev' } = req.body;

    logger.info('Starting automated workflow', { requirements, automationLevel, environment });

    const workflowId = await orchestrator.startWorkflow({
      requirements,
      automationLevel,
      environment,
      userId: req.body.userId,
      tenantId: req.body.tenantId
    });

    res.status(202).json({
      workflowId,
      status: 'started',
      message: 'Automated workflow initiated',
      trackingUrl: `/api/automation/status/${workflowId}`
    });
  } catch (error: any) {
    logger.error('Failed to start workflow', error);
    res.status(500).json({ error: error.message });
  }
});

// Get workflow status
app.get('/api/automation/status/:workflowId', async (req, res) => {
  try {
    const status = await orchestrator.getWorkflowStatus(req.params.workflowId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel workflow
app.post('/api/automation/cancel/:workflowId', async (req, res) => {
  try {
    await orchestrator.cancelWorkflow(req.params.workflowId);
    res.json({ status: 'cancelled' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PRO AUTOMATION ENGINE ROUTES ==========

// Start Pro workflow with advanced features
app.post('/api/automation/pro/start', async (req, res) => {
  try {
    const { 
      requirements, 
      automationLevel = 5, 
      environment = 'prod',
      aiOptimization = true,
      selfHealing = true,
      predictiveAnalysis = true,
      multiCloud = false,
      chaosEngineering = false
    } = req.body;

    logger.info('Starting Pro Automation workflow', { requirements, automationLevel });

    const workflowId = await proEngine.startProWorkflow({
      workflowId: `pro_${Date.now()}`,
      requirements,
      automationLevel,
      environment,
      userId: req.body.userId,
      tenantId: req.body.tenantId,
      aiOptimization,
      selfHealing,
      predictiveAnalysis,
      multiCloud,
      chaosEngineering
    });

    res.status(202).json({
      workflowId,
      status: 'started',
      message: 'Pro Automation workflow initiated with AI capabilities',
      trackingUrl: `/api/automation/pro/status/${workflowId}`,
      features: {
        aiOptimization,
        selfHealing,
        predictiveAnalysis,
        multiCloud,
        chaosEngineering
      }
    });
  } catch (error: any) {
    logger.error('Failed to start Pro workflow', error);
    res.status(500).json({ error: error.message });
  }
});

// Get Pro workflow status
app.get('/api/automation/pro/status/:workflowId', async (req, res) => {
  try {
    const status = await proEngine.getWorkflowStatus(req.params.workflowId);
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Pro features and capabilities
app.get('/api/automation/pro/features', (req, res) => {
  const features = proEngine.getProFeatures();
  res.json(features);
});

// Cancel Pro workflow
app.post('/api/automation/pro/cancel/:workflowId', async (req, res) => {
  try {
    await proEngine.cancelWorkflow(req.params.workflowId);
    res.json({ status: 'cancelled' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  logger.info(`🤖 Automation Engine running on port ${PORT}`);
  logger.info(`🌸 IAC Dharma - Fully Automated Pipeline`);
});

export default app;
