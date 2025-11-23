# Testing Guidelines for IAC DHARMA Platform

**Version:** 2.0.0  
**Date:** November 23, 2025  
**Status:** Production Ready

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [End-to-End Testing](#end-to-end-testing)
5. [Performance Testing](#performance-testing)
6. [Accessibility Testing](#accessibility-testing)
7. [Security Testing](#security-testing)
8. [Test Automation](#test-automation)

---

## Testing Strategy

### Testing Pyramid

```
           /\
          /  \         E2E Tests (10%)
         /    \        - Critical user flows
        /______\       - Cross-browser testing
       /        \      
      /          \     Integration Tests (30%)
     /            \    - API integration
    /______________\   - Component integration
   /                \  
  /                  \ Unit Tests (60%)
 /____________________\ - Components
                        - Utilities
                        - Business logic
```

### Testing Principles

1. **Test Behavior, Not Implementation** - Focus on what the code does, not how
2. **Write Tests First (TDD)** - When adding new features
3. **Keep Tests Simple** - One assertion per test when possible
4. **Mock External Dependencies** - Isolate units under test
5. **Maintain High Coverage** - Aim for > 80% code coverage

---

## Unit Testing

### Frontend Unit Tests (Vitest + React Testing Library)

**Setup:**

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

**Configuration:** `frontend/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
});
```

**Example Component Test:**

```typescript
// frontend/src/components/__tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });

  it('renders loading state', () => {
    render(<Button loading>Click Me</Button>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

**Example Utility Test:**

```typescript
// frontend/src/utils/__tests__/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatBytes } from '../formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('formats USD correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('handles zero', () => {
      expect(formatCurrency(0)).toBe('$0.00');
    });

    it('handles negative numbers', () => {
      expect(formatCurrency(-100)).toBe('-$100.00');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2025-11-23T10:30:00Z');
      expect(formatDate(date)).toBe('Nov 23, 2025');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });
});
```

**Example Hook Test:**

```typescript
// frontend/src/hooks/__tests__/useMediaQuery.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useIsMobile } from '../useMediaQuery';

describe('useMediaQuery', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: originalInnerWidth,
    });
  });

  it('returns true for mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false for desktop viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1200,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
```

**Running Unit Tests:**

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- Button.test.tsx
```

### Backend Unit Tests (Jest)

**Example API Test:**

```typescript
// backend/api-gateway/src/__tests__/auth.test.ts
import request from 'supertest';
import app from '../app';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('returns token on valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('returns 401 on invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 400 on missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });
  });
});
```

---

## Integration Testing

### API Integration Tests

**Example:**

```typescript
// tests/integration/project-workflow.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { projectsApi, blueprintsApi, iacGeneratorApi } from '../services/api.service';

describe('Project Creation Workflow', () => {
  let authToken: string;
  let projectId: string;
  let blueprintId: string;

  beforeAll(async () => {
    // Login
    const { token } = await authApi.login('test@example.com', 'password');
    authToken = token;
  });

  it('creates a new project', async () => {
    const project = await projectsApi.create({
      name: 'Test Project',
      description: 'Integration test project',
      budget: 10000,
    });

    expect(project).toHaveProperty('id');
    projectId = project.id;
  });

  it('creates a blueprint for the project', async () => {
    const blueprint = await blueprintsApi.create({
      name: 'Test Blueprint',
      projectId,
      resources: [
        { type: 'vpc', config: { cidr: '10.0.0.0/16' } },
      ],
    });

    expect(blueprint).toHaveProperty('id');
    blueprintId = blueprint.id;
  });

  it('generates IaC code from blueprint', async () => {
    const { jobId } = await iacGeneratorApi.generate(blueprintId, 'terraform');
    expect(jobId).toBeDefined();

    // Poll for completion
    let jobStatus;
    let attempts = 0;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      jobStatus = await iacGeneratorApi.getJobStatus(jobId);
      attempts++;
    } while (jobStatus.status === 'pending' && attempts < 30);

    expect(jobStatus.status).toBe('completed');
    expect(jobStatus.code).toBeDefined();
  });
});
```

---

## End-to-End Testing

### Playwright E2E Tests

**Setup:**

```bash
cd frontend
npm install -D @playwright/test
npx playwright install
```

**Configuration:** `frontend/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

**Example E2E Test:**

```typescript
// frontend/e2e/project-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('creates a new project', async ({ page }) => {
    // Navigate to projects
    await page.click('a[href="/projects"]');
    await expect(page).toHaveURL('/projects');

    // Click create project button
    await page.click('button:has-text("Create Project")');
    await expect(page).toHaveURL('/projects/new');

    // Fill project form
    await page.fill('input[name="name"]', 'E2E Test Project');
    await page.fill('textarea[name="description"]', 'Created via E2E test');
    await page.fill('input[name="budget"]', '50000');
    
    // Select dates
    await page.fill('input[name="startDate"]', '2025-12-01');
    await page.fill('input[name="endDate"]', '2026-03-01');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('.toast-success')).toContainText('Project created');
    await expect(page).toHaveURL('/projects');
  });

  test('validates required fields', async ({ page }) => {
    await page.goto('/projects/new');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Budget is required')).toBeVisible();
  });
});
```

**Running E2E Tests:**

```bash
# Run all E2E tests
npx playwright test

# Run specific test file
npx playwright test project-creation.spec.ts

# Run with UI mode
npx playwright test --ui

# Generate test report
npx playwright show-report
```

---

## Performance Testing

### Lighthouse CI

**Configuration:** `frontend/.lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:5173/"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.95 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

**Run Performance Tests:**

```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audit
lhci autorun
```

### Load Testing (k6)

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% failure rate
  },
};

export default function () {
  const res = http.get('https://api.iac-dharma.com/health');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

**Run Load Tests:**

```bash
k6 run tests/performance/load-test.js
```

---

## Accessibility Testing

### axe-core Integration

```typescript
// frontend/src/test/accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Dashboard from '../pages/Dashboard';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Dashboard has no accessibility violations', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing Checklist

- [ ] Keyboard navigation works (Tab, Arrow keys, Enter, Escape)
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA standards (4.5:1)
- [ ] Focus indicators are visible
- [ ] Form labels are properly associated
- [ ] Error messages are announced to screen readers
- [ ] Interactive elements have appropriate ARIA attributes
- [ ] Images have alt text
- [ ] Headings follow proper hierarchy

---

## Security Testing

### OWASP ZAP Scanning

```bash
# Pull OWASP ZAP Docker image
docker pull owasp/zap2docker-stable

# Run baseline scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://app.iac-dharma.com \
  -r security-report.html
```

### Security Audit Checklist

- [ ] npm audit shows no high/critical vulnerabilities
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (input sanitization)
- [ ] CSRF tokens implemented
- [ ] Rate limiting on API endpoints
- [ ] Authentication tokens secured
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Environment secrets not exposed
- [ ] CORS properly configured

---

## Test Automation

### CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run unit tests
        run: |
          cd frontend
          npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install Playwright
        run: |
          cd frontend
          npm ci
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd frontend
          npm run build
          npm run preview &
          npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: frontend/playwright-report/

  security-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: |
          cd frontend
          npm audit --audit-level=high
```

---

## Test Coverage Goals

| Component | Target Coverage |
|-----------|----------------|
| Utilities | > 90% |
| Components | > 80% |
| Pages | > 70% |
| API Services | > 85% |
| Hooks | > 80% |
| **Overall** | **> 80%** |

---

## Conclusion

A comprehensive testing strategy ensures:

✅ **Code Quality** - Catch bugs early  
✅ **Confidence** - Deploy with certainty  
✅ **Documentation** - Tests serve as examples  
✅ **Maintainability** - Prevent regressions  
✅ **Performance** - Optimize continuously  
✅ **Accessibility** - Inclusive for all users  
✅ **Security** - Protect user data  

**Next Steps:**
1. Set up testing framework (Vitest + Playwright)
2. Write tests for critical paths
3. Integrate with CI/CD pipeline
4. Monitor test results and coverage
5. Continuously improve test suite

---

**Document Version:** 2.0.0  
**Last Updated:** November 23, 2025
