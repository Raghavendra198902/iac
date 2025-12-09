#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
# Environment Configuration Validator
# ═══════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}IAC DHARMA v3.0 - Environment Configuration Validator${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}✗ CRITICAL: .env file not found at $ENV_FILE${NC}"
    echo -e "${YELLOW}  → Copy .env.example to .env and configure it:${NC}"
    echo -e "${YELLOW}     cp .env.example .env${NC}"
    exit 1
fi

echo -e "${GREEN}✓ .env file found${NC}"
echo ""

# Load .env file
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Function to check required variable
check_required() {
    local var_name="$1"
    local var_value="${!var_name}"
    local min_length="${2:-1}"
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}✗ REQUIRED: $var_name is not set${NC}"
        ((ERRORS++))
        return 1
    elif [ ${#var_value} -lt $min_length ]; then
        echo -e "${RED}✗ INVALID: $var_name is too short (minimum $min_length characters)${NC}"
        ((ERRORS++))
        return 1
    else
        echo -e "${GREEN}✓ $var_name is configured${NC}"
        return 0
    fi
}

# Function to check optional variable
check_optional() {
    local var_name="$1"
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo -e "${YELLOW}⚠ OPTIONAL: $var_name is not set${NC}"
        ((WARNINGS++))
        return 1
    else
        echo -e "${GREEN}✓ $var_name is configured${NC}"
        return 0
    fi
}

# Function to check password strength
check_password_strength() {
    local var_name="$1"
    local var_value="${!var_name}"
    local min_length="${2:-32}"
    
    if [ -z "$var_value" ]; then
        echo -e "${RED}✗ REQUIRED: $var_name is not set${NC}"
        ((ERRORS++))
        return 1
    fi
    
    if [ ${#var_value} -lt $min_length ]; then
        echo -e "${RED}✗ WEAK: $var_name is too short (minimum $min_length characters)${NC}"
        echo -e "${YELLOW}  → Generate strong password: openssl rand -hex 32${NC}"
        ((ERRORS++))
        return 1
    fi
    
    echo -e "${GREEN}✓ $var_name is configured (${#var_value} characters)${NC}"
    return 0
}

echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}CRITICAL SECURITY CREDENTIALS${NC}"
echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"

check_password_strength "POSTGRES_PASSWORD" 32
check_password_strength "NEO4J_PASSWORD" 32
check_password_strength "JWT_SECRET" 64
check_password_strength "SESSION_SECRET" 32

echo ""
echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}DATABASE CONFIGURATION${NC}"
echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"

check_required "DB_HOST"
check_required "DB_PORT"
check_required "DB_NAME"
check_required "DB_USER"

echo ""
echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}SERVICE PORTS${NC}"
echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"

check_required "API_GATEWAY_PORT"
check_required "BLUEPRINT_SERVICE_PORT"
check_required "IAC_GENERATOR_PORT"
check_required "MONITORING_SERVICE_PORT"
check_required "ORCHESTRATOR_SERVICE_PORT"

echo ""
echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"
echo -e "${BLUE}OPTIONAL FEATURES${NC}"
echo -e "${BLUE}─────────────────────────────────────────────────────────────────────${NC}"

check_optional "GRAFANA_ADMIN_PASSWORD"
check_optional "SMTP_USER"
check_optional "AWS_ACCESS_KEY_ID"
check_optional "AZURE_SUBSCRIPTION_ID"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}VALIDATION SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All required configurations are valid${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ $WARNINGS optional configuration(s) not set${NC}"
        echo -e "${YELLOW}  Some features may be unavailable${NC}"
    fi
    echo ""
    echo -e "${GREEN}🚀 Ready to start IAC Dharma v3.0!${NC}"
    echo ""
    echo -e "${BLUE}Start platform:${NC}"
    echo -e "  docker-compose -f docker-compose.v3.yml up -d"
    echo ""
    exit 0
else
    echo -e "${RED}✗ $ERRORS critical error(s) found${NC}"
    echo -e "${RED}  Fix the errors above before starting the platform${NC}"
    echo ""
    echo -e "${YELLOW}Quick fixes:${NC}"
    echo -e "  # Generate secure passwords"
    echo -e "  echo \"POSTGRES_PASSWORD=\$(openssl rand -hex 32)\" >> .env"
    echo -e "  echo \"NEO4J_PASSWORD=\$(openssl rand -hex 32)\" >> .env"
    echo -e "  echo \"JWT_SECRET=\$(openssl rand -base64 64)\" >> .env"
    echo -e "  echo \"SESSION_SECRET=\$(openssl rand -hex 32)\" >> .env"
    echo ""
    exit 1
fi
