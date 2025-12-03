# Complete Guide to Building CMDB Agent MSI

This guide provides step-by-step instructions for building the Windows MSI installer for CMDB Agent.

## Prerequisites

### Option 1: Build on Windows (Recommended)

**Required Software:**
1. **WiX Toolset v3.11+**
   ```powershell
   # Using Chocolatey
   choco install wixtoolset
   
   # Or download from: https://wixtoolset.org/releases/
   ```

2. **Windows SDK** (optional, for better icons)
   ```powershell
   choco install windows-sdk-10.1
   ```

### Option 2: Build on Linux with Wine (Advanced)

**Required Packages:**
```bash
# Install Wine
sudo dpkg --add-architecture i386
sudo apt-get update
sudo apt-get install wine64 wine32

# Download WiX Toolset
cd ~/
wget https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311-binaries.zip
unzip wix311-binaries.zip -d ~/wix
```

## Files Included

All necessary files are already in the repository:

```
backend/cmdb-agent-go/
├── cmdb-agent.wxs              ← WiX source file (main installer definition)
├── license.rtf                 ← License agreement
├── dist/
│   ├── cmdb-agent-windows-amd64.exe
│   └── cmdb-agent-cli-windows-amd64.exe
├── config.example.yaml
├── install-windows.ps1
├── uninstall-windows.ps1
├── README.md
├── FEATURES.md
├── WEBUI_GUIDE.md
├── WINDOWS_BUILD_GUIDE.md
└── FLOWCHART.md
```

## Build Instructions

### Method 1: Build on Windows

```powershell
# 1. Open PowerShell or Command Prompt
cd backend\cmdb-agent-go

# 2. Ensure binaries are built
# (If not already built, build them first)

# 3. Compile WiX source to object file
candle.exe -arch x64 cmdb-agent.wxs

# 4. Link object file to create MSI
light.exe -ext WixUIExtension -ext WixUtilExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj

# 5. MSI is ready!
dir cmdb-agent-1.0.0-x64.msi
```

**With Banner/Dialog Images (Optional):**
```powershell
# Create placeholder images if you don't have custom ones
# Banner: 493 x 58 pixels
# Dialog: 493 x 312 pixels

candle.exe -arch x64 cmdb-agent.wxs
light.exe -ext WixUIExtension -ext WixUtilExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj -sval
```

### Method 2: Build on Linux with Wine

```bash
cd backend/cmdb-agent-go

# Set Wine environment
export WINEARCH=win64
export WINEPREFIX=~/.wine64

# Compile WiX source
wine ~/wix/candle.exe -arch x64 cmdb-agent.wxs

# Link to create MSI
wine ~/wix/light.exe -ext WixUIExtension -ext WixUtilExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj -sval

# MSI is ready!
ls -lh cmdb-agent-1.0.0-x64.msi
```

### Method 3: Automated Build Script

Create `build-msi.bat` (Windows):
```batch
@echo off
setlocal

set VERSION=1.0.0
set ARCH=x64
set OUTPUT=cmdb-agent-%VERSION%-%ARCH%.msi

echo Building CMDB Agent MSI v%VERSION%...

REM Compile
candle.exe -arch %ARCH% cmdb-agent.wxs
if errorlevel 1 goto :error

REM Link
light.exe -ext WixUIExtension -ext WixUtilExtension -out %OUTPUT% cmdb-agent.wixobj -sval
if errorlevel 1 goto :error

echo.
echo ✓ MSI package created successfully!
echo   File: %OUTPUT%
dir %OUTPUT%
goto :end

:error
echo.
echo ✗ Build failed!
exit /b 1

:end
endlocal
```

Create `build-msi.sh` (Linux):
```bash
#!/bin/bash
set -e

VERSION=1.0.0
ARCH=x64
OUTPUT="cmdb-agent-${VERSION}-${ARCH}.msi"
WIX_PATH="${HOME}/wix"

echo "Building CMDB Agent MSI v${VERSION}..."

# Set Wine environment
export WINEARCH=win64
export WINEPREFIX="${HOME}/.wine64"

# Compile
wine "${WIX_PATH}/candle.exe" -arch ${ARCH} cmdb-agent.wxs

# Link
wine "${WIX_PATH}/light.exe" -ext WixUIExtension -ext WixUtilExtension -out "${OUTPUT}" cmdb-agent.wixobj -sval

echo ""
echo "✓ MSI package created successfully!"
echo "  File: ${OUTPUT}"
ls -lh "${OUTPUT}"
```

## Customization

### Update Version Number

Edit `cmdb-agent.wxs`:
```xml
<Product Id="*" 
         Name="CMDB Agent" 
         Version="1.0.0"    ← Change this
```

### Change Installation Directory

Default is `C:\Program Files\CMDB Agent`. To change:
```xml
<Directory Id="INSTALLFOLDER" Name="CMDB Agent">  ← Change name here
```

### Add Custom Banner/Dialog Images

Create images:
- **banner.bmp**: 493 x 58 pixels (installer banner)
- **dialog.bmp**: 493 x 312 pixels (welcome screen)

Place in the same directory as `cmdb-agent.wxs`.

### Modify Start Menu Shortcuts

Edit the `ApplicationShortcuts` component in `cmdb-agent.wxs`:
```xml
<Shortcut Id="WebUIShortcut"
          Name="CMDB Agent Web UI"    ← Change shortcut name
          Description="..."            ← Change description
          Target="http://localhost:8080" />
```

## Testing the MSI

### Install MSI
```powershell
# GUI installation
msiexec /i cmdb-agent-1.0.0-x64.msi

# Silent installation
msiexec /i cmdb-agent-1.0.0-x64.msi /qn /l*v install.log

# Silent with reboot suppression
msiexec /i cmdb-agent-1.0.0-x64.msi /qn /norestart
```

### Verify Installation
```powershell
# Check service
Get-Service CMDBAgent

# Check PATH
$env:Path -split ';' | Select-String "CMDB"

# Check installation directory
Get-ChildItem "C:\Program Files\CMDB Agent"

# Check registry
Get-ItemProperty "HKLM:\Software\CMDBAgent"

# Test CLI
cmdb-agent-cli status

# Open Web UI
Start-Process "http://localhost:8080"
```

### Uninstall MSI
```powershell
# GUI uninstall
msiexec /x cmdb-agent-1.0.0-x64.msi

# Silent uninstall
msiexec /x cmdb-agent-1.0.0-x64.msi /qn /l*v uninstall.log

# Or from Programs & Features
appwiz.cpl
```

## Advanced Features

### Code Signing (Optional but Recommended)

If you have a code signing certificate:

```powershell
# Sign the MSI
signtool.exe sign /f certificate.pfx /p password /t http://timestamp.digicert.com cmdb-agent-1.0.0-x64.msi

# Verify signature
signtool.exe verify /pa cmdb-agent-1.0.0-x64.msi
```

### Transform Files (.MST)

Create transform files for different configurations:

```powershell
# Create transform
msitran.exe -g cmdb-agent-1.0.0-x64.msi cmdb-agent-custom.msi custom.mst

# Apply transform during installation
msiexec /i cmdb-agent-1.0.0-x64.msi TRANSFORMS=custom.mst
```

### Custom Properties

Set custom properties during installation:

```powershell
# Custom installation directory
msiexec /i cmdb-agent-1.0.0-x64.msi INSTALLFOLDER="D:\Apps\CMDBAgent"

# Skip service installation (if you add this property to WiX)
msiexec /i cmdb-agent-1.0.0-x64.msi INSTALLSERVICE=0
```

## Troubleshooting

### Error: "candle.exe not found"

```powershell
# Add WiX to PATH
$env:Path += ";C:\Program Files (x86)\WiX Toolset v3.11\bin"

# Or use full path
& "C:\Program Files (x86)\WiX Toolset v3.11\bin\candle.exe" -arch x64 cmdb-agent.wxs
```

### Error: "The system cannot find the file specified"

Check that all source files exist:
```powershell
Test-Path dist\cmdb-agent-windows-amd64.exe
Test-Path dist\cmdb-agent-cli-windows-amd64.exe
Test-Path config.example.yaml
```

### Error: "Unresolved reference to symbol"

You're missing an extension. Add it to the light command:
```powershell
light.exe -ext WixUIExtension -ext WixUtilExtension cmdb-agent.wixobj
```

### Warning: "ICE38: Component ... has a registry value as its KeyPath"

This is just a warning and can be ignored, or suppress with:
```powershell
light.exe -sval cmdb-agent.wixobj
```

### MSI Installation Fails

Check the log file:
```powershell
msiexec /i cmdb-agent-1.0.0-x64.msi /l*v install.log
notepad install.log
```

## Distribution

### Upload to GitHub Releases

```bash
# Create release
gh release create v1.0.0 \
  cmdb-agent-1.0.0-x64.msi \
  --title "CMDB Agent v1.0.0" \
  --notes "Release notes here"

# Or manually upload to:
# https://github.com/Raghavendra198902/iac/releases/new
```

### Create Checksum

```powershell
# Windows
Get-FileHash cmdb-agent-1.0.0-x64.msi -Algorithm SHA256 | Format-List

# Linux
sha256sum cmdb-agent-1.0.0-x64.msi > cmdb-agent-1.0.0-x64.msi.sha256
```

### Update Download Links

Update `frontend/src/pages/agents/AgentDownloads.tsx`:
```typescript
downloadUrl: 'https://github.com/Raghavendra198902/iac/releases/download/v1.0.0/cmdb-agent-1.0.0-x64.msi'
```

## CI/CD Integration

### GitHub Actions (Example)

Create `.github/workflows/build-msi.yml`:
```yaml
name: Build Windows MSI

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup WiX
      run: |
        choco install wixtoolset -y
        
    - name: Build MSI
      run: |
        cd backend/cmdb-agent-go
        candle.exe -arch x64 cmdb-agent.wxs
        light.exe -ext WixUIExtension -ext WixUtilExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj -sval
        
    - name: Upload artifact
      uses: actions/upload-artifact@v3
      with:
        name: msi-installer
        path: backend/cmdb-agent-go/cmdb-agent-1.0.0-x64.msi
```

## Summary

**Quick Start (Windows):**
```powershell
cd backend\cmdb-agent-go
candle.exe -arch x64 cmdb-agent.wxs
light.exe -ext WixUIExtension -ext WixUtilExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj
```

**Result:** Professional Windows MSI installer with:
- ✅ Service installation
- ✅ PATH integration  
- ✅ Start Menu shortcuts
- ✅ Uninstaller
- ✅ Upgrade support
- ✅ Custom UI

For support, open an issue at: https://github.com/Raghavendra198902/iac/issues
