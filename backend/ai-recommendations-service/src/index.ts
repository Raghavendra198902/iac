import express from 'express';
import cors from 'cors';
import { recommendationsRouter } from './routes/recommendations';
import { analyticsRouter } from './routes/analytics';
import { optimizationRouter } from './routes/optimization';
import { createLogger } from '../../../packages/logger/src/index';

const logger = createLogger({ serviceName: 'ai-recommendations-service' });

const app = express();
const PORT = process.env.PORT || 3011;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-recommendations-service' });
});

app.use('/api/ai/recommendations', recommendationsRouter);
app.use('/api/ai/analytics', analyticsRouter);
app.use('/api/ai/optimization', optimizationRouter);

app.listen(PORT, () => {
  logger.info('AI Recommendations Service started', { port: PORT });
});
