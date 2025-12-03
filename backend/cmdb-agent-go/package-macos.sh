#!/bin/bash
set -e

# Package macOS Agent for Distribution
# Creates distributable packages for Intel and Apple Silicon

VERSION=${1:-1.0.0}
ARCH=${2:-amd64}  # amd64 or arm64
OUTPUT_DIR="dist/release"
PACKAGE_NAME="cmdb-agent-macos-${ARCH}-${VERSION}"
PACKAGE_DIR="${OUTPUT_DIR}/${PACKAGE_NAME}"

echo "📦 Packaging CMDB Agent for macOS ${ARCH} v${VERSION}..."
echo ""

# Map architecture names
case "$ARCH" in
    amd64|x86_64)
        GOARCH="amd64"
        ARCH_NAME="Intel"
        ;;
    arm64|aarch64)
        GOARCH="arm64"
        ARCH_NAME="Apple Silicon"
        ;;
    *)
        echo "❌ Unsupported architecture: $ARCH"
        echo "Supported: amd64 (Intel), arm64 (Apple Silicon)"
        exit 1
        ;;
esac

# Check if binaries exist
if [ ! -f "dist/cmdb-agent-darwin-${GOARCH}" ]; then
    echo "❌ macOS binaries not found. Building..."
    make build-all
fi

# Create package directory
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/docs"
mkdir -p "$PACKAGE_DIR/LaunchDaemons"

# Copy binaries
echo "📋 Copying binaries..."
cp "dist/cmdb-agent-darwin-${GOARCH}" "$PACKAGE_DIR/cmdb-agent"
cp "dist/cmdb-agent-cli-darwin-${GOARCH}" "$PACKAGE_DIR/cmdb-agent-cli"
chmod +x "$PACKAGE_DIR/cmdb-agent" "$PACKAGE_DIR/cmdb-agent-cli"

# Copy configuration
echo "📋 Copying configuration..."
cp config.example.yaml "$PACKAGE_DIR/config.yaml"

# Copy scripts
echo "📋 Copying installation scripts..."
cat > "$PACKAGE_DIR/install.sh" << 'EOFINSTALL'
#!/bin/bash
set -e

echo "Installing CMDB Agent for macOS..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo"
    exit 1
fi

INSTALL_DIR="/usr/local/cmdb-agent"
BIN_DIR="/usr/local/bin"
CONFIG_DIR="/usr/local/etc/cmdb-agent"
DATA_DIR="/usr/local/var/cmdb-agent"
LOG_DIR="/usr/local/var/log/cmdb-agent"

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

# Install LaunchDaemon
cp LaunchDaemons/com.cmdb.agent.plist /Library/LaunchDaemons/
chmod 644 /Library/LaunchDaemons/com.cmdb.agent.plist
chown root:wheel /Library/LaunchDaemons/com.cmdb.agent.plist

# Load and start service
launchctl load /Library/LaunchDaemons/com.cmdb.agent.plist
launchctl start com.cmdb.agent

echo ""
echo "✅ CMDB Agent installed successfully!"
echo ""
echo "Service status:"
launchctl list | grep cmdb || echo "Service not found in launchctl list"
echo ""
echo "Configuration: $CONFIG_DIR/config.yaml"
echo "Logs: $LOG_DIR/agent.log"
echo "Data: $DATA_DIR"
echo ""
echo "Useful commands:"
echo "  sudo launchctl start com.cmdb.agent"
echo "  sudo launchctl stop com.cmdb.agent"
echo "  sudo launchctl unload /Library/LaunchDaemons/com.cmdb.agent.plist"
echo "  cmdb-agent-cli status"
echo "  cmdb-agent-cli inventory list"
echo "  tail -f $LOG_DIR/agent.log"
EOFINSTALL

chmod +x "$PACKAGE_DIR/install.sh"

# Uninstall script
cat > "$PACKAGE_DIR/uninstall.sh" << 'EOFUNINSTALL'
#!/bin/bash
set -e

echo "Uninstalling CMDB Agent..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo"
    exit 1
fi

# Stop and unload service
launchctl stop com.cmdb.agent || true
launchctl unload /Library/LaunchDaemons/com.cmdb.agent.plist || true
rm -f /Library/LaunchDaemons/com.cmdb.agent.plist

# Remove binaries
rm -f /usr/local/bin/cmdb-agent
rm -f /usr/local/bin/cmdb-agent-cli

echo ""
echo "✅ CMDB Agent uninstalled"
echo ""
echo "Configuration and data preserved in:"
echo "  /usr/local/etc/cmdb-agent/"
echo "  /usr/local/var/cmdb-agent/"
echo "  /usr/local/var/log/cmdb-agent/"
echo ""
echo "To remove all data, run:"
echo "  sudo rm -rf /usr/local/etc/cmdb-agent /usr/local/var/cmdb-agent /usr/local/var/log/cmdb-agent"
EOFUNINSTALL

chmod +x "$PACKAGE_DIR/uninstall.sh"

# Copy LaunchDaemon plist
echo "📋 Copying LaunchDaemon..."
cat > "$PACKAGE_DIR/LaunchDaemons/com.cmdb.agent.plist" << 'EOFPLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.cmdb.agent</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/cmdb-agent</string>
        <string>--config</string>
        <string>/usr/local/etc/cmdb-agent/config.yaml</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    
    <key>StandardOutPath</key>
    <string>/usr/local/var/log/cmdb-agent/agent.log</string>
    
    <key>StandardErrorPath</key>
    <string>/usr/local/var/log/cmdb-agent/agent.log</string>
    
    <key>WorkingDirectory</key>
    <string>/usr/local/var/cmdb-agent</string>
    
    <key>UserName</key>
    <string>root</string>
    
    <key>GroupName</key>
    <string>wheel</string>
    
    <key>ThrottleInterval</key>
    <integer>30</integer>
</dict>
</plist>
EOFPLIST

# Copy documentation
echo "📋 Copying documentation..."
cp README.md "$PACKAGE_DIR/" || echo "README.md not found, skipping"
[ -f FEATURES.md ] && cp FEATURES.md "$PACKAGE_DIR/docs/"
[ -f WEBUI_GUIDE.md ] && cp WEBUI_GUIDE.md "$PACKAGE_DIR/docs/"
[ -f LICENSE ] && cp LICENSE "$PACKAGE_DIR/"

# Create README
cat > "$PACKAGE_DIR/README_FIRST.txt" << EOF
CMDB Agent for macOS - Quick Start Guide
========================================

Version: ${VERSION}
Architecture: ${ARCH_NAME} (${ARCH})
Built: $(date -u '+%Y-%m-%d %H:%M:%S UTC')

Installation Steps:
-------------------
1. Extract this archive to a temporary location
2. Open Terminal
3. Run: sudo ./install.sh

This will:
- Install binaries to /usr/local/bin/
- Create LaunchDaemon service
- Set up configuration in /usr/local/etc/cmdb-agent/
- Start the agent automatically

Configuration:
--------------
Edit /usr/local/etc/cmdb-agent/config.yaml to customize:
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
sudo launchctl start com.cmdb.agent
sudo launchctl stop com.cmdb.agent
sudo launchctl unload /Library/LaunchDaemons/com.cmdb.agent.plist
sudo launchctl load /Library/LaunchDaemons/com.cmdb.agent.plist

# Agent CLI
cmdb-agent-cli status
cmdb-agent-cli inventory list
cmdb-agent-cli test connection

# View logs
tail -f /usr/local/var/log/cmdb-agent/agent.log

Uninstallation:
---------------
Run: sudo ./uninstall.sh

System Requirements:
--------------------
- macOS 10.15+ (Catalina or later)
- ${ARCH_NAME} processor
- 100 MB RAM minimum
- 50 MB disk space

Compatibility:
--------------
Intel Macs (x86_64): Use amd64 package
Apple Silicon (M1/M2/M3): Use arm64 package

Support:
--------
GitHub: https://github.com/Raghavendra198902/iac
Issues: https://github.com/Raghavendra198902/iac/issues
EOF

# Create checksums
echo "🔐 Generating checksums..."
cd "$PACKAGE_DIR"
shasum -a 256 cmdb-agent > checksums.txt
shasum -a 256 cmdb-agent-cli >> checksums.txt
cd - > /dev/null

# Create tar.gz archive
echo "🗜️  Creating archive..."
cd "$OUTPUT_DIR"
tar czf "${PACKAGE_NAME}.tar.gz" "$PACKAGE_NAME"
cd - > /dev/null

# Create checksum for archive
cd "$OUTPUT_DIR"
shasum -a 256 "${PACKAGE_NAME}.tar.gz" > "${PACKAGE_NAME}.tar.gz.sha256"
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
