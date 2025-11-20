#!/bin/bash
# Security Audit Script for IAC Dharma
# Performs comprehensive security checks across the platform

echo "=================================="
echo "🔒 IAC Dharma Security Audit"
echo "=================================="
echo ""
echo "Date: $(date)"
echo "System: $(uname -a)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES_FOUND=0

echo "=================================="
echo "1. JWT Secret Configuration"
echo "=================================="

# Check for hardcoded JWT secrets
echo -n "Checking for hardcoded JWT secrets... "
HARDCODED_SECRETS=$(grep -r "change_me_in_production" backend/ 2>/dev/null | wc -l)
if [ "$HARDCODED_SECRETS" -gt 0 ]; then
    echo -e "${RED}FAIL${NC} - Found $HARDCODED_SECRETS hardcoded JWT secrets"
    echo "  Files with hardcoded secrets:"
    grep -r "change_me_in_production" backend/ 2>/dev/null | head -5
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC}"
fi

# Check if JWT_SECRET is in environment
echo -n "Checking JWT_SECRET environment variable... "
if [ -z "$JWT_SECRET" ]; then
    echo -e "${YELLOW}WARNING${NC} - JWT_SECRET not set in environment"
    echo "  Recommendation: Set JWT_SECRET in production .env file"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    SECRET_LENGTH=${#JWT_SECRET}
    if [ $SECRET_LENGTH -lt 32 ]; then
        echo -e "${YELLOW}WARNING${NC} - JWT_SECRET too short ($SECRET_LENGTH chars)"
        echo "  Recommendation: Use at least 32 characters"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        echo -e "${GREEN}PASS${NC} - Secret length: $SECRET_LENGTH chars"
    fi
fi

echo ""
echo "=================================="
echo "2. SQL Injection Protection"
echo "=================================="

# Check for string concatenation in SQL queries
echo -n "Checking for SQL string concatenation... "
SQL_CONCAT=$(grep -r "query.*\+\|query.*\`" backend/**/*.ts 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$SQL_CONCAT" -gt 0 ]; then
    echo -e "${YELLOW}WARNING${NC} - Found $SQL_CONCAT potential SQL concatenations"
    echo "  Review these files manually:"
    grep -r "query.*\+\|query.*\`" backend/**/*.ts 2>/dev/null | grep -v "node_modules" | head -3
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC}"
fi

# Check for parameterized queries
echo -n "Verifying parameterized query usage... "
PARAM_QUERIES=$(grep -r "query.*\$1\|\$2\|\$3" backend/**/*.ts 2>/dev/null | grep -v "node_modules" | wc -l)
echo -e "${GREEN}FOUND${NC} $PARAM_QUERIES parameterized queries"

echo ""
echo "=================================="
echo "3. Authentication & Authorization"
echo "=================================="

# Check for missing authMiddleware
echo -n "Checking route protection... "
UNPROTECTED=$(grep -r "router\.\(get\|post\|put\|delete\)" backend/api-gateway/src/routes/**/*.ts 2>/dev/null | \
    grep -v "authMiddleware\|requirePermission\|requireRole" | \
    grep -v "node_modules" | wc -l)
if [ "$UNPROTECTED" -gt 5 ]; then
    echo -e "${YELLOW}WARNING${NC} - Found $UNPROTECTED potentially unprotected routes"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC} - Most routes appear protected"
fi

# Check for role-based access control
echo -n "Verifying RBAC implementation... "
RBAC_USAGE=$(grep -r "requirePermission\|requireRole" backend/**/*.ts 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$RBAC_USAGE" -gt 10 ]; then
    echo -e "${GREEN}PASS${NC} - Found $RBAC_USAGE RBAC checks"
else
    echo -e "${YELLOW}WARNING${NC} - Only $RBAC_USAGE RBAC checks found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "=================================="
echo "4. Input Validation"
echo "=================================="

# Check for validation libraries
echo -n "Checking for validation libraries... "
if grep -q "joi\|yup\|zod" backend/*/package.json 2>/dev/null; then
    echo -e "${GREEN}PASS${NC} - Validation library found"
else
    echo -e "${YELLOW}WARNING${NC} - No validation library detected"
    echo "  Recommendation: Add Joi, Yup, or Zod for input validation"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for req.body usage without validation
echo -n "Checking for unvalidated input... "
UNVALIDATED=$(grep -r "req\.body\." backend/api-gateway/src/routes/**/*.ts 2>/dev/null | \
    grep -v "validate\|schema\|check" | \
    grep -v "node_modules" | wc -l)
if [ "$UNVALIDATED" -gt 20 ]; then
    echo -e "${YELLOW}WARNING${NC} - Found $UNVALIDATED potential unvalidated inputs"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC}"
fi

echo ""
echo "=================================="
echo "5. XSS Protection"
echo "=================================="

# Check for helmet middleware
echo -n "Checking for Helmet middleware... "
if grep -q "helmet(\|helmet({" backend/api-gateway/src/index.ts 2>/dev/null; then
    echo -e "${GREEN}PASS${NC} - Helmet middleware configured"
    
    # Check for HSTS configuration
    if grep -q "hsts:" backend/api-gateway/src/index.ts 2>/dev/null; then
        echo "  ✅ HSTS configured"
    fi
else
    echo -e "${RED}FAIL${NC} - Helmet middleware not found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for unsafe HTML rendering
echo -n "Checking for unsafe HTML rendering... "
UNSAFE_HTML=$(grep -r "innerHTML\|dangerouslySetInnerHTML" frontend/src/**/*.tsx frontend/src/**/*.ts 2>/dev/null | \
    grep -v "node_modules" | wc -l)
if [ "$UNSAFE_HTML" -gt 0 ]; then
    echo -e "${YELLOW}WARNING${NC} - Found $UNSAFE_HTML unsafe HTML usages"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC}"
fi

echo ""
echo "=================================="
echo "6. CORS Configuration"
echo "=================================="

echo -n "Checking CORS configuration... "
if grep -q "origin:.*\*" backend/api-gateway/src/index.ts 2>/dev/null; then
    echo -e "${YELLOW}WARNING${NC} - CORS allows all origins (*)"
    echo "  Recommendation: Set specific allowed origins in production"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC} - CORS properly configured"
fi

echo ""
echo "=================================="
echo "7. Rate Limiting"
echo "=================================="

echo -n "Checking rate limiting... "
if grep -q "express-rate-limit\|rateLimit" backend/api-gateway/src/index.ts 2>/dev/null; then
    echo -e "${GREEN}PASS${NC} - Rate limiting configured"
    
    # Check rate limit values
    MAX_REQUESTS=$(grep -A5 "rateLimit" backend/api-gateway/src/index.ts 2>/dev/null | grep "max:" | head -1)
    echo "  Configuration: $MAX_REQUESTS"
else
    echo -e "${RED}FAIL${NC} - No rate limiting found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "=================================="
echo "8. Secrets Management"
echo "=================================="

# Check for hardcoded passwords
echo -n "Checking for hardcoded credentials... "
HARDCODED=$(grep -r "password.*=.*['\"]" backend/**/*.ts frontend/src/**/*.ts 2>/dev/null | \
    grep -v "node_modules\|\.spec\|\.test" | \
    grep -v "password.*process\.env\|password.*req\.\|password.*body\.\|password.*params\." | \
    wc -l)
if [ "$HARDCODED" -gt 0 ]; then
    echo -e "${RED}FAIL${NC} - Found $HARDCODED potential hardcoded passwords"
    echo "  Review these files:"
    grep -r "password.*=.*['\"]" backend/**/*.ts 2>/dev/null | \
        grep -v "node_modules\|\.spec\|\.test" | \
        grep -v "password.*process\.env\|password.*req\.\|password.*body\.\|password.*params\." | \
        head -3
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC}"
fi

# Check for .env files in version control
echo -n "Checking for .env files in git... "
if git ls-files | grep -q "\.env$" 2>/dev/null; then
    echo -e "${RED}FAIL${NC} - .env files tracked in git"
    echo "  Recommendation: Add .env to .gitignore and remove from git"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC}"
fi

echo ""
echo "=================================="
echo "9. HTTPS/TLS Configuration"
echo "=================================="

# Check for HTTPS enforcement
echo -n "Checking for HTTPS enforcement... "
if grep -q "hsts:" backend/api-gateway/src/index.ts 2>/dev/null; then
    echo -e "${GREEN}PASS${NC} - HSTS configured"
    # Show HSTS configuration
    HSTS_CONFIG=$(grep -A2 "hsts:" backend/api-gateway/src/index.ts 2>/dev/null | head -3)
    echo "  Configuration found in helmet settings"
else
    echo -e "${YELLOW}WARNING${NC} - No HSTS configuration found"
    echo "  Recommendation: Enable Helmet HSTS for production"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

echo ""
echo "=================================="
echo "10. Dependency Vulnerabilities"
echo "=================================="

echo "Checking npm audit results..."
cd backend/api-gateway 2>/dev/null
if command -v npm &> /dev/null; then
    AUDIT_OUTPUT=$(npm audit --json 2>/dev/null)
    CRITICAL=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
    HIGH=$(echo "$AUDIT_OUTPUT" | jq -r '.metadata.vulnerabilities.high // 0' 2>/dev/null || echo "0")
    
    if [ "$CRITICAL" -gt 0 ] || [ "$HIGH" -gt 0 ]; then
        echo -e "${RED}FAIL${NC} - Found $CRITICAL critical and $HIGH high vulnerabilities"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        echo -e "${GREEN}PASS${NC} - No critical or high vulnerabilities"
    fi
else
    echo -e "${YELLOW}SKIP${NC} - npm not available"
fi
cd - > /dev/null 2>&1

echo ""
echo "=================================="
echo "11. Logging & Monitoring"
echo "=================================="

# Check for logger usage
echo -n "Checking for proper logging... "
LOGGER_USAGE=$(grep -r "logger\.\(info\|warn\|error\|debug\)" backend/**/*.ts 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$LOGGER_USAGE" -gt 50 ]; then
    echo -e "${GREEN}PASS${NC} - Found $LOGGER_USAGE log statements"
else
    echo -e "${YELLOW}WARNING${NC} - Only $LOGGER_USAGE log statements"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for sensitive data logging
echo -n "Checking for sensitive data in logs... "
SENSITIVE_LOGS=$(grep -r "logger.*password\|logger.*token\|logger.*secret" backend/**/*.ts 2>/dev/null | \
    grep -v "node_modules" | wc -l)
if [ "$SENSITIVE_LOGS" -gt 0 ]; then
    echo -e "${RED}FAIL${NC} - Found $SENSITIVE_LOGS potential sensitive data logs"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}PASS${NC}"
fi

echo ""
echo "=================================="
echo "12. Error Handling"
echo "=================================="

# Check for error middleware
echo -n "Checking for error handling middleware... "
if grep -q "errorHandler" backend/api-gateway/src/index.ts 2>/dev/null; then
    echo -e "${GREEN}PASS${NC} - Error handler configured"
else
    echo -e "${YELLOW}WARNING${NC} - No centralized error handler"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for try-catch blocks
echo -n "Checking error handling coverage... "
TRY_CATCH=$(grep -r "try {" backend/api-gateway/src/routes/**/*.ts 2>/dev/null | wc -l)
ROUTES=$(find backend/api-gateway/src/routes -name "*.ts" 2>/dev/null | wc -l)
if [ "$ROUTES" -gt 0 ]; then
    COVERAGE=$(( (TRY_CATCH * 100) / ROUTES ))
    if [ "$COVERAGE" -gt 70 ]; then
        echo -e "${GREEN}PASS${NC} - $COVERAGE% of route files have error handling"
    else
        echo -e "${YELLOW}WARNING${NC} - Only $COVERAGE% error handling coverage"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    fi
else
    echo -e "${YELLOW}SKIP${NC} - No route files found"
fi

echo ""
echo "=================================="
echo "📊 Security Audit Summary"
echo "=================================="
echo ""

if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ Security Audit PASSED${NC}"
    echo "No critical security issues found!"
    exit 0
elif [ $ISSUES_FOUND -le 5 ]; then
    echo -e "${YELLOW}⚠️  Security Audit: WARNINGS${NC}"
    echo "Found $ISSUES_FOUND security warnings that should be addressed"
    exit 0
else
    echo -e "${RED}❌ Security Audit: ISSUES FOUND${NC}"
    echo "Found $ISSUES_FOUND security issues that need attention"
    exit 1
fi
