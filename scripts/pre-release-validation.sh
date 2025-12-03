#!/bin/bash

#################################################################
# IAC Dharma Platform - Pre-Release Validation Script
# Version: 1.0.0
# Date: December 3, 2025
#################################################################

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        IAC Dharma - Pre-Release Validation v1.0.0           ║${NC}"
echo -e "${BLUE}║                December 3, 2025                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

#################################################################
# Test Helper Functions
#################################################################

pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNINGS++))
}

section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_service_health() {
    local service_name=$1
    local url=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        pass "$service_name is healthy"
        return 0
    else
        fail "$service_name is not responding at $url"
        return 1
    fi
}

#################################################################
# 1. Environment Validation
#################################################################

section "1. ENVIRONMENT VALIDATION"

# Check if .env file exists
if [ -f ".env" ]; then
    pass ".env file exists"
else
    fail ".env file not found"
fi

# Check critical environment variables
ENV_VARS=("NODE_ENV" "JWT_SECRET" "DATABASE_URL" "FRONTEND_URL")
for var in "${ENV_VARS[@]}"; do
    if grep -q "^$var=" .env 2>/dev/null; then
        pass "$var is configured"
    else
        warn "$var not found in .env (may be set in system)"
    fi
done

#################################################################
# 2. Docker Validation
#################################################################

section "2. DOCKER VALIDATION"

# Check if Docker is running
if docker info > /dev/null 2>&1; then
    pass "Docker daemon is running"
else
    fail "Docker daemon is not running"
    echo "Please start Docker and try again"
    exit 1
fi

# Check if docker-compose is available
if command -v docker-compose > /dev/null 2>&1; then
    pass "docker-compose is installed"
else
    fail "docker-compose is not installed"
fi

#################################################################
# 3. Service Health Checks
#################################################################

section "3. SERVICE HEALTH CHECKS"

# Wait a moment for services to be ready
echo "Waiting 5 seconds for services to stabilize..."
sleep 5

# API Gateway
check_service_health "API Gateway" "http://localhost:3000/health/ready"

# Blueprint Service
check_service_health "Blueprint Service" "http://localhost:3001/health"

# IAC Generator
check_service_health "IAC Generator" "http://localhost:3002/health"

# Automation Engine
check_service_health "Automation Engine" "http://localhost:3003/health"

# AI Engine
check_service_health "AI Engine" "http://localhost:3005/health"

# AI Recommendations
check_service_health "AI Recommendations" "http://localhost:3006/health"

# Cloud Provider Service
check_service_health "Cloud Provider Service" "http://localhost:3007/health"

# CMDB Agent
check_service_health "CMDB Agent" "http://localhost:3008/health"

# Costing Service
check_service_health "Costing Service" "http://localhost:3009/health"

# Guardrails Engine
check_service_health "Guardrails Engine" "http://localhost:3010/health"

# Monitoring Service
check_service_health "Monitoring Service" "http://localhost:3011/health"

# Orchestrator Service
check_service_health "Orchestrator Service" "http://localhost:3012/health"

#################################################################
# 4. Database Validation
#################################################################

section "4. DATABASE VALIDATION"

# Check if PostgreSQL container is running
if docker ps | grep -q "postgres"; then
    pass "PostgreSQL container is running"
    
    # Check database connectivity
    if docker exec postgres pg_isready -U postgres > /dev/null 2>&1; then
        pass "PostgreSQL is accepting connections"
        
        # Check if database exists
        if docker exec postgres psql -U postgres -lqt | cut -d \| -f 1 | grep -qw iac_dharma; then
            pass "iac_dharma database exists"
            
            # Count tables
            TABLE_COUNT=$(docker exec postgres psql -U postgres -d iac_dharma -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
            if [ "$TABLE_COUNT" -ge 20 ]; then
                pass "Database has $TABLE_COUNT tables (expected >= 20)"
            else
                warn "Database has only $TABLE_COUNT tables (expected >= 20)"
            fi
        else
            fail "iac_dharma database not found"
        fi
    else
        fail "PostgreSQL is not accepting connections"
    fi
else
    fail "PostgreSQL container is not running"
fi

#################################################################
# 5. Frontend Validation
#################################################################

section "5. FRONTEND VALIDATION"

# Check if frontend is accessible
if curl -sf http://localhost:5173 > /dev/null 2>&1; then
    pass "Frontend is accessible at http://localhost:5173"
else
    warn "Frontend is not responding (may be building or in development mode)"
fi

#################################################################
# 6. Monitoring Stack Validation
#################################################################

section "6. MONITORING STACK VALIDATION"

# Prometheus
if curl -sf http://localhost:9090/-/healthy > /dev/null 2>&1; then
    pass "Prometheus is healthy"
else
    warn "Prometheus is not responding (optional for development)"
fi

# Grafana
if curl -sf http://localhost:3030/api/health > /dev/null 2>&1; then
    pass "Grafana is healthy"
else
    warn "Grafana is not responding (optional for development)"
fi

# Jaeger
if curl -sf http://localhost:16686/ > /dev/null 2>&1; then
    pass "Jaeger UI is accessible"
else
    warn "Jaeger is not responding (optional for development)"
fi

#################################################################
# 7. Authentication Test
#################################################################

section "7. AUTHENTICATION TEST"

# Test login endpoint
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password"}' 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    pass "Login endpoint is working"
    
    # Extract refresh token
    REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$REFRESH_TOKEN" ]; then
        pass "Refresh token is generated"
        
        # Test token refresh
        REFRESH_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/refresh \
            -H "Content-Type: application/json" \
            -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" 2>&1)
        
        if echo "$REFRESH_RESPONSE" | grep -q "token"; then
            pass "Token refresh is working"
        else
            fail "Token refresh failed"
        fi
    else
        warn "Refresh token not found in response"
    fi
else
    fail "Login endpoint failed: $LOGIN_RESPONSE"
fi

#################################################################
# 8. API Documentation
#################################################################

section "8. API DOCUMENTATION"

# Check Swagger documentation
if curl -sf http://localhost:3000/api-docs > /dev/null 2>&1; then
    pass "Swagger documentation is accessible"
else
    warn "Swagger documentation is not accessible"
fi

# Check OpenAPI spec
if curl -sf http://localhost:3000/api-docs.json > /dev/null 2>&1; then
    pass "OpenAPI specification is available"
else
    warn "OpenAPI specification is not available"
fi

#################################################################
# 9. Wiki Documentation
#################################################################

section "9. DOCUMENTATION STATUS"

# Count wiki files with professional metadata
WIKI_COUNT=$(find docs/wiki -name "*.md" -type f | wc -l)
METADATA_COUNT=$(grep -l "Document Type" docs/wiki/*.md 2>/dev/null | wc -l)

if [ "$METADATA_COUNT" -eq "$WIKI_COUNT" ]; then
    pass "All $WIKI_COUNT wiki files have professional metadata (100%)"
elif [ "$METADATA_COUNT" -gt 30 ]; then
    pass "$METADATA_COUNT/$WIKI_COUNT wiki files have professional metadata"
else
    warn "Only $METADATA_COUNT/$WIKI_COUNT wiki files have professional metadata"
fi

# Check for Mermaid diagrams
MERMAID_COUNT=$(grep -l "mermaid" docs/wiki/*.md 2>/dev/null | wc -l)
if [ "$MERMAID_COUNT" -ge 14 ]; then
    pass "$MERMAID_COUNT wiki files contain Mermaid diagrams"
else
    warn "Only $MERMAID_COUNT wiki files contain Mermaid diagrams"
fi

#################################################################
# 10. Docker Containers Status
#################################################################

section "10. DOCKER CONTAINERS STATUS"

# Count running containers
RUNNING_CONTAINERS=$(docker ps --format '{{.Names}}' | wc -l)
if [ "$RUNNING_CONTAINERS" -ge 15 ]; then
    pass "$RUNNING_CONTAINERS Docker containers are running"
else
    warn "Only $RUNNING_CONTAINERS Docker containers are running (expected >= 15)"
fi

# Check for unhealthy containers
UNHEALTHY=$(docker ps --filter "health=unhealthy" --format '{{.Names}}' | wc -l)
if [ "$UNHEALTHY" -eq 0 ]; then
    pass "No unhealthy containers detected"
else
    fail "$UNHEALTHY containers are unhealthy"
    docker ps --filter "health=unhealthy" --format 'table {{.Names}}\t{{.Status}}'
fi

#################################################################
# Summary
#################################################################

section "VALIDATION SUMMARY"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo ""
echo -e "Total Checks: ${BLUE}$TOTAL${NC}"
echo -e "Passed:       ${GREEN}$PASSED${NC}"
echo -e "Failed:       ${RED}$FAILED${NC}"
echo -e "Warnings:     ${YELLOW}$WARNINGS${NC}"
echo ""

# Calculate pass percentage
if [ "$TOTAL" -gt 0 ]; then
    PASS_PCT=$((PASSED * 100 / TOTAL))
    echo -e "Pass Rate:    ${BLUE}$PASS_PCT%${NC}"
fi

echo ""

# Final verdict
if [ "$FAILED" -eq 0 ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                              ║${NC}"
        echo -e "${GREEN}║     ✅ ALL CHECKS PASSED - READY FOR RELEASE ✅             ║${NC}"
        echo -e "${GREEN}║                                                              ║${NC}"
        echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
        exit 0
    else
        echo -e "${YELLOW}╔══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║                                                              ║${NC}"
        echo -e "${YELLOW}║  ⚠️  CHECKS PASSED WITH WARNINGS - REVIEW RECOMMENDED ⚠️    ║${NC}"
        echo -e "${YELLOW}║                                                              ║${NC}"
        echo -e "${YELLOW}╚══════════════════════════════════════════════════════════════╝${NC}"
        exit 0
    fi
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                              ║${NC}"
    echo -e "${RED}║      ❌ VALIDATION FAILED - ISSUES MUST BE RESOLVED ❌      ║${NC}"
    echo -e "${RED}║                                                              ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please review the failed checks above and resolve issues before release."
    exit 1
fi
