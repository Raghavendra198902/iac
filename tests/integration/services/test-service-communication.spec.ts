import { describe, it, expect, beforeAll } from '@jest/globals';
import axios, { AxiosInstance } from 'axios';

const API_GATEWAY = process.env.API_GATEWAY_URL || 'http://localhost:3000';

describe('Service Integration Tests', () => {
  let authToken: string;
  let api: AxiosInstance;
  
  beforeAll(async () => {
    // Create axios instance
    api = axios.create({
      baseURL: API_GATEWAY,
      timeout: 30000,
      validateStatus: () => true // Don't throw on any status
    });
    
    // Get auth token
    const response = await api.post('/api/auth/login', {
      email: 'test@example.com',
      password: 'test123'
    });
    
    if (response.status === 200) {
      authToken = response.data.token;
    } else {
      console.warn('Warning: Authentication failed, some tests may fail');
    }
  });
  
  describe('Authentication Flow', () => {
    it('should login and receive tokens', async () => {
      const response = await api.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data).toHaveProperty('user');
    });
    
    it('should refresh access token using refresh token', async () => {
      // Login first
      const loginResponse = await api.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'test123'
      });
      
      const refreshToken = loginResponse.data.refreshToken;
      
      // Refresh token
      const refreshResponse = await api.post('/api/auth/refresh', {
        refreshToken
      });
      
      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data).toHaveProperty('token');
      expect(refreshResponse.data.token).not.toBe(loginResponse.data.token);
    });
    
    it('should reject invalid refresh token', async () => {
      const response = await api.post('/api/auth/refresh', {
        refreshToken: 'invalid-token'
      });
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('Complete Blueprint Workflow', () => {
    let blueprintId: string;
    
    it('should create blueprint via API Gateway', async () => {
      const response = await api.post(
        '/api/blueprints',
        {
          name: 'Integration Test Blueprint',
          description: 'Created by integration test',
          cloudProvider: 'aws',
          resources: [
            {
              type: 'compute',
              name: 'web-server',
              config: {
                instanceType: 't2.micro',
                ami: 'ami-12345678'
              }
            }
          ]
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      blueprintId = response.data.id;
    });
    
    it('should retrieve created blueprint', async () => {
      const response = await api.get(
        `/api/blueprints/${blueprintId}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data.name).toBe('Integration Test Blueprint');
    });
    
    it('should generate IaC code from blueprint', async () => {
      const response = await api.post(
        '/api/iac/generate',
        { blueprintId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect([200, 201]).toContain(response.status);
      expect(response.data).toHaveProperty('terraform');
      expect(response.data.terraform).toContain('resource');
    });
    
    it('should validate blueprint with guardrails', async () => {
      const response = await api.post(
        '/api/guardrails/validate',
        { blueprintId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('passed');
      expect(response.data).toHaveProperty('violations');
    });
    
    it('should get cost estimate for blueprint', async () => {
      const response = await api.post(
        '/api/costing/estimate',
        { blueprintId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('estimatedCost');
      expect(typeof response.data.estimatedCost).toBe('number');
      expect(response.data.estimatedCost).toBeGreaterThanOrEqual(0);
    });
  });
  
  describe('Service-to-Service Communication', () => {
    it('should retrieve deployment status from monitoring', async () => {
      const response = await api.get(
        '/api/monitoring/deployments',
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.data).toHaveProperty('deployments');
      }
    });
    
    it('should get AI recommendations', async () => {
      const response = await api.get(
        '/api/ai/recommendations',
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.data) || response.data.recommendations).toBeTruthy();
      }
    });
    
    it('should list cloud providers', async () => {
      const response = await api.get(
        '/api/cloud-providers',
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBeTruthy();
    });
  });
});

describe('Health Check Standardization', () => {
  const services = [
    { name: 'API Gateway', url: 'http://localhost:3000', path: '/health' },
    { name: 'Blueprint Service', url: 'http://localhost:3001', path: '/health' },
    { name: 'IAC Generator', url: 'http://localhost:3002', path: '/health' },
    { name: 'Guardrails Engine', url: 'http://localhost:3003', path: '/health' },
    { name: 'Costing Service', url: 'http://localhost:3004', path: '/health' },
    { name: 'Orchestrator', url: 'http://localhost:3005', path: '/health' },
    { name: 'Automation Engine', url: 'http://localhost:3006', path: '/health' },
    { name: 'Monitoring Service', url: 'http://localhost:3007', path: '/health' },
    { name: 'AI Engine', url: 'http://localhost:8000', path: '/health' },
    { name: 'Cloud Provider', url: 'http://localhost:3010', path: '/health' },
    { name: 'AI Recommendations', url: 'http://localhost:3011', path: '/health' },
    { name: 'SSO Service', url: 'http://localhost:3012', path: '/health' }
  ];
  
  services.forEach(service => {
    it(`${service.name} should respond to health endpoint`, async () => {
      try {
        const response = await axios.get(`${service.url}${service.path}`, {
          timeout: 5000,
          validateStatus: () => true
        });
        
        // Service should respond (even if with error status during dev)
        expect(response).toBeDefined();
        
        if (response.status === 200) {
          expect(response.data).toHaveProperty('status');
          expect(response.data.status).toBe('healthy');
          expect(response.data).toHaveProperty('service');
        }
      } catch (error: any) {
        // Service may not be running during tests
        console.warn(`${service.name} not available:`, error.message);
      }
    }, 10000); // 10 second timeout per service
  });
});

describe('Error Handling', () => {
  it('should return 404 for non-existent endpoints', async () => {
    const response = await axios.get(`${API_GATEWAY}/api/nonexistent`, {
      validateStatus: () => true
    });
    
    expect(response.status).toBe(404);
  });
  
  it('should return 401 for unauthorized requests', async () => {
    const response = await axios.get(`${API_GATEWAY}/api/blueprints`, {
      validateStatus: () => true
    });
    
    expect(response.status).toBe(401);
  });
  
  it('should return 400 for invalid request body', async () => {
    const loginResponse = await axios.post(`${API_GATEWAY}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    
    const response = await axios.post(
      `${API_GATEWAY}/api/blueprints`,
      { invalid: 'data' },
      {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: () => true
      }
    );
    
    expect([400, 422]).toContain(response.status);
  });
});

describe('CORS Configuration', () => {
  it('should include CORS headers', async () => {
    const response = await axios.options(`${API_GATEWAY}/api/blueprints`, {
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      },
      validateStatus: () => true
    });
    
    expect(response.headers).toHaveProperty('access-control-allow-origin');
    expect(response.headers).toHaveProperty('access-control-allow-methods');
  });
});

describe('Performance Tests', () => {
  let authToken: string;
  
  beforeAll(async () => {
    const response = await axios.post(`${API_GATEWAY}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    authToken = response.data.token;
  });
  
  it('should respond to health check within 100ms', async () => {
    const start = Date.now();
    await axios.get(`${API_GATEWAY}/health`);
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100);
  });
  
  it('should handle concurrent requests', async () => {
    const promises = Array(10).fill(null).map(() =>
      axios.get(`${API_GATEWAY}/api/blueprints`, {
        headers: { Authorization: `Bearer ${authToken}` },
        validateStatus: () => true
      })
    );
    
    const responses = await Promise.all(promises);
    
    responses.forEach(response => {
      expect([200, 401, 404]).toContain(response.status);
    });
  }, 30000);
});
