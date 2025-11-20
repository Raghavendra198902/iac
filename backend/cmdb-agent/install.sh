#!/bin/bash
# One-line CMDB Agent installer for Linux
# Usage: curl -fsSL https://your-domain.com/agent/install.sh | bash

set -e

echo "======================================"
echo "CMDB Agent Installer"
echo "======================================"
echo ""

# Check if curl or wget is available
if command -v curl &> /dev/null; then
    DOWNLOAD_CMD="curl -fsSL"
elif command -v wget &> /dev/null; then
    DOWNLOAD_CMD="wget -qO-"
else
    echo "Error: Neither curl nor wget is installed"
    exit 1
fi

# Set variables
API_URL="${CMDB_API_URL:-http://localhost:3000}"
INSTALL_DIR="${CMDB_INSTALL_DIR:-$HOME/cmdb-agent}"
DOWNLOAD_URL="$API_URL/api/downloads/cmdb-agent-linux.tar.gz"

echo "Downloading CMDB Agent..."
mkdir -p "$INSTALL_DIR"
cd "$INSTALL_DIR"

if command -v curl &> /dev/null; then
    curl -fsSL "$DOWNLOAD_URL" | tar -xz --strip-components=1
else
    wget -qO- "$DOWNLOAD_URL" | tar -xz --strip-components=1
fi

echo "✓ Download complete"
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo "Docker detected. You can use:"
    echo "  cd $INSTALL_DIR && docker-compose up -d"
else
    echo "Docker not found. Installing Node.js version..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo "Error: Node.js is not installed"
        echo "Please install Node.js 18+ from: https://nodejs.org"
        exit 1
    fi
    
    echo "Installing dependencies..."
    npm install --production
    
    echo ""
    echo "✓ Installation complete!"
fi

echo ""
echo "======================================"
echo "Configuration Required"
echo "======================================"
echo "Edit the .env file with your settings:"
echo "  cd $INSTALL_DIR"
echo "  nano .env"
echo ""
echo "Required variables:"
echo "  - CMDB_API_URL: Your CMDB API endpoint"
echo "  - CMDB_API_KEY: Your authentication key"
echo "  - AGENT_ID: Unique agent identifier"
echo ""
echo "Then start the agent:"
echo "  ./setup.sh"
echo ""
