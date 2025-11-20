#!/bin/bash

###############################################################################
# CMDB Agent - Complete Build and Package Script
# Builds standalone executables and GUI installer packages
###############################################################################

set -e  # Exit on error

echo "════════════════════════════════════════════════════════════════"
echo "  CMDB Enterprise Agent - Complete Build Script"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DIST_DIR="$PROJECT_DIR/dist"
INSTALLER_DIST="$PROJECT_DIR/dist-installer"
PACKAGES_DIR="$PROJECT_DIR/dist-packages"
VERSION="1.0.0"

echo "Project Directory: $PROJECT_DIR"
echo "Version: $VERSION"
echo ""

# Step 1: Clean previous builds
echo -e "${YELLOW}[1/6]${NC} Cleaning previous builds..."
rm -rf "$DIST_DIR"
rm -rf "$INSTALLER_DIST"
rm -rf "$PACKAGES_DIR"
mkdir -p "$DIST_DIR"
mkdir -p "$INSTALLER_DIST"
mkdir -p "$PACKAGES_DIR"
echo -e "${GREEN}✓${NC} Cleaned"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}[2/6]${NC} Installing dependencies..."
npm install
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Step 3: Build TypeScript
echo -e "${YELLOW}[3/6]${NC} Building TypeScript..."
npm run build
echo -e "${GREEN}✓${NC} TypeScript compiled"
echo ""

# Step 4: Build standalone executables
echo -e "${YELLOW}[4/6]${NC} Building standalone executables..."

if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
  echo "  → Building Linux executable..."
  npm run build:linux
  
  if [ -f "$DIST_DIR/cmdb-agent-linux" ]; then
    SIZE=$(du -h "$DIST_DIR/cmdb-agent-linux" | cut -f1)
    echo -e "    ${GREEN}✓${NC} Linux executable built ($SIZE)"
  fi
fi

if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
  echo "  → Building Windows executable..."
  npm run build:exe
  
  if [ -f "$DIST_DIR/cmdb-agent-win.exe" ]; then
    SIZE=$(du -h "$DIST_DIR/cmdb-agent-win.exe" | cut -f1)
    echo -e "    ${GREEN}✓${NC} Windows executable built ($SIZE)"
  fi
fi

echo -e "${GREEN}✓${NC} Standalone executables built"
echo ""

# Step 5: Build GUI Installer (Electron)
echo -e "${YELLOW}[5/6]${NC} Building GUI Installer..."

# Check if Electron dependencies installed
if [ ! -d "node_modules/electron" ]; then
  echo "  → Installing Electron dependencies..."
  npm install electron electron-builder --save-dev
fi

echo "  → Compiling installer TypeScript..."
npx tsc -p tsconfig.installer.json

if [ $? -eq 0 ]; then
  echo -e "    ${GREEN}✓${NC} Installer TypeScript compiled"
else
  echo -e "    ${RED}✗${NC} Installer compilation failed"
  exit 1
fi

echo "  → Building installer packages with Electron Builder..."
npx electron-builder --config electron-builder.json

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓${NC} GUI Installer built"
else
  echo -e "${YELLOW}⚠${NC} GUI Installer build skipped (platform not supported)"
fi
echo ""

# Step 6: Generate SHA256 checksums
echo -e "${YELLOW}[6/6]${NC} Generating SHA256 checksums..."

cd "$DIST_DIR"
if [ -f "cmdb-agent-win.exe" ]; then
  sha256sum cmdb-agent-win.exe > cmdb-agent-win.exe.sha256
  echo "  ✓ Windows executable checksum"
fi

if [ -f "cmdb-agent-linux" ]; then
  sha256sum cmdb-agent-linux > cmdb-agent-linux.sha256
  echo "  ✓ Linux executable checksum"
fi

cd "$PROJECT_DIR"
echo -e "${GREEN}✓${NC} Checksums generated"
echo ""

# Summary
echo "════════════════════════════════════════════════════════════════"
echo -e "${GREEN}  Build Complete!${NC}"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Output files:"
echo ""

if [ -f "$DIST_DIR/cmdb-agent-win.exe" ]; then
  SIZE=$(du -h "$DIST_DIR/cmdb-agent-win.exe" | cut -f1)
  echo "  📦 Windows Standalone:  $DIST_DIR/cmdb-agent-win.exe ($SIZE)"
fi

if [ -f "$DIST_DIR/cmdb-agent-linux" ]; then
  SIZE=$(du -h "$DIST_DIR/cmdb-agent-linux" | cut -f1)
  echo "  📦 Linux Standalone:    $DIST_DIR/cmdb-agent-linux ($SIZE)"
fi

if [ -d "$PACKAGES_DIR" ] && [ "$(ls -A $PACKAGES_DIR)" ]; then
  echo ""
  echo "  GUI Installers:"
  ls -lh "$PACKAGES_DIR" | grep -v '^total' | awk '{print "    🎁 " $9 " (" $5 ")"}'
fi

echo ""
echo "Next steps:"
echo "  1. Test executables:     ./dist/cmdb-agent-linux"
echo "  2. Install service:      sudo node dist/service-installer.js install"
echo "  3. Run GUI installer:    ./dist-packages/*.AppImage"
echo ""
