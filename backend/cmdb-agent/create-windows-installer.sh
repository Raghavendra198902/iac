#!/bin/bash

# Create a Windows installer using iexpress (Windows built-in tool)
# This script creates the configuration file that can be used on Windows

VERSION="1.0.0"
OUTPUT_DIR="dist"

echo "======================================"
echo "Creating Windows Installer Config"
echo "======================================"
echo ""

# Create the install.bat wrapper
cat > "$OUTPUT_DIR/install.bat" << 'EOFBAT'
@echo off
echo ======================================
echo CMDB Agent Installer
echo ======================================
echo.

REM Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This installer requires administrator privileges.
    echo Please right-click and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo Installing CMDB Agent...
echo.

REM Run the PowerShell installer
powershell.exe -ExecutionPolicy Bypass -File "%~dp0install.ps1"

if %errorLevel% equ 0 (
    echo.
    echo ======================================
    echo Installation completed successfully!
    echo ======================================
    echo.
) else (
    echo.
    echo ======================================
    echo Installation failed!
    echo ======================================
    echo.
)

pause
EOFBAT

chmod +x "$OUTPUT_DIR/install.bat"
echo "✓ Created install.bat"

# Create IExpress configuration file (SED)
cat > "$OUTPUT_DIR/installer.sed" << EOFSED
[Version]
Class=IEXPRESS
SEDVersion=3

[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=0
HideExtractAnimation=1
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles

[Strings]
InstallPrompt=CMDB Agent will be installed. Continue?
DisplayLicense=LICENSE
FinishMessage=CMDB Agent installation completed. Please run the configuration wizard.
TargetName=cmdb-agent-installer-${VERSION}.exe
FriendlyName=CMDB Agent Installer
AppLaunched=install.bat
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
FILE0="install.bat"
FILE1="install.ps1"
FILE2="cmdb-agent-win.exe"
FILE3="config.example.json"
FILE4="README.md"
FILE5="LICENSE"

[SourceFiles]
SourceFiles0=$OUTPUT_DIR\\

[SourceFiles0]
%FILE0%=
%FILE1%=
%FILE2%=
%FILE3%=
%FILE4%=
%FILE5%=
EOFSED

echo "✓ Created installer.sed"

# Create README for Windows users
cat > "$OUTPUT_DIR/BUILD_ON_WINDOWS.txt" << 'EOFREADME'
====================================
Building the Windows Installer
====================================

This package contains all the files needed to create a professional
Windows installer using IExpress (built into Windows).

OPTION 1: Using IExpress GUI
-----------------------------
1. Double-click "installer.sed" on Windows
2. IExpress wizard will open
3. Follow the prompts (most settings are pre-configured)
4. The installer EXE will be created

OPTION 2: Using Command Line
-----------------------------
1. Open Command Prompt as Administrator
2. Run: iexpress /N installer.sed
3. The installer "cmdb-agent-installer-1.0.0.exe" will be created

OPTION 3: Manual Installation
-----------------------------
If you don't want to create an installer:
1. Right-click install.bat
2. Select "Run as Administrator"
3. Follow the installation prompts

The installer will:
- Check for administrator privileges
- Install CMDB Agent to Program Files
- Create configuration file
- Add Start Menu shortcuts
- Optionally add desktop shortcut

For silent installation:
  install.bat /silent

For more information, see README.md
EOFREADME

echo "✓ Created BUILD_ON_WINDOWS.txt"

# Copy necessary files to dist if not already there
echo ""
echo "Checking required files..."

if [ ! -f "$OUTPUT_DIR/cmdb-agent-win.exe" ]; then
    echo "ERROR: cmdb-agent-win.exe not found in dist/"
    exit 1
fi

for file in "install.ps1" "LICENSE" "README.md" "config.example.json"; do
    if [ ! -f "$OUTPUT_DIR/$file" ]; then
        if [ -f "$file" ]; then
            cp "$file" "$OUTPUT_DIR/"
            echo "✓ Copied $file to dist/"
        else
            echo "WARNING: $file not found"
        fi
    fi
done

# Create a new ZIP package with the installer files
echo ""
echo "Creating complete installer package..."
cd "$OUTPUT_DIR" || exit 1

# Create installer package
PACKAGE_NAME="cmdb-agent-installer-package-${VERSION}.zip"
zip -q "$PACKAGE_NAME" \
    installer.sed \
    install.bat \
    install.ps1 \
    cmdb-agent-win.exe \
    config.example.json \
    README.md \
    LICENSE \
    BUILD_ON_WINDOWS.txt

# Generate checksum
sha256sum "$PACKAGE_NAME" > "${PACKAGE_NAME}.sha256"

cd - > /dev/null

echo ""
echo "======================================"
echo "Installer Package Created!"
echo "======================================"
echo ""
echo "Package: $OUTPUT_DIR/$PACKAGE_NAME"
echo "Size: $(du -h "$OUTPUT_DIR/$PACKAGE_NAME" | cut -f1)"
echo ""
echo "To build the EXE on Windows:"
echo "  1. Extract the ZIP file"
echo "  2. Run: iexpress /N installer.sed"
echo "  3. Result: cmdb-agent-installer-${VERSION}.exe"
echo ""
echo "Or users can run install.bat directly without creating EXE"
echo ""
ls -lh "$OUTPUT_DIR"/*.zip
echo ""
cat "$OUTPUT_DIR/${PACKAGE_NAME}.sha256"
