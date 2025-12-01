import express from 'express';
import { awsRouter } from './routes/aws';
import { azureRouter } from './routes/azure';
import { gcpRouter } from './routes/gcp';
import { multiCloudRouter } from './routes/multi-cloud';
import { corsMiddleware } from '../../shared/cors.config';
import { logger } from '../../shared/logger';

const app = express();
const PORT = process.env.PORT || 3010;

app.use(corsMiddleware);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'cloud-provider-service' });
});

// Cloud provider routes
app.use('/api/cloud/aws', awsRouter);
app.use('/api/cloud/azure', azureRouter);
app.use('/api/cloud/gcp', gcpRouter);
app.use('/api/cloud/multi', multiCloudRouter);

app.listen(PORT, () => {
  console.log(`☁️  Cloud Provider Service running on port ${PORT}`);
});
