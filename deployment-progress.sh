#!/bin/bash
# IAC Dharma v3.0 Deployment Progress Monitor
# Live tracking of all services and deployment status

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Progress symbols
DONE="✅"
BUILDING="🔨"
RUNNING="🚀"
STARTING="⏳"
FAILED="❌"
PENDING="⏸️"

echo "=========================================="
echo "  IAC Dharma v3.0 Deployment Progress"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Function to check Docker image exists
check_image() {
    local image=$1
    if docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "^${image}$"; then
        return 0
    else
        return 1
    fi
}

# Function to check container status
check_container() {
    local container=$1
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "none")
        local status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "unknown")
        
        if [ "$status" == "running" ]; then
            if [ "$health" == "healthy" ]; then
                echo -e "${GREEN}${DONE}${NC}"
            elif [ "$health" == "starting" ]; then
                echo -e "${YELLOW}${STARTING}${NC}"
            else
                echo -e "${GREEN}${RUNNING}${NC}"
            fi
        else
            echo -e "${RED}${FAILED}${NC}"
        fi
    else
        echo -e "${YELLOW}${PENDING}${NC}"
    fi
}

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 INFRASTRUCTURE SERVICES${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

printf "%-35s " "TimescaleDB (PostgreSQL 16)"
check_container "iac-postgres-v3"
printf "  Port: 5433\n"

printf "%-35s " "Neo4j Graph Database"
check_container "iac-neo4j-v3"
printf "  Ports: 7474, 7687\n"

printf "%-35s " "Redis Cache"
check_container "iac-redis-v3"
printf "  Port: 6380\n"

printf "%-35s " "Apache Kafka"
check_container "iac-kafka-v3"
printf "  Port: 9093\n"

printf "%-35s " "Zookeeper"
check_container "iac-zookeeper-v3"
printf "  Port: 2182\n"

printf "%-35s " "Prometheus"
check_container "iac-prometheus-v3"
printf "  Port: 9091\n"

printf "%-35s " "Grafana"
check_container "iac-grafana-v3"
printf "  Port: 3020\n"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🤖 AI/ML SERVICES${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

printf "%-35s " "MLflow Tracking Server"
check_container "iac-mlflow-v3"
printf "  Port: 5000\n"

printf "%-35s " "AIOps Engine (ML Models)"
check_container "iac-aiops-engine-v3"
printf "  Port: 8100\n"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 BACKEND SERVICES${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

printf "%-35s " "CMDB Agent"
check_container "iac-cmdb-agent-v3"
printf "  Port: 8200\n"

printf "%-35s " "AI Orchestrator"
check_container "iac-ai-orchestrator-v3"
printf "  Port: 8300\n"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🏗️  DOCKER IMAGES STATUS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

printf "%-35s " "iac-aiops-engine:v3"
if check_image "iac-aiops-engine:v3"; then
    echo -e "${GREEN}${DONE} Built${NC}"
else
    echo -e "${YELLOW}${BUILDING} Building...${NC}"
fi

printf "%-35s " "iac-cmdb-agent:v3"
if check_image "iac-cmdb-agent:v3"; then
    echo -e "${GREEN}${DONE} Built${NC}"
else
    echo -e "${YELLOW}${BUILDING} Building...${NC}"
fi

printf "%-35s " "iac-ai-orchestrator:v3"
if check_image "iac-ai-orchestrator:v3"; then
    echo -e "${GREEN}${DONE} Built${NC}"
else
    echo -e "${YELLOW}${BUILDING} Building...${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔍 SERVICE HEALTH CHECKS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check AIOps Engine
printf "%-35s " "AIOps Engine API"
if curl -sf http://localhost:8100/health > /dev/null 2>&1; then
    echo -e "${GREEN}${DONE} Healthy${NC}"
else
    echo -e "${RED}${FAILED} Not responding${NC}"
fi

# Check MLflow
printf "%-35s " "MLflow UI"
if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}${DONE} Healthy${NC}"
else
    echo -e "${RED}${FAILED} Not responding${NC}"
fi

# Check CMDB Agent
printf "%-35s " "CMDB Agent API"
if curl -sf http://localhost:8200/health > /dev/null 2>&1; then
    echo -e "${GREEN}${DONE} Healthy${NC}"
else
    echo -e "${YELLOW}${STARTING} Starting...${NC}"
fi

# Check AI Orchestrator
printf "%-35s " "AI Orchestrator API"
if curl -sf http://localhost:8300/health > /dev/null 2>&1; then
    echo -e "${GREEN}${DONE} Healthy${NC}"
else
    echo -e "${YELLOW}${STARTING} Starting...${NC}"
fi

# Check Neo4j
printf "%-35s " "Neo4j Browser"
if curl -sf http://localhost:7474 > /dev/null 2>&1; then
    echo -e "${GREEN}${DONE} Accessible${NC}"
else
    echo -e "${RED}${FAILED} Not responding${NC}"
fi

# Check Grafana
printf "%-35s " "Grafana Dashboard"
if curl -sf http://localhost:3020 > /dev/null 2>&1; then
    echo -e "${GREEN}${DONE} Accessible${NC}"
else
    echo -e "${RED}${FAILED} Not responding${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 DEPLOYMENT SUMMARY${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Count running containers
TOTAL_INFRA=7
TOTAL_SERVICES=4
RUNNING_INFRA=$(docker ps --filter "name=iac-postgres-v3" --filter "name=iac-neo4j-v3" --filter "name=iac-redis-v3" --filter "name=iac-kafka-v3" --filter "name=iac-zookeeper-v3" --filter "name=iac-prometheus-v3" --filter "name=iac-grafana-v3" --format "{{.Names}}" | wc -l)
RUNNING_SERVICES=$(docker ps --filter "name=iac-mlflow-v3" --filter "name=iac-aiops-engine-v3" --filter "name=iac-cmdb-agent-v3" --filter "name=iac-ai-orchestrator-v3" --format "{{.Names}}" | wc -l)

echo -e "Infrastructure Services: ${GREEN}${RUNNING_INFRA}/${TOTAL_INFRA}${NC} running"
echo -e "Backend Services:        ${GREEN}${RUNNING_SERVICES}/${TOTAL_SERVICES}${NC} running"

# Calculate overall progress
TOTAL=$((TOTAL_INFRA + TOTAL_SERVICES))
RUNNING=$((RUNNING_INFRA + RUNNING_SERVICES))
PERCENTAGE=$((RUNNING * 100 / TOTAL))

echo ""
echo -e "Overall Progress: ${GREEN}${PERCENTAGE}%${NC} (${RUNNING}/${TOTAL} services)"

# Progress bar
FILLED=$((PERCENTAGE / 2))
EMPTY=$((50 - FILLED))
echo -n "["
for i in $(seq 1 $FILLED); do echo -n "█"; done
for i in $(seq 1 $EMPTY); do echo -n "░"; done
echo "]"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔗 QUICK ACCESS LINKS${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "AIOps Engine:     ${CYAN}http://localhost:8100/docs${NC}"
echo -e "MLflow UI:        ${CYAN}http://localhost:5000${NC}"
echo -e "Neo4j Browser:    ${CYAN}http://localhost:7474${NC}"
echo -e "Grafana:          ${CYAN}http://localhost:3020${NC}"
echo -e "Prometheus:       ${CYAN}http://localhost:9091${NC}"
echo -e "CMDB Agent:       ${CYAN}http://localhost:8200/docs${NC}"
echo -e "AI Orchestrator:  ${CYAN}http://localhost:8300/docs${NC}"
echo ""
echo -e "${GREEN}Deployment monitoring complete!${NC}"
echo "=========================================="
