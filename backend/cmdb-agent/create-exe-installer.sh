#!/bin/bash
# Create self-extracting EXE installer using makeself

set -e

echo "======================================"
echo "Creating Self-Extracting EXE Installer"
echo "======================================"
echo ""

VERSION="1.0.0"
PACKAGE_NAME="cmdb-agent-setup-${VERSION}"
DIST_DIR="dist"
TEMP_DIR="${DIST_DIR}/temp-installer"

# Install makeself if not available
if ! command -v makeself &> /dev/null; then
    echo "Installing makeself..."
    sudo apt-get update && sudo apt-get install -y makeself
fi

# Clean and create temporary directory
echo "Preparing installer contents..."
rm -rf "${TEMP_DIR}"
mkdir -p "${TEMP_DIR}"

# Copy Windows executable
cp "${DIST_DIR}/cmdb-agent-win.exe" "${TEMP_DIR}/"

# Copy installer script
cp install.ps1 "${TEMP_DIR}/"

# Copy documentation
[ -f "README.md" ] && cp README.md "${TEMP_DIR}/"
[ -f "LICENSE" ] && cp LICENSE "${TEMP_DIR}/"

# Create example config
cat > "${TEMP_DIR}/config.example.json" << 'EOF'
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

# Create Windows batch installer
cat > "${TEMP_DIR}/install.bat" << 'EOF'
@echo off
echo ======================================
echo CMDB Agent Windows Installer
echo ======================================
echo.
echo This installer requires PowerShell.
echo.
pause

PowerShell -ExecutionPolicy Bypass -File install.ps1

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Installation completed successfully!
) else (
    echo.
    echo Installation failed. Please check the error messages above.
)
pause
EOF

# Create README
cat > "${TEMP_DIR}/INSTALL.txt" << 'EOF'
CMDB Agent Installer
====================

Quick Start:
-----------
1. Double-click: install.bat
2. Follow the prompts
3. Enter your CMDB API URL and API Key

OR

1. Right-click PowerShell as Administrator
2. Run: PowerShell -ExecutionPolicy Bypass -File install.ps1

Manual Installation:
-------------------
1. Copy cmdb-agent-win.exe to C:\Program Files\CMDB Agent\
2. Create config.json in the same directory
3. Run cmdb-agent-win.exe

Files Included:
--------------
- cmdb-agent-win.exe  - Main executable
- install.ps1         - PowerShell installer
- install.bat         - Batch installer wrapper
- config.example.json - Example configuration
- INSTALL.txt         - This file

For more information, see README.md
EOF

# Create Linux installer script for the archive
cat > "${TEMP_DIR}/setup.sh" << 'EOF'
#!/bin/bash
# CMDB Agent Self-Extracting Installer

echo "======================================"
echo "CMDB Agent Installer"
echo "======================================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    echo "Windows detected. Running PowerShell installer..."
    powershell.exe -ExecutionPolicy Bypass -File install.ps1
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "ERROR: This package is for Windows only."
    echo "For Linux, use: cmdb-agent-linux executable"
    exit 1
else
    echo "ERROR: Unsupported operating system: $OSTYPE"
    exit 1
fi
EOF

chmod +x "${TEMP_DIR}/setup.sh"

# Create the self-extracting archive
echo ""
echo "Creating self-extracting installer..."

makeself \
    --notemp \
    --license LICENSE \
    "${TEMP_DIR}" \
    "${DIST_DIR}/${PACKAGE_NAME}.run" \
    "CMDB Agent ${VERSION} Installer" \
    ./setup.sh

# Make it executable
chmod +x "${DIST_DIR}/${PACKAGE_NAME}.run"

# Create Windows-compatible self-extracting EXE using 7z
if command -v 7z &> /dev/null; then
    echo ""
    echo "Creating Windows self-extracting EXE..."
    
    # Create 7z archive
    7z a -t7z "${DIST_DIR}/${PACKAGE_NAME}.7z" "${TEMP_DIR}/*" -mx=9
    
    # Create self-extracting archive (if 7z SFX module available)
    if [ -f "/usr/lib/p7zip/7zCon.sfx" ]; then
        cat /usr/lib/p7zip/7zCon.sfx "${DIST_DIR}/${PACKAGE_NAME}.7z" > "${DIST_DIR}/${PACKAGE_NAME}.exe"
        
        # Create config for SFX
        cat > "${DIST_DIR}/config.txt" << 'EOF'
;!@Install@!UTF-8!
Title="CMDB Agent Installer"
BeginPrompt="This will install CMDB Agent.\n\nClick OK to continue."
RunProgram="install.bat"
;!@InstallEnd@!
EOF
        
        # Append config to EXE
        cat "${DIST_DIR}/config.txt" >> "${DIST_DIR}/${PACKAGE_NAME}.exe"
        rm "${DIST_DIR}/config.txt" "${DIST_DIR}/${PACKAGE_NAME}.7z"
        
        echo "  Created: ${PACKAGE_NAME}.exe"
    else
        echo "  7z SFX module not found, created 7z archive instead"
    fi
fi

# Clean up
rm -rf "${TEMP_DIR}"

# Generate checksums
echo ""
echo "Generating checksums..."
cd "${DIST_DIR}"
sha256sum *.run *.exe 2>/dev/null > installers.sha256 || true
cd ..

echo ""
echo "======================================"
echo "Installers created successfully!"
echo "======================================"
echo ""
ls -lh "${DIST_DIR}"/*.run "${DIST_DIR}"/*.exe 2>/dev/null || true
echo ""
cat "${DIST_DIR}/installers.sha256" 2>/dev/null || true
