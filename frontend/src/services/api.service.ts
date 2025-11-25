/**
 * API Service Layer
 * Centralized API communication with error handling and retries
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG, getApiUrl, getAuthHeaders } from '../config/api.config';

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Create axios instance with default config
 */
function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add auth token
  client.interceptors.request.use(
    (config) => {
      const authHeaders = getAuthHeaders();
      config.headers = { ...config.headers, ...authHeaders };
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle errors
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        
        // Handle 401 - Unauthorized (token expired)
        if (status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new ApiError('Session expired. Please login again.', 401, 'UNAUTHORIZED');
        }

        // Handle other errors
        const errorData = data as any;
        throw new ApiError(
          errorData?.message || errorData?.error || 'API request failed',
          status,
          errorData?.code,
          errorData
        );
      } else if (error.request) {
        // Request made but no response
        throw new ApiError('No response from server. Please check your connection.', undefined, 'NO_RESPONSE');
      } else {
        // Error in request setup
        throw new ApiError(error.message || 'Failed to make request', undefined, 'REQUEST_ERROR');
      }
    }
  );

  return client;
}

/**
 * API clients for different services
 */
export const apiClients = {
  gateway: createApiClient(API_CONFIG.apiGateway),
  iacGenerator: createApiClient(API_CONFIG.iacGenerator),
  blueprintService: createApiClient(API_CONFIG.blueprintService),
  costingService: createApiClient(API_CONFIG.costingService),
  monitoringService: createApiClient(API_CONFIG.monitoringService),
  orchestrator: createApiClient(API_CONFIG.orchestrator),
};

/**
 * Generic API request with retry logic
 */
export async function apiRequest<T>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  retryCount = 0
): Promise<T> {
  try {
    const response = await client.request<T>(config);
    return response.data;
  } catch (error) {
    // Retry logic for network errors
    if (
      error instanceof ApiError &&
      error.code === 'NO_RESPONSE' &&
      retryCount < API_CONFIG.retry.maxRetries
    ) {
      await new Promise(resolve => 
        setTimeout(resolve, API_CONFIG.retry.retryDelay * (retryCount + 1))
      );
      return apiRequest<T>(client, config, retryCount + 1);
    }
    throw error;
  }
}

/**
 * Authentication API
 */
export const authApi = {
  async login(email: string, password: string) {
    return apiRequest(apiClients.gateway, {
      method: 'POST',
      url: API_CONFIG.endpoints.auth.login,
      data: { email, password },
    });
  },

  async logout() {
    return apiRequest(apiClients.gateway, {
      method: 'POST',
      url: API_CONFIG.endpoints.auth.logout,
    });
  },

  async refreshToken() {
    return apiRequest(apiClients.gateway, {
      method: 'POST',
      url: API_CONFIG.endpoints.auth.refresh,
    });
  },

  async getMe() {
    return apiRequest(apiClients.gateway, {
      method: 'GET',
      url: API_CONFIG.endpoints.auth.me,
    });
  },
};

/**
 * Projects API
 */
export const projectsApi = {
  async list(filters?: any) {
    return apiRequest(apiClients.gateway, {
      method: 'GET',
      url: API_CONFIG.endpoints.projects.list,
      params: filters,
    });
  },

  async create(projectData: any) {
    return apiRequest(apiClients.gateway, {
      method: 'POST',
      url: API_CONFIG.endpoints.projects.create,
      data: projectData,
    });
  },

  async getById(id: string) {
    return apiRequest(apiClients.gateway, {
      method: 'GET',
      url: API_CONFIG.endpoints.projects.getById(id),
    });
  },

  async update(id: string, projectData: any) {
    return apiRequest(apiClients.gateway, {
      method: 'PUT',
      url: API_CONFIG.endpoints.projects.update(id),
      data: projectData,
    });
  },

  async delete(id: string) {
    return apiRequest(apiClients.gateway, {
      method: 'DELETE',
      url: API_CONFIG.endpoints.projects.delete(id),
    });
  },
};

/**
 * Blueprints API
 */
export const blueprintsApi = {
  async list(filters?: any) {
    return apiRequest(apiClients.blueprintService, {
      method: 'GET',
      url: API_CONFIG.endpoints.blueprints.list,
      params: filters,
    });
  },

  async create(blueprintData: any) {
    return apiRequest(apiClients.blueprintService, {
      method: 'POST',
      url: API_CONFIG.endpoints.blueprints.create,
      data: blueprintData,
    });
  },

  async getById(id: string) {
    return apiRequest(apiClients.blueprintService, {
      method: 'GET',
      url: API_CONFIG.endpoints.blueprints.getById(id),
    });
  },

  async validate(blueprintData: any) {
    return apiRequest(apiClients.blueprintService, {
      method: 'POST',
      url: API_CONFIG.endpoints.blueprints.validate,
      data: blueprintData,
    });
  },
};

/**
 * IAC Generator API
 */
export const iacGeneratorApi = {
  async generate(blueprintId: string, targetFormat: 'terraform' | 'bicep' | 'cloudformation', options?: any) {
    return apiRequest<{ jobId: string; status: string; message: string }>(
      apiClients.iacGenerator,
      {
        method: 'POST',
        url: API_CONFIG.endpoints.iacGenerator.generate,
        data: { blueprintId, targetFormat, options },
      }
    );
  },

  async getJobStatus(jobId: string) {
    return apiRequest(apiClients.iacGenerator, {
      method: 'GET',
      url: API_CONFIG.endpoints.iacGenerator.getJob(jobId),
    });
  },

  async downloadCode(jobId: string) {
    const response = await apiClients.iacGenerator.get(
      API_CONFIG.endpoints.iacGenerator.download(jobId),
      { responseType: 'blob' }
    );
    return response.data;
  },
};

/**
 * Monitoring API
 */
export const monitoringApi = {
  async getMetrics(filters?: any) {
    return apiRequest(apiClients.monitoringService, {
      method: 'GET',
      url: API_CONFIG.endpoints.monitoring.metrics,
      params: filters,
    });
  },

  async getLogs(filters?: any) {
    return apiRequest(apiClients.monitoringService, {
      method: 'GET',
      url: API_CONFIG.endpoints.monitoring.logs,
      params: filters,
    });
  },

  async getAlerts(filters?: any) {
    return apiRequest(apiClients.monitoringService, {
      method: 'GET',
      url: API_CONFIG.endpoints.monitoring.alerts,
      params: filters,
    });
  },
};

/**
 * Costing API
 */
export const costingApi = {
  async getEstimate(blueprintId: string) {
    return apiRequest(apiClients.costingService, {
      method: 'POST',
      url: API_CONFIG.endpoints.costing.estimate,
      data: { blueprintId },
    });
  },

  async getForecast(filters?: any) {
    return apiRequest(apiClients.costingService, {
      method: 'GET',
      url: API_CONFIG.endpoints.costing.forecast,
      params: filters,
    });
  },

  async getActual(filters?: any) {
    return apiRequest(apiClients.costingService, {
      method: 'GET',
      url: API_CONFIG.endpoints.costing.actual,
      params: filters,
    });
  },
};

/**
 * ML API Client
 */
const mlApiClient = createApiClient(API_CONFIG.mlApi || 'http://localhost:5000');

/**
 * ML API - Cost Forecasting, Anomaly Detection, AI Recommendations
 */
export const mlApi = {
  /**
   * Cost Forecasting
   */
  async forecastCost(historicalData: any[], forecastDays: number = 30) {
    return apiRequest(mlApiClient, {
      method: 'POST',
      url: '/api/forecast',
      data: { historical_data: historicalData, forecast_days: forecastDays },
    });
  },

  /**
   * Anomaly Detection
   */
  async detectAnomalies(metrics: any[], method: 'isolation_forest' | 'z_score' | 'iqr' = 'isolation_forest') {
    return apiRequest(mlApiClient, {
      method: 'POST',
      url: '/api/detect-anomalies',
      data: { metrics, method },
    });
  },

  /**
   * AI Recommendations
   */
  async getAllRecommendations(resourceData: {
    resource_metrics?: any[];
    security_audits?: any[];
    performance_metrics?: any[];
  }) {
    return apiRequest(mlApiClient, {
      method: 'POST',
      url: '/api/recommendations',
      data: resourceData,
    });
  },

  async getCostRecommendations(resourceMetrics: any[]) {
    return apiRequest(mlApiClient, {
      method: 'POST',
      url: '/api/recommendations/cost',
      data: { resource_metrics: resourceMetrics },
    });
  },

  async getSecurityRecommendations(securityAudits: any[]) {
    return apiRequest(mlApiClient, {
      method: 'POST',
      url: '/api/recommendations/security',
      data: { security_audits: securityAudits },
    });
  },

  async getPerformanceRecommendations(performanceMetrics: any[]) {
    return apiRequest(mlApiClient, {
      method: 'POST',
      url: '/api/recommendations/performance',
      data: { performance_metrics: performanceMetrics },
    });
  },

  /**
   * Model Training
   */
  async trainCostModel(historicalData: any[]) {
    return apiRequest(mlApiClient, {
      method: 'POST',
      url: '/api/models/train/cost',
      data: { historical_data: historicalData },
    });
  },

  async trainAnomalyModel(baselineData: any[]) {
    return apiRequest(mlApiClient, {
      method: 'POST',
      url: '/api/models/train/anomaly',
      data: { baseline_data: baselineData },
    });
  },

  /**
   * Model Status
   */
  async getModelStatus() {
    return apiRequest(mlApiClient, {
      method: 'GET',
      url: '/api/models/status',
    });
  },

  /**
   * Health Check
   */
  async healthCheck() {
    return apiRequest(mlApiClient, {
      method: 'GET',
      url: '/health',
    });
  },
};
