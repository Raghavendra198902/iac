#!/bin/bash

# IAC Dharma - npm Publishing Script
# This script helps publish the package to npm

set -e  # Exit on error

echo "🌸 IAC Dharma - npm Publishing Assistant"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo "Please install npm first: sudo apt install npm"
    exit 1
fi

echo -e "${GREEN}✅ npm is installed (version $(npm --version))${NC}"
echo ""

# Check if logged in
echo "Checking npm login status..."
if npm whoami &> /dev/null; then
    USERNAME=$(npm whoami)
    echo -e "${GREEN}✅ Logged in as: $USERNAME${NC}"
else
    echo -e "${YELLOW}⚠️  Not logged in to npm${NC}"
    echo ""
    echo "Please login to npm:"
    echo -e "${BLUE}  npm login${NC}"
    echo ""
    echo "You'll need:"
    echo "  - npm username"
    echo "  - npm password"
    echo "  - email address"
    echo "  - OTP (if 2FA enabled)"
    echo ""
    echo "Don't have an account? Sign up at:"
    echo -e "${BLUE}  https://www.npmjs.com/signup${NC}"
    echo ""
    exit 1
fi

# Show package info
echo ""
echo "📦 Package Information:"
echo "----------------------"
npm pack --dry-run 2>&1 | grep -E "^npm notice (name|version|package size|unpacked size)" || true
echo ""

# Verify package contents
echo "📋 Package Contents:"
echo "-------------------"
npm pack --dry-run 2>&1 | grep -E "^\w+\s+\w+" | grep -v "npm notice ===" | tail -n +2 | head -20
echo ""

# Confirm publication
echo -e "${YELLOW}⚠️  Ready to publish to npm registry${NC}"
echo ""
read -p "Do you want to proceed with publishing? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo -e "${RED}❌ Publishing cancelled${NC}"
    exit 0
fi

# Publish the package
echo ""
echo "🚀 Publishing package..."
echo ""

if npm publish --access public; then
    echo ""
    echo -e "${GREEN}✅ Successfully published!${NC}"
    echo ""
    echo "🎉 Your package is now available at:"
    echo -e "${BLUE}   https://www.npmjs.com/package/@raghavendra198902/iac-dharma${NC}"
    echo ""
    echo "Users can install it with:"
    echo -e "${BLUE}   npm install -g @raghavendra198902/iac-dharma${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Test installation: npm install -g @raghavendra198902/iac-dharma"
    echo "  2. Test CLI: iac-dharma info"
    echo "  3. Update README with npm badge"
    echo "  4. Announce on GitHub and social media"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Publishing failed${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Package name already taken (use different name or scope)"
    echo "  - Not logged in (run: npm login)"
    echo "  - No permission for scope (check organization access)"
    echo "  - Network issues (check internet connection)"
    echo ""
    echo "For more help, see: NPM_PUBLISHING_GUIDE.md"
    exit 1
fi
