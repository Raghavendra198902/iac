import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Performance Profiling Middleware
 * Tracks request processing time and identifies slow endpoints
 */

interface PerformanceMetrics {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  timestamp: Date;
}

// Store recent performance metrics (last 1000 requests)
const performanceHistory: PerformanceMetrics[] = [];
const MAX_HISTORY = 1000;

// Track slow queries (>100ms)
const slowEndpoints: Map<string, number[]> = new Map();
const SLOW_THRESHOLD_MS = 100;

/**
 * Performance monitoring middleware
 */
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const start = Date.now();
  const endpoint = `${req.method} ${req.path}`;

  // Capture response finish event
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Record metrics
    const metrics: PerformanceMetrics = {
      endpoint,
      method: req.method,
      responseTime: duration,
      statusCode: res.statusCode,
      timestamp: new Date(),
    };

    // Add to history (FIFO)
    performanceHistory.push(metrics);
    if (performanceHistory.length > MAX_HISTORY) {
      performanceHistory.shift();
    }

    // Track slow endpoints
    if (duration > SLOW_THRESHOLD_MS) {
      const key = endpoint;
      if (!slowEndpoints.has(key)) {
        slowEndpoints.set(key, []);
      }
      slowEndpoints.get(key)!.push(duration);
      
      logger.warn('Slow endpoint detected', {
        endpoint,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        threshold: `${SLOW_THRESHOLD_MS}ms`,
      });
    }

    // Log all requests in debug mode
    logger.debug('Request completed', {
      endpoint,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    });
  });

  next();
};

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
  if (performanceHistory.length === 0) {
    return {
      totalRequests: 0,
      avgResponseTime: 0,
      slowestEndpoints: [],
      fastestEndpoints: [],
      statusCodeDistribution: {},
    };
  }

  // Calculate average response time
  const totalTime = performanceHistory.reduce((sum, m) => sum + m.responseTime, 0);
  const avgResponseTime = totalTime / performanceHistory.length;

  // Group by endpoint
  const endpointStats = new Map<string, number[]>();
  for (const metric of performanceHistory) {
    if (!endpointStats.has(metric.endpoint)) {
      endpointStats.set(metric.endpoint, []);
    }
    endpointStats.get(metric.endpoint)!.push(metric.responseTime);
  }

  // Calculate per-endpoint averages
  const endpointAverages = Array.from(endpointStats.entries()).map(([endpoint, times]) => ({
    endpoint,
    avgTime: times.reduce((sum, t) => sum + t, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    count: times.length,
    p95: calculatePercentile(times, 95),
    p99: calculatePercentile(times, 99),
  }));

  // Sort by average time
  const slowestEndpoints = endpointAverages
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 10);

  const fastestEndpoints = endpointAverages
    .sort((a, b) => a.avgTime - b.avgTime)
    .slice(0, 10);

  // Status code distribution
  const statusCodeDistribution: Record<number, number> = {};
  for (const metric of performanceHistory) {
    statusCodeDistribution[metric.statusCode] = 
      (statusCodeDistribution[metric.statusCode] || 0) + 1;
  }

  // Calculate percentiles for all requests
  const allTimes = performanceHistory.map(m => m.responseTime).sort((a, b) => a - b);
  
  return {
    totalRequests: performanceHistory.length,
    avgResponseTime: Math.round(avgResponseTime),
    medianResponseTime: calculatePercentile(allTimes, 50),
    p95ResponseTime: calculatePercentile(allTimes, 95),
    p99ResponseTime: calculatePercentile(allTimes, 99),
    slowestEndpoints,
    fastestEndpoints,
    statusCodeDistribution,
    slowEndpointCount: slowEndpoints.size,
    timeRange: {
      from: performanceHistory[0]?.timestamp,
      to: performanceHistory[performanceHistory.length - 1]?.timestamp,
    },
  };
}

/**
 * Get slow endpoint details
 */
export function getSlowEndpoints() {
  const slowEndpointDetails = Array.from(slowEndpoints.entries()).map(([endpoint, times]) => ({
    endpoint,
    occurrences: times.length,
    avgTime: Math.round(times.reduce((sum, t) => sum + t, 0) / times.length),
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    p95: calculatePercentile(times, 95),
    p99: calculatePercentile(times, 99),
  }));

  return slowEndpointDetails.sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Calculate percentile from sorted array
 */
function calculatePercentile(sortedArray: number[], percentile: number): number {
  if (sortedArray.length === 0) return 0;
  
  const sorted = [...sortedArray].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return Math.round(sorted[index]);
}

/**
 * Reset performance metrics
 */
export function resetPerformanceMetrics(): void {
  performanceHistory.length = 0;
  slowEndpoints.clear();
  logger.info('Performance metrics reset');
}

/**
 * Export performance data for analysis
 */
export function exportPerformanceData() {
  return {
    history: performanceHistory,
    slowEndpoints: Array.from(slowEndpoints.entries()).map(([endpoint, times]) => ({
      endpoint,
      times,
    })),
    timestamp: new Date(),
  };
}
