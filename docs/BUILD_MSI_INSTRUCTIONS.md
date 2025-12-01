# Building System Monitor MSI Installer for Windows

Complete guide to build a Windows MSI installer for the CMDB System Monitor.

## 📋 Prerequisites

### Required Software

1. **Windows 10/11 or Windows Server 2016+**
   - PowerShell 5.1 or later
   - .NET Framework 4.7.2 or later

2. **WiX Toolset 3.11+**
   
   **Option A: Download Installer**
   - Visit: https://wixtoolset.org/releases/
   - Download: `wix311.exe` (or latest version)
   - Run installer with default options
   
   **Option B: Install via Chocolatey**
   ```powershell
   choco install wixtoolset
   ```
   
   **Option C: Install via winget**
   ```powershell
   winget install WixToolset.WiXToolset
   ```

3. **Visual Studio 2019+ (Optional)**
   - Only if you want to edit WiX files with IntelliSense
   - Install "WiX Toolset Visual Studio Extension"

### Verify Installation

After installing WiX Toolset, verify:

```powershell
# Check WiX environment variable
$env:WIX

# Should output something like: C:\Program Files (x86)\WiX Toolset v3.11\

# Check candle.exe
Get-Command candle.exe

# Check light.exe
Get-Command light.exe
```

If commands are not found, add WiX to PATH:

```powershell
$wixPath = "C:\Program Files (x86)\WiX Toolset v3.11\bin"
$env:PATH += ";$wixPath"
```

## 📁 Required Files

Ensure these files exist in `backend/cmdb-agent/`:

```
backend/cmdb-agent/
├── system-monitor.ps1              (Main script)
├── system-monitor.wxs              (WiX installer definition)
├── build-system-monitor-msi.ps1    (Build script)
├── README_SYSTEM_MONITOR.md        (Documentation)
└── dist/
    └── system-monitor/
        ├── INSTALL.txt             (Installation guide)
        └── VERSION.txt             (Version info)
```

## 🚀 Building the MSI

### Quick Build

```powershell
cd C:\path\to\iac\backend\cmdb-agent
.\build-system-monitor-msi.ps1
```

### Build with Custom Version

```powershell
.\build-system-monitor-msi.ps1 -Version "1.2.3"
```

### Clean Build

```powershell
.\build-system-monitor-msi.ps1 -Version "1.0.0" -Clean
```

### Custom Output Directory

```powershell
.\build-system-monitor-msi.ps1 -Version "1.0.0" -OutputDir "C:\Builds\MSI"
```

## 📦 Build Output

After successful build, you'll find:

```
dist/msi/
├── CMDB-SystemMonitor-1.0.0-x64.msi      (MSI installer)
├── CMDB-SystemMonitor-1.0.0-x64.msi.sha256 (Checksum)
└── system-monitor.wixobj                  (Intermediate file)
```

**Typical MSI size:** 1-2 MB

## 🔧 What Gets Installed

The MSI installer will:

1. **Install Files to:** `C:\Program Files\CMDB System Monitor\`
   - system-monitor.ps1
   - README_SYSTEM_MONITOR.md
   - INSTALL.txt
   - VERSION.txt
   - launch-monitor.bat

2. **Create Start Menu Shortcut:**
   - Location: `Start Menu > CMDB System Monitor > System Monitor`
   - Launches PowerShell with the monitor script

3. **Create Desktop Shortcut:**
   - Double-click to launch system monitor
   - Opens in PowerShell window

4. **Add to System PATH:**
   - Makes `system-monitor.ps1` accessible from any command prompt

5. **Registry Entries:**
   - `HKEY_CURRENT_USER\Software\CMDB\SystemMonitor`
   - Used for tracking installation

## 💾 Installing the MSI

### Silent Installation (No UI)

```powershell
msiexec /i CMDB-SystemMonitor-1.0.0-x64.msi /qn
```

### Interactive Installation

```powershell
msiexec /i CMDB-SystemMonitor-1.0.0-x64.msi
```

### Installation with Logging

```powershell
msiexec /i CMDB-SystemMonitor-1.0.0-x64.msi /l*v install.log
```

### Installation to Custom Location

```powershell
msiexec /i CMDB-SystemMonitor-1.0.0-x64.msi INSTALLFOLDER="D:\Tools\SystemMonitor"
```

### Enterprise Deployment (Group Policy)

1. Place MSI on network share: `\\server\share\SystemMonitor\`
2. Open Group Policy Management Console (GPMC)
3. Navigate to: Computer Configuration > Software Installation
4. Right-click > New > Package
5. Select the MSI file
6. Choose "Assigned" deployment method

### SCCM Deployment

1. Copy MSI to SCCM source location
2. Create new Application in SCCM Console
3. Detection Method: File exists: `C:\Program Files\CMDB System Monitor\system-monitor.ps1`
4. Install Command: `msiexec /i CMDB-SystemMonitor-1.0.0-x64.msi /qn`
5. Uninstall Command: `msiexec /x {PRODUCT-GUID} /qn`

## 🗑️ Uninstalling

### Via Add/Remove Programs

1. Open Settings > Apps > Apps & features
2. Search for "CMDB System Monitor"
3. Click "Uninstall"

### Via MSI (Silent)

```powershell
msiexec /x CMDB-SystemMonitor-1.0.0-x64.msi /qn
```

### Via Product Code

```powershell
# Get product code
Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -like "*System Monitor*"}

# Uninstall
$productCode = "{PRODUCT-CODE-HERE}"
msiexec /x $productCode /qn
```

## 🔍 Verifying Installation

### Check Installation

```powershell
# Check if installed
Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -eq "CMDB System Monitor"}

# Check install location
Test-Path "C:\Program Files\CMDB System Monitor\system-monitor.ps1"

# Check shortcuts
Test-Path "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\CMDB System Monitor\System Monitor.lnk"
Test-Path "$env:USERPROFILE\Desktop\System Monitor.lnk"

# Check PATH
$env:PATH -split ';' | Select-String "CMDB System Monitor"
```

### Run Installed Monitor

```powershell
# From Start Menu
# Click: Start > CMDB System Monitor > System Monitor

# From Desktop
# Double-click: System Monitor shortcut

# From Command Line
cd "C:\Program Files\CMDB System Monitor"
.\system-monitor.ps1

# From anywhere (if PATH is set)
system-monitor.ps1
```

## 🛠️ Customizing the MSI

### Modify Installation Behavior

Edit `system-monitor.wxs`:

1. **Change Install Location:**
   ```xml
   <Directory Id="INSTALLFOLDER" Name="Custom Folder Name">
   ```

2. **Add More Files:**
   ```xml
   <Component Id="MyNewFile" Guid="NEW-GUID-HERE">
     <File Id="MyFile" Name="myfile.txt" Source="myfile.txt" KeyPath="yes" />
   </Component>
   ```

3. **Remove Desktop Shortcut:**
   ```xml
   <!-- Comment out or remove -->
   <!-- <ComponentRef Id="DesktopShortcut" /> -->
   ```

4. **Change Product Name:**
   ```xml
   <Product Name="My Custom System Monitor" ...>
   ```

### Generate New GUIDs

```powershell
# PowerShell command to generate GUID
[guid]::NewGuid().ToString().ToUpper()
```

Replace GUIDs in `.wxs` file if you modify components.

### Rebuild After Changes

```powershell
.\build-system-monitor-msi.ps1 -Version "1.1.0" -Clean
```

## 🚨 Troubleshooting

### Error: WiX Toolset not found

**Solution:**
```powershell
# Set WIX environment variable
$env:WIX = "C:\Program Files (x86)\WiX Toolset v3.11\"

# Or install WiX Toolset
choco install wixtoolset
```

### Error: candle.exe not recognized

**Solution:**
```powershell
# Add to PATH
$wixBin = "C:\Program Files (x86)\WiX Toolset v3.11\bin"
$env:PATH += ";$wixBin"
```

### Error: File not found during build

**Solution:**
- Ensure all source files exist
- Check file paths in `.wxs` file
- Verify `dist/system-monitor/` directory exists

### Error: Light.exe error LGHT0217

**Cause:** Duplicate component GUIDs

**Solution:**
- Generate new GUIDs using `[guid]::NewGuid()`
- Replace duplicate GUIDs in `.wxs` file

### MSI fails to install

**Check:**
```powershell
# View detailed log
msiexec /i YourInstaller.msi /l*v install-log.txt

# Check log for errors
Get-Content install-log.txt | Select-String "error"
```

### Installation succeeds but shortcuts missing

**Solution:**
- Run installation as Administrator
- Check if folders exist:
  ```powershell
  Test-Path "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\CMDB System Monitor"
  ```

## 📊 Testing Checklist

Before distributing, test:

- [ ] Silent installation works
- [ ] Interactive installation works
- [ ] Start Menu shortcut appears
- [ ] Desktop shortcut appears
- [ ] Script runs from shortcuts
- [ ] PATH variable updated
- [ ] Uninstallation removes all files
- [ ] Uninstallation removes shortcuts
- [ ] Reinstallation works after uninstall
- [ ] Upgrade from older version works
- [ ] Installation on clean Windows VM

## 🌐 Distribution

### Host on Web Server

```powershell
# Copy to web server
Copy-Item dist\msi\CMDB-SystemMonitor-*.msi \\webserver\downloads\

# Or copy to CMDB downloads page
Copy-Item dist\msi\CMDB-SystemMonitor-*.msi C:\inetpub\wwwroot\downloads\
```

### Create Download Page

```html
<a href="downloads/CMDB-SystemMonitor-1.0.0-x64.msi">
  Download System Monitor (64-bit) - 1.5 MB
</a>
```

### Include in Documentation

Update README to include download link:

```markdown
## Windows Installation

Download the MSI installer:
- [CMDB System Monitor v1.0.0 (64-bit)](http://yourserver.com/downloads/CMDB-SystemMonitor-1.0.0-x64.msi)

SHA256: [checksum here]
```

## 🔐 Code Signing (Optional)

For production, sign the MSI with a code signing certificate:

```powershell
# Sign with certificate
$cert = Get-ChildItem -Path Cert:\CurrentUser\My -CodeSigningCert
$msiPath = "dist\msi\CMDB-SystemMonitor-1.0.0-x64.msi"

Set-AuthenticodeSignature -FilePath $msiPath -Certificate $cert -TimestampServer "http://timestamp.digicert.com"
```

## 📚 Additional Resources

- WiX Toolset Documentation: https://wixtoolset.org/documentation/
- WiX Tutorial: https://www.firegiant.com/wix/tutorial/
- MSI Installation Guide: https://docs.microsoft.com/en-us/windows/win32/msi/
- Code Signing Best Practices: https://docs.microsoft.com/en-us/windows-hardware/drivers/dashboard/

## 🆘 Support

For issues:
1. Check build output for errors
2. Review `install.log` if installation fails
3. Verify all prerequisites installed
4. Check GitHub issues: https://github.com/Raghavendra198902/iac/issues

---

**Version:** 1.0.0  
**Last Updated:** November 26, 2025  
**Maintainer:** CMDB Project Team
