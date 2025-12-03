#!/bin/bash
set -e

# Package Linux Agent for Distribution
# Creates distributable packages for multiple architectures

VERSION=${1:-1.0.0}
ARCH=${2:-amd64}  # amd64 or arm64
OUTPUT_DIR="dist/release"
PACKAGE_NAME="cmdb-agent-linux-${ARCH}-${VERSION}"
PACKAGE_DIR="${OUTPUT_DIR}/${PACKAGE_NAME}"

echo "📦 Packaging CMDB Agent for Linux ${ARCH} v${VERSION}..."
echo ""

# Map architecture names
case "$ARCH" in
    amd64|x86_64)
        GOARCH="amd64"
        ;;
    arm64|aarch64)
        GOARCH="arm64"
        ;;
    *)
        echo "❌ Unsupported architecture: $ARCH"
        echo "Supported: amd64, arm64"
        exit 1
        ;;
esac

# Check if binaries exist
if [ ! -f "dist/cmdb-agent-linux-${GOARCH}" ]; then
    echo "❌ Linux binaries not found. Building..."
    make build-all
fi

# Create package directory
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/docs"
mkdir -p "$PACKAGE_DIR/systemd"

# Copy binaries
echo "📋 Copying binaries..."
cp "dist/cmdb-agent-linux-${GOARCH}" "$PACKAGE_DIR/cmdb-agent"
cp "dist/cmdb-agent-cli-linux-${GOARCH}" "$PACKAGE_DIR/cmdb-agent-cli"
chmod +x "$PACKAGE_DIR/cmdb-agent" "$PACKAGE_DIR/cmdb-agent-cli"

# Copy configuration
echo "📋 Copying configuration..."
cp config.example.yaml "$PACKAGE_DIR/config.yaml"

# Copy scripts
echo "📋 Copying installation scripts..."
cat > "$PACKAGE_DIR/install.sh" << 'EOFINSTALL'
#!/bin/bash
set -e

echo "Installing CMDB Agent..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

INSTALL_DIR="/opt/cmdb-agent"
BIN_DIR="/usr/local/bin"
CONFIG_DIR="/etc/cmdb-agent"
DATA_DIR="/var/lib/cmdb-agent"
LOG_DIR="/var/log/cmdb-agent"

# Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$CONFIG_DIR"
mkdir -p "$DATA_DIR"
mkdir -p "$LOG_DIR"

# Copy binaries
cp cmdb-agent "$BIN_DIR/"
cp cmdb-agent-cli "$BIN_DIR/"
chmod +x "$BIN_DIR/cmdb-agent" "$BIN_DIR/cmdb-agent-cli"

# Copy configuration
if [ ! -f "$CONFIG_DIR/config.yaml" ]; then
    cp config.yaml "$CONFIG_DIR/config.yaml"
    echo "Config installed to $CONFIG_DIR/config.yaml"
else
    echo "Config already exists, skipping"
fi

# Install systemd service
if [ -d /etc/systemd/system ]; then
    cp systemd/cmdb-agent.service /etc/systemd/system/
    systemctl daemon-reload
    systemctl enable cmdb-agent.service
    systemctl start cmdb-agent.service
    echo "✅ Systemd service installed and started"
fi

# Create cmdb-agent user if doesn't exist
if ! id cmdb-agent &>/dev/null; then
    useradd -r -s /bin/false -d "$DATA_DIR" cmdb-agent
fi

# Set permissions
chown -R cmdb-agent:cmdb-agent "$DATA_DIR" "$LOG_DIR"

echo ""
echo "✅ CMDB Agent installed successfully!"
echo ""
echo "Service status:"
systemctl status cmdb-agent.service --no-pager || true
echo ""
echo "Configuration: $CONFIG_DIR/config.yaml"
echo "Logs: $LOG_DIR"
echo "Data: $DATA_DIR"
echo ""
echo "Useful commands:"
echo "  sudo systemctl start cmdb-agent"
echo "  sudo systemctl stop cmdb-agent"
echo "  sudo systemctl status cmdb-agent"
echo "  cmdb-agent-cli status"
echo "  cmdb-agent-cli inventory list"
EOFINSTALL

chmod +x "$PACKAGE_DIR/install.sh"

# Uninstall script
cat > "$PACKAGE_DIR/uninstall.sh" << 'EOFUNINSTALL'
#!/bin/bash
set -e

echo "Uninstalling CMDB Agent..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Stop and disable service
systemctl stop cmdb-agent.service || true
systemctl disable cmdb-agent.service || true
rm -f /etc/systemd/system/cmdb-agent.service
systemctl daemon-reload

# Remove binaries
rm -f /usr/local/bin/cmdb-agent
rm -f /usr/local/bin/cmdb-agent-cli

echo ""
echo "✅ CMDB Agent uninstalled"
echo ""
echo "Configuration and data preserved in:"
echo "  /etc/cmdb-agent/"
echo "  /var/lib/cmdb-agent/"
echo "  /var/log/cmdb-agent/"
echo ""
echo "To remove all data, run:"
echo "  sudo rm -rf /etc/cmdb-agent /var/lib/cmdb-agent /var/log/cmdb-agent"
EOFUNINSTALL

chmod +x "$PACKAGE_DIR/uninstall.sh"

# Copy systemd service
echo "📋 Copying systemd service..."
cat > "$PACKAGE_DIR/systemd/cmdb-agent.service" << 'EOFSVC'
[Unit]
Description=CMDB Agent
Documentation=https://github.com/Raghavendra198902/iac
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=cmdb-agent
Group=cmdb-agent
ExecStart=/usr/local/bin/cmdb-agent --config=/etc/cmdb-agent/config.yaml
Restart=on-failure
RestartSec=5s
StandardOutput=append:/var/log/cmdb-agent/agent.log
StandardError=append:/var/log/cmdb-agent/agent.log

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/cmdb-agent /var/log/cmdb-agent

[Install]
WantedBy=multi-user.target
EOFSVC

# Copy documentation
echo "📋 Copying documentation..."
cp README.md "$PACKAGE_DIR/" || echo "README.md not found, skipping"
[ -f FEATURES.md ] && cp FEATURES.md "$PACKAGE_DIR/docs/"
[ -f WEBUI_GUIDE.md ] && cp WEBUI_GUIDE.md "$PACKAGE_DIR/docs/"
[ -f LICENSE ] && cp LICENSE "$PACKAGE_DIR/"

# Create README
cat > "$PACKAGE_DIR/README_FIRST.txt" << EOF
CMDB Agent for Linux - Quick Start Guide
========================================

Version: ${VERSION}
Architecture: ${ARCH}
Built: $(date -u '+%Y-%m-%d %H:%M:%S UTC')

Installation Steps:
-------------------
1. Extract this archive to a temporary location
2. Open a terminal
3. Run as root: sudo ./install.sh

This will:
- Install binaries to /usr/local/bin/
- Create systemd service
- Set up configuration in /etc/cmdb-agent/
- Start the agent automatically

Configuration:
--------------
Edit /etc/cmdb-agent/config.yaml to customize:
- CMDB server endpoint
- Collection schedules
- Authentication settings
- Web UI settings

Web UI Access:
--------------
Once installed and started, access at:
http://localhost:8080

Default credentials:
  Username: admin
  Password: changeme

⚠️ IMPORTANT: Change the default password immediately!

Quick Commands:
--------------
# Service management
sudo systemctl start cmdb-agent
sudo systemctl stop cmdb-agent
sudo systemctl restart cmdb-agent
sudo systemctl status cmdb-agent

# Agent CLI
cmdb-agent-cli status
cmdb-agent-cli inventory list
cmdb-agent-cli test connection

# View logs
sudo journalctl -u cmdb-agent -f
tail -f /var/log/cmdb-agent/agent.log

Uninstallation:
---------------
Run as root: sudo ./uninstall.sh

System Requirements:
--------------------
- Linux kernel 3.10+
- systemd (for service management)
- 100 MB RAM minimum
- 50 MB disk space

Support:
--------
GitHub: https://github.com/Raghavendra198902/iac
Issues: https://github.com/Raghavendra198902/iac/issues
EOF

# Create checksums
echo "🔐 Generating checksums..."
cd "$PACKAGE_DIR"
sha256sum cmdb-agent > checksums.txt
sha256sum cmdb-agent-cli >> checksums.txt
cd - > /dev/null

# Create tar.gz archive
echo "🗜️  Creating archive..."
cd "$OUTPUT_DIR"
tar czf "${PACKAGE_NAME}.tar.gz" "$PACKAGE_NAME"
cd - > /dev/null

# Create checksum for archive
cd "$OUTPUT_DIR"
sha256sum "${PACKAGE_NAME}.tar.gz" > "${PACKAGE_NAME}.tar.gz.sha256"
cd - > /dev/null

# Display results
echo ""
echo "✅ Package created successfully!"
echo ""
echo "📦 Package: ${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz"
echo "📊 Size: $(du -h "${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz" | cut -f1)"
echo "🔐 Checksum: ${OUTPUT_DIR}/${PACKAGE_NAME}.tar.gz.sha256"
echo ""
echo "Contents:"
find "$PACKAGE_DIR" -type f | sed "s|$PACKAGE_DIR/|  - |"
echo ""
echo "Installation command for end users:"
echo "  tar xzf ${PACKAGE_NAME}.tar.gz"
echo "  cd ${PACKAGE_NAME}"
echo "  sudo ./install.sh"
