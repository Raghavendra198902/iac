/**
 * HTTP Service with Circuit Breaker
 * 
 * Provides HTTP client wrapper with circuit breaker protection
 * for external service calls
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { createCircuitBreaker, retryWithBackoff, fallbacks } from './circuitBreaker';
import { logger } from './logger';

export interface HttpServiceOptions {
  baseURL?: string;
  timeout?: number;
  circuitBreakerName?: string;
  enableRetry?: boolean;
  maxRetries?: number;
  fallbackData?: any;
}

/**
 * Create an HTTP service with circuit breaker protection
 */
export function createHttpService(options: HttpServiceOptions = {}) {
  const {
    baseURL = '',
    timeout = 10000,
    circuitBreakerName = 'http-service',
    enableRetry = true,
    maxRetries = 3,
    fallbackData = null,
  } = options;

  // Create circuit breaker for HTTP calls
  const makeRequest = async (config: AxiosRequestConfig): Promise<AxiosResponse> => {
    const requestConfig: AxiosRequestConfig = {
      ...config,
      baseURL: config.baseURL || baseURL,
      timeout: config.timeout || timeout,
    };

    logger.debug('Making HTTP request', {
      method: requestConfig.method,
      url: requestConfig.url,
      baseURL: requestConfig.baseURL,
    });

    if (enableRetry) {
      return retryWithBackoff(
        () => axios(requestConfig),
        {
          maxRetries,
          name: `${circuitBreakerName}-${config.method}-${config.url}`,
        }
      );
    }

    return axios(requestConfig);
  };

  const breaker = createCircuitBreaker(makeRequest, {
    name: circuitBreakerName,
    timeout,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
    fallback: fallbackData ? fallbacks.defaultValue(fallbackData) : undefined,
  });

  // HTTP methods
  return {
    get: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return breaker.fire({ ...config, method: 'GET', url });
    },

    post: async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => {
      return breaker.fire({ ...config, method: 'POST', url, data });
    },

    put: async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => {
      return breaker.fire({ ...config, method: 'PUT', url, data });
    },

    patch: async <T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<AxiosResponse<T>> => {
      return breaker.fire({ ...config, method: 'PATCH', url, data });
    },

    delete: async <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => {
      return breaker.fire({ ...config, method: 'DELETE', url });
    },

    breaker, // Expose breaker for monitoring
  };
}

// Pre-configured services
export const services = {
  /**
   * AI Engine Service
   */
  aiEngine: createHttpService({
    baseURL: process.env.AI_ENGINE_URL || 'http://ai-engine:3008',
    timeout: 30000, // AI operations may take longer
    circuitBreakerName: 'ai-engine',
    enableRetry: true,
    maxRetries: 2,
    fallbackData: {
      error: 'AI Engine temporarily unavailable',
      fallback: true,
    },
  }),

  /**
   * Blueprint Service
   */
  blueprint: createHttpService({
    baseURL: process.env.BLUEPRINT_SERVICE_URL || 'http://blueprint-service:3001',
    timeout: 10000,
    circuitBreakerName: 'blueprint-service',
    enableRetry: true,
    maxRetries: 3,
  }),

  /**
   * IAC Generator Service
   */
  iacGenerator: createHttpService({
    baseURL: process.env.IAC_SERVICE_URL || 'http://iac-generator:3002',
    timeout: 15000,
    circuitBreakerName: 'iac-generator',
    enableRetry: true,
    maxRetries: 3,
  }),

  /**
   * Costing Service
   */
  costing: createHttpService({
    baseURL: process.env.COSTING_SERVICE_URL || 'http://costing-service:3003',
    timeout: 10000,
    circuitBreakerName: 'costing-service',
    enableRetry: true,
    maxRetries: 3,
  }),

  /**
   * Cloud Provider Service
   */
  cloudProvider: createHttpService({
    baseURL: process.env.CLOUD_PROVIDER_SERVICE_URL || 'http://cloud-provider-service:3004',
    timeout: 15000,
    circuitBreakerName: 'cloud-provider',
    enableRetry: true,
    maxRetries: 2,
    fallbackData: {
      error: 'Cloud provider temporarily unavailable',
      fallback: true,
    },
  }),

  /**
   * Automation Engine
   */
  automation: createHttpService({
    baseURL: process.env.AUTOMATION_ENGINE_URL || 'http://automation-engine:3005',
    timeout: 20000, // Automation may take time
    circuitBreakerName: 'automation-engine',
    enableRetry: true,
    maxRetries: 2,
  }),

  /**
   * Guardrails Engine
   */
  guardrails: createHttpService({
    baseURL: process.env.GUARDRAILS_ENGINE_URL || 'http://guardrails-engine:3006',
    timeout: 10000,
    circuitBreakerName: 'guardrails-engine',
    enableRetry: true,
    maxRetries: 3,
  }),

  /**
   * Monitoring Service
   */
  monitoring: createHttpService({
    baseURL: process.env.MONITORING_SERVICE_URL || 'http://monitoring-service:3007',
    timeout: 5000,
    circuitBreakerName: 'monitoring-service',
    enableRetry: true,
    maxRetries: 2,
  }),

  /**
   * SSO Service
   */
  sso: createHttpService({
    baseURL: process.env.SSO_SERVICE_URL || 'http://sso-service:3009',
    timeout: 5000,
    circuitBreakerName: 'sso-service',
    enableRetry: true,
    maxRetries: 3,
  }),

  /**
   * CMDB Agent
   */
  cmdb: createHttpService({
    baseURL: process.env.CMDB_AGENT_URL || 'http://cmdb-agent:3010',
    timeout: 10000,
    circuitBreakerName: 'cmdb-agent',
    enableRetry: true,
    maxRetries: 3,
  }),
};

export default {
  createHttpService,
  services,
};
