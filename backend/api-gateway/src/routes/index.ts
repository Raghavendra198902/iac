import { Router } from 'express';
import blueprintRoutes from './blueprints';
import iacRoutes from './iac';
import costingRoutes from './costing';
import authRoutes from './auth';
import aiRoutes from './ai';
import pmRoutes from './pm';
import seRoutes from './se';
import eaRoutes from './ea';
import taRoutes from './ta';
import saRoutes from './sa';
import performanceRoutes from './performance';
import cmdbRoutes from './cmdb';
import downloadsRoutes from './downloads';
import cacheRoutes from './cache';
import circuitBreakerRoutes from './circuitBreaker';
import rateLimitRoutes from './rateLimit';

const router = Router();

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Dharma API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      blueprints: '/api/blueprints',
      iac: '/api/iac',
      costing: '/api/costing',
      ai: '/api/ai',
      pm: '/api/pm',
      se: '/api/se',
      ea: '/api/ea',
      ta: '/api/ta',
      sa: '/api/sa',
      performance: '/api/performance',
      downloads: '/api/downloads',
      cmdb: '/api/cmdb',
      cache: '/api/cache',
      circuitBreakers: '/api/circuit-breakers',
      rateLimits: '/api/rate-limits',
    },
  });
});

// Route registrations
router.use('/auth', authRoutes);
router.use('/blueprints', blueprintRoutes);
router.use('/iac', iacRoutes);
router.use('/costing', costingRoutes);
router.use('/ai', aiRoutes);
router.use('/pm', pmRoutes);
router.use('/se', seRoutes);
router.use('/ea', eaRoutes);
router.use('/ta', taRoutes);
router.use('/sa', saRoutes);
router.use('/performance', performanceRoutes);
router.use('/cache', cacheRoutes);
router.use('/circuit-breakers', circuitBreakerRoutes);
router.use('/rate-limits', rateLimitRoutes);
// cmdb moved to public routes in index.ts
router.use('/downloads', downloadsRoutes);

export default router;
