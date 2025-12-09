import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { TerraformGenerator } from './generators/terraform';
import { BicepGenerator } from './generators/bicep';
import { CloudFormationGenerator } from './generators/cloudformation';
import { GenerationRequest, GenerationJob } from './types';
import { createLogger } from '../../../packages/logger/src/index';

// Winston logger
const logger = createLogger({ serviceName: 'iac-generator' });

const app = express();
const PORT = process.env.PORT || 3002;

// Security: Disable X-Powered-By header
app.disable('x-powered-by');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// In-memory job storage (in production, use Redis or database)
const jobs = new Map<string, GenerationJob>();

const terraformGen = new TerraformGenerator();
const bicepGen = new BicepGenerator();
const cloudFormationGen = new CloudFormationGenerator();

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'iac-generator' });
});

// Generate IaC from blueprint
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { blueprintId, targetFormat = 'terraform', options = {} }: GenerationRequest = req.body;

    if (!blueprintId) {
      return res.status(400).json({ error: 'blueprintId is required' });
    }

    const validFormats = ['terraform', 'bicep', 'cloudformation'];
    if (!validFormats.includes(targetFormat)) {
      return res.status(400).json({ 
        error: `Invalid targetFormat. Must be one of: ${validFormats.join(', ')}` 
      });
    }

    // Create job
    const jobId = uuidv4();
    const job: GenerationJob = {
      id: jobId,
      blueprintId,
      targetFormat,
      status: 'pending',
      createdAt: new Date(),
    };
    jobs.set(jobId, job);

    // Start generation asynchronously
    generateIaC(jobId, blueprintId, targetFormat, options).catch(error => {
      logger.error('Generation failed', { jobId, error: error.message });
      const failedJob = jobs.get(jobId);
      if (failedJob) {
        failedJob.status = 'failed';
        failedJob.error = error.message;
        failedJob.completedAt = new Date();
      }
    });

    res.status(202).json({ 
      jobId, 
      status: 'pending',
      message: 'IaC generation started' 
    });
  } catch (error: any) {
    logger.error('Failed to start generation', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get generation job status
app.get('/api/generate/:jobId', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(job);
  } catch (error: any) {
    logger.error('Failed to get job status', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download generated IaC
app.get('/api/generate/:jobId/download', (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({ error: 'Job not completed yet' });
    }

    if (!job.output) {
      return res.status(404).json({ error: 'Output not found' });
    }

    const ext = job.targetFormat === 'terraform' ? 'tf' : 
                 job.targetFormat === 'bicep' ? 'bicep' : 'yaml';
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${job.blueprintId}.${ext}"`);
    res.send(job.output.code);
  } catch (error: any) {
    logger.error('Failed to download output', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate IaC syntax
app.post('/api/validate', async (req: Request, res: Response) => {
  try {
    const { code, format } = req.body;

    if (!code || !format) {
      return res.status(400).json({ error: 'code and format are required' });
    }

    let validation;
    switch (format) {
      case 'terraform':
        validation = await terraformGen.validate(code);
        break;
      case 'bicep':
        validation = await bicepGen.validate(code);
        break;
      case 'cloudformation':
        validation = await cloudFormationGen.validate(code);
        break;
      default:
        return res.status(400).json({ error: 'Invalid format' });
    }

    res.json(validation);
  } catch (error: any) {
    logger.error('Validation failed', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List supported resource types
app.get('/api/resources/:provider', (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    
    let resources;
    switch (provider) {
      case 'terraform':
        resources = terraformGen.getSupportedResources();
        break;
      case 'bicep':
        resources = bicepGen.getSupportedResources();
        break;
      case 'cloudformation':
        resources = cloudFormationGen.getSupportedResources();
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }

    res.json({ provider, resources });
  } catch (error: any) {
    logger.error('Failed to get resources', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Main generation logic
async function generateIaC(
  jobId: string, 
  blueprintId: string, 
  targetFormat: string,
  options: any
): Promise<void> {
  const job = jobs.get(jobId);
  if (!job) return;

  try {
    job.status = 'processing';
    logger.info('Starting IaC generation', { jobId, blueprintId, targetFormat });

    // Fetch blueprint from blueprint service
    const blueprintUrl = `${process.env.BLUEPRINT_SERVICE_URL || 'http://blueprint-service:3001'}/api/blueprints/${blueprintId}`;
    const response = await axios.get(blueprintUrl);
    const blueprint = response.data;

    // Generate IaC based on target format
    let output;
    switch (targetFormat) {
      case 'terraform':
        output = await terraformGen.generate(blueprint, options);
        break;
      case 'bicep':
        output = await bicepGen.generate(blueprint, options);
        break;
      case 'cloudformation':
        output = await cloudFormationGen.generate(blueprint, options);
        break;
      default:
        throw new Error(`Unsupported format: ${targetFormat}`);
    }

    job.status = 'completed';
    job.output = output;
    job.completedAt = new Date();

    logger.info('IaC generation completed', { 
      jobId, 
      blueprintId, 
      targetFormat,
      fileCount: output.files?.length || 1 
    });
  } catch (error: any) {
    job.status = 'failed';
    job.error = error.message;
    job.completedAt = new Date();
    
    logger.error('IaC generation failed', { jobId, blueprintId, error: error.message });
    throw error;
  }
}

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`IaC Generator service listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down');
  process.exit(0);
});

export default app;
