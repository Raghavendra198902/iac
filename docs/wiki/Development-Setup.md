---
**Document Type:** Developer Environment Setup Guide  
**Audience:** Software Engineers, Full-Stack Developers, Contributors  
**Classification:** Technical - Development  
**Version:** 2.0  
**Last Updated:** December 1, 2025  
**Estimated Time:** 30-60 minutes  
**Copyright:** © 2024-2025 Raghavendra Deshpande  
---

# 💻 Development Setup - IAC Dharma Platform

> **Developer Experience Excellence**: Complete guide to setting up your local development environment with hot-reload, debugging, and testing capabilities

---

## 🎯 Development Workflow Flow

```mermaid
flowchart TD
    A[Setup Environment] --> B[Install Dependencies]
    B --> C[Configure Services]
    C --> D[Start Development]
    
    D --> E[Code Changes]
    E --> F[Hot Reload]
    F --> G{Tests Pass?}
    
    G -->|Yes| H[Git Commit]
    G -->|No| I[Debug & Fix]
    I --> E
    
    H --> J[Push to Branch]
    J --> K[CI Pipeline]
    K --> L{CI Pass?}
    
    L -->|Yes| M[Create PR]
    L -->|No| N[Fix Issues]
    N --> E
    
    M --> O[Code Review]
    O --> P[Merge to Main]
    
    style A fill:#e1f5ff,stroke:#01579b,stroke-width:3px
    style D fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style F fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style P fill:#c8e6c9,stroke:#2e7d32,stroke-width:3px
```

---

## Prerequisites

### Required Software

#### 1. Node.js & npm
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be 10.x.x
```

#### 2. Docker & Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Verify installation
docker --version         # Should be 24.0+
docker compose version   # Should be 2.0+

# Log out and back in for group changes to take effect
```

#### 3. Git
```bash
# Install Git
sudo apt-get install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify
git --version  # Should be 2.30+
```

#### 4. Python (for AI Engine)
```bash
# Install Python 3.11
sudo apt-get install python3.11 python3.11-venv python3-pip

# Verify
python3.11 --version  # Should be 3.11.x
```

### Optional Tools

#### TypeScript & ts-node
```bash
npm install -g typescript ts-node
```

#### Terraform (for testing IaC generation)
```bash
wget https://releases.hashicorp.com/terraform/1.6.6/terraform_1.6.6_linux_amd64.zip
unzip terraform_1.6.6_linux_amd64.zip
sudo mv terraform /usr/local/bin/
terraform --version
```

#### kubectl (for Kubernetes testing)
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

---

## Project Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Raghavendra198902/iac.git
cd iac

# Verify you're on the master branch
git branch
```

### 2. Install Dependencies

#### Backend Services
```bash
# Install dependencies for all backend services
cd backend/api-gateway && npm install && cd ../..
cd backend/blueprint-service && npm install && cd ../..
cd backend/iac-generator && npm install && cd ../..
cd backend/guardrails-engine && npm install && cd ../..
cd backend/costing-service && npm install && cd ../..
cd backend/orchestrator-service && npm install && cd ../..
cd backend/automation-engine && npm install && cd ../..
cd backend/monitoring-service && npm install && cd ../..
cd backend/sso-service && npm install && cd ../..
cd backend/cloud-provider-service && npm install && cd ../..
cd backend/ai-recommendations-service && npm install && cd ../..
cd backend/cmdb-agent && npm install && cd ../..

# Or use this one-liner
for dir in backend/*/; do (cd "$dir" && npm install); done
```

#### AI Engine (Python)
```bash
cd backend/ai-engine
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..
```

#### Frontend
```bash
cd frontend
npm install
cd ..
```

### 3. Environment Configuration

#### Copy Environment Template
```bash
# Copy the example environment file
cp .env.example .env

# Edit with your preferred editor
nano .env
# OR
code .env
```

#### Environment Variables
```bash
# .env file configuration

# Node Environment
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iac_dharma
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=iac_dharma

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# API Gateway
API_GATEWAY_PORT=3000
API_RATE_LIMIT=100

# Microservices Ports
BLUEPRINT_SERVICE_PORT=3001
IAC_GENERATOR_PORT=3002
GUARDRAILS_ENGINE_PORT=3003
COSTING_SERVICE_PORT=3004
ORCHESTRATOR_SERVICE_PORT=3005
AUTOMATION_ENGINE_PORT=3006
MONITORING_SERVICE_PORT=3007
SSO_SERVICE_PORT=3012
CLOUD_PROVIDER_SERVICE_PORT=3010
AI_RECOMMENDATIONS_PORT=3011

# AI Engine (Python)
AI_ENGINE_PORT=8000
AI_ENGINE_URL=http://localhost:8000

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3030
JAEGER_PORT=16686

# Frontend
VITE_API_URL=http://localhost:3000

# Feature Flags
FEATURE_FLAGS_ENABLED=true
FEATURE_FLAGS_CACHE_TTL=60000

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json

# AWS (Optional - for testing)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# Azure (Optional - for testing)
AZURE_SUBSCRIPTION_ID=
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=

# GCP (Optional - for testing)
GOOGLE_APPLICATION_CREDENTIALS=
GCP_PROJECT_ID=
```

### 4. Database Setup

#### Start PostgreSQL
```bash
# Using Docker
docker run -d \
  --name postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=iac_dharma \
  -p 5432:5432 \
  postgres:15-alpine

# Verify connection
docker exec -it postgres psql -U postgres -d iac_dharma -c "SELECT version();"
```

#### Run Migrations
```bash
cd database
npm install

# Run all migrations
npm run migrate:up

# Verify tables
docker exec -it postgres psql -U postgres -d iac_dharma -c "\dt"
```

### 5. Redis Setup

```bash
# Start Redis
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:7-alpine

# Verify connection
docker exec -it redis redis-cli PING
# Should return: PONG
```

---

## Running Services

### Option 1: Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Stop all services
docker-compose down
```

### Option 2: Individual Services (for debugging)

#### Terminal 1: API Gateway
```bash
cd backend/api-gateway
npm run dev
# Runs on http://localhost:3000
```

#### Terminal 2: Blueprint Service
```bash
cd backend/blueprint-service
npm run dev
# Runs on http://localhost:3001
```

#### Terminal 3: IAC Generator
```bash
cd backend/iac-generator
npm run dev
# Runs on http://localhost:3002
```

#### Terminal 4: AI Engine
```bash
cd backend/ai-engine
source venv/bin/activate
uvicorn main:app --reload --port 8000
# Runs on http://localhost:8000
```

#### Terminal 5: Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
# Update master
git checkout master
git pull origin master

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

```bash
# Edit files
code backend/api-gateway/src/routes/blueprints.ts

# Run linter
npm run lint

# Format code
npm run format

# Run type check
npm run type-check
```

### 3. Test Changes

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

### 4. Commit Changes

```bash
# Stage changes
git add .

# Commit with conventional commit message
git commit -m "feat: add new blueprint validation"
# OR
git commit -m "fix: resolve memory leak in IAC generator"

# Push to remote
git push origin feature/your-feature-name
```

### 5. Create Pull Request

1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Fill in description
5. Request review
6. Wait for CI checks to pass
7. Merge after approval

---

## IDE Setup

### Visual Studio Code

#### Recommended Extensions
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-python.python",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker",
    "hashicorp.terraform",
    "redhat.vscode-yaml",
    "streetsidesoftware.code-spell-checker"
  ]
}
```

#### Workspace Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "eslint.workingDirectories": [
    "backend/api-gateway",
    "backend/blueprint-service",
    "frontend"
  ],
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  }
}
```

#### Launch Configuration
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API Gateway",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/backend/api-gateway",
      "console": "integratedTerminal"
    },
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Process",
      "port": 9229,
      "restart": true
    }
  ]
}
```

### IntelliJ IDEA / WebStorm

#### Import Project
1. File → Open
2. Select `iac` directory
3. Trust project
4. Wait for indexing

#### Configure Node.js
1. Settings → Languages & Frameworks → Node.js
2. Set Node interpreter: `/usr/bin/node`
3. Enable coding assistance

#### Configure TypeScript
1. Settings → Languages & Frameworks → TypeScript
2. TypeScript version: Use project's
3. Enable TypeScript service

---

## Debugging

### Backend Services

#### Using VS Code
```javascript
// Add to code
debugger; // Execution will pause here

// Run with inspector
node --inspect-brk dist/index.js
```

#### Using Chrome DevTools
```bash
# Start with inspect flag
node --inspect dist/index.js

# Open Chrome
chrome://inspect

# Click "inspect" under your process
```

#### Using Logs
```javascript
import { logger } from './utils/logger';

logger.debug('Variable value:', { value });
logger.info('Request received:', { path: req.path });
logger.error('Error occurred:', error);
```

### Frontend (React)

#### React DevTools
```bash
# Install browser extension
# Chrome: https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/react-devtools/
```

#### Browser Console
```javascript
// Add temporary logs
console.log('Component rendered:', { props, state });
console.table(data); // Display arrays/objects as table
console.time('operation');
// ... code ...
console.timeEnd('operation'); // Measure execution time
```

### Database Queries

```bash
# Enable query logging
# In database/migrations/config.ts
logging: true,

# View slow queries
docker exec -it postgres psql -U postgres -d iac_dharma -c "
  SELECT query, calls, total_time, mean_time
  FROM pg_stat_statements
  ORDER BY total_time DESC
  LIMIT 10;
"
```

---

## Testing

### Unit Tests

```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- blueprint.service.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

#### Example Unit Test
```typescript
// blueprint.service.test.ts
import { BlueprintService } from './blueprint.service';

describe('BlueprintService', () => {
  let service: BlueprintService;

  beforeEach(() => {
    service = new BlueprintService();
  });

  test('should create blueprint', async () => {
    const blueprint = await service.create({
      name: 'Test Blueprint',
      provider: 'aws'
    });

    expect(blueprint).toHaveProperty('id');
    expect(blueprint.name).toBe('Test Blueprint');
  });
});
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run with database
docker-compose -f docker-compose.test.yml up -d
npm run test:integration
docker-compose -f docker-compose.test.yml down
```

### E2E Tests

```bash
# Install Playwright
cd frontend
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e -- --ui

# Run specific browser
npm run test:e2e -- --project=chromium
```

---

## Code Style & Linting

### ESLint Configuration

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check specific file
npx eslint src/routes/blueprints.ts
```

### Prettier Configuration

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Format specific file
npx prettier --write src/routes/blueprints.ts
```

### Pre-commit Hooks

```bash
# Install husky
npm install -D husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

**.lintstagedrc.json**:
```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

### Docker Issues

```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Reset Docker
docker system prune -a --volumes

# Check Docker logs
docker logs <container-name>
```

### Node Module Issues

```bash
# Remove and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
docker exec -it postgres psql -U postgres -c "SELECT 1;"

# Reset database
docker-compose down -v
docker-compose up -d postgres
npm run migrate:up
```

---

## Performance Optimization

### Development Server

```bash
# Use SWC for faster transpilation
npm install -D @swc/core @swc/jest

# Enable caching
export NODE_OPTIONS=--max-old-space-size=4096
```

### Hot Module Replacement

Frontend is configured with Vite HMR:
```typescript
// vite.config.ts
export default {
  server: {
    hmr: {
      overlay: true
    }
  }
}
```

---

## Next Steps

- **[Contributing Guide](Contributing-Guide)** - How to contribute
- **[Testing Guide](Testing-Guide)** - Comprehensive testing
- **[API Reference](API-Reference)** - API documentation
- **[Troubleshooting](Troubleshooting)** - Common issues
- **[Architecture Overview](Architecture-Overview)** - System design

---

**Questions?** [Open a GitHub Issue](https://github.com/Raghavendra198902/iac/issues)

---

Last Updated: November 21, 2025 | [Back to Home](Home)
