#!/bin/bash
# Build Debian/Ubuntu DEB package for CMDB Agent

set -e

VERSION=${1:-"1.0.0"}
ARCH="amd64"
PKG_NAME="cmdb-agent"
BUILD_DIR="dist/deb-build"

echo "Building DEB package v$VERSION..."

# Clean build directory
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/$PKG_NAME"

# Create directory structure
mkdir -p "$BUILD_DIR/$PKG_NAME/DEBIAN"
mkdir -p "$BUILD_DIR/$PKG_NAME/usr/local/bin"
mkdir -p "$BUILD_DIR/$PKG_NAME/etc/systemd/system"
mkdir -p "$BUILD_DIR/$PKG_NAME/etc/cmdb-agent"

# Build application
npm run build

# Copy binary
cp dist/cmdb-agent-linux "$BUILD_DIR/$PKG_NAME/usr/local/bin/cmdb-agent"
chmod 755 "$BUILD_DIR/$PKG_NAME/usr/local/bin/cmdb-agent"

# Create systemd service file
cat > "$BUILD_DIR/$PKG_NAME/etc/systemd/system/cmdb-agent.service" << 'EOF'
[Unit]
Description=CMDB Agent - Infrastructure Monitoring
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
EnvironmentFile=-/etc/cmdb-agent/environment
WorkingDirectory=/usr/local/bin
ExecStart=/usr/local/bin/cmdb-agent
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create control file
cat > "$BUILD_DIR/$PKG_NAME/DEBIAN/control" << EOF
Package: $PKG_NAME
Version: $VERSION
Section: admin
Priority: optional
Architecture: $ARCH
Depends: nodejs (>= 18.0.0)
Maintainer: IAC Dharma <support@iacdharma.com>
Description: CMDB Agent for infrastructure monitoring
 Monitors system resources and reports to CMDB server.
 Supports auto-update and configuration management.
EOF

# Create postinst script
cat > "$BUILD_DIR/$PKG_NAME/DEBIAN/postinst" << 'EOF'
#!/bin/bash
set -e

systemctl daemon-reload
systemctl enable cmdb-agent
echo "CMDB Agent installed. Configure /etc/cmdb-agent/environment and start with: systemctl start cmdb-agent"
EOF

chmod 755 "$BUILD_DIR/$PKG_NAME/DEBIAN/postinst"

# Create prerm script
cat > "$BUILD_DIR/$PKG_NAME/DEBIAN/prerm" << 'EOF'
#!/bin/bash
set -e

systemctl stop cmdb-agent || true
systemctl disable cmdb-agent || true
EOF

chmod 755 "$BUILD_DIR/$PKG_NAME/DEBIAN/prerm"

# Build package
dpkg-deb --build "$BUILD_DIR/$PKG_NAME"
mv "$BUILD_DIR/$PKG_NAME.deb" "dist/cmdb-agent_${VERSION}_${ARCH}.deb"

echo "✓ DEB package created: dist/cmdb-agent_${VERSION}_${ARCH}.deb"
