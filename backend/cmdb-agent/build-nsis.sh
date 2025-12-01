#!/bin/bash

# Build NSIS Windows Installer on Linux
# Creates: SystemMonitor-Setup.exe

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║     🔨 Building Windows Installer with NSIS on Linux        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check NSIS is installed
if ! command -v makensis &> /dev/null; then
    echo "❌ NSIS not found!"
    echo "Install with: sudo apt install nsis"
    exit 1
fi

echo "✅ NSIS found: $(makensis -VERSION)"
echo ""

# Create dist directory
mkdir -p dist

# Check required files
echo "📋 Checking required files..."
REQUIRED_FILES=(
    "system-monitor.ps1"
    "system-monitor.bat"
    "README.md"
    "system-monitor.nsi"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        exit 1
    fi
    echo "   ✅ $file"
done
echo ""

# Build installer
echo "🔨 Building installer..."
echo ""
makensis -V3 system-monitor.nsi
echo ""

# Check output
if [ -f "dist/SystemMonitor-Setup.exe" ]; then
    SIZE=$(stat -c%s "dist/SystemMonitor-Setup.exe")
    SIZE_KB=$((SIZE / 1024))
    echo "✅ Build successful!"
    echo ""
    echo "📦 Output:"
    echo "   File: dist/SystemMonitor-Setup.exe"
    echo "   Size: ${SIZE_KB} KB"
    echo ""
    
    # Generate checksums
    echo "🔐 Generating checksums..."
    cd dist
    sha256sum SystemMonitor-Setup.exe > SystemMonitor-Setup.exe.sha256
    md5sum SystemMonitor-Setup.exe > SystemMonitor-Setup.exe.md5
    cd ..
    
    echo "   SHA256: $(cat dist/SystemMonitor-Setup.exe.sha256 | cut -d' ' -f1)"
    echo "   MD5: $(cat dist/SystemMonitor-Setup.exe.md5 | cut -d' ' -f1)"
    echo ""
    
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                                                              ║"
    echo "║                  ✅ BUILD COMPLETE! ✅                       ║"
    echo "║                                                              ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📥 Transfer to Windows:"
    echo "   scp dist/SystemMonitor-Setup.exe user@windows-pc:"
    echo ""
    echo "💻 Or download from:"
    echo "   cd dist && python3 -m http.server 8080"
    echo "   http://192.168.1.9:8080/SystemMonitor-Setup.exe"
    echo ""
    echo "🚀 Install on Windows:"
    echo "   Double-click: SystemMonitor-Setup.exe"
    echo ""
else
    echo "❌ Build failed!"
    exit 1
fi
