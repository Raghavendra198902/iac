#!/bin/bash
set -e

VERSION=${1:-1.0.0}
ARCH=${2:-amd64}

echo "Building DEB package for cmdb-agent v${VERSION}"

# Build binary
./build.sh ${VERSION}

# Create package structure
PKG_DIR="dist/cmdb-agent-${VERSION}-${ARCH}"
mkdir -p ${PKG_DIR}/DEBIAN
mkdir -p ${PKG_DIR}/usr/local/bin
mkdir -p ${PKG_DIR}/etc/cmdb-agent
mkdir -p ${PKG_DIR}/var/lib/cmdb-agent
mkdir -p ${PKG_DIR}/lib/systemd/system

# Copy files
cp dist/cmdb-agent-linux-${ARCH} ${PKG_DIR}/usr/local/bin/cmdb-agent
cp dist/cmdb-agent-cli-linux-${ARCH} ${PKG_DIR}/usr/local/bin/cmdb-agent-cli
cp config.example.yaml ${PKG_DIR}/etc/cmdb-agent/config.yaml
cp systemd/cmdb-agent.service ${PKG_DIR}/lib/systemd/system/

chmod +x ${PKG_DIR}/usr/local/bin/*

# Create control file
cat > ${PKG_DIR}/DEBIAN/control <<EOF
Package: cmdb-agent
Version: ${VERSION}
Section: admin
Priority: optional
Architecture: ${ARCH}
Maintainer: CMDB Team <cmdb@example.com>
Description: Unified CMDB Agent
 Lightweight, cross-platform endpoint agent for collecting
 configuration items, telemetry, and enforcing policies.
Homepage: https://github.com/iac/cmdb-agent
EOF

# Create postinst script
cat > ${PKG_DIR}/DEBIAN/postinst <<'EOF'
#!/bin/bash
set -e

# Create data directory
mkdir -p /var/lib/cmdb-agent
chmod 700 /var/lib/cmdb-agent

# Reload systemd
systemctl daemon-reload

# Enable and start service
systemctl enable cmdb-agent.service
systemctl start cmdb-agent.service

echo "CMDB Agent installed successfully!"
echo "Edit /etc/cmdb-agent/config.yaml and restart the service."
EOF

chmod +x ${PKG_DIR}/DEBIAN/postinst

# Create prerm script
cat > ${PKG_DIR}/DEBIAN/prerm <<'EOF'
#!/bin/bash
set -e

# Stop service
systemctl stop cmdb-agent.service || true
systemctl disable cmdb-agent.service || true
EOF

chmod +x ${PKG_DIR}/DEBIAN/prerm

# Build package
dpkg-deb --build ${PKG_DIR}
mv ${PKG_DIR}.deb dist/cmdb-agent-${VERSION}-${ARCH}.deb

echo "DEB package created: dist/cmdb-agent-${VERSION}-${ARCH}.deb"
