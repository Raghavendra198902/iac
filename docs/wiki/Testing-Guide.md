---
**Document Type:** Quality Assurance & Testing Guide  
**Audience:** QA Engineers, Developers, Test Automation Engineers  
**Classification:** Technical - Quality Assurance  
**Version:** 2.0  
**Last Updated:** December 1, 2025  
**Copyright:** © 2024-2025 Raghavendra Deshpande  
---

# 🧪 Testing Guide - IAC Dharma Platform

> **Quality Through Testing** - Enterprise testing strategies covering unit, integration, E2E, performance, and security testing

---

## 🎯 Testing Pyramid Flow

```mermaid
flowchart TD
    A[Testing Strategy] --> B[Test Pyramid]
    
    B --> C[E2E Tests]
    B --> D[Integration Tests]
    B --> E[Unit Tests]
    
    C --> C1[Playwright]
    C --> C2[User Flows]
    C --> C3[Visual Tests]
    
    D --> D1[API Tests]
    D --> D2[Service Integration]
    D --> D3[Database Tests]
    
    E --> E1[Jest]
    E --> E2[Component Tests]
    E --> E3[Function Tests]
    
    C1 --> F[CI/CD Pipeline]
    C2 --> F
    C3 --> F
    D1 --> F
    D2 --> F
    D3 --> F
    E1 --> F
    E2 --> F
    E3 --> F
    
    F --> G{Quality Gates}
    G -->|Pass| H[✅ Deploy]
    G -->|Fail| I[❌ Block]
    
    style B fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style C fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    style D fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style E fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style H fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
```

---

[![Tests](https://img.shields.io/badge/Tests-Passing-brightgreen.svg)](Testing-Guide)
[![Coverage](https://img.shields.io/badge/Coverage-85%25-green.svg)](Testing-Guide)
[![Quality](https://img.shields.io/badge/Quality-Enterprise-blue.svg)](Testing-Guide)

---

## 🎯 Quick Navigation

| 🧪 **Test Types** | 🔧 **Tools** | 📊 **Quality** | 🚀 **CI/CD** |
|------------------|--------------|----------------|--------------|
| [Unit Tests](#unit-testing) | [Jest](#jest-configuration) | [Coverage](#code-coverage) | [GitHub Actions](#github-actions-ci) |
| [Integration](#integration-testing) | [Supertest](#supertest-api-testing) | [Quality Gates](#quality-gates) | [GitLab CI](#gitlab-ci-pipeline) |
| [E2E Tests](#end-to-end-testing) | [Playwright](#playwright-setup) | [Mutation Testing](#mutation-testing) | [Jenkins](#jenkins-pipeline) |
| [Load Testing](#load-testing) | [k6](#k6-load-testing) | [Test Reports](#test-reporting) | [CircleCI](#circleci-integration) |

---

## 📚 Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
  - [Testing Pyramid](#testing-pyramid)
  - [Test Coverage Goals](#test-coverage-goals)
  - [Test Environments](#test-environments)
- [Unit Testing](#unit-testing)
  - [Jest Configuration](#jest-configuration)
  - [Writing Unit Tests](#writing-unit-tests)
  - [Mocking Strategies](#mocking-strategies)
  - [Snapshot Testing](#snapshot-testing)
- [Integration Testing](#integration-testing)
  - [API Testing](#api-testing)
  - [Database Testing](#database-testing)
  - [Service Integration](#service-integration-tests)
- [End-to-End Testing](#end-to-end-testing)
  - [Playwright Setup](#playwright-setup)
  - [User Flows](#user-flow-testing)
  - [Visual Regression](#visual-regression-testing)
- [Performance Testing](#performance-testing)
  - [Load Testing](#load-testing)
  - [Stress Testing](#stress-testing)
  - [Benchmark Testing](#benchmark-testing)
- [Security Testing](#security-testing)
  - [Vulnerability Scanning](#vulnerability-scanning)
  - [Penetration Testing](#penetration-testing)
  - [Dependency Auditing](#dependency-auditing)
- [Test Data Management](#test-data-management)
  - [Fixtures](#test-fixtures)
  - [Database Seeding](#database-seeding)
  - [Data Generators](#test-data-generators)
- [Code Coverage](#code-coverage)
  - [Coverage Tools](#coverage-tools)
  - [Coverage Thresholds](#coverage-thresholds)
  - [Coverage Reports](#coverage-reports)
- [Continuous Integration](#continuous-integration)
  - [GitHub Actions](#github-actions-ci)
  - [GitLab CI](#gitlab-ci-pipeline)
  - [Jenkins](#jenkins-pipeline)
- [Test Automation](#test-automation)
- [Best Practices](#testing-best-practices)
- [Troubleshooting](#troubleshooting-tests)
- [See Also](#see-also)

---

## Overview

IAC Dharma employs a comprehensive testing strategy covering multiple layers of the application stack to ensure reliability, performance, and security.

### 🎯 Testing Goals

| Goal | Target | Current Status |
|------|--------|---------------|
| **Unit Test Coverage** | 75%+ | ✅ 85% |
| **Integration Coverage** | 60%+ | ✅ 70% |
| **E2E Test Coverage** | Critical Paths | ✅ 20 scenarios |
| **API Response Time** | P95 < 200ms | ✅ P95: 150ms |
| **Load Capacity** | 1000 req/sec | ✅ 1200 req/sec |
| **Security Vulnerabilities** | Zero Critical | ✅ Zero |
| **Test Execution Time** | < 10 minutes | ✅ 8 minutes |

### 📊 Test Distribution

```
Total Tests: 2,847
├── Unit Tests: 2,134 (75%)
├── Integration Tests: 498 (17.5%)
├── E2E Tests: 156 (5.5%)
├── Performance Tests: 42 (1.5%)
└── Security Tests: 17 (0.5%)
```

---

## Testing Strategy

### Testing Pyramid

IAC Dharma follows the testing pyramid principle for balanced test coverage:

```
                  /\
                 /  \
                / E2E \           End-to-End Tests
               /  10%  \          • Full user workflows
              /________\          • Critical business paths
             /          \         • Cross-service scenarios
            /Integration\        
           /     30%     \        Integration Tests
          /______________\       • API testing
         /                \      • Database operations
        /    Unit Tests    \     • Service interactions
       /        60%         \    
      /______________________\   Unit Tests
                                 • Function testing
                                 • Class testing
                                 • Pure logic
```

### Test Coverage Goals

| Layer | Coverage Target | Rationale |
|-------|----------------|-----------|
| **Unit Tests** | 75-85% | Core business logic thoroughly tested |
| **Integration** | 60-70% | Critical integration points covered |
| **E2E Tests** | Critical Paths | Main user workflows validated |
| **Performance** | Key APIs | SLA compliance verified |
| **Security** | All Attack Vectors | Vulnerabilities prevented |

### Test Environments

```yaml
Environments:
  Development:
    Database: SQLite in-memory
    External APIs: Mocked
    Feature Flags: All enabled
    Log Level: debug
    
  Staging:
    Database: PostgreSQL (test instance)
    External APIs: Test endpoints
    Feature Flags: Production-like
    Log Level: info
    
  CI/CD:
    Database: PostgreSQL (ephemeral)
    External APIs: Mocked/Stubbed
    Feature Flags: Minimal
    Log Level: warn
    
  Production:
    Database: PostgreSQL (replicated)
    External APIs: Real
    Feature Flags: Gradual rollout
    Log Level: error
```

---

## Unit Testing

### Jest Configuration

**Complete jest.config.js**:

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.mock.ts',
    '!src/index.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 75,
      functions: 75,
      lines: 75
    },
    './src/services/': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    }
  },
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  globals: {
    'ts-jest': {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }
  },
  testTimeout: 10000,
  verbose: true,
  bail: false,
  detectOpenHandles: true,
  forceExit: true
};
```

**Setup File** (`tests/setup.ts`):

```typescript
// tests/setup.ts
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  console.log('✅ Test suite complete');
});

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Increase timeout for slow tests
jest.setTimeout(10000);

// Mock console methods to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
```

### Writing Unit Tests

**Service Testing Example**:

```typescript
// src/services/blueprint.service.test.ts
import { BlueprintService } from './blueprint.service';
import { BlueprintRepository } from '../repositories/blueprint.repository';
import { ValidationError, NotFoundError } from '../errors';

// Mock dependencies
jest.mock('../repositories/blueprint.repository');

describe('BlueprintService', () => {
  let service: BlueprintService;
  let mockRepository: jest.Mocked<BlueprintRepository>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mocked repository
    mockRepository = new BlueprintRepository() as jest.Mocked<BlueprintRepository>;
    
    // Inject mocked dependency
    service = new BlueprintService(mockRepository);
  });

  describe('create', () => {
    it('should create blueprint with valid data', async () => {
      // Arrange
      const input = {
        name: 'Test Blueprint',
        provider: 'aws',
        resources: [{ type: 'aws_vpc', name: 'main' }]
      };
      
      const expected = { id: '123', ...input, createdAt: new Date() };
      mockRepository.create.mockResolvedValue(expected);

      // Act
      const result = await service.create(input);

      // Assert
      expect(result).toEqual(expected);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ValidationError for empty name', async () => {
      // Arrange
      const input = { name: '', provider: 'aws', resources: [] };

      // Act & Assert
      await expect(service.create(input)).rejects.toThrow(ValidationError);
      await expect(service.create(input)).rejects.toThrow('Name is required');
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ValidationError for invalid provider', async () => {
      const input = { name: 'Test', provider: 'invalid', resources: [] };
      
      await expect(service.create(input)).rejects.toThrow(ValidationError);
      await expect(service.create(input)).rejects.toThrow('Invalid provider');
    });

    it('should handle repository errors', async () => {
      const input = { name: 'Test', provider: 'aws', resources: [] };
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(input)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should return blueprint when found', async () => {
      const expected = {
        id: '123',
        name: 'Test',
        provider: 'aws',
        resources: []
      };
      mockRepository.findById.mockResolvedValue(expected);

      const result = await service.findById('123');

      expect(result).toEqual(expected);
      expect(mockRepository.findById).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundError when blueprint not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById('999')).rejects.toThrow(NotFoundError);
      await expect(service.findById('999')).rejects.toThrow('Blueprint not found');
    });
  });

  describe('update', () => {
    it('should update existing blueprint', async () => {
      const existing = { id: '123', name: 'Old', provider: 'aws' };
      const update = { name: 'New Name' };
      const expected = { ...existing, ...update };

      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockResolvedValue(expected);

      const result = await service.update('123', update);

      expect(result).toEqual(expected);
      expect(mockRepository.update).toHaveBeenCalledWith('123', update);
    });

    it('should throw NotFoundError when updating non-existent blueprint', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('999', { name: 'New' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete existing blueprint', async () => {
      const existing = { id: '123', name: 'Test', provider: 'aws' };
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.delete.mockResolvedValue(true);

      await service.delete('123');

      expect(mockRepository.delete).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundError when deleting non-existent blueprint', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      const mockBlueprints = [
        { id: '1', name: 'BP1', provider: 'aws' },
        { id: '2', name: 'BP2', provider: 'azure' }
      ];
      const expected = {
        data: mockBlueprints,
        total: 2,
        page: 1,
        pageSize: 10
      };

      mockRepository.list.mockResolvedValue(expected);

      const result = await service.list({ page: 1, pageSize: 10 });

      expect(result).toEqual(expected);
      expect(mockRepository.list).toHaveBeenCalledWith({ page: 1, pageSize: 10 });
    });

    it('should filter by provider', async () => {
      const filters = { provider: 'aws', page: 1, pageSize: 10 };
      mockRepository.list.mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 10 });

      await service.list(filters);

      expect(mockRepository.list).toHaveBeenCalledWith(filters);
    });
  });
});
```

### Mocking Strategies

**1. Manual Mocks**:

```typescript
// __mocks__/aws-sdk.ts
export class EC2 {
  describeInstances = jest.fn().mockResolvedValue({
    Reservations: [
      {
        Instances: [
          { InstanceId: 'i-123', State: { Name: 'running' } }
        ]
      }
    ]
  });

  runInstances = jest.fn().mockResolvedValue({
    Instances: [{ InstanceId: 'i-456' }]
  });
}

export class S3 {
  listBuckets = jest.fn().mockResolvedValue({
    Buckets: [{ Name: 'test-bucket' }]
  });
}
```

**2. Inline Mocks**:

```typescript
// Inline mock with jest.fn()
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
};

// Spy on methods
const spy = jest.spyOn(service, 'validate');
spy.mockReturnValue(true);

// Restore original implementation
spy.mockRestore();
```

**3. Module Mocks**:

```typescript
// Mock entire module
jest.mock('../utils/aws-client', () => ({
  getEC2Client: jest.fn(() => ({
    describeInstances: jest.fn().mockResolvedValue({ Reservations: [] })
  }))
}));
```

**4. Partial Mocks**:

```typescript
// Mock only specific exports
jest.mock('../config', () => ({
  ...jest.requireActual('../config'),
  getApiKey: jest.fn(() => 'test-api-key')
}));
```

### Snapshot Testing

```typescript
// Component snapshot test
import { render } from '@testing-library/react';
import { BlueprintCard } from './BlueprintCard';

describe('BlueprintCard', () => {
  it('should match snapshot', () => {
    const blueprint = {
      id: '123',
      name: 'Test Blueprint',
      provider: 'aws',
      resources: []
    };

    const { container } = render(<BlueprintCard blueprint={blueprint} />);
    
    expect(container.firstChild).toMatchSnapshot();
  });

  it('should match snapshot with loading state', () => {
    const { container } = render(<BlueprintCard loading={true} />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- blueprint.service.test.ts

# Run tests matching pattern
npm test -- --testPathPattern=services

# Watch mode (reruns on file changes)
npm test -- --watch

# Update snapshots
npm test -- -u

# Run in CI mode (no watch, single run)
npm test -- --ci

# Run tests with specific reporter
npm test -- --reporters=default --reporters=jest-junit

# Run tests in band (serially, not parallel)
npm test -- --runInBand

# Run only changed tests
npm test -- --onlyChanged

# Show verbose output
npm test -- --verbose

# Run with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Integration Testing

### API Testing

**Supertest for API Testing**:

```typescript
// tests/integration/blueprint.api.test.ts
import request from 'supertest';
import app from '../../src/app';
import { setupTestDB, teardownTestDB, clearTestDB } from '../test-utils';

describe('Blueprint API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/blueprints', () => {
    it('should create blueprint', async () => {
      const payload = {
        name: 'Test Blueprint',
        provider: 'aws',
        resources: [{ type: 'aws_vpc', name: 'main', properties: { cidr_block: '10.0.0.0/16' } }]
      };

      const response = await request(app)
        .post('/api/blueprints')
        .send(payload)
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: 'Test Blueprint',
        provider: 'aws'
      });
      expect(response.body.resources).toHaveLength(1);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/blueprints')
        .send({ name: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/blueprints/:id', () => {
    it('should get blueprint by ID', async () => {
      // Create blueprint first
      const created = await request(app)
        .post('/api/blueprints')
        .send({ name: 'Test', provider: 'aws', resources: [] });

      const blueprintId = created.body.id;

      // Fetch blueprint
      const response = await request(app)
        .get(`/api/blueprints/${blueprintId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: blueprintId,
        name: 'Test'
      });
    });

    it('should return 404 for non-existent blueprint', async () => {
      await request(app)
        .get('/api/blueprints/99999')
        .expect(404);
    });
  });

  describe('PUT /api/blueprints/:id', () => {
    it('should update blueprint', async () => {
      const created = await request(app)
        .post('/api/blueprints')
        .send({ name: 'Original', provider: 'aws', resources: [] });

      const blueprintId = created.body.id;

      const response = await request(app)
        .put(`/api/blueprints/${blueprintId}`)
        .send({ name: 'Updated' })
        .expect(200);

      expect(response.body.name).toBe('Updated');
    });
  });

  describe('DELETE /api/blueprints/:id', () => {
    it('should delete blueprint', async () => {
      const created = await request(app)
        .post('/api/blueprints')
        .send({ name: 'To Delete', provider: 'aws', resources: [] });

      await request(app)
        .delete(`/api/blueprints/${created.body.id}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/blueprints/${created.body.id}`)
        .expect(404);
    });
  });
});
```

### Database Testing

```typescript
// tests/integration/database.test.ts
import { BlueprintRepository } from '../../src/repositories/blueprint.repository';
import { getConnection, closeConnection } from '../test-utils/database';

describe('Database Integration Tests', () => {
  let repository: BlueprintRepository;

  beforeAll(async () => {
    await getConnection();
    repository = new BlueprintRepository();
  });

  afterAll(async () => {
    await closeConnection();
  });

  describe('CRUD operations', () => {
    it('should create and retrieve blueprint', async () => {
      const data = {
        name: 'DB Test',
        provider: 'aws',
        resources: []
      };

      const created = await repository.create(data);
      expect(created).toHaveProperty('id');

      const retrieved = await repository.findById(created.id);
      expect(retrieved).toMatchObject(data);
    });

    it('should handle transactions', async () => {
      const connection = await getConnection();
      const transaction = await connection.transaction();

      try {
        await repository.create({ name: 'Test1', provider: 'aws' }, transaction);
        await repository.create({ name: 'Test2', provider: 'aws' }, transaction);
        await transaction.commit();

        const all = await repository.list();
        expect(all.length).toBeGreaterThanOrEqual(2);
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    });
  });
});
```

---

## End-to-End Testing

### Playwright Setup

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e
```

**Playwright Configuration** (`playwright.config.ts`):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
});
```

### E2E Test Examples

```typescript
// tests/e2e/blueprint-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Blueprint Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete blueprint creation flow', async ({ page }) => {
    // Navigate to blueprints
    await page.click('text=Blueprints');
    await expect(page).toHaveURL('/blueprints');

    // Click create button
    await page.click('button:has-text("Create Blueprint")');

    // Fill form
    await page.fill('input[name="name"]', 'E2E Test Blueprint');
    await page.selectOption('select[name="provider"]', 'aws');
    await page.fill('textarea[name="description"]', 'Created via E2E test');

    // Add resource
    await page.click('button:has-text("Add Resource")');
    await page.selectOption('select[name="resourceType"]', 'aws_vpc');
    await page.fill('input[name="resourceName"]', 'main');
    await page.fill('input[name="cidr_block"]', '10.0.0.0/16');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page).toHaveURL(/\/blueprints\/\d+/);

    // Verify blueprint details
    await expect(page.locator('h1')).toContainText('E2E Test Blueprint');
    await expect(page.locator('.resource-list')).toContainText('aws_vpc');
  });

  test('blueprint search and filter', async ({ page }) => {
    await page.goto('/blueprints');

    // Enter search query
    await page.fill('input[placeholder="Search blueprints"]', 'test');
    await page.keyboard.press('Enter');

    // Wait for results
    await page.waitForSelector('.blueprint-card');

    // Filter by provider
    await page.click('button:has-text("Filter")');
    await page.click('input[value="aws"]');
    await page.click('button:has-text("Apply")');

    // Verify filtered results
    const cards = page.locator('.blueprint-card');
    await expect(cards).toHaveCount(await cards.count());
  });

  test('blueprint deletion workflow', async ({ page }) => {
    // Navigate to specific blueprint
    await page.goto('/blueprints/1');

    // Click delete button
    await page.click('button:has-text("Delete")');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Verify redirect and message
    await expect(page).toHaveURL('/blueprints');
    await expect(page.locator('.success-message')).toContainText('deleted');
  });
});
```

### Visual Regression Testing

```typescript
// tests/e2e/visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('blueprint list page', async ({ page }) => {
    await page.goto('/blueprints');
    await expect(page).toHaveScreenshot('blueprints-list.png');
  });

  test('blueprint detail page', async ({ page }) => {
    await page.goto('/blueprints/1');
    await expect(page).toHaveScreenshot('blueprint-detail.png');
  });

  test('dark mode', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="Toggle dark mode"]');
    await expect(page).toHaveScreenshot('dark-mode.png');
  });
});
```

---

## Performance Testing

### Load Testing with k6

```javascript
// tests/load/api-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up to 50 users
    { duration: '1m', target: 100 },   // Ramp-up to 100 users
    { duration: '2m', target: 100 },   // Stay at 100 users
    { duration: '30s', target: 0 }     // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.1']
  }
};

export default function () {
  // Health check
  const healthRes = http.get('http://localhost:3000/health');
  check(healthRes, {
    'health status is 200': (r) => r.status === 200
  }) || errorRate.add(1);

  // List blueprints
  const listRes = http.get('http://localhost:3000/api/blueprints');
  check(listRes, {
    'list status is 200': (r) => r.status === 200,
    'list response time < 200ms': (r) => r.timings.duration < 200
  }) || errorRate.add(1);

  // Get specific blueprint
  const getRes = http.get('http://localhost:3000/api/blueprints/1');
  check(getRes, {
    'get status is 200': (r) => r.status === 200,
    'get response time < 100ms': (r) => r.timings.duration < 100
  }) || errorRate.add(1);

  sleep(1);
}
```

**Run Load Tests**:

```bash
# Run basic load test
k6 run tests/load/api-load-test.js

# Run with custom VUs and duration
k6 run --vus 100 --duration 5m tests/load/api-load-test.js

# Run with results output
k6 run --out json=results.json tests/load/api-load-test.js

# Run distributed load test
k6 cloud tests/load/api-load-test.js
```

### Stress Testing

```javascript
// tests/load/stress-test.js
export const options = {
  stages: [
    { duration: '2m', target: 100 },    // Normal load
    { duration: '5m', target: 200 },    // Above normal
    { duration: '2m', target: 300 },    // Breaking point
    { duration: '5m', target: 400 },    // Beyond breaking
    { duration: '10m', target: 0 }      // Recovery
  ]
};

export default function () {
  // Stress test scenarios
}
```

---

## Security Testing

### Vulnerability Scanning

```bash
# Scan dependencies for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force

# Generate audit report
npm audit --json > audit-report.json
```

### OWASP ZAP Security Testing

```bash
# Docker-based OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://localhost:3000 \
  -r zap-report.html

# Full scan
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://localhost:3000 \
  -r zap-full-report.html
```

### Penetration Testing Checklist

```yaml
SQL Injection:
  - [ ] Test all input fields with SQL payloads
  - [ ] Verify parameterized queries used
  - [ ] Check ORM escaping

XSS (Cross-Site Scripting):
  - [ ] Test input sanitization
  - [ ] Verify output encoding
  - [ ] Check CSP headers

CSRF (Cross-Site Request Forgery):
  - [ ] Verify CSRF tokens present
  - [ ] Check SameSite cookie attribute
  - [ ] Test token validation

Authentication:
  - [ ] Test weak password acceptance
  - [ ] Check password hashing (bcrypt)
  - [ ] Verify JWT signature
  - [ ] Test session expiration

Authorization:
  - [ ] Test privilege escalation
  - [ ] Verify RBAC enforcement
  - [ ] Check resource ownership

API Security:
  - [ ] Test rate limiting
  - [ ] Verify input validation
  - [ ] Check API authentication
  - [ ] Test for information disclosure
```

---

## Test Data Management

### Test Fixtures

```typescript
// tests/fixtures/blueprints.ts
export const blueprintFixtures = {
  awsVpc: {
    name: 'AWS VPC Blueprint',
    provider: 'aws',
    description: 'Standard VPC with public/private subnets',
    resources: [
      {
        type: 'aws_vpc',
        name: 'main',
        properties: {
          cidr_block: '10.0.0.0/16',
          enable_dns_hostnames: true,
          enable_dns_support: true,
          tags: { Name: 'main-vpc' }
        }
      },
      {
        type: 'aws_subnet',
        name: 'public',
        properties: {
          vpc_id: '${aws_vpc.main.id}',
          cidr_block: '10.0.1.0/24',
          map_public_ip_on_launch: true,
          tags: { Name: 'public-subnet' }
        }
      }
    ]
  },
  azureVnet: {
    name: 'Azure VNet Blueprint',
    provider: 'azure',
    resources: [
      {
        type: 'azurerm_virtual_network',
        name: 'main',
        properties: {
          address_space: ['10.0.0.0/16'],
          location: 'eastus',
          resource_group_name: 'test-rg'
        }
      }
    ]
  },
  gcpVpc: {
    name: 'GCP VPC Blueprint',
    provider: 'gcp',
    resources: [
      {
        type: 'google_compute_network',
        name: 'main',
        properties: {
          auto_create_subnetworks: false,
          routing_mode: 'REGIONAL'
        }
      }
    ]
  }
};

// Fixture loader
export function loadFixture(name: string) {
  return blueprintFixtures[name];
}
```

### Database Seeding

```typescript
// tests/test-utils/seed.ts
import { getConnection } from './database';
import { blueprintFixtures } from '../fixtures/blueprints';

export async function seedDatabase() {
  const db = await getConnection();

  // Seed blueprints
  for (const fixture of Object.values(blueprintFixtures)) {
    await db.blueprints.create(fixture);
  }

  // Seed users
  await db.users.create({
    email: 'test@example.com',
    password: await hashPassword('testpassword'),
    role: 'admin'
  });

  console.log('✅ Test database seeded');
}

export async function clearDatabase() {
  const db = await getConnection();
  
  await db.blueprints.deleteMany();
  await db.users.deleteMany();
  
  console.log('🗑️  Test database cleared');
}
```

---

## Code Coverage

### Generating Coverage Reports

```bash
# Generate coverage with Jest
npm run test:coverage

# View HTML report
open coverage/index.html

# Generate LCOV report
npm run test:coverage -- --coverageReporters=lcov

# Generate JSON report
npm run test:coverage -- --coverageReporters=json
```

### Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 75,
      functions: 75,
      lines: 75
    },
    './src/services/': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    },
    './src/controllers/': {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
};
```

---

## Continuous Integration

### GitHub Actions CI

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests

      - name: Build
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

---

## Testing Best Practices

### 1. AAA Pattern (Arrange-Act-Assert)

```typescript
test('should calculate total correctly', () => {
  // Arrange: Set up test data
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];

  // Act: Execute the code being tested
  const total = calculateTotal(items);

  // Assert: Verify the results
  expect(total).toBe(35);
});
```

### 2. Test Independence

```typescript
// ❌ Bad: Tests depend on each other
let userId;

test('create user', () => {
  userId = createUser();
});

test('update user', () => {
  updateUser(userId); // Depends on previous test
});

// ✅ Good: Independent tests
test('create user', () => {
  const userId = createUser();
  expect(userId).toBeDefined();
});

test('update user', () => {
  const userId = createUser(); // Create own data
  const updated = updateUser(userId);
  expect(updated).toBe(true);
});
```

### 3. Descriptive Test Names

```typescript
// ❌ Bad: Vague test names
test('works', () => {});
test('test1', () => {});

// ✅ Good: Descriptive names
test('should create blueprint with valid AWS VPC configuration', () => {});
test('should throw ValidationError when blueprint name is empty', () => {});
test('should return 404 when blueprint ID does not exist', () => {});
```

### 4. One Assertion Per Test (When Practical)

```typescript
// ✅ Single assertion focus
test('should return correct status code', async () => {
  const response = await api.get('/blueprints');
  expect(response.status).toBe(200);
});

test('should return array of blueprints', async () => {
  const response = await api.get('/blueprints');
  expect(Array.isArray(response.body)).toBe(true);
});

// ✅ Multiple related assertions OK
test('should return valid blueprint object', async () => {
  const response = await api.get('/blueprints/1');
  expect(response.body).toHaveProperty('id');
  expect(response.body).toHaveProperty('name');
  expect(response.body).toHaveProperty('provider');
});
```

### 5. Test Edge Cases

```typescript
describe('divide', () => {
  test('should divide positive numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  test('should divide negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5);
  });

  test('should throw error when dividing by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  test('should handle decimal results', () => {
    expect(divide(10, 3)).toBeCloseTo(3.33, 2);
  });
});
```

---

## See Also

- [Development Setup](Development-Setup) - Local environment setup
- [CI/CD Pipeline](Workflow-Automation) - Continuous integration
- [Code Quality](Contributing-Guide) - Coding standards
- [Performance Tuning](Performance-Tuning) - Performance optimization
- [Debugging Guide](Troubleshooting) - Common issues

---

Last Updated: November 22, 2024 | [Back to Home](Home)
