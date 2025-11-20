import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
export const TEST_CONFIG = {
  API_GATEWAY_URL: process.env.API_GATEWAY_URL || 'http://localhost:3000',
  BLUEPRINT_SERVICE_URL: process.env.BLUEPRINT_SERVICE_URL || 'http://localhost:3001',
  IAC_GENERATOR_URL: process.env.IAC_GENERATOR_URL || 'http://localhost:3002',
  GUARDRAILS_ENGINE_URL: process.env.GUARDRAILS_ENGINE_URL || 'http://localhost:3003',
  ORCHESTRATOR_URL: process.env.ORCHESTRATOR_URL || 'http://localhost:3004',
  COSTING_SERVICE_URL: process.env.COSTING_SERVICE_URL || 'http://localhost:3005',
  MONITORING_SERVICE_URL: process.env.MONITORING_SERVICE_URL || 'http://localhost:3006',
  AUTOMATION_ENGINE_URL: process.env.AUTOMATION_ENGINE_URL || 'http://localhost:3007',
  AI_ENGINE_URL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL || 'admin@iac.dharma',
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD || 'test_password_123'
};

// Test utilities
export const waitForService = async (url: string, maxAttempts = 30, interval = 1000): Promise<boolean> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${url}/health`, { timeout: 5000 });
      return true;
    } catch (error) {
      if (i === maxAttempts - 1) {
        console.error(`Service at ${url} is not ready after ${maxAttempts} attempts`);
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  return false;
};

export const waitForAllServices = async (): Promise<boolean> => {
  console.log('Waiting for all services to be ready...');
  
  const services = [
    { name: 'API Gateway', url: TEST_CONFIG.API_GATEWAY_URL },
    { name: 'Blueprint Service', url: TEST_CONFIG.BLUEPRINT_SERVICE_URL },
    { name: 'IaC Generator', url: TEST_CONFIG.IAC_GENERATOR_URL },
    { name: 'Guardrails Engine', url: TEST_CONFIG.GUARDRAILS_ENGINE_URL },
    { name: 'Orchestrator', url: TEST_CONFIG.ORCHESTRATOR_URL },
    { name: 'Costing Service', url: TEST_CONFIG.COSTING_SERVICE_URL },
    { name: 'Monitoring Service', url: TEST_CONFIG.MONITORING_SERVICE_URL },
    { name: 'Automation Engine', url: TEST_CONFIG.AUTOMATION_ENGINE_URL },
    // { name: 'AI Engine', url: TEST_CONFIG.AI_ENGINE_URL }  // Temporarily disabled - huggingface_hub import issue
  ];

  const results = await Promise.all(
    services.map(async (service) => {
      const ready = await waitForService(service.url);
      if (ready) {
        console.log(`✓ ${service.name} is ready`);
      } else {
        console.error(`✗ ${service.name} is not ready`);
      }
      return ready;
    })
  );

  return results.every(r => r === true);
};

// JWT token storage
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
};

// HTTP client with auth
export const createAuthenticatedClient = () => {
  const client = axios.create({
    baseURL: TEST_CONFIG.API_GATEWAY_URL,
    timeout: 10000
  });

  client.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

// Global setup
beforeAll(async () => {
  const allReady = await waitForAllServices();
  if (!allReady) {
    throw new Error('Not all services are ready. Please ensure all services are running.');
  }
}, 60000);

// Global teardown
afterAll(() => {
  clearAuthToken();
});
