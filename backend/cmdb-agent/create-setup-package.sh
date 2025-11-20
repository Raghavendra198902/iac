#!/bin/bash
# Create Windows installer package (ZIP file with PowerShell installer)

set -e

echo "======================================"
echo "Creating CMDB Agent Setup Package"
echo "======================================"
echo ""

VERSION="1.0.0"
PACKAGE_NAME="cmdb-agent-setup-${VERSION}"
DIST_DIR="dist"
PACKAGE_DIR="${DIST_DIR}/${PACKAGE_NAME}"

# Clean and create package directory
echo "Preparing package directory..."
rm -rf "${PACKAGE_DIR}"
mkdir -p "${PACKAGE_DIR}"

# Copy executable
echo "Adding executable..."
cp "${DIST_DIR}/cmdb-agent-win.exe" "${PACKAGE_DIR}/"

# Copy installer script
echo "Adding installer script..."
cp install.ps1 "${PACKAGE_DIR}/"

# Copy documentation
echo "Adding documentation..."
if [ -f "README.md" ]; then
    cp README.md "${PACKAGE_DIR}/"
fi

if [ -f "LICENSE" ]; then
    cp LICENSE "${PACKAGE_DIR}/"
fi

# Create example config
echo "Adding example configuration..."
cat > "${PACKAGE_DIR}/config.example.json" << 'EOF'
{
  "apiUrl": "http://localhost:3000/api/cmdb",
  "apiKey": "your-api-key-here",
  "agentId": "agent-hostname",
  "agentName": "My Server",
  "syncInterval": 300000,
  "discoveryInterval": 3600000,
  "logLevel": "info"
}
EOF

# Create README for package
echo "Creating package README..."
cat > "${PACKAGE_DIR}/README.txt" << 'EOF'
CMDB Agent Setup Package
========================

Installation Instructions:
--------------------------

1. Right-click PowerShell and select "Run as Administrator"

2. Navigate to this directory:
   cd "C:\path\to\cmdb-agent-setup-1.0.0"

3. Run the installer:
   PowerShell -ExecutionPolicy Bypass -File install.ps1

4. Follow the prompts to configure your API URL and API Key

5. The agent will be installed to: C:\Program Files\CMDB Agent

What's Included:
----------------
- cmdb-agent-win.exe  - The CMDB Agent executable
- install.ps1         - PowerShell installation script
- config.example.json - Example configuration file
- README.txt          - This file
- LICENSE             - License information

Post-Installation:
------------------
- Start Menu: CMDB Agent > CMDB Agent
- Configuration: C:\Program Files\CMDB Agent\config.json
- Logs: C:\Program Files\CMDB Agent\logs\

Manual Installation (without installer):
-----------------------------------------
1. Copy cmdb-agent-win.exe to your desired location
2. Create config.json in the same directory
3. Run: cmdb-agent-win.exe

For support: https://github.com/yourusername/iac-dharma
EOF

# Create ZIP archive
echo ""
echo "Creating ZIP archive..."
cd "${DIST_DIR}"
zip -r "${PACKAGE_NAME}.zip" "${PACKAGE_NAME}/"
cd ..

# Create checksum
echo "Generating checksums..."
cd "${DIST_DIR}"
sha256sum "${PACKAGE_NAME}.zip" > "${PACKAGE_NAME}.zip.sha256"
cd ..

# Clean up temporary directory
rm -rf "${PACKAGE_DIR}"

# Display results
echo ""
echo "======================================"
echo "Setup package created successfully!"
echo "======================================"
echo ""
echo "Package: ${DIST_DIR}/${PACKAGE_NAME}.zip"
echo "Size: $(du -h "${DIST_DIR}/${PACKAGE_NAME}.zip" | cut -f1)"
echo "SHA256: ${DIST_DIR}/${PACKAGE_NAME}.zip.sha256"
echo ""
echo "To distribute:"
echo "1. Upload ${PACKAGE_NAME}.zip to your server"
echo "2. Users download and extract the ZIP"
echo "3. Run install.ps1 as Administrator"
echo ""
ls -lh "${DIST_DIR}/${PACKAGE_NAME}.zip"
cat "${DIST_DIR}/${PACKAGE_NAME}.zip.sha256"
