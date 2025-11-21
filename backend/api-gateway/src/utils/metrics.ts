/**
 * Prometheus Metrics Collection for API Gateway
 * 
 * Exposes comprehensive metrics for:
 * - HTTP requests (rate, duration, status codes)
 * - Circuit breakers (open/closed/half-open counts, failures)
 * - Cache operations (hits, misses, size)
 * - Rate limiting (requests allowed/blocked, tier usage)
 * - Database operations (query duration, connection pool)
 * - Health checks (status over time)
 */

import { Request, Response, NextFunction } from 'express';
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { logger } from './logger';

// Create a custom registry
export const register = new Registry();

// Collect default metrics (CPU, memory, event loop, etc.)
collectDefaultMetrics({ register, prefix: 'api_gateway_' });

/**
 * HTTP Metrics
 */

// HTTP request counter by method, path, and status code
export const httpRequestCounter = new Counter({
  name: 'api_gateway_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status_code', 'service'],
  registers: [register],
});

// HTTP request duration histogram
export const httpRequestDuration = new Histogram({
  name: 'api_gateway_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status_code', 'service'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// HTTP request size histogram
export const httpRequestSize = new Histogram({
  name: 'api_gateway_http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'path'],
  buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
  registers: [register],
});

// HTTP response size histogram
export const httpResponseSize = new Histogram({
  name: 'api_gateway_http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'path', 'status_code'],
  buckets: [100, 1000, 5000, 10000, 50000, 100000, 500000, 1000000],
  registers: [register],
});

// Active HTTP connections gauge
export const httpActiveConnections = new Gauge({
  name: 'api_gateway_http_active_connections',
  help: 'Number of active HTTP connections',
  registers: [register],
});

/**
 * Circuit Breaker Metrics
 */

// Circuit breaker state gauge (0=closed, 1=open, 2=half-open)
export const circuitBreakerState = new Gauge({
  name: 'api_gateway_circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
  labelNames: ['service', 'breaker_name'],
  registers: [register],
});

// Circuit breaker calls counter
export const circuitBreakerCalls = new Counter({
  name: 'api_gateway_circuit_breaker_calls_total',
  help: 'Total number of circuit breaker calls',
  labelNames: ['service', 'breaker_name', 'result'],
  registers: [register],
});

// Circuit breaker failures counter
export const circuitBreakerFailures = new Counter({
  name: 'api_gateway_circuit_breaker_failures_total',
  help: 'Total number of circuit breaker failures',
  labelNames: ['service', 'breaker_name', 'error_type'],
  registers: [register],
});

// Circuit breaker fallback usage counter
export const circuitBreakerFallbacks = new Counter({
  name: 'api_gateway_circuit_breaker_fallbacks_total',
  help: 'Total number of circuit breaker fallback executions',
  labelNames: ['service', 'breaker_name', 'fallback_type'],
  registers: [register],
});

// Circuit breaker call duration
export const circuitBreakerDuration = new Histogram({
  name: 'api_gateway_circuit_breaker_call_duration_seconds',
  help: 'Duration of circuit breaker calls in seconds',
  labelNames: ['service', 'breaker_name', 'result'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [register],
});

/**
 * Cache Metrics
 */

// Cache operations counter
export const cacheOperations = new Counter({
  name: 'api_gateway_cache_operations_total',
  help: 'Total number of cache operations',
  labelNames: ['operation', 'result', 'cache_type'],
  registers: [register],
});

// Cache hit/miss counter
export const cacheHits = new Counter({
  name: 'api_gateway_cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type', 'key_pattern'],
  registers: [register],
});

export const cacheMisses = new Counter({
  name: 'api_gateway_cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type', 'key_pattern'],
  registers: [register],
});

// Cache size gauge
export const cacheSize = new Gauge({
  name: 'api_gateway_cache_size_bytes',
  help: 'Current size of cache in bytes',
  labelNames: ['cache_type'],
  registers: [register],
});

// Cache entry count gauge
export const cacheEntryCount = new Gauge({
  name: 'api_gateway_cache_entries',
  help: 'Number of entries in cache',
  labelNames: ['cache_type'],
  registers: [register],
});

// Cache operation duration
export const cacheOperationDuration = new Histogram({
  name: 'api_gateway_cache_operation_duration_seconds',
  help: 'Duration of cache operations in seconds',
  labelNames: ['operation', 'cache_type'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

/**
 * Rate Limiting Metrics
 */

// Rate limit requests counter
export const rateLimitRequests = new Counter({
  name: 'api_gateway_rate_limit_requests_total',
  help: 'Total number of rate limit checks',
  labelNames: ['user_id', 'subscription_tier', 'operation', 'result'],
  registers: [register],
});

// Rate limit blocks counter
export const rateLimitBlocks = new Counter({
  name: 'api_gateway_rate_limit_blocks_total',
  help: 'Total number of requests blocked by rate limiting',
  labelNames: ['user_id', 'subscription_tier', 'operation'],
  registers: [register],
});

// Rate limit remaining quota gauge
export const rateLimitQuota = new Gauge({
  name: 'api_gateway_rate_limit_quota_remaining',
  help: 'Remaining rate limit quota',
  labelNames: ['user_id', 'subscription_tier', 'operation'],
  registers: [register],
});

// Rate limit usage percentage gauge
export const rateLimitUsagePercent = new Gauge({
  name: 'api_gateway_rate_limit_usage_percent',
  help: 'Rate limit usage as percentage of quota',
  labelNames: ['user_id', 'subscription_tier', 'operation'],
  registers: [register],
});

/**
 * Database Metrics
 */

// Database query counter
export const dbQueryCounter = new Counter({
  name: 'api_gateway_db_queries_total',
  help: 'Total number of database queries',
  labelNames: ['query_type', 'table', 'result'],
  registers: [register],
});

// Database query duration histogram
export const dbQueryDuration = new Histogram({
  name: 'api_gateway_db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

// Database connection pool metrics
export const dbConnectionPool = new Gauge({
  name: 'api_gateway_db_connection_pool',
  help: 'Database connection pool status',
  labelNames: ['state'],
  registers: [register],
});

// Database errors counter
export const dbErrors = new Counter({
  name: 'api_gateway_db_errors_total',
  help: 'Total number of database errors',
  labelNames: ['error_type', 'query_type'],
  registers: [register],
});

/**
 * Health Check Metrics
 */

// Health check status gauge (1=healthy, 0=unhealthy)
export const healthCheckStatus = new Gauge({
  name: 'api_gateway_health_check_status',
  help: 'Health check status (1=healthy, 0=unhealthy)',
  labelNames: ['check_type', 'component'],
  registers: [register],
});

// Health check duration
export const healthCheckDuration = new Histogram({
  name: 'api_gateway_health_check_duration_seconds',
  help: 'Duration of health checks in seconds',
  labelNames: ['check_type', 'component'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

/**
 * Error Metrics
 */

// Application errors counter
export const errorCounter = new Counter({
  name: 'api_gateway_errors_total',
  help: 'Total number of application errors',
  labelNames: ['error_type', 'error_class', 'severity'],
  registers: [register],
});

// Error rate by endpoint
export const errorRate = new Gauge({
  name: 'api_gateway_error_rate',
  help: 'Error rate by endpoint (errors per second)',
  labelNames: ['method', 'path'],
  registers: [register],
});

/**
 * Business Metrics
 */

// IAC generations counter
export const iacGenerations = new Counter({
  name: 'api_gateway_iac_generations_total',
  help: 'Total number of IaC generations',
  labelNames: ['provider', 'template_type', 'result'],
  registers: [register],
});

// Blueprint creations counter
export const blueprintCreations = new Counter({
  name: 'api_gateway_blueprint_creations_total',
  help: 'Total number of blueprint creations',
  labelNames: ['blueprint_type', 'complexity', 'result'],
  registers: [register],
});

// Cost analysis counter
export const costAnalysis = new Counter({
  name: 'api_gateway_cost_analysis_total',
  help: 'Total number of cost analyses',
  labelNames: ['provider', 'result'],
  registers: [register],
});

// AI recommendations counter
export const aiRecommendations = new Counter({
  name: 'api_gateway_ai_recommendations_total',
  help: 'Total number of AI recommendations',
  labelNames: ['recommendation_type', 'confidence_level'],
  registers: [register],
});

/**
 * Middleware for HTTP metrics collection
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Increment active connections
  httpActiveConnections.inc();

  // Track request size
  const requestSize = parseInt(req.get('content-length') || '0', 10);
  if (requestSize > 0) {
    httpRequestSize.observe(
      { method: req.method, path: req.route?.path || req.path },
      requestSize
    );
  }

  // Hook into response finish event
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const path = req.route?.path || req.path;
    const statusCode = res.statusCode.toString();
    const service = req.headers['x-service-name'] as string || 'unknown';

    // Record request
    httpRequestCounter.inc({
      method: req.method,
      path,
      status_code: statusCode,
      service,
    });

    // Record duration
    httpRequestDuration.observe(
      { method: req.method, path, status_code: statusCode, service },
      duration
    );

    // Track response size
    const responseSize = parseInt(res.get('content-length') || '0', 10);
    if (responseSize > 0) {
      httpResponseSize.observe(
        { method: req.method, path, status_code: statusCode },
        responseSize
      );
    }

    // Decrement active connections
    httpActiveConnections.dec();

    // Track errors
    if (res.statusCode >= 400) {
      const errorClass = res.statusCode >= 500 ? 'ServerError' : 'ClientError';
      const severity = res.statusCode >= 500 ? 'error' : 'warning';
      errorCounter.inc({
        error_type: `HTTP_${statusCode}`,
        error_class: errorClass,
        severity,
      });
    }
  });

  next();
};

/**
 * Update circuit breaker metrics
 */
export const updateCircuitBreakerMetrics = (
  service: string,
  breakerName: string,
  state: 'open' | 'closed' | 'halfOpen',
  stats: {
    success?: number;
    failure?: number;
    fallback?: number;
    timeout?: number;
  }
) => {
  // Update state
  const stateValue = state === 'closed' ? 0 : state === 'open' ? 1 : 2;
  circuitBreakerState.set({ service, breaker_name: breakerName }, stateValue);

  // Update counters
  if (stats.success) {
    circuitBreakerCalls.inc({ service, breaker_name: breakerName, result: 'success' }, stats.success);
  }
  if (stats.failure) {
    circuitBreakerCalls.inc({ service, breaker_name: breakerName, result: 'failure' }, stats.failure);
    circuitBreakerFailures.inc({ service, breaker_name: breakerName, error_type: 'unknown' }, stats.failure);
  }
  if (stats.fallback) {
    circuitBreakerFallbacks.inc({ service, breaker_name: breakerName, fallback_type: 'default' }, stats.fallback);
  }
  if (stats.timeout) {
    circuitBreakerFailures.inc({ service, breaker_name: breakerName, error_type: 'timeout' }, stats.timeout);
  }
};

/**
 * Update cache metrics
 */
export const updateCacheMetrics = (
  operation: 'get' | 'set' | 'delete' | 'clear',
  result: 'hit' | 'miss' | 'success' | 'error',
  cacheType: 'redis' | 'memory',
  keyPattern?: string,
  duration?: number
) => {
  cacheOperations.inc({ operation, result, cache_type: cacheType });

  if (operation === 'get') {
    if (result === 'hit') {
      cacheHits.inc({ cache_type: cacheType, key_pattern: keyPattern || 'unknown' });
    } else if (result === 'miss') {
      cacheMisses.inc({ cache_type: cacheType, key_pattern: keyPattern || 'unknown' });
    }
  }

  if (duration !== undefined) {
    cacheOperationDuration.observe({ operation, cache_type: cacheType }, duration);
  }
};

/**
 * Update rate limit metrics
 */
export const updateRateLimitMetrics = (
  userId: string,
  tier: string,
  operation: string,
  result: 'allowed' | 'blocked',
  remaining: number,
  limit: number
) => {
  rateLimitRequests.inc({ user_id: userId, subscription_tier: tier, operation, result });

  if (result === 'blocked') {
    rateLimitBlocks.inc({ user_id: userId, subscription_tier: tier, operation });
  }

  rateLimitQuota.set({ user_id: userId, subscription_tier: tier, operation }, remaining);
  
  const usagePercent = ((limit - remaining) / limit) * 100;
  rateLimitUsagePercent.set({ user_id: userId, subscription_tier: tier, operation }, usagePercent);
};

/**
 * Update database metrics
 */
export const updateDatabaseMetrics = (
  queryType: string,
  table: string,
  duration: number,
  result: 'success' | 'error',
  errorType?: string
) => {
  dbQueryCounter.inc({ query_type: queryType, table, result });
  dbQueryDuration.observe({ query_type: queryType, table }, duration);

  if (result === 'error' && errorType) {
    dbErrors.inc({ error_type: errorType, query_type: queryType });
  }
};

/**
 * Update health check metrics
 */
export const updateHealthCheckMetrics = (
  checkType: 'liveness' | 'readiness' | 'startup',
  component: string,
  status: boolean,
  duration: number
) => {
  healthCheckStatus.set({ check_type: checkType, component }, status ? 1 : 0);
  healthCheckDuration.observe({ check_type: checkType, component }, duration);
};

/**
 * Metrics endpoint handler
 */
export const metricsHandler = async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.end(metrics);
  } catch (error) {
    logger.error('Error collecting metrics', { error });
    res.status(500).end('Error collecting metrics');
  }
};

// Initialize metrics collectors
export const initializeMetricsCollectors = () => {
  logger.info('Initializing Prometheus metrics collectors');

  // Collect metrics every 10 seconds
  setInterval(async () => {
    try {
      // Update circuit breaker metrics from circuit breaker registry
      const circuitBreakerModule = await import('./circuitBreaker');
      if (circuitBreakerModule.getAllCircuitBreakerStats) {
        const breakerStats = circuitBreakerModule.getAllCircuitBreakerStats();
        
        for (const stats of breakerStats) {
          const state = stats.state === 'half-open' ? 'halfOpen' : stats.state;
          updateCircuitBreakerMetrics(
            'api-gateway',
            stats.name,
            state,
            {
              success: stats.stats.successes,
              failure: stats.stats.failures,
              fallback: stats.stats.fallbacks,
              timeout: stats.stats.timeouts,
            }
          );
        }
      }

      // Update cache metrics
      const cacheModule = await import('./cache');
      if (cacheModule.getRedisClient) {
        const redis = cacheModule.getRedisClient();
        const info = await redis.info('memory');
        const memoryMatch = info.match(/used_memory:(\d+)/);
        if (memoryMatch) {
          cacheSize.set({ cache_type: 'redis' }, parseInt(memoryMatch[1], 10));
        }
        
        const dbsize = await redis.dbsize();
        cacheEntryCount.set({ cache_type: 'redis' }, dbsize);
      }

      // Update database connection pool metrics
      const dbModule = await import('./database');
      if (dbModule.pool) {
        dbConnectionPool.set({ state: 'total' }, dbModule.pool.totalCount);
        dbConnectionPool.set({ state: 'idle' }, dbModule.pool.idleCount);
        dbConnectionPool.set({ state: 'waiting' }, dbModule.pool.waitingCount);
      }

    } catch (error) {
      logger.error('Error updating periodic metrics', { error });
    }
  }, 10000);

  logger.info('Prometheus metrics collectors initialized');
};
