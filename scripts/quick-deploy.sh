#!/bin/bash

################################################################################
# Quick Deploy Script - CMDB Agent
# Fast deployment for development and testing
################################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 Quick Deploy - CMDB Agent"
echo "=============================="
echo

# Build agent
echo "📦 Building agent..."
cd "${PROJECT_ROOT}/backend/cmdb-agent"
npm install --quiet
npm run build

# Start agent in development mode
echo "🔧 Starting agent in development mode..."
export AGENT_ENVIRONMENT=development
export CMDB_API_URL=http://localhost:3000
export AGENT_PORT=9000
export AUTO_DISCOVERY_ENABLED=true
export AUTO_UPDATE=false

node dist/index.js &
AGENT_PID=$!

echo "✅ Agent started with PID: ${AGENT_PID}"
echo
echo "📊 Health check: curl http://localhost:9000/health"
echo "📊 Status: curl http://localhost:9000/status"
echo "🛑 Stop: kill ${AGENT_PID}"
echo
echo "Agent logs: tail -f /tmp/cmdb-agent-*.log"
