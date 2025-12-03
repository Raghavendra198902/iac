#!/bin/bash
set -e

# =====================================================
# CMDB Agent MSI Builder for Linux (using Wine)
# =====================================================

VERSION=1.0.0
ARCH=x64
OUTPUT="cmdb-agent-${VERSION}-${ARCH}.msi"
WIX_PATH="${HOME}/wix"

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   CMDB Agent MSI Builder v${VERSION}              ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Check if Wine is installed
if ! command -v wine &> /dev/null; then
    echo "✗ Wine not found!"
    echo ""
    echo "Please install Wine:"
    echo "  sudo apt-get install wine64"
    echo ""
    exit 1
fi

# Check if WiX is downloaded
if [ ! -d "$WIX_PATH" ]; then
    echo "✗ WiX Toolset not found at $WIX_PATH"
    echo ""
    echo "Download and extract WiX:"
    echo "  wget https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311-binaries.zip"
    echo "  unzip wix311-binaries.zip -d ~/wix"
    echo ""
    exit 1
fi

# Check if binaries exist
if [ ! -f "dist/cmdb-agent-windows-amd64.exe" ]; then
    echo "✗ Windows binaries not found!"
    echo ""
    echo "Please build the binaries first:"
    echo "  make build-windows"
    echo ""
    exit 1
fi

# Set Wine environment
export WINEARCH=win64
export WINEPREFIX="${HOME}/.wine64"

echo "[1/3] Compiling WiX source..."
wine "${WIX_PATH}/candle.exe" -arch ${ARCH} cmdb-agent.wxs

echo "[2/3] Linking MSI package..."
wine "${WIX_PATH}/light.exe" -ext WixUIExtension -ext WixUtilExtension -out "${OUTPUT}" cmdb-agent.wixobj -sval

echo "[3/3] Cleaning up..."
rm -f cmdb-agent.wixobj cmdb-agent.wixpdb

echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   ✓ MSI package created successfully!            ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "  File: ${OUTPUT}"
ls -lh "${OUTPUT}"
echo ""

# Calculate SHA256
echo "Calculating checksum..."
sha256sum "${OUTPUT}" > "${OUTPUT}.sha256"
cat "${OUTPUT}.sha256"
echo ""

echo "Installation commands (on Windows):"
echo "  GUI:    msiexec /i ${OUTPUT}"
echo "  Silent: msiexec /i ${OUTPUT} /qn /l*v install.log"
echo ""
