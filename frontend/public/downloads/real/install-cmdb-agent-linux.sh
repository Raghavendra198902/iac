#!/bin/bash
# CMDB Agent Linux Installer
# Version: 1.0.0
# Download and run: curl -fsSL http://192.168.1.9:5173/downloads/real/install-cmdb-agent-linux.sh | sudo bash

set -e

echo "========================================"
echo "   CMDB Agent Linux Installer v1.0    "
echo "========================================"
echo ""

# Configuration
AGENT_VERSION="1.0.0"
INSTALL_PATH="/opt/cmdb-agent"
SERVICE_NAME="cmdb-agent"
SERVER_URL="http://192.168.1.9:3001"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ ERROR: This script must be run as root (use sudo)"
    exit 1
fi

echo "✅ Running with root privileges"

# Create installation directory
echo "📁 Creating installation directory..."
mkdir -p "$INSTALL_PATH"

# Create agent script
echo "📝 Creating agent script..."
cat > "$INSTALL_PATH/cmdb-agent.sh" << 'AGENT_EOF'
#!/bin/bash
VERSION="1.0.0"
SERVER_URL="http://192.168.1.9:3001"

echo "CMDB Agent v$VERSION running..."
echo "Server: $SERVER_URL"

while true; do
    # Collect system information
    HOSTNAME=$(hostname)
    OS=$(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)
    MEMORY=$(free -h | awk '/^Mem:/ {print $2}')
    CPU=$(lscpu | grep "Model name" | cut -d':' -f2 | xargs)
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Create JSON payload
    DATA=$(cat <<JSON
{
    "hostname": "$HOSTNAME",
    "os": "$OS",
    "memory": "$MEMORY",
    "cpu": "$CPU",
    "version": "$VERSION",
    "timestamp": "$TIMESTAMP"
}
JSON
)
    
    # Send heartbeat to server
    curl -s -X POST "$SERVER_URL/api/agents/heartbeat" \
        -H "Content-Type: application/json" \
        -d "$DATA" > /dev/null 2>&1 || true
    
    echo "[$TIMESTAMP] Heartbeat sent to $SERVER_URL"
    
    sleep 60
done
AGENT_EOF

chmod +x "$INSTALL_PATH/cmdb-agent.sh"

# Create systemd service
echo "🔧 Creating systemd service..."
cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=CMDB Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=$INSTALL_PATH/cmdb-agent.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
systemctl daemon-reload
systemctl enable $SERVICE_NAME
systemctl start $SERVICE_NAME

echo "✅ Service installed and started successfully"

# Create uninstaller
cat > "$INSTALL_PATH/uninstall.sh" << 'UNINSTALL_EOF'
#!/bin/bash
echo "Stopping CMDB Agent..."
systemctl stop cmdb-agent
systemctl disable cmdb-agent
rm -f /etc/systemd/system/cmdb-agent.service
systemctl daemon-reload
echo "Removing files..."
rm -rf /opt/cmdb-agent
echo "Uninstallation complete!"
UNINSTALL_EOF

chmod +x "$INSTALL_PATH/uninstall.sh"

echo ""
echo "========================================"
echo "   ✅ Installation Complete!          "
echo "========================================"
echo ""
echo "📍 Installation Path: $INSTALL_PATH"
echo "🔗 Server URL: $SERVER_URL"
echo "📊 Check status: systemctl status $SERVICE_NAME"
echo "📜 View logs: journalctl -u $SERVICE_NAME -f"
echo ""
echo "To uninstall, run:"
echo "  sudo $INSTALL_PATH/uninstall.sh"
echo ""
