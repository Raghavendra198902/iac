import { createAuthenticatedClient, TEST_CONFIG } from './setup';
import axios from 'axios';

describe('Blueprint Workflow Integration Tests', () => {
  let authClient: ReturnType<typeof createAuthenticatedClient>;
  let createdBlueprintId: string;

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

  describe('Blueprint Creation → IaC Generation → Deployment Workflow', () => {
    it('should create a new blueprint', async () => {
      const blueprintData = {
        name: 'Integration Test Blueprint',
        description: 'Blueprint created by integration test',
        cloudProvider: 'azure',
        environment: 'development',
        region: 'eastus',
        resources: [
          {
            type: 'Microsoft.Compute/virtualMachines',
            name: 'test-vm',
            sku: 'Standard_B2s',
            quantity: 1
          },
          {
            type: 'Microsoft.Network/virtualNetworks',
            name: 'test-vnet',
            addressSpace: '10.0.0.0/16'
          }
        ]
      };

      const response = await authClient.post('/api/blueprints', blueprintData);

      expect([200, 201]).toContain(response.status);
      expect(response.data).toHaveProperty('id');
      expect(response.data).toHaveProperty('name', blueprintData.name);
      expect(response.data).toHaveProperty('resources');

      if (response.data.id) {
        createdBlueprintId = response.data.id;
      }
    });

    it('should retrieve the created blueprint', async () => {
      if (!createdBlueprintId) {
        // Create blueprint if not exists
        const createResponse = await authClient.post('/api/blueprints', {
          name: 'Test Blueprint for Retrieval',
          cloudProvider: 'azure',
          environment: 'development',
          resources: []
        });
        
        if (createResponse.data?.id) {
          createdBlueprintId = createResponse.data.id;
        }
      }

      const response = await authClient.get(`/api/blueprints/${createdBlueprintId}`);

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('id', createdBlueprintId);
    });

    it('should run guardrails check on blueprint', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/guardrails/check', {
        blueprintId: createdBlueprintId
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('passed');
      expect(response.data).toHaveProperty('violations');
      expect(Array.isArray(response.data.violations)).toBe(true);
    });

    it('should generate IaC code from blueprint', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/iac/generate', {
        blueprintId: createdBlueprintId,
        format: 'terraform'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('code');
      expect(response.data.code).toBeTruthy();
      expect(typeof response.data.code).toBe('string');
    });

    it('should validate generated IaC code', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      // First generate code
      const generateResponse = await authClient.post('/api/iac/generate', {
        blueprintId: createdBlueprintId,
        format: 'terraform'
      });

      if (generateResponse.data?.code) {
        // Then validate it
        const validateResponse = await authClient.post('/api/iac/validate', {
          code: generateResponse.data.code,
          format: 'terraform'
        });

        expect([200]).toContain(validateResponse.status);
        expect(validateResponse.data).toHaveProperty('valid');
      }
    });

    it('should estimate cost for blueprint', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/costing/estimate', {
        blueprintId: createdBlueprintId
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('totalCost');
      expect(response.data).toHaveProperty('breakdown');
      expect(typeof response.data.totalCost).toBe('number');
    });

    it('should create deployment from blueprint', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/orchestrator/deploy', {
        blueprintId: createdBlueprintId,
        environment: 'development',
        dryRun: true // Use dry run for testing
      });

      expect([200, 201, 202]).toContain(response.status);
      expect(response.data).toHaveProperty('deploymentId');
    });
  });

  describe('Blueprint → AI Risk Assessment Workflow', () => {
    it('should assess risk for blueprint', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/ai/assess-risk', {
        blueprintId: createdBlueprintId
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('riskScore');
      expect(response.data).toHaveProperty('riskFactors');
      expect(typeof response.data.riskScore).toBe('number');
      expect(Array.isArray(response.data.riskFactors)).toBe(true);
    });

    it('should get ML recommendations for blueprint', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      const response = await authClient.post('/api/ai/recommendations', {
        blueprintId: createdBlueprintId
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('recommendations');
      expect(Array.isArray(response.data.recommendations)).toBe(true);
    });
  });

  describe('Blueprint Versioning Workflow', () => {
    it('should create new version of blueprint', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      const response = await authClient.put(`/api/blueprints/${createdBlueprintId}`, {
        name: 'Updated Blueprint Name',
        description: 'Updated description'
      });

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('version');
    });

    it('should list blueprint versions', async () => {
      if (!createdBlueprintId) {
        
        return;
      }

      const response = await authClient.get(`/api/blueprints/${createdBlueprintId}/versions`);

      expect([200]).toContain(response.status);
      expect(response.data).toHaveProperty('versions');
      expect(Array.isArray(response.data.versions)).toBe(true);
    });
  });

  describe('Error Handling in Workflow', () => {
    it('should handle invalid blueprint ID in IaC generation', async () => {
      const response = await authClient.post('/api/iac/generate', {
        blueprintId: 'invalid-blueprint-id-12345',
        format: 'terraform'
      });

      expect([404, 400]).toContain(response.status);
    });

    it('should handle missing required fields in blueprint creation', async () => {
      const response = await authClient.post('/api/blueprints', {
        // Missing required fields
        description: 'Incomplete blueprint'
      });

      expect([400, 422]).toContain(response.status);
      expect(response.data).toHaveProperty('message');
    });

    it('should handle invalid cloud provider', async () => {
      const response = await authClient.post('/api/blueprints', {
        name: 'Invalid Cloud Blueprint',
        cloudProvider: 'invalid_cloud',
        environment: 'development',
        resources: []
      });

      expect([400, 422]).toContain(response.status);
    });
  });

  describe('Cleanup', () => {
    it('should delete test blueprint', async () => {
      if (!createdBlueprintId) {
        return;
      }

      const response = await authClient.delete(`/api/blueprints/${createdBlueprintId}`);

      expect([200, 204]).toContain(response.status);
    });

    it('should verify blueprint is deleted', async () => {
      if (!createdBlueprintId) {
        return;
      }

      const response = await authClient.get(`/api/blueprints/${createdBlueprintId}`);

      expect([404]).toContain(response.status);
    });
  });
});
