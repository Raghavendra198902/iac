#!/bin/bash
set -e

echo "Installing CMDB Agent on macOS..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root (use sudo)"
    exit 1
fi

VERSION=${1:-1.0.0}

# Copy binaries
echo "Installing binaries..."
cp dist/cmdb-agent-darwin-$(uname -m) /usr/local/bin/cmdb-agent
cp dist/cmdb-agent-cli-darwin-$(uname -m) /usr/local/bin/cmdb-agent-cli
chmod +x /usr/local/bin/cmdb-agent*

# Create directories
echo "Creating directories..."
mkdir -p /etc/cmdb-agent
mkdir -p /var/lib/cmdb-agent
mkdir -p /var/log/cmdb-agent

# Copy config
echo "Installing configuration..."
if [ ! -f /etc/cmdb-agent/config.yaml ]; then
    cp config.example.yaml /etc/cmdb-agent/config.yaml
    echo "Configuration file created at /etc/cmdb-agent/config.yaml"
else
    echo "Configuration file already exists, skipping..."
fi

# Install launchd plist
echo "Installing launchd service..."
cp launchd/com.cmdb.agent.plist /Library/LaunchDaemons/
chmod 644 /Library/LaunchDaemons/com.cmdb.agent.plist

# Load service
echo "Loading service..."
launchctl load /Library/LaunchDaemons/com.cmdb.agent.plist

# Start service
echo "Starting service..."
launchctl start com.cmdb.agent

echo ""
echo "CMDB Agent installed successfully!"
echo ""
echo "Configuration: /etc/cmdb-agent/config.yaml"
echo "Logs: /var/log/cmdb-agent/"
echo ""
echo "Service commands:"
echo "  Start:   sudo launchctl start com.cmdb.agent"
echo "  Stop:    sudo launchctl stop com.cmdb.agent"
echo "  Restart: sudo launchctl stop com.cmdb.agent && sudo launchctl start com.cmdb.agent"
echo "  Status:  sudo launchctl list | grep cmdb"
