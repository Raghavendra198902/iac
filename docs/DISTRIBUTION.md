# CMDB Agent - Distribution Packages

This document describes all available installer packages for the CMDB Agent.

## Available Packages

### 1. **Windows Installer Package** (Recommended for Windows) 📦
- **File**: `cmdb-agent-installer-package-1.0.0.zip` (16 MB)
- **Checksum**: `e3bd373f624f491d4dc45c33fecb717034a13f4b863a92b224e0fd4fa3d488e9`
- **Best for**: Creating professional Windows EXE installer

#### Contents:
- `cmdb-agent-win.exe` - Standalone Windows executable (42 MB)
- `install.bat` - Batch installer with admin checks
- `install.ps1` - PowerShell installer with configuration wizard
- `installer.sed` - IExpress configuration for creating EXE
- `BUILD_ON_WINDOWS.txt` - Instructions for building installer
- `README.md` - Full documentation
- `LICENSE` - MIT license
- `config.example.json` - Configuration template

#### How to use:

**Option A: Build Professional EXE Installer (Recommended)**
1. Extract ZIP on Windows machine
2. Open Command Prompt as Administrator
3. Run: `iexpress /N installer.sed`
4. Result: `cmdb-agent-installer-1.0.0.exe` (self-extracting installer)
5. Distribute the EXE - users just double-click to install

**Option B: Direct Installation**
1. Extract ZIP on Windows machine
2. Right-click `install.bat`
3. Select "Run as Administrator"
4. Follow installation prompts

**Option C: Silent Installation**
```batch
install.bat /silent
```

### 2. **Standalone Windows Executable**
- **File**: `cmdb-agent-win.exe` (42 MB)
- **Best for**: Portable installation, no installer needed

#### How to use:
1. Copy `cmdb-agent-win.exe` to desired location
2. Create `config.json` in the same directory:
```json
{
  "apiUrl": "http://your-api-server:3000",
  "apiKey": "your-api-key",
  "agentName": "My Computer",
  "scanInterval": 300000,
  "logLevel": "info"
}
```
3. Run: `cmdb-agent-win.exe`

### 3. **Linux Self-Extracting Archive**
- **File**: `cmdb-agent-setup-1.0.0.run` (16 MB)
- **Checksum**: `a619c9b39a993334c2e269dde391d29aea067ae959defb355f7e1985b59dbe8f`
- **Best for**: Linux installation with automated setup

#### How to use:
```bash
chmod +x cmdb-agent-setup-1.0.0.run
./cmdb-agent-setup-1.0.0.run
```

### 4. **Universal ZIP Package**
- **File**: `cmdb-agent-setup-1.0.0.zip` (16 MB)
- **Checksum**: `d03dc97fa33a846b9c6a388ae0f7f3939a83ae79b99c5599e641673e6ffda120`
- **Best for**: Manual installation or custom deployment

#### Contents:
- Windows executable
- PowerShell installer
- Documentation
- Configuration examples

## Comparison Table

| Package | Size | Platform | Installation Type | Admin Required |
|---------|------|----------|-------------------|----------------|
| **installer-package.zip** | 16 MB | Windows | Professional Installer | Yes (for build) |
| **win.exe** (standalone) | 42 MB | Windows | Portable | No |
| **setup.run** | 16 MB | Linux | Self-extracting | Yes |
| **setup.zip** | 16 MB | All | Manual | Depends |

## Installation Methods Comparison

### Professional Windows EXE Installer (from installer-package.zip)
✅ Professional appearance  
✅ Single EXE file  
✅ Built-in admin check  
✅ Automatic extraction and installation  
✅ Silent installation support  
✅ Uninstaller support  
❌ Requires Windows to build  

### Batch Installer (install.bat)
✅ Simple and fast  
✅ Admin privilege check  
✅ No build step required  
✅ Works on any Windows  
⚠️ Requires extraction first  

### PowerShell Installer (install.ps1)
✅ Configuration wizard  
✅ Interactive prompts  
✅ Creates shortcuts  
✅ Desktop shortcut option  
⚠️ May require execution policy bypass  

### Standalone EXE
✅ No installation needed  
✅ Portable  
✅ Quick deployment  
❌ Manual configuration required  
❌ No shortcuts created  

## Building the Professional EXE Installer

### Prerequisites
- Windows 7 or later
- Administrator privileges
- IExpress (included with Windows)

### Steps

1. **Download and Extract**
   ```
   Extract cmdb-agent-installer-package-1.0.0.zip to a folder
   ```

2. **Build EXE (Command Line)**
   ```cmd
   cd extracted-folder
   iexpress /N installer.sed
   ```

   Or **Build EXE (GUI)**
   ```
   Double-click installer.sed
   Follow the IExpress wizard
   ```

3. **Result**
   ```
   cmdb-agent-installer-1.0.0.exe (approx 42 MB)
   ```

4. **Distribute**
   - Upload to download server
   - Share via file hosting
   - Include in software repository

### What the EXE Installer Does

1. Displays license agreement
2. Prompts for installation confirmation
3. Extracts all files to temporary location
4. Runs `install.bat` which:
   - Checks for admin privileges
   - Launches PowerShell installer
   - Configures CMDB Agent
   - Creates shortcuts
   - Sets up config.json
5. Shows completion message
6. Cleans up temporary files

## Security Notes

### Digital Signing (Recommended for Production)
For production distribution, you should sign the installer:

```cmd
signtool sign /f certificate.pfx /p password /tr http://timestamp.digicert.com cmdb-agent-installer-1.0.0.exe
```

### Checksum Verification
Always provide and verify checksums:

```powershell
# PowerShell - Verify checksum
Get-FileHash -Path "cmdb-agent-installer-package-1.0.0.zip" -Algorithm SHA256
```

```bash
# Linux - Verify checksum
sha256sum -c cmdb-agent-installer-package-1.0.0.zip.sha256
```

## Distribution Checklist

- [ ] Build professional EXE installer on Windows
- [ ] Sign installer with code signing certificate (optional)
- [ ] Verify all checksums match
- [ ] Test installation on clean Windows VM
- [ ] Test silent installation
- [ ] Update download links on website
- [ ] Update API downloads endpoint
- [ ] Create installation guide for end users
- [ ] Test uninstaller functionality

## Checksums

| File | SHA256 Checksum |
|------|-----------------|
| `cmdb-agent-installer-package-1.0.0.zip` | `e3bd373f624f491d4dc45c33fecb717034a13f4b863a92b224e0fd4fa3d488e9` |
| `cmdb-agent-setup-1.0.0.zip` | `d03dc97fa33a846b9c6a388ae0f7f3939a83ae79b99c5599e641673e6ffda120` |
| `cmdb-agent-setup-1.0.0.run` | `a619c9b39a993334c2e269dde391d29aea067ae959defb355f7e1985b59dbe8f` |
| `cmdb-agent-win.exe` | `51fc0c19bc5c311c4a1e4b45ff2eba80fb8f5c70ac8fee69ebd8cf021a59ebef` |

## Support

For issues or questions:
- Check README.md for detailed documentation
- Review BUILD_ON_WINDOWS.txt for Windows-specific instructions
- Ensure all prerequisites are met
- Verify checksums before installation

## License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: 2024-11-18
