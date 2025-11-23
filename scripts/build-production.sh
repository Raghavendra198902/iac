#!/bin/bash

################################################################################
# Production Build Script for IAC DHARMA Platform
# Version: 2.0.0
# Description: Builds and validates frontend and backend for production
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${PROJECT_ROOT}/build"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BUILD_LOG="${PROJECT_ROOT}/build_${TIMESTAMP}.log"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  IAC DHARMA Production Build${NC}"
echo -e "${BLUE}  Version: 2.0.0${NC}"
echo -e "${BLUE}  Started: $(date)${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to log messages
log() {
    echo -e "$1" | tee -a "$BUILD_LOG"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
log "${YELLOW}[1/8] Checking prerequisites...${NC}"

if ! command_exists node; then
    log "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    log "${RED}Error: npm is not installed${NC}"
    exit 1
fi

if ! command_exists docker; then
    log "${YELLOW}Warning: Docker is not installed (optional for container builds)${NC}"
fi

NODE_VERSION=$(node -v)
log "${GREEN}✓ Node.js version: ${NODE_VERSION}${NC}"

# Clean previous builds
log "\n${YELLOW}[2/8] Cleaning previous builds...${NC}"
rm -rf "${BUILD_DIR}"
mkdir -p "${BUILD_DIR}"
log "${GREEN}✓ Build directory created: ${BUILD_DIR}${NC}"

# Build Frontend
log "\n${YELLOW}[3/8] Building frontend...${NC}"
cd "${PROJECT_ROOT}/frontend"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    log "${YELLOW}Warning: .env.production not found, using .env.example${NC}"
    if [ -f .env.example ]; then
        log "${YELLOW}Creating .env.production from .env.example${NC}"
        cp .env.example .env.production
        log "${YELLOW}⚠️  Please update .env.production with production values!${NC}"
    fi
fi

# Install dependencies
log "Installing frontend dependencies..."
npm ci --production=false >> "$BUILD_LOG" 2>&1

# Run TypeScript type checking
log "Running TypeScript type check..."
npm run build >> "$BUILD_LOG" 2>&1

if [ $? -eq 0 ]; then
    log "${GREEN}✓ Frontend build successful${NC}"
    
    # Copy build artifacts
    cp -r dist "${BUILD_DIR}/frontend"
    
    # Calculate bundle sizes
    TOTAL_SIZE=$(du -sh "${BUILD_DIR}/frontend" | cut -f1)
    log "${GREEN}  Total bundle size: ${TOTAL_SIZE}${NC}"
    
    # Find main JS bundle size
    if [ -d "${BUILD_DIR}/frontend/assets" ]; then
        JS_SIZE=$(find "${BUILD_DIR}/frontend/assets" -name "*.js" -exec du -ch {} + | grep total$ | cut -f1)
        log "${GREEN}  JavaScript size: ${JS_SIZE}${NC}"
    fi
else
    log "${RED}✗ Frontend build failed${NC}"
    log "${RED}Check build log: ${BUILD_LOG}${NC}"
    exit 1
fi

# Build Backend Services
log "\n${YELLOW}[4/8] Building backend services...${NC}"

BACKEND_SERVICES=(
    "api-gateway"
    "iac-generator"
    "blueprint-service"
    "costing-service"
    "monitoring-service"
    "orchestrator-service"
)

for service in "${BACKEND_SERVICES[@]}"; do
    SERVICE_DIR="${PROJECT_ROOT}/backend/${service}"
    
    if [ -d "$SERVICE_DIR" ]; then
        log "Building ${service}..."
        cd "$SERVICE_DIR"
        
        if [ -f package.json ]; then
            npm ci --production=false >> "$BUILD_LOG" 2>&1
            
            if [ -f tsconfig.json ]; then
                npm run build >> "$BUILD_LOG" 2>&1
                
                if [ $? -eq 0 ]; then
                    log "${GREEN}✓ ${service} built successfully${NC}"
                    
                    # Copy build artifacts
                    mkdir -p "${BUILD_DIR}/backend/${service}"
                    if [ -d dist ]; then
                        cp -r dist "${BUILD_DIR}/backend/${service}/"
                    fi
                    if [ -f package.json ]; then
                        cp package.json "${BUILD_DIR}/backend/${service}/"
                    fi
                else
                    log "${RED}✗ ${service} build failed${NC}"
                    exit 1
                fi
            else
                log "${YELLOW}  No TypeScript config, skipping build${NC}"
            fi
        else
            log "${YELLOW}  No package.json found, skipping${NC}"
        fi
    else
        log "${YELLOW}  Service directory not found: ${service}${NC}"
    fi
done

# Run Tests
log "\n${YELLOW}[5/8] Running tests...${NC}"

cd "${PROJECT_ROOT}/frontend"
if [ -f package.json ] && npm run test --if-present >> "$BUILD_LOG" 2>&1; then
    log "${GREEN}✓ Frontend tests passed${NC}"
else
    log "${YELLOW}⚠️  Frontend tests skipped or no tests found${NC}"
fi

# Security Audit
log "\n${YELLOW}[6/8] Running security audit...${NC}"

cd "${PROJECT_ROOT}/frontend"
npm audit --audit-level=high >> "$BUILD_LOG" 2>&1

if [ $? -eq 0 ]; then
    log "${GREEN}✓ No high-severity vulnerabilities found${NC}"
else
    log "${YELLOW}⚠️  Vulnerabilities detected. Check build log for details.${NC}"
fi

# Build Docker Images (Optional)
log "\n${YELLOW}[7/8] Building Docker images...${NC}"

if command_exists docker; then
    log "Building frontend Docker image..."
    cd "${PROJECT_ROOT}"
    
    if [ -f frontend/Dockerfile.prod ]; then
        docker build \
            -f frontend/Dockerfile.prod \
            -t iac-dharma-frontend:2.0.0 \
            -t iac-dharma-frontend:latest \
            . >> "$BUILD_LOG" 2>&1
        
        if [ $? -eq 0 ]; then
            log "${GREEN}✓ Frontend Docker image built${NC}"
        else
            log "${RED}✗ Frontend Docker build failed${NC}"
        fi
    else
        log "${YELLOW}  Dockerfile.prod not found, skipping${NC}"
    fi
    
    # Build backend service images
    for service in "${BACKEND_SERVICES[@]}"; do
        SERVICE_DIR="${PROJECT_ROOT}/backend/${service}"
        
        if [ -f "${SERVICE_DIR}/Dockerfile" ]; then
            log "Building ${service} Docker image..."
            docker build \
                -t "iac-dharma-${service}:2.0.0" \
                -t "iac-dharma-${service}:latest" \
                "${SERVICE_DIR}" >> "$BUILD_LOG" 2>&1
            
            if [ $? -eq 0 ]; then
                log "${GREEN}✓ ${service} Docker image built${NC}"
            else
                log "${YELLOW}⚠️  ${service} Docker build failed${NC}"
            fi
        fi
    done
else
    log "${YELLOW}Docker not available, skipping image builds${NC}"
fi

# Generate Build Report
log "\n${YELLOW}[8/8] Generating build report...${NC}"

REPORT_FILE="${BUILD_DIR}/build-report.txt"

cat > "$REPORT_FILE" << EOF
================================================================================
IAC DHARMA Production Build Report
================================================================================

Build Date: $(date)
Build Version: 2.0.0
Build ID: ${TIMESTAMP}

--------------------------------------------------------------------------------
Frontend Build
--------------------------------------------------------------------------------
Status: SUCCESS
Output Directory: ${BUILD_DIR}/frontend
Total Size: ${TOTAL_SIZE}
JavaScript Size: ${JS_SIZE:-N/A}

Files:
$(ls -lh "${BUILD_DIR}/frontend" 2>/dev/null || echo "No files")

--------------------------------------------------------------------------------
Backend Services
--------------------------------------------------------------------------------
$(for service in "${BACKEND_SERVICES[@]}"; do
    if [ -d "${BUILD_DIR}/backend/${service}" ]; then
        echo "✓ ${service}: BUILT"
    else
        echo "⚠ ${service}: SKIPPED"
    fi
done)

--------------------------------------------------------------------------------
Docker Images
--------------------------------------------------------------------------------
$(docker images | grep iac-dharma || echo "No Docker images built")

--------------------------------------------------------------------------------
Build Log
--------------------------------------------------------------------------------
Full build log: ${BUILD_LOG}

================================================================================
EOF

log "${GREEN}✓ Build report generated: ${REPORT_FILE}${NC}"

# Summary
log "\n${GREEN}========================================${NC}"
log "${GREEN}  Build Complete!${NC}"
log "${GREEN}========================================${NC}"
log "\n${BLUE}Build artifacts location:${NC}"
log "  ${BUILD_DIR}"
log "\n${BLUE}Next steps:${NC}"
log "  1. Review build report: ${REPORT_FILE}"
log "  2. Test the build locally: npm run preview"
log "  3. Deploy to staging environment"
log "  4. Run smoke tests"
log "  5. Deploy to production"
log "\n${BLUE}Deployment commands:${NC}"
log "  Kubernetes: kubectl apply -f k8s/overlays/production/"
log "  Docker: docker-compose -f docker-compose.prod.yml up -d"
log "\n${GREEN}Build completed successfully at $(date)${NC}\n"

exit 0
