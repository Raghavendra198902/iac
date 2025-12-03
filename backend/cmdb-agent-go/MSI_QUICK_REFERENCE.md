# MSI Quick Reference Card

## ✅ What You Have Now

All files needed to create a professional Windows MSI installer:

```
backend/cmdb-agent-go/
├── cmdb-agent.wxs           ← Main WiX source (complete installer definition)
├── license.rtf              ← EULA license agreement
├── BUILD_MSI_GUIDE.md       ← Complete build instructions
├── build-msi.bat            ← Windows build script
├── build-msi-wine.sh        ← Linux build script (using Wine)
└── dist/
    ├── cmdb-agent-windows-amd64.exe  ✓ Ready
    └── cmdb-agent-cli-windows-amd64.exe  ✓ Ready
```

## 🚀 Quick Start

### On Windows (Easiest)

**1. Install WiX Toolset:**
```powershell
choco install wixtoolset
```

**2. Run build script:**
```batch
cd backend\cmdb-agent-go
build-msi.bat
```

**Done!** → `cmdb-agent-1.0.0-x64.msi` created

### On Linux (Advanced)

**1. Install Wine:**
```bash
sudo apt-get install wine64
```

**2. Download WiX:**
```bash
wget https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311-binaries.zip
unzip wix311-binaries.zip -d ~/wix
```

**3. Run build script:**
```bash
cd backend/cmdb-agent-go
./build-msi-wine.sh
```

**Done!** → `cmdb-agent-1.0.0-x64.msi` created

## 📦 MSI Features

What the installer does:

✅ **Service Installation**
- Creates "CMDBAgent" Windows service
- Auto-start on boot
- Runs as LocalSystem
- Restart on failure (3 attempts)

✅ **PATH Integration**
- Adds `C:\Program Files\CMDB Agent` to system PATH
- Access `cmdb-agent.exe` and `cmdb-agent-cli.exe` from anywhere

✅ **Start Menu Shortcuts**
- CMDB Agent Web UI (opens http://localhost:8080)
- Agent Configuration (opens config.yaml)
- View Logs (opens logs folder)
- Documentation (opens docs folder)
- Uninstall shortcut

✅ **Desktop Shortcut**
- Quick access to CMDB Agent

✅ **Registry Entries**
- Tracks installation path
- Stores version number
- Enables upgrade detection

✅ **Professional UI**
- Custom license agreement
- Installation directory selection
- Progress indicators
- Success/error handling

✅ **Post-Installation**
- Automatically opens Web UI
- Service starts immediately
- Ready to use

## 🔧 Manual Build (Without Scripts)

### On Windows:
```powershell
cd backend\cmdb-agent-go

# Compile
candle.exe -arch x64 cmdb-agent.wxs

# Link
light.exe -ext WixUIExtension -ext WixUtilExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj
```

### On Linux:
```bash
cd backend/cmdb-agent-go

# Compile
wine ~/wix/candle.exe -arch x64 cmdb-agent.wxs

# Link
wine ~/wix/light.exe -ext WixUIExtension -ext WixUtilExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj -sval
```

## 📊 File Sizes

| Component | Size |
|-----------|------|
| Agent EXE | 8.5 MB |
| CLI EXE | 5.9 MB |
| MSI Installer | ~15-20 MB |

## 🧪 Testing

### Install MSI:
```powershell
# GUI
msiexec /i cmdb-agent-1.0.0-x64.msi

# Silent
msiexec /i cmdb-agent-1.0.0-x64.msi /qn /l*v install.log
```

### Verify:
```powershell
# Check service
Get-Service CMDBAgent

# Check files
dir "C:\Program Files\CMDB Agent"

# Test CLI
cmdb-agent-cli status

# Open Web UI
Start-Process "http://localhost:8080"
```

### Uninstall:
```powershell
# GUI
msiexec /x cmdb-agent-1.0.0-x64.msi

# Silent
msiexec /x cmdb-agent-1.0.0-x64.msi /qn
```

## 📤 Distribution

### Create Checksum:
```powershell
# Windows
certutil -hashfile cmdb-agent-1.0.0-x64.msi SHA256

# Linux
sha256sum cmdb-agent-1.0.0-x64.msi > cmdb-agent-1.0.0-x64.msi.sha256
```

### Upload to GitHub:
```bash
gh release create v1.0.0 \
  cmdb-agent-1.0.0-x64.msi \
  cmdb-agent-1.0.0-x64.msi.sha256 \
  --title "CMDB Agent v1.0.0" \
  --notes "Windows MSI Installer"
```

### Update Download Page:
Edit `frontend/src/pages/agents/AgentDownloads.tsx`:
```typescript
downloadUrl: '/downloads/cmdb-agent-1.0.0-x64.msi'
```

## 🎯 Deployment Methods

### 1. Manual Download & Install
Users download MSI and double-click

### 2. Group Policy (GPO)
Deploy via Computer Configuration → Software Installation

### 3. SCCM/Intune
Create application package with MSI

### 4. PowerShell Remote
```powershell
Invoke-Command -ComputerName Server01 -ScriptBlock {
    msiexec /i \\share\cmdb-agent-1.0.0-x64.msi /qn
}
```

### 5. Chocolatey Package (Future)
Create `.nuspec` and publish to Chocolatey repository

## 🔐 Code Signing (Optional)

If you have a code signing certificate:

```powershell
signtool.exe sign /f cert.pfx /p password /t http://timestamp.digicert.com cmdb-agent-1.0.0-x64.msi

signtool.exe verify /pa cmdb-agent-1.0.0-x64.msi
```

## ⚙️ Customization

### Change Version:
Edit `cmdb-agent.wxs` line 5:
```xml
Version="1.0.0"  ← Change here
```

### Change Install Location:
Edit `cmdb-agent.wxs` line 87:
```xml
<Directory Id="INSTALLFOLDER" Name="CMDB Agent">  ← Change name
```

### Add Custom Properties:
```powershell
msiexec /i cmdb-agent-1.0.0-x64.msi INSTALLFOLDER="D:\Apps\CMDB"
```

## 🆘 Troubleshooting

### "candle.exe not found"
```powershell
# Add WiX to PATH or use full path
& "C:\Program Files (x86)\WiX Toolset v3.11\bin\candle.exe" -arch x64 cmdb-agent.wxs
```

### "Wine not found"
```bash
sudo apt-get install wine64
```

### "Build failed"
Check log file:
```powershell
light.exe ... > build.log 2>&1
notepad build.log
```

### Installation fails
Check install log:
```powershell
msiexec /i cmdb-agent-1.0.0-x64.msi /l*v install.log
notepad install.log
```

## 📚 Documentation

- **BUILD_MSI_GUIDE.md** - Complete detailed guide
- **MSI_BUILD_OPTIONS.md** - Comparison of build methods
- **WINDOWS_BUILD_GUIDE.md** - Windows agent documentation
- **WiX Documentation** - https://wixtoolset.org/documentation/

## 🎉 Success Criteria

After building, you should have:

✅ `cmdb-agent-1.0.0-x64.msi` (~15-20 MB)
✅ `cmdb-agent-1.0.0-x64.msi.sha256` (checksum)
✅ Can install via GUI (double-click)
✅ Can install silently (`/qn`)
✅ Service auto-starts
✅ Web UI accessible at http://localhost:8080
✅ CLI commands work from any directory
✅ Appears in Programs & Features
✅ Uninstaller works cleanly

---

**Need Help?**
- Open issue: https://github.com/Raghavendra198902/iac/issues
- Read: BUILD_MSI_GUIDE.md
- Check: MSI_BUILD_OPTIONS.md
