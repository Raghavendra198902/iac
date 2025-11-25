/**
 * API Configuration
 * Central configuration for all backend API endpoints
 */

export const API_CONFIG = {
  // Base URLs for different services
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  apiGateway: import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000',
  iacGenerator: import.meta.env.VITE_IAC_GENERATOR_URL || 'http://localhost:3002',
  blueprintService: import.meta.env.VITE_BLUEPRINT_SERVICE_URL || 'http://localhost:3003',
  costingService: import.meta.env.VITE_COSTING_SERVICE_URL || 'http://localhost:3004',
  monitoringService: import.meta.env.VITE_MONITORING_SERVICE_URL || 'http://localhost:3005',
  orchestrator: import.meta.env.VITE_ORCHESTRATOR_URL || 'http://localhost:3006',
  mlApi: import.meta.env.VITE_ML_API_URL || 'http://localhost:5000',
  
  // API endpoints
  endpoints: {
    // Authentication
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me',
    },
    
    // Projects
    projects: {
      list: '/api/projects',
      create: '/api/projects',
      getById: (id: string) => `/api/projects/${id}`,
      update: (id: string) => `/api/projects/${id}`,
      delete: (id: string) => `/api/projects/${id}`,
    },
    
    // Blueprints
    blueprints: {
      list: '/api/blueprints',
      create: '/api/blueprints',
      getById: (id: string) => `/api/blueprints/${id}`,
      update: (id: string) => `/api/blueprints/${id}`,
      delete: (id: string) => `/api/blueprints/${id}`,
      validate: '/api/blueprints/validate',
    },
    
    // IAC Generation
    iacGenerator: {
      generate: '/api/generate',
      getJob: (jobId: string) => `/api/generate/${jobId}`,
      download: (jobId: string) => `/api/generate/${jobId}/download`,
    },
    
    // Monitoring
    monitoring: {
      metrics: '/api/metrics',
      logs: '/api/logs',
      traces: '/api/traces',
      alerts: '/api/alerts',
    },
    
    // Costing
    costing: {
      estimate: '/api/cost/estimate',
      forecast: '/api/cost/forecast',
      actual: '/api/cost/actual',
    },
  },
  
  // Request timeout (ms)
  timeout: 30000,
  
  // Retry configuration
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};

/**
 * Get full URL for an endpoint
 */
export function getApiUrl(service: keyof typeof API_CONFIG, endpoint: string): string {
  const baseUrl = API_CONFIG[service] || API_CONFIG.baseURL;
  return `${baseUrl}${endpoint}`;
}

/**
 * Get authentication headers
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
