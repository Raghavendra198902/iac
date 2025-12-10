import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PolicyEngine } from './policy-engine';
import { ProGuardrailsEngine } from './ProGuardrailsEngine';
import { EvaluationRequest, EvaluationResult } from './types';
import { createLogger } from '../../../packages/logger/src/index';

const logger = createLogger({ serviceName: 'guardrails-engine' });

const app = express();
const PORT = process.env.PORT || 3003;

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const policyEngine = new PolicyEngine();
const proGuardrails = new ProGuardrailsEngine();

// Setup Pro Guardrails event listeners
proGuardrails.on('evaluation:completed', (data) => logger.info('✅ Pro Evaluation Complete', { evaluationId: data.evaluationId }));
proGuardrails.on('remediation:completed', (data) => logger.info('🔧 Remediation Complete', data));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'guardrails-engine' });
});

// Evaluate policies against blueprint or IaC code
app.post('/api/evaluate', async (req: Request, res: Response) => {
  try {
    const request: EvaluationRequest = req.body;

    if (!request.blueprintId && !request.iacCode) {
      return res.status(400).json({ 
        error: 'Either blueprintId or iacCode is required' 
      });
    }

    logger.info('Starting policy evaluation', { 
      blueprintId: request.blueprintId,
      hasCode: !!request.iacCode,
      environment: request.environment 
    });

    let blueprint;
    if (request.blueprintId) {
      // Fetch blueprint from blueprint service
      const blueprintUrl = `${process.env.BLUEPRINT_SERVICE_URL || 'http://blueprint-service:3001'}/api/blueprints/${request.blueprintId}`;
      const response = await axios.get(blueprintUrl);
      blueprint = response.data;
    }

    // Evaluate policies
    const result = await policyEngine.evaluate(
      blueprint,
      request.iacCode,
      request.format,
      request.policies,
      request.environment
    );

    res.json(result);
  } catch (error: any) {
    logger.error('Policy evaluation failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all policies
app.get('/api/policies', async (req: Request, res: Response) => {
  try {
    const { category, severity, enabled } = req.query;

    let policies = policyEngine.getPolicies();

    // Apply filters
    if (category) {
      policies = policies.filter(p => p.category === category);
    }
    if (severity) {
      policies = policies.filter(p => p.severity === severity);
    }
    if (enabled !== undefined) {
      const isEnabled = enabled === 'true';
      policies = policies.filter(p => p.enabled === isEnabled);
    }

    res.json({ policies, count: policies.length });
  } catch (error: any) {
    logger.error('Failed to get policies', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific policy
app.get('/api/policies/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const policy = policyEngine.getPolicy(id);

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    res.json(policy);
  } catch (error: any) {
    logger.error('Failed to get policy', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auto-remediate violations
app.post('/api/remediate', async (req: Request, res: Response) => {
  try {
    const { evaluationId, violationIds } = req.body;

    if (!evaluationId) {
      return res.status(400).json({ error: 'evaluationId is required' });
    }

    logger.info('Starting auto-remediation', { evaluationId, violationIds });

    const remediations = await policyEngine.autoRemediate(evaluationId, violationIds);

    res.json({
      evaluationId,
      remediations,
      count: remediations.length
    });
  } catch (error: any) {
    logger.error('Auto-remediation failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get evaluation history
app.get('/api/evaluations', async (req: Request, res: Response) => {
  try {
    const { blueprintId, limit = '10' } = req.query;

    const evaluations = policyEngine.getEvaluations(
      blueprintId as string,
      parseInt(limit as string)
    );

    res.json({ evaluations, count: evaluations.length });
  } catch (error: any) {
    logger.error('Failed to get evaluations', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get evaluation by ID
app.get('/api/evaluations/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const evaluation = policyEngine.getEvaluation(id);

    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }

    res.json(evaluation);
  } catch (error: any) {
    logger.error('Failed to get evaluation', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get compliance score
app.get('/api/compliance/:blueprintId', async (req: Request, res: Response) => {
  try {
    const { blueprintId } = req.params;

    const score = await policyEngine.getComplianceScore(blueprintId);

    res.json(score);
  } catch (error: any) {
    logger.error('Failed to get compliance score', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== PRO GUARDRAILS ENGINE ROUTES ==========

// Pro evaluation with AI-powered analysis
app.post('/api/pro/evaluate', async (req: Request, res: Response) => {
  try {
    const { blueprintId, iacCode, format, environment } = req.body;

    logger.info('Starting Pro policy evaluation with AI', { blueprintId, format });

    const evaluation = await proGuardrails.evaluateWithAI({
      blueprintId,
      iacCode,
      format,
      environment
    });

    res.json(evaluation);
  } catch (error: any) {
    logger.error('Pro evaluation failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Execute auto-remediation
app.post('/api/pro/remediate/:actionId', async (req: Request, res: Response) => {
  try {
    const { actionId } = req.params;

    logger.info('Executing auto-remediation', { actionId });

    const result = await proGuardrails.executeAutoRemediation(actionId);

    res.json(result);
  } catch (error: any) {
    logger.error('Remediation failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Drift detection
app.post('/api/pro/drift/:resourceId', async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.params;
    const { currentState } = req.body;

    logger.info('Detecting drift', { resourceId });

    const driftAnalysis = await proGuardrails.detectDrift(resourceId, currentState);

    res.json(driftAnalysis);
  } catch (error: any) {
    logger.error('Drift detection failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Pro features and capabilities
app.get('/api/pro/features', (req: Request, res: Response) => {
  const features = proGuardrails.getProFeatures();
  res.json(features);
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🛡️ Guardrails Engine (Pro) listening on port ${PORT}`);
  logger.info(`Loaded ${policyEngine.getPolicies().length} standard policies`);
  logger.info(`✨ Pro features enabled: AI Predictions, Auto-Remediation, Drift Detection`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

export default app;
