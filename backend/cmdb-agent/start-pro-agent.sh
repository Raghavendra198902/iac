#!/bin/bash
# Pro-Level CMDB Agent Startup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Pro-Level Enterprise CMDB Agent Launcher         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ to continue"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Warning: Node.js version 18+ recommended (current: $(node --version))${NC}"
fi

# Check for TypeScript
if ! command -v ts-node &> /dev/null; then
    echo -e "${YELLOW}⚠️  ts-node not found, installing...${NC}"
    npm install -g ts-node typescript
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Build if needed
if [ ! -d "dist" ] || [ "src/ProAgent.ts" -nt "dist/ProAgent.js" ]; then
    echo -e "${YELLOW}🔨 Building Pro Agent...${NC}"
    npm run build 2>/dev/null || npx tsc
fi

# Check for config
if [ ! -f "config.json" ]; then
    echo -e "${YELLOW}⚠️  No config.json found, creating default...${NC}"
    cat > config.json <<EOF
{
  "version": "3.0.0-pro",
  "agentName": "$(hostname)-pro",
  "apiServerUrl": "http://localhost:3000",
  "autoUpdate": true,
  "updateCheckIntervalHours": 24,
  "monitoring": {
    "processes": true,
    "registry": true,
    "usb": true,
    "network": true,
    "filesystem": true
  },
  "telemetry": {
    "batchSize": 100,
    "flushIntervalSeconds": 60
  },
  "aiAnalytics": {
    "anomalyDetection": true,
    "predictiveMaintenance": true,
    "performanceOptimization": true,
    "threatIntelligence": true
  },
  "advancedMonitoring": {
    "deepPacketInspection": false,
    "kernelLevelMonitoring": true,
    "containerRuntime": true,
    "cloudMetadata": true,
    "blockchainValidation": false
  },
  "autoRemediation": {
    "enabled": true,
    "autoRestart": true,
    "autoScale": false,
    "selfHealing": true,
    "rollbackOnFailure": true
  },
  "securityScanning": {
    "vulnerabilityScan": true,
    "complianceChecks": true,
    "malwareDetection": true,
    "cryptoMining": true
  },
  "performanceProfiling": {
    "cpuProfiling": true,
    "memoryProfiling": true,
    "ioBottleneckDetection": true,
    "latencyAnalysis": true
  },
  "intelligentCaching": {
    "mlBasedPrediction": true,
    "adaptiveTTL": true,
    "compressionEnabled": true
  }
}
EOF
fi

# Parse command line arguments
DAEMON_MODE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--daemon)
            DAEMON_MODE=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --stop)
            echo -e "${BLUE}🛑 Stopping Pro Agent...${NC}"
            pkill -f "pro-agent-cli" && echo -e "${GREEN}✅ Agent stopped${NC}" || echo -e "${YELLOW}⚠️  No running agent found${NC}"
            exit 0
            ;;
        --status)
            if pgrep -f "pro-agent-cli" > /dev/null; then
                echo -e "${GREEN}✅ Pro Agent is running${NC}"
                ps aux | grep "pro-agent-cli" | grep -v grep
            else
                echo -e "${YELLOW}⚠️  Pro Agent is not running${NC}"
            fi
            exit 0
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -d, --daemon     Run in daemon mode"
            echo "  -v, --verbose    Enable verbose output"
            echo "  --stop           Stop running agent"
            echo "  --status         Check agent status"
            echo "  -h, --help       Show this help"
            echo ""
            echo "Features:"
            echo "  🤖 AI-Powered Anomaly Detection"
            echo "  🔮 Predictive Maintenance"
            echo "  🔧 Auto-Remediation"
            echo "  🔒 Security Scanning"
            echo "  💡 Performance Profiling"
            echo "  🐳 Container Monitoring"
            echo "  ☁️  Cloud Environment Detection"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Check if already running
if pgrep -f "pro-agent-cli" > /dev/null; then
    echo -e "${YELLOW}⚠️  Pro Agent is already running${NC}"
    echo -e "Use ${GREEN}--stop${NC} to stop it first, or ${GREEN}--status${NC} to check status"
    exit 1
fi

echo -e "${GREEN}🚀 Starting Pro-Level CMDB Agent...${NC}"
echo ""
echo -e "${BLUE}Features enabled:${NC}"
echo -e "  ${GREEN}✅${NC} AI-Powered Anomaly Detection"
echo -e "  ${GREEN}✅${NC} Predictive Maintenance"
echo -e "  ${GREEN}✅${NC} Auto-Remediation Engine"
echo -e "  ${GREEN}✅${NC} Security Vulnerability Scanning"
echo -e "  ${GREEN}✅${NC} Performance Profiling"
echo -e "  ${GREEN}✅${NC} Container Runtime Monitoring"
echo -e "  ${GREEN}✅${NC} Cloud Environment Detection"
echo ""

# Set verbose flag
VERBOSE_FLAG=""
if [ "$VERBOSE" = true ]; then
    VERBOSE_FLAG="--verbose"
fi

# Start the agent
if [ "$DAEMON_MODE" = true ]; then
    echo -e "${BLUE}Starting in daemon mode...${NC}"
    nohup npx ts-node src/pro-agent-cli.ts start --daemon $VERBOSE_FLAG > pro-agent.log 2>&1 &
    PID=$!
    echo $PID > pro-agent.pid
    echo -e "${GREEN}✅ Pro Agent started in background (PID: $PID)${NC}"
    echo -e "   Logs: ${BLUE}pro-agent.log${NC}"
    echo -e "   Stop: ${GREEN}$0 --stop${NC}"
else
    echo -e "${BLUE}Starting in foreground mode (Ctrl+C to stop)...${NC}"
    echo ""
    npx ts-node src/pro-agent-cli.ts start $VERBOSE_FLAG
fi
