#!/bin/bash

# CI/CD Setup Verification Script
# Version: 1.0.0
# Purpose: Verify GitHub Actions workflows and secrets are properly configured

# Note: Don't use set -e, we want to continue on errors
set +e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     IAC Dharma CI/CD Setup Verification           ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo ""

# Function to print status
print_status() {
    local status=$1
    local message=$2
    
    if [ "$status" = "pass" ]; then
        echo -e "${GREEN}✓${NC} $message"
        ((PASSED++))
    elif [ "$status" = "fail" ]; then
        echo -e "${RED}✗${NC} $message"
        ((FAILED++))
    elif [ "$status" = "warn" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
        ((WARNINGS++))
    else
        echo -e "${BLUE}ℹ${NC} $message"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check file exists
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$file" ]; then
        print_status "pass" "$description exists: $file"
        return 0
    else
        print_status "fail" "$description not found: $file"
        return 1
    fi
}

# Function to validate YAML syntax
validate_yaml() {
    local file=$1
    
    if command_exists yamllint; then
        if yamllint -d relaxed "$file" >/dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    elif command_exists python3; then
        if python3 -c "import yaml; yaml.safe_load(open('$file'))" >/dev/null 2>&1; then
            return 0
        else
            return 1
        fi
    else
        # No YAML validator available, skip
        return 0
    fi
}

echo -e "${BLUE}[1/8] Checking Prerequisites${NC}"
echo "─────────────────────────────────────────────────"

# Check Git
if command_exists git; then
    print_status "pass" "Git is installed"
else
    print_status "fail" "Git is not installed"
fi

# Check GitHub CLI
if command_exists gh; then
    print_status "pass" "GitHub CLI (gh) is installed"
    
    # Check if authenticated
    if gh auth status >/dev/null 2>&1; then
        print_status "pass" "GitHub CLI is authenticated"
    else
        print_status "warn" "GitHub CLI is not authenticated (run: gh auth login)"
    fi
else
    print_status "warn" "GitHub CLI not installed (optional, but recommended)"
fi

# Check Docker
if command_exists docker; then
    print_status "pass" "Docker is installed"
    
    if docker info >/dev/null 2>&1; then
        print_status "pass" "Docker daemon is running"
    else
        print_status "fail" "Docker daemon is not running"
    fi
else
    print_status "fail" "Docker is not installed"
fi

# Check kubectl
if command_exists kubectl; then
    print_status "pass" "kubectl is installed"
else
    print_status "warn" "kubectl not installed (needed for Task 14+)"
fi

echo ""
echo -e "${BLUE}[2/8] Checking Workflow Files${NC}"
echo "─────────────────────────────────────────────────"

WORKFLOW_DIR=".github/workflows"

# Check workflow directory exists
if [ -d "$WORKFLOW_DIR" ]; then
    print_status "pass" "Workflow directory exists"
else
    print_status "fail" "Workflow directory not found: $WORKFLOW_DIR"
fi

# Check individual workflow files
check_file "$WORKFLOW_DIR/ci.yml" "CI workflow"
check_file "$WORKFLOW_DIR/cd.yml" "CD workflow"
check_file "$WORKFLOW_DIR/docker-build.yml" "Docker build workflow"

echo ""
echo -e "${BLUE}[3/8] Validating Workflow Syntax${NC}"
echo "─────────────────────────────────────────────────"

for workflow in "$WORKFLOW_DIR"/*.yml; do
    if [ -f "$workflow" ]; then
        workflow_name=$(basename "$workflow")
        
        if validate_yaml "$workflow"; then
            print_status "pass" "Valid YAML syntax: $workflow_name"
        else
            print_status "fail" "Invalid YAML syntax: $workflow_name"
        fi
        
        # Check for required fields
        if grep -q "^name:" "$workflow" && \
           grep -q "^on:" "$workflow" && \
           grep -q "^jobs:" "$workflow"; then
            print_status "pass" "Required fields present: $workflow_name"
        else
            print_status "fail" "Missing required fields: $workflow_name"
        fi
    fi
done

echo ""
echo -e "${BLUE}[4/8] Checking Documentation${NC}"
echo "─────────────────────────────────────────────────"

check_file "docs/CI_CD_GUIDE.md" "CI/CD Guide"
check_file "docs/GITHUB_SECRETS_SETUP.md" "Secrets Setup Guide"
check_file "docs/PHASE_6_PLAN.md" "Phase 6 Plan"

echo ""
echo -e "${BLUE}[5/8] Checking GitHub Secrets (if gh CLI available)${NC}"
echo "─────────────────────────────────────────────────"

if command_exists gh && gh auth status >/dev/null 2>&1; then
    # Check if we're in a git repository with remote
    if git remote get-url origin >/dev/null 2>&1; then
        
        # List of expected secrets
        REQUIRED_SECRETS_NOW=("SNYK_TOKEN" "SLACK_WEBHOOK")
        REQUIRED_SECRETS_LATER=("KUBE_CONFIG_DEV" "KUBE_CONFIG_STAGING" "KUBE_CONFIG_PROD")
        
        echo "Checking immediate required secrets:"
        for secret in "${REQUIRED_SECRETS_NOW[@]}"; do
            if gh secret list | grep -q "^$secret"; then
                print_status "pass" "Secret configured: $secret"
            else
                print_status "warn" "Secret not configured: $secret (configure before using CI/CD)"
            fi
        done
        
        echo ""
        echo "Checking secrets needed after Kubernetes setup:"
        for secret in "${REQUIRED_SECRETS_LATER[@]}"; do
            if gh secret list | grep -q "^$secret"; then
                print_status "pass" "Secret configured: $secret"
            else
                print_status "info" "Secret not configured: $secret (needed for Task 14+)"
            fi
        done
        
    else
        print_status "warn" "Not in a git repository with remote, skipping secret check"
    fi
else
    print_status "info" "Skipping secret check (gh CLI not available or not authenticated)"
fi

echo ""
echo -e "${BLUE}[6/8] Checking Docker Services${NC}"
echo "─────────────────────────────────────────────────"

# Check docker-compose file
if [ -f "docker-compose.yml" ]; then
    print_status "pass" "docker-compose.yml exists"
    
    if command_exists docker-compose || docker compose version >/dev/null 2>&1; then
        print_status "pass" "Docker Compose is available"
        
        # Validate docker-compose syntax (try both commands)
        if docker-compose config >/dev/null 2>&1 || docker compose config >/dev/null 2>&1; then
            print_status "pass" "docker-compose.yml syntax is valid"
        else
            print_status "fail" "docker-compose.yml has syntax errors"
        fi
    else
        print_status "warn" "Docker Compose not available"
    fi
else
    print_status "fail" "docker-compose.yml not found"
fi

# Count services
if [ -f "docker-compose.yml" ]; then
    SERVICE_COUNT=$(grep -c "^  [a-z].*:$" docker-compose.yml || echo "0")
    if [ "$SERVICE_COUNT" -ge 9 ]; then
        print_status "pass" "Expected service count: $SERVICE_COUNT services"
    else
        print_status "warn" "Service count: $SERVICE_COUNT (expected 9+)"
    fi
fi

echo ""
echo -e "${BLUE}[7/8] Checking Service Dockerfiles${NC}"
echo "─────────────────────────────────────────────────"

BACKEND_SERVICES=(
    "api-gateway"
    "blueprint-service"
    "iac-generator"
    "guardrails-engine"
    "costing-service"
    "orchestrator-service"
    "automation-engine"
    "monitoring-service"
    "ai-engine"
)

for service in "${BACKEND_SERVICES[@]}"; do
    if [ -f "backend/$service/Dockerfile" ]; then
        print_status "pass" "Dockerfile exists: $service"
    else
        print_status "fail" "Dockerfile missing: $service"
    fi
done

# Check frontend
if [ -f "frontend/Dockerfile.prod" ]; then
    print_status "pass" "Dockerfile exists: frontend (production)"
else
    print_status "warn" "Dockerfile missing: frontend/Dockerfile.prod"
fi

echo ""
echo -e "${BLUE}[8/8] Checking GitHub Repository Configuration${NC}"
echo "─────────────────────────────────────────────────"

if command_exists gh && gh auth status >/dev/null 2>&1; then
    # Check if repository has Actions enabled
    if gh api repos/{owner}/{repo}/actions/permissions >/dev/null 2>&1; then
        print_status "pass" "GitHub Actions is enabled"
    else
        print_status "warn" "Could not verify GitHub Actions status"
    fi
    
    # Check branch protection (if on main/develop)
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "develop" ]; then
        print_status "info" "On protected branch: $CURRENT_BRANCH"
        print_status "info" "Consider enabling branch protection rules"
    fi
else
    print_status "info" "Skipping repository configuration check (gh CLI not available)"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    Summary                          ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Passed:   $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed:   $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ CI/CD setup verification completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Configure GitHub Secrets (see docs/GITHUB_SECRETS_SETUP.md)"
    echo "2. Test CI workflow by creating a pull request"
    echo "3. Proceed to Task 14: Kubernetes setup"
    exit 0
else
    echo -e "${RED}✗ CI/CD setup has issues that need to be addressed${NC}"
    echo ""
    echo "Please fix the failed checks before proceeding."
    exit 1
fi
