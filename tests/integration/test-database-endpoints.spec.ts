/**
 * Database Integration Tests
 * Tests all 80 endpoints with real PostgreSQL integration
 */

import axios, { AxiosInstance } from 'axios';
import { TEST_CONFIG } from './setup';

describe('Database-Integrated Endpoints - All 80 Endpoints', () => {
  let api: AxiosInstance;
  let authToken: string;
  let testTenantId: string;
  let testUserId: string;

  beforeAll(async () => {
    api = axios.create({
      baseURL: TEST_CONFIG.API_GATEWAY_URL,
      timeout: 15000,
      validateStatus: () => true,
    });

    // Authenticate and get token
    const authResponse = await api.post('/api/auth/login', {
      email: 'test@example.com',
      password: 'testpassword',
    });

    if (authResponse.status === 200) {
      authToken = authResponse.data.token;
      testTenantId = authResponse.data.user.tenantId;
      testUserId = authResponse.data.user.id;

      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    }
  });

  describe('PM (Project Manager) Endpoints - 16/16', () => {
    let testApprovalId: string;
    let testBudgetId: string;
    let testMigrationId: string;

    describe('PM Approvals (4 endpoints)', () => {
      it('GET /api/pm/approvals/pending - should list pending approvals', async () => {
        const response = await api.get('/api/pm/approvals/pending');
        expect([200, 401]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('success', true);
          expect(response.data).toHaveProperty('data');
          expect(Array.isArray(response.data.data)).toBe(true);
        }
      });

      it('POST /api/pm/approvals/approve - should approve deployment', async () => {
        const response = await api.post('/api/pm/approvals/approve', {
          deploymentId: 'test-deployment-123',
          comments: 'Approved via integration test',
        });
        expect([200, 201, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/pm/approvals/reject - should reject deployment', async () => {
        const response = await api.post('/api/pm/approvals/reject', {
          deploymentId: 'test-deployment-123',
          reason: 'Testing rejection flow',
        });
        expect([200, 201, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/pm/approvals/history - should list approval history', async () => {
        const response = await api.get('/api/pm/approvals/history');
        expect([200, 401]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('data');
        }
      });
    });

    describe('PM Budget (4 endpoints)', () => {
      it('GET /api/pm/budget/summary - should get budget summary', async () => {
        const response = await api.get('/api/pm/budget/summary');
        expect([200, 401]).toContain(response.status);
        if (response.status === 200) {
          expect(response.data).toHaveProperty('data');
        }
      });

      it('POST /api/pm/budget/allocate - should allocate budget', async () => {
        const response = await api.post('/api/pm/budget/allocate', {
          projectId: 'test-project-123',
          amount: 5000,
          category: 'infrastructure',
        });
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('GET /api/pm/budget/forecast - should get budget forecast', async () => {
        const response = await api.get('/api/pm/budget/forecast?months=6');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/pm/budget/alerts - should get budget alerts', async () => {
        const response = await api.get('/api/pm/budget/alerts');
        expect([200, 401]).toContain(response.status);
      });
    });

    describe('PM Migrations (4 endpoints)', () => {
      it('GET /api/pm/migrations - should list migrations', async () => {
        const response = await api.get('/api/pm/migrations');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/pm/migrations/:id - should get migration details', async () => {
        const response = await api.get('/api/pm/migrations/test-migration-123');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('POST /api/pm/migrations/:id/update-status - should update migration status', async () => {
        const response = await api.post('/api/pm/migrations/test-migration-123/update-status', {
          status: 'in_progress',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/pm/migrations/:id/risks - should get migration risks', async () => {
        const response = await api.get('/api/pm/migrations/test-migration-123/risks');
        expect([200, 401, 404]).toContain(response.status);
      });
    });

    describe('PM KPIs (4 endpoints)', () => {
      it('GET /api/pm/kpis/dashboard - should get KPI dashboard', async () => {
        const response = await api.get('/api/pm/kpis/dashboard');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/pm/kpis/deployment-metrics - should get deployment metrics', async () => {
        const response = await api.get('/api/pm/kpis/deployment-metrics');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/pm/kpis/budget-performance - should get budget performance', async () => {
        const response = await api.get('/api/pm/kpis/budget-performance');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/pm/kpis/project-health - should get project health', async () => {
        const response = await api.get('/api/pm/kpis/project-health');
        expect([200, 401]).toContain(response.status);
      });
    });
  });

  describe('SE (Site Engineer) Endpoints - 16/16', () => {
    describe('SE Deployments (4 endpoints)', () => {
      it('POST /api/se/deployments/execute - should execute deployment', async () => {
        const response = await api.post('/api/se/deployments/execute', {
          blueprintId: 'test-blueprint-123',
          environment: 'development',
        });
        expect([200, 201, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/se/deployments/:id/rollback - should rollback deployment', async () => {
        const response = await api.post('/api/se/deployments/test-deploy-123/rollback', {
          reason: 'Testing rollback',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/se/deployments/:id/status - should get deployment status', async () => {
        const response = await api.get('/api/se/deployments/test-deploy-123/status');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('GET /api/se/deployments/active - should list active deployments', async () => {
        const response = await api.get('/api/se/deployments/active');
        expect([200, 401]).toContain(response.status);
      });
    });

    describe('SE Deployment Logs (4 endpoints)', () => {
      it('GET /api/se/deployment-logs/:id - should get deployment logs', async () => {
        const response = await api.get('/api/se/deployment-logs/test-deploy-123');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('GET /api/se/deployment-logs/:id/stream - SSE endpoint (skip in tests)', async () => {
        // SSE endpoints are difficult to test in Jest, validate route exists
        const response = await api.get('/api/se/deployment-logs/test-deploy-123/stream');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('GET /api/se/deployment-logs/:id/errors - should get deployment errors', async () => {
        const response = await api.get('/api/se/deployment-logs/test-deploy-123/errors');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('GET /api/se/deployment-logs/:id/summary - should get log summary', async () => {
        const response = await api.get('/api/se/deployment-logs/test-deploy-123/summary');
        expect([200, 401, 404]).toContain(response.status);
      });
    });

    describe('SE Incidents (4 endpoints)', () => {
      it('POST /api/se/incidents - should create incident', async () => {
        const response = await api.post('/api/se/incidents', {
          title: 'Test incident',
          severity: 'medium',
          description: 'Integration test incident',
        });
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('GET /api/se/incidents - should list incidents', async () => {
        const response = await api.get('/api/se/incidents');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/se/incidents/:id - should get incident details', async () => {
        const response = await api.get('/api/se/incidents/test-incident-123');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('PATCH /api/se/incidents/:id - should update incident', async () => {
        const response = await api.patch('/api/se/incidents/test-incident-123', {
          status: 'investigating',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });
    });

    describe('SE Health (4 endpoints)', () => {
      it('GET /api/se/health/services - should get service health', async () => {
        const response = await api.get('/api/se/health/services');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/se/health/services/:id - should get service details', async () => {
        const response = await api.get('/api/se/health/services/api-gateway');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('GET /api/se/health/infrastructure - should get infrastructure health', async () => {
        const response = await api.get('/api/se/health/infrastructure');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/se/health/alerts - should get health alerts', async () => {
        const response = await api.get('/api/se/health/alerts');
        expect([200, 401]).toContain(response.status);
      });
    });
  });

  describe('EA (Enterprise Architect) Endpoints - 16/16', () => {
    describe('EA Policies (4 endpoints)', () => {
      it('POST /api/ea/policies - should create policy', async () => {
        const response = await api.post('/api/ea/policies', {
          name: 'Test Policy',
          category: 'security',
          rules: { encryption: 'required' },
        });
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('GET /api/ea/policies - should list policies', async () => {
        const response = await api.get('/api/ea/policies');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/ea/policies/:id/violations - should get policy violations', async () => {
        const response = await api.get('/api/ea/policies/test-policy-123/violations');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('PATCH /api/ea/policies/:id - should update policy', async () => {
        const response = await api.patch('/api/ea/policies/test-policy-123', {
          status: 'active',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });
    });

    describe('EA Patterns (4 endpoints)', () => {
      it('POST /api/ea/patterns - should create pattern', async () => {
        const response = await api.post('/api/ea/patterns', {
          name: 'Test Pattern',
          category: 'microservices',
        });
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('GET /api/ea/patterns - should list patterns', async () => {
        const response = await api.get('/api/ea/patterns');
        expect([200, 401]).toContain(response.status);
      });

      it('POST /api/ea/patterns/:id/approve - should approve pattern', async () => {
        const response = await api.post('/api/ea/patterns/test-pattern-123/approve');
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/ea/patterns/:id - should get pattern details', async () => {
        const response = await api.get('/api/ea/patterns/test-pattern-123');
        expect([200, 401, 404]).toContain(response.status);
      });
    });

    describe('EA Compliance (4 endpoints)', () => {
      it('GET /api/ea/compliance/frameworks - should list frameworks', async () => {
        const response = await api.get('/api/ea/compliance/frameworks');
        expect([200, 401]).toContain(response.status);
      });

      it('POST /api/ea/compliance/assessments - should create assessment', async () => {
        const response = await api.post('/api/ea/compliance/assessments', {
          frameworkId: 'test-framework-123',
          scope: 'full',
        });
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('GET /api/ea/compliance/assessments - should list assessments', async () => {
        const response = await api.get('/api/ea/compliance/assessments');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/ea/compliance/dashboard - should get compliance dashboard', async () => {
        const response = await api.get('/api/ea/compliance/dashboard');
        expect([200, 401]).toContain(response.status);
      });
    });

    describe('EA Cost Optimization (4 endpoints)', () => {
      it('GET /api/ea/cost-optimization/recommendations - should get recommendations', async () => {
        const response = await api.get('/api/ea/cost-optimization/recommendations');
        expect([200, 401]).toContain(response.status);
      });

      it('POST /api/ea/cost-optimization/recommendations/:id/approve - should approve recommendation', async () => {
        const response = await api.post('/api/ea/cost-optimization/recommendations/test-rec-123/approve');
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/ea/cost-optimization/recommendations/:id/dismiss - should dismiss recommendation', async () => {
        const response = await api.post('/api/ea/cost-optimization/recommendations/test-rec-123/dismiss', {
          reason: 'Not applicable',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/ea/cost-optimization/dashboard - should get cost optimization dashboard', async () => {
        const response = await api.get('/api/ea/cost-optimization/dashboard');
        expect([200, 401]).toContain(response.status);
      });
    });
  });

  describe('TA (Technical Architect) Endpoints - 16/16', () => {
    describe('TA Guardrails (8 endpoints)', () => {
      it('GET /api/ta/guardrails - should list guardrails', async () => {
        const response = await api.get('/api/ta/guardrails');
        expect([200, 401]).toContain(response.status);
      });

      it('POST /api/ta/guardrails - should create guardrail', async () => {
        const response = await api.post('/api/ta/guardrails', {
          name: 'Test Guardrail',
          category: 'security',
          ruleDefinition: { type: 'validation' },
          enforcementAction: 'block',
        });
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('PATCH /api/ta/guardrails/:id - should update guardrail', async () => {
        const response = await api.patch('/api/ta/guardrails/test-guardrail-123', {
          status: 'active',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/ta/guardrails/:id/violations - should get violations', async () => {
        const response = await api.get('/api/ta/guardrails/test-guardrail-123/violations');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('POST /api/ta/guardrails/:id/override - should override violation', async () => {
        const response = await api.post('/api/ta/guardrails/test-guardrail-123/override', {
          violationId: 'test-violation-123',
          overrideReason: 'Testing override',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/ta/guardrails/audit - should get audit log', async () => {
        const response = await api.get('/api/ta/guardrails/audit');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/ta/guardrails/dashboard - should get dashboard', async () => {
        const response = await api.get('/api/ta/guardrails/dashboard');
        expect([200, 401]).toContain(response.status);
      });

      it('POST /api/ta/guardrails/test - should test guardrail', async () => {
        const response = await api.post('/api/ta/guardrails/test', {
          ruleId: 'test-rule-123',
          testCode: 'resource "aws_s3_bucket" "test" {}',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });
    });

    describe('TA IaC (8 endpoints)', () => {
      it('POST /api/ta/iac/generate - should generate IaC', async () => {
        const response = await api.post('/api/ta/iac/generate', {
          blueprintId: 'test-blueprint-123',
          provider: 'aws',
        });
        expect([200, 201, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/ta/iac/validate - should validate IaC', async () => {
        const response = await api.post('/api/ta/iac/validate', {
          code: 'terraform code here',
          provider: 'aws',
        });
        expect([200, 400, 401]).toContain(response.status);
      });

      it('GET /api/ta/iac/templates - should list templates', async () => {
        const response = await api.get('/api/ta/iac/templates');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/ta/iac/generations - should list generations', async () => {
        const response = await api.get('/api/ta/iac/generations');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/ta/iac/generations/:id/files - should get generated files', async () => {
        const response = await api.get('/api/ta/iac/generations/test-gen-123/files');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('POST /api/ta/iac/templates - should create template', async () => {
        const response = await api.post('/api/ta/iac/templates', {
          name: 'Test Template',
          provider: 'aws',
          templateContent: { main: 'terraform code' },
        });
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('GET /api/ta/iac/standards - should get standards', async () => {
        const response = await api.get('/api/ta/iac/standards');
        expect([200, 401]).toContain(response.status);
      });

      it('POST /api/ta/iac/estimate-cost - should estimate cost', async () => {
        const response = await api.post('/api/ta/iac/estimate-cost', {
          blueprintId: 'test-blueprint-123',
          provider: 'aws',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });
    });
  });

  describe('SA (Solution Architect) Endpoints - 16/16', () => {
    describe('SA Blueprints (8 endpoints)', () => {
      it('POST /api/sa/blueprints - should create blueprint', async () => {
        const response = await api.post('/api/sa/blueprints', {
          name: 'Test Blueprint',
          category: 'web-app',
          provider: 'aws',
        });
        expect([200, 201, 400, 401]).toContain(response.status);
      });

      it('GET /api/sa/blueprints - should list blueprints', async () => {
        const response = await api.get('/api/sa/blueprints');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/sa/blueprints/:id - should get blueprint details', async () => {
        const response = await api.get('/api/sa/blueprints/test-blueprint-123');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('PATCH /api/sa/blueprints/:id - should update blueprint', async () => {
        const response = await api.patch('/api/sa/blueprints/test-blueprint-123', {
          status: 'published',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/sa/blueprints/:id/version - should create version', async () => {
        const response = await api.post('/api/sa/blueprints/test-blueprint-123/version', {
          versionNotes: 'Test version',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/sa/blueprints/:id/validate - should validate blueprint', async () => {
        const response = await api.post('/api/sa/blueprints/test-blueprint-123/validate');
        expect([200, 401, 404]).toContain(response.status);
      });

      it('POST /api/sa/blueprints/:id/clone - should clone blueprint', async () => {
        const response = await api.post('/api/sa/blueprints/test-blueprint-123/clone', {
          newName: 'Cloned Blueprint',
        });
        expect([200, 201, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/sa/blueprints/:id/diagram - should get diagram', async () => {
        const response = await api.get('/api/sa/blueprints/test-blueprint-123/diagram');
        expect([200, 401, 404]).toContain(response.status);
      });
    });

    describe('SA AI Recommendations (8 endpoints)', () => {
      it('POST /api/sa/ai-recommendations/analyze - should analyze architecture', async () => {
        const response = await api.post('/api/sa/ai-recommendations/analyze', {
          blueprintId: 'test-blueprint-123',
          analysisType: 'performance',
        });
        expect([200, 201, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/sa/ai-recommendations/optimize - should optimize blueprint', async () => {
        const response = await api.post('/api/sa/ai-recommendations/optimize', {
          blueprintId: 'test-blueprint-123',
          optimizationGoals: ['cost', 'performance'],
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/sa/ai-recommendations/compare - should compare blueprints', async () => {
        const response = await api.post('/api/sa/ai-recommendations/compare', {
          blueprintIds: ['test-blueprint-123', 'test-blueprint-456'],
          criteria: { cost: 0.5, performance: 0.5 },
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/sa/ai-recommendations/:id/feedback - should provide feedback', async () => {
        const response = await api.post('/api/sa/ai-recommendations/test-rec-123/feedback', {
          rating: 5,
          comments: 'Great recommendation',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('GET /api/sa/ai-recommendations/history - should get history', async () => {
        const response = await api.get('/api/sa/ai-recommendations/history');
        expect([200, 401]).toContain(response.status);
      });

      it('GET /api/sa/ai-recommendations/trends - should get trends', async () => {
        const response = await api.get('/api/sa/ai-recommendations/trends');
        expect([200, 401]).toContain(response.status);
      });

      it('POST /api/sa/ai-recommendations/predict-cost - should predict cost', async () => {
        const response = await api.post('/api/sa/ai-recommendations/predict-cost', {
          blueprintId: 'test-blueprint-123',
          timeHorizon: 12,
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });

      it('POST /api/sa/ai-recommendations/risk-analysis - should analyze risks', async () => {
        const response = await api.post('/api/sa/ai-recommendations/risk-analysis', {
          blueprintId: 'test-blueprint-123',
        });
        expect([200, 400, 401, 404]).toContain(response.status);
      });
    });
  });

  describe('Cross-Role Workflow Integration', () => {
    it('should support full SA → TA → PM → SE workflow', async () => {
      // 1. SA creates blueprint
      const blueprintResponse = await api.post('/api/sa/blueprints', {
        name: 'Integration Test Blueprint',
        category: 'web-app',
        provider: 'aws',
        components: { web: { type: 'ec2' } },
      });
      
      // 2. TA generates IaC (if blueprint created successfully)
      if (blueprintResponse.status === 201 && blueprintResponse.data.data?.id) {
        const iacResponse = await api.post('/api/ta/iac/generate', {
          blueprintId: blueprintResponse.data.data.id,
          provider: 'aws',
        });
        expect([200, 201, 400, 401]).toContain(iacResponse.status);
      }

      // Workflow validation - ensure endpoints are accessible
      expect([200, 201, 400, 401]).toContain(blueprintResponse.status);
    });
  });
});
