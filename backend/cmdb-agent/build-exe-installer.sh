#!/bin/bash
# Build Windows EXE Installer on Linux using NSIS
# This creates a real Windows .exe that can be run on any Windows machine

set -e

echo "============================================"
echo "   CMDB Agent EXE Installer Builder"
echo "============================================"
echo ""

# Configuration
VERSION="${1:-1.0.0}"
OUTPUT_FILE="CMDBAgent-Setup-${VERSION}.exe"

echo "Building version: $VERSION"
echo ""

# Check if NSIS is installed
if ! command -v makensis &> /dev/null; then
    echo "❌ ERROR: NSIS (Nullsoft Scriptable Install System) not found!"
    echo ""
    echo "To install NSIS on Ubuntu/Debian:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y nsis"
    echo ""
    echo "To install on other systems:"
    echo "  Fedora/RHEL: sudo dnf install nsis"
    echo "  Arch: sudo pacman -S nsis"
    echo "  macOS: brew install nsis"
    echo ""
    exit 1
fi

echo "✅ NSIS found: $(which makensis)"
echo ""

# Create dist directory
mkdir -p dist

# Create a simple LICENSE file if it doesn't exist
if [ ! -f LICENSE.txt ]; then
    cat > LICENSE.txt << 'EOF'
MIT License

Copyright (c) 2025 IAC Dharma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF
    echo "✅ Created LICENSE.txt"
fi

# Update version in NSI script
if [ -f cmdb-agent-installer.nsi ]; then
    sed "s/OutFile \"dist\/CMDBAgent-Setup-1.0.0.exe\"/OutFile \"dist\/${OUTPUT_FILE}\"/" cmdb-agent-installer.nsi > temp-installer.nsi
    sed -i "s/VIProductVersion \"1.0.0.0\"/VIProductVersion \"${VERSION}.0\"/" temp-installer.nsi
    sed -i "s/$$version = '1.0.0'/$$version = '${VERSION}'/" temp-installer.nsi
    sed -i "s/WriteRegStr HKLM \"Software\\\\IAC Dharma\\\\CMDB Agent\" \"Version\" \"1.0.0\"/WriteRegStr HKLM \"Software\\\\IAC Dharma\\\\CMDB Agent\" \"Version\" \"${VERSION}\"/" temp-installer.nsi
    sed -i "s/DisplayVersion\" \"1.0.0\"/DisplayVersion\" \"${VERSION}\"/" temp-installer.nsi
    sed -i "s/CMDB Agent v1.0.0/CMDB Agent v${VERSION}/" temp-installer.nsi
else
    echo "❌ ERROR: cmdb-agent-installer.nsi not found!"
    exit 1
fi

echo "🔧 Building EXE with NSIS..."
echo ""

# Build the installer
makensis -V3 temp-installer.nsi

if [ $? -eq 0 ]; then
    # Cleanup
    rm temp-installer.nsi
    
    # Get file size
    FILE_SIZE=$(du -h "dist/${OUTPUT_FILE}" | cut -f1)
    
    # Generate SHA-256 checksum
    echo ""
    echo "🔐 Generating SHA-256 checksum..."
    sha256sum "dist/${OUTPUT_FILE}" > "dist/${OUTPUT_FILE}.sha256"
    CHECKSUM=$(cat "dist/${OUTPUT_FILE}.sha256" | cut -d' ' -f1)
    
    echo ""
    echo "============================================"
    echo "   ✅ BUILD COMPLETE!"
    echo "============================================"
    echo ""
    echo "📦 EXE Installer: dist/${OUTPUT_FILE}"
    echo "📊 Size: ${FILE_SIZE}"
    echo "🔐 SHA-256: ${CHECKSUM}"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Copy to Windows machine"
    echo "   2. Run: ${OUTPUT_FILE}"
    echo "   3. Follow installation wizard"
    echo ""
    echo "   Or upload to server:"
    echo "   cp dist/${OUTPUT_FILE} /home/rrd/iac/frontend/public/downloads/real/"
    echo ""
    echo "============================================"
else
    echo ""
    echo "❌ Build failed!"
    rm temp-installer.nsi
    exit 1
fi
