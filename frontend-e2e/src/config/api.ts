/**
 * API Configuration
 * Centralized configuration for backend API endpoints
 */

// Use relative URLs for nginx proxy (avoids CORS and mixed content issues)
// Nginx will proxy /api/* and /graphql to the API Gateway
export const API_BASE_URL = '';  // Empty string means relative to current origin
export const GRAPHQL_ENDPOINT = '/graphql';
export const WS_ENDPOINT = `ws${window.location.protocol === 'https:' ? 's' : ''}://${window.location.host}/graphql`;

// REST API endpoints (proxied through nginx)
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  
  // User Management
  USERS: {
    LIST: '/api/users',
    GET: (id: string) => `/api/users/${id}`,
    CREATE: '/api/users',
    UPDATE: (id: string) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
  },
  
  // Infrastructure
  INFRASTRUCTURE: {
    RESOURCES: '/api/infrastructure/resources',
    TEMPLATES: '/api/infrastructure/templates',
    GENERATOR: '/api/infrastructure/generator',
  },
  
  // Monitoring
  MONITORING: {
    HEALTH: '/api/monitoring/health',
    ALERTS: '/api/monitoring/alerts',
    PERFORMANCE: '/api/monitoring/performance',
  },
  
  // Cost Management
  COST: {
    ANALYTICS: '/api/cost/analytics',
    BUDGET: '/api/cost/budget',
    OPTIMIZATION: '/api/cost/optimization',
  },
  
  // DevOps
  DEVOPS: {
    PIPELINES: '/api/devops/pipelines',
    CONTAINERS: '/api/devops/containers',
    GIT: '/api/devops/git',
  },
  
  // AI & Automation
  AI: {
    MODELS: '/api/ai/models',
    PREDICTIONS: '/api/ai/predictions',
    AUTOMATION: '/api/ai/automation',
  },
  
  // Security
  SECURITY: {
    AUDIT: '/api/security/audit',
    COMPLIANCE: '/api/security/compliance',
    ACCESS: '/api/security/access',
  },
  
  // Reports
  REPORTS: {
    LIST: '/api/reports',
    GENERATE: '/api/reports/generate',
    EXPORT: '/api/reports/export',
    SCHEDULED: '/api/reports/scheduled',
  },
  
  // CMDB
  CMDB: {
    ASSETS: '/api/cmdb/assets',
    CONFIG_ITEMS: '/api/cmdb/config-items',
    RELATIONSHIPS: '/api/cmdb/relationships',
  },
};

// GraphQL Queries/Mutations
export const GRAPHQL_OPERATIONS = {
  // Example queries
  GET_INFRASTRUCTURE: `
    query GetInfrastructure {
      infrastructure {
        resources {
          id
          name
          type
          status
          cloud
          region
        }
      }
    }
  `,
  
  GET_COST_ANALYTICS: `
    query GetCostAnalytics($period: String!) {
      costAnalytics(period: $period) {
        totalCost
        savings
        breakdown {
          service
          cost
        }
      }
    }
  `,
};

export default {
  API_BASE_URL,
  GRAPHQL_ENDPOINT,
  WS_ENDPOINT,
  API_ENDPOINTS,
  GRAPHQL_OPERATIONS,
};
