import express from 'express';
import { AutomationOrchestrator } from './orchestrator';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3010;

// Security: Disable X-Powered-By header to prevent information disclosure
app.disable('x-powered-by');

app.use(express.json());

const orchestrator = new AutomationOrchestrator();

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

app.listen(PORT, () => {
  logger.info(`🤖 Automation Engine running on port ${PORT}`);
  logger.info(`🌸 IAC Dharma - Fully Automated Pipeline`);
});

export default app;
