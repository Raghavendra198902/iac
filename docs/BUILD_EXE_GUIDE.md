# Building Windows Executable (.exe) for System Monitor

## Overview

This guide explains how to create a standalone Windows executable (.exe) file for the System Monitor that can be distributed and run without requiring PowerShell knowledge or execution policy changes.

## Prerequisites

### Windows Machine Required
- Windows 10/11 or Windows Server 2016+
- PowerShell 5.1+ or PowerShell Core 7+

### Option 1: PS2EXE (Recommended)
```powershell
# Install PS2EXE module
Install-Module -Name ps2exe -Scope CurrentUser -Force
```

### Option 2: IExpress (Built into Windows)
- No installation needed
- `iexpress.exe` is included with Windows

---

## Quick Start

### Method 1: Automated Build Script (Easiest)

```powershell
# Clone repository
git clone https://github.com/Raghavendra198902/iac.git
cd iac\backend\cmdb-agent

# Build executable (auto-detects best method)
.\build-exe.ps1

# Output: dist/exe/SystemMonitor-1.0.0.exe
```

### Method 2: Manual Build with PS2EXE

```powershell
# Install PS2EXE if not already installed
Install-Module ps2exe -Scope CurrentUser

# Import module
Import-Module ps2exe

# Build executable
Invoke-ps2exe `
    -InputFile "system-monitor.ps1" `
    -OutputFile "dist/exe/SystemMonitor.exe" `
    -Title "CMDB System Monitor" `
    -Description "System monitoring tool" `
    -Version "1.0.0" `
    -NoConsole:$false
```

### Method 3: Using Batch Launcher (No Build Required)

The simplest option - just package the batch file with PowerShell script:

```powershell
# Copy these files together:
# - system-monitor.bat  (launcher)
# - system-monitor.ps1  (script)

# Users can double-click system-monitor.bat to run
```

---

## Build Script Options

### Basic Build
```powershell
.\build-exe.ps1
```

### Custom Version
```powershell
.\build-exe.ps1 -Version "1.0.1"
```

### Specify Build Method
```powershell
# Use PS2EXE
.\build-exe.ps1 -Method ps2exe

# Use IExpress
.\build-exe.ps1 -Method iexpress

# Auto-detect (default)
.\build-exe.ps1 -Method auto
```

### Custom Output Directory
```powershell
.\build-exe.ps1 -OutputDir "C:\Builds\SystemMonitor"
```

### With Custom Icon
```powershell
.\build-exe.ps1 -Icon "path\to\icon.ico"
```

---

## Build Methods Comparison

### PS2EXE (Recommended)

**Advantages:**
- Creates true native executable
- Smaller file size (~1-2 MB)
- Better performance
- Professional appearance
- Can include custom icon
- Version information embedded
- Code signing compatible

**Disadvantages:**
- Requires PS2EXE module installation
- Some antivirus may flag (false positive)

**Use when:**
- Professional distribution needed
- Small file size important
- Code signing planned

### IExpress (Built-in)

**Advantages:**
- No installation required
- Built into Windows
- Simple and reliable
- No dependencies

**Disadvantages:**
- Larger file size (~2-3 MB)
- Self-extracting archive (slower)
- Less professional appearance
- Cannot embed custom icon easily

**Use when:**
- Can't install PS2EXE
- Quick build needed
- Air-gapped systems

### Batch Launcher (Simplest)

**Advantages:**
- No build process required
- Instant distribution
- Easy to modify
- No false positives

**Disadvantages:**
- Not a true .exe file
- Requires PowerShell script alongside
- Less professional
- Two files to distribute

**Use when:**
- Quick deployment needed
- Testing phase
- Internal use only

---

## File Structure After Build

### PS2EXE Method
```
dist/exe/
├── SystemMonitor-1.0.0.exe        (~1.5 MB standalone)
└── SystemMonitor-1.0.0.exe.sha256 (checksum)
```

### IExpress Method
```
dist/exe/
├── SystemMonitor-1.0.0.exe        (~2.5 MB self-extracting)
└── SystemMonitor-1.0.0.exe.sha256 (checksum)
```

### Batch Launcher Method
```
SystemMonitor-Package/
├── system-monitor.bat             (double-click this)
├── system-monitor.ps1             (PowerShell script)
└── README.txt                     (instructions)
```

---

## Distribution

### Copy to Network Share
```powershell
Copy-Item dist\exe\SystemMonitor-1.0.0.exe \\server\software\CMDB\
```

### Upload to Web Server
```powershell
# Copy to web server
scp dist/exe/SystemMonitor-1.0.0.exe user@server:/var/www/downloads/

# Or via HTTP
Invoke-WebRequest -Uri "http://server/upload" `
    -Method POST `
    -InFile "dist\exe\SystemMonitor-1.0.0.exe"
```

### Create ZIP Package
```powershell
Compress-Archive `
    -Path "dist\exe\SystemMonitor-1.0.0.exe" `
    -DestinationPath "SystemMonitor-1.0.0-Windows.zip"
```

### Deploy via Group Policy
1. Copy .exe to `\\domain\NETLOGON\SystemMonitor\`
2. Create GPO startup script:
   ```batch
   \\domain\NETLOGON\SystemMonitor\SystemMonitor-1.0.0.exe
   ```

---

## Running the Executable

### Double-Click (GUI)
- Simply double-click `SystemMonitor-1.0.0.exe`
- Console window will open showing system stats
- Press any key to close when done

### Command Line
```cmd
SystemMonitor-1.0.0.exe
```

### Silent Background Run
```cmd
start /B SystemMonitor-1.0.0.exe > monitor.log 2>&1
```

### Scheduled Task
```powershell
$action = New-ScheduledTaskAction -Execute "C:\Tools\SystemMonitor-1.0.0.exe"
$trigger = New-ScheduledTaskTrigger -Daily -At "09:00"
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "System Monitor"
```

---

## Troubleshooting

### "PS2EXE module not found"
```powershell
# Install the module
Install-Module ps2exe -Scope CurrentUser -Force

# Or specify NuGet repository
Install-Module ps2exe -Repository PSGallery -Force
```

### "Cannot load PS2EXE module"
```powershell
# Unblock the module
Get-ChildItem -Path "$env:USERPROFILE\Documents\PowerShell\Modules\ps2exe" -Recurse | 
    Unblock-File

# Then import
Import-Module ps2exe -Force
```

### "IExpress failed to create executable"
```powershell
# Check if files exist
Test-Path system-monitor.ps1  # Should be True
Test-Path system-monitor.bat  # Should be True

# Run IExpress manually
iexpress.exe /N /Q path\to\config.sed
```

### "Antivirus blocks the executable"
This is a false positive. Solutions:
1. **Add exception** in antivirus for the .exe
2. **Code sign** the executable (recommended for production)
3. **Use IExpress method** (less likely to flag)
4. **Submit to antivirus vendor** for whitelisting

### "Execution fails with error"
```powershell
# Run with verbose output
.\build-exe.ps1 -Verbose

# Check PowerShell version
$PSVersionTable.PSVersion  # Should be 5.1+

# Test source script first
.\system-monitor.ps1
```

---

## Code Signing (Optional but Recommended)

### Why Sign?
- **Trust**: Users know executable is authentic
- **No warnings**: Windows won't show "Unknown publisher"
- **Antivirus**: Less likely to be flagged
- **Enterprise**: Required for many corporate environments

### Get Certificate
```powershell
# Option 1: Self-signed (testing only)
$cert = New-SelfSignedCertificate -Type CodeSigningCert `
    -Subject "CN=CMDB Development" -CertStoreLocation Cert:\CurrentUser\My

# Option 2: Purchase from CA (production)
# - DigiCert, Sectigo, GlobalSign, etc.
# - Cost: $100-500/year
```

### Sign Executable
```powershell
# Sign the .exe file
Set-AuthenticodeSignature `
    -FilePath "dist\exe\SystemMonitor-1.0.0.exe" `
    -Certificate $cert `
    -TimestampServer "http://timestamp.digicert.com"
```

### Verify Signature
```powershell
Get-AuthenticodeSignature -FilePath "dist\exe\SystemMonitor-1.0.0.exe"
```

---

## Advanced Customization

### Add Custom Icon

1. **Create or download ICO file**
   - Size: 256x256 pixels recommended
   - Format: .ico (Windows icon format)
   - Tools: GIMP, IcoFX, online converters

2. **Build with icon**
   ```powershell
   .\build-exe.ps1 -Icon "path\to\logo.ico"
   ```

### Embed Version Information

Automatically included in PS2EXE builds:
- **File Version**: Specified version number
- **Product Name**: "CMDB System Monitor"
- **Company**: "CMDB Project"
- **Copyright**: Auto-generated
- **Description**: "System monitoring tool"

### Create Installer (EXE + Installer)

For full installer experience, combine with WiX or Inno Setup:

```powershell
# 1. Build standalone .exe
.\build-exe.ps1

# 2. Create installer that includes .exe
# Use Inno Setup or WiX to create installer.exe
# The installer can:
#   - Copy .exe to Program Files
#   - Create shortcuts
#   - Add to Start Menu
#   - Configure auto-run
```

---

## Packaging for Distribution

### Create Complete Package

```powershell
# Create distribution folder
$distFolder = "SystemMonitor-$version-Distribution"
New-Item -ItemType Directory -Path $distFolder -Force

# Copy files
Copy-Item "dist\exe\SystemMonitor-$version.exe" $distFolder
Copy-Item "README_SYSTEM_MONITOR.md" $distFolder\README.txt
Copy-Item "INSTALL.txt" $distFolder

# Create ZIP
Compress-Archive -Path $distFolder -DestinationPath "$distFolder.zip"
```

### Calculate Checksums

```powershell
# SHA256
$hash = Get-FileHash -Algorithm SHA256 "SystemMonitor-1.0.0.exe"
$hash.Hash | Out-File "SystemMonitor-1.0.0.exe.sha256"

# MD5 (for compatibility)
$md5 = Get-FileHash -Algorithm MD5 "SystemMonitor-1.0.0.exe"
$md5.Hash | Out-File "SystemMonitor-1.0.0.exe.md5"
```

---

## Testing Checklist

Before distributing the executable:

- [ ] Double-click executable - runs without errors
- [ ] Shows system information correctly
- [ ] Console window displays properly
- [ ] Can run from any directory
- [ ] No PowerShell errors
- [ ] Runs on clean Windows 10 VM
- [ ] Runs on clean Windows 11 VM
- [ ] Doesn't require admin privileges (unless specified)
- [ ] File size is reasonable (<5 MB)
- [ ] Checksum file generated
- [ ] Signature valid (if signed)
- [ ] Antivirus doesn't block (or false positive documented)
- [ ] Works with UAC enabled
- [ ] Works in restricted environments

---

## Automated Build Pipeline

### GitHub Actions Example

```yaml
name: Build Windows EXE

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install PS2EXE
        shell: pwsh
        run: Install-Module ps2exe -Force
      
      - name: Build EXE
        shell: pwsh
        run: |
          cd backend/cmdb-agent
          .\build-exe.ps1 -Version $env:GITHUB_REF_NAME
      
      - name: Upload Artifact
        uses: actions/upload-artifact@v3
        with:
          name: SystemMonitor-EXE
          path: backend/cmdb-agent/dist/exe/*.exe
```

---

## Summary

✅ **Three build methods available:**
1. PS2EXE - Best for production (1-2 MB, professional)
2. IExpress - Built-in fallback (2-3 MB, simple)
3. Batch Launcher - No build needed (two files)

✅ **Automated build script** (`build-exe.ps1`) handles everything

✅ **Code signing recommended** for production distribution

✅ **Distribution ready** - single .exe file that runs anywhere

✅ **No installation required** - double-click to run

---

## Next Steps

1. **Build on Windows machine:**
   ```powershell
   git clone https://github.com/Raghavendra198902/iac.git
   cd iac\backend\cmdb-agent
   .\build-exe.ps1
   ```

2. **Test the executable:**
   ```powershell
   .\dist\exe\SystemMonitor-1.0.0.exe
   ```

3. **Distribute:**
   - Copy to network share
   - Upload to downloads page
   - Email to users
   - Deploy via GPO

4. **(Optional) Sign:**
   ```powershell
   # Get code signing certificate
   # Sign the executable
   Set-AuthenticodeSignature -FilePath "SystemMonitor.exe" -Certificate $cert
   ```

**Ready to build your Windows executable!** 🚀
