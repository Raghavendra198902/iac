#!/bin/bash
# Verify CMDB Demo Data
# Quick check to see if all demo data is present

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           Citadel CMDB - Data Verification               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

API_URL="http://localhost:3000"

# Check API
echo "🔍 Checking API Gateway..."
if curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo "✅ API Gateway is running"
else
    echo "❌ API Gateway is not responding"
    exit 1
fi
echo ""

# Check Agents
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📡 CMDB Agents"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
agent_count=$(curl -s "$API_URL/api/cmdb/agents/status" | jq '. | length')
echo "Agents found: $agent_count"
echo ""

if [ "$agent_count" -gt 0 ]; then
    curl -s "$API_URL/api/cmdb/agents/status" | jq -r '.[] | "  \(.status | if . == "online" then "🟢" elif . == "warning" then "🟡" else "🔴" end) \(.hostname) - Health: \(.healthScore)% - CIs: \(.ciCount)"'
else
    echo "⚠️  No agents found - run ./scripts/seed-cmdb-data.js"
fi
echo ""

# Check Security Events
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🔒 Security Events (DLP)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
event_count=$(curl -s "$API_URL/api/security/events?limit=1" | jq '.total')
echo "Security events: $event_count"
echo ""

if [ "$event_count" -gt 0 ]; then
    echo "Event Distribution:"
    curl -s "$API_URL/api/security/analytics?timeRange=24h" | jq -r '.statistics.byType | to_entries[] | "  • \(.key): \(.value)"'
    echo ""
    echo "Severity:"
    curl -s "$API_URL/api/security/analytics?timeRange=24h" | jq -r '.statistics.bySeverity | to_entries[] | "  • \(.key): \(.value)"'
else
    echo "⚠️  No security events - run ./scripts/seed-demo-data.sh"
fi
echo ""

# Dashboard Links
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌐 Dashboard Links"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CMDB Dashboard:"
echo "  http://localhost:5173/cmdb"
echo "  http://192.168.1.10:5173/cmdb"
echo ""
echo "Security Dashboard:"
echo "  http://localhost:5173/security/dlp"
echo "  http://192.168.1.10:5173/security/dlp"
echo ""

# Summary
echo "╔═══════════════════════════════════════════════════════════╗"
if [ "$agent_count" -ge 3 ] && [ "$event_count" -gt 5 ]; then
    echo "║              ✅ All Demo Data Present!                    ║"
else
    echo "║              ⚠️  Some Demo Data Missing                   ║"
fi
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
