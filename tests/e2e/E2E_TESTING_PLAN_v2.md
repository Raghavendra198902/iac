# E2E Testing Infrastructure - v2.0

**Version:** 2.0.0  
**Status:** In Development  
**Created:** December 3, 2025  
**Purpose:** End-to-End testing framework for v2.0 features

---

## Overview

This document outlines the E2E testing infrastructure for IAC Dharma Platform v2.0, covering multi-tenancy, SSO, performance, and all new features.

---

## Testing Strategy

### Test Pyramid for v2.0

```
           /\
          /  \      E2E Tests (10%)
         /____\     - Critical user journeys
        /      \    - Multi-tenant scenarios
       /        \   - SSO integration flows
      /  Integ. \  Integration Tests (25%)
     /____________\ - Service-to-service
    /              \ - Database operations
   /                \ - Cache layer
  /    Unit Tests    \ Unit Tests (65%)
 /____________________\ - Business logic
                        - Utilities
```

**Target Coverage:**
- Unit Tests: 65% (up from current focus)
- Integration Tests: 25% (service interactions)
- E2E Tests: 10% (critical paths)
- **Overall Target: 95%**

---

## E2E Test Categories

### 1. Performance & Scalability Tests

#### Load Testing
- **Framework:** k6
- **Scenarios:**
  - 100 concurrent users (baseline)
  - 1,000 concurrent users (target)
  - 10,000 concurrent users (stretch goal)
- **Metrics:**
  - Response time p95 < 100ms
  - Throughput > 5000 req/sec
  - Error rate < 0.1%

#### Database Performance
- **Connection Pooling (PgBouncer):**
  - Test 500+ concurrent connections
  - Measure pool efficiency (target >90%)
  - Connection acquisition time < 5ms

- **Cache Performance (Redis):**
  - Cache hit rate > 80%
  - Cache response time < 5ms
  - Test cache invalidation scenarios

### 2. Multi-Tenancy Tests

#### Tenant Isolation
```typescript
describe('Multi-Tenancy E2E', () => {
  test('Data isolation between tenants', async () => {
    // Create two tenants
    const tenant1 = await createTenant('Acme Corp');
    const tenant2 = await createTenant('Beta Inc');
    
    // Create resources for each
    const project1 = await tenant1.createProject('Project A');
    const project2 = await tenant2.createProject('Project B');
    
    // Verify isolation
    expect(tenant1.getProjects()).toContain(project1);
    expect(tenant1.getProjects()).not.toContain(project2);
    expect(tenant2.getProjects()).toContain(project2);
    expect(tenant2.getProjects()).not.toContain(project1);
  });
  
  test('Resource quotas enforced per tenant', async () => {
    const tenant = await createTenant('Limited Corp', { 
      maxProjects: 5 
    });
    
    // Create 5 projects (should succeed)
    for (let i = 0; i < 5; i++) {
      await tenant.createProject(`Project ${i}`);
    }
    
    // Try to create 6th (should fail)
    await expect(
      tenant.createProject('Project 6')
    ).rejects.toThrow('Quota exceeded');
  });
  
  test('Tenant provisioning performance', async () => {
    const startTime = Date.now();
    await createTenant('Fast Corp');
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(5000); // < 5 seconds
  });
});
```

### 3. Authentication & SSO Tests

#### JWT Authentication
```typescript
describe('Authentication E2E', () => {
  test('Login with JWT token refresh', async () => {
    // Login
    const { accessToken, refreshToken } = await login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();
    
    // Use access token
    const response = await authenticatedRequest(accessToken, '/api/projects');
    expect(response.status).toBe(200);
    
    // Wait for token to expire (15 minutes in test = 1 second)
    await sleep(1100);
    
    // Refresh token
    const newTokens = await refreshAccessToken(refreshToken);
    expect(newTokens.accessToken).toBeDefined();
    expect(newTokens.accessToken).not.toBe(accessToken);
  });
});
```

#### SAML SSO
```typescript
describe('SAML SSO E2E', () => {
  test('SAML authentication flow', async () => {
    // Initiate SAML login
    const { redirectUrl } = await initiateSSO({
      provider: 'saml',
      organizationId: 'acme-corp'
    });
    
    expect(redirectUrl).toContain('idp.example.com');
    
    // Simulate IdP response
    const samlResponse = generateMockSAMLResponse({
      nameId: 'john.doe@acme.com',
      attributes: {
        email: 'john.doe@acme.com',
        firstName: 'John',
        lastName: 'Doe',
        groups: ['Engineering', 'Admins']
      }
    });
    
    // Complete SSO
    const { accessToken, user } = await completeSAMLLogin(samlResponse);
    
    expect(accessToken).toBeDefined();
    expect(user.email).toBe('john.doe@acme.com');
    expect(user.groups).toContain('Admins');
  });
});
```

#### OIDC SSO
```typescript
describe('OIDC SSO E2E', () => {
  test('OIDC authentication with Azure AD', async () => {
    const { authUrl } = await initiateOIDC({
      provider: 'azure-ad',
      tenantId: 'acme-tenant-id'
    });
    
    expect(authUrl).toContain('login.microsoftonline.com');
    
    // Simulate Azure AD callback
    const code = generateAuthorizationCode();
    const { accessToken, idToken } = await handleOIDCCallback({
      code,
      state: 'random-state'
    });
    
    expect(accessToken).toBeDefined();
    expect(idToken).toBeDefined();
    
    // Verify user info
    const userInfo = await getUserInfo(accessToken);
    expect(userInfo.email).toBeDefined();
  });
});
```

### 4. API Performance Tests

#### GraphQL API
```typescript
describe('GraphQL API E2E', () => {
  test('GraphQL query performance', async () => {
    const query = `
      query GetProjectWithResources($id: ID!) {
        project(id: $id) {
          id
          name
          resources {
            id
            type
            status
          }
          deployments {
            id
            status
            createdAt
          }
        }
      }
    `;
    
    const startTime = Date.now();
    const result = await graphqlQuery(query, { id: 'project-123' });
    const duration = Date.now() - startTime;
    
    expect(result.data.project).toBeDefined();
    expect(duration).toBeLessThan(100); // < 100ms p95
  });
  
  test('GraphQL batching reduces round trips', async () => {
    const queries = [
      '{ project(id: "1") { name } }',
      '{ project(id: "2") { name } }',
      '{ project(id: "3") { name } }'
    ];
    
    const startTime = Date.now();
    const results = await graphqlBatch(queries);
    const duration = Date.now() - startTime;
    
    expect(results).toHaveLength(3);
    expect(duration).toBeLessThan(150); // Batched < 150ms
  });
});
```

#### REST API with Caching
```typescript
describe('REST API Caching E2E', () => {
  test('Cache hit improves response time', async () => {
    const endpoint = '/api/projects';
    
    // First request (cache miss)
    const time1 = await measureRequestTime(endpoint);
    
    // Second request (cache hit)
    const time2 = await measureRequestTime(endpoint);
    
    // Cache should be faster
    expect(time2).toBeLessThan(time1 * 0.5); // 50% faster
    expect(time2).toBeLessThan(10); // < 10ms from cache
  });
  
  test('Cache invalidation on data change', async () => {
    const endpoint = '/api/projects';
    
    // Prime cache
    await fetch(endpoint);
    
    // Modify data
    await createProject({ name: 'New Project' });
    
    // Cache should be invalidated
    const response = await fetch(endpoint);
    const projects = await response.json();
    
    expect(projects).toContainEqual(
      expect.objectContaining({ name: 'New Project' })
    );
  });
});
```

### 5. Infrastructure Tests

#### Auto-Scaling
```typescript
describe('Auto-Scaling E2E', () => {
  test('HPA scales up under load', async () => {
    const serviceName = 'api-gateway';
    
    // Get initial replica count
    const initialReplicas = await getReplicaCount(serviceName);
    
    // Generate high load
    await generateLoad({
      targetService: serviceName,
      rps: 5000,
      duration: 60 // 60 seconds
    });
    
    // Wait for scaling
    await sleep(30000);
    
    // Verify scale up
    const currentReplicas = await getReplicaCount(serviceName);
    expect(currentReplicas).toBeGreaterThan(initialReplicas);
  });
  
  test('VPA adjusts resource requests', async () => {
    const deployment = await getDeployment('memory-intensive-service');
    const initialMemory = deployment.spec.template.spec.containers[0]
      .resources.requests.memory;
    
    // Generate memory pressure
    await generateMemoryPressure('memory-intensive-service');
    
    // Wait for VPA adjustment
    await sleep(300000); // 5 minutes
    
    const updatedDeployment = await getDeployment('memory-intensive-service');
    const newMemory = updatedDeployment.spec.template.spec.containers[0]
      .resources.requests.memory;
    
    expect(parseMemory(newMemory)).toBeGreaterThan(parseMemory(initialMemory));
  });
});
```

#### Disaster Recovery
```typescript
describe('Disaster Recovery E2E', () => {
  test('Automated backup and restore', async () => {
    // Create test data
    const project = await createProject({ name: 'Backup Test' });
    
    // Trigger backup
    await triggerBackup();
    
    // Delete data
    await deleteProject(project.id);
    
    // Restore from backup
    await restoreFromBackup({ timestamp: 'latest' });
    
    // Verify restoration
    const restoredProject = await getProject(project.id);
    expect(restoredProject.name).toBe('Backup Test');
  });
  
  test('Multi-region failover', async () => {
    // Primary region
    const primaryRegion = 'us-east-1';
    const secondaryRegion = 'us-west-2';
    
    // Set up replication
    await enableReplication(primaryRegion, secondaryRegion);
    
    // Create data in primary
    const project = await createProject({ name: 'Failover Test' }, primaryRegion);
    
    // Wait for replication
    await sleep(5000);
    
    // Simulate primary failure
    await simulateRegionFailure(primaryRegion);
    
    // Verify secondary serves traffic
    const restoredProject = await getProject(project.id, secondaryRegion);
    expect(restoredProject.name).toBe('Failover Test');
    
    // Measure RTO/RPO
    const rto = await measureRTO();
    const rpo = await measureRPO();
    
    expect(rto).toBeLessThan(3600); // < 1 hour
    expect(rpo).toBeLessThan(900); // < 15 minutes
  });
});
```

### 6. Security Tests

#### RBAC & Authorization
```typescript
describe('RBAC E2E', () => {
  test('Role-based access control enforced', async () => {
    // Create users with different roles
    const admin = await createUser({ role: 'admin' });
    const developer = await createUser({ role: 'developer' });
    const viewer = await createUser({ role: 'viewer' });
    
    const project = await createProject({ name: 'RBAC Test' });
    
    // Admin can delete
    await expect(
      admin.deleteProject(project.id)
    ).resolves.toBeTruthy();
    
    // Developer cannot delete
    await expect(
      developer.deleteProject(project.id)
    ).rejects.toThrow('Forbidden');
    
    // Viewer can only read
    await expect(
      viewer.getProject(project.id)
    ).resolves.toBeTruthy();
    
    await expect(
      viewer.updateProject(project.id, { name: 'New Name' })
    ).rejects.toThrow('Forbidden');
  });
  
  test('Resource-level permissions', async () => {
    const user = await createUser({ role: 'developer' });
    
    // Grant specific project access
    await grantAccess(user.id, 'project-123', 'write');
    
    // Can access granted project
    await expect(
      user.updateProject('project-123', { name: 'Updated' })
    ).resolves.toBeTruthy();
    
    // Cannot access other projects
    await expect(
      user.updateProject('project-456', { name: 'Updated' })
    ).rejects.toThrow('Forbidden');
  });
});
```

#### Security Scanning
```typescript
describe('Security E2E', () => {
  test('No SQL injection vulnerabilities', async () => {
    const maliciousInput = "'; DROP TABLE projects; --";
    
    await expect(
      createProject({ name: maliciousInput })
    ).resolves.toBeTruthy();
    
    // Verify tables still exist
    const projects = await getAllProjects();
    expect(projects).toBeDefined();
  });
  
  test('XSS prevention in responses', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const project = await createProject({ name: xssPayload });
    
    const response = await fetch(`/api/projects/${project.id}`);
    const html = await response.text();
    
    // Script should be escaped
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
  
  test('Rate limiting prevents abuse', async () => {
    const requests = [];
    
    // Send 100 requests rapidly
    for (let i = 0; i < 100; i++) {
      requests.push(fetch('/api/projects'));
    }
    
    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);
    
    // Some should be rate limited
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });
});
```

---

## Test Infrastructure

### Test Environment Setup

```yaml
# docker-compose.test.yml
version: '3.8'

services:
  # Test database
  postgres-test:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: iac_dharma_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5433:5432"
    volumes:
      - test_db_data:/var/lib/postgresql/data
  
  # Test Redis cache
  redis-test:
    image: redis:7-alpine
    ports:
      - "6380:6379"
  
  # Test PgBouncer
  pgbouncer-test:
    image: pgbouncer/pgbouncer:latest
    environment:
      DATABASES_HOST: postgres-test
      DATABASES_PORT: 5432
      DATABASES_DBNAME: iac_dharma_test
      DATABASES_USER: test_user
      DATABASES_PASSWORD: test_password
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 100
    ports:
      - "6433:6432"
    depends_on:
      - postgres-test
  
  # Mock SSO provider
  mock-idp:
    image: kristophjunge/test-saml-idp
    ports:
      - "8080:8080"
      - "8443:8443"
    environment:
      SIMPLESAMLPHP_SP_ENTITY_ID: iac-dharma
      SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE: http://localhost:3000/api/auth/sso/saml/callback

volumes:
  test_db_data:
```

### E2E Test Runner Configuration

```typescript
// e2e/jest.config.js
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/e2e/**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/e2e/setup.ts'],
  testTimeout: 60000, // 60 seconds for E2E tests
  globalSetup: '<rootDir>/e2e/global-setup.ts',
  globalTeardown: '<rootDir>/e2e/global-teardown.ts',
  maxWorkers: 4,
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage/e2e',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

### Load Testing with k6

```javascript
// load-tests/baseline.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100 users
    { duration: '2m', target: 1000 },  // Ramp up to 1000 users
    { duration: '5m', target: 1000 },  // Stay at 1000 users
    { duration: '2m', target: 0 },     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<100'], // 95% under 100ms
    'errors': ['rate<0.01'],             // Error rate < 1%
    'http_reqs': ['rate>5000'],          // > 5000 req/sec
  },
};

export default function () {
  const responses = http.batch([
    ['GET', 'http://localhost:3000/api/projects'],
    ['GET', 'http://localhost:3000/api/blueprints'],
    ['GET', 'http://localhost:3000/health/ready'],
  ]);

  responses.forEach((response) => {
    const success = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 100ms': (r) => r.timings.duration < 100,
    });
    
    errorRate.add(!success);
  });

  sleep(1);
}
```

---

## CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [v2.0-development]
  pull_request:
    branches: [v2.0-development]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start test environment
        run: docker-compose -f docker-compose.test.yml up -d
      
      - name: Wait for services
        run: ./scripts/wait-for-services.sh
      
      - name: Run database migrations
        run: npm run migrate:test
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Run load tests
        run: npm run test:load
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: e2e-test-results
          path: |
            coverage/e2e
            test-results
      
      - name: Cleanup
        if: always()
        run: docker-compose -f docker-compose.test.yml down -v
```

---

## Success Criteria

### E2E Test Coverage Goals

- [ ] **Multi-Tenancy:** 100% critical paths tested
- [ ] **SSO Flows:** SAML + OIDC + MFA covered
- [ ] **Performance:** All endpoints meet <100ms p95 target
- [ ] **Load Testing:** 1000+ concurrent users validated
- [ ] **Security:** OWASP Top 10 tested
- [ ] **Auto-Scaling:** HPA and VPA verified
- [ ] **Disaster Recovery:** RTO/RPO targets met
- [ ] **Cache Performance:** >80% hit rate validated

### Metrics Dashboard

```
┌─────────────────────────────────────────────────────┐
│ E2E Test Results - v2.0                             │
├─────────────────────────────────────────────────────┤
│ Total Tests:           247                          │
│ Passed:                243 (98.4%)                  │
│ Failed:                  4 (1.6%)                   │
│ Skipped:                 0                          │
│ Duration:             45m 23s                       │
├─────────────────────────────────────────────────────┤
│ Performance Metrics:                                │
│   - API Response (p95): 87ms ✅                     │
│   - Cache Hit Rate:     84% ✅                      │
│   - Error Rate:         0.08% ✅                    │
│   - Throughput:         5,234 req/sec ✅            │
├─────────────────────────────────────────────────────┤
│ Load Test Results:                                  │
│   - 100 users:  ✅ All targets met                  │
│   - 1000 users: ✅ All targets met                  │
│   - 10K users:  ⚠️  p95 degraded to 145ms           │
└─────────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0  
**Status:** Initial Draft  
**Next Review:** Weekly during v2.0 development  
**Owner:** QA Team
