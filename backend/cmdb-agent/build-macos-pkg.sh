#!/bin/bash
# Build macOS PKG installer for CMDB Agent

set -e

VERSION=${1:-"1.0.0"}
APP_NAME="CMDB Agent"
IDENTIFIER="com.iacdharma.cmdb-agent"
BUILD_DIR="dist/macos-build"
PKG_ROOT="$BUILD_DIR/pkg_root"

echo "Building macOS PKG installer v$VERSION..."

# Clean build directory
rm -rf "$BUILD_DIR"
mkdir -p "$PKG_ROOT"

# Create directory structure
mkdir -p "$PKG_ROOT/usr/local/bin"
mkdir -p "$PKG_ROOT/Library/LaunchDaemons"
mkdir -p "$PKG_ROOT/etc/cmdb-agent"

# Build application
npm run build

# Copy binary
cp dist/cmdb-agent-macos "$PKG_ROOT/usr/local/bin/cmdb-agent"
chmod +x "$PKG_ROOT/usr/local/bin/cmdb-agent"

# Create LaunchDaemon plist
cat > "$PKG_ROOT/Library/LaunchDaemons/com.iacdharma.cmdb-agent.plist" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.iacdharma.cmdb-agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/cmdb-agent</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/var/log/cmdb-agent.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/cmdb-agent-error.log</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
</dict>
</plist>
EOF

# Create postinstall script
mkdir -p "$BUILD_DIR/scripts"
cat > "$BUILD_DIR/scripts/postinstall" << 'EOF'
#!/bin/bash
set -e

echo "Configuring CMDB Agent..."

# Load LaunchDaemon
launchctl load /Library/LaunchDaemons/com.iacdharma.cmdb-agent.plist

echo "CMDB Agent installed successfully!"
echo "Configure with: sudo nano /etc/cmdb-agent/config.json"
EOF

chmod +x "$BUILD_DIR/scripts/postinstall"

# Build package
pkgbuild \
  --root "$PKG_ROOT" \
  --identifier "$IDENTIFIER" \
  --version "$VERSION" \
  --install-location / \
  --scripts "$BUILD_DIR/scripts" \
  "dist/CMDBAgent-$VERSION.pkg"

echo "✓ macOS PKG created: dist/CMDBAgent-$VERSION.pkg"
