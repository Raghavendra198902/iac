const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WS_URL: WS_BASE_URL,
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // AI Orchestrator
  AI_PROJECTS: '/api/projects',
  AI_GENERATE: '/api/generate',
  AI_ARTIFACTS: '/api/artifacts',
  AI_STATUS: '/api/generate/status',
  AI_WEBSOCKET: '/ws/projects',
  
  // Health
  HEALTH: '/health',
  
  // Auth (future)
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
};
