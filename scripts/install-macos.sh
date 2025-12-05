#!/bin/bash

###############################################################################
# Pro Agent Installer for macOS
# 
# This script installs the IAC Pro Agent on macOS systems
# 
# Usage:
#   curl -fsSL https://install.iac-dharma.com/macos.sh | bash
#   
# Or with configuration:
#   export CMDB_SERVER_URL="http://your-server:3001"
#   export CMDB_API_KEY="your-api-key"
#   curl -fsSL https://install.iac-dharma.com/macos.sh | bash
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AGENT_NAME="iac-pro-agent"
INSTALL_DIR="/usr/local/lib/${AGENT_NAME}"
BIN_DIR="/usr/local/bin"
CONFIG_DIR="/Library/Application Support/IACAgent"
LAUNCH_AGENT_DIR="$HOME/Library/LaunchAgents"
LAUNCH_AGENT_PLIST="com.iacdharma.proagent.plist"

# Default values
DEFAULT_SERVER_URL="http://localhost:3001"
DEFAULT_INTERVAL="60000"

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   IAC Pro Agent Installer for macOS${NC}"
echo -e "${BLUE}   Version 2.0${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Check if running macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${RED}❌ Error: This installer is for macOS only${NC}"
    exit 1
fi

# Check if running as root (we don't want that for user LaunchAgent)
if [[ $EUID -eq 0 ]]; then
   echo -e "${YELLOW}⚠️  Warning: Running as root. Installing as system-wide service...${NC}"
   LAUNCH_AGENT_DIR="/Library/LaunchDaemons"
fi

# Detect architecture
ARCH=$(uname -m)
if [[ "$ARCH" == "arm64" ]]; then
    echo -e "${GREEN}✓ Detected Apple Silicon (M1/M2/M3)${NC}"
    AGENT_ARCH="arm64"
elif [[ "$ARCH" == "x86_64" ]]; then
    echo -e "${GREEN}✓ Detected Intel processor${NC}"
    AGENT_ARCH="x64"
else
    echo -e "${RED}❌ Unsupported architecture: $ARCH${NC}"
    exit 1
fi

# Check for required tools
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Installing via Homebrew...${NC}"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}⚠️  Homebrew not found. Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    brew install node
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"

# Get configuration
echo ""
echo -e "${BLUE}⚙️  Configuration:${NC}"

if [ -z "$CMDB_SERVER_URL" ]; then
    read -p "Server URL [$DEFAULT_SERVER_URL]: " SERVER_URL
    SERVER_URL=${SERVER_URL:-$DEFAULT_SERVER_URL}
else
    SERVER_URL=$CMDB_SERVER_URL
fi

if [ -z "$CMDB_API_KEY" ]; then
    read -p "API Key (optional): " API_KEY
else
    API_KEY=$CMDB_API_KEY
fi

if [ -z "$COLLECTION_INTERVAL" ]; then
    COLLECTION_INTERVAL=$DEFAULT_INTERVAL
fi

echo -e "${GREEN}✓ Server URL: $SERVER_URL${NC}"
echo -e "${GREEN}✓ Collection Interval: ${COLLECTION_INTERVAL}ms${NC}"

# Download agent
echo ""
echo -e "${BLUE}📥 Downloading Pro Agent...${NC}"

DOWNLOAD_URL="https://github.com/your-org/iac/releases/latest/download/iac-pro-agent-macos-${AGENT_ARCH}.tar.gz"
TMP_DIR=$(mktemp -d)

curl -fsSL "$DOWNLOAD_URL" -o "$TMP_DIR/agent.tar.gz"

echo -e "${GREEN}✓ Download complete${NC}"

# Extract
echo -e "${BLUE}📦 Extracting...${NC}"
tar -xzf "$TMP_DIR/agent.tar.gz" -C "$TMP_DIR"

# Create directories
echo -e "${BLUE}📁 Creating directories...${NC}"
sudo mkdir -p "$INSTALL_DIR"
sudo mkdir -p "$CONFIG_DIR"
mkdir -p "$LAUNCH_AGENT_DIR"

# Install agent
echo -e "${BLUE}📲 Installing agent...${NC}"
sudo cp -R "$TMP_DIR/iac-pro-agent/"* "$INSTALL_DIR/"
sudo chmod +x "$INSTALL_DIR/bin/pro-agent"

# Create symlink
sudo ln -sf "$INSTALL_DIR/bin/pro-agent" "$BIN_DIR/iac-pro-agent"

echo -e "${GREEN}✓ Agent installed to $INSTALL_DIR${NC}"

# Create configuration file
echo -e "${BLUE}⚙️  Creating configuration...${NC}"

CONFIG_FILE="$CONFIG_DIR/config.json"
sudo tee "$CONFIG_FILE" > /dev/null <<EOF
{
  "serverUrl": "$SERVER_URL",
  "apiKey": "${API_KEY:-}",
  "collectionInterval": $COLLECTION_INTERVAL,
  "aiAnalytics": {
    "enabled": true,
    "anomalyDetection": true,
    "predictiveMaintenance": true,
    "performanceOptimization": true
  },
  "security": {
    "xprotectMonitoring": true,
    "gatekeeperCheck": true,
    "keychainAuditing": true,
    "fileVaultCheck": true
  },
  "autoRemediation": {
    "enabled": true,
    "autoRestartServices": true,
    "autoCleanCache": true,
    "autoRepairPermissions": false
  }
}
EOF

echo -e "${GREEN}✓ Configuration saved to $CONFIG_FILE${NC}"

# Create LaunchAgent plist
echo -e "${BLUE}🚀 Creating LaunchAgent...${NC}"

PLIST_FILE="$LAUNCH_AGENT_DIR/$LAUNCH_AGENT_PLIST"

cat > "$PLIST_FILE" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.iacdharma.proagent</string>
    <key>ProgramArguments</key>
    <array>
        <string>$BIN_DIR/iac-pro-agent</string>
    </array>
    <key>EnvironmentVariables</key>
    <dict>
        <key>CMDB_SERVER_URL</key>
        <string>$SERVER_URL</string>
EOF

if [ -n "$API_KEY" ]; then
cat >> "$PLIST_FILE" <<EOF
        <key>CMDB_API_KEY</key>
        <string>$API_KEY</string>
EOF
fi

cat >> "$PLIST_FILE" <<EOF
        <key>COLLECTION_INTERVAL</key>
        <string>$COLLECTION_INTERVAL</string>
    </dict>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/tmp/iac-pro-agent.out.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/iac-pro-agent.err.log</string>
</dict>
</plist>
EOF

echo -e "${GREEN}✓ LaunchAgent created${NC}"

# Load LaunchAgent
echo -e "${BLUE}▶️  Starting agent...${NC}"
launchctl load "$PLIST_FILE"
sleep 2

# Verify agent is running
if launchctl list | grep -q "com.iacdharma.proagent"; then
    echo -e "${GREEN}✓ Agent started successfully${NC}"
else
    echo -e "${RED}❌ Failed to start agent${NC}"
    echo -e "${YELLOW}Check logs at: /tmp/iac-pro-agent.err.log${NC}"
fi

# Cleanup
rm -rf "$TMP_DIR"

# Success message
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Agent Status:${NC}"
echo "   Command: launchctl list | grep iacdharma"
echo ""
echo -e "${BLUE}🔍 View Logs:${NC}"
echo "   tail -f /tmp/iac-pro-agent.out.log"
echo ""
echo -e "${BLUE}🛑 Stop Agent:${NC}"
echo "   launchctl unload $PLIST_FILE"
echo ""
echo -e "${BLUE}▶️  Start Agent:${NC}"
echo "   launchctl load $PLIST_FILE"
echo ""
echo -e "${BLUE}🔧 Configuration:${NC}"
echo "   $CONFIG_FILE"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   https://docs.iac-dharma.com/pro-agents"
echo ""
