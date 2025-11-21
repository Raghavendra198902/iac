import express, { Request, Response } from 'express';
import { prometheusRegistry } from '../utils/metrics';
import { getCircuitBreakerStats } from '../utils/circuitBreaker';
import { redisClient } from '../config/redis';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Get dashboard overview metrics summary
 */
router.get('/dashboard/overview', async (req: Request, res: Response) => {
  try {
    // Get metrics from Prometheus registry
    const metricsText = await prometheusRegistry.metrics();
    
    // Parse key metrics
    const totalRequests = extractMetricValue(metricsText, 'http_requests_total');
    const avgResponseTime = extractMetricValue(metricsText, 'http_request_duration_seconds', 'avg');
    const activeConnections = extractMetricValue(metricsText, 'http_active_connections');
    const errorRate = extractMetricValue(metricsText, 'http_request_errors_total');

    res.json({
      success: true,
      metrics: {
        totalRequests,
        avgResponseTime: Math.round(avgResponseTime * 1000), // Convert to ms
        activeConnections,
        errorRate,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error('Error fetching dashboard overview', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch overview metrics' });
  }
});

/**
 * Get metrics summary for dashboard cards
 */
router.get('/metrics/summary', async (req: Request, res: Response) => {
  try {
    const metricsText = await prometheusRegistry.metrics();
    
    const summary = {
      totalRequests: extractMetricValue(metricsText, 'http_requests_total'),
      avgResponseTime: Math.round(extractMetricValue(metricsText, 'http_request_duration_seconds', 'avg') * 1000),
      activeConnections: extractMetricValue(metricsText, 'http_active_connections'),
      errorCount: extractMetricValue(metricsText, 'http_request_errors_total'),
      circuitBreakerTrips: extractMetricValue(metricsText, 'circuit_breaker_state_open'),
      cacheHitRate: extractMetricValue(metricsText, 'cache_hit_rate') * 100,
      rateLimitBlocks: extractMetricValue(metricsText, 'rate_limit_requests_blocked_total'),
      timestamp: new Date().toISOString(),
    };

    res.json({ success: true, ...summary });
  } catch (error) {
    logger.error('Error fetching metrics summary', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch metrics summary' });
  }
});

/**
 * Get circuit breaker statistics
 */
router.get('/circuit-breakers/stats', async (req: Request, res: Response) => {
  try {
    const stats = getCircuitBreakerStats();
    
    const breakers = Object.entries(stats).map(([name, stat]: [string, any]) => ({
      name,
      state: stat.state,
      stats: {
        failures: stat.stats.failures || 0,
        successes: stat.stats.successes || 0,
        rejects: stat.stats.rejects || 0,
        timeouts: stat.stats.timeouts || 0,
        fallbacks: stat.stats.fallbacks || 0,
        fires: stat.stats.fires || 0,
      },
      lastFailure: stat.lastFailure,
      lastSuccess: stat.lastSuccess,
    }));

    res.json({ success: true, breakers });
  } catch (error) {
    logger.error('Error fetching circuit breaker stats', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch circuit breaker stats' });
  }
});

/**
 * Get cache statistics from Redis
 */
router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const info = await redisClient.info('stats');
    const dbSize = await redisClient.dbSize();
    const memory = await redisClient.info('memory');

    // Parse Redis INFO output
    const parseInfo = (infoStr: string): Record<string, any> => {
      const result: Record<string, any> = {};
      infoStr.split('\r\n').forEach((line) => {
        if (line && !line.startsWith('#')) {
          const [key, value] = line.split(':');
          if (key && value) {
            result[key] = value;
          }
        }
      });
      return result;
    };

    const statsData = parseInfo(info);
    const memoryData = parseInfo(memory);

    const hits = parseInt(statsData.keyspace_hits || '0', 10);
    const misses = parseInt(statsData.keyspace_misses || '0', 10);
    const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

    res.json({
      success: true,
      keys: dbSize,
      hits,
      misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage: parseInt(memoryData.used_memory || '0', 10),
      evictedKeys: parseInt(statsData.evicted_keys || '0', 10),
      expiredKeys: parseInt(statsData.expired_keys || '0', 10),
    });
  } catch (error) {
    logger.error('Error fetching cache stats', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch cache stats' });
  }
});

/**
 * Get active user sessions
 */
router.get('/users/active', async (req: Request, res: Response) => {
  try {
    // Get all session keys from Redis
    const sessionKeys = await redisClient.keys('session:*');
    
    const sessions = await Promise.all(
      sessionKeys.map(async (key) => {
        const sessionData = await redisClient.get(key);
        if (sessionData) {
          try {
            const parsed = JSON.parse(sessionData);
            return {
              userId: parsed.userId,
              email: parsed.email,
              subscription: parsed.subscription,
              lastActivity: parsed.lastActivity,
              ipAddress: parsed.ipAddress,
            };
          } catch {
            return null;
          }
        }
        return null;
      })
    );

    const activeSessions = sessions.filter((s) => s !== null);

    res.json({
      success: true,
      count: activeSessions.length,
      sessions: activeSessions,
    });
  } catch (error) {
    logger.error('Error fetching active sessions', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch active sessions' });
  }
});

/**
 * Get system health status
 */
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      services: {
        redis: { status: 'unknown', latency: 0 },
        database: { status: 'unknown', latency: 0 },
        apiGateway: { status: 'healthy', uptime: process.uptime() },
      },
    };

    // Check Redis
    const redisStart = Date.now();
    try {
      await redisClient.ping();
      health.services.redis = {
        status: 'healthy',
        latency: Date.now() - redisStart,
      };
    } catch {
      health.services.redis = {
        status: 'unhealthy',
        latency: -1,
      };
    }

    res.json({ success: true, health });
  } catch (error) {
    logger.error('Error checking health', { error });
    res.status(500).json({ success: false, error: 'Failed to check health' });
  }
});

/**
 * Get rate limiting statistics
 */
router.get('/rate-limits/stats', async (req: Request, res: Response) => {
  try {
    const metricsText = await prometheusRegistry.metrics();
    
    const stats = {
      totalRequests: extractMetricValue(metricsText, 'rate_limit_requests_total'),
      blockedRequests: extractMetricValue(metricsText, 'rate_limit_requests_blocked_total'),
      allowedRequests: extractMetricValue(metricsText, 'rate_limit_requests_allowed_total'),
      blockRate: 0,
      byTier: {
        free: extractMetricValueWithLabel(metricsText, 'rate_limit_requests_total', 'tier="free"'),
        basic: extractMetricValueWithLabel(metricsText, 'rate_limit_requests_total', 'tier="basic"'),
        pro: extractMetricValueWithLabel(metricsText, 'rate_limit_requests_total', 'tier="pro"'),
        enterprise: extractMetricValueWithLabel(metricsText, 'rate_limit_requests_total', 'tier="enterprise"'),
      },
    };

    if (stats.totalRequests > 0) {
      stats.blockRate = (stats.blockedRequests / stats.totalRequests) * 100;
    }

    res.json({ success: true, stats });
  } catch (error) {
    logger.error('Error fetching rate limit stats', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch rate limit stats' });
  }
});

/**
 * Get recent error logs
 */
router.get('/logs/errors', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    
    // Get recent errors from Redis (if stored there) or return empty array
    const errorLogs = await redisClient.lRange('error_logs', 0, limit - 1);
    
    const errors = errorLogs.map((log) => {
      try {
        return JSON.parse(log);
      } catch {
        return null;
      }
    }).filter((e) => e !== null);

    res.json({ success: true, errors, count: errors.length });
  } catch (error) {
    logger.error('Error fetching error logs', { error });
    res.status(500).json({ success: false, error: 'Failed to fetch error logs' });
  }
});

// Helper functions to parse Prometheus metrics
function extractMetricValue(metricsText: string, metricName: string, stat: 'sum' | 'avg' | 'count' = 'sum'): number {
  const regex = new RegExp(`${metricName}[\\s\\{][^\\n]*?\\s([\\d.]+)`, 'g');
  const matches = Array.from(metricsText.matchAll(regex));
  
  if (matches.length === 0) return 0;

  const values = matches.map((m) => parseFloat(m[1]));
  
  switch (stat) {
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
    case 'avg':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'count':
      return values.length;
    default:
      return 0;
  }
}

function extractMetricValueWithLabel(metricsText: string, metricName: string, label: string): number {
  const regex = new RegExp(`${metricName}\\{[^}]*${label}[^}]*\\}\\s([\\d.]+)`, 'g');
  const match = regex.exec(metricsText);
  return match ? parseFloat(match[1]) : 0;
}

export default router;
