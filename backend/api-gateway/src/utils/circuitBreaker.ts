/**
 * Circuit Breaker Utility
 * 
 * Implements circuit breaker pattern to prevent cascading failures
 * and provide graceful degradation of service functionality.
 * 
 * Features:
 * - Automatic failure detection and circuit opening
 * - Configurable thresholds and timeouts
 * - Fallback strategies for graceful degradation
 * - Metrics and monitoring integration
 * - Retry with exponential backoff
 * - Distributed tracing integration
 */

import CircuitBreaker from 'opossum';
import { logger } from './logger';
import { traceCircuitBreakerCall, addSpanEvent, setSpanAttributes } from './tracing';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  rollingCountTimeout?: number;
  rollingCountBuckets?: number;
  name?: string;
  fallback?: (...args: any[]) => any | Promise<any>;
}

export interface CircuitBreakerStats {
  name: string;
  state: 'open' | 'closed' | 'half-open';
  stats: {
    failures: number;
    successes: number;
    rejects: number;
    fires: number;
    timeouts: number;
    fallbacks: number;
    semaphoreRejections: number;
    percentiles: {
      '0': number;
      '0.25': number;
      '0.5': number;
      '0.75': number;
      '0.9': number;
      '0.95': number;
      '0.99': number;
      '0.995': number;
      '1': number;
    };
    latencyMean: number;
  };
}

// Circuit breaker registry
const breakers = new Map<string, CircuitBreaker>();

/**
 * Create a circuit breaker for a function
 */
export function createCircuitBreaker<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CircuitBreakerOptions = {}
): CircuitBreaker<Parameters<T>, Awaited<ReturnType<T>>> {
  const defaultOptions = {
    timeout: 10000, // 10s timeout
    errorThresholdPercentage: 50, // Open circuit if 50% of requests fail
    resetTimeout: 30000, // Try again after 30s
    rollingCountTimeout: 10000, // 10s rolling window
    rollingCountBuckets: 10, // 10 buckets
    name: fn.name || 'unnamed',
  };

  const config = { ...defaultOptions, ...options };
  const breaker = new CircuitBreaker(fn, config);

  // Add fallback if provided
  if (config.fallback) {
    breaker.fallback(config.fallback);
  }

  // Event handlers for monitoring
  breaker.on('open', () => {
    logger.warn(`Circuit breaker opened: ${config.name}`, {
      breaker: config.name,
      state: 'open',
    });
  });

  breaker.on('halfOpen', () => {
    logger.info(`Circuit breaker half-open: ${config.name}`, {
      breaker: config.name,
      state: 'half-open',
    });
  });

  breaker.on('close', () => {
    logger.info(`Circuit breaker closed: ${config.name}`, {
      breaker: config.name,
      state: 'closed',
    });
  });

  breaker.on('success', (result) => {
    logger.debug(`Circuit breaker success: ${config.name}`, {
      breaker: config.name,
    });
  });

  breaker.on('failure', (error) => {
    logger.error(`Circuit breaker failure: ${config.name}`, {
      breaker: config.name,
      error: error.message,
    });
  });

  breaker.on('timeout', () => {
    logger.warn(`Circuit breaker timeout: ${config.name}`, {
      breaker: config.name,
      timeout: config.timeout,
    });
  });

  breaker.on('fallback', (result) => {
    logger.info(`Circuit breaker fallback: ${config.name}`, {
      breaker: config.name,
    });
  });

  breaker.on('reject', () => {
    logger.warn(`Circuit breaker reject: ${config.name}`, {
      breaker: config.name,
      reason: 'circuit_open',
    });
  });

  // Register breaker
  breakers.set(config.name, breaker);

  return breaker;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    name?: string;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    name = 'retry',
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (attempt > 0) {
        logger.info(`Retry succeeded after ${attempt} attempts`, {
          operation: name,
          attempt,
        });
      }
      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        logger.error(`All retry attempts exhausted`, {
          operation: name,
          attempts: maxRetries + 1,
          error: lastError.message,
        });
        break;
      }

      logger.warn(`Retry attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
        operation: name,
        attempt: attempt + 1,
        error: lastError.message,
        nextDelay: delay,
      });

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * Get circuit breaker by name
 */
export function getCircuitBreaker(name: string): CircuitBreaker | undefined {
  return breakers.get(name);
}

/**
 * Get all circuit breakers
 */
export function getAllCircuitBreakers(): Map<string, CircuitBreaker> {
  return breakers;
}

/**
 * Get circuit breaker statistics
 */
export function getCircuitBreakerStats(name: string): CircuitBreakerStats | null {
  const breaker = breakers.get(name);
  if (!breaker) return null;

  const stats = breaker.stats;

  return {
    name,
    state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
    stats: {
      failures: stats.failures,
      successes: stats.successes,
      rejects: stats.rejects,
      fires: stats.fires,
      timeouts: stats.timeouts,
      fallbacks: stats.fallbacks,
      semaphoreRejections: stats.semaphoreRejections,
      percentiles: stats.percentiles,
      latencyMean: stats.latencyMean,
    },
  };
}

/**
 * Get all circuit breaker statistics
 */
export function getAllCircuitBreakerStats(): CircuitBreakerStats[] {
  const allStats: CircuitBreakerStats[] = [];

  breakers.forEach((breaker, name) => {
    const stats = getCircuitBreakerStats(name);
    if (stats) {
      allStats.push(stats);
    }
  });

  return allStats;
}

/**
 * Reset a circuit breaker
 */
export function resetCircuitBreaker(name: string): boolean {
  const breaker = breakers.get(name);
  if (!breaker) return false;

  breaker.close();
  logger.info(`Circuit breaker manually reset: ${name}`, { breaker: name });
  return true;
}

/**
 * Shutdown all circuit breakers
 */
export function shutdownCircuitBreakers(): void {
  breakers.forEach((breaker, name) => {
    breaker.shutdown();
    logger.info(`Circuit breaker shutdown: ${name}`, { breaker: name });
  });
  breakers.clear();
}

// Common fallback strategies
export const fallbacks = {
  /**
   * Return cached data as fallback
   */
  cached: <T>(cache: Map<string, T>, key: string) => {
    return () => {
      const cached = cache.get(key);
      if (cached) {
        logger.info('Using cached fallback', { key });
        return cached;
      }
      throw new Error('No cached data available');
    };
  },

  /**
   * Return default value as fallback
   */
  defaultValue: <T>(value: T) => {
    return () => {
      logger.info('Using default fallback', { value });
      return value;
    };
  },

  /**
   * Return empty result as fallback
   */
  empty: () => {
    return () => {
      logger.info('Using empty fallback');
      return null;
    };
  },

  /**
   * Return stale data with warning
   */
  stale: <T>(getData: () => T | Promise<T>, maxAge: number) => {
    let lastData: T;
    let lastUpdate = 0;

    return async () => {
      const now = Date.now();
      if (lastData && now - lastUpdate < maxAge) {
        logger.warn('Using stale fallback', {
          age: now - lastUpdate,
          maxAge,
        });
        return lastData;
      }

      const data = await getData();
      lastData = data;
      lastUpdate = now;
      return data;
    };
  },
};

// Pre-configured circuit breakers for common services
export const serviceBreakers = {
  /**
   * Circuit breaker for AI service calls
   */
  aiService: createCircuitBreaker(
    async (endpoint: string, data: any) => {
      // Placeholder - actual implementation will be in service layer
      throw new Error('AI service not configured');
    },
    {
      name: 'ai-service',
      timeout: 30000, // 30s for AI operations
      errorThresholdPercentage: 50,
      resetTimeout: 60000, // 1 minute
      fallback: fallbacks.defaultValue({ error: 'AI service temporarily unavailable' }),
    }
  ),

  /**
   * Circuit breaker for cloud provider API calls
   */
  cloudProvider: createCircuitBreaker(
    async (provider: string, action: string, params: any) => {
      // Placeholder - actual implementation will be in service layer
      throw new Error('Cloud provider not configured');
    },
    {
      name: 'cloud-provider',
      timeout: 15000, // 15s for cloud API calls
      errorThresholdPercentage: 60,
      resetTimeout: 45000, // 45s
      fallback: fallbacks.defaultValue({ error: 'Cloud provider temporarily unavailable' }),
    }
  ),

  /**
   * Circuit breaker for external API calls
   */
  externalApi: createCircuitBreaker(
    async (url: string, options: any) => {
      // Placeholder - actual implementation will be in service layer
      throw new Error('External API not configured');
    },
    {
      name: 'external-api',
      timeout: 10000, // 10s for external APIs
      errorThresholdPercentage: 50,
      resetTimeout: 30000, // 30s
      fallback: fallbacks.empty(),
    }
  ),
};

export default {
  createCircuitBreaker,
  retryWithBackoff,
  getCircuitBreaker,
  getAllCircuitBreakers,
  getCircuitBreakerStats,
  getAllCircuitBreakerStats,
  resetCircuitBreaker,
  shutdownCircuitBreakers,
  fallbacks,
  serviceBreakers,
};
