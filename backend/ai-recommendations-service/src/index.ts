import express from 'express';
import cors from 'cors';
import { recommendationsRouter } from './routes/recommendations';
import { analyticsRouter } from './routes/analytics';
import { optimizationRouter } from './routes/optimization';

const logger = {
  info: (msg: string, meta?: any) => console.log(`[INFO] ${msg}`, meta || ''),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error || ''),
  warn: (msg: string, meta?: any) => console.warn(`[WARN] ${msg}`, meta || ''),
  debug: (msg: string, meta?: any) => console.debug(`[DEBUG] ${msg}`, meta || '')
};

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
  console.log(`🤖 AI Recommendations Service running on port ${PORT}`);
});
