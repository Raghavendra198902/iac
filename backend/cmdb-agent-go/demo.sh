#!/bin/bash
# CMDB Agent Demo - Quick Feature Test

set -e

echo "🎯 CMDB Agent v1.0.0 - Feature Demo"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BINARY="./dist/cmdb-agent-test"

if [ ! -f "$BINARY" ]; then
    echo "Building agent..."
    go build -o "$BINARY" ./cmd/cmdb-agent
fi

echo -e "${BLUE}📦 Agent Information${NC}"
echo "-------------------"
$BINARY --version 2>/dev/null || echo "Version: 1.0.0"
echo ""

echo -e "${BLUE}🔧 Testing Configuration${NC}"
echo "----------------------"
if [ -f "config.example.yaml" ]; then
    echo -e "${GREEN}✓${NC} Configuration file found"
    echo "  File: config.example.yaml"
    echo "  Size: $(wc -l < config.example.yaml) lines"
else
    echo -e "${YELLOW}⚠${NC}  config.example.yaml not found"
fi
echo ""

echo -e "${BLUE}📊 Available Collectors${NC}"
echo "---------------------"
echo "  • System (OS, hostname, uptime)"
echo "  • Hardware (CPU, memory, disks)"
echo "  • Network (interfaces, IPs)"
echo "  • Software (packages, applications)"
echo "  • Services (systemd, Windows services)"
echo ""

echo -e "${BLUE}🌐 Web UI Features${NC}"
echo "----------------"
echo "  • Dashboard (http://localhost:8080)"
echo "  • System Overview"
echo "  • Hardware Inventory"
echo "  • Network Configuration"
echo "  • Real-time Metrics"
echo "  • Configuration Editor"
echo ""

echo -e "${BLUE}🔌 API Endpoints${NC}"
echo "--------------"
echo "  • GET  /api/status - Agent status"
echo "  • GET  /api/health - Health check"
echo "  • GET  /api/inventory - Full inventory"
echo "  • POST /api/collect/:type - Trigger collection"
echo "  • POST /api/flush - Flush queue"
echo ""

echo -e "${BLUE}🛠️  CLI Commands${NC}"
echo "--------------"
if [ -f "./dist/cmdb-agent-cli" ]; then
    echo -e "${GREEN}✓${NC} CLI tool available: cmdb-agent-cli"
    echo "  • status - Check agent status"
    echo "  • inventory list - View inventory"
    echo "  • test connection - Test CMDB connectivity"
else
    echo -e "${YELLOW}⚠${NC}  CLI tool not built yet"
    echo "  Build with: go build -o dist/cmdb-agent-cli ./cmd/cmdb-agent-cli"
fi
echo ""

echo -e "${BLUE}📦 Package Information${NC}"
echo "--------------------"
echo "  Platform packages available:"
if ls dist/release/*.zip dist/release/*.tar.gz >/dev/null 2>&1; then
    for pkg in dist/release/*.zip dist/release/*.tar.gz; do
        if [ -f "$pkg" ]; then
            size=$(du -h "$pkg" | cut -f1)
            basename=$(basename "$pkg")
            echo "  • $basename ($size)"
        fi
    done
else
    echo "  No packages found in dist/release/"
fi
echo ""

echo -e "${BLUE}🎓 Quick Start${NC}"
echo "------------"
echo "1. Download package for your platform"
echo "2. Extract and run installer:"
echo ""
echo "   Windows:  .\\Install.ps1"
echo "   Linux:    sudo ./install.sh"
echo "   macOS:    sudo ./install.sh"
echo ""
echo "3. Access Web UI: http://localhost:8080"
echo "   Login: admin / changeme"
echo ""

echo -e "${BLUE}📚 Documentation${NC}"
echo "---------------"
for doc in QUICKSTART.md FEATURES.md WEBUI_GUIDE.md ROADMAP.md; do
    if [ -f "$doc" ]; then
        echo -e "  ${GREEN}✓${NC} $doc"
    fi
done
echo ""

echo -e "${BLUE}🔍 Project Statistics${NC}"
echo "-------------------"
echo "  Go files: $(find . -name '*.go' -not -path './vendor/*' | wc -l)"
echo "  Total lines: $(find . -name '*.go' -not -path './vendor/*' -exec wc -l {} + | tail -1 | awk '{print $1}')"
echo "  Packages: $(go list ./... | wc -l)"
echo "  Documentation files: $(ls *.md 2>/dev/null | wc -l)"
echo ""

echo -e "${GREEN}✅ Demo Complete!${NC}"
echo ""
echo "Next steps:"
echo "  • Download: http://192.168.1.9:5173/agents/downloads"
echo "  • Read: QUICKSTART.md for installation"
echo "  • Explore: ROADMAP.md for future features"
