import { Router } from 'express';
import blueprintRoutes from './blueprints';
import iacRoutes from './iac';
import costingRoutes from './costing';
import authRoutes from './auth';
import aiRoutes from './ai';
import pmRoutes from './pm';
import seRoutes from './se';
import eaStrategyRoutes from './ea-strategy';
import eaResponsibilitiesRoutes from './ea-responsibilities';
import taRoutes from './ta';
import saRoutes from './sa';
import performanceRoutes from './performance';
import cmdbRoutes from './cmdb';
import downloadsRoutes from './downloads';
import cacheRoutes from './cache';
import circuitBreakerRoutes from './circuitBreaker';
import rateLimitRoutes from './rateLimit';
import featureFlagsRoutes from './featureFlags';
import adminRoutes from './admin';
import adrRoutes from './architecture-decisions';
import metricsRoutes from './architecture-metrics';
import solutionArchitectRoutes from './solution-architect';
import technicalArchitectRoutes from './technical-architect';
import projectManagerRoutes from './project-manager';
import softwareEngineerRoutes from './software-engineer';
import monitoringRoutes from './monitoring';
import orchestratorRoutes from './orchestrator';
import cloudProvidersRoutes from './cloud-providers';

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
      eaResponsibilities: '/api/ea/responsibilities',
      ta: '/api/ta',
      sa: '/api/sa',
      performance: '/api/performance',
      downloads: '/api/downloads',
      cmdb: '/api/cmdb',
      cache: '/api/cache',
      circuitBreakers: '/api/circuit-breakers',
      rateLimits: '/api/rate-limits',
      featureFlags: '/api/feature-flags',
      admin: '/api/admin',
      adr: '/api/adr',
      architecture: '/api/architecture',
      monitoring: '/api/monitoring',
      orchestrator: '/api/orchestrator',
      cloudProviders: '/api/cloud-providers',
      roles: {
        solutionArchitect: '/api/sa',
        technicalArchitect: '/api/ta', 
        projectManager: '/api/pm',
        softwareEngineer: '/api/se'
      }
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
router.use('/ea', eaStrategyRoutes);
router.use('/ea/responsibilities', eaResponsibilitiesRoutes);
router.use('/ta', taRoutes);
router.use('/sa', saRoutes);
router.use('/performance', performanceRoutes);
router.use('/cache', cacheRoutes);
router.use('/circuit-breakers', circuitBreakerRoutes);
router.use('/rate-limits', rateLimitRoutes);
router.use('/feature-flags', featureFlagsRoutes);
router.use('/admin', adminRoutes);
router.use('/adr', adrRoutes);
router.use('/architecture', metricsRoutes);
router.use('/sa', solutionArchitectRoutes);
router.use('/ta', technicalArchitectRoutes);
router.use('/pm', projectManagerRoutes);
router.use('/se', softwareEngineerRoutes);
router.use('/monitoring', monitoringRoutes);
router.use('/orchestrator', orchestratorRoutes);
router.use('/cloud-providers', cloudProvidersRoutes);
// cmdb moved to public routes in index.ts
router.use('/downloads', downloadsRoutes);

export default router;
