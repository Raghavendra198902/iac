# CMDB Agent - Multi-Platform Support

Complete CMDB agent implementation for all major operating systems and devices.

## 📋 Supported Platforms

### Desktop Operating Systems
- ✅ **Windows** (7, 8, 10, 11, Server 2012+)
- ✅ **Linux** (Ubuntu, Debian, RHEL, CentOS, Fedora, Arch, etc.)
- ✅ **macOS** (10.13+ High Sierra and later)

### Mobile Operating Systems
- ✅ **Android** (6.0+, requires Termux or root access)
- ✅ **iOS** (11.0+, requires jailbreak or MDM integration)

### Unix Systems
- 🔄 **FreeBSD** (Planned)
- 🔄 **Solaris/illumos** (Planned)
- 🔄 **AIX** (Planned)

## 🚀 Quick Start

### Universal Agent (Auto-Detection)

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
node dist/agents/universal-agent.js
```

### Platform-Specific Agents

#### Windows
```powershell
# Set environment variables
$env:CMDB_SERVER_URL="http://your-server:3001"
$env:CMDB_API_KEY="your-api-key"
$env:COLLECTION_INTERVAL="300000"

# Run agent
node dist/agents/windows-agent.js
```

#### Linux
```bash
# Set environment variables
export CMDB_SERVER_URL="http://your-server:3001"
export CMDB_API_KEY="your-api-key"
export COLLECTION_INTERVAL="300000"

# Run agent
node dist/agents/linux-agent.js
```

#### macOS
```bash
# Set environment variables
export CMDB_SERVER_URL="http://your-server:3001"
export CMDB_API_KEY="your-api-key"
export COLLECTION_INTERVAL="300000"

# Run agent (may require sudo for some features)
sudo node dist/agents/macos-agent.js
```

#### Android (Termux)
```bash
# Install Termux from F-Droid
pkg install nodejs
npm install

# Set environment variables
export CMDB_SERVER_URL="http://your-server:3001"
export CMDB_API_KEY="your-api-key"

# Run agent
node dist/agents/android-agent.js
```

#### iOS (Jailbroken)
```bash
# Install Node.js via Cydia
# Install dependencies
npm install

# Set environment variables
export CMDB_SERVER_URL="http://your-server:3001"
export CMDB_API_KEY="your-api-key"

# Run agent
node dist/agents/ios-agent.js
```

## 📊 Data Collection

### Windows Agent Collects:
- ✅ OS version and build number
- ✅ CPU information (via WMI)
- ✅ Memory usage
- ✅ Disk information (all drives)
- ✅ Network interfaces
- ✅ Windows services (running/stopped)
- ✅ Installed software (via WMI)
- ✅ Windows features (DISM)
- ✅ Domain/workgroup information
- ✅ Windows updates (via PowerShell)
- ✅ Last boot time

### Linux Agent Collects:
- ✅ Distribution and version
- ✅ Kernel version
- ✅ CPU information
- ✅ Memory usage (total, free, cached, buffers)
- ✅ Disk information (all partitions)
- ✅ Network interfaces (with IPs and MACs)
- ✅ systemd services
- ✅ Installed packages (apt/yum/dnf)
- ✅ Top processes
- ✅ Security info (SELinux, AppArmor, firewall)
- ✅ Pending updates
- ✅ Load average

### macOS Agent Collects:
- ✅ macOS version and build
- ✅ CPU information
- ✅ Memory usage (including wired and compressed)
- ✅ Disk information
- ✅ Network interfaces
- ✅ Launch agents and daemons
- ✅ Homebrew packages
- ✅ Installed applications
- ✅ System profiler data
- ✅ Security settings (firewall, Gatekeeper, SIP, FileVault)
- ✅ Time Machine status
- ✅ Last boot time

### Android Agent Collects:
- ✅ Device model and manufacturer
- ✅ Android version and API level
- ✅ CPU architecture and cores
- ✅ Memory usage
- ✅ Storage (internal/external)
- ✅ Battery status, level, temperature
- ✅ Network type and connectivity
- ✅ Installed apps (limited)
- ✅ Security settings
- ✅ Location services status

### iOS Agent Collects:
- ✅ Device model and name
- ✅ iOS version and build
- ✅ UDID and serial number
- ✅ CPU architecture
- ✅ Memory usage
- ✅ Storage usage
- ✅ Battery status
- ✅ Network connectivity
- ✅ Installed apps (jailbroken only)
- ✅ Security settings
- ✅ Jailbreak detection
- ✅ Activation lock status

## ⚙️ Configuration

### Environment Variables

```bash
# Required
CMDB_SERVER_URL=http://your-cmdb-server:3001
CMDB_API_KEY=your-secret-api-key

# Optional
COLLECTION_INTERVAL=300000  # 5 minutes in milliseconds
AGENT_NAME=my-custom-name
LOG_LEVEL=info
```

### Configuration File (.env)

```env
# Server Configuration
CMDB_SERVER_URL=http://localhost:3001
CMDB_API_KEY=your-api-key-here

# Agent Configuration
COLLECTION_INTERVAL=300000
AGENT_NAME=Production Server 01

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/cmdb-agent.log
```

## 🔐 Security Considerations

### API Authentication
All agents support API key authentication via the `Authorization: Bearer <token>` header.

### Data Privacy
- No personally identifiable information (PII) is collected
- Network traffic is sent over HTTPS (configure server URL with https://)
- Sensitive data is never logged

### Permissions Required

**Windows:**
- Standard user for basic metrics
- Administrator for full service monitoring
- WMI access for detailed information

**Linux:**
- Standard user for basic metrics
- Root/sudo for full system information
- SELinux/AppArmor permissions may be required

**macOS:**
- Standard user for basic metrics
- Sudo for full system profiler access
- Security & Privacy permissions for some features

**Android:**
- Termux installation for non-rooted devices
- Root access for full app listing
- Storage permissions

**iOS:**
- Jailbreak required for full functionality
- MDM integration recommended for production
- Some features require specific entitlements

## 📦 Installation Methods

### NPM Package
```bash
npm install -g @iac-dharma/cmdb-agent
cmdb-agent
```

### Docker
```bash
docker run -d \
  -e CMDB_SERVER_URL=http://your-server:3001 \
  -e CMDB_API_KEY=your-api-key \
  --name cmdb-agent \
  iac-dharma/cmdb-agent
```

### Standalone Executables

Download platform-specific binaries from releases:
- `cmdb-agent-windows-x64.exe`
- `cmdb-agent-linux-x64`
- `cmdb-agent-macos-x64`

### System Service

#### Windows Service
```powershell
npm run install-service-win
```

#### Linux systemd
```bash
sudo npm run install-service-linux
```

#### macOS LaunchAgent
```bash
sudo npm run install-service-mac
```

## 🔄 Auto-Update

Agents can automatically update themselves:

```bash
# Enable auto-update
export AUTO_UPDATE=true
export UPDATE_CHANNEL=stable  # or 'beta'
```

## 📈 Monitoring

View agent status:
```bash
curl http://localhost:3001/api/cmdb/agents
```

View specific agent:
```bash
curl http://localhost:3001/api/cmdb/agents/{agentId}
```

## 🐛 Troubleshooting

### Agent Not Sending Data
1. Check network connectivity
2. Verify API key is correct
3. Check server URL is accessible
4. Review agent logs

### High Memory Usage
1. Increase collection interval
2. Limit data collection scope
3. Check for memory leaks in logs

### Permission Errors
1. Run with elevated privileges
2. Check file permissions
3. Verify firewall rules

## 🔧 Development

### Build All Agents
```bash
npm run build
```

### Test Specific Agent
```bash
# Windows
npm run test:windows

# Linux
npm run test:linux

# macOS
npm run test:macos

# Android
npm run test:android

# iOS
npm run test:ios
```

### Package Executables
```bash
npm run package
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please see CONTRIBUTING.md

## 📞 Support

- Documentation: https://docs.iacdharma.com
- Issues: https://github.com/iacdharma/cmdb-agent/issues
- Email: support@iacdharma.com
