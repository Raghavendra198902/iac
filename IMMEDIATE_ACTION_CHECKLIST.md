# ⚡ Immediate Action Checklist - IAC Platform

**Priority:** CRITICAL Security & Code Quality Fixes  
**Timeline:** 1 Week Sprint  
**Owner:** Development Team

---

## 🔴 DAY 1-2: CRITICAL SECURITY FIXES

### 1. Remove Hardcoded Secrets (4 hours)

```bash
# Step 1: Audit all hardcoded secrets
grep -r "apiKey.*=.*['\"]" frontend/src/ --include="*.ts" --include="*.tsx" | grep -v "process.env"
grep -r "password.*=.*['\"]" . --include="*.yml" | grep -v "POSTGRES_PASSWORD"

# Step 2: Create secure template
cp .env.example .env.template

# Step 3: Remove from source code
# Files to fix:
# - frontend/src/pages/Settings.tsx:136
# - frontend-e2e/src/pages/Admin/AdminLicense.tsx:45
# - docker-compose.v3.yml (remove default passwords)
```

**Checklist:**
- [ ] Remove `apiKey: 'sk-iacdharma-xxxxxxxxxxxxxxxx'` from Settings.tsx
- [ ] Remove `licenseKey: 'XXXX-...'` from AdminLicense.tsx
- [ ] Update docker-compose.v3.yml to require secrets (no `:-defaults`)
- [ ] Create `.env.template` with all required variables
- [ ] Add startup validation script
- [ ] Update documentation with secret generation guide

---

### 2. Replace Console Logging (6 hours)

```bash
# Step 1: Install Winston in all backend services
cd backend/advanced-rbac-service && npm install winston
cd backend/blueprint-service && npm install winston
cd backend/monitoring-service && npm install winston
cd backend/iac-generator && npm install winston
cd backend/orchestrator-service && npm install winston

# Step 2: Create shared logger package
mkdir -p packages/logger
cd packages/logger && npm init -y
npm install winston
```

**Create Logger Package:**
```typescript
// packages/logger/src/index.ts
import winston from 'winston';

export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.File({ 
        filename: 'logs/error.log', 
        level: 'error' 
      }),
      new winston.transports.File({ 
        filename: 'logs/combined.log' 
      }),
    ],
  });
};
```

**Files to Update (30+ occurrences):**
- [ ] backend/advanced-rbac-service/src/index.ts (11 console.* calls)
- [ ] backend/blueprint-service/src/index.ts (4 console.* calls)
- [ ] backend/monitoring-service/src/index.ts (4 console.* calls)
- [ ] backend/iac-generator/src/index.ts (4 console.* calls)
- [ ] backend/orchestrator-service/src/automation/approval-bot.ts (3 console.* calls)

**Search & Replace Pattern:**
```bash
# Find all console.log
find backend/ -name "*.ts" -type f -exec grep -l "console\." {} \;

# Replace pattern:
# console.log()  → logger.info()
# console.error() → logger.error()
# console.warn()  → logger.warn()
# console.debug() → logger.debug()
```

---

## 🟡 DAY 3: TypeScript Configuration Fixes

### 3. Update TypeScript Configurations (2 hours)

**Files to Update:**
```bash
backend/api-gateway/tsconfig.json
backend/cmdb-agent/tsconfig.json
backend/advanced-rbac-service/tsconfig.json
```

**Find & Replace:**
```json
// OLD (deprecated)
{
  "compilerOptions": {
    "moduleResolution": "node"
  }
}

// NEW (modern)
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "module": "ESNext",
    "target": "ES2020"
  }
}
```

**Checklist:**
- [ ] Update 3 backend tsconfig.json files
- [ ] Test builds: `npm run build` in each service
- [ ] Verify no deprecation warnings
- [ ] Commit changes

---

### 4. Install Missing Type Definitions (1 hour)

```bash
# Frontend
cd frontend
npm install --save-dev @types/node vite

# Backend services
cd backend/advanced-rbac-service
npm install --save-dev @types/express @types/cors @types/helmet @types/node

# Verify
npm run type-check
```

**Checklist:**
- [ ] Install frontend type definitions
- [ ] Install backend type definitions (5 services)
- [ ] Run `npm run build` successfully
- [ ] Update package.json files

---

## 🟢 DAY 4-5: Testing & Code Quality

### 5. Fix Testing Library Imports (2 hours)

**Pattern to Fix (10+ test files):**
```typescript
// WRONG
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// CORRECT
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
```

**Files to Update:**
- [ ] frontend-e2e/src/__tests__/unit/Dashboard.test.tsx
- [ ] frontend-e2e/src/__tests__/unit/Reports.test.tsx
- [ ] frontend-e2e/src/__tests__/unit/Admin.test.tsx
- [ ] frontend-e2e/src/__tests__/unit/CMDB.test.tsx
- [ ] frontend-e2e/src/__tests__/unit/AgentDownloads.test.tsx
- [ ] frontend-e2e/src/__tests__/security/auth.security.test.ts
- [ ] frontend-e2e/src/__tests__/security/security.test.tsx
- [ ] frontend-e2e/src/__tests__/integration/app.integration.test.tsx
- [ ] frontend-e2e/src/__tests__/integration/positive-negative.test.tsx
- [ ] frontend-e2e/src/__tests__/regression/regression.test.tsx

**Automated Fix:**
```bash
# Find and replace
find frontend-e2e/src/__tests__ -name "*.test.tsx" -o -name "*.test.ts" | \
  xargs sed -i "s/import { render, screen, fireEvent, waitFor } from '@testing-library\/react'/import { render } from '@testing-library\/react';\nimport { screen, fireEvent, waitFor } from '@testing-library\/dom'/g"
```

---

### 6. Run Comprehensive Tests (1 hour)

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Check coverage
npm run test:coverage
```

**Expected Results:**
- [ ] All unit tests passing
- [ ] 16/16 integration tests passing
- [ ] E2E tests passing
- [ ] Coverage > 70%

---

## 📋 VERIFICATION CHECKLIST

### Security Verification
```bash
# 1. Check for secrets in code
git secrets --scan

# 2. Check for console logs
grep -r "console\." backend/*/src --include="*.ts" | wc -l
# Should be 0

# 3. Verify environment validation
npm start # Should fail without .env
export JWT_SECRET=$(openssl rand -hex 32)
npm start # Should succeed
```

**Checklist:**
- [ ] Zero hardcoded secrets found
- [ ] Zero console.log in backend
- [ ] Startup validation works
- [ ] All secrets in .env file

---

### Build Verification
```bash
# 1. TypeScript builds
cd backend/api-gateway && npm run build
cd backend/advanced-rbac-service && npm run build
cd backend/cmdb-agent && npm run build

# 2. Frontend build
cd frontend && npm run build

# 3. Check for errors
echo "Build Status: $?"
```

**Checklist:**
- [ ] All backend builds succeed
- [ ] Frontend build succeeds
- [ ] Zero TypeScript errors
- [ ] Zero deprecation warnings

---

### Test Verification
```bash
# Run all tests
npm test

# Check test results
cat test-results/summary.json
```

**Expected:**
- [ ] Unit tests: 100% passing
- [ ] Integration tests: 16/16 passing
- [ ] E2E tests: passing
- [ ] No flaky tests

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Merging to Main
- [ ] All security fixes applied
- [ ] All tests passing
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped

### Before Deploying to Production
- [ ] Staging deployment successful
- [ ] Load tests passed
- [ ] Security scan clean
- [ ] Backup plan ready
- [ ] Rollback procedure tested
- [ ] Team notified

---

## 📊 PROGRESS TRACKING

### Day 1 Progress
- [ ] Security audit completed
- [ ] Hardcoded secrets removed
- [ ] .env.template created
- [ ] Startup validation added

### Day 2 Progress
- [ ] Logger package created
- [ ] 15+ services updated to use logger
- [ ] Console logging removed
- [ ] Log rotation configured

### Day 3 Progress
- [ ] TypeScript configs updated
- [ ] Type definitions installed
- [ ] Builds passing
- [ ] Deprecation warnings resolved

### Day 4 Progress
- [ ] Testing library imports fixed
- [ ] All tests passing
- [ ] Coverage report generated
- [ ] Test documentation updated

### Day 5 Progress
- [ ] Final verification complete
- [ ] Documentation updated
- [ ] PR created and reviewed
- [ ] Ready for merge

---

## 🎯 SUCCESS METRICS

### Before Sprint
- Security Issues: 15+ critical
- Console Logs: 30+ in production
- TypeScript Errors: 231
- Test Failures: 10+
- Build Warnings: 50+

### After Sprint (Target)
- Security Issues: 0 critical
- Console Logs: 0 in production
- TypeScript Errors: 0
- Test Failures: 0
- Build Warnings: 0

---

## 🤝 TEAM ASSIGNMENTS

### Developer 1 (Security Lead)
- Remove hardcoded secrets
- Update docker-compose files
- Create startup validation
- Security testing

### Developer 2 (Code Quality Lead)
- Create logger package
- Replace console logging
- Update TypeScript configs
- Install type definitions

### Developer 3 (Testing Lead)
- Fix testing library imports
- Run comprehensive tests
- Generate coverage reports
- Update test documentation

---

## 📞 SUPPORT & RESOURCES

### Documentation
- [Security Best Practices](docs/wiki/Security-Best-Practices.md)
- [TypeScript Guide](docs/wiki/TypeScript-Guide.md)
- [Testing Guide](docs/wiki/Testing-Guide.md)

### Tools
- Security: `git-secrets`, `snyk`, `trivy`
- Code Quality: `eslint`, `prettier`, `tsc`
- Testing: `jest`, `playwright`, `@testing-library/react`

### Contacts
- Security Questions: security-team@company.com
- Tech Questions: dev-team@company.com
- Emergency: on-call-engineer@company.com

---

**Sprint Start:** [Fill in date]  
**Sprint End:** [Fill in date]  
**Sprint Retrospective:** [Fill in date]

**Let's build secure, high-quality software! 🚀**
