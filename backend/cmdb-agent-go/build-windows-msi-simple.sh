#!/bin/bash
set -e

# Alternative MSI Builder using msibuild (msitools)
# This creates a basic MSI without WiX

VERSION=${1:-1.0.0}
OUTPUT_DIR="dist/msi"
MSI_FILE="dist/cmdb-agent-${VERSION}-x64.msi"

echo "Building Windows MSI using msibuild v${VERSION}..."

# Check if msibuild is available
if ! command -v msibuild &> /dev/null; then
    echo "Error: msibuild not found. Install msitools:"
    echo "  sudo apt-get install msitools"
    exit 1
fi

# Build Windows binaries if not exist
if [ ! -f "dist/cmdb-agent-windows-amd64.exe" ]; then
    echo "Building Windows binaries..."
    make build-windows
fi

# Create directory structure
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR/ProgramFiles/CMDB Agent"
mkdir -p "$OUTPUT_DIR/ProgramData"

# Copy files to staging
echo "Staging files..."
cp dist/cmdb-agent-windows-amd64.exe "$OUTPUT_DIR/ProgramFiles/CMDB Agent/cmdb-agent.exe"
cp dist/cmdb-agent-cli-windows-amd64.exe "$OUTPUT_DIR/ProgramFiles/CMDB Agent/cmdb-agent-cli.exe"
cp config.example.yaml "$OUTPUT_DIR/ProgramFiles/CMDB Agent/config.yaml"
cp install-windows.ps1 "$OUTPUT_DIR/ProgramFiles/CMDB Agent/"
cp uninstall-windows.ps1 "$OUTPUT_DIR/ProgramFiles/CMDB Agent/"
cp README.md "$OUTPUT_DIR/ProgramFiles/CMDB Agent/"

# Create MSI database
echo "Creating MSI package..."
msibuild "$MSI_FILE" \
    --set-property ProductName="CMDB Agent" \
    --set-property ProductVersion="$VERSION" \
    --set-property Manufacturer="Infrastructure as Code Platform" \
    --set-property ProductCode="$(uuidgen)" \
    --set-property UpgradeCode="12345678-1234-1234-1234-123456789ABC" \
    --set-property ARPURLINFOABOUT="https://github.com/Raghavendra198902/iac" \
    "$OUTPUT_DIR"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ MSI package created successfully!"
    echo "📦 Output: $MSI_FILE"
    ls -lh "$MSI_FILE"
    echo ""
    echo "Installation:"
    echo "  msiexec /i $(basename $MSI_FILE)"
    echo ""
    echo "Silent installation:"
    echo "  msiexec /i $(basename $MSI_FILE) /qn"
else
    echo ""
    echo "⚠️  MSI creation failed with msibuild"
    echo ""
    echo "RECOMMENDATION: Use the ZIP package instead"
    echo "  $ ./package-windows.sh ${VERSION}"
    echo ""
    echo "The ZIP package provides the same functionality:"
    echo "  ✓ PowerShell installer (install-windows.ps1)"
    echo "  ✓ Service installation"
    echo "  ✓ System PATH integration"
    echo "  ✓ All binaries and documentation"
    echo ""
    exit 1
fi
