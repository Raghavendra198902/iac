import apiClient from '../lib/apiClient';
import type {
  Blueprint,
  CreateBlueprintRequest,
  NLPBlueprintRequest,
  BlueprintFromNLP,
  RiskAssessment,
  RiskAssessmentRequest,
  RecommendationsResponse,
  CostEstimate,
  Deployment,
  DriftDetection,
  Pattern,
  IntentAnalysis,
  LoginRequest,
  LoginResponse,
  User,
} from '../types';

// Auth API
export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post('/api/auth/login', data);
  },
  
  logout: async (): Promise<void> => {
    return apiClient.post('/api/auth/logout');
  },
  
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get('/api/auth/me');
  },
};

// Blueprint API
export const blueprintApi = {
  list: async (params?: { environment?: string; cloud?: string }): Promise<Blueprint[]> => {
    return apiClient.get('/api/blueprints', { params });
  },
  
  get: async (id: string): Promise<Blueprint> => {
    return apiClient.get(`/api/blueprints/${id}`);
  },
  
  create: async (data: CreateBlueprintRequest): Promise<Blueprint> => {
    return apiClient.post('/api/blueprints', data);
  },
  
  update: async (id: string, data: Partial<CreateBlueprintRequest>): Promise<Blueprint> => {
    return apiClient.put(`/api/blueprints/${id}`, data);
  },
  
  delete: async (id: string): Promise<void> => {
    return apiClient.delete(`/api/blueprints/${id}`);
  },
  
  getVersions: async (id: string): Promise<Blueprint[]> => {
    return apiClient.get(`/api/blueprints/${id}/versions`);
  },
};

// AI Engine API
export const aiApi = {
  generateBlueprint: async (data: NLPBlueprintRequest): Promise<BlueprintFromNLP> => {
    return apiClient.post('/api/ai/nlp/blueprint', data);
  },
  
  assessRisk: async (data: RiskAssessmentRequest): Promise<RiskAssessment> => {
    return apiClient.post('/api/ai/risk/assess', data);
  },
  
  getRecommendations: async (params: {
    blueprintId?: string;
    deploymentId?: string;
    type?: string;
  }): Promise<RecommendationsResponse> => {
    return apiClient.post('/api/ai/recommendations', params);
  },
  
  detectPatterns: async (data: {
    blueprintIds?: string[];
    deploymentIds?: string[];
    patternType?: string;
  }): Promise<{ patterns: Pattern[]; totalCount: number }> => {
    return apiClient.post('/api/ai/patterns/detect', data);
  },
  
  analyzeIntent: async (text: string): Promise<IntentAnalysis> => {
    return apiClient.post('/api/ai/intent/analyze', { text });
  },
};

// IaC Generator API
export const iacApi = {
  generate: async (blueprintId: string, format: 'terraform' | 'bicep' | 'cloudformation'): Promise<{
    code: string;
    files: Array<{ path: string; content: string }>;
  }> => {
    return apiClient.post('/api/iac/generate', { blueprintId, format });
  },
  
  validate: async (code: string, format: string): Promise<{
    valid: boolean;
    errors: string[];
  }> => {
    return apiClient.post('/api/iac/validate', { code, format });
  },
};

// Guardrails API
export const guardrailsApi = {
  check: async (blueprintId: string): Promise<{
    passed: boolean;
    violations: Array<{
      policy: string;
      severity: string;
      message: string;
      remediation?: string;
    }>;
  }> => {
    return apiClient.post('/api/guardrails/check', { blueprintId });
  },
  
  getPolicies: async (): Promise<Array<{
    id: string;
    name: string;
    category: string;
    enabled: boolean;
  }>> => {
    return apiClient.get('/api/guardrails/policies');
  },
};

// Orchestrator API
export const orchestratorApi = {
  deploy: async (blueprintId: string, options?: {
    environment?: string;
    dryRun?: boolean;
  }): Promise<Deployment> => {
    return apiClient.post('/api/orchestrator/deploy', { blueprintId, ...options });
  },
  
  getDeployment: async (id: string): Promise<Deployment> => {
    return apiClient.get(`/api/orchestrator/deployments/${id}`);
  },
  
  listDeployments: async (params?: {
    blueprintId?: string;
    status?: string;
  }): Promise<Deployment[]> => {
    return apiClient.get('/api/orchestrator/deployments', { params });
  },
  
  rollback: async (deploymentId: string): Promise<Deployment> => {
    return apiClient.post(`/api/orchestrator/deployments/${deploymentId}/rollback`);
  },
  
  getLogs: async (deploymentId: string): Promise<{
    logs: Array<{
      timestamp: string;
      level: string;
      message: string;
    }>;
  }> => {
    return apiClient.get(`/api/orchestrator/deployments/${deploymentId}/logs`);
  },
};

// Costing API
export const costingApi = {
  estimate: async (blueprintId: string): Promise<CostEstimate> => {
    return apiClient.post('/api/costing/estimate', { blueprintId });
  },
  
  getTCO: async (blueprintId: string, months: number = 36): Promise<{
    totalCost: number;
    breakdown: Array<{
      period: string;
      cost: number;
    }>;
  }> => {
    return apiClient.get(`/api/costing/tco/${blueprintId}`, { params: { months } });
  },
  
  getOptimizations: async (deploymentId: string): Promise<{
    currentCost: number;
    optimizedCost: number;
    savings: number;
    recommendations: Array<{
      type: string;
      description: string;
      savings: number;
    }>;
  }> => {
    return apiClient.get(`/api/costing/optimizations/${deploymentId}`);
  },
  
  getBudgetAlerts: async (): Promise<Array<{
    id: string;
    message: string;
    severity: string;
    currentSpend: number;
    budgetLimit: number;
  }>> => {
    return apiClient.get('/api/costing/budget/alerts');
  },
};

// Monitoring API
export const monitoringApi = {
  detectDrift: async (deploymentId: string): Promise<DriftDetection> => {
    return apiClient.post('/api/monitoring/drift/detect', { deploymentId });
  },
  
  getHealth: async (deploymentId: string): Promise<{
    status: string;
    checks: Array<{
      name: string;
      status: string;
      message?: string;
    }>;
  }> => {
    return apiClient.get(`/api/monitoring/health/${deploymentId}`);
  },
  
  getMetrics: async (deploymentId: string, timeRange?: string): Promise<{
    metrics: Array<{
      name: string;
      value: number;
      unit: string;
      timestamp: string;
    }>;
  }> => {
    return apiClient.get(`/api/monitoring/metrics/${deploymentId}`, {
      params: { timeRange },
    });
  },
};

// Automation API
export const automationApi = {
  getWorkflowStatus: async (blueprintId: string): Promise<{
    status: string;
    currentStep: string;
    steps: Array<{
      name: string;
      status: string;
      completedAt?: string;
    }>;
  }> => {
    return apiClient.get(`/api/automation/workflow/${blueprintId}`);
  },
  
  approveDeployment: async (blueprintId: string): Promise<void> => {
    return apiClient.post(`/api/automation/approve/${blueprintId}`);
  },
  
  rejectDeployment: async (blueprintId: string, reason: string): Promise<void> => {
    return apiClient.post(`/api/automation/reject/${blueprintId}`, { reason });
  },
};
