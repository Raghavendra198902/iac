#!/bin/bash
# Simplified Environment Validation Script

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENVIRONMENT=${1:-development}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/environments/${ENVIRONMENT}.env"

if [[ ! -f "$ENV_FILE" ]]; then
    echo -e "${RED}Error: Environment file not found: ${ENV_FILE}${NC}"
    exit 1
fi

echo "Validating ${ENVIRONMENT} environment..."
echo ""

ERRORS=0
WARNINGS=0

# Check for placeholders
if grep -q '\${' "$ENV_FILE"; then
    echo -e "${YELLOW}⚠️  Placeholders found - replace with actual values${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ No placeholders${NC}"
fi

# Check for weak passwords
if [[ "$ENVIRONMENT" != "development" ]] && grep -q "change_me" "$ENV_FILE"; then
    echo -e "${RED}✗ Weak passwords found${NC}"
    ((ERRORS++))
elif grep -q "change_me" "$ENV_FILE"; then
    echo -e "${YELLOW}⚠️  Default passwords (OK for development)${NC}"
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ No weak passwords${NC}"
fi

# Check required variables
MISSING=0
for var in NODE_ENV ENVIRONMENT DATABASE_HOST REDIS_HOST; do
    if ! grep -q "^${var}=" "$ENV_FILE"; then
        echo -e "${RED}✗ Missing: ${var}${NC}"
        ((MISSING++))
    fi
done

if [[ $MISSING -eq 0 ]]; then
    echo -e "${GREEN}✓ Required variables present${NC}"
else
    ((ERRORS+=MISSING))
fi

# Production checks
if [[ "$ENVIRONMENT" == "production" ]]; then
    if grep -q "^DEBUG=true" "$ENV_FILE"; then
        echo -e "${RED}✗ DEBUG enabled in production${NC}"
        ((ERRORS++))
    else
        echo -e "${GREEN}✓ Production security OK${NC}"
    fi
fi

echo ""
echo "Summary: ${ERRORS} errors, ${WARNINGS} warnings"

if [[ $ERRORS -gt 0 ]]; then
    echo -e "${RED}✗ Validation failed${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Validation passed${NC}"
    exit 0
fi
