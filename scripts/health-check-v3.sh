#!/bin/bash

# v3.0 Health Check Script
# Checks all v3 infrastructure and backend services

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_service() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        print_success "$name"
        return 0
    else
        print_error "$name"
        return 1
    fi
}

check_port() {
    local port=$1
    local name=$2
    
    if nc -z localhost "$port" 2>/dev/null; then
        print_success "$name (port $port)"
        return 0
    else
        print_error "$name (port $port)"
        return 1
    fi
}

echo "=========================================="
echo "IAC Dharma v3.0 Health Check"
echo "=========================================="
echo ""

# Infrastructure Services
echo "Infrastructure Services:"
echo "----------------------------------------"
check_port 5433 "PostgreSQL v3"
check_port 7474 "Neo4j HTTP"
check_port 7687 "Neo4j Bolt"
check_port 6380 "Redis v3"
check_port 9093 "Kafka"
check_port 2182 "Zookeeper"
check_port 9091 "Prometheus"
check_port 3020 "Grafana"

echo ""
echo "Backend Services:"
echo "----------------------------------------"
check_service "http://localhost:8100/api/v3/aiops/health" "AIOps Engine"
check_service "http://localhost:4000/health" "GraphQL API Gateway"
check_service "http://localhost:8200/api/v3/cmdb/health" "CMDB Agent"
check_service "http://localhost:8300/api/v3/orchestrator/health" "AI Orchestrator"

echo ""
echo "Docker Containers:"
echo "----------------------------------------"
docker ps --filter "name=iac-.*-v3" --format "table {{.Names}}\t{{.Status}}" | grep -v "NAMES" | while read -r name status; do
    if [[ $status == *"Up"* ]]; then
        print_success "$name: $status"
    else
        print_error "$name: $status"
    fi
done

echo ""
echo "=========================================="
echo "Health Check Complete"
echo "=========================================="
