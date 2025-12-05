import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

describe('IAC Dharma - End-to-End Integration Tests', () => {
  let authToken: string;
  let testTenantId: string;
  let testBlueprintId: string;

  beforeAll(async () => {
    // Wait for services to be ready
    await waitForServices();
  });

  describe('1. Authentication & Authorization', () => {
    it('should authenticate user and receive JWT token', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        username: 'test@example.com',
        password: 'test123'
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      authToken = response.data.token;
    });

    it('should reject invalid credentials', async () => {
      try {
        await axios.post(`${API_BASE_URL}/auth/login`, {
          username: 'invalid@example.com',
          password: 'wrong'
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should enforce rate limiting on auth endpoints', async () => {
      const promises = Array(10).fill(null).map(() =>
        axios.post(`${API_BASE_URL}/auth/login`, {
          username: 'test@example.com',
          password: 'wrong'
        }).catch(e => e.response)
      );

      const responses = await Promise.all(promises);
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('2. Blueprint Management', () => {
    it('should create a new blueprint', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/blueprints`,
        {
          name: 'Test Blueprint',
          description: 'E2E test blueprint',
          provider: 'aws',
          config: {
            region: 'us-east-1',
            resources: ['vpc', 'ec2']
          }
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      testBlueprintId = response.data.id;
    });

    it('should retrieve blueprint list with caching', async () => {
      const response1 = await axios.get(`${API_BASE_URL}/api/blueprints`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response1.status).toBe(200);
      expect(response1.headers['x-cache']).toBeDefined();

      // Second request should hit cache
      const response2 = await axios.get(`${API_BASE_URL}/api/blueprints`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response2.headers['x-cache']).toBe('HIT');
    });

    it('should retrieve specific blueprint by ID', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/blueprints/${testBlueprintId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(testBlueprintId);
    });

    it('should update blueprint and invalidate cache', async () => {
      await axios.put(
        `${API_BASE_URL}/api/blueprints/${testBlueprintId}`,
        { name: 'Updated Blueprint' },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      // Next request should miss cache
      const response = await axios.get(`${API_BASE_URL}/api/blueprints`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.headers['x-cache']).toBe('MISS');
    });
  });

  describe('3. IAC Generation', () => {
    it('should generate Terraform code', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/iac/generate`,
        {
          blueprintId: testBlueprintId,
          provider: 'aws',
          format: 'terraform'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('code');
      expect(response.data.code).toContain('terraform');
    });

    it('should generate CloudFormation template', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/iac/generate`,
        {
          blueprintId: testBlueprintId,
          provider: 'aws',
          format: 'cloudformation'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data.code).toContain('AWSTemplateFormatVersion');
    });
  });

  describe('4. Cost Estimation', () => {
    it('should estimate infrastructure costs', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/api/cost/estimate`,
        {
          blueprintId: testBlueprintId,
          provider: 'aws',
          region: 'us-east-1'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalCost');
      expect(response.data).toHaveProperty('breakdown');
      expect(typeof response.data.totalCost).toBe('number');
    });
  });

  describe('5. AI Recommendations', () => {
    it('should provide cost optimization recommendations', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/ai/recommendations/${testBlueprintId}`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      if (response.data.length > 0) {
        expect(response.data[0]).toHaveProperty('type');
        expect(response.data[0]).toHaveProperty('recommendation');
      }
    });
  });

  describe('6. Multi-Tenancy & Quotas', () => {
    it('should enforce tenant quotas', async () => {
      // Create blueprints until quota is reached
      const quota = 10; // Assuming default quota
      
      try {
        for (let i = 0; i < quota + 1; i++) {
          await axios.post(
            `${API_BASE_URL}/api/blueprints`,
            {
              name: `Quota Test ${i}`,
              description: 'Testing quota enforcement',
              provider: 'aws'
            },
            {
              headers: { Authorization: `Bearer ${authToken}` }
            }
          );
        }
        fail('Should have hit quota limit');
      } catch (error: any) {
        expect(error.response.status).toBe(429);
        expect(error.response.data.error).toBe('Quota Exceeded');
      }
    });

    it('should track tenant usage', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/api/tenants/${testTenantId}/usage`,
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('usage');
      expect(response.data.usage).toHaveProperty('blueprints');
      expect(response.data.usage).toHaveProperty('projects');
    });
  });

  describe('7. Health & Monitoring', () => {
    it('should return healthy status', async () => {
      const response = await axios.get(`${API_BASE_URL}/health/live`);
      expect(response.status).toBe(200);
    });

    it('should expose Prometheus metrics', async () => {
      const response = await axios.get(`${API_BASE_URL}/metrics`);
      expect(response.status).toBe(200);
      expect(response.data).toContain('dharma_');
    });

    it('should provide cache statistics', async () => {
      const response = await axios.get(`${API_BASE_URL}/cache/stats`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('hitRate');
      expect(response.data).toHaveProperty('keys');
    });
  });

  describe('8. Performance', () => {
    it('should respond within acceptable time limits', async () => {
      const start = Date.now();
      await axios.get(`${API_BASE_URL}/api/blueprints`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500); // P95 target
    });

    it('should handle concurrent requests', async () => {
      const promises = Array(50).fill(null).map(() =>
        axios.get(`${API_BASE_URL}/health/live`)
      );

      const results = await Promise.all(promises);
      const allSuccessful = results.every(r => r.status === 200);
      expect(allSuccessful).toBe(true);
    });
  });

  describe('9. Security', () => {
    it('should reject requests without authentication', async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/blueprints`);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should include security headers', async () => {
      const response = await axios.get(`${API_BASE_URL}/health/live`);
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
    });

    it('should sanitize SQL injection attempts', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/api/blueprints`,
          {
            name: "'; DROP TABLE blueprints; --",
            description: 'SQL injection test'
          },
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
      } catch (error: any) {
        // Should either reject or sanitize
        expect([400, 201]).toContain(error.response?.status || 201);
      }
    });
  });

  describe('10. Integration Tests', () => {
    it('should handle ServiceNow integration', async () => {
      if (!process.env.SERVICENOW_URL) {
        console.log('Skipping ServiceNow test - not configured');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/integrations/servicenow/incident`,
        {
          shortDescription: 'Test incident',
          description: 'E2E test incident creation'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect([200, 201]).toContain(response.status);
    });

    it('should handle Slack notifications', async () => {
      if (!process.env.SLACK_WEBHOOK_URL) {
        console.log('Skipping Slack test - not configured');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/integrations/slack/notify`,
        {
          message: 'E2E test notification',
          severity: 'info'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      expect(response.status).toBe(200);
    });
  });

  afterAll(async () => {
    // Cleanup test data
    if (testBlueprintId) {
      try {
        await axios.delete(
          `${API_BASE_URL}/api/blueprints/${testBlueprintId}`,
          {
            headers: { Authorization: `Bearer ${authToken}` }
          }
        );
      } catch (error) {
        console.log('Cleanup failed:', error);
      }
    }
  });
});

// Helper function to wait for services
async function waitForServices(maxRetries = 30, delay = 2000): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(`${API_BASE_URL}/health/live`, { timeout: 5000 });
      console.log('✅ Services are ready');
      return;
    } catch (error) {
      console.log(`⏳ Waiting for services... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Services failed to start in time');
}
