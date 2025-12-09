// API Service Layer
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const RBAC_API_URL = process.env.REACT_APP_RBAC_API_URL || 'http://localhost:3050';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

// RBAC Service APIs
export const rbacService = {
  getPermissions: async (limit: number = 10) => {
    return fetchJSON<{
      success: boolean;
      count: number;
      permissions: Array<{
        id: string;
        resource: string;
        action: string;
        scope: string;
        description: string;
      }>;
    }>(`${RBAC_API_URL}/api/v1/permissions?limit=${limit}`);
  },

  checkPermission: async (resource: string, action: string, scope: string) => {
    return fetchJSON<{
      success: boolean;
      allowed: boolean;
      reason?: string;
    }>(`${RBAC_API_URL}/api/v1/permissions/check`, {
      method: 'POST',
      body: JSON.stringify({ resource, action, scope }),
    });
  },

  getStats: async () => {
    return fetchJSON<{
      success: boolean;
      stats: {
        total_permissions: number;
        resources: string[];
        actions: string[];
        scopes: string[];
      };
    }>(`${RBAC_API_URL}/api/v1/stats`);
  },
};

// Main API Service
export const apiService = {
  // Governance APIs
  governance: {
    getPolicies: async () => {
      // For now, return mock data - will integrate with backend
      return {
        total: 24,
        active: 24,
        policies: [
          { id: '1', name: 'Data Residency', status: 'active', compliance: 100 },
          { id: '2', name: 'Multi-Cloud Strategy', status: 'active', compliance: 98 },
          { id: '3', name: 'Security Standards', status: 'active', compliance: 96 },
        ],
      };
    },

    getComplianceScore: async () => {
      // Mock data - integrate with compliance service
      return {
        overall: 96,
        byCategory: {
          security: 98,
          performance: 95,
          cost: 94,
          governance: 97,
        },
      };
    },
  },

  // Architecture APIs
  architecture: {
    getPatterns: async () => {
      const perms = await rbacService.getPermissions(100);
      const architecturePerms = perms.permissions.filter(p => p.resource === 'architecture');
      
      return {
        total: 18,
        approved: 18,
        patterns: [
          { id: '1', name: 'Microservices', status: 'approved', usage: 45 },
          { id: '2', name: 'Event-Driven', status: 'approved', usage: 32 },
          { id: '3', name: 'Serverless', status: 'approved', usage: 18 },
        ],
        permissions: architecturePerms,
      };
    },

    getPendingApprovals: async () => {
      return {
        count: 7,
        approvals: [
          { id: '1', type: 'pattern', name: 'CQRS Pattern', requester: 'John Doe', date: '2025-12-09' },
          { id: '2', type: 'architecture', name: 'Payment Gateway', requester: 'Jane Smith', date: '2025-12-08' },
        ],
      };
    },
  },

  // Dashboard APIs
  dashboard: {
    getMetrics: async (role: string) => {
      const stats = await rbacService.getStats();
      
      return {
        permissions: stats.stats.total_permissions,
        resources: stats.stats.resources.length,
        role,
        timestamp: new Date().toISOString(),
      };
    },
  },

  // Project APIs
  projects: {
    getAll: async () => {
      return {
        total: 12,
        active: 9,
        projects: [
          { id: '1', name: 'Cloud Migration', status: 'active', progress: 75 },
          { id: '2', name: 'API Gateway', status: 'active', progress: 60 },
          { id: '3', name: 'Data Lake', status: 'active', progress: 40 },
        ],
      };
    },

    getById: async (id: string) => {
      return {
        id,
        name: 'Project ' + id,
        status: 'active',
        progress: 50,
        team: ['user1', 'user2'],
      };
    },
  },

  // ML/AI APIs
  ml: {
    getModels: async () => {
      return {
        total: 8,
        trained: 8,
        models: [
          { name: 'cost_predictor', accuracy: 92, status: 'trained' },
          { name: 'drift_predictor', accuracy: 94, status: 'trained' },
          { name: 'resource_optimizer', accuracy: 89, status: 'trained' },
          { name: 'performance_optimizer', accuracy: 87, status: 'trained' },
          { name: 'compliance_predictor', accuracy: 91, status: 'trained' },
          { name: 'incident_classifier', accuracy: 90, status: 'trained' },
          { name: 'root_cause_analyzer', accuracy: 87, status: 'trained' },
          { name: 'churn_predictor', accuracy: 85, status: 'trained' },
        ],
        avgAccuracy: 89.4,
      };
    },
  },
};

export default apiService;
