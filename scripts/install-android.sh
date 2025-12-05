#!/bin/bash

###############################################################################
# Pro Agent Installer for Android (Termux)
# 
# This script installs the IAC Pro Agent in Termux on Android
# 
# Prerequisites:
#   - Termux app installed from F-Droid
#   
# Usage:
#   pkg install wget && wget -O - https://install.iac-dharma.com/android.sh | bash
#   
# Or with configuration:
#   export CMDB_SERVER_URL="http://your-server:3001"
#   export CMDB_API_KEY="your-api-key"
#   wget -O - https://install.iac-dharma.com/android.sh | bash
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
INSTALL_DIR="$PREFIX/lib/${AGENT_NAME}"
BIN_DIR="$PREFIX/bin"
CONFIG_DIR="$HOME/.config/iac-agent"

# Default values
DEFAULT_SERVER_URL="http://localhost:3001"
DEFAULT_INTERVAL="120000"

echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   IAC Pro Agent Installer for Android (Termux)${NC}"
echo -e "${BLUE}   Version 2.0${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

# Check if running in Termux
if [ -z "$TERMUX_VERSION" ]; then
    echo -e "${RED}❌ Error: This installer is for Termux only${NC}"
    echo -e "${YELLOW}   Install Termux from F-Droid: https://f-droid.org/packages/com.termux/${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Running in Termux $TERMUX_VERSION${NC}"

# Update packages
echo -e "${BLUE}📦 Updating Termux packages...${NC}"
pkg update -y
pkg upgrade -y

# Install required packages
echo -e "${BLUE}🔍 Installing prerequisites...${NC}"

packages="nodejs git curl"
for package in $packages; do
    if ! command -v $package &> /dev/null; then
        echo -e "${YELLOW}⚠️  Installing $package...${NC}"
        pkg install -y $package
    else
        echo -e "${GREEN}✓ $package already installed${NC}"
    fi
done

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓ Node.js version: $NODE_VERSION${NC}"

# Get configuration
echo ""
echo -e "${BLUE}⚙️  Configuration:${NC}"

if [ -z "$CMDB_SERVER_URL" ]; then
    echo -e "${YELLOW}Server URL [$DEFAULT_SERVER_URL]:${NC}"
    read SERVER_URL
    SERVER_URL=${SERVER_URL:-$DEFAULT_SERVER_URL}
else
    SERVER_URL=$CMDB_SERVER_URL
fi

if [ -z "$CMDB_API_KEY" ]; then
    echo -e "${YELLOW}API Key (optional):${NC}"
    read API_KEY
else
    API_KEY=$CMDB_API_KEY
fi

if [ -z "$COLLECTION_INTERVAL" ]; then
    COLLECTION_INTERVAL=$DEFAULT_INTERVAL
fi

echo -e "${GREEN}✓ Server URL: $SERVER_URL${NC}"
echo -e "${GREEN}✓ Collection Interval: ${COLLECTION_INTERVAL}ms${NC}"

# Clone repository or download
echo ""
echo -e "${BLUE}📥 Downloading Pro Agent...${NC}"

TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"

# Try to clone from GitHub
if git clone --depth 1 https://github.com/your-org/iac.git 2>/dev/null; then
    echo -e "${GREEN}✓ Cloned from GitHub${NC}"
    AGENT_SRC="$TMP_DIR/iac/backend/cmdb-agent"
else
    # Fallback to direct download
    echo -e "${YELLOW}⚠️  Git clone failed, downloading archive...${NC}"
    DOWNLOAD_URL="https://github.com/your-org/iac/archive/refs/heads/main.tar.gz"
    curl -fsSL "$DOWNLOAD_URL" -o agent.tar.gz
    tar -xzf agent.tar.gz
    AGENT_SRC="$TMP_DIR/iac-main/backend/cmdb-agent"
fi

# Build agent
echo -e "${BLUE}🔨 Building agent...${NC}"
cd "$AGENT_SRC"

# Install dependencies
npm install --production

# Build TypeScript
npm run build

echo -e "${GREEN}✓ Build complete${NC}"

# Create directories
echo -e "${BLUE}📁 Creating directories...${NC}"
mkdir -p "$INSTALL_DIR"
mkdir -p "$CONFIG_DIR"
mkdir -p "$BIN_DIR"

# Install agent
echo -e "${BLUE}📲 Installing agent...${NC}"
cp -R "$AGENT_SRC/dist" "$INSTALL_DIR/"
cp -R "$AGENT_SRC/node_modules" "$INSTALL_DIR/"
cp "$AGENT_SRC/package.json" "$INSTALL_DIR/"

echo -e "${GREEN}✓ Agent installed to $INSTALL_DIR${NC}"

# Create launcher script
echo -e "${BLUE}🚀 Creating launcher...${NC}"

LAUNCHER_SCRIPT="$BIN_DIR/iac-pro-agent"

cat > "$LAUNCHER_SCRIPT" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# IAC Pro Agent Launcher for Android/Termux

INSTALL_DIR="$PREFIX/lib/iac-pro-agent"
CONFIG_FILE="$HOME/.config/iac-agent/config.json"

# Load configuration
if [ -f "$CONFIG_FILE" ]; then
    export CMDB_SERVER_URL=$(cat "$CONFIG_FILE" | grep serverUrl | cut -d'"' -f4)
    export CMDB_API_KEY=$(cat "$CONFIG_FILE" | grep apiKey | cut -d'"' -f4)
    export COLLECTION_INTERVAL=$(cat "$CONFIG_FILE" | grep collectionInterval | cut -d':' -f2 | tr -d ' ,')
fi

cd "$INSTALL_DIR"
node dist/agents/ProAndroidAgent.js "$@"
EOF

chmod +x "$LAUNCHER_SCRIPT"

echo -e "${GREEN}✓ Launcher created${NC}"

# Create configuration file
echo -e "${BLUE}⚙️  Creating configuration...${NC}"

CONFIG_FILE="$CONFIG_DIR/config.json"

cat > "$CONFIG_FILE" <<EOF
{
  "serverUrl": "$SERVER_URL",
  "apiKey": "${API_KEY:-}",
  "collectionInterval": $COLLECTION_INTERVAL,
  "aiAnalytics": {
    "enabled": true,
    "batteryOptimization": true,
    "performancePrediction": true,
    "storageManagement": true
  },
  "security": {
    "appPermissionAudit": true,
    "malwareScan": true,
    "rootDetection": true
  },
  "autoRemediation": {
    "enabled": true,
    "autoClearCache": true,
    "autoKillBadApps": false,
    "autoOptimizeBattery": true
  }
}
EOF

echo -e "${GREEN}✓ Configuration saved to $CONFIG_FILE${NC}"

# Create boot service (Termux:Boot required)
if command -v termux-wake-lock &> /dev/null; then
    echo -e "${BLUE}🔋 Setting up boot service...${NC}"
    
    mkdir -p "$HOME/.termux/boot"
    
    cat > "$HOME/.termux/boot/iac-agent" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash

# Start IAC Pro Agent on boot
termux-wake-lock
iac-pro-agent &
EOF

    chmod +x "$HOME/.termux/boot/iac-agent"
    echo -e "${GREEN}✓ Boot service created${NC}"
    echo -e "${YELLOW}   Install 'Termux:Boot' from F-Droid to auto-start${NC}"
else
    echo -e "${YELLOW}⚠️  Install 'Termux:Boot' from F-Droid for auto-start capability${NC}"
fi

# Cleanup
cd "$HOME"
rm -rf "$TMP_DIR"

# Success message
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Installation Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📊 Start Agent:${NC}"
echo "   iac-pro-agent"
echo ""
echo -e "${BLUE}🔍 Run in Background:${NC}"
echo "   iac-pro-agent &"
echo ""
echo -e "${BLUE}🛑 Stop Agent:${NC}"
echo "   pkill -f pro-agent"
echo ""
echo -e "${BLUE}🔧 Configuration:${NC}"
echo "   $CONFIG_FILE"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   https://docs.iac-dharma.com/pro-agents"
echo ""
echo -e "${YELLOW}💡 Tip: Keep Termux running in background for continuous monitoring${NC}"
echo -e "${YELLOW}💡 Tip: Install 'Termux:Boot' for auto-start on device boot${NC}"
echo ""

# Offer to start agent
echo -e "${BLUE}Start agent now? (y/N):${NC}"
read START_NOW

if [[ "$START_NOW" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}▶️  Starting agent...${NC}"
    iac-pro-agent &
    sleep 2
    echo -e "${GREEN}✓ Agent started in background${NC}"
    echo -e "${YELLOW}   View logs with: pkill -USR1 -f pro-agent${NC}"
fi
