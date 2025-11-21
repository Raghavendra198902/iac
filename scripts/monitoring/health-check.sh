#!/bin/bash
# Citadel DLP - System Health Check
# Version: 1.0.0

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"
CHECKS_PASSED=0
CHECKS_FAILED=0

print_header() {
    echo -e "\n${BLUE}╔═══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${BLUE}║         Citadel DLP - System Health Check v1.0.0             ║${NC}"
    echo -e "${BLUE}║                                                               ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
}

check_pass() {
    echo -e "${GREEN}✅ PASS: $1${NC}"
    CHECKS_PASSED=$((CHECKS_PASSED + 1))
}

check_fail() {
    echo -e "${RED}❌ FAIL: $1${NC}"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN: $1${NC}"
}

print_section() {
    echo -e "\n${BLUE}━━━ $1 ━━━${NC}"
}

# Check 1: Docker Services
check_docker_services() {
    print_section "Docker Services"
    
    if ! command -v docker &> /dev/null; then
        check_fail "Docker not installed"
        return
    fi
    
    services=("dharma-api-gateway" "dharma-frontend" "dharma-postgres" "dharma-redis")
    
    for service in "${services[@]}"; do
        if docker ps --format "{{.Names}}" | grep -q "^${service}$"; then
            status=$(docker ps --filter "name=${service}" --format "{{.Status}}")
            check_pass "$service is running ($status)"
        else
            check_fail "$service is not running"
        fi
    done
}

# Check 2: API Gateway Health
check_api_gateway() {
    print_section "API Gateway"
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL/health" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        status=$(echo "$body" | jq -r '.status' 2>/dev/null)
        if [ "$status" = "healthy" ]; then
            uptime=$(echo "$body" | jq -r '.uptime' 2>/dev/null)
            check_pass "API Gateway healthy (uptime: ${uptime}s)"
        else
            check_fail "API Gateway unhealthy (status: $status)"
        fi
    else
        check_fail "API Gateway not reachable (HTTP $http_code)"
    fi
}

# Check 3: Security API
check_security_api() {
    print_section "Security API"
    
    response=$(curl -s -w "\n%{http_code}" "$API_URL/api/security/health" 2>/dev/null)
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        status=$(echo "$body" | jq -r '.status' 2>/dev/null)
        total_events=$(echo "$body" | jq -r '.totalEvents' 2>/dev/null)
        
        if [ "$status" = "operational" ]; then
            check_pass "Security API operational ($total_events events stored)"
        else
            check_fail "Security API not operational"
        fi
    else
        check_fail "Security API not reachable (HTTP $http_code)"
    fi
}

# Check 4: Database Connectivity
check_database() {
    print_section "Database"
    
    response=$(curl -s "$API_URL/health" 2>/dev/null)
    db_status=$(echo "$response" | jq -r '.services.database.status' 2>/dev/null)
    db_response_time=$(echo "$response" | jq -r '.services.database.responseTime' 2>/dev/null)
    
    if [ "$db_status" = "connected" ]; then
        check_pass "PostgreSQL connected (${db_response_time}ms response time)"
    else
        check_fail "PostgreSQL not connected"
    fi
}

# Check 5: WebSocket Service
check_websocket() {
    print_section "WebSocket"
    
    response=$(curl -s "$API_URL/health" 2>/dev/null)
    ws_status=$(echo "$response" | jq -r '.services.websocket.status' 2>/dev/null)
    ws_connections=$(echo "$response" | jq -r '.services.websocket.connections' 2>/dev/null)
    
    if [ "$ws_status" = "active" ]; then
        check_pass "WebSocket active ($ws_connections active connections)"
    else
        check_fail "WebSocket not active"
    fi
}

# Check 6: Frontend Accessibility
check_frontend() {
    print_section "Frontend"
    
    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        check_pass "Frontend accessible at $FRONTEND_URL"
    else
        check_fail "Frontend not accessible at $FRONTEND_URL"
    fi
}

# Check 7: Agent Executables
check_agent_executables() {
    print_section "Agent Executables"
    
    if [ -f "backend/cmdb-agent/dist/cmdb-agent-win.exe" ]; then
        size=$(du -h backend/cmdb-agent/dist/cmdb-agent-win.exe | cut -f1)
        check_pass "Windows agent executable exists ($size)"
    else
        check_warn "Windows agent executable not found"
    fi
    
    if [ -f "backend/cmdb-agent/dist/cmdb-agent-linux" ]; then
        size=$(du -h backend/cmdb-agent/dist/cmdb-agent-linux | cut -f1)
        check_pass "Linux agent executable exists ($size)"
    else
        check_warn "Linux agent executable not found"
    fi
}

# Check 8: Performance Metrics
check_performance() {
    print_section "Performance Metrics"
    
    # Health check response time
    start=$(date +%s%N)
    curl -s "$API_URL/health" > /dev/null 2>&1
    end=$(date +%s%N)
    response_time=$(( (end - start) / 1000000 ))
    
    if [ $response_time -lt 1000 ]; then
        check_pass "Health check response time: ${response_time}ms (< 1000ms)"
    else
        check_warn "Health check response time: ${response_time}ms (> 1000ms)"
    fi
    
    # Security API response time
    start=$(date +%s%N)
    curl -s "$API_URL/api/security/health" > /dev/null 2>&1
    end=$(date +%s%N)
    response_time=$(( (end - start) / 1000000 ))
    
    if [ $response_time -lt 1000 ]; then
        check_pass "Security API response time: ${response_time}ms (< 1000ms)"
    else
        check_warn "Security API response time: ${response_time}ms (> 1000ms)"
    fi
}

# Check 9: Disk Space
check_disk_space() {
    print_section "Disk Space"
    
    usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -lt 80 ]; then
        check_pass "Disk usage: ${usage}% (< 80%)"
    elif [ "$usage" -lt 90 ]; then
        check_warn "Disk usage: ${usage}% (approaching limit)"
    else
        check_fail "Disk usage: ${usage}% (critically high)"
    fi
}

# Check 10: Required Dependencies
check_dependencies() {
    print_section "System Dependencies"
    
    if command -v docker &> /dev/null; then
        version=$(docker --version | cut -d' ' -f3 | tr -d ',')
        check_pass "Docker installed (version $version)"
    else
        check_fail "Docker not installed"
    fi
    
    if command -v docker-compose &> /dev/null; then
        version=$(docker-compose --version | cut -d' ' -f3 | tr -d ',')
        check_pass "Docker Compose installed (version $version)"
    else
        check_fail "Docker Compose not installed"
    fi
    
    if command -v jq &> /dev/null; then
        check_pass "jq installed"
    else
        check_warn "jq not installed (recommended for scripting)"
    fi
    
    if command -v curl &> /dev/null; then
        check_pass "curl installed"
    else
        check_fail "curl not installed (required)"
    fi
}

# Check Redis function
check_redis_service() {
    printf "%-30s " "Redis"
    
    if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}✗ DOWN${NC}"
        return 1
    fi
}

# Main execution
main() {
    clear
    print_header
    
    echo -e "${BLUE}ℹ️  API URL: $API_URL${NC}"
    echo -e "${BLUE}ℹ️  Frontend URL: $FRONTEND_URL${NC}"
    echo -e "${BLUE}ℹ️  Time: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    
    check_docker_services
    check_api_gateway
    check_security_api
    check_database
    check_websocket
    check_frontend
    check_agent_executables
    check_performance
    check_disk_space
    check_dependencies
    
    # Summary
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Health Check Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
    echo -e "Checks Failed: ${RED}$CHECKS_FAILED${NC}"
    
    if [ $CHECKS_FAILED -eq 0 ]; then
        echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║              🎉 ALL HEALTH CHECKS PASSED! 🎉                  ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
        echo -e "${GREEN}✅ System is ready for production deployment${NC}\n"
        exit 0
    else
        echo -e "\n${RED}╔═══════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║              ⚠️  SOME HEALTH CHECKS FAILED  ⚠️                 ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════╝${NC}\n"
        echo -e "${YELLOW}⚠️  Please address failed checks before production deployment${NC}\n"
        exit 1
    fi
}

# Run main function
main "$@"
