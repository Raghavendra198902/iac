import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { logger, stream } from './utils/logger';
import { runMigrations } from './utils/migrations';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { userRateLimit, ipRateLimit } from './middleware/rateLimit';
import { performanceMiddleware } from './utils/performance';
import { correlationIdMiddleware, userContextMiddleware } from './middleware/correlationId';
import { metricsMiddleware, metricsHandler, initializeMetricsCollectors } from './utils/metrics';
import { initializeTracing, tracingMiddleware, shutdownTracing } from './utils/tracing';
import { featureFlagMiddleware, initializeFeatureFlags, initializeDefaultFlags } from './utils/featureFlags';
import routes from './routes';
import { setupSwaggerDocs } from './docs/swagger-setup';
import healthRouter, { markAppAsInitialized } from './routes/health';
import systemRouter from './routes/system';

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:5173', 
      'http://localhost:3000',
      'http://192.168.1.9:5173',
      'http://192.168.1.9:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const PORT = Number(process.env.PORT) || 3000;

// Initialize OpenTelemetry tracing (must be first)
let tracingSDK: any;
try {
  tracingSDK = initializeTracing();
} catch (error) {
  logger.warn('Tracing initialization failed, continuing without tracing', { error });
}

// Add correlation ID to all requests
app.use(correlationIdMiddleware);

// Add tracing middleware (after correlation ID)
if (tracingSDK) {
  app.use(tracingMiddleware);
}

// HTTP request logging with Winston
app.use(morgan('combined', { stream }));

// Security middleware - Enhanced helmet with HSTS
app.use(helmet({
  hsts: {
    maxAge: 31536000,  // 1 year in seconds
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: false  // Disable CSP for static HTML
}));

// Performance monitoring middleware
app.use(performanceMiddleware);

// Prometheus metrics middleware
app.use(metricsMiddleware);

// CORS configuration - Inline configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://192.168.1.9:5173',
    'http://192.168.1.9:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID', 'X-Request-ID']
};
logger.info('CORS middleware configured');
app.use(cors(corsOptions));

// Rate limiting - Global rate limiter for all API endpoints
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute  
  max: process.env.NODE_ENV === 'production' ? 60 : 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/api/health';
  }
});

// Apply global rate limiter to all /api routes
app.use('/api', globalLimiter);

// Auth-specific stricter rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply auth limiter to login endpoints
app.use('/api/auth/login', authLimiter);

// Body parsing middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve static files from public directory
app.use('/public', express.static('public'));

// Security dashboard route
app.get('/security', (req, res) => {
  res.sendFile('public/security.html', { root: '.' });
});

// Health check routes (before auth middleware) - MUST be before other middleware
app.use('/', healthRouter);
app.set('io', io); // Make io available to health routes

// Public routes (no authentication required)
import downloadsRoutes from './routes/downloads';
import telemetryRoutes from './routes/telemetry';
import agentsRoutes from './routes/agents';
import enforcementRoutes, { setSocketIO } from './routes/enforcement';
import cmdbRoutes from './routes/cmdb';
import securityRoutes from './routes/security';

// Inject Socket.IO into enforcement routes
setSocketIO(io);

app.use('/api/downloads', downloadsRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/enforcement', enforcementRoutes);
app.use('/api/cmdb', cmdbRoutes); // CMDB needs to be public for agent registration
app.use('/api/security', securityRoutes); // Security events - public for agent reporting

// System metrics route (no auth required for monitoring)
app.use('/api/system', systemRouter);

// Users and roles management route (no auth for development)
import usersRouter from './routes/users';
app.use('/api/users', usersRouter);

// EA Strategy routes (no auth for development)
import eaStrategyRouter from './routes/ea-strategy';
app.use('/api/ea', eaStrategyRouter);

// EA Business Architecture routes (no auth for development)
import eaBusinessRouter from './routes/ea-business';
app.use('/api/business', eaBusinessRouter);

// EA Application Architecture routes (no auth for development)
import eaApplicationRouter from './routes/ea-application';
app.use('/api/application', eaApplicationRouter);

// EA Data Architecture routes (no auth for development)
import eaDataRouter from './routes/ea-data';
app.use('/api/data', eaDataRouter);

// EA Technology Architecture routes (no auth for development)
import eaTechnologyRouter from './routes/ea-technology';
app.use('/api/technology', eaTechnologyRouter);

// EA Security Architecture routes (no auth for development)
import eaSecurityRouter from './routes/ea-security';
app.use('/api/security', eaSecurityRouter);

// EA Roadmap routes (no auth for development)
import eaRoadmapRouter from './routes/ea-roadmap';
app.use('/api/roadmap', eaRoadmapRouter);

// EA Repository routes (no auth for development)
import eaRepositoryRouter from './routes/ea-repository';
app.use('/api/repository', eaRepositoryRouter);

// EA Stakeholders routes (no auth for development)
import eaStakeholdersRouter from './routes/ea-stakeholders';
app.use('/api/stakeholders', eaStakeholdersRouter);

// EA Analytics routes (no auth for development)
import eaAnalyticsRouter from './routes/ea-analytics';
app.use('/api/analytics', eaAnalyticsRouter);

// Project Workflow routes (no auth for development)
import { createProjectRoutes } from './routes/project-routes';
import { pool } from './utils/database';
app.use('/api', createProjectRoutes(pool));

// Project Assets routes (no auth for development)
import { createAssetRoutes } from './routes/asset-routes';
app.use('/api', createAssetRoutes(pool));

// Authentication middleware for protected routes
app.use('/api', authMiddleware);

// Add user context after auth
app.use('/api', userContextMiddleware);

// Feature flags middleware (after auth and user context)
app.use('/api', featureFlagMiddleware);

// Enhanced rate limiting (after auth, so we have user info)
app.use('/api', userRateLimit());
app.use('/api', ipRateLimit());

// Routes
app.use('/api', routes);

// Security dashboard static page
app.get('/security', (req: Request, res: Response) => {
  res.sendFile('public/security.html', { root: process.cwd() });
});

// Prometheus metrics endpoint
app.get('/metrics', metricsHandler);

// 404 handler
// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Swagger documentation
setupSwaggerDocs(app);

// Socket.IO connection handling for real-time workflow collaboration
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Join global activity feed
  socket.on('join-activity-feed', () => {
    socket.join('activity-feed');
    logger.info(`Socket ${socket.id} joined global activity feed`);
  });

  // Leave global activity feed
  socket.on('leave-activity-feed', () => {
    socket.leave('activity-feed');
    logger.info(`Socket ${socket.id} left global activity feed`);
  });
  
  // Join project room for receiving updates
  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
    logger.info(`Socket ${socket.id} joined project room: ${projectId}`);
  });

  // Leave project room
  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
    logger.info(`Socket ${socket.id} left project room: ${projectId}`);
  });

  // Broadcast activity to activity feed and project room
  socket.on('new-activity', (activity: any) => {
    // Broadcast to global activity feed
    socket.to('activity-feed').emit('activity-created', activity);
    
    // Also broadcast to specific project room if projectId exists
    if (activity.projectId) {
      socket.to(`project:${activity.projectId}`).emit('activity-created', activity);
    }
    
    logger.info(`Activity broadcasted: ${activity.type} by ${activity.userName}`);
  });

  // Broadcast step update to other users
  socket.on('step-updated', (data: { projectId: string; stepId: string; userId: string; userName: string }) => {
    socket.to(`project:${data.projectId}`).emit('step-update-notification', {
      projectId: data.projectId,
      stepId: data.stepId,
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date().toISOString(),
      message: `${data.userName} updated a workflow step`,
    });
    
    // Also send as activity
    const activity = {
      type: 'step_started',
      projectId: data.projectId,
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date().toISOString(),
      priority: 'medium',
    };
    socket.to('activity-feed').emit('activity-created', activity);
    
    logger.info(`Step update broadcasted for project ${data.projectId}`);
  });

  // Broadcast step completion
  socket.on('step-completed', (data: { projectId: string; stepId: string; stepTitle: string; userId: string; userName: string }) => {
    socket.to(`project:${data.projectId}`).emit('step-completed-notification', {
      projectId: data.projectId,
      stepId: data.stepId,
      stepTitle: data.stepTitle,
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date().toISOString(),
      message: `${data.userName} completed "${data.stepTitle}"`,
    });
    
    // Also send as activity
    const activity = {
      type: 'step_completed',
      projectId: data.projectId,
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date().toISOString(),
      priority: 'high',
      metadata: { stepTitle: data.stepTitle },
    };
    socket.to('activity-feed').emit('activity-created', activity);
    
    logger.info(`Step completion broadcasted for project ${data.projectId}`);
  });

  // Broadcast project progress update
  socket.on('project-progress-changed', (data: { projectId: string; progress: number; userId: string; userName: string }) => {
    socket.to(`project:${data.projectId}`).emit('progress-update-notification', {
      projectId: data.projectId,
      progress: data.progress,
      userId: data.userId,
      userName: data.userName,
      timestamp: new Date().toISOString(),
    });
    logger.info(`Progress update broadcasted for project ${data.projectId}: ${data.progress}%`);
  });

  // User is viewing a step (presence)
  socket.on('viewing-step', (data: { projectId: string; stepId: string; userId: string; userName: string }) => {
    socket.to(`project:${data.projectId}`).emit('user-viewing-step', {
      projectId: data.projectId,
      stepId: data.stepId,
      userId: data.userId,
      userName: data.userName,
      socketId: socket.id,
    });
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Export io instance for use in routes
export { io };

// Start server with database migrations
async function startServer() {
  try {
    // Run database migrations
    logger.info('🔄 Running database migrations...');
    await runMigrations();
    logger.info('✅ Database migrations completed');

    // Initialize Prometheus metrics collectors
    logger.info('🔄 Initializing metrics collectors...');
    initializeMetricsCollectors();
    logger.info('✅ Metrics collectors initialized');

    // Initialize feature flags
    logger.info('🔄 Initializing feature flags...');
    try {
      await initializeFeatureFlags();
      await initializeDefaultFlags();
      logger.info('✅ Feature flags initialized');
    } catch (error) {
      logger.warn('⚠️  Feature flags initialization failed, continuing without feature flags', { error });
    }

    // Mark app as initialized for startup probe
    markAppAsInitialized();
    logger.info('✅ Application initialized');

    // Start HTTP server
    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 API Gateway running on port ${PORT}`);
      logger.info('🌸 IAC Dharma - Balance in Automation');
      logger.info(`📚 API Documentation available at /api-docs`);
      logger.info(`📄 OpenAPI Spec available at /api-docs.json`);
      logger.info(`⚡ WebSocket server ready for real-time updates`);
      logger.info(`💾 Database persistence enabled`);
      logger.info(`🏥 Health checks: /health/live, /health/ready, /health/startup`);
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (tracingSDK) {
    await shutdownTracing(tracingSDK);
  }
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  if (tracingSDK) {
    await shutdownTracing(tracingSDK);
  }
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

startServer();

export default app;
