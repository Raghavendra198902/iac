# How to Build the MSI Installer on Windows

## Prerequisites

You need a **Windows machine** with the following installed:

### 1. WiX Toolset (Required)
Download and install WiX Toolset 3.11 or later:
- **Download**: https://github.com/wixtoolset/wix3/releases
- **Direct Link**: https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311.exe

After installation, add WiX to your PATH:
```
C:\Program Files (x86)\WiX Toolset v3.11\bin
```

### 2. Node.js (Required)
- Download from: https://nodejs.org/
- Version: 18.x or later

### 3. Git (Optional)
- Download from: https://git-scm.com/

## Build Steps

### Option 1: Using PowerShell (Recommended)

1. **Clone or copy the repository to Windows**
   ```powershell
   git clone https://github.com/Raghavendra198902/iac.git
   cd iac\backend\cmdb-agent
   ```

2. **Run the build script**
   ```powershell
   .\build-msi-windows.ps1 -Version "1.0.0"
   ```

   Or for a different version:
   ```powershell
   .\build-msi-windows.ps1 -Version "2.0.0"
   ```

3. **Find your MSI**
   ```
   dist\msi\CMDBAgent-1.0.0-x64.msi
   ```

### Option 2: Using Batch File

1. **Run the batch script**
   ```cmd
   build-msi-on-windows.bat 1.0.0
   ```

2. **Find your MSI**
   ```
   dist\msi\CMDBAgent-1.0.0-x64.msi
   ```

### Option 3: Manual Build

1. **Install dependencies**
   ```powershell
   npm install
   ```

2. **Build the TypeScript source**
   ```powershell
   npm run build
   ```

3. **Compile with WiX**
   ```powershell
   # Compile WiX source
   candle.exe installer.wxs -out dist\installer.wixobj
   
   # Link into MSI
   light.exe dist\installer.wixobj -out dist\CMDBAgent-1.0.0-x64.msi -ext WixUIExtension
   ```

## Output Files

After a successful build, you'll have:

```
dist/msi/
├── CMDBAgent-1.0.0-x64.msi           # The installer package
└── CMDBAgent-1.0.0-x64.msi.sha256    # SHA-256 checksum
```

## Testing the MSI

### Test Installation
```powershell
msiexec /i dist\msi\CMDBAgent-1.0.0-x64.msi
```

### Silent Installation
```powershell
msiexec /i dist\msi\CMDBAgent-1.0.0-x64.msi /quiet
```

### Uninstall
```powershell
msiexec /x dist\msi\CMDBAgent-1.0.0-x64.msi
```

## Upload to Server

Once built, upload the MSI to your CMDB server:

```powershell
$file = "dist\msi\CMDBAgent-1.0.0-x64.msi"
$server = "http://192.168.1.9:3001"

# Upload
Invoke-RestMethod -Uri "$server/api/updates/upload" `
    -Method POST `
    -InFile $file `
    -ContentType "application/octet-stream"
```

## Troubleshooting

### "candle.exe not found"
- WiX Toolset is not installed or not in PATH
- Install from: https://github.com/wixtoolset/wix3/releases
- Add to PATH: `C:\Program Files (x86)\WiX Toolset v3.11\bin`

### "Build failed" during npm run build
- Missing dependencies: Run `npm install`
- TypeScript errors: Check `tsconfig.json` configuration

### "Access denied" during installation
- Run PowerShell or CMD as Administrator
- Right-click → "Run as Administrator"

## Why Windows is Required

MSI installers can only be built on Windows because:
1. WiX Toolset uses Windows-specific COM APIs
2. MSI format requires Windows Installer SDK
3. Code signing requires Windows certificate stores

## Alternative: Build on Linux

If you cannot access Windows, you can:
1. Use the PowerShell installer we created (no MSI needed)
2. Set up a Windows VM (VirtualBox, VMware, Hyper-V)
3. Use GitHub Actions to build MSI automatically (CI/CD)
4. Use a Windows build server

## Questions?

For issues or questions, refer to:
- WiX Documentation: https://wixtoolset.org/documentation/
- This project's main README: ../../../README.md
