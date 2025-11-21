# Quick Start - Testing Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ installed
- All services built and running

## 1. Start Services

```bash
# From project root
cd /home/rrd/Documents/Iac

# Start all Docker services
docker-compose up -d

# Verify services are running (wait 30 seconds for startup)
sleep 30
docker-compose ps
```

## 2. Run Integration Tests

```bash
# Navigate to integration tests
cd tests/integration

# Install dependencies (if not already done)
npm install

# Run all integration tests
npm test

# Run with coverage report
npm run test:coverage

# View coverage report in browser
xdg-open coverage/index.html  # Linux
# or
open coverage/index.html      # macOS
```

**Expected Results:**
- 39/77 tests passing
- 85% statement coverage
- 92% function coverage

## 3. Run E2E Tests

```bash
# Navigate to E2E tests
cd tests/e2e

# Install dependencies (if not already done)
npm install

# Install Playwright browsers (one-time setup)
npx playwright install chromium

# Run E2E tests (Chromium only for speed)
npx playwright test --project=chromium

# Run all browsers
npx playwright test

# Run with UI mode for debugging
npx playwright test --ui

# View HTML report
npx playwright show-report
```

**Expected Results:**
- 3/35 tests passing (error handling tests)
- Most tests fail/skip due to incomplete frontend UI
- Test infrastructure validated and operational

## 4. Common Commands

### Docker Management
```bash
# View service logs
docker-compose logs -f api-gateway

# Restart a specific service
docker-compose restart blueprint-service

# Stop all services
docker-compose down

# Rebuild and restart all services
docker-compose up -d --build
```

### Test Debugging
```bash
# Run specific integration test file
cd tests/integration
npm test -- test-api-gateway.spec.ts

# Run specific E2E test file
cd tests/e2e
npx playwright test tests/test-auth.spec.ts

# Run single E2E test by name
npx playwright test -g "TC002: Successful Login"

# Run tests with verbose output
npx playwright test --reporter=list

# Generate trace for debugging
npx playwright test --trace=on
```

## 5. Troubleshooting

### Integration Tests Failing
```bash
# Check if services are healthy
docker-compose ps

# Check service logs for errors
docker-compose logs api-gateway
docker-compose logs blueprint-service

# Restart services
docker-compose restart
```

### E2E Tests Timing Out
```bash
# Verify frontend is running
curl http://localhost:5173

# Check if login page loads
curl -I http://localhost:5173/login

# Increase timeout in playwright.config.ts if needed
```

### Coverage Report Not Generating
```bash
# Clean previous coverage data
cd tests/integration
rm -rf coverage/

# Run coverage command
npm run test:coverage

# Check if coverage directory exists
ls -la coverage/
```

## 6. Next Steps

Once frontend UI is implemented:
1. Re-run E2E tests to validate user workflows
2. Fix remaining integration test failures (implement missing API routes)
3. Add tests to CI/CD pipeline
4. Monitor coverage metrics on every commit

## 7. Quick Health Check

Run this script to verify everything is working:

```bash
#!/bin/bash
cd /home/rrd/Documents/Iac

echo "1. Checking Docker services..."
docker-compose ps | grep "Up" | wc -l
echo "Expected: 14 services running"

echo -e "\n2. Running quick integration test..."
cd tests/integration && npm test -- test-api-gateway.spec.ts 2>&1 | grep -E "Tests:|Test Suites:"

echo -e "\n3. Running quick E2E test (error handling)..."
cd ../e2e && npx playwright test tests/test-error-handling.spec.ts --project=chromium 2>&1 | grep -E "passed|failed"

echo -e "\n✅ Health check complete!"
```

## 8. Test Files Reference

### Integration Tests
- `test-api-gateway.spec.ts` - API Gateway health and routing
- `test-blueprint-workflow.spec.ts` - Blueprint CRUD operations
- `test-ai-integration.spec.ts` - AI generation features
- `test-e2e-workflows.spec.ts` - Complete user journeys

### E2E Tests
- `test-auth.spec.ts` - Login, logout, sessions (6 tests)
- `test-blueprints.spec.ts` - Blueprint management (6 tests)
- `test-ai-designer.spec.ts` - AI generation (4 tests)
- `test-provisioning.spec.ts` - IaC provisioning (7 tests)
- `test-security.spec.ts` - Security scanning (3 tests)
- `test-cost-optimization.spec.ts` - Cost analysis (3 tests)
- `test-monitoring.spec.ts` - Monitoring & drift (3 tests)
- `test-error-handling.spec.ts` - Error scenarios (4 tests)

**Total: 113 tests (77 integration + 36 E2E)**
