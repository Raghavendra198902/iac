#!/bin/bash

# ═══════════════════════════════════════════════════════════════
# IAC Dharma - Production Deployment Script
# ═══════════════════════════════════════════════════════════════
# This script handles production deployment with security checks,
# health validation, and rollback capabilities.
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deployment-$(date +%Y%m%d-%H%M%S).log"
HEALTHCHECK_RETRIES=30
HEALTHCHECK_INTERVAL=10

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"
mkdir -p "$BACKUP_DIR"

# ═══════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════

log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $*" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $*" | tee -a "$LOG_FILE"
}

# ═══════════════════════════════════════════════════════════════
# PREFLIGHT CHECKS
# ═══════════════════════════════════════════════════════════════

preflight_checks() {
    log "Running preflight checks..."

    # Check if running as root
    if [ "$EUID" -eq 0 ]; then
        log_warning "Running as root. Consider using a dedicated user."
    fi

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    log_success "Docker found: $(docker --version)"

    # Check Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    log_success "Docker Compose found: $(docker compose version)"

    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Environment file not found: $ENV_FILE"
        log "Please create $ENV_FILE from .env.production template"
        exit 1
    fi
    log_success "Environment file found"

    # Check for required secrets
    local required_secrets=(
        "JWT_SECRET"
        "DB_PASSWORD"
        "REDIS_PASSWORD"
    )

    for secret in "${required_secrets[@]}"; do
        if grep -q "CHANGE_THIS" "$ENV_FILE" | grep "$secret"; then
            log_error "Secret not configured: $secret"
            log "Please update $ENV_FILE with production values"
            exit 1
        fi
    done
    log_success "Required secrets configured"

    # Check disk space (require at least 10GB free)
    local free_space=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$free_space" -lt 10 ]; then
        log_error "Insufficient disk space: ${free_space}GB (minimum 10GB required)"
        exit 1
    fi
    log_success "Disk space check passed: ${free_space}GB available"

    # Check memory (require at least 8GB)
    local total_mem=$(free -g | awk 'NR==2 {print $2}')
    if [ "$total_mem" -lt 8 ]; then
        log_warning "Low memory: ${total_mem}GB (recommended 16GB+)"
    else
        log_success "Memory check passed: ${total_mem}GB available"
    fi

    log_success "All preflight checks passed"
}

# ═══════════════════════════════════════════════════════════════
# BACKUP
# ═══════════════════════════════════════════════════════════════

backup_database() {
    log "Creating database backup..."

    local backup_file="$BACKUP_DIR/postgres-$(date +%Y%m%d-%H%M%S).sql"

    if docker compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        docker compose -f "$COMPOSE_FILE" exec -T postgres pg_dumpall -U dharma_prod > "$backup_file" 2>> "$LOG_FILE"
        
        if [ -f "$backup_file" ] && [ -s "$backup_file" ]; then
            log_success "Database backup created: $backup_file"
            
            # Compress backup
            gzip "$backup_file"
            log_success "Backup compressed: ${backup_file}.gz"
            
            # Clean old backups (keep last 7 days)
            find "$BACKUP_DIR" -name "postgres-*.sql.gz" -mtime +7 -delete
        else
            log_error "Database backup failed"
            return 1
        fi
    else
        log_warning "Database not running, skipping backup"
    fi
}

# ═══════════════════════════════════════════════════════════════
# BUILD
# ═══════════════════════════════════════════════════════════════

build_images() {
    log "Building production images..."

    # Pull base images
    log "Pulling base images..."
    docker compose -f "$COMPOSE_FILE" pull postgres redis

    # Build custom images
    log "Building application images..."
    
    # Frontend
    docker build \
        -f frontend/Dockerfile.prod \
        -t iac-dharma/frontend:latest \
        --build-arg VITE_API_URL="${VITE_API_URL:-https://api.iacdharma.com}" \
        ./frontend 2>&1 | tee -a "$LOG_FILE"
    
    # Backend
    docker build \
        -f backend/api-gateway/Dockerfile.prod \
        -t iac-dharma/api-gateway:latest \
        ./backend/api-gateway 2>&1 | tee -a "$LOG_FILE"
    
    log_success "Images built successfully"
}

# ═══════════════════════════════════════════════════════════════
# DEPLOYMENT
# ═══════════════════════════════════════════════════════════════

deploy() {
    log "Starting production deployment..."

    # Start services
    docker compose -f "$COMPOSE_FILE" up -d 2>&1 | tee -a "$LOG_FILE"

    log_success "Services started"
}

# ═══════════════════════════════════════════════════════════════
# HEALTH CHECKS
# ═══════════════════════════════════════════════════════════════

wait_for_service() {
    local service=$1
    local url=$2
    local retries=$HEALTHCHECK_RETRIES
    local interval=$HEALTHCHECK_INTERVAL

    log "Waiting for $service to be healthy..."

    for ((i=1; i<=retries; i++)); do
        if curl -sf "$url" > /dev/null 2>&1; then
            log_success "$service is healthy"
            return 0
        fi
        
        if [ $i -lt $retries ]; then
            log "Attempt $i/$retries failed, retrying in ${interval}s..."
            sleep $interval
        fi
    done

    log_error "$service failed to become healthy"
    return 1
}

health_checks() {
    log "Running health checks..."

    # Check database
    if ! docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U dharma_prod > /dev/null 2>&1; then
        log_error "Database health check failed"
        return 1
    fi
    log_success "Database is healthy"

    # Check Redis
    if ! docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping > /dev/null 2>&1; then
        log_error "Redis health check failed"
        return 1
    fi
    log_success "Redis is healthy"

    # Check API Gateway
    if ! wait_for_service "API Gateway" "http://localhost:3001/api/health"; then
        return 1
    fi

    # Check Frontend
    if ! wait_for_service "Frontend" "http://localhost/health"; then
        return 1
    fi

    log_success "All health checks passed"
}

# ═══════════════════════════════════════════════════════════════
# SMOKE TESTS
# ═══════════════════════════════════════════════════════════════

smoke_tests() {
    log "Running smoke tests..."

    # Test API
    local api_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
    if [ "$api_response" != "200" ]; then
        log_error "API smoke test failed: HTTP $api_response"
        return 1
    fi
    log_success "API smoke test passed"

    # Test Frontend
    local frontend_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
    if [ "$frontend_response" != "200" ]; then
        log_error "Frontend smoke test failed: HTTP $frontend_response"
        return 1
    fi
    log_success "Frontend smoke test passed"

    # Test WebSocket
    if command -v wscat &> /dev/null; then
        echo "test" | timeout 5 wscat -c "ws://localhost:3001/socket.io" > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            log_success "WebSocket smoke test passed"
        else
            log_warning "WebSocket smoke test inconclusive"
        fi
    fi

    log_success "Smoke tests completed"
}

# ═══════════════════════════════════════════════════════════════
# ROLLBACK
# ═══════════════════════════════════════════════════════════════

rollback() {
    log_error "Deployment failed, initiating rollback..."

    # Stop current deployment
    docker compose -f "$COMPOSE_FILE" down 2>&1 | tee -a "$LOG_FILE"

    # Restore from backup if available
    local latest_backup=$(ls -t "$BACKUP_DIR"/postgres-*.sql.gz 2>/dev/null | head -1)
    if [ -n "$latest_backup" ]; then
        log "Restoring from backup: $latest_backup"
        gunzip -c "$latest_backup" | docker compose -f "$COMPOSE_FILE" exec -T postgres psql -U dharma_prod
        log_success "Database restored"
    fi

    log_error "Rollback completed. Please investigate the issue."
    exit 1
}

# ═══════════════════════════════════════════════════════════════
# MONITORING
# ═══════════════════════════════════════════════════════════════

show_status() {
    log "Deployment Status:"
    echo ""
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
    
    log "Service URLs:"
    echo "  Frontend:    http://localhost (or https://yourdomain.com)"
    echo "  API:         http://localhost:3001/api"
    echo "  Prometheus:  http://localhost:9091"
    echo "  Grafana:     http://localhost:3002"
    echo "  Jaeger:      http://localhost:16686"
    echo ""
    
    log "Logs:"
    echo "  Deployment:  $LOG_FILE"
    echo "  View all:    docker compose -f $COMPOSE_FILE logs -f"
}

# ═══════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════

main() {
    log "═══════════════════════════════════════════════════════════════"
    log "IAC Dharma - Production Deployment"
    log "═══════════════════════════════════════════════════════════════"
    
    # Run preflight checks
    preflight_checks || exit 1

    # Backup existing data
    backup_database || log_warning "Backup failed, continuing..."

    # Build images
    build_images || {
        log_error "Build failed"
        exit 1
    }

    # Deploy
    deploy || {
        log_error "Deployment failed"
        rollback
    }

    # Health checks
    health_checks || {
        log_error "Health checks failed"
        rollback
    }

    # Smoke tests
    smoke_tests || {
        log_warning "Smoke tests failed, but deployment continues"
    }

    # Show status
    show_status

    log_success "═══════════════════════════════════════════════════════════════"
    log_success "Deployment completed successfully!"
    log_success "═══════════════════════════════════════════════════════════════"
}

# Run main function
main "$@"
