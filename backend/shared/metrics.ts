import { Router, Request, Response } from 'express';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

const router = Router();

// Collect default metrics (CPU, memory, etc.)
collectDefaultMetrics({ prefix: 'dharma_' });

// Custom business metrics
export const blueprintCreationCounter = new Counter({
  name: 'dharma_blueprints_created_total',
  help: 'Total number of blueprints created',
  labelNames: ['tenant_id', 'type'],
});

export const iacGenerationCounter = new Counter({
  name: 'dharma_iac_generations_total',
  help: 'Total number of IaC code generations',
  labelNames: ['tenant_id', 'provider', 'success'],
});

export const deploymentCounter = new Counter({
  name: 'dharma_deployments_total',
  help: 'Total number of deployments',
  labelNames: ['tenant_id', 'provider', 'status'],
});

export const costEstimationHistogram = new Histogram({
  name: 'dharma_cost_estimation_duration_seconds',
  help: 'Time taken for cost estimations',
  labelNames: ['tenant_id', 'provider'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const activeUsersGauge = new Gauge({
  name: 'dharma_active_users',
  help: 'Number of currently active users',
  labelNames: ['tenant_id'],
});

export const aiRecommendationCounter = new Counter({
  name: 'dharma_ai_recommendations_total',
  help: 'Total number of AI recommendations generated',
  labelNames: ['tenant_id', 'type', 'accepted'],
});

export const driftDetectionCounter = new Counter({
  name: 'dharma_drift_detections_total',
  help: 'Total number of drift detections',
  labelNames: ['tenant_id', 'severity'],
});

export const resourceCountGauge = new Gauge({
  name: 'dharma_managed_resources_total',
  help: 'Total number of managed infrastructure resources',
  labelNames: ['tenant_id', 'provider', 'type'],
});

export const tenantProjectsGauge = new Gauge({
  name: 'dharma_tenant_projects_total',
  help: 'Total number of projects per tenant',
  labelNames: ['tenant_id'],
});

export const costSavingsGauge = new Gauge({
  name: 'dharma_cost_savings_usd',
  help: 'Estimated cost savings in USD',
  labelNames: ['tenant_id', 'optimization_type'],
});

// Metrics endpoint
router.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health metrics endpoint
router.get('/health/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString(),
    };

    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to collect health metrics' });
  }
});

export default router;
