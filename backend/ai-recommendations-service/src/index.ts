import express from 'express';
import { recommendationsRouter } from './routes/recommendations';
import { analyticsRouter } from './routes/analytics';
import { optimizationRouter } from './routes/optimization';
import { corsMiddleware } from '../../shared/cors.config';
import { logger } from '../../shared/logger';

const app = express();
const PORT = process.env.PORT || 3011;

app.use(corsMiddleware);
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'ai-recommendations-service' });
});

app.use('/api/ai/recommendations', recommendationsRouter);
app.use('/api/ai/analytics', analyticsRouter);
app.use('/api/ai/optimization', optimizationRouter);

app.listen(PORT, () => {
  console.log(`🤖 AI Recommendations Service running on port ${PORT}`);
});
