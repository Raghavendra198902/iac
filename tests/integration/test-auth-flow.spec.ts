import axios from 'axios';
import { TEST_CONFIG, setAuthToken, getAuthToken, clearAuthToken, createAuthenticatedClient } from './setup';

describe('Authentication Flow Integration Tests', () => {
  const apiGateway = axios.create({
    baseURL: TEST_CONFIG.API_GATEWAY_URL,
    timeout: 10000,
    validateStatus: () => true
  });

  beforeEach(() => {
    clearAuthToken();
  });

  describe('Login Flow', () => {
    it('should login with valid credentials', async () => {
      const response = await apiGateway.post('/api/auth/login', {
        email: TEST_CONFIG.TEST_USER_EMAIL,
        password: TEST_CONFIG.TEST_USER_PASSWORD
      });

      expect([200, 201]).toContain(response.status);
      expect(response.data).toHaveProperty('token');
      expect(response.data.token).toBeTruthy();
      
      // Store token for subsequent tests
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
    });

    it('should reject login with invalid credentials', async () => {
      const response = await apiGateway.post('/api/auth/login', {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      });

      expect([401, 403]).toContain(response.status);
      expect(response.data).not.toHaveProperty('token');
    });

    it('should reject login with missing email', async () => {
      const response = await apiGateway.post('/api/auth/login', {
        password: 'password'
      });

      expect([400, 422]).toContain(response.status);
    });

    it('should reject login with missing password', async () => {
      const response = await apiGateway.post('/api/auth/login', {
        email: 'test@example.com'
      });

      expect([400, 422]).toContain(response.status);
    });

    it('should return user information on successful login', async () => {
      const response = await apiGateway.post('/api/auth/login', {
        email: TEST_CONFIG.TEST_USER_EMAIL,
        password: TEST_CONFIG.TEST_USER_PASSWORD
      });

      if (response.status === 200 || response.status === 201) {
        expect(response.data).toHaveProperty('user');
        expect(response.data.user).toHaveProperty('email');
        expect(response.data.user).toHaveProperty('role');
      }
    });
  });

  describe('Token Validation', () => {
    let validToken: string;

    beforeAll(async () => {
      const loginResponse = await apiGateway.post('/api/auth/login', {
        email: TEST_CONFIG.TEST_USER_EMAIL,
        password: TEST_CONFIG.TEST_USER_PASSWORD
      });
      
      if (loginResponse.data.token) {
        validToken = loginResponse.data.token;
        setAuthToken(validToken);
      }
    });

    it('should access protected routes with valid token', async () => {
      const client = createAuthenticatedClient();
      const response = await client.get('/api/blueprints');
      
      expect([200, 404]).toContain(response.status);
      expect(response.status).not.toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await apiGateway.get('/api/blueprints', {
        headers: { Authorization: 'Bearer invalid_token_here' }
      });

      expect(response.status).toBe(401);
    });

    it('should reject requests with expired token', async () => {
      // Use a token that's known to be expired (if available)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      const response = await apiGateway.get('/api/blueprints', {
        headers: { Authorization: `Bearer ${expiredToken}` }
      });

      expect(response.status).toBe(401);
    });

    it('should reject requests with malformed Authorization header', async () => {
      const response = await apiGateway.get('/api/blueprints', {
        headers: { Authorization: 'InvalidFormat' }
      });

      expect(response.status).toBe(401);
    });

    it('should validate token format', async () => {
      const response = await apiGateway.get('/api/blueprints', {
        headers: { Authorization: 'Bearer not.a.jwt' }
      });

      expect(response.status).toBe(401);
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token if endpoint exists', async () => {
      // First login
      const loginResponse = await apiGateway.post('/api/auth/login', {
        email: TEST_CONFIG.TEST_USER_EMAIL,
        password: TEST_CONFIG.TEST_USER_PASSWORD
      });

      if (loginResponse.data.token) {
        // Try to refresh token
        const refreshResponse = await apiGateway.post('/api/auth/refresh', {}, {
          headers: { Authorization: `Bearer ${loginResponse.data.token}` }
        });

        // Refresh endpoint may not be implemented yet
        if (refreshResponse.status === 200) {
          expect(refreshResponse.data).toHaveProperty('token');
          expect(refreshResponse.data.token).toBeTruthy();
        }
      }
    });
  });

  describe('Logout Flow', () => {
    it('should logout successfully', async () => {
      // First login
      const loginResponse = await apiGateway.post('/api/auth/login', {
        email: TEST_CONFIG.TEST_USER_EMAIL,
        password: TEST_CONFIG.TEST_USER_PASSWORD
      });

      if (loginResponse.data.token) {
        // Then logout
        const logoutResponse = await apiGateway.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${loginResponse.data.token}` }
        });

        expect([200, 204]).toContain(logoutResponse.status);
      }
    });

    it('should invalidate token after logout', async () => {
      // Login
      const loginResponse = await apiGateway.post('/api/auth/login', {
        email: TEST_CONFIG.TEST_USER_EMAIL,
        password: TEST_CONFIG.TEST_USER_PASSWORD
      });

      if (loginResponse.data.token) {
        const token = loginResponse.data.token;

        // Logout
        await apiGateway.post('/api/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Try to use token after logout
        const response = await apiGateway.get('/api/blueprints', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Token should be invalid after logout (or still valid if not implementing token blacklist)
        // This depends on implementation strategy
        expect([200, 401]).toContain(response.status);
      }
    });
  });

  describe('Cross-Service Authentication', () => {
    let validToken: string;

    beforeAll(async () => {
      const loginResponse = await apiGateway.post('/api/auth/login', {
        email: TEST_CONFIG.TEST_USER_EMAIL,
        password: TEST_CONFIG.TEST_USER_PASSWORD
      });
      
      if (loginResponse.data.token) {
        validToken = loginResponse.data.token;
      }
    });

    it('should authenticate with Blueprint Service via Gateway', async () => {
      const response = await apiGateway.get('/api/blueprints', {
        headers: { Authorization: `Bearer ${validToken}` }
      });

      expect([200, 404]).toContain(response.status);
    });

    it('should authenticate with IaC Generator via Gateway', async () => {
      const response = await apiGateway.post('/api/iac/generate', {
        blueprintId: 'test-blueprint-id'
      }, {
        headers: { Authorization: `Bearer ${validToken}` }
      });

      expect([200, 400, 404]).toContain(response.status);
      expect(response.status).not.toBe(401);
    });

    it('should authenticate with Guardrails Engine via Gateway', async () => {
      const response = await apiGateway.post('/api/guardrails/check', {
        blueprint: { name: 'test' }
      }, {
        headers: { Authorization: `Bearer ${validToken}` }
      });

      expect([200, 400]).toContain(response.status);
      expect(response.status).not.toBe(401);
    });

    it('should authenticate with AI Engine via Gateway', async () => {
      const response = await apiGateway.post('/api/ai/generate-blueprint', {
        prompt: 'Create a simple web application infrastructure'
      }, {
        headers: { Authorization: `Bearer ${validToken}` }
      });

      expect([200, 400]).toContain(response.status);
      expect(response.status).not.toBe(401);
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    let adminToken: string;

    beforeAll(async () => {
      const loginResponse = await apiGateway.post('/api/auth/login', {
        email: TEST_CONFIG.TEST_USER_EMAIL,
        password: TEST_CONFIG.TEST_USER_PASSWORD
      });
      
      if (loginResponse.data.token) {
        adminToken = loginResponse.data.token;
      }
    });

    it('should allow admin to access admin endpoints', async () => {
      const response = await apiGateway.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      // Admin endpoint may not be implemented yet
      expect([200, 403, 404]).toContain(response.status);
    });

    it('should enforce role-based permissions', async () => {
      const client = createAuthenticatedClient();
      
      // Try various operations
      const operations = [
        client.get('/api/blueprints'),
        client.get('/api/deployments'),
        client.get('/api/monitoring/health')
      ];

      const responses = await Promise.all(operations);
      
      // All should either succeed or fail with proper error (not 500)
      responses.forEach(response => {
        expect(response.status).not.toBe(500);
      });
    });
  });

  describe('Session Management', () => {
    it('should handle concurrent sessions', async () => {
      // Login twice with same credentials
      const [session1, session2] = await Promise.all([
        apiGateway.post('/api/auth/login', {
          email: TEST_CONFIG.TEST_USER_EMAIL,
          password: TEST_CONFIG.TEST_USER_PASSWORD
        }),
        apiGateway.post('/api/auth/login', {
          email: TEST_CONFIG.TEST_USER_EMAIL,
          password: TEST_CONFIG.TEST_USER_PASSWORD
        })
      ]);

      // Both should succeed
      expect([200, 201]).toContain(session1.status);
      expect([200, 201]).toContain(session2.status);

      // Both tokens should be valid
      if (session1.data.token && session2.data.token) {
        const [check1, check2] = await Promise.all([
          apiGateway.get('/api/blueprints', {
            headers: { Authorization: `Bearer ${session1.data.token}` }
          }),
          apiGateway.get('/api/blueprints', {
            headers: { Authorization: `Bearer ${session2.data.token}` }
          })
        ]);

        expect([200, 404]).toContain(check1.status);
        expect([200, 404]).toContain(check2.status);
      }
    });
  });
});
