# CMDB Agent Package Build Guide

Complete guide for building all platform-specific packages for CMDB Agent distribution.

## 📦 Build Scripts Overview

### Master Build Script

**Location**: `backend/cmdb-agent/build-all.sh`

Builds all packages in one command:

```bash
cd backend/cmdb-agent
./build-all.sh 1.0.0
```

**Creates**:
- Windows MSI installer
- macOS PKG installer  
- Linux DEB package (Debian/Ubuntu)
- Linux RPM package (RHEL/CentOS/Fedora)
- Standalone executables (Windows/Linux/macOS)
- SHA-256 checksums
- Release notes

**Output**: `dist/packages/` directory

---

## 🪟 Windows MSI Installer

### Prerequisites

- **WiX Toolset 3.11+**: https://wixtoolset.org/
- **Node.js 18+**: https://nodejs.org/
- **pkg**: `npm install -g pkg`
- **Windows OS** (or Wine on Linux)

### Build Commands

```powershell
cd backend/cmdb-agent

# Build MSI (x64)
.\build-msi.ps1 -Version "1.0.0"

# Build MSI (x86)
.\build-msi.ps1 -Version "1.0.0" -Architecture "x86"
```

### Files Created

- `dist/installers/CMDBAgent-1.0.0-x64.msi` - Installer package
- `dist/installers/CMDBAgent-1.0.0-x64.msi.sha256` - Checksum

### Installation

```powershell
# Interactive
msiexec /i CMDBAgent-1.0.0-x64.msi

# Silent with config
msiexec /i CMDBAgent-1.0.0-x64.msi /qn ^
  CMDB_SERVER_URL="https://cmdb.example.com" ^
  CMDB_API_KEY="your-api-key" ^
  AUTO_UPDATE="true"

# Uninstall
msiexec /x CMDBAgent-1.0.0-x64.msi /qn
```

### Features

- GUI installer wizard with configuration
- Windows Service creation (auto-start)
- Registry entries
- Firewall rules
- Start menu shortcuts
- Silent installation support
- Upgrade support (preserves config)

---

## 🐧 Linux DEB Package

### Prerequisites

- **dpkg-deb**: Usually pre-installed
- **Node.js 18+**: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
- **pkg**: `npm install -g pkg`

### Build Commands

```bash
cd backend/cmdb-agent
./build-deb.sh 1.0.0
```

### Files Created

- `dist/cmdb-agent_1.0.0_amd64.deb` - DEB package

### Installation

```bash
# Install
sudo dpkg -i cmdb-agent_1.0.0_amd64.deb

# Configure
sudo nano /etc/cmdb-agent/environment

# Add:
CMDB_SERVER_URL=https://cmdb.example.com
CMDB_API_KEY=your-api-key
AUTO_UPDATE=true

# Start service
sudo systemctl start cmdb-agent
sudo systemctl enable cmdb-agent

# Verify
sudo systemctl status cmdb-agent

# Uninstall
sudo dpkg -r cmdb-agent
```

### Supported Distributions

- Ubuntu 18.04+
- Debian 10+
- Linux Mint 19+

---

## 🐧 Linux RPM Package

### Prerequisites

- **rpmbuild**: `sudo yum install rpm-build`
- **Node.js 18+**: `curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -`
- **pkg**: `npm install -g pkg`

### Build Commands

```bash
cd backend/cmdb-agent
./build-rpm.sh 1.0.0
```

### Files Created

- `~/rpmbuild/RPMS/x86_64/cmdb-agent-1.0.0-1.x86_64.rpm` - RPM package

### Installation

```bash
# Install
sudo rpm -ivh cmdb-agent-1.0.0-1.x86_64.rpm

# Or with yum/dnf
sudo yum install cmdb-agent-1.0.0-1.x86_64.rpm
sudo dnf install cmdb-agent-1.0.0-1.x86_64.rpm

# Configure
sudo nano /etc/cmdb-agent/environment

# Start service
sudo systemctl start cmdb-agent
sudo systemctl enable cmdb-agent

# Uninstall
sudo rpm -e cmdb-agent
```

### Supported Distributions

- RHEL 7+, 8+
- CentOS 7+, 8+
- Fedora 30+
- Amazon Linux 2

---

## 🍎 macOS PKG Installer

### Prerequisites

- **macOS 10.13+**
- **Xcode Command Line Tools**: `xcode-select --install`
- **Node.js 18+**: `brew install node@18`
- **pkg**: `npm install -g pkg`

### Build Commands

```bash
cd backend/cmdb-agent
./build-macos-pkg.sh 1.0.0
```

### Files Created

- `dist/CMDBAgent-1.0.0.pkg` - PKG installer

### Installation

```bash
# Install
sudo installer -pkg CMDBAgent-1.0.0.pkg -target /

# Configure
sudo nano /etc/cmdb-agent/config.json

# Service starts automatically via LaunchDaemon

# Verify
sudo launchctl list | grep cmdb-agent

# Uninstall
sudo launchctl unload /Library/LaunchDaemons/com.iacdharma.cmdb-agent.plist
sudo rm -rf /usr/local/bin/cmdb-agent
sudo rm /Library/LaunchDaemons/com.iacdharma.cmdb-agent.plist
```

---

## 📤 Upload to CMDB Server

After building packages, upload to CMDB server for distribution:

```bash
# Upload Windows MSI
curl -X POST http://localhost:3001/api/updates/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "package=@dist/packages/CMDBAgent-1.0.0-x64.msi" \
  -F "version=1.0.0" \
  -F "platform=windows" \
  -F "architecture=x64"

# Upload Linux DEB
curl -X POST http://localhost:3001/api/updates/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "package=@dist/packages/cmdb-agent_1.0.0_amd64.deb" \
  -F "version=1.0.0" \
  -F "platform=linux" \
  -F "architecture=amd64"

# Upload Linux RPM
curl -X POST http://localhost:3001/api/updates/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "package=@~/rpmbuild/RPMS/x86_64/cmdb-agent-1.0.0-1.x86_64.rpm" \
  -F "version=1.0.0" \
  -F "platform=linux" \
  -F "architecture=x86_64"

# Upload macOS PKG
curl -X POST http://localhost:3001/api/updates/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "package=@dist/packages/CMDBAgent-1.0.0.pkg" \
  -F "version=1.0.0" \
  -F "platform=macos" \
  -F "architecture=x64"
```

---

## 🔐 Checksum Verification

All packages include SHA-256 checksums in `SHA256SUMS.txt`:

```bash
# Verify Windows MSI
Get-FileHash CMDBAgent-1.0.0-x64.msi -Algorithm SHA256

# Verify Linux packages
sha256sum cmdb-agent_1.0.0_amd64.deb
sha256sum cmdb-agent-1.0.0-1.x86_64.rpm

# Verify macOS PKG
shasum -a 256 CMDBAgent-1.0.0.pkg

# Compare with SHA256SUMS.txt
cat SHA256SUMS.txt
```

---

## 🚀 Push Updates to Agents

After uploading packages, push updates to deployed agents:

```bash
# Push Windows update to all agents
curl -X POST http://localhost:3001/api/updates/push \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "updateId": "windows-x64-1.0.0",
    "targetAgents": "all",
    "mandatory": false,
    "rolloutPercentage": 100
  }'

# Push Linux DEB update
curl -X POST http://localhost:3001/api/updates/push \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "updateId": "linux-amd64-1.0.0",
    "targetAgents": "all"
  }'
```

---

## 📊 Monitoring Updates

Track update deployment progress:

```bash
# Check update status
curl http://localhost:3001/api/updates/status/windows-x64-1.0.0 \
  -H "Authorization: Bearer YOUR_API_KEY"

# List all agents
curl http://localhost:3001/api/agents/list \
  -H "Authorization: Bearer YOUR_API_KEY"

# View agent versions
curl http://localhost:3001/api/agents/versions \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## 🧪 Testing Packages

### Windows

```powershell
# Install in test VM
msiexec /i CMDBAgent-1.0.0-x64.msi /qn CMDB_SERVER_URL="https://test.example.com" CMDB_API_KEY="test-key"

# Verify service
Get-Service CMDBAgent

# Check logs
Get-Content "C:\Program Files\IAC Dharma CMDB Agent\logs\agent.log"

# Test agent endpoint
Invoke-WebRequest http://localhost:3000/health
```

### Linux (DEB)

```bash
# Install in container
docker run -it ubuntu:22.04 bash
apt update && apt install -y ./cmdb-agent_1.0.0_amd64.deb

# Configure
echo "CMDB_SERVER_URL=https://test.example.com" > /etc/cmdb-agent/environment
echo "CMDB_API_KEY=test-key" >> /etc/cmdb-agent/environment

# Start
systemctl start cmdb-agent

# Test
curl http://localhost:3000/health
```

### Linux (RPM)

```bash
# Install in container
docker run -it rockylinux:8 bash
yum install -y cmdb-agent-1.0.0-1.x86_64.rpm

# Configure and test (same as DEB)
```

### macOS

```bash
# Install
sudo installer -pkg CMDBAgent-1.0.0.pkg -target /

# Configure
sudo nano /etc/cmdb-agent/config.json

# Verify LaunchDaemon
sudo launchctl list | grep cmdb-agent

# Test
curl http://localhost:3000/health
```

---

## 📝 Release Checklist

- [ ] Build all packages (Windows, Linux DEB, Linux RPM, macOS)
- [ ] Verify checksums
- [ ] Test installation on each platform
- [ ] Test agent functionality (data collection, API communication)
- [ ] Test auto-update mechanism
- [ ] Upload packages to CMDB server
- [ ] Update download page with new version
- [ ] Create release notes
- [ ] Tag git repository with version
- [ ] Announce release

---

## 🐛 Troubleshooting

### WiX Build Fails

```powershell
# Check WiX installation
candle.exe -?
light.exe -?

# Reinstall WiX Toolset
# Download from https://wixtoolset.org/
```

### DEB Build Fails

```bash
# Install dependencies
sudo apt install -y dpkg-dev debhelper

# Check package structure
dpkg-deb --contents cmdb-agent_1.0.0_amd64.deb
```

### RPM Build Fails

```bash
# Setup RPM build environment
rpmdev-setuptree

# Check spec file
rpmlint ~/rpmbuild/SPECS/cmdb-agent.spec
```

### pkg Fails

```bash
# Update pkg
npm install -g pkg@latest

# Use specific Node.js target
pkg package.json --targets node18-linux-x64
```

---

## 📚 Additional Resources

- WiX Toolset: https://wixtoolset.org/documentation/
- Debian Packaging: https://www.debian.org/doc/manuals/maint-guide/
- RPM Packaging: https://rpm-packaging-guide.github.io/
- macOS Installer: https://developer.apple.com/library/archive/documentation/DeveloperTools/Reference/DistributionDefinitionRef/

---

**Next**: After building packages, access the download page at `http://localhost:5173/downloads`
