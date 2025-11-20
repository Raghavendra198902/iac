#!/bin/bash

# CMDB Agent Distribution System - Demo Script
# This script demonstrates all the download features

set -e

API_URL="${API_URL:-http://localhost:3000}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   CMDB Agent Distribution System - Live Demo              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if services are running
echo "🔍 Checking services..."
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "   ✅ API Gateway: $API_URL"
else
    echo "   ❌ API Gateway: Not responding"
    exit 1
fi

if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "   ✅ Frontend: $FRONTEND_URL"
else
    echo "   ⚠️  Frontend: Not responding"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Show agent information
echo "📦 1. Agent Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
curl -s "$API_URL/api/downloads/agent-info" | python3 -m json.tool | head -30
echo ""
echo "   Full info available at: $API_URL/api/downloads/agent-info"
echo ""

# 2. List available downloads
echo "📥 2. Available Download Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Professional Installers:"
echo "   ├─ Windows: $API_URL/api/downloads/cmdb-agent-installer.zip"
echo "   └─ Linux:   $API_URL/api/downloads/cmdb-agent-setup.run"
echo ""
echo "   Standalone Executables:"
echo "   ├─ Windows: $API_URL/api/downloads/cmdb-agent-win.exe"
echo "   └─ Linux:   $API_URL/api/downloads/cmdb-agent-linux"
echo ""
echo "   Source Code:"
echo "   ├─ Linux:   $API_URL/api/downloads/cmdb-agent-linux.tar.gz"
echo "   ├─ Windows: $API_URL/api/downloads/cmdb-agent-windows.zip"
echo "   └─ Docker:  $API_URL/api/downloads/docker-compose.yml"
echo ""

# 3. Test download headers
echo "📋 3. Testing Download Headers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Windows Installer Package:"
curl -sI "$API_URL/api/downloads/cmdb-agent-installer.zip" | grep -E "Content-Type|Content-Length|Content-Disposition|RateLimit"
echo ""

# 4. Show distribution files
echo "📁 4. Distribution Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "/home/rrd/Documents/Iac/backend/cmdb-agent/dist" ]; then
    cd /home/rrd/Documents/Iac/backend/cmdb-agent/dist
    echo ""
    ls -lh *.{exe,run,zip} 2>/dev/null | awk '{printf "   %-45s %8s\n", $9, $5}'
    echo ""
else
    echo "   Distribution directory not found"
    echo ""
fi

# 5. Show checksums
echo "🔐 5. File Checksums (SHA256)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -d "/home/rrd/Documents/Iac/backend/cmdb-agent/dist" ]; then
    cd /home/rrd/Documents/Iac/backend/cmdb-agent/dist
    echo ""
    for file in *.sha256; do
        if [ -f "$file" ]; then
            content=$(cat "$file")
            echo "   $content" | sed 's/  / → /'
        fi
    done
    echo ""
else
    echo "   No checksums found"
    echo ""
fi

# 6. Test rate limiting
echo "⏱️  6. Rate Limiting Test"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Making 3 rapid requests to test rate limiting..."
for i in {1..3}; do
    RESPONSE=$(curl -sI "$API_URL/api/downloads/cmdb-agent-installer.zip" 2>&1)
    REMAINING=$(echo "$RESPONSE" | grep -i "RateLimit-Remaining" | awk '{print $2}' | tr -d '\r')
    LIMIT=$(echo "$RESPONSE" | grep -i "RateLimit-Limit" | awk '{print $2}' | tr -d '\r')
    echo "   Request $i: Rate limit $REMAINING/$LIMIT remaining"
    sleep 0.5
done
echo ""

# 7. Frontend access
echo "🌐 7. Frontend Access"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   🎨 Main Application:  $FRONTEND_URL"
echo "   📥 Downloads Page:    $FRONTEND_URL/downloads"
echo "   📊 CMDB Dashboard:    $FRONTEND_URL/cmdb"
echo "   📈 Monitoring:        $FRONTEND_URL/monitoring"
echo ""

# 8. Installation examples
echo "💻 8. Installation Examples"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   Windows (Professional Installer):"
echo "   ┌────────────────────────────────────────────────────────┐"
echo "   │ 1. Download installer package:                         │"
echo "   │    curl -O $API_URL/api/downloads/cmdb-agent-installer.zip"
echo "   │                                                         │"
echo "   │ 2. Extract and build on Windows:                       │"
echo "   │    iexpress /N installer.sed                           │"
echo "   │                                                         │"
echo "   │ 3. Double-click the resulting EXE                      │"
echo "   └────────────────────────────────────────────────────────┘"
echo ""
echo "   Linux (Self-Extracting Installer):"
echo "   ┌────────────────────────────────────────────────────────┐"
echo "   │ curl -O $API_URL/api/downloads/cmdb-agent-setup.run"
echo "   │ chmod +x cmdb-agent-setup-*.run                        │"
echo "   │ ./cmdb-agent-setup-*.run                               │"
echo "   └────────────────────────────────────────────────────────┘"
echo ""
echo "   Windows (Portable):"
echo "   ┌────────────────────────────────────────────────────────┐"
echo "   │ curl -O $API_URL/api/downloads/cmdb-agent-win.exe"
echo "   │ echo '{\"apiUrl\":\"$API_URL\"}' > config.json         │"
echo "   │ ./cmdb-agent-win.exe                                   │"
echo "   └────────────────────────────────────────────────────────┘"
echo ""

# 9. API documentation
echo "📖 9. API Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "   📚 Swagger UI:     $API_URL/api-docs"
echo "   📄 OpenAPI Spec:   $API_URL/api-docs.json"
echo "   💚 Health Check:   $API_URL/health"
echo "   📊 Metrics:        $API_URL/metrics"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Demo Complete!"
echo ""
echo "Next Steps:"
echo "  1. Visit $FRONTEND_URL/downloads to see the UI"
echo "  2. Download and test an installer"
echo "  3. Check out the documentation in backend/cmdb-agent/"
echo ""
echo "Documentation:"
echo "  • DISTRIBUTION.md - Complete distribution guide"
echo "  • BUILD_INSTALLERS.md - Build instructions"
echo "  • IMPLEMENTATION_SUMMARY.md - Technical overview"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  CMDB Agent Distribution System v1.0.0 - Ready! 🚀        ║"
echo "╚════════════════════════════════════════════════════════════╝"
