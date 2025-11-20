#!/bin/bash

# IAC DHARMA Platform Health Check Script
# Checks the health status of all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Health check function
check_service() {
    local service_name=$1
    local health_url=$2
    local port=$3
    
    printf "%-30s " "$service_name"
    
    # Check if port is listening
    if ! nc -z localhost $port 2>/dev/null; then
        echo -e "${RED}✗ DOWN (port not listening)${NC}"
        return 1
    fi
    
    # Check health endpoint
    if curl -sf "${health_url}" > /dev/null 2>&1; then
        response=$(curl -s "${health_url}")
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ UNHEALTHY (port open but health check failed)${NC}"
        return 1
    fi
}

# Check database function
check_database() {
    local db_name=$1
    printf "%-30s " "$db_name"
    
    if docker-compose exec -T postgres pg_isready -U iac_user > /dev/null 2>&1; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        return 0
    else
        echo -e "${RED}✗ DOWN${NC}"
        return 1
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

# Print banner
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         IAC DHARMA Platform Health Check                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if netcat is available
if ! command -v nc &> /dev/null; then
    echo -e "${YELLOW}Warning: netcat (nc) is not installed. Port checks will be skipped.${NC}"
    echo ""
fi

# Initialize counters
healthy=0
unhealthy=0

echo "Infrastructure Services:"
echo "─────────────────────────────────────────────────────────────"

check_database "PostgreSQL" && ((healthy++)) || ((unhealthy++))
check_redis_service && ((healthy++)) || ((unhealthy++))

echo ""
echo "Backend Microservices:"
echo "─────────────────────────────────────────────────────────────"

check_service "API Gateway" "http://localhost:3000/health" 3000 && ((healthy++)) || ((unhealthy++))
check_service "Blueprint Service" "http://localhost:3001/health" 3001 && ((healthy++)) || ((unhealthy++))
check_service "IaC Generator" "http://localhost:3002/health" 3002 && ((healthy++)) || ((unhealthy++))
check_service "Guardrails Engine" "http://localhost:3003/health" 3003 && ((healthy++)) || ((unhealthy++))
check_service "Orchestrator" "http://localhost:3004/health" 3004 && ((healthy++)) || ((unhealthy++))
check_service "Costing Service" "http://localhost:3005/health" 3005 && ((healthy++)) || ((unhealthy++))
check_service "Monitoring Service" "http://localhost:3006/health" 3006 && ((healthy++)) || ((unhealthy++))
check_service "Automation Engine" "http://localhost:3007/health" 3007 && ((healthy++)) || ((unhealthy++))
check_service "AI Engine" "http://localhost:8000/health" 8000 && ((healthy++)) || ((unhealthy++))

echo ""
echo "Frontend:"
echo "─────────────────────────────────────────────────────────────"

printf "%-30s " "Frontend (Vite)"
if nc -z localhost 5173 2>/dev/null; then
    echo -e "${GREEN}✓ RUNNING${NC}"
    ((healthy++))
else
    echo -e "${RED}✗ DOWN${NC}"
    ((unhealthy++))
fi

echo ""
echo "Development Tools:"
echo "─────────────────────────────────────────────────────────────"

printf "%-30s " "Adminer (Database UI)"
if nc -z localhost 8080 2>/dev/null; then
    echo -e "${GREEN}✓ RUNNING${NC}"
else
    echo -e "${YELLOW}⚠ NOT RUNNING${NC}"
fi

printf "%-30s " "Redis Commander"
if nc -z localhost 8081 2>/dev/null; then
    echo -e "${GREEN}✓ RUNNING${NC}"
else
    echo -e "${YELLOW}⚠ NOT RUNNING${NC}"
fi

printf "%-30s " "Prometheus"
if nc -z localhost 9090 2>/dev/null; then
    echo -e "${GREEN}✓ RUNNING${NC}"
else
    echo -e "${YELLOW}⚠ NOT RUNNING${NC}"
fi

printf "%-30s " "Grafana"
if nc -z localhost 3001 2>/dev/null; then
    echo -e "${GREEN}✓ RUNNING${NC}"
else
    echo -e "${YELLOW}⚠ NOT RUNNING${NC}"
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
total=$((healthy + unhealthy))
echo -e "Summary: ${GREEN}${healthy}/${total} services healthy${NC}"

if [ $unhealthy -gt 0 ]; then
    echo -e "${RED}${unhealthy} services are down or unhealthy${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check logs: docker-compose logs [service-name]"
    echo "  2. Restart failed services: docker-compose restart [service-name]"
    echo "  3. Full restart: docker-compose down && docker-compose up -d"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ All services are healthy!${NC}"
echo ""

exit 0
