const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:4000';
const GRAPHQL_URL = import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql';

// Backend service URLs (direct access for specific use cases)
const AIOPS_URL = 'http://localhost:8100';
const CMDB_URL = 'http://localhost:8200';
const AI_ORCHESTRATOR_URL = 'http://localhost:8300';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WS_URL: WS_BASE_URL,
  GRAPHQL_URL: GRAPHQL_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
  // Backend services
  SERVICES: {
    AIOPS: AIOPS_URL,
    CMDB: CMDB_URL,
    AI_ORCHESTRATOR: AI_ORCHESTRATOR_URL,
  },
};

export const API_ENDPOINTS = {
  // API Gateway (primary entry point)
  GRAPHQL: '/graphql',
  HEALTH: '/health',
  
  // AIOps Engine (via API Gateway or direct)
  AIOPS_HEALTH: '/api/v3/aiops/health',
  AIOPS_PREDICT_FAILURE: '/api/v3/aiops/predict/failure',
  AIOPS_DETECT_THREAT: '/api/v3/aiops/detect/threat',
  AIOPS_FORECAST_CAPACITY: '/api/v3/aiops/forecast/capacity',
  AIOPS_DETECT_ANOMALY: '/api/v3/aiops/detect/anomaly',
  
  // CMDB Agent
  CMDB_HEALTH: '/api/v3/cmdb/health',
  CMDB_DISCOVERY: '/api/v3/cmdb/discover',
  CMDB_GRAPH_TOPOLOGY: '/api/v3/cmdb/graph/topology',
  
  // AI Orchestrator
  AI_PROJECTS: '/api/projects',
  AI_GENERATE: '/api/generate',
  AI_ARTIFACTS: '/api/artifacts',
  AI_STATUS: '/api/generate/status',
  AI_WEBSOCKET: '/ws/projects',
  AI_ORCHESTRATOR_HEALTH: '/health',
  
  // Auth (future)
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
};
