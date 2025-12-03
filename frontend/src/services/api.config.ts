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
  AI_GENERATE: '/api/v1/ai/generate',
  AI_PROJECT: '/api/v1/ai/projects',
  AI_ARTIFACTS: '/api/v1/ai/artifacts',
  AI_COMPLIANCE: '/api/v1/ai/compliance',
  AI_WEBSOCKET: '/ws/ai',
  
  // Auth
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_REGISTER: '/api/v1/auth/register',
  AUTH_LOGOUT: '/api/v1/auth/logout',
};
