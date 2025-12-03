# Building MSI on Linux - Current Status

## Summary

Building MSI on Linux using Wine + WiX is **technically possible but complex** due to:
- Wine .NET/Mono dependencies
- COM/RPC issues in Wine environment  
- WiX requires full .NET Framework

## Recommended Approach

### ✅ Option 1: Build on Windows (Best)

Use a Windows machine or VM:

```batch
cd backend\cmdb-agent-go
build-msi.bat
```

**Pros:**
- Native environment
- Fast build (< 1 minute)
- No compatibility issues
- Professional output

**Systems:**
- Local Windows PC
- Windows VM (VirtualBox, VMware)
- Windows Server
- Windows in Docker (experimental)

### ✅ Option 2: GitHub Actions (Automated)

Let CI/CD build it automatically:

```yaml
# .github/workflows/build-msi.yml
name: Build MSI
on: [push, workflow_dispatch]

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install WiX
        run: choco install wixtoolset -y
        
      - name: Build MSI
        run: |
          cd backend/cmdb-agent-go
          build-msi.bat
          
      - name: Upload MSI
        uses: actions/upload-artifact@v3
        with:
          name: msi-installer
          path: backend/cmdb-agent-go/*.msi
```

**Pros:**
- Fully automated
- No local Windows needed
- Consistent builds
- Easy distribution

### ✅ Option 3: Cloud Build Services

**Azure DevOps:**
```yaml
pool:
  vmImage: 'windows-latest'
steps:
  - script: choco install wixtoolset -y
  - script: cd backend\cmdb-agent-go && build-msi.bat
```

**AppVeyor:**
```yaml
image: Visual Studio 2022
install:
  - choco install wixtoolset -y
build_script:
  - cd backend\cmdb-agent-go
  - build-msi.bat
artifacts:
  - path: backend\cmdb-agent-go\*.msi
```

### ⚠️ Option 4: Wine on Linux (Advanced, Not Recommended)

**Current Issues:**
- Wine Mono installation required
- COM/RPC errors with WiX
- Unstable builds
- Debugging difficult

**If you must try:**
```bash
# Install dependencies
sudo apt-get install wine64 wine32
wget https://dl.winehq.org/wine/wine-mono/9.3.1/wine-mono-9.3.1-x86.msi
wine msiexec /i wine-mono-9.3.1-x86.msi

# Attempt build (may fail)
cd backend/cmdb-agent-go
./build-msi-wine.sh
```

**Known Errors:**
```
0024:err:mscoree:CLRRuntimeInfo_GetRuntimeHost Wine Mono is not installed
004c:err:ole:StdMarshalImpl_MarshalInterface Failed to create ifstub
```

## Alternative: Use ZIP Package

The ZIP package is **production-ready** and provides identical functionality:

```bash
# Already built and available
cd backend/cmdb-agent-go
ls -lh dist/release/cmdb-agent-windows-1.0.0.zip  # 6.0 MB
```

**Advantages over MSI:**
- Works now, no build needed
- PowerShell installer included
- Same functionality
- Easier to maintain
- Cross-platform build

**Installation:**
```powershell
Expand-Archive cmdb-agent-windows-1.0.0.zip -Destination C:\Temp
cd C:\Temp\cmdb-agent-windows-1.0.0
.\install-windows.ps1  # Does everything MSI does
```

## Comparison

| Method | Difficulty | Time | Reliability | Recommended |
|--------|-----------|------|-------------|-------------|
| Windows PC/VM | Easy | 1 min | ✅✅✅ | ✅ Yes |
| GitHub Actions | Easy | 5 min | ✅✅✅ | ✅ Yes |
| Cloud CI/CD | Medium | 3 min | ✅✅ | ✅ Yes |
| Wine on Linux | Hard | Hours | ⚠️ | ❌ No |
| ZIP Package | None | 0 min | ✅✅✅ | ✅ Yes |

## Recommendation

**For immediate needs:** Use the ZIP package (already built)

**For MSI needs:** 
1. Use GitHub Actions (free, automated)
2. Use Windows VM (VirtualBox free)
3. Use cloud build service

**Don't use:** Wine on Linux (too many issues)

## GitHub Actions Setup

Create `.github/workflows/build-msi.yml`:

```yaml
name: Build Windows MSI

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build-msi:
    runs-on: windows-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Install WiX Toolset
      run: |
        choco install wixtoolset -y
        refreshenv
    
    - name: Build Windows Binaries
      run: |
        cd backend/cmdb-agent-go
        $env:GOOS = "windows"
        $env:GOARCH = "amd64"
        go build -ldflags="-s -w" -o dist/cmdb-agent-windows-amd64.exe ./cmd/cmdb-agent
        go build -ldflags="-s -w" -o dist/cmdb-agent-cli-windows-amd64.exe ./cmd/cmdb-agent-cli
    
    - name: Build MSI
      run: |
        cd backend/cmdb-agent-go
        & "C:\Program Files (x86)\WiX Toolset v3.11\bin\candle.exe" -arch x64 cmdb-agent.wxs
        & "C:\Program Files (x86)\WiX Toolset v3.11\bin\light.exe" -ext WixUIExtension -ext WixUtilExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj -sval
    
    - name: Calculate Checksum
      run: |
        cd backend/cmdb-agent-go
        Get-FileHash cmdb-agent-1.0.0-x64.msi -Algorithm SHA256 | Format-List | Out-File cmdb-agent-1.0.0-x64.msi.sha256
    
    - name: Upload MSI Artifact
      uses: actions/upload-artifact@v3
      with:
        name: windows-msi-installer
        path: |
          backend/cmdb-agent-go/cmdb-agent-1.0.0-x64.msi
          backend/cmdb-agent-go/cmdb-agent-1.0.0-x64.msi.sha256
    
    - name: Create Release
      if: startsWith(github.ref, 'refs/tags/')
      uses: softprops/action-gh-release@v1
      with:
        files: |
          backend/cmdb-agent-go/cmdb-agent-1.0.0-x64.msi
          backend/cmdb-agent-go/cmdb-agent-1.0.0-x64.msi.sha256
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Usage:**
```bash
# Manual trigger
gh workflow run build-msi.yml

# Or create tag
git tag v1.0.0
git push origin v1.0.0
```

## Next Steps

1. **Immediate:** Use ZIP package for deployment
2. **Short-term:** Set up GitHub Actions for automated MSI builds
3. **Long-term:** Keep both ZIP and MSI packages available

## Support

- All MSI source files ready: `cmdb-agent.wxs`, `license.rtf`, `build-msi.bat`
- Documentation complete: `BUILD_MSI_GUIDE.md`, `MSI_QUICK_REFERENCE.md`
- Just needs Windows environment to compile

**Question: Would you like me to set up the GitHub Actions workflow for automated MSI builds?**
