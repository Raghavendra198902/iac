#!/bin/bash
# Environment Switching Script
# Switches between development, staging, and production configurations

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ENVIRONMENT=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CURRENT_ENV_FILE="$PROJECT_ROOT/.env"

usage() {
    echo "Usage: $0 <environment>"
    echo ""
    echo "Environments:"
    echo "  development  - Local development environment"
    echo "  staging      - Staging environment"
    echo "  production   - Production environment"
    echo ""
    echo "Examples:"
    echo "  $0 development"
    echo "  $0 production"
    exit 1
}

if [[ -z "$1" ]]; then
    usage
fi

ENVIRONMENT=$1

if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo -e "${RED}Error: Invalid environment${NC}"
    usage
fi

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   IAC Dharma Environment Switcher     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Backup current .env if it exists
if [[ -f "$CURRENT_ENV_FILE" ]]; then
    backup_file="${CURRENT_ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}Backing up current .env to: ${backup_file}${NC}"
    cp "$CURRENT_ENV_FILE" "$backup_file"
fi

# Copy environment-specific configuration
ENV_FILE="$SCRIPT_DIR/environments/${ENVIRONMENT}.env"

if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}Error: Environment file not found: ${ENV_FILE}${NC}"
    exit 1
fi

echo -e "${YELLOW}Switching to ${ENVIRONMENT} environment...${NC}"
cp "$ENV_FILE" "$CURRENT_ENV_FILE"

echo -e "${GREEN}✓ Environment configuration updated${NC}"
echo ""

# Display environment info
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Configuration loaded from: ${ENV_FILE}${NC}"
echo ""

# Show critical settings
echo -e "${YELLOW}Key Settings:${NC}"
grep -E "^(NODE_ENV|ENVIRONMENT|DATABASE_HOST|REDIS_HOST|LOG_LEVEL)" "$CURRENT_ENV_FILE" || true
echo ""

# Warnings for production
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo -e "${RED}⚠️  WARNING: Production environment selected${NC}"
    echo -e "${RED}   - Ensure all secrets are properly configured${NC}"
    echo -e "${RED}   - Verify database connections${NC}"
    echo -e "${RED}   - Check SSL/TLS certificates${NC}"
    echo ""
    read -p "Continue? (yes/no): " confirm
    if [[ "$confirm" != "yes" ]]; then
        echo "Cancelled"
        exit 0
    fi
fi

# Check for placeholder values
echo -e "${YELLOW}Checking for placeholder values...${NC}"
placeholders=$(grep -E '\${[A-Z_]+}' "$CURRENT_ENV_FILE" || true)

if [[ -n "$placeholders" ]]; then
    echo -e "${RED}⚠️  Found placeholder values that need to be replaced:${NC}"
    echo "$placeholders"
    echo ""
    echo -e "${YELLOW}Action required: Replace placeholders with actual values${NC}"
    echo "Secrets should be fetched from AWS Secrets Manager:"
    echo "  ./config/secrets/manage-secrets.sh -e $ENVIRONMENT -a get -n <SECRET_NAME>"
fi

echo ""
echo -e "${GREEN}✓ Environment switch complete${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Review .env file and replace any placeholder values"
echo "  2. Restart application services"
echo "  3. Verify connections and health checks"
echo ""

if [[ "$ENVIRONMENT" == "development" ]]; then
    echo "  docker-compose down && docker-compose up -d"
elif [[ "$ENVIRONMENT" == "staging" ]] || [[ "$ENVIRONMENT" == "production" ]]; then
    echo "  kubectl rollout restart deployment -n dharma"
    echo "  kubectl get pods -n dharma -w"
fi
