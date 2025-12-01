#!/bin/bash
# Build Windows Service on Linux using Docker
# This builds a self-contained Windows executable on Linux

set -e

VERSION=${1:-"1.0.0"}

echo "========================================"
echo "  Building CMDB Agent Windows Service  "
echo "  Version: $VERSION                    "
echo "  Platform: Linux → Windows            "
echo "========================================"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker is required to build Windows binaries on Linux"
    echo "Please install Docker first"
    exit 1
fi

echo "✅ Docker found"
echo ""

# Create output directory
DIST_DIR="../dist/windows-service"
mkdir -p "$DIST_DIR"

echo "🐳 Building using .NET SDK Docker container..."
echo ""

# Build using Microsoft .NET SDK Docker image
docker run --rm \
    -v "$(pwd):/src" \
    -w /src \
    mcr.microsoft.com/dotnet/sdk:6.0 \
    bash -c "
        echo '📦 Restoring NuGet packages...' && \
        dotnet restore && \
        echo '🔨 Building Windows Service...' && \
        dotnet publish -c Release -r win-x64 --self-contained true \
            -p:PublishSingleFile=true \
            -p:Version=$VERSION \
            -p:IncludeNativeLibrariesForSelfExtract=true \
            -p:PublishReadyToRun=true \
            -o /src/bin/output
    "

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo "📦 Copying build artifacts..."

# Copy executable and config
cp bin/output/CMDBAgentService.exe "$DIST_DIR/"
cp config.json "$DIST_DIR/"
cp install-service.ps1 "$DIST_DIR/"
cp uninstall-service.ps1 "$DIST_DIR/"
cp README.md "$DIST_DIR/"

# Get file size
FILE_SIZE=$(du -h "$DIST_DIR/CMDBAgentService.exe" | cut -f1)

# Clean up build artifacts
rm -rf bin obj

echo ""
echo "========================================"
echo "         ✅ BUILD SUCCESSFUL!           "
echo "========================================"
echo ""
echo "Output:"
echo "  Location: $DIST_DIR"
echo "  Executable: CMDBAgentService.exe ($FILE_SIZE)"
echo "  Config: config.json"
echo ""
echo "Files ready for Windows installation:"
echo "  - CMDBAgentService.exe (Windows Service)"
echo "  - install-service.ps1 (Installer)"
echo "  - uninstall-service.ps1 (Uninstaller)"
echo "  - config.json (Configuration)"
echo ""
echo "Transfer these files to a Windows machine and run:"
echo "  .\install-service.ps1"
echo ""
