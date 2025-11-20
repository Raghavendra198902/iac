import { Router, Request, Response } from 'express';
import { query } from '../utils/database';
import { logger } from '../utils/logger';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
    websocket: {
      status: 'active' | 'inactive';
      connections: number;
    };
  };
  stats: {
    totalEvents: number;
    last24Hours: number;
    criticalEvents: number;
  };
}

// Simple health check
router.get('/health', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    let dbStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
    let dbResponseTime: number | undefined;
    let dbError: string | undefined;
    
    try {
      await query('SELECT 1');
      dbStatus = 'connected';
      dbResponseTime = Date.now() - startTime;
    } catch (error) {
      dbStatus = 'error';
      dbError = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Health check database error:', error);
    }

    // Get WebSocket status
    const io = (req.app as any).get('io');
    const wsConnections = io ? io.engine.clientsCount : 0;
    const wsStatus = io ? 'active' : 'inactive';

    // Get event statistics
    let totalEvents = 0;
    let last24Hours = 0;
    let criticalEvents = 0;

    if (dbStatus === 'connected') {
      try {
        const totalResult = await query('SELECT COUNT(*) as count FROM enforcement_events');
        totalEvents = parseInt(totalResult.rows[0]?.count || '0');

        const recentResult = await query(
          'SELECT COUNT(*) as count FROM enforcement_events WHERE timestamp > NOW() - INTERVAL \'24 hours\''
        );
        last24Hours = parseInt(recentResult.rows[0]?.count || '0');

        const criticalResult = await query(
          'SELECT COUNT(*) as count FROM enforcement_events WHERE severity = $1',
          ['critical']
        );
        criticalEvents = parseInt(criticalResult.rows[0]?.count || '0');
      } catch (error) {
        logger.error('Health check stats error:', error);
      }
    }

    // Determine overall health status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (dbStatus === 'connected' && wsStatus === 'active') {
      overallStatus = 'healthy';
    } else if (dbStatus === 'connected' || wsStatus === 'active') {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unhealthy';
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          error: dbError,
        },
        websocket: {
          status: wsStatus,
          connections: wsConnections,
        },
      },
      stats: {
        totalEvents,
        last24Hours,
        criticalEvents,
      },
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Detailed health check for monitoring systems
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const checks = {
      database: {
        name: 'PostgreSQL Database',
        status: 'unknown' as 'pass' | 'fail' | 'unknown',
        responseTime: 0,
        details: {} as any,
      },
      websocket: {
        name: 'WebSocket Server',
        status: 'unknown' as 'pass' | 'fail' | 'unknown',
        details: {} as any,
      },
      disk: {
        name: 'Disk Space',
        status: 'unknown' as 'pass' | 'fail' | 'unknown',
        details: {} as any,
      },
      memory: {
        name: 'Memory Usage',
        status: 'unknown' as 'pass' | 'fail' | 'unknown',
        details: {} as any,
      },
    };

    // Database check with query performance
    const dbStart = Date.now();
    try {
      await query('SELECT 1');
      const tableCheck = await query(
        'SELECT tablename FROM pg_tables WHERE schemaname = $1',
        ['public']
      );
      checks.database.status = 'pass';
      checks.database.responseTime = Date.now() - dbStart;
      checks.database.details = {
        tables: tableCheck.rows.map((r) => r.tablename),
        responseTime: `${checks.database.responseTime}ms`,
      };
    } catch (error) {
      checks.database.status = 'fail';
      checks.database.details = {
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }

    // WebSocket check
    const io = (req.app as any).get('io');
    if (io) {
      checks.websocket.status = 'pass';
      checks.websocket.details = {
        connections: io.engine.clientsCount,
        transport: 'Socket.IO',
      };
    } else {
      checks.websocket.status = 'fail';
      checks.websocket.details = { error: 'WebSocket server not initialized' };
    }

    // Memory check
    const memUsage = process.memoryUsage();
    const memUsageMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
    };
    checks.memory.status = memUsageMB.heapUsed < 500 ? 'pass' : 'fail';
    checks.memory.details = memUsageMB;

    // Overall status
    const allPassed = Object.values(checks).every((check) => check.status === 'pass');
    const anyFailed = Object.values(checks).some((check) => check.status === 'fail');

    res.json({
      status: allPassed ? 'pass' : anyFailed ? 'fail' : 'unknown',
      timestamp: new Date().toISOString(),
      checks,
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        pid: process.pid,
      },
    });
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(500).json({
      status: 'fail',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Readiness check (for Kubernetes/container orchestration)
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Check if database is ready
    await query('SELECT 1');
    
    // Check if essential tables exist
    const tableCheck = await query(
      'SELECT tablename FROM pg_tables WHERE schemaname = $1 AND tablename = $2',
      ['public', 'enforcement_events']
    );

    if (tableCheck.rows.length === 0) {
      return res.status(503).json({
        ready: false,
        reason: 'Database tables not initialized',
      });
    }

    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      ready: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

// Liveness check (for Kubernetes/container orchestration)
router.get('/live', (req: Request, res: Response) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
