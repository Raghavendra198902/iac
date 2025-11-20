# IAC DHARMA - Integration Tests

## Overview

This directory contains integration tests for the IAC DHARMA platform. These tests verify that all microservices communicate correctly and that end-to-end workflows function as expected.

## Test Suites

### 1. API Gateway Tests (`test-api-gateway.spec.ts`)

Tests the API Gateway's routing, rate limiting, CORS, and error handling.

**Coverage:**
- Health checks
- Routing to all 8 backend services
- Rate limiting enforcement
- Error handling (404, 401, 400)
- CORS headers
- Request/Response formats
- Request ID tracking
- Service availability

**Run:**
```bash
npm run test:api-gateway
```

### 2. Authentication Flow Tests (`test-auth-flow.spec.ts`)

Tests JWT authentication, token validation, and RBAC across services.

**Coverage:**
- Login with valid/invalid credentials
- Token validation
- Token refresh (if implemented)
- Logout flow
- Token invalidation
- Cross-service authentication
- Role-Based Access Control (RBAC)
- Session management
- Concurrent sessions

**Run:**
```bash
npm run test:auth
```

### 3. Blueprint Workflow Tests (`test-blueprint-workflow.spec.ts`)

Tests the complete blueprint lifecycle from creation to deployment.

**Coverage:**
- Blueprint CRUD operations
- Guardrails policy checking
- IaC code generation (Terraform, Bicep, CloudFormation)
- IaC code validation
- Cost estimation
- Deployment creation
- AI risk assessment
- ML recommendations
- Blueprint versioning
- Error handling
- Cleanup operations

**Run:**
```bash
npm run test:blueprint
```

### 4. AI Integration Tests (`test-ai-integration.spec.ts`)

Tests AI/ML capabilities including NLP blueprint generation and risk assessment.

**Coverage:**
- NLP blueprint generation from natural language
- Simple and complex infrastructure requests
- Confidence scores
- Security risk assessment
- Cost risk assessment
- Availability risk assessment
- Mitigation recommendations
- Optimization recommendations
- Pattern detection
- Anti-pattern identification
- Intent analysis
- Requirement extraction
- Error handling
- Performance benchmarks

**Run:**
```bash
npm run test:ai
```

## Setup

### Prerequisites

1. **Platform Running:** Ensure all services are running:
   ```bash
   cd /home/rrd/Documents/Iac
   ./scripts/start-platform.sh --dev
   ```

2. **Services Healthy:** Verify all services are healthy:
   ```bash
   ./scripts/health-check.sh
   ```

### Installation

```bash
cd tests/integration
npm install
```

### Environment Configuration

Create a `.env` file in this directory (optional, defaults provided):

```bash
# API Endpoints
API_GATEWAY_URL=http://localhost:3000
BLUEPRINT_SERVICE_URL=http://localhost:3001
IAC_GENERATOR_URL=http://localhost:3002
GUARDRAILS_ENGINE_URL=http://localhost:3003
ORCHESTRATOR_URL=http://localhost:3004
COSTING_SERVICE_URL=http://localhost:3005
MONITORING_SERVICE_URL=http://localhost:3006
AUTOMATION_ENGINE_URL=http://localhost:3007
AI_ENGINE_URL=http://localhost:8000

# Test Credentials
TEST_USER_EMAIL=admin@iac.dharma
TEST_USER_PASSWORD=test_password_123
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
npm run test:api-gateway    # API Gateway tests
npm run test:auth           # Authentication tests
npm run test:blueprint      # Blueprint workflow tests
npm run test:ai             # AI integration tests
```

### Run with Coverage

```bash
npm run test:coverage
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Verbose Output

```bash
npm run test:verbose
```

## Test Structure

```
tests/integration/
├── jest.config.js              # Jest configuration
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── setup.ts                    # Global setup and utilities
├── test-api-gateway.spec.ts    # API Gateway tests
├── test-auth-flow.spec.ts      # Authentication tests
├── test-blueprint-workflow.spec.ts  # Blueprint workflow tests
├── test-ai-integration.spec.ts # AI/ML integration tests
└── README.md                   # This file
```

## Test Utilities

### `setup.ts`

Provides common utilities for all tests:

**Functions:**
- `waitForService(url)` - Wait for a service to be ready
- `waitForAllServices()` - Wait for all services to be ready
- `setAuthToken(token)` - Store JWT token
- `getAuthToken()` - Retrieve JWT token
- `clearAuthToken()` - Clear JWT token
- `createAuthenticatedClient()` - Create HTTP client with auth headers

**Global Hooks:**
- `beforeAll()` - Waits for all services to be ready
- `afterAll()` - Cleans up auth tokens

## Test Patterns

### Authentication Pattern

```typescript
import { createAuthenticatedClient } from './setup';

let authClient: ReturnType<typeof createAuthenticatedClient>;

beforeAll(async () => {
  // Login logic here
  authClient = createAuthenticatedClient();
});

it('should access protected endpoint', async () => {
  const response = await authClient.get('/api/blueprints');
  expect(response.status).toBe(200);
});
```

### Service Availability Pattern

```typescript
it('should check service health', async () => {
  const response = await axios.get(`${SERVICE_URL}/health`);
  expect(response.status).toBe(200);
  expect(response.data).toHaveProperty('status', 'healthy');
});
```

### Workflow Testing Pattern

```typescript
describe('Complete Workflow', () => {
  let resourceId: string;

  it('should create resource', async () => {
    const response = await authClient.post('/api/resource', data);
    resourceId = response.data.id;
  });

  it('should process resource', async () => {
    const response = await authClient.post(`/api/process/${resourceId}`);
    expect(response.status).toBe(200);
  });

  afterAll(async () => {
    // Cleanup
    await authClient.delete(`/api/resource/${resourceId}`);
  });
});
```

## Timeouts

- **Default Test Timeout:** 30 seconds
- **AI/ML Tests:** 30-35 seconds (increased for processing time)
- **Service Startup:** 60 seconds (global beforeAll)

Configure in `jest.config.js`:
```javascript
testTimeout: 30000
```

Or per-test:
```typescript
it('should do something', async () => {
  // test code
}, 30000); // 30 second timeout
```

## Troubleshooting

### Services Not Ready

**Problem:** Tests fail with connection errors

**Solution:**
```bash
# Check service health
./scripts/health-check.sh

# View logs for failing service
./scripts/logs.sh <service-name>

# Restart services
./scripts/stop-platform.sh
./scripts/start-platform.sh --dev
```

### Authentication Failures

**Problem:** Tests fail with 401 Unauthorized

**Solution:**
1. Verify test credentials in `.env`
2. Check API Gateway logs: `./scripts/logs.sh api-gateway`
3. Ensure JWT secret is configured in backend services

### Test Timeouts

**Problem:** Tests timeout waiting for responses

**Solution:**
1. Increase timeout for specific tests
2. Check service logs for errors
3. Verify services have sufficient resources
4. Check for network issues

### Database Connection Issues

**Problem:** Tests fail with database errors

**Solution:**
```bash
# Check PostgreSQL
docker-compose exec postgres pg_isready -U iac_user

# Check Redis
docker-compose exec redis redis-cli ping

# Restart infrastructure
docker-compose restart postgres redis
```

## Coverage

Generate coverage report:
```bash
npm run test:coverage
```

View coverage report:
```bash
open coverage/lcov-report/index.html
```

## CI/CD Integration

Tests can be run in CI/CD pipelines:

```yaml
# .github/workflows/integration-tests.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  integration-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Start Platform
        run: |
          ./scripts/start-platform.sh --dev -d
          ./scripts/health-check.sh
      
      - name: Install Dependencies
        run: |
          cd tests/integration
          npm install
      
      - name: Run Tests
        run: |
          cd tests/integration
          npm test
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./tests/integration/coverage/lcov.info
```

## Best Practices

1. **Isolation:** Each test should be independent
2. **Cleanup:** Always clean up created resources
3. **Timeouts:** Set appropriate timeouts for long-running operations
4. **Error Handling:** Test both success and failure scenarios
5. **Assertions:** Use specific assertions with clear messages
6. **Mocking:** Avoid mocking for integration tests (test real interactions)
7. **Data:** Use unique identifiers to avoid conflicts
8. **Performance:** Keep tests fast (< 30s per test)

## Future Enhancements

- [ ] Add database transaction tests
- [ ] Add Redis caching tests
- [ ] Add concurrent request tests
- [ ] Add load testing
- [ ] Add chaos engineering tests
- [ ] Add contract testing
- [ ] Add API versioning tests
- [ ] Add WebSocket tests (if applicable)

## Support

For issues or questions:
1. Check logs: `./scripts/logs.sh --all`
2. Review test output for specific failures
3. Consult service-specific READMEs
4. Check [PLATFORM_ORCHESTRATION.md](../../PLATFORM_ORCHESTRATION.md)

## License

Enterprise License - IAC DHARMA Platform
