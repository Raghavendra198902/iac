#!/bin/bash
# Build all platform packages for CMDB Agent distribution

set -e

VERSION=${1:-"1.0.0"}
BUILD_DIR="dist/packages"

echo "════════════════════════════════════════════════════════════"
echo "  Building All Platform Packages - Version $VERSION"
echo "════════════════════════════════════════════════════════════"

# Create build directory
mkdir -p "$BUILD_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Build Node.js application
echo -e "\n${YELLOW}[1/6]${NC} Building Node.js application..."
npm run build
echo -e "${GREEN}✓${NC} Node.js build complete"

# Build Windows MSI
echo -e "\n${YELLOW}[2/6]${NC} Building Windows MSI installer..."
if command -v candle.exe &> /dev/null; then
    ./build-msi.ps1 -Version "$VERSION"
    mv dist/installers/*.msi "$BUILD_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Windows MSI created"
else
    echo -e "${RED}⚠${NC} WiX Toolset not found, skipping MSI build"
    echo "   Install from: https://wixtoolset.org/"
fi

# Build macOS PKG
echo -e "\n${YELLOW}[3/6]${NC} Building macOS PKG installer..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    ./build-macos-pkg.sh "$VERSION"
    mv dist/*.pkg "$BUILD_DIR/" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} macOS PKG created"
else
    echo -e "${RED}⚠${NC} macOS build requires macOS system"
fi

# Build Linux DEB package
echo -e "\n${YELLOW}[4/6]${NC} Building Linux DEB package..."
./build-deb.sh "$VERSION"
mv dist/*.deb "$BUILD_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Linux DEB created"

# Build Linux RPM package
echo -e "\n${YELLOW}[5/6]${NC} Building Linux RPM package..."
./build-rpm.sh "$VERSION"
mv ~/rpmbuild/RPMS/*/*.rpm "$BUILD_DIR/" 2>/dev/null || true
echo -e "${GREEN}✓${NC} Linux RPM created"

# Build standalone executables
echo -e "\n${YELLOW}[6/6]${NC} Building standalone executables..."
npm run build:exe     # Windows .exe
npm run build:linux   # Linux binary
npm run build:macos   # macOS binary

# Copy executables
cp dist/cmdb-agent-win.exe "$BUILD_DIR/cmdb-agent-${VERSION}-win-x64.exe" 2>/dev/null || true
cp dist/cmdb-agent-linux "$BUILD_DIR/cmdb-agent-${VERSION}-linux-x64" 2>/dev/null || true
cp dist/cmdb-agent-macos "$BUILD_DIR/cmdb-agent-${VERSION}-macos-x64" 2>/dev/null || true

echo -e "${GREEN}✓${NC} Standalone executables created"

# Generate checksums
echo -e "\n${YELLOW}Generating checksums...${NC}"
cd "$BUILD_DIR"
sha256sum * > SHA256SUMS.txt 2>/dev/null || shasum -a 256 * > SHA256SUMS.txt
cd - > /dev/null

# Generate release notes
cat > "$BUILD_DIR/RELEASE_NOTES.md" << EOF
# CMDB Agent v${VERSION}

**Release Date:** $(date +%Y-%m-%d)

## 📦 Downloads

### Windows
- **MSI Installer**: \`CMDBAgent-${VERSION}-x64.msi\` (Recommended)
- **Standalone EXE**: \`cmdb-agent-${VERSION}-win-x64.exe\`

### macOS
- **PKG Installer**: \`CMDBAgent-${VERSION}.pkg\` (Recommended)
- **Standalone Binary**: \`cmdb-agent-${VERSION}-macos-x64\`

### Linux
- **DEB Package** (Debian/Ubuntu): \`cmdb-agent_${VERSION}_amd64.deb\`
- **RPM Package** (RHEL/CentOS/Fedora): \`cmdb-agent-${VERSION}-1.x86_64.rpm\`
- **Standalone Binary**: \`cmdb-agent-${VERSION}-linux-x64\`

## 🔐 Checksum Verification

All packages include SHA-256 checksums in \`SHA256SUMS.txt\`.

Verify downloads:
\`\`\`bash
# Windows (PowerShell)
Get-FileHash CMDBAgent-${VERSION}-x64.msi -Algorithm SHA256

# Linux/macOS
sha256sum cmdb-agent_${VERSION}_amd64.deb
\`\`\`

## ✨ What's New

- Multi-platform agent support (Windows, Linux, macOS, Android, iOS)
- Auto-update system with web-based management
- Monitoring and enforcement policies
- IaC deployment support (Terraform, Ansible)
- Platform-specific installers (MSI, PKG, DEB, RPM)

## 📖 Installation

### Windows
\`\`\`powershell
msiexec /i CMDBAgent-${VERSION}-x64.msi
\`\`\`

### macOS
\`\`\`bash
sudo installer -pkg CMDBAgent-${VERSION}.pkg -target /
\`\`\`

### Linux (Debian/Ubuntu)
\`\`\`bash
sudo dpkg -i cmdb-agent_${VERSION}_amd64.deb
\`\`\`

### Linux (RHEL/CentOS/Fedora)
\`\`\`bash
sudo rpm -ivh cmdb-agent-${VERSION}-1.x86_64.rpm
\`\`\`

## 🔧 Configuration

After installation, configure the agent:

\`\`\`bash
# Set CMDB server URL
export CMDB_SERVER_URL="https://your-cmdb-server.com"

# Set API key
export CMDB_API_KEY="your-api-key"

# Enable auto-update
export AUTO_UPDATE=true

# Start service
sudo systemctl start cmdb-agent  # Linux
net start "IAC Dharma CMDB Agent"  # Windows
\`\`\`

## 📊 System Requirements

- **Windows**: Windows 7/8/10/11, Server 2012+
- **macOS**: macOS 10.13 (High Sierra) or later
- **Linux**: Ubuntu 18.04+, Debian 10+, RHEL/CentOS 7+, Fedora 30+
- **Memory**: 128 MB RAM minimum
- **Disk**: 100 MB free space
- **Network**: HTTPS access to CMDB server

## 🆘 Support

- Documentation: https://docs.iacdharma.com
- Issues: https://github.com/iacdharma/cmdb-agent/issues
- Email: support@iacdharma.com

---

**Full Changelog**: https://github.com/iacdharma/cmdb-agent/compare/v0.9.0...v${VERSION}
EOF

# Summary
echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}✓ Build Complete!${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📦 Packages created in: $BUILD_DIR"
echo ""
ls -lh "$BUILD_DIR"
echo ""
echo "📝 Release notes: $BUILD_DIR/RELEASE_NOTES.md"
echo "🔐 Checksums: $BUILD_DIR/SHA256SUMS.txt"
echo ""
echo "Next steps:"
echo "  1. Test packages on target platforms"
echo "  2. Upload to CMDB server: POST /api/updates/upload"
echo "  3. Update download page"
echo "  4. Announce release"
echo ""
