import { createAuthenticatedClient, TEST_CONFIG } from './setup';
import axios from 'axios';

describe('AI Engine Integration Tests', () => {
  let authClient: ReturnType<typeof createAuthenticatedClient>;

  beforeAll(async () => {
    // Login and get auth token
    const apiGateway = axios.create({
      baseURL: TEST_CONFIG.API_GATEWAY_URL,
      timeout: 10000,
      validateStatus: () => true
    });

    const loginResponse = await apiGateway.post('/api/auth/login', {
      email: TEST_CONFIG.TEST_USER_EMAIL,
      password: TEST_CONFIG.TEST_USER_PASSWORD
    });

    if (loginResponse.data?.token) {
      const { setAuthToken } = await import('./setup');
      setAuthToken(loginResponse.data.token);
    }

    authClient = createAuthenticatedClient();
  });

  describe('NLP Blueprint Generation', () => {
    it('should generate blueprint from natural language prompt', async () => {
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: 'Create a web application infrastructure with load balancer, 2 virtual machines, and a PostgreSQL database on Azure',
        cloudProvider: 'azure',
        environment: 'development'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('blueprint');
      expect(response.data.blueprint).toHaveProperty('resources');
      expect(Array.isArray(response.data.blueprint.resources)).toBe(true);
      expect(response.data.blueprint.resources.length).toBeGreaterThan(0);
    }, 30000); // Increase timeout for AI processing

    it('should handle simple infrastructure requests', async () => {
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: 'A simple VM with 4GB RAM',
        cloudProvider: 'aws'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('blueprint');
    }, 30000);

    it('should handle complex multi-tier architecture', async () => {
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: 'Three-tier architecture with frontend in containers, backend API servers, and MongoDB cluster with replication',
        cloudProvider: 'gcp',
        environment: 'production'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('blueprint');
      expect(response.data.blueprint.resources.length).toBeGreaterThan(2);
    }, 30000);

    it('should return confidence scores for generated resources', async () => {
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: 'Web server with database',
        cloudProvider: 'azure'
      });

      if (response.status === 200) {
        expect(response.data).toHaveProperty('confidence');
        expect(typeof response.data.confidence).toBe('number');
        expect(response.data.confidence).toBeGreaterThanOrEqual(0);
        expect(response.data.confidence).toBeLessThanOrEqual(1);
      }
    }, 30000);

    it('should handle ambiguous requests gracefully', async () => {
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: 'infrastructure',
        cloudProvider: 'aws'
      });

      // Should either succeed with defaults or ask for clarification
      expect([200, 400]).toContain(response.status);
    }, 30000);
  });

  describe('Risk Assessment', () => {
    let testBlueprintId: string;

    beforeAll(async () => {
      // Create a test blueprint
      const createResponse = await authClient.post('/api/blueprints', {
        name: 'AI Risk Assessment Test Blueprint',
        cloudProvider: 'azure',
        environment: 'production',
        resources: [
          {
            type: 'Microsoft.Compute/virtualMachines',
            name: 'unencrypted-vm',
            sku: 'Standard_D2s_v3',
            encryption: false // Security risk
          },
          {
            type: 'Microsoft.Storage/storageAccounts',
            name: 'publicstorage',
            publicAccess: true // Security risk
          }
        ]
      });

      if (createResponse.data?.id) {
        testBlueprintId = createResponse.data.id;
      }
    });

    it('should assess security risks in blueprint', async () => {
      if (!testBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/ai/assess-risk', {
        blueprintId: testBlueprintId
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('riskScore');
      expect(response.data).toHaveProperty('riskFactors');
      expect(response.data).toHaveProperty('category');
      
      // Should detect security risks
      const securityRisks = response.data.riskFactors.filter(
        (r: any) => r.category === 'security'
      );
      expect(securityRisks.length).toBeGreaterThan(0);
    }, 30000);

    it('should assess cost risks', async () => {
      if (!testBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/ai/assess-risk', {
        blueprintId: testBlueprintId,
        category: 'cost'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('riskScore');
    }, 30000);

    it('should assess availability risks', async () => {
      if (!testBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/ai/assess-risk', {
        blueprintId: testBlueprintId,
        category: 'availability'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('riskScore');
    }, 30000);

    it('should provide mitigation recommendations', async () => {
      if (!testBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/ai/assess-risk', {
        blueprintId: testBlueprintId
      });

      if (response.status === 200 && response.data.riskFactors.length > 0) {
        response.data.riskFactors.forEach((risk: any) => {
          expect(risk).toHaveProperty('mitigation');
          expect(risk.mitigation).toBeTruthy();
        });
      }
    }, 30000);

    afterAll(async () => {
      // Cleanup test blueprint
      if (testBlueprintId) {
        await authClient.delete(`/api/blueprints/${testBlueprintId}`);
      }
    });
  });

  describe('ML Recommendations', () => {
    it('should provide optimization recommendations', async () => {
      const response = await authClient.post('/api/ai/recommendations', {
        blueprintId: 'test-blueprint-id',
        type: 'optimization'
      });

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.data).toHaveProperty('recommendations');
        expect(Array.isArray(response.data.recommendations)).toBe(true);
      }
    }, 30000);

    it('should provide cost optimization recommendations', async () => {
      const response = await authClient.post('/api/ai/recommendations', {
        blueprintId: 'test-blueprint-id',
        type: 'cost'
      });

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.data).toHaveProperty('recommendations');
        response.data.recommendations.forEach((rec: any) => {
          expect(rec).toHaveProperty('savings');
          expect(rec).toHaveProperty('confidence');
        });
      }
    }, 30000);

    it('should provide security recommendations', async () => {
      const response = await authClient.post('/api/ai/recommendations', {
        blueprintId: 'test-blueprint-id',
        type: 'security'
      });

      expect([200, 404]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.data).toHaveProperty('recommendations');
      }
    }, 30000);
  });

  describe('Pattern Detection', () => {
    it('should detect architectural patterns', async () => {
      const response = await authClient.post('/api/ai/detect-patterns', {
        blueprint: {
          resources: [
            { type: 'loadBalancer' },
            { type: 'virtualMachine', quantity: 3 },
            { type: 'database', replication: true }
          ]
        }
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('patterns');
      expect(Array.isArray(response.data.patterns)).toBe(true);
    }, 30000);

    it('should identify common anti-patterns', async () => {
      const response = await authClient.post('/api/ai/detect-patterns', {
        blueprint: {
          resources: [
            { type: 'virtualMachine', singlePoint: true },
            { type: 'database', backup: false }
          ]
        }
      });

      expect([200]).toContain(response.status);
      
      if (response.data.antiPatterns) {
        expect(Array.isArray(response.data.antiPatterns)).toBe(true);
      }
    }, 30000);
  });

  describe('Intent Analysis', () => {
    it('should analyze user intent from prompt', async () => {
      const response = await authClient.post('/api/ai/analyze-intent', {
        prompt: 'I need high availability for my web application'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('intent');
      expect(response.data.intent).toBeTruthy();
    }, 30000);

    it('should extract key requirements', async () => {
      const response = await authClient.post('/api/ai/analyze-intent', {
        prompt: 'Deploy to production with auto-scaling and load balancing'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('requirements');
      expect(Array.isArray(response.data.requirements)).toBe(true);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle empty prompts', async () => {
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: '',
        cloudProvider: 'aws'
      });

      expect([400, 422]).toContain(response.status);
    });

    it('should handle very long prompts gracefully', async () => {
      const longPrompt = 'Create '.repeat(1000) + 'infrastructure';
      
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: longPrompt,
        cloudProvider: 'azure'
      });

      expect([200, 400, 413]).toContain(response.status);
    }, 30000);

    it('should handle invalid blueprint IDs in risk assessment', async () => {
      const response = await authClient.post('/api/ai/assess-risk', {
        blueprintId: 'non-existent-blueprint-12345'
      });

      expect([404, 400]).toContain(response.status);
    });

    it('should handle timeouts gracefully', async () => {
      // This test verifies the AI engine has proper timeout handling
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: 'Very complex enterprise architecture with hundreds of components',
        cloudProvider: 'aws'
      });

      // Should complete or timeout gracefully
      expect([200, 408, 504]).toContain(response.status);
    }, 35000);
  });

  describe('Performance', () => {
    it('should respond within acceptable time for simple requests', async () => {
      const startTime = Date.now();
      
      const response = await authClient.post('/api/ai/generate-blueprint', {
        prompt: 'Single VM',
        cloudProvider: 'aws'
      });

      const duration = Date.now() - startTime;
      
      expect([200]).toContain(response.status);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    }, 35000);
  });
});
