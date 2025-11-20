import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { logger } from './utils/logger';
import { runMigrations } from './utils/migrations';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { performanceMiddleware } from './utils/performance';
import routes from './routes';
import { setupSwaggerDocs } from './docs/swagger-setup';

const app: Application = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

const PORT = Number(process.env.PORT) || 3000;

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

// CORS configuration  
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173', 'http://localhost:3000'];
logger.warn(process.env.ALLOWED_ORIGINS ? `CORS enabled for: ${allowedOrigins.join(', ')}` : 'ALLOWED_ORIGINS not set - allowing all origins (development only)');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? allowedOrigins : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400
}));

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

// HTTP request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      }
    }
  }));
}

// Health check routes (before auth middleware)
import healthRoutes from './routes/health';
app.use('/', healthRoutes);
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

// Authentication middleware for protected routes
app.use('/api', authMiddleware);

// Routes
app.use('/api', routes);

// Security dashboard static page
app.get('/security', (req: Request, res: Response) => {
  res.sendFile('public/security.html', { root: process.cwd() });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Swagger documentation
setupSwaggerDocs(app);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
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

    // Start HTTP server
    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 API Gateway running on port ${PORT}`);
      logger.info('🌸 IAC Dharma - Balance in Automation');
      logger.info(`📚 API Documentation available at /api-docs`);
      logger.info(`📄 OpenAPI Spec available at /api-docs.json`);
      logger.info(`⚡ WebSocket server ready for real-time updates`);
      logger.info(`💾 Database persistence enabled`);
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

export default app;
