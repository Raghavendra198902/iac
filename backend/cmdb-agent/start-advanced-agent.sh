#!/bin/bash
# Quick Start Guide for Advanced CMDB Agent

echo "════════════════════════════════════════════════════════════════"
echo "        CMDB ADVANCED AGENT - QUICK START"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if basic agent is running
if pgrep -f "test-agent-simulator.py" > /dev/null; then
    echo "⚠️  Basic agent is running. Stopping it..."
    pkill -f "test-agent-simulator.py"
    sleep 2
    echo "✅ Basic agent stopped"
    echo ""
fi

# Check if advanced agent is already running
if pgrep -f "advanced-agent.py" > /dev/null; then
    echo "✅ Advanced agent is already running!"
    PID=$(pgrep -f "advanced-agent.py")
    echo "   PID: $PID"
    echo ""
    echo "To view logs:"
    echo "   tail -f /tmp/advanced-agent.log"
    echo ""
    echo "To stop:"
    echo "   pkill -f advanced-agent.py"
    exit 0
fi

# Start advanced agent
echo "🚀 Starting Advanced CMDB Agent..."
cd "$(dirname "$0")"

# Create log directory if needed
mkdir -p /tmp/cmdb-logs

# Start agent in background
nohup python3 advanced-agent.py > /tmp/cmdb-logs/advanced-agent.log 2>&1 &
AGENT_PID=$!

sleep 3

# Check if it started successfully
if pgrep -f "advanced-agent.py" > /dev/null; then
    echo "✅ Advanced agent started successfully!"
    echo "   PID: $AGENT_PID"
    echo ""
    echo "📊 Features enabled:"
    echo "   • CPU Usage Monitoring"
    echo "   • Memory Usage (Total/Used/Available)"
    echo "   • Disk Usage (All Filesystems)"
    echo "   • Network Statistics"
    echo "   • Security Updates Tracking"
    echo "   • Logged In Users"
    echo "   • Trend Analysis"
    echo "   • Load Average"
    echo "   • Process Count"
    echo ""
    echo "📁 Log file: /tmp/cmdb-logs/advanced-agent.log"
    echo ""
    echo "💡 Useful commands:"
    echo "   View logs:  tail -f /tmp/cmdb-logs/advanced-agent.log"
    echo "   Check status: ps aux | grep advanced-agent"
    echo "   Stop agent: pkill -f advanced-agent.py"
    echo ""
    echo "🌐 View in CMDB: http://192.168.1.9:5173/cmdb"
else
    echo "❌ Failed to start advanced agent"
    echo "   Check logs: cat /tmp/cmdb-logs/advanced-agent.log"
    exit 1
fi

echo "════════════════════════════════════════════════════════════════"
