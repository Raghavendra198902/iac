#!/bin/bash
set -e

# Package Windows Agent for Distribution
# Creates a distributable ZIP file with all necessary components

VERSION=${1:-1.0.0}
OUTPUT_DIR="dist/release"
PACKAGE_NAME="cmdb-agent-windows-${VERSION}"
PACKAGE_DIR="${OUTPUT_DIR}/${PACKAGE_NAME}"

echo "📦 Packaging CMDB Agent for Windows v${VERSION}..."
echo ""

# Check if binaries exist
if [ ! -f "dist/cmdb-agent-windows-amd64.exe" ]; then
    echo "❌ Windows binaries not found. Building..."
    make build-windows
fi

# Create package directory
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR/docs"

# Copy binaries
echo "📋 Copying binaries..."
cp dist/cmdb-agent-windows-amd64.exe "$PACKAGE_DIR/cmdb-agent.exe"
cp dist/cmdb-agent-cli-windows-amd64.exe "$PACKAGE_DIR/cmdb-agent-cli.exe"

# Copy configuration
echo "📋 Copying configuration..."
cp config.example.yaml "$PACKAGE_DIR/config.yaml"

# Copy scripts
echo "📋 Copying installation scripts..."
cp install-windows.ps1 "$PACKAGE_DIR/"
cp uninstall-windows.ps1 "$PACKAGE_DIR/"

# Copy documentation
echo "📋 Copying documentation..."
cp README.md "$PACKAGE_DIR/"
cp WINDOWS_BUILD_GUIDE.md "$PACKAGE_DIR/docs/"
cp FEATURES.md "$PACKAGE_DIR/docs/"
cp WEBUI_GUIDE.md "$PACKAGE_DIR/docs/"
cp FLOWCHART.md "$PACKAGE_DIR/docs/"
[ -f LICENSE ] && cp LICENSE "$PACKAGE_DIR/"

# Create README for package
cat > "$PACKAGE_DIR/README_FIRST.txt" << 'EOF'
CMDB Agent for Windows - Quick Start Guide
==========================================

Thank you for downloading CMDB Agent!

Installation Steps:
-------------------
1. Extract this ZIP file to a temporary location
2. Open PowerShell as Administrator
3. Navigate to the extracted folder
4. Run: .\install-windows.ps1

This will:
- Install the agent to C:\Program Files\CMDB Agent\
- Create a Windows service
- Add the agent to your PATH
- Start the service automatically

Configuration:
--------------
Edit config.yaml before installation to customize:
- CMDB server endpoint
- Collection schedules
- Authentication settings
- Web UI settings

After installation, the config file will be at:
C:\Program Files\CMDB Agent\config.yaml

Web UI Access:
--------------
Once installed and started, access the web interface at:
http://localhost:8080

Default credentials:
  Username: admin
  Password: changeme

⚠️ IMPORTANT: Change the default password immediately!

Documentation:
--------------
- README.md - General overview
- docs/WINDOWS_BUILD_GUIDE.md - Detailed Windows instructions
- docs/WEBUI_GUIDE.md - Web UI and API documentation
- docs/FEATURES.md - Complete feature list
- docs/FLOWCHART.md - System architecture diagrams

Quick Commands:
--------------
# Check agent status
cmdb-agent-cli status

# View collected inventory
cmdb-agent-cli inventory list

# Test connectivity
cmdb-agent-cli test connection

# Service management (PowerShell as Admin)
Start-Service CMDBAgent
Stop-Service CMDBAgent
Restart-Service CMDBAgent
Get-Service CMDBAgent

Uninstallation:
---------------
Run (as Administrator):
.\uninstall-windows.ps1

Support:
--------
GitHub: https://github.com/Raghavendra198902/iac
Issues: https://github.com/Raghavendra198902/iac/issues

System Requirements:
--------------------
- Windows Server 2016+ or Windows 10+
- 100 MB RAM minimum
- 50 MB disk space
- Administrator privileges

Version: ${VERSION}
Built: $(date -u '+%Y-%m-%d %H:%M:%S UTC')
EOF

# Create checksums
echo "🔐 Generating checksums..."
cd "$PACKAGE_DIR"
sha256sum cmdb-agent.exe > checksums.txt
sha256sum cmdb-agent-cli.exe >> checksums.txt
cd - > /dev/null

# Create ZIP archive
echo "🗜️  Creating ZIP archive..."
cd "$OUTPUT_DIR"
zip -r "${PACKAGE_NAME}.zip" "$PACKAGE_NAME" > /dev/null
cd - > /dev/null

# Create checksums for ZIP
cd "$OUTPUT_DIR"
sha256sum "${PACKAGE_NAME}.zip" > "${PACKAGE_NAME}.zip.sha256"
cd - > /dev/null

# Display results
echo ""
echo "✅ Package created successfully!"
echo ""
echo "📦 Package: ${OUTPUT_DIR}/${PACKAGE_NAME}.zip"
echo "📊 Size: $(du -h "${OUTPUT_DIR}/${PACKAGE_NAME}.zip" | cut -f1)"
echo "🔐 Checksum: ${OUTPUT_DIR}/${PACKAGE_NAME}.zip.sha256"
echo ""
echo "Contents:"
find "$PACKAGE_DIR" -type f | sed "s|$PACKAGE_DIR/|  - |"
echo ""
echo "Distribution instructions:"
echo "1. Upload ${PACKAGE_NAME}.zip to your distribution server"
echo "2. Upload ${PACKAGE_NAME}.zip.sha256 for integrity verification"
echo "3. Update download links in your documentation"
echo ""
echo "Installation command for end users:"
echo "  1. Download and extract ${PACKAGE_NAME}.zip"
echo "  2. Open PowerShell as Administrator"
echo "  3. cd to extracted folder"
echo "  4. Run: .\\install-windows.ps1"
