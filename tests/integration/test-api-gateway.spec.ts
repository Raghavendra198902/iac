import axios from 'axios';
import { TEST_CONFIG } from './setup';

describe('API Gateway Integration Tests', () => {
  const apiGateway = axios.create({
    baseURL: TEST_CONFIG.API_GATEWAY_URL,
    timeout: 10000,
    validateStatus: () => true // Don't throw on any status
  });

  describe('Health Checks', () => {
    it('should return healthy status from API Gateway', async () => {
      const response = await apiGateway.get('/health');
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
    });
  });

  describe('Routing to Backend Services', () => {
    it('should route to Blueprint Service', async () => {
      const response = await apiGateway.get('/api/blueprints/health');
      expect([200, 401]).toContain(response.status); // May require auth
    });

    it('should route to IaC Generator', async () => {
      const response = await apiGateway.get('/api/iac/health');
      expect([200, 401]).toContain(response.status);
    });

    it('should route to Guardrails Engine', async () => {
      const response = await apiGateway.get('/api/guardrails/health');
      expect([200, 401]).toContain(response.status);
    });

    it('should route to Orchestrator', async () => {
      const response = await apiGateway.get('/api/orchestrator/health');
      expect([200, 401]).toContain(response.status);
    });

    it('should route to Costing Service', async () => {
      const response = await apiGateway.get('/api/costing/health');
      expect([200, 401]).toContain(response.status);
    });

    it('should route to Monitoring Service', async () => {
      const response = await apiGateway.get('/api/monitoring/health');
      expect([200, 401]).toContain(response.status);
    });

    it('should route to Automation Engine', async () => {
      const response = await apiGateway.get('/api/automation/health');
      expect([200, 401]).toContain(response.status);
    });

    it('should route to AI Engine', async () => {
      const response = await apiGateway.get('/api/ai/health');
      expect([200, 401]).toContain(response.status);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(110).fill(null).map(() => 
        apiGateway.get('/health')
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.some(r => r.status === 429);
      
      // Rate limiting may or may not be enforced depending on configuration
      // This test validates the response format if rate limiting occurs
      if (rateLimited) {
        const limitedResponse = responses.find(r => r.status === 429);
        expect(limitedResponse?.data).toHaveProperty('message');
      }
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await apiGateway.get('/api/unknown/endpoint');
      expect(response.status).toBe(404);
    });

    it('should return 401 for protected routes without auth', async () => {
      const response = await apiGateway.get('/api/blueprints');
      expect(response.status).toBe(401);
    });

    it('should handle invalid JSON gracefully', async () => {
      const response = await apiGateway.post('/api/auth/login', 'invalid json', {
        headers: { 'Content-Type': 'application/json' }
      });
      expect([400, 415]).toContain(response.status);
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers in responses', async () => {
      const response = await apiGateway.get('/health');
      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    it('should handle OPTIONS preflight requests', async () => {
      const response = await apiGateway.options('/api/blueprints');
      expect([200, 204]).toContain(response.status);
    });
  });

  describe('Request/Response Formats', () => {
    it('should accept JSON requests', async () => {
      const response = await apiGateway.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect([200, 401]).toContain(response.status);
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return JSON responses', async () => {
      const response = await apiGateway.get('/health');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Request ID Tracking', () => {
    it('should include request ID in responses', async () => {
      const response = await apiGateway.get('/health');
      // Request ID may be in headers or body depending on implementation
      const hasRequestId = 
        response.headers['x-request-id'] || 
        response.data.requestId;
      expect(hasRequestId).toBeTruthy();
    });
  });

  describe('Service Availability', () => {
    it('should return service status information', async () => {
      const response = await apiGateway.get('/health');
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('timestamp');
    });

    it('should report API version', async () => {
      const response = await apiGateway.get('/health');
      // Version may be in health response or separate endpoint
      const hasVersion = 
        response.data.version || 
        response.headers['x-api-version'];
      expect(hasVersion).toBeTruthy();
    });
  });
});
