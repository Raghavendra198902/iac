import axios from 'axios';
import { describe, it, expect, beforeAll } from '@jest/globals';

/**
 * Integration tests for service-to-service communication
 * 
 * Tests verify that:
 * 1. All services are reachable
 * 2. Authentication flow works end-to-end
 * 3. Service endpoints return expected responses
 * 4. Blueprint → IaC → Validation → Deploy workflow completes
 */

const API_GATEWAY = process.env.API_GATEWAY_URL || 'http://localhost:3000';
const TEST_TIMEOUT = 30000; // 30 seconds

describe('Service Health Checks', () => {
  const services = [
    { name: 'API Gateway', url: 'http://localhost:3000', endpoint: '/health' },
    { name: 'Blueprint Service', url: 'http://localhost:3001', endpoint: '/health' },
    { name: 'IAC Generator', url: 'http://localhost:3002', endpoint: '/health' },
    { name: 'Guardrails Engine', url: 'http://localhost:3003', endpoint: '/health' },
    { name: 'Costing Service', url: 'http://localhost:3004', endpoint: '/health' },
    { name: 'Orchestrator', url: 'http://localhost:3005', endpoint: '/health' },
    { name: 'Automation Engine', url: 'http://localhost:3006', endpoint: '/health' },
    { name: 'Monitoring Service', url: 'http://localhost:3007', endpoint: '/health' },
    { name: 'Cloud Provider', url: 'http://localhost:3010', endpoint: '/health' },
    { name: 'AI Recommendations', url: 'http://localhost:3011', endpoint: '/health' },
    { name: 'SSO Service', url: 'http://localhost:3012', endpoint: '/health' },
    { name: 'AI Engine', url: 'http://localhost:8000', endpoint: '/health' }
  ];
  
  services.forEach(service => {
    it(`${service.name} should be healthy and responsive`, async () => {
      try {
        const response = await axios.get(`${service.url}${service.endpoint}`, {
          timeout: 5000
        });
        
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status');
        expect(response.data.status).toMatch(/healthy|ok/i);
      } catch (error: any) {
        throw new Error(`${service.name} health check failed: ${error.message}`);
      }
    }, TEST_TIMEOUT);
  });
});

describe('Authentication Flow', () => {
  let authToken: string;
  let refreshToken: string;
  
  it('should login successfully and return access & refresh tokens', async () => {
    const response = await axios.post(`${API_GATEWAY}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
    expect(response.data).toHaveProperty('refreshToken');
    expect(response.data).toHaveProperty('user');
    expect(response.data.user).toHaveProperty('email', 'test@example.com');
    
    authToken = response.data.token;
    refreshToken = response.data.refreshToken;
  }, TEST_TIMEOUT);
  
  it('should refresh access token using refresh token', async () => {
    // Wait a second to ensure token timestamp difference
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await axios.post(`${API_GATEWAY}/api/auth/refresh`, {
      refreshToken
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('token');
    expect(response.data).toHaveProperty('expiresIn');
    expect(response.data.token).not.toBe(authToken); // Should be a new token
  }, TEST_TIMEOUT);
  
  it('should reject invalid refresh token', async () => {
    try {
      await axios.post(`${API_GATEWAY}/api/auth/refresh`, {
        refreshToken: 'invalid-token-12345'
      });
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
      expect(error.response.data).toHaveProperty('error');
    }
  }, TEST_TIMEOUT);
});

describe('Blueprint to Deployment Workflow', () => {
  let authToken: string;
  let blueprintId: string;
  let iacCode: string;
  let deploymentId: string;
  
  beforeAll(async () => {
    // Get auth token
    const authResponse = await axios.post(`${API_GATEWAY}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    authToken = authResponse.data.token;
  });
  
  it('should create a blueprint via API Gateway', async () => {
    const response = await axios.post(
      `${API_GATEWAY}/api/blueprints`,
      {
        name: 'Integration Test Blueprint',
        description: 'Automated integration test',
        cloudProvider: 'aws',
        region: 'us-east-1',
        resources: [
          {
            type: 'compute',
            name: 'test-ec2',
            properties: {
              instanceType: 't3.micro',
              ami: 'ami-12345'
            }
          }
        ]
      },
      { 
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 10000
      }
    );
    
    expect(response.status).toBe(201);
    expect(response.data).toHaveProperty('id');
    expect(response.data).toHaveProperty('name', 'Integration Test Blueprint');
    
    blueprintId = response.data.id;
  }, TEST_TIMEOUT);
  
  it('should retrieve the created blueprint', async () => {
    const response = await axios.get(
      `${API_GATEWAY}/api/blueprints/${blueprintId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', blueprintId);
    expect(response.data).toHaveProperty('name', 'Integration Test Blueprint');
  }, TEST_TIMEOUT);
  
  it('should generate IaC code from blueprint', async () => {
    const response = await axios.post(
      `${API_GATEWAY}/api/iac/generate`,
      { blueprintId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('terraform');
    expect(typeof response.data.terraform).toBe('string');
    expect(response.data.terraform.length).toBeGreaterThan(0);
    
    iacCode = response.data.terraform;
  }, TEST_TIMEOUT);
  
  it('should validate IaC code with guardrails engine', async () => {
    const response = await axios.post(
      `${API_GATEWAY}/api/guardrails/validate`,
      { 
        blueprintId,
        code: iacCode,
        cloudProvider: 'aws'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('passed');
    expect(response.data).toHaveProperty('violations');
    expect(Array.isArray(response.data.violations)).toBe(true);
  }, TEST_TIMEOUT);
  
  it('should estimate cost for the blueprint', async () => {
    const response = await axios.post(
      `${API_GATEWAY}/api/costing/estimate`,
      { blueprintId },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('estimatedCost');
    expect(typeof response.data.estimatedCost).toBe('number');
    expect(response.data.estimatedCost).toBeGreaterThanOrEqual(0);
  }, TEST_TIMEOUT);
  
  it('should initiate deployment via orchestrator', async () => {
    const response = await axios.post(
      `${API_GATEWAY}/api/orchestrator/deploy`,
      { 
        blueprintId,
        environment: 'test',
        autoApprove: true
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('deploymentId');
    expect(response.data).toHaveProperty('status');
    
    deploymentId = response.data.deploymentId;
  }, TEST_TIMEOUT);
  
  it('should retrieve deployment status', async () => {
    const response = await axios.get(
      `${API_GATEWAY}/api/orchestrator/deployments/${deploymentId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id', deploymentId);
    expect(response.data).toHaveProperty('status');
    expect(['pending', 'in_progress', 'completed', 'failed']).toContain(response.data.status);
  }, TEST_TIMEOUT);
});

describe('Monitoring and AI Services', () => {
  let authToken: string;
  
  beforeAll(async () => {
    const authResponse = await axios.post(`${API_GATEWAY}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    authToken = authResponse.data.token;
  });
  
  it('should retrieve deployments from monitoring service', async () => {
    const response = await axios.get(
      `${API_GATEWAY}/api/monitoring/deployments`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('deployments');
    expect(Array.isArray(response.data.deployments)).toBe(true);
  }, TEST_TIMEOUT);
  
  it('should get AI cost optimization recommendations', async () => {
    const response = await axios.get(
      `${API_GATEWAY}/api/ai/recommendations`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  }, TEST_TIMEOUT);
  
  it('should retrieve cloud provider information', async () => {
    const response = await axios.get(
      `${API_GATEWAY}/api/cloud-providers`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  }, TEST_TIMEOUT);
});

describe('CORS Configuration', () => {
  it('should handle preflight OPTIONS request', async () => {
    const response = await axios.options(
      `${API_GATEWAY}/api/blueprints`,
      {
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      }
    );
    
    expect(response.status).toBe(204);
    expect(response.headers).toHaveProperty('access-control-allow-origin');
    expect(response.headers).toHaveProperty('access-control-allow-methods');
  }, TEST_TIMEOUT);
  
  it('should include CORS headers in API responses', async () => {
    const response = await axios.get(
      `${API_GATEWAY}/health`,
      { headers: { 'Origin': 'http://localhost:5173' } }
    );
    
    expect(response.headers).toHaveProperty('access-control-allow-origin');
  }, TEST_TIMEOUT);
});

describe('Error Handling', () => {
  let authToken: string;
  
  beforeAll(async () => {
    const authResponse = await axios.post(`${API_GATEWAY}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    authToken = authResponse.data.token;
  });
  
  it('should return 404 for non-existent blueprint', async () => {
    try {
      await axios.get(
        `${API_GATEWAY}/api/blueprints/non-existent-id-12345`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.response.status).toBe(404);
      expect(error.response.data).toHaveProperty('error');
    }
  }, TEST_TIMEOUT);
  
  it('should return 401 for requests without auth token', async () => {
    try {
      await axios.get(`${API_GATEWAY}/api/blueprints`);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  }, TEST_TIMEOUT);
  
  it('should return 400 for invalid request body', async () => {
    try {
      await axios.post(
        `${API_GATEWAY}/api/blueprints`,
        { invalid: 'data' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      fail('Should have thrown an error');
    } catch (error: any) {
      expect([400, 422]).toContain(error.response.status);
    }
  }, TEST_TIMEOUT);
});
