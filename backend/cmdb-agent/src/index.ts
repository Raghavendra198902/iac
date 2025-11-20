import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cron from 'node-cron';
import logger from './utils/logger';
import { CMDBAgent } from './services/cmdbAgent';
import { AgentConfig } from './types';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());
app.disable('x-powered-by'); // Security: Hide Express signature

// Agent configuration - trim all string values to handle Windows env var spaces
const config: AgentConfig = {
  agentId: (process.env.AGENT_ID || 'agent-default').trim(),
  agentName: (process.env.AGENT_NAME || 'CMDB Agent').trim(),
  environment: (process.env.AGENT_ENVIRONMENT || 'production').trim(),
  cmdbApiUrl: (process.env.CMDB_API_URL || 'http://localhost:3000/api/cmdb').trim(),
  cmdbApiKey: (process.env.CMDB_API_KEY || '').trim(),
  scanInterval: parseInt(process.env.SCAN_INTERVAL_MINUTES || '5'),
  autoDiscovery: process.env.AUTO_DISCOVERY_ENABLED === 'true',
  thresholds: {
    cpu: parseInt(process.env.CPU_THRESHOLD_PERCENT || '80'),
    memory: parseInt(process.env.MEMORY_THRESHOLD_PERCENT || '85'),
    disk: parseInt(process.env.DISK_THRESHOLD_PERCENT || '90'),
  },
};

// Validate required configuration
if (!config.cmdbApiKey) {
  logger.error('CMDB_API_KEY is required');
  process.exit(1);
}

// Initialize agent
const agent = new CMDBAgent(config);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  const status = agent.getStatus();
  const isHealthy = agent.isHealthy();

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    ...status,
    uptime: process.uptime(),
    version: process.env.AGENT_VERSION || '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/status', (req: Request, res: Response) => {
  const status = agent.getStatus();
  res.json({
    ...status,
    config: {
      scanInterval: config.scanInterval,
      autoDiscovery: config.autoDiscovery,
      thresholds: config.thresholds,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Security stats endpoint
app.get('/security/stats', (req: Request, res: Response) => {
  const stats = agent.getSecurityStats();
  res.json({
    ...stats,
    timestamp: new Date().toISOString(),
  });
});

// Force sync endpoint
app.post('/sync', async (req: Request, res: Response) => {
  try {
    logger.info('Manual sync triggered');
    await agent.collectAndSendMetrics();
    await agent.performHealthCheck();
    
    res.json({
      success: true,
      message: 'Sync completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Manual sync failed', { error });
    res.status(500).json({
      success: false,
      message: 'Sync failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Force discovery endpoint
app.post('/discover', async (req: Request, res: Response) => {
  try {
    logger.info('Manual discovery triggered');
    await agent.performDiscovery();
    
    res.json({
      success: true,
      message: 'Discovery completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Manual discovery failed', { error });
    res.status(500).json({
      success: false,
      message: 'Discovery failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Start agent
async function startAgent() {
  try {
    logger.info('Starting CMDB Agent...', {
      agentId: config.agentId,
      environment: config.environment,
      version: process.env.AGENT_VERSION || '1.0.0',
    });

    // Initialize agent
    await agent.initialize();

    // Schedule health checks (every 30 seconds)
    const healthCheckInterval = parseInt(
      process.env.HEALTH_CHECK_INTERVAL_SECONDS || '30'
    );
    cron.schedule(`*/${healthCheckInterval} * * * * *`, async () => {
      logger.debug('Running scheduled health check');
      await agent.performHealthCheck();
    });

    // Schedule metric collection (every minute)
    const metricInterval = parseInt(
      process.env.METRIC_COLLECTION_INTERVAL_SECONDS || '60'
    );
    cron.schedule(`*/${metricInterval} * * * * *`, async () => {
      logger.debug('Running scheduled metric collection');
      await agent.collectAndSendMetrics();
    });

    // Schedule data leakage monitoring (every 30 seconds)
    const dlpInterval = parseInt(
      process.env.DLP_MONITORING_INTERVAL_SECONDS || '30'
    );
    cron.schedule(`*/${dlpInterval} * * * * *`, async () => {
      logger.debug('Running scheduled data leakage monitoring');
      await agent.monitorDataLeakage();
    });
    logger.info('Data Leakage Control monitoring enabled', { intervalSeconds: dlpInterval });

    // Schedule discovery (every scan interval minutes)
    if (config.autoDiscovery) {
      cron.schedule(`*/${config.scanInterval} * * * *`, async () => {
        logger.info('Running scheduled discovery');
        await agent.performDiscovery();
      });
    }

    // Start Express server
    const port = parseInt(process.env.AGENT_PORT || '9000');
    const host = process.env.AGENT_HOST || '0.0.0.0';

    app.listen(port, host, () => {
      logger.info(`CMDB Agent server listening`, { host, port });
      logger.info('Agent started successfully');
    });

    // Perform initial discovery
    if (config.autoDiscovery) {
      logger.info('Performing initial discovery...');
      await agent.performDiscovery();
    }

  } catch (error) {
    logger.error('Failed to start agent', { error });
    process.exit(1);
  }
}

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the agent
startAgent().catch((error) => {
  logger.error('Agent startup failed', { error });
  process.exit(1);
});
