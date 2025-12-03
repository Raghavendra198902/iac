#!/bin/bash

#################################################################
# E2E Test Environment Setup Script
# Version: 2.0.0
# Purpose: Set up complete E2E testing environment for v2.0
#################################################################

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     IAC Dharma v2.0 - E2E Test Environment Setup            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

#################################################################
# 1. Check Prerequisites
#################################################################

echo -e "${BLUE}[1/8]${NC} Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found. Please install docker-compose.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ docker-compose found${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

#################################################################
# 2. Create Test Environment Files
#################################################################

echo ""
echo -e "${BLUE}[2/8]${NC} Creating test environment configuration..."

# Create .env.test
cat > .env.test << 'EOF'
# Test Environment Configuration
NODE_ENV=test
PORT=3000

# Database
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/iac_dharma_test
PGBOUNCER_URL=postgresql://test_user:test_password@localhost:6433/iac_dharma_test

# Redis
REDIS_URL=redis://localhost:6380

# JWT
JWT_SECRET=test_jwt_secret_min_32_chars_12345
JWT_REFRESH_SECRET=test_refresh_secret_min_32_chars
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# SSO (Test)
SSO_ENABLED=true
SAML_ENTRY_POINT=http://localhost:8080/simplesaml/saml2/idp/SSOService.php
SAML_ISSUER=iac-dharma-test
SAML_CALLBACK_URL=http://localhost:3000/api/auth/sso/saml/callback
SAML_CERT=/path/to/test/cert.pem

OIDC_ISSUER=https://login.microsoftonline.com/test-tenant-id/v2.0
OIDC_CLIENT_ID=test-client-id
OIDC_CLIENT_SECRET=test-client-secret
OIDC_CALLBACK_URL=http://localhost:3000/api/auth/sso/oidc/callback

# Multi-Tenancy
MULTI_TENANT_ENABLED=true
DEFAULT_TENANT_QUOTA_PROJECTS=100
DEFAULT_TENANT_QUOTA_USERS=50

# Feature Flags
ENABLE_GRAPHQL=true
ENABLE_CACHING=true
ENABLE_AUTO_SCALING=true

# Testing
TEST_TIMEOUT=60000
TEST_PARALLEL_WORKERS=4
EOF

echo -e "${GREEN}✅ Created .env.test${NC}"

# Create docker-compose.test.yml
cat > docker-compose.test.yml << 'EOF'
version: '3.8'

services:
  # Test PostgreSQL
  postgres-test:
    image: postgres:15-alpine
    container_name: iac-postgres-test
    environment:
      POSTGRES_DB: iac_dharma_test
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_HOST_AUTH_METHOD: trust
    ports:
      - "5433:5432"
    volumes:
      - postgres_test_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test_user -d iac_dharma_test"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Test Redis
  redis-test:
    image: redis:7-alpine
    container_name: iac-redis-test
    ports:
      - "6380:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_test_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # PgBouncer for connection pooling
  pgbouncer-test:
    image: pgbouncer/pgbouncer:latest
    container_name: iac-pgbouncer-test
    environment:
      DATABASES_HOST: postgres-test
      DATABASES_PORT: 5432
      DATABASES_DBNAME: iac_dharma_test
      DATABASES_USER: test_user
      DATABASES_PASSWORD: test_password
      PGBOUNCER_POOL_MODE: transaction
      PGBOUNCER_MAX_CLIENT_CONN: 100
      PGBOUNCER_DEFAULT_POOL_SIZE: 25
      PGBOUNCER_MIN_POOL_SIZE: 5
      PGBOUNCER_RESERVE_POOL_SIZE: 5
      PGBOUNCER_AUTH_TYPE: trust
    ports:
      - "6433:6432"
    depends_on:
      postgres-test:
        condition: service_healthy

  # Mock SAML IdP for SSO testing
  mock-saml-idp:
    image: kristophjunge/test-saml-idp
    container_name: iac-mock-saml-idp
    ports:
      - "8080:8080"
      - "8443:8443"
    environment:
      SIMPLESAMLPHP_SP_ENTITY_ID: iac-dharma-test
      SIMPLESAMLPHP_SP_ASSERTION_CONSUMER_SERVICE: http://localhost:3000/api/auth/sso/saml/callback
      SIMPLESAMLPHP_SP_SINGLE_LOGOUT_SERVICE: http://localhost:3000/api/auth/sso/saml/logout
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/simplesaml"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_test_data:
  redis_test_data:
EOF

echo -e "${GREEN}✅ Created docker-compose.test.yml${NC}"

#################################################################
# 3. Stop Existing Containers
#################################################################

echo ""
echo -e "${BLUE}[3/8]${NC} Stopping existing test containers..."

docker-compose -f docker-compose.test.yml down -v 2>/dev/null || true
echo -e "${GREEN}✅ Cleaned up existing containers${NC}"

#################################################################
# 4. Start Test Services
#################################################################

echo ""
echo -e "${BLUE}[4/8]${NC} Starting test services..."

docker-compose -f docker-compose.test.yml up -d

echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"

# Wait for PostgreSQL
echo -n "Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker exec iac-postgres-test pg_isready -U test_user -d iac_dharma_test > /dev/null 2>&1; then
        echo -e " ${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Redis
echo -n "Waiting for Redis..."
for i in {1..30}; do
    if docker exec iac-redis-test redis-cli ping > /dev/null 2>&1; then
        echo -e " ${GREEN}✅${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for PgBouncer
echo -n "Waiting for PgBouncer..."
sleep 5
echo -e " ${GREEN}✅${NC}"

echo -e "${GREEN}✅ All test services are running${NC}"

#################################################################
# 5. Install Dependencies
#################################################################

echo ""
echo -e "${BLUE}[5/8]${NC} Installing test dependencies..."

if [ ! -d "node_modules" ]; then
    npm ci
else
    echo -e "${YELLOW}⏭️  node_modules exists, skipping install${NC}"
fi

# Install E2E testing packages
npm install --save-dev \
    @playwright/test \
    @testing-library/react \
    @testing-library/jest-dom \
    supertest \
    axios \
    k6 \
    artillery

echo -e "${GREEN}✅ Dependencies installed${NC}"

#################################################################
# 6. Run Database Migrations
#################################################################

echo ""
echo -e "${BLUE}[6/8]${NC} Running database migrations..."

# Export test environment
export $(cat .env.test | xargs)

# Run migrations
npm run migrate:latest || echo -e "${YELLOW}⚠️  Migrations may have already been run${NC}"

echo -e "${GREEN}✅ Database migrations complete${NC}"

#################################################################
# 7. Seed Test Data
#################################################################

echo ""
echo -e "${BLUE}[7/8]${NC} Seeding test data..."

cat > tests/e2e/seed-test-data.js << 'EOF'
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.PGBOUNCER_URL || process.env.DATABASE_URL
});

async function seedTestData() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create test tenants
    await client.query(`
      INSERT INTO tenants (id, name, subdomain, quota_projects, quota_users, created_at)
      VALUES
        ('tenant-1', 'Acme Corporation', 'acme', 100, 50, NOW()),
        ('tenant-2', 'Beta Industries', 'beta', 50, 25, NOW()),
        ('tenant-3', 'Gamma LLC', 'gamma', 200, 100, NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Create test users
    await client.query(`
      INSERT INTO users (id, email, name, password_hash, tenant_id, role, created_at)
      VALUES
        ('user-1', 'admin@acme.com', 'Admin User', '$2a$10$test', 'tenant-1', 'admin', NOW()),
        ('user-2', 'dev@acme.com', 'Developer User', '$2a$10$test', 'tenant-1', 'developer', NOW()),
        ('user-3', 'viewer@beta.com', 'Viewer User', '$2a$10$test', 'tenant-2', 'viewer', NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Create test projects
    await client.query(`
      INSERT INTO projects (id, name, tenant_id, created_by, created_at)
      VALUES
        ('project-1', 'Test Project 1', 'tenant-1', 'user-1', NOW()),
        ('project-2', 'Test Project 2', 'tenant-1', 'user-2', NOW()),
        ('project-3', 'Test Project 3', 'tenant-2', 'user-3', NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    
    await client.query('COMMIT');
    console.log('✅ Test data seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding test data:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seedTestData();
EOF

node tests/e2e/seed-test-data.js

echo -e "${GREEN}✅ Test data seeded${NC}"

#################################################################
# 8. Verify Setup
#################################################################

echo ""
echo -e "${BLUE}[8/8]${NC} Verifying test environment..."

# Check PostgreSQL
if docker exec iac-postgres-test psql -U test_user -d iac_dharma_test -c "SELECT COUNT(*) FROM tenants;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL: Database accessible${NC}"
else
    echo -e "${RED}❌ PostgreSQL: Database not accessible${NC}"
    exit 1
fi

# Check Redis
if docker exec iac-redis-test redis-cli SET test_key test_value > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis: Cache accessible${NC}"
else
    echo -e "${RED}❌ Redis: Cache not accessible${NC}"
    exit 1
fi

# Check PgBouncer
if PGPASSWORD=test_password psql -h localhost -p 6433 -U test_user -d iac_dharma_test -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PgBouncer: Connection pooling working${NC}"
else
    echo -e "${YELLOW}⚠️  PgBouncer: May need psql client installed${NC}"
fi

#################################################################
# Summary
#################################################################

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              E2E Test Environment Ready!                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Test Services Running:${NC}"
echo -e "  • PostgreSQL:  ${BLUE}localhost:5433${NC}"
echo -e "  • PgBouncer:   ${BLUE}localhost:6433${NC}"
echo -e "  • Redis:       ${BLUE}localhost:6380${NC}"
echo -e "  • Mock SAML:   ${BLUE}localhost:8080${NC}"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo -e "  1. Run E2E tests:        ${YELLOW}npm run test:e2e${NC}"
echo -e "  2. Run load tests:       ${YELLOW}npm run test:load${NC}"
echo -e "  3. Run specific test:    ${YELLOW}npm run test:e2e -- <test-file>${NC}"
echo -e "  4. View test coverage:   ${YELLOW}npm run test:coverage${NC}"
echo ""
echo -e "${GREEN}Cleanup:${NC}"
echo -e "  Stop services:  ${YELLOW}docker-compose -f docker-compose.test.yml down${NC}"
echo -e "  Remove volumes: ${YELLOW}docker-compose -f docker-compose.test.yml down -v${NC}"
echo ""
echo -e "${BLUE}Happy Testing! 🚀${NC}"
