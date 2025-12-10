#!/bin/bash

###############################################################################
# Fix TypeScript Type Definition Errors
# 
# This script installs missing type definition packages to resolve IDE
# TypeScript errors. These errors do NOT affect runtime but improve
# development experience.
#
# Run this script after npm/yarn is available in your environment.
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║        🔧 FIXING TYPESCRIPT TYPE DEFINITION ERRORS                  ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ ERROR: npm is not installed or not in PATH"
    echo ""
    echo "Please install Node.js and npm first:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  MacOS: brew install node"
    echo "  Windows: Download from https://nodejs.org/"
    echo ""
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Function to install dependencies in a directory
install_deps() {
    local dir=$1
    local description=$2
    
    if [ -d "$dir" ]; then
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "📦 Installing: $description"
        echo "   Directory: $dir"
        echo ""
        
        cd "$dir"
        
        if [ -f "package.json" ]; then
            npm install
            echo "✅ Completed: $description"
        else
            echo "⚠️  Skipped: No package.json found"
        fi
        echo ""
    else
        echo "⚠️  Directory not found: $dir"
        echo ""
    fi
}

# 1. Fix Frontend Testing Libraries
echo "1️⃣  FRONTEND E2E TESTING LIBRARIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installing @testing-library packages and vitest types..."
echo ""

cd "$PROJECT_ROOT/frontend-e2e"
if [ -f "package.json" ]; then
    npm install --save-dev \
        @testing-library/react@latest \
        @testing-library/dom@latest \
        @testing-library/user-event@latest \
        @testing-library/jest-dom@latest \
        vitest@latest \
        @vitest/ui@latest
    echo "✅ Frontend E2E test dependencies installed"
else
    echo "⚠️  No package.json found in frontend-e2e/"
fi
echo ""

# 2. Fix Frontend Type Definitions
echo "2️⃣  FRONTEND TYPE DEFINITIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installing Vite and Node type definitions..."
echo ""

cd "$PROJECT_ROOT/frontend"
if [ -f "package.json" ]; then
    npm install --save-dev \
        @types/node@latest \
        vite@latest
    echo "✅ Frontend type definitions installed"
else
    echo "⚠️  No package.json found in frontend/"
fi
echo ""

# 3. Fix Backend Services
echo "3️⃣  BACKEND SERVICE DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Installing backend service dependencies..."
echo ""

# Install advanced-rbac-service dependencies
install_deps "$PROJECT_ROOT/backend/advanced-rbac-service" "Advanced RBAC Service"

# Install api-gateway dependencies (if needed)
install_deps "$PROJECT_ROOT/backend/api-gateway" "API Gateway"

# Install other backend services that might need dependencies
for service_dir in "$PROJECT_ROOT"/backend/*/; do
    service_name=$(basename "$service_dir")
    if [ -f "$service_dir/package.json" ]; then
        if [ ! -d "$service_dir/node_modules" ]; then
            install_deps "$service_dir" "$service_name"
        fi
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║        ✅ TYPE DEFINITION FIXES COMPLETE                            ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 All type definition packages installed successfully!"
echo ""
echo "Next steps:"
echo "  1. Restart your IDE/editor to pick up new types"
echo "  2. Run TypeScript checks: npm run typecheck (if available)"
echo "  3. Verify no errors in IDE"
echo ""
echo "Note: These fixes improve IDE experience but do not affect runtime."
echo ""
