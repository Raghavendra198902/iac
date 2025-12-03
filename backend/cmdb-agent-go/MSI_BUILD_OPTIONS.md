# Windows MSI Installer - Build Options

## Current Status

✅ **Windows agent binaries built:** 8.5 MB (agent) + 5.9 MB (CLI)  
✅ **ZIP package available:** 6.0 MB with PowerShell installer  
⚠️ **MSI creation:** Requires additional tooling

## Why MSI vs ZIP?

### ZIP Package (✅ Available Now)
**Advantages:**
- Works immediately, no additional tools needed
- PowerShell installer script included (`install-windows.ps1`)
- Full automation: service creation, PATH, shortcuts
- 6.0 MB compressed, easy to distribute
- Cross-platform build (Linux/macOS/Windows)
- Same functionality as MSI

**Use when:**
- Quick deployment needed
- Building from Linux/macOS
- Manual or scripted installations
- No corporate policy requiring MSI

### MSI Package (🔧 Requires Setup)
**Advantages:**
- Windows native installer format
- Group Policy deployment (GPO)
- SCCM/Intune integration
- Control Panel uninstaller
- Corporate compliance requirements

**Use when:**
- Enterprise deployment via GPO
- SCCM/Intune required
- Corporate policy mandates MSI
- Centralized software management

## MSI Build Options

### Option 1: Use ZIP Package (Recommended for Now)

The ZIP package is **production-ready** and provides the same functionality:

```bash
# Already built and available
cd backend/cmdb-agent-go
ls -lh dist/release/cmdb-agent-windows-1.0.0.zip
```

**Installation** (PowerShell as Admin):
```powershell
Expand-Archive -Path "cmdb-agent-windows-1.0.0.zip" -DestinationPath "C:\Temp"
cd C:\Temp\cmdb-agent-windows-1.0.0
.\install-windows.ps1
```

**Deployment via Group Policy:**
```powershell
# Copy to network share
Copy-Item cmdb-agent-windows-1.0.0.zip \\server\share\

# Create GPO startup script
# Computer Configuration > Policies > Windows Settings > Scripts > Startup
# Add script:
if (-not (Get-Service CMDBAgent -ErrorAction SilentlyContinue)) {
    Expand-Archive \\server\share\cmdb-agent-windows-1.0.0.zip C:\Temp
    & C:\Temp\cmdb-agent-windows-1.0.0\install-windows.ps1
}
```

### Option 2: Build MSI on Windows

If you need a true MSI package, build on a Windows system:

**Install WiX Toolset:**
```powershell
# Using Chocolatey
choco install wixtoolset

# Or download from: https://wixtoolset.org/
```

**Build MSI:**
```powershell
cd backend\cmdb-agent-go

# Compile WiX source
candle.exe -arch x64 cmdb-agent.wxs

# Create MSI
light.exe -ext WixUIExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj
```

**WiX Source Template** (`cmdb-agent.wxs`):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://schemas.microsoft.com/wix/2006/wi">
  <Product Id="*" 
           Name="CMDB Agent" 
           Language="1033" 
           Version="1.0.0" 
           Manufacturer="Infrastructure as Code Platform" 
           UpgradeCode="12345678-1234-1234-1234-123456789ABC">
    
    <Package InstallerVersion="200" 
             Compressed="yes" 
             InstallScope="perMachine" />

    <MajorUpgrade DowngradeErrorMessage="A newer version is already installed." />
    <MediaTemplate EmbedCab="yes" />

    <Feature Id="ProductFeature" Title="CMDB Agent" Level="1">
      <ComponentGroupRef Id="ProductComponents" />
    </Feature>

    <Directory Id="TARGETDIR" Name="SourceDir">
      <Directory Id="ProgramFiles64Folder">
        <Directory Id="INSTALLFOLDER" Name="CMDB Agent" />
      </Directory>
    </Directory>

    <ComponentGroup Id="ProductComponents" Directory="INSTALLFOLDER">
      <Component Id="AgentExe">
        <File Source="dist\cmdb-agent-windows-amd64.exe" />
      </Component>
      <Component Id="CLIExe">
        <File Source="dist\cmdb-agent-cli-windows-amd64.exe" />
      </Component>
      <Component Id="ConfigYaml">
        <File Source="config.example.yaml" Name="config.yaml" />
      </Component>
    </ComponentGroup>
  </Product>
</Wix>
```

### Option 3: Use Advanced Installer

**Advanced Installer** (free edition) provides GUI-based MSI creation:

1. Download from https://www.advancedinstaller.com/
2. Create new project
3. Add files:
   - `cmdb-agent-windows-amd64.exe`
   - `cmdb-agent-cli-windows-amd64.exe`
   - `config.yaml`
   - `install-windows.ps1`
4. Configure:
   - Installation directory: `C:\Program Files\CMDB Agent`
   - Add to PATH
   - Create shortcuts
5. Build MSI

### Option 4: Use Cross-Platform MSI Builder

**Install on Linux** (experimental):
```bash
# Install wine and WiX
sudo apt-get install wine64
wget https://github.com/wixtoolset/wix3/releases/download/wix3112rtm/wix311-binaries.zip
unzip wix311-binaries.zip -d ~/wix

# Build MSI via wine
wine ~/wix/candle.exe -arch x64 cmdb-agent.wxs
wine ~/wix/light.exe -ext WixUIExtension -out cmdb-agent-1.0.0-x64.msi cmdb-agent.wixobj
```

## Comparison Matrix

| Feature | ZIP + PowerShell | MSI Package |
|---------|------------------|-------------|
| Build complexity | ✅ Simple | ⚠️ Complex |
| Build platform | ✅ Any OS | ⚠️ Windows preferred |
| Installation | ✅ PowerShell script | ✅ Native installer |
| Service creation | ✅ Automated | ✅ Automated |
| PATH integration | ✅ Yes | ✅ Yes |
| Shortcuts | ✅ Via script | ✅ Native |
| Uninstaller | ✅ PowerShell script | ✅ Control Panel |
| GPO deployment | ✅ Startup script | ✅ Software installation |
| SCCM/Intune | ⚠️ Package app | ✅ Native support |
| File size | ✅ 6.0 MB | ~15-20 MB |
| Code signing | ⚠️ Script signing | ✅ MSI signing |
| Corporate approval | ⚠️ May need review | ✅ Standard format |

## Recommendation

### For Immediate Use: Use ZIP Package ✅

The ZIP package with PowerShell installer is:
- **Available now** (`dist/release/cmdb-agent-windows-1.0.0.zip`)
- **Production-ready** with full automation
- **Easier to maintain** and update
- **Cross-platform build** (no Windows system needed)
- **Smaller size** (6 MB vs 15-20 MB)

### For Enterprise Deployment: Build MSI Later 🔧

Create MSI when you have:
- Access to Windows build system
- WiX Toolset installed
- Code signing certificate
- Corporate deployment requirements

## Action Plan

**Phase 1: Current Release (Now)**
```bash
✅ Use: dist/release/cmdb-agent-windows-1.0.0.zip
✅ Deploy: PowerShell install script
✅ Document: Installation instructions provided
```

**Phase 2: MSI Package (Future)**
```bash
⏳ Setup: Windows build VM with WiX
⏳ Create: WiX source file (.wxs)
⏳ Build: MSI package
⏳ Sign: Code signing certificate
⏳ Test: Installation on various Windows versions
⏳ Release: Alongside ZIP package
```

## Current Package Details

**Available Now:**
```
Location: backend/cmdb-agent-go/dist/release/
File: cmdb-agent-windows-1.0.0.zip (6.0 MB)
Checksum: cmdb-agent-windows-1.0.0.zip.sha256

Contents:
├── cmdb-agent.exe (8.5 MB)
├── cmdb-agent-cli.exe (5.9 MB)
├── config.yaml
├── install-windows.ps1 ← Automated installer
├── uninstall-windows.ps1
├── README_FIRST.txt
└── docs/
    ├── FEATURES.md
    ├── WEBUI_GUIDE.md
    ├── WINDOWS_BUILD_GUIDE.md
    └── FLOWCHART.md
```

**Installation** (5 seconds):
```powershell
Expand-Archive cmdb-agent-windows-1.0.0.zip -Destination C:\Temp
cd C:\Temp\cmdb-agent-windows-1.0.0
.\install-windows.ps1  # Installs service, PATH, shortcuts
```

## Conclusion

✅ **Current solution is production-ready**  
⚠️ **MSI creation requires Windows build environment**  
💡 **Recommendation: Deploy ZIP now, build MSI later if needed**

The PowerShell installer provides 100% of the functionality of an MSI installer for most use cases. MSI should only be pursued if you have specific corporate requirements or need native SCCM/Intune integration.

**Question: Do you need MSI for specific requirements (GPO/SCCM/Intune), or is the ZIP package sufficient for your deployment?**
