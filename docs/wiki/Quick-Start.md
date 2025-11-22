# Quick Start Guide

Get your IAC Dharma platform up and running in under 10 minutes with this comprehensive quick start guide.

---

## Table of Contents

| Section | Description | Time |
|---------|-------------|------|
| [Prerequisites Check](#prerequisites-check) | Verify system requirements | 2 min |
| [Installation](#installation) | Install platform (npm or Git) | 3 min |
| [Start Services](#start-services) | Launch all microservices | 2 min |
| [Access Platform](#access-platform) | Access web interfaces | 1 min |
| [Verify Installation](#verify-installation) | Confirm everything works | 2 min |
| [First Deployment](#first-deployment) | Create your first infrastructure | 5 min |
| [Using the Frontend](#using-the-frontend) | Web UI walkthrough | 5 min |
| [CLI Commands](#cli-commands) | Command reference | - |
| [Common Workflows](#common-workflows) | Typical usage patterns | 10 min |
| [Quick Troubleshooting](#quick-troubleshooting) | Solve common issues | - |
| [Configuration](#configuration) | Essential settings | 5 min |
| [Security Setup](#security-setup) | Basic security configuration | 5 min |
| [Next Steps](#next-steps) | Where to go from here | - |

**Total Time to Production**: ~10-15 minutes

---

## Prerequisites Check

### System Requirements

Before starting, ensure your system meets these minimum requirements:

#### Required Software

| Software | Minimum Version | Recommended | Check Command |
|----------|-----------------|-------------|---------------|
| Node.js | 18.0.0 | 20.x LTS | `node --version` |
| npm | 9.0.0 | 10.x | `npm --version` |
| Docker | 20.10.0 | 24.x | `docker --version` |
| Docker Compose | 2.0.0 | 2.20+ | `docker compose version` |

#### Hardware Requirements

| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| CPU | 4 cores | 8 cores | 16+ cores |
| RAM | 8 GB | 16 GB | 32+ GB |
| Disk Space | 20 GB | 50 GB | 100+ GB |
| Network | 10 Mbps | 100 Mbps | 1 Gbps |

#### Supported Operating Systems

- ✅ **Linux**: Ubuntu 20.04+, CentOS 8+, Debian 11+
- ✅ **macOS**: 12.0+ (Monterey or later)
- ✅ **Windows**: 10/11 with WSL2

### Pre-Installation Checklist

Run this automated checker:

```bash
#!/bin/bash
# prereq-check.sh - Verify all prerequisites

echo "=== IAC Dharma Prerequisites Check ==="
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js: Not installed"
    echo "   Install from: https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: v$NPM_VERSION"
else
    echo "❌ npm: Not installed"
    exit 1
fi

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | tr -d ',')
    echo "✅ Docker: $DOCKER_VERSION"
    
    # Check Docker daemon
    if docker ps &> /dev/null; then
        echo "✅ Docker daemon: Running"
    else
        echo "⚠️  Docker daemon: Not running"
        echo "   Start with: sudo systemctl start docker"
    fi
else
    echo "❌ Docker: Not installed"
    echo "   Install from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
if docker compose version &> /dev/null; then
    COMPOSE_VERSION=$(docker compose version --short)
    echo "✅ Docker Compose: v$COMPOSE_VERSION"
else
    echo "❌ Docker Compose: Not installed"
    echo "   Included with Docker Desktop or install separately"
    exit 1
fi

# Check available disk space
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}')
echo "✅ Available disk space: $AVAILABLE_SPACE"

# Check available memory
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    AVAILABLE_MEM=$(free -h | awk '/^Mem:/ {print $7}')
    echo "✅ Available memory: $AVAILABLE_MEM"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    AVAILABLE_MEM=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
    echo "✅ Available memory: $(($AVAILABLE_MEM * 4096 / 1024 / 1024))MB"
fi

# Check required ports
echo ""
echo "=== Checking Required Ports ==="
REQUIRED_PORTS=(3000 5173 5432 6379 9090 3030 16686)
for port in "${REQUIRED_PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port: In use"
    else
        echo "✅ Port $port: Available"
    fi
done

echo ""
echo "=== Prerequisites Check Complete ==="
```

**Run the checker**:

```bash
chmod +x prereq-check.sh
./prereq-check.sh
```

### Port Requirements

Ensure these ports are available:

| Port | Service | Protocol | Required |
|------|---------|----------|----------|
| 3000 | API Gateway | HTTP | ✅ Yes |
| 5173 | Frontend | HTTP | ✅ Yes |
| 5432 | PostgreSQL | TCP | ✅ Yes |
| 6379 | Redis | TCP | ✅ Yes |
| 9090 | Prometheus | HTTP | Optional |
| 3030 | Grafana | HTTP | Optional |
| 16686 | Jaeger UI | HTTP | Optional |
| 14268 | Jaeger Collector | HTTP | Optional |

**Free up a port if needed**:

```bash
# Find process using port
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

---

## Installation

### Option A: npm Installation (Recommended)

Best for: Quick setup, automatic updates, minimal configuration

#### 1. Install Package

```bash
# Install globally
npm install -g @raghavendra198902/iac-dharma

# Verify installation
iac-dharma --version
# Expected: v1.0.0 or higher
```

#### 2. Initialize Project

```bash
# Create new directory
mkdir my-iac-project
cd my-iac-project

# Initialize
iac-dharma init

# This creates:
# - .env file with default configuration
# - docker-compose.yml with all services
# - config/ directory with settings
```

#### 3. Configure Environment

The init command creates a `.env` file. Review and update:

```bash
# Open .env for editing
nano .env

# Key variables to check:
# - JWT_SECRET (generate new)
# - POSTGRES_PASSWORD (change default)
# - REDIS_PASSWORD (change default)
```

**Generate secure secrets**:

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

### Option B: Git Clone Installation

Best for: Development, customization, contributing

#### 1. Clone Repository

```bash
# Clone repository
git clone https://github.com/Raghavendra198902/iac.git
cd iac

# Checkout latest release
git checkout v1.0.0
```

#### 2. Copy Environment File

```bash
# Copy example environment
cp .env.example .env

# Edit configuration
nano .env
```

#### 3. Install Dependencies

```bash
# Install all service dependencies
npm run install:all

# Or install individually
cd backend/api-gateway && npm install
cd backend/iac-generator && npm install
# ... repeat for each service
```

#### 4. Build Docker Images

```bash
# Build all images
docker compose build

# Or build specific service
docker compose build api-gateway
```

### Option C: Docker-Only Installation

Best for: Testing, isolated environments

#### 1. Create docker-compose.yml

```bash
mkdir iac-platform
cd iac-platform

# Download docker-compose file
curl -o docker-compose.yml \
  https://raw.githubusercontent.com/Raghavendra198902/iac/master/docker-compose.yml
```

#### 2. Create .env File

```bash
# Download example environment
curl -o .env \
  https://raw.githubusercontent.com/Raghavendra198902/iac/master/.env.example

# Edit as needed
nano .env
```

#### 3. Pull Images

```bash
# Pull pre-built images
docker compose pull
```

### Verify Installation

Regardless of installation method, verify:

```bash
# Check command availability
iac-dharma --version

# Check Docker setup
docker compose config

# Validate environment
iac-dharma validate
```

---

## Start Services

### Quick Start (All Services)

```bash
# Start all services in background
iac-dharma start

# Or use docker compose directly
docker compose up -d

# Wait for initialization (30-60 seconds)
sleep 60
```

### Start Output

You should see services starting:

```
[+] Running 18/18
 ✔ Network iac_default                Created
 ✔ Container dharma-postgres          Started
 ✔ Container dharma-redis             Started
 ✔ Container dharma-api-gateway       Started
 ✔ Container dharma-iac-generator     Started
 ✔ Container dharma-blueprint         Started
 ✔ Container dharma-orchestrator      Started
 ✔ Container dharma-guardrails        Started
 ✔ Container dharma-costing           Started
 ✔ Container dharma-ai-engine         Started
 ✔ Container dharma-cloud-provider    Started
 ✔ Container dharma-monitoring        Started
 ✔ Container dharma-cmdb              Started
 ✔ Container dharma-automation        Started
 ✔ Container dharma-frontend          Started
 ✔ Container dharma-prometheus        Started
 ✔ Container dharma-grafana           Started
 ✔ Container dharma-jaeger            Started
```

### Selective Service Start

Start only specific services:

```bash
# Start core services only
docker compose up -d postgres redis api-gateway frontend

# Add AI services
docker compose up -d ai-engine ai-recommendations

# Add monitoring
docker compose up -d prometheus grafana jaeger
```

### Service Startup Order

Services start in this dependency order:

1. **Infrastructure** (10-15s): postgres, redis
2. **Core Backend** (20-30s): api-gateway, blueprint, iac-generator
3. **Advanced Services** (15-20s): orchestrator, guardrails, costing, ai-engine
4. **Support Services** (10-15s): monitoring, cmdb, automation
5. **Frontend** (10-15s): frontend
6. **Observability** (5-10s): prometheus, grafana, jaeger

**Total startup time**: 60-90 seconds

### Monitor Startup Progress

Watch logs in real-time:

```bash
# Watch all services
docker compose logs -f

# Watch specific service
docker compose logs -f api-gateway

# Watch core services
docker compose logs -f postgres redis api-gateway
```

### Verify Services Started

```bash
# Check running containers
docker compose ps

# Should show all services "Up" and "healthy"
# Health checks may take 30-60 seconds

# Quick health check
iac-dharma health
```

### Startup Troubleshooting

If services fail to start:

```bash
# Check logs for errors
docker compose logs | grep -i error

# Restart failed service
docker compose restart <service-name>

# Full restart
docker compose down
docker compose up -d

# Clean start (removes volumes)
docker compose down -v
docker compose up -d
```

---

## Access Platform

Once services are running, access the platform through these interfaces:

### Core Web Interfaces

#### Frontend Dashboard

```
URL: http://localhost:5173
Purpose: Main user interface
Features:
  - Blueprint creation and management
  - Infrastructure visualization
  - Deployment monitoring
  - Cost analysis
  - AI recommendations
Credentials: Create account on first visit
```

**First Login**:
1. Navigate to http://localhost:5173
2. Click "Sign Up"
3. Create admin account
4. Verify email (check console logs in dev mode)

#### API Gateway

```
URL: http://localhost:3000
Purpose: REST API endpoints
Features:
  - RESTful APIs for all services
  - Health checks
  - Metrics endpoint
Authentication: JWT tokens
Rate Limiting: 1000 req/15min per IP
```

**Test API**:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/api/info

# Get blueprints (requires authentication)
curl http://localhost:3000/api/blueprints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### API Documentation (Swagger)

```
URL: http://localhost:3000/api-docs
Purpose: Interactive API documentation
Features:
  - Try API endpoints directly
  - Request/response examples
  - Authentication testing
  - Schema definitions
```

### Monitoring & Observability

#### Grafana Dashboards

```
URL: http://localhost:3030
Default Credentials:
  Username: admin
  Password: admin
Purpose: Metrics visualization and alerting
```

**Available Dashboards**:
- **IAC Overview**: System-wide metrics
- **API Performance**: Request latency, throughput
- **Database Metrics**: Query performance, connections
- **Infrastructure Costs**: Real-time cost tracking
- **Service Health**: Service status, errors

**Change Password on First Login**:
1. Login with admin/admin
2. Skip or set new password
3. Navigate to Dashboards → Manage

#### Prometheus Metrics

```
URL: http://localhost:9090
Purpose: Metrics storage and querying
Query Language: PromQL
```

**Useful Queries**:

```promql
# API request rate
rate(http_requests_total[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Active deployments
deployment_active_count
```

#### Jaeger Distributed Tracing

```
URL: http://localhost:16686
Purpose: Trace requests across microservices
Features:
  - Request flow visualization
  - Performance bottleneck identification
  - Dependency graph
```

**Search for Traces**:
1. Select Service: "api-gateway"
2. Select Operation: "POST /api/deployments"
3. Set Lookback: Last 1 hour
4. Click "Find Traces"

### Database Access

#### PostgreSQL

```bash
# Connect via psql
docker compose exec postgres psql -U dharma -d iac_platform

# Connection string
postgresql://dharma:password@localhost:5432/iac_platform
```

**Common Queries**:

```sql
# View all blueprints
SELECT id, name, provider, created_at FROM blueprints LIMIT 10;

# Check active deployments
SELECT id, status, started_at FROM deployments WHERE status = 'running';

# User count
SELECT COUNT(*) FROM users;
```

#### Redis Cache

```bash
# Connect via redis-cli
docker compose exec redis redis-cli

# Connection string
redis://localhost:6379
```

**Common Commands**:

```redis
# Check cache stats
INFO stats

# View keys
KEYS *

# Get cached blueprint
GET blueprint:123

# Check session
GET session:user:456
```

### Service-Specific Endpoints

| Service | Port | Endpoint | Purpose |
|---------|------|----------|---------|
| API Gateway | 3000 | /api/* | Main API |
| IAC Generator | 3001 | /generate | Terraform generation |
| Blueprint Service | 3002 | /blueprints | Blueprint management |
| Orchestrator | 3003 | /deployments | Deployment orchestration |
| Guardrails | 3004 | /validate | Policy validation |
| Costing | 3005 | /estimate | Cost estimation |
| AI Engine | 3006 | /recommendations | AI recommendations |
| CMDB | 3007 | /assets | Asset inventory |
| Monitoring | 3008 | /metrics | Service metrics |

### Quick Access Script

Create this handy script:

```bash
#!/bin/bash
# quick-access.sh - Open all interfaces

# Get platform URL
PLATFORM_URL="http://localhost"

# Open in browser
echo "Opening IAC Dharma interfaces..."

# Frontend
open "$PLATFORM_URL:5173" 2>/dev/null || \
  xdg-open "$PLATFORM_URL:5173" 2>/dev/null

# API Docs
open "$PLATFORM_URL:3000/api-docs" 2>/dev/null || \
  xdg-open "$PLATFORM_URL:3000/api-docs" 2>/dev/null

# Grafana
open "$PLATFORM_URL:3030" 2>/dev/null || \
  xdg-open "$PLATFORM_URL:3030" 2>/dev/null

# Jaeger
open "$PLATFORM_URL:16686" 2>/dev/null || \
  xdg-open "$PLATFORM_URL:16686" 2>/dev/null

echo "All interfaces opened!"
```

---

## Verify Installation

### Automated Verification

Run the built-in verification:

```bash
# Complete health check
iac-dharma health --verbose

# Check specific service
iac-dharma health api-gateway

# Get detailed status
iac-dharma status --detailed
```

### Manual Verification Steps

#### 1. Check Container Status

```bash
# List all containers
docker compose ps

# Expected output: All containers "Up" and "healthy"
# Health status may take 30-60 seconds to become healthy
```

#### 2. Verify API Gateway

```bash
# Health endpoint
curl http://localhost:3000/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-11-22T10:00:00.000Z",
#   "uptime": 123.45,
#   "services": {
#     "database": "ok",
#     "cache": "ok",
#     "iacGenerator": "ok"
#   }
# }
```

#### 3. Verify Database Connection

```bash
# Database ready check
curl http://localhost:3000/health/db

# Expected: {"status":"ok","responseTime":5}
```


#### 4. Verify Redis Cache

```bash
# Cache ready check
curl http://localhost:3000/health/cache

# Expected: {"status":"ok","connected":true}
```

#### 5. Test Frontend Access

```bash
# Check frontend is serving
curl -I http://localhost:5173

# Expected: HTTP/1.1 200 OK
```

### Comprehensive Verification Script

```bash
#!/bin/bash
# verify-installation.sh - Complete installation verification

echo "=== IAC Dharma Installation Verification ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check endpoint
check_endpoint() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    echo -n "Checking $name... "
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$status_code" == "$expected_code" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $status_code)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $status_code, expected $expected_code)"
        return 1
    fi
}

# Check containers
echo "=== Container Status ==="
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}" | head -20

echo ""
echo "=== Service Health Checks ==="

# Core services
check_endpoint "API Gateway" "http://localhost:3000/health"
check_endpoint "Frontend" "http://localhost:5173" "200"
check_endpoint "Database" "http://localhost:3000/health/db"
check_endpoint "Cache" "http://localhost:3000/health/cache"

# Optional monitoring
check_endpoint "Prometheus" "http://localhost:9090/-/ready" "200" || echo -e "${YELLOW}(Optional)${NC}"
check_endpoint "Grafana" "http://localhost:3030/api/health" "200" || echo -e "${YELLOW}(Optional)${NC}"
check_endpoint "Jaeger" "http://localhost:16686/" "200" || echo -e "${YELLOW}(Optional)${NC}"

echo ""
echo "=== API Functionality Tests ==="

# Test API info endpoint
echo -n "API Info endpoint... "
info_response=$(curl -s http://localhost:3000/api/info)
if echo "$info_response" | grep -q "version"; then
    echo -e "${GREEN}✅ OK${NC}"
else
    echo -e "${RED}❌ FAIL${NC}"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "Platform Status: All critical services operational ✅"
echo "Next Steps:"
echo "  1. Access Frontend: http://localhost:5173"
echo "  2. View API Docs: http://localhost:3000/api-docs"
echo "  3. Create your first deployment!"
```

**Run verification**:

```bash
chmod +x verify-installation.sh
./verify-installation.sh
```

---

## First Deployment

Let's create your first infrastructure deployment end-to-end!

### Step 1: Create a Blueprint

A blueprint defines your desired infrastructure. Let's create a simple AWS VPC:

```bash
# Create blueprint via API
curl -X POST http://localhost:3000/api/blueprints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My First VPC",
    "description": "Simple VPC for learning",
    "provider": "aws",
    "region": "us-east-1",
    "resources": [
      {
        "type": "vpc",
        "name": "main-vpc",
        "properties": {
          "cidr_block": "10.0.0.0/16",
          "enable_dns_hostnames": true,
          "enable_dns_support": true,
          "tags": {
            "Name": "my-first-vpc",
            "Environment": "learning",
            "ManagedBy": "IAC-Dharma"
          }
        }
      },
      {
        "type": "subnet",
        "name": "public-subnet",
        "properties": {
          "vpc_id": "${aws_vpc.main-vpc.id}",
          "cidr_block": "10.0.1.0/24",
          "availability_zone": "us-east-1a",
          "map_public_ip_on_launch": true,
          "tags": {
            "Name": "public-subnet-1a",
            "Type": "Public"
          }
        }
      },
      {
        "type": "internet_gateway",
        "name": "main-igw",
        "properties": {
          "vpc_id": "${aws_vpc.main-vpc.id}",
          "tags": {
            "Name": "main-internet-gateway"
          }
        }
      }
    ]
  }'
```

**Response** (save the blueprint ID):

```json
{
  "id": "bp_abc123xyz",
  "name": "My First VPC",
  "status": "created",
  "created_at": "2024-11-22T10:00:00Z",
  "resources_count": 3
}
```

### Step 2: Validate with Guardrails

Before generating code, validate against security policies:

```bash
# Validate blueprint
curl -X POST http://localhost:3000/api/guardrails/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "blueprintId": "bp_abc123xyz"
  }'
```

**Response**:

```json
{
  "status": "passed",
  "checks": {
    "security": {
      "passed": 8,
      "failed": 0,
      "warnings": 1
    },
    "compliance": {
      "passed": 5,
      "failed": 0
    },
    "best_practices": {
      "passed": 12,
      "warnings": 2
    }
  },
  "warnings": [
    {
      "rule": "vpc_flow_logs",
      "message": "VPC Flow Logs not enabled",
      "severity": "medium",
      "recommendation": "Enable VPC Flow Logs for network monitoring"
    }
  ]
}
```

### Step 3: Get Cost Estimate

Check estimated monthly costs before deploying:

```bash
# Get cost estimate
curl -X POST http://localhost:3000/api/costing/estimate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "blueprintId": "bp_abc123xyz",
    "region": "us-east-1"
  }'
```

**Response**:

```json
{
  "total_monthly_cost": 0.00,
  "breakdown": {
    "vpc": {
      "cost": 0.00,
      "note": "VPCs are free in AWS"
    },
    "subnet": {
      "cost": 0.00,
      "note": "Subnets are free"
    },
    "internet_gateway": {
      "cost": 0.00,
      "note": "IGW is free, data transfer charges apply"
    }
  },
  "recommendations": [
    {
      "type": "optimization",
      "message": "Consider using VPC endpoints for S3 to reduce data transfer costs"
    }
  ]
}
```

### Step 4: Get AI Recommendations

Get intelligent optimization suggestions:

```bash
# Get AI recommendations
curl http://localhost:3000/api/ai/recommendations/bp_abc123xyz \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:

```json
{
  "recommendations": [
    {
      "category": "security",
      "priority": "high",
      "title": "Enable VPC Flow Logs",
      "description": "Enable VPC Flow Logs to monitor network traffic and detect anomalies",
      "implementation": "Add aws_flow_log resource",
      "estimated_impact": "Improves security monitoring"
    },
    {
      "category": "high_availability",
      "priority": "medium",
      "title": "Add Multiple Availability Zones",
      "description": "Deploy subnets across multiple AZs for high availability",
      "implementation": "Add subnets in us-east-1b and us-east-1c",
      "estimated_impact": "Increases availability by 50%"
    },
    {
      "category": "cost",
      "priority": "low",
      "title": "Use VPC Endpoints",
      "description": "Add VPC endpoints for S3 and DynamoDB to reduce data transfer costs",
      "implementation": "Add aws_vpc_endpoint resources",
      "estimated_savings": "$50-100/month for typical workloads"
    }
  ]
}
```

### Step 5: Generate Terraform Code

Generate IaC code from your blueprint:

```bash
# Generate Terraform
curl -X POST http://localhost:3000/api/iac/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "blueprintId": "bp_abc123xyz",
    "outputFormat": "terraform",
    "includeModules": true
  }'
```

**Response** (generated Terraform code):

```hcl
# Generated by IAC Dharma v1.0.0
# Blueprint: My First VPC
# Provider: AWS
# Region: us-east-1

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "main-vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "my-first-vpc"
    Environment = "learning"
    ManagedBy   = "IAC-Dharma"
  }
}

resource "aws_subnet" "public-subnet" {
  vpc_id                  = aws_vpc.main-vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true
  
  tags = {
    Name = "public-subnet-1a"
    Type = "Public"
  }
}

resource "aws_internet_gateway" "main-igw" {
  vpc_id = aws_vpc.main-vpc.id
  
  tags = {
    Name = "main-internet-gateway"
  }
}

output "vpc_id" {
  value       = aws_vpc.main-vpc.id
  description = "VPC ID"
}

output "subnet_id" {
  value       = aws_subnet.public-subnet.id
  description = "Public subnet ID"
}

output "igw_id" {
  value       = aws_internet_gateway.main-igw.id
  description = "Internet Gateway ID"
}
```

### Step 6: Deploy Infrastructure

Now deploy to your AWS account:

```bash
# Create deployment
curl -X POST http://localhost:3000/api/deployments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "blueprintId": "bp_abc123xyz",
    "environment": "development",
    "autoApply": false,
    "notifyOnCompletion": true
  }'
```

**Response**:

```json
{
  "id": "dep_xyz789abc",
  "blueprintId": "bp_abc123xyz",
  "status": "planning",
  "created_at": "2024-11-22T10:05:00Z",
  "estimated_duration": "2-3 minutes",
  "stages": [
    {
      "name": "validation",
      "status": "completed",
      "duration": "2s"
    },
    {
      "name": "planning",
      "status": "in_progress",
      "started_at": "2024-11-22T10:05:02Z"
    },
    {
      "name": "apply",
      "status": "pending"
    }
  ]
}
```

### Step 7: Monitor Deployment

Track deployment progress in real-time:

```bash
# Get deployment status
curl http://localhost:3000/api/deployments/dep_xyz789abc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Stream deployment logs
curl http://localhost:3000/api/deployments/dep_xyz789abc/logs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Or use WebSocket for real-time updates
# wscat -c ws://localhost:3000/api/deployments/dep_xyz789abc/stream
```

### Step 8: Review Results

Once deployment completes:

```bash
# Get final status
curl http://localhost:3000/api/deployments/dep_xyz789abc/results \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:

```json
{
  "id": "dep_xyz789abc",
  "status": "completed",
  "completed_at": "2024-11-22T10:07:30Z",
  "duration": "150s",
  "resources_created": 3,
  "outputs": {
    "vpc_id": "vpc-0abc123def456",
    "subnet_id": "subnet-0xyz789abc123",
    "igw_id": "igw-0def456ghi789"
  },
  "terraform_output": "Apply complete! Resources: 3 added, 0 changed, 0 destroyed.",
  "cost_actual": {
    "setup_cost": 0.00,
    "monthly_cost": 0.00
  }
}
```

---

## Using the Frontend

### Access the Dashboard

1. **Open Browser**: Navigate to http://localhost:5173
2. **First-Time Setup**: 
   - Click "Sign Up"
   - Enter email, password, name
   - Click "Create Account"
   - Check logs for verification (dev mode): `docker logs dharma-api-gateway | grep verification`

### Dashboard Overview

The main dashboard shows:

- **Active Deployments**: Real-time status of running deployments
- **Recent Blueprints**: Your infrastructure templates
- **Cost Overview**: Current and projected spending
- **Resource Inventory**: All managed resources
- **Quick Actions**: Common tasks (create blueprint, deploy, configure)

### Create Blueprint via UI

#### Step 1: Start New Blueprint

1. Click **"Create Blueprint"** button (top-right)
2. Fill in basic details:
   - **Name**: "Production Web Application"
   - **Description**: "Multi-tier web app infrastructure"
   - **Cloud Provider**: AWS (dropdown)
   - **Region**: us-east-1 (dropdown)

#### Step 2: Add Resources

1. Click **"Add Resource"**
2. Select **Resource Type**: VPC
3. Configure properties:
   - CIDR Block: 10.0.0.0/16
   - Enable DNS: ✅
   - Tags: Environment=production

4. Click **"Add Another Resource"**
5. Select **Resource Type**: Subnet
6. Configure:
   - CIDR: 10.0.1.0/24
   - AZ: us-east-1a
   - Type: Public

7. Repeat for additional resources (ALB, EC2, RDS, etc.)

#### Step 3: Visual Builder

- Use the **Visual Designer** tab for drag-and-drop interface
- Connect resources by dragging arrows between them
- Auto-generates resource dependencies
- Real-time validation as you build

#### Step 4: Review & Save

1. Click **"Review"** tab
2. See summary:
   - Resource count
   - Estimated cost
   - Guardrails validation
3. Click **"Save Blueprint"**

### Generate & Deploy via UI

#### Step 1: Select Blueprint

1. Go to **"Blueprints"** page
2. Find your blueprint
3. Click **"Generate IaC"**

#### Step 2: Review Generated Code

1. See generated Terraform in syntax-highlighted editor
2. Make manual adjustments if needed
3. Download code with **"Download"** button
4. Or continue to deploy

#### Step 3: Pre-Deployment Checks

Platform automatically runs:
1. **Guardrails Validation** ✅
   - Security policies
   - Compliance rules
   - Best practices
2. **Cost Estimation** 💰
   - Monthly costs
   - Resource breakdown
   - Optimization tips
3. **AI Recommendations** 🤖
   - Security improvements
   - Cost optimizations
   - Performance enhancements

#### Step 4: Deploy

1. Review all checks
2. Apply AI recommendations (optional)
3. Click **"Deploy"**
4. Choose environment: Development / Staging / Production
5. Confirm deployment

#### Step 5: Monitor Progress

- Real-time progress bar
- Live log streaming
- Stage-by-stage status:
  - ⏳ Validation
  - ⏳ Planning
  - ⏳ Applying
  - ✅ Completed
- Resource creation notifications

### Explore Features

#### Cost Dashboard

- Navigate to **"Costs"** tab
- View charts:
  - Daily spending trends
  - Cost by service
  - Cost by environment
  - Projected vs actual
- Set budget alerts
- Download cost reports

#### Resource Inventory (CMDB)

- Navigate to **"Inventory"** tab
- See all managed resources:
  - Filter by provider, type, status
  - Search by name or tag
  - View resource details
  - Check compliance status

#### AI Recommendations

- Navigate to **"AI Insights"** tab
- Get recommendations for:
  - Cost optimization
  - Security hardening
  - Performance improvements
  - Resource right-sizing
- Apply recommendations with one click

#### Monitoring & Observability

- Navigate to **"Monitoring"** tab
- View embedded dashboards:
  - System health
  - API performance
  - Deployment success rate
  - Error trends
- Click **"Open Grafana"** for detailed analysis
- Click **"View Traces"** to open Jaeger

---

## CLI Commands

### Project Management

```bash
# Initialize new project
iac-dharma init [--name <project>] [--template <template>]

# Examples:
iac-dharma init --name my-project
iac-dharma init --name webapp --template aws-three-tier

# Show system information
iac-dharma info

# Validate configuration
iac-dharma validate

# Update to latest version
iac-dharma update

# Show version
iac-dharma --version

# Show help
iac-dharma --help
```

### Service Management

```bash
# Start all services
iac-dharma start [--profile <profile>]

# Start with specific profile
iac-dharma start --profile production

# Stop all services
iac-dharma stop

# Restart services
iac-dharma restart [service-name]

# Restart specific service
iac-dharma restart api-gateway

# Show service status
iac-dharma status [--detailed]

# Health check
iac-dharma health [service-name] [--verbose]

# Examples:
iac-dharma health
iac-dharma health api-gateway --verbose
```

### Logs & Debugging

```bash
# View logs
iac-dharma logs <service-name> [--follow] [--tail <n>]

# Examples:
iac-dharma logs api-gateway
iac-dharma logs frontend --follow
iac-dharma logs postgres --tail 100

# View all logs
iac-dharma logs --all --tail 50

# Search logs
iac-dharma logs api-gateway --grep "error"

# Export logs
iac-dharma logs api-gateway --since 1h > api-gateway.log
```

### Blueprint Management

```bash
# List blueprints
iac-dharma blueprint list [--provider <provider>]

# Create blueprint
iac-dharma blueprint create --file blueprint.json

# Validate blueprint
iac-dharma blueprint validate <blueprint-id>

# Generate IaC
iac-dharma blueprint generate <blueprint-id> \
  --format terraform \
  --output ./generated

# Delete blueprint
iac-dharma blueprint delete <blueprint-id>
```

### Deployment Management

```bash
# Create deployment
iac-dharma deploy <blueprint-id> \
  --environment <env> \
  [--auto-apply] \
  [--notify]

# Examples:
iac-dharma deploy bp_abc123 --environment production
iac-dharma deploy bp_abc123 --environment dev --auto-apply

# List deployments
iac-dharma deployment list [--status <status>]

# Get deployment status
iac-dharma deployment status <deployment-id>

# View deployment logs
iac-dharma deployment logs <deployment-id> [--follow]

# Cancel deployment
iac-dharma deployment cancel <deployment-id>

# Rollback deployment
iac-dharma deployment rollback <deployment-id>
```

### Maintenance Commands

```bash
# Clean Docker resources
iac-dharma clean [--all] [--volumes]

# Examples:
iac-dharma clean              # Remove stopped containers
iac-dharma clean --all        # Remove all (including images)
iac-dharma clean --volumes    # Remove volumes too

# Backup database
iac-dharma backup [--output <path>]

# Restore database
iac-dharma restore --file <backup-file>

# Database migrations
iac-dharma migrate [up|down|status]

# Examples:
iac-dharma migrate up         # Apply pending migrations
iac-dharma migrate status     # Show migration status
```

### Configuration

```bash
# View configuration
iac-dharma config show [--key <key>]

# Set configuration
iac-dharma config set <key> <value>

# Examples:
iac-dharma config show
iac-dharma config show database.host
iac-dharma config set feature.ai.enabled true

# Validate environment
iac-dharma env validate

# Switch environment
iac-dharma env switch <environment>
```

---

## Common Workflows

### Workflow 1: Multi-Cloud Deployment

Deploy the same application across AWS, Azure, and GCP:

**Step 1: Create Base Blueprint**

```bash
# Create blueprint for web application
iac-dharma blueprint create --file base-webapp.json
```

**base-webapp.json**:

```json
{
  "name": "Multi-Cloud Web Application",
  "description": "Portable web app blueprint",
  "resources": [
    {
      "type": "compute",
      "name": "web-server",
      "properties": {
        "instance_type": "medium",
        "os": "ubuntu-22.04",
        "storage_gb": 50
      }
    },
    {
      "type": "database",
      "name": "app-db",
      "properties": {
        "engine": "postgresql",
        "version": "15",
        "instance_class": "small"
      }
    },
    {
      "type": "load_balancer",
      "name": "app-lb",
      "properties": {
        "type": "application",
        "protocol": "https"
      }
    }
  ]
}
```

**Step 2: Generate AWS Version**

```bash
# Generate for AWS
iac-dharma blueprint generate bp_base123 \
  --provider aws \
  --region us-east-1 \
  --output ./aws-deployment
```

**Step 3: Generate Azure Version**

```bash
# Generate for Azure
iac-dharma blueprint generate bp_base123 \
  --provider azure \
  --region eastus \
  --output ./azure-deployment
```

**Step 4: Generate GCP Version**

```bash
# Generate for GCP
iac-dharma blueprint generate bp_base123 \
  --provider gcp \
  --region us-central1 \
  --output ./gcp-deployment
```

**Step 5: Deploy to All Clouds**

```bash
# Deploy to AWS
iac-dharma deploy bp_aws123 --environment production-aws

# Deploy to Azure
iac-dharma deploy bp_azure456 --environment production-azure

# Deploy to GCP
iac-dharma deploy bp_gcp789 --environment production-gcp
```

### Workflow 2: Cost Optimization

Identify and reduce infrastructure costs:

**Step 1: Get Cost Analysis**

```bash
# Get current costs
curl http://localhost:3000/api/costing/current \
  -H "Authorization: Bearer $TOKEN"
```

**Step 2: Get AI Recommendations**

```bash
# Get optimization recommendations
curl http://localhost:3000/api/ai/cost-optimization \
  -H "Authorization: Bearer $TOKEN"
```

**Step 3: Apply Recommendations**

```bash
# Apply specific recommendation
curl -X POST http://localhost:3000/api/ai/apply-recommendation \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "recommendationId": "rec_cost_123",
    "blueprintId": "bp_abc123"
  }'
```

**Step 4: Re-deploy with Optimizations**

```bash
# Create new deployment with optimized blueprint
iac-dharma deploy bp_abc123 --environment production
```

**Step 5: Track Savings**

```bash
# View cost comparison
curl http://localhost:3000/api/costing/comparison \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "beforeDeploymentId": "dep_old",
    "afterDeploymentId": "dep_new"
  }'
```

### Workflow 3: CI/CD Integration

Integrate IAC Dharma into your CI/CD pipeline:

**GitHub Actions Example** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy Infrastructure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Install IAC Dharma CLI
        run: |
          npm install -g @raghavendra198902/iac-dharma
          iac-dharma --version
      
      - name: Create Blueprint
        run: |
          iac-dharma blueprint create \
            --file infrastructure/blueprint.json \
            --output blueprint-id.txt
          
          BLUEPRINT_ID=$(cat blueprint-id.txt)
          echo "BLUEPRINT_ID=$BLUEPRINT_ID" >> $GITHUB_ENV
      
      - name: Validate Blueprint
        run: |
          iac-dharma blueprint validate ${{ env.BLUEPRINT_ID }}
      
      - name: Get Cost Estimate
        run: |
          iac-dharma blueprint estimate ${{ env.BLUEPRINT_ID }} \
            --output cost-estimate.json
      
      - name: Deploy
        if: github.ref == 'refs/heads/main'
        run: |
          iac-dharma deploy ${{ env.BLUEPRINT_ID }} \
            --environment production \
            --auto-apply \
            --wait
        env:
          IAC_DHARMA_TOKEN: ${{ secrets.IAC_DHARMA_TOKEN }}
      
      - name: Notify
        if: always()
        run: |
          # Send notification (Slack, email, etc.)
          echo "Deployment completed"
```

**GitLab CI Example** (`.gitlab-ci.yml`):

```yaml
stages:
  - validate
  - deploy

variables:
  IAC_DHARMA_VERSION: "1.0.0"

before_script:
  - npm install -g @raghavendra198902/iac-dharma@${IAC_DHARMA_VERSION}

validate:
  stage: validate
  script:
    - iac-dharma blueprint validate --file infrastructure/blueprint.json
    - iac-dharma blueprint estimate --file infrastructure/blueprint.json
  only:
    - merge_requests

deploy:
  stage: deploy
  script:
    - iac-dharma deploy --file infrastructure/blueprint.json --auto-apply
  only:
    - main
  environment:
    name: production
```

### Workflow 4: Disaster Recovery Testing

Regularly test your disaster recovery procedures:

**Step 1: Create Test Environment**

```bash
# Clone production blueprint
iac-dharma blueprint clone bp_prod123 \
  --name "DR Test Environment" \
  --environment dr-test
```

**Step 2: Deploy to DR Region**

```bash
# Deploy to disaster recovery region
iac-dharma deploy bp_dr456 \
  --region us-west-2 \
  --environment dr-test
```

**Step 3: Simulate Failure**

```bash
# Manually test failover procedures
# 1. Disable production region
# 2. Update DNS to point to DR region
# 3. Verify application functionality
```

**Step 4: Measure Recovery Time**

```bash
# Get deployment timeline
curl http://localhost:3000/api/deployments/dep_dr789/timeline \
  -H "Authorization: Bearer $TOKEN"
```

**Step 5: Cleanup**

```bash
# Destroy DR test environment
iac-dharma deployment destroy dep_dr789
```

---

## Quick Troubleshooting

### Services Not Starting

**Symptoms**: Containers exit immediately or fail health checks

**Diagnosis**:

```bash
# Check container status
docker compose ps

# View logs
docker compose logs <service-name>

# Check Docker daemon
docker info
```

**Solutions**:

1. **Insufficient Resources**:
   ```bash
   # Check available resources
   docker stats
   
   # Increase Docker memory (Docker Desktop)
   # Settings → Resources → Memory: 8GB+
   ```

2. **Port Conflicts**:
   ```bash
   # Find conflicting process
   sudo lsof -i :3000
   
   # Kill process or change port in .env
   ```

3. **Missing Environment Variables**:
   ```bash
   # Check .env file exists
   ls -la .env
   
   # Copy from example if missing
   cp .env.example .env
   ```

4. **Database Not Ready**:
   ```bash
   # Wait for PostgreSQL
   docker compose logs postgres | grep "ready to accept connections"
   
   # Restart dependent services
   docker compose restart api-gateway
   ```

### Database Connection Errors

**Symptoms**: API returns database connection errors

**Diagnosis**:

```bash
# Check PostgreSQL status
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres --tail 50

# Test connection
docker compose exec postgres psql -U dharma -d iac_platform -c "SELECT 1;"
```

**Solutions**:

1. **PostgreSQL Not Running**:
   ```bash
   docker compose restart postgres
   sleep 10
   docker compose restart api-gateway
   ```

2. **Wrong Credentials**:
   ```bash
   # Check .env file
   grep POSTGRES .env
   
   # Ensure matches docker-compose.yml
   grep POSTGRES docker-compose.yml
   ```

3. **Database Not Created**:
   ```bash
   # Create database
   docker compose exec postgres \
     psql -U dharma -c "CREATE DATABASE iac_platform;"
   
   # Run migrations
   iac-dharma migrate up
   ```

### Frontend Not Loading

**Symptoms**: Blank page or connection refused

**Diagnosis**:

```bash
# Check frontend container
docker compose ps frontend

# View frontend logs
docker compose logs frontend --tail 100

# Test port
curl -I http://localhost:5173
```

**Solutions**:

1. **Build Failed**:
   ```bash
   # Rebuild frontend
   docker compose build --no-cache frontend
   docker compose up -d frontend
   ```

2. **API Gateway Unreachable**:
   ```bash
   # Check API Gateway
   curl http://localhost:3000/health
   
   # Verify VITE_API_URL in .env
   grep VITE_API_URL .env
   ```

3. **Node Modules Issue**:
   ```bash
   # Remove and rebuild
   docker compose down frontend
   docker volume rm iac_frontend_node_modules
   docker compose up -d frontend
   ```

### High Memory Usage

**Symptoms**: System slowdown, OOM errors

**Diagnosis**:

```bash
# Check memory usage
docker stats --no-stream

# Find high memory containers
docker stats --no-stream | sort -k 4 -h
```

**Solutions**:

1. **Set Memory Limits**:
   ```yaml
   # In docker-compose.yml
   services:
     api-gateway:
       deploy:
         resources:
           limits:
             memory: 512M
           reservations:
             memory: 256M
   ```

2. **Restart Services**:
   ```bash
   docker compose restart
   ```

3. **Prune Unused Resources**:
   ```bash
   docker system prune -a
   docker volume prune
   ```

### Slow API Responses

**Symptoms**: API calls taking > 5 seconds

**Diagnosis**:

```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/blueprints

# curl-format.txt:
#   time_total: %{time_total}\n
#   time_namelookup: %{time_namelookup}\n
#   time_connect: %{time_connect}\n

# Check database queries
docker compose exec postgres psql -U dharma -d iac_platform -c "
  SELECT query, calls, mean_exec_time 
  FROM pg_stat_statements 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;"
```

**Solutions**:

1. **Database Optimization**:
   ```bash
   # Run VACUUM
   docker compose exec postgres \
     psql -U dharma -d iac_platform -c "VACUUM ANALYZE;"
   
   # Check missing indexes
   # See Performance-Tuning.md for index strategies
   ```

2. **Clear Cache**:
   ```bash
   # Flush Redis cache
   docker compose exec redis redis-cli FLUSHALL
   ```

3. **Scale Services**:
   ```bash
   # Increase replicas
   docker compose up -d --scale api-gateway=3
   ```

### Authentication Issues

**Symptoms**: "Unauthorized" or "Invalid token" errors

**Diagnosis**:

```bash
# Check JWT_SECRET exists
grep JWT_SECRET .env

# Verify token
curl http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Solutions**:

1. **Generate New JWT Secret**:
   ```bash
   # Generate secret
   openssl rand -base64 32
   
   # Update .env
   JWT_SECRET=<generated-secret>
   
   # Restart services
   docker compose restart
   ```

2. **Re-authenticate**:
   ```bash
   # Login again
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "your@email.com",
       "password": "your-password"
     }'
   ```

### Getting More Help

If issues persist:

1. **Enable Debug Logging**:
   ```bash
   # In .env
   LOG_LEVEL=debug
   
   # Restart services
   docker compose restart
   ```

2. **Collect Diagnostics**:
   ```bash
   # Save all logs
   docker compose logs > all-logs.txt
   
   # Get system info
   iac-dharma info > system-info.txt
   
   # Export configuration
   docker compose config > compose-config.yml
   ```

3. **Open GitHub Issue**:
   - Go to: https://github.com/Raghavendra198902/iac/issues
   - Include:
     - Error messages
     - Relevant logs
     - System information
     - Steps to reproduce

---

## Configuration

### Essential .env Variables

```bash
# Application
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Security
JWT_SECRET=your-secure-secret-here      # Generate with: openssl rand -base64 32
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=iac_platform
POSTGRES_USER=dharma
POSTGRES_PASSWORD=your-db-password      # Generate with: openssl rand -base64 24
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=20

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password      # Generate with: openssl rand -base64 24
REDIS_DB=0
CACHE_TTL=3600

# Cloud Providers
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret

AZURE_SUBSCRIPTION_ID=your-subscription
AZURE_TENANT_ID=your-tenant
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-secret

GCP_PROJECT_ID=your-project
GCP_KEY_FILE=/path/to/service-account.json

# Features
FEATURE_AI_ENABLED=true
FEATURE_COSTING_ENABLED=true
FEATURE_GUARDRAILS_ENABLED=true
FEATURE_SSO_ENABLED=false

# Monitoring
PROMETHEUS_ENABLED=true
JAEGER_ENABLED=true
GRAFANA_ENABLED=true

# Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_FROM=noreply@iacdharma.com
```

### Generate All Secrets

```bash
#!/bin/bash
# generate-secrets.sh - Generate all required secrets

echo "# Generated Secrets - $(date)" > .env.secrets
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env.secrets
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)" >> .env.secrets
echo "REDIS_PASSWORD=$(openssl rand -base64 24)" >> .env.secrets
echo "ENCRYPTION_KEY=$(openssl rand -hex 32)" >> .env.secrets

echo "Secrets generated in .env.secrets"
echo "Copy these to your .env file"
```

### Apply Configuration Changes

```bash
# After updating .env
docker compose down
docker compose up -d

# Verify configuration
iac-dharma config show
```

---

## Security Setup

### Basic Security Configuration

#### 1. Change Default Passwords

```bash
# Update .env
POSTGRES_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)
GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 16)
```

#### 2. Enable HTTPS

**Option A: Using Let's Encrypt**

```bash
# Install certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone \
  -d your-domain.com \
  -d www.your-domain.com

# Update docker-compose.yml
services:
  api-gateway:
    environment:
      - HTTPS_ENABLED=true
      - SSL_CERT=/certs/fullchain.pem
      - SSL_KEY=/certs/privkey.pem
    volumes:
      - /etc/letsencrypt/live/your-domain.com:/certs:ro
```

**Option B: Self-Signed Certificate (Development)**

```bash
# Generate self-signed certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout config/ssl/selfsigned.key \
  -out config/ssl/selfsigned.crt \
  -subj "/CN=localhost"

# Update .env
SSL_CERT=/app/config/ssl/selfsigned.crt
SSL_KEY=/app/config/ssl/selfsigned.key
```

#### 3. Configure Firewall

```bash
# Allow required ports only
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# Block direct access to services (keep internal)
# Access frontend/API Gateway through reverse proxy only
```

#### 4. Set Up Rate Limiting

Already configured in API Gateway. Adjust in .env:

```bash
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_DEPLOYMENT_MAX=10
```

#### 5. Enable Audit Logging

```bash
# In .env
AUDIT_LOG_ENABLED=true
AUDIT_LOG_LEVEL=info
AUDIT_LOG_RETENTION_DAYS=90
```

#### 6. Secure Redis

```bash
# In .env
REDIS_PASSWORD=your-strong-password

# Update docker-compose.yml
services:
  redis:
    command: >
      redis-server
      --requirepass your-strong-password
      --maxmemory 2gb
      --maxmemory-policy allkeys-lru
      --appendonly yes
```

### Production Security Checklist

- [ ] Change all default passwords
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Restrict database access
- [ ] Set up backup encryption
- [ ] Configure Secrets management (Vault, AWS Secrets Manager)
- [ ] Enable MFA for admin users
- [ ] Regular security updates
- [ ] Monitor security logs
- [ ] Implement least privilege access

See [Security Best Practices](Security-Best-Practices) for comprehensive security guide.

---

## Next Steps

### Beginner Path

1. ✅ **Complete Quick Start** - You're here!
2. 📖 **Read Architecture Overview**
   - Understand system design
   - Learn about microservices
   - [Architecture Overview](Architecture-Overview)

3. 🚀 **Try Example Deployments**
   - AWS EKS Cluster
   - Azure Web App
   - GCP Cloud Run
   - [Deployment Examples](Deployment-Examples)

4. 🎓 **Follow Tutorials**
   - Step-by-step guides
   - Best practices
   - [Tutorial Series](Tutorials)

### Advanced Path

1. ✅ **Complete Quick Start**
2. ⚙️ **Configure Advanced Features**
   - Feature flags: [Feature Flags](Feature-Flags)
   - SSO integration: [SSO Integration](SSO-Integration)
   - Custom guardrails: [Guardrails](Guardrails)

3. �� **Set Up Advanced Monitoring**
   - Custom dashboards
   - Alert rules
   - [Advanced Monitoring](Advanced-Monitoring)

4. 🔧 **Customize Platform**
   - Add custom providers
   - Extend AI engine
   - [Customization Guide](Customization)

### Developer Path

1. ✅ **Complete Quick Start**
2. 💻 **Development Environment**
   - Local development setup
   - Contribute to codebase
   - [Development Setup](Development-Setup)

3. 🧪 **Testing Guide**
   - Write unit tests
   - Integration testing
   - [Testing Guide](Testing-Guide)

4. 🤝 **Contributing**
   - Code standards
   - Pull request process
   - [Contributing Guide](Contributing)

### Essential Documentation

| Guide | Purpose | Time |
|-------|---------|------|
| [Installation Guide](Installation-Guide) | Detailed installation | 15 min |
| [Configuration Guide](Configuration) | Complete configuration reference | 20 min |
| [CLI Reference](CLI-Reference) | All CLI commands | 10 min |
| [API Reference](API-Reference) | REST API documentation | 30 min |
| [Docker Compose Guide](Docker-Compose) | Container orchestration | 15 min |
| [Kubernetes Deployment](Kubernetes-Deployment) | K8s production setup | 30 min |

### Feature Guides

| Feature | Documentation | Time |
|---------|---------------|------|
| Multi-Cloud | [Multi-Cloud Support](Multi-Cloud-Support) | 15 min |
| AI Engine | [AI Recommendations](AI-Recommendations) | 20 min |
| Cost Management | [Cost Optimization](Cost-Optimization) | 15 min |
| Security | [Security Best Practices](Security-Best-Practices) | 30 min |
| Monitoring | [Observability](Observability) | 25 min |
| Backup/DR | [Backup and Recovery](Backup-and-Recovery) | 20 min |

### Get Help & Support

- 📚 **Documentation**: Complete wiki at `/docs/wiki/`
- 🐛 **Issues**: https://github.com/Raghavendra198902/iac/issues
- 💬 **Discussions**: https://github.com/Raghavendra198902/iac/discussions
- 📧 **Email**: raghavendra198902@gmail.com
- 📦 **npm**: https://www.npmjs.com/package/@raghavendra198902/iac-dharma

### Community & Updates

- ⭐ **Star on GitHub**: https://github.com/Raghavendra198902/iac
- 📰 **Release Notes**: [RELEASE_NOTES.md](https://github.com/Raghavendra198902/iac/blob/master/RELEASE_NOTES.md)
- 🔔 **Watch Repository**: Get notified of updates
- 🤝 **Contribute**: Pull requests welcome!

---

**🎉 Congratulations! You've completed the Quick Start Guide!**

Your IAC Dharma platform is now running and ready for production use. Start building amazing infrastructure! 🚀

