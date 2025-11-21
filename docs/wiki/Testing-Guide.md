# Testing Guide

Comprehensive testing strategies for IAC Dharma.

---

## Testing Pyramid

```
       /\
      /E2E\         End-to-End Tests (10%)
     /______\
    /        \
   /Integration\ Integration Tests (30%)
  /____________\
 /              \
/   Unit Tests   \   Unit Tests (60%)
/________________\
```

---

## Unit Tests

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- blueprint.service.test.ts

# Watch mode
npm test -- --watch

# Update snapshots
npm test -- -u
```

### Writing Unit Tests

```typescript
// Example: blueprint.service.test.ts
import { BlueprintService } from './blueprint.service';

describe('BlueprintService', () => {
  let service: BlueprintService;
  
  beforeEach(() => {
    service = new BlueprintService();
  });

  test('should create blueprint', async () => {
    const result = await service.create({
      name: 'Test',
      provider: 'aws'
    });
    
    expect(result).toHaveProperty('id');
    expect(result.name).toBe('Test');
  });

  test('should throw error for invalid input', async () => {
    await expect(service.create({ name: '' }))
      .rejects
      .toThrow('Name is required');
  });
});
```

### Coverage Requirements

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 75,
      functions: 75,
      lines: 75
    }
  }
};
```

---

## Integration Tests

### Setup Test Database

```bash
# Start test database
docker-compose -f docker-compose.test.yml up -d

# Run migrations
NODE_ENV=test npm run migrate:up

# Run integration tests
npm run test:integration
```

### Integration Test Example

```typescript
// blueprint.integration.test.ts
import { setupTestDB, teardownTestDB } from './test-utils';
import request from 'supertest';
import app from './app';

describe('Blueprint API Integration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test('POST /api/blueprints', async () => {
    const response = await request(app)
      .post('/api/blueprints')
      .send({
        name: 'Integration Test',
        provider: 'aws'
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});
```

---

## End-to-End Tests

### Playwright Setup

```bash
# Install Playwright
cd frontend
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Run specific test
npm run test:e2e -- tests/blueprint.spec.ts
```

### E2E Test Example

```typescript
// tests/blueprint.spec.ts
import { test, expect } from '@playwright/test';

test('create blueprint flow', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5173');

  // Click create blueprint button
  await page.click('button:has-text("Create Blueprint")');

  // Fill form
  await page.fill('input[name="name"]', 'Test Blueprint');
  await page.selectOption('select[name="provider"]', 'aws');

  // Submit
  await page.click('button:has-text("Create")');

  // Verify success message
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## Load Testing

### Using Apache Bench

```bash
# Test API Gateway
ab -n 1000 -c 10 http://localhost:3000/health

# POST request
ab -n 100 -c 10 -p payload.json \
  -T application/json \
  http://localhost:3000/api/blueprints
```

### Using k6

```javascript
// load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,  // 10 virtual users
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/health');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}
```

```bash
# Run load test
k6 run load-test.js
```

---

## Test Data Management

### Fixtures

```typescript
// fixtures/blueprints.ts
export const blueprintFixtures = {
  awsVpc: {
    name: 'Test VPC',
    provider: 'aws',
    resources: [{
      type: 'aws_vpc',
      properties: {
        cidr_block: '10.0.0.0/16'
      }
    }]
  },
  azureVnet: {
    name: 'Test VNet',
    provider: 'azure',
    resources: [{
      type: 'azurerm_virtual_network',
      properties: {
        address_space: ['10.0.0.0/16']
      }
    }]
  }
};
```

### Database Seeding

```typescript
// seed-test-data.ts
export async function seedTestData() {
  await db.blueprints.create(blueprintFixtures.awsVpc);
  await db.blueprints.create(blueprintFixtures.azureVnet);
}
```

---

## Mocking

### Mock External APIs

```typescript
// __mocks__/aws-sdk.ts
export const EC2 = jest.fn().mockImplementation(() => ({
  describeInstances: jest.fn().mockResolvedValue({
    Reservations: []
  })
}));
```

### Mock Database

```typescript
// Use in-memory database for tests
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('sqlite::memory:');
```

---

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Test Reports

### Coverage Report

```bash
# Generate HTML coverage report
npm run test:coverage

# View report
open coverage/lcov-report/index.html
```

### Test Results

```bash
# Generate JUnit XML report
npm test -- --reporters=default --reporters=jest-junit

# View results
cat junit.xml
```

---

## Best Practices

1. **Follow AAA pattern** (Arrange, Act, Assert)
2. **One assertion per test** when possible
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Clean up after tests**
6. **Keep tests independent**
7. **Test edge cases and errors**
8. **Aim for 75%+ coverage**

---

Last Updated: November 21, 2025 | [Back to Home](Home)
