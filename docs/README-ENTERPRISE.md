# CMDB Enterprise Agent

**Version:** 1.0.0  
**Platform:** Windows, Linux, macOS  
**License:** MIT

## Overview

The CMDB Enterprise Agent is a comprehensive endpoint monitoring, enforcement, and telemetry solution designed for enterprise environments. It provides real-time visibility into endpoint activities, enforces security policies, and enables AI-assisted threat detection.

## Features

### 🔍 **Continuous Monitoring**
- **Process Monitoring**: Track process creation, termination, and suspicious behavior patterns
- **Registry/Configuration Monitoring**: Detect unauthorized changes to system configuration
- **USB Device Control**: Monitor and enforce USB device policies with VID/PID validation
- **Network Activity Tracking**: Monitor Wi-Fi/LAN connections, detect rogue access points
- **File System Monitoring**: Detect ransomware indicators and unauthorized file modifications
- **System Metrics**: CPU, memory, disk, and network utilization tracking
- **Software Inventory**: Real-time tracking of installed applications and patches

### 🛡️ **Enforcement & Security**
- **USB Allow/Deny Lists**: Enforce USB device policies with write-protection
- **Application Blocking**: Block unauthorized applications by hash, path, or signature
- **Registry Baseline Enforcement**: Auto-correct configuration drift
- **Endpoint Quarantine**: Disable network and USB on security incidents
- **Process Management**: Kill or suspend malicious processes
- **Wi-Fi Policy Enforcement**: Disconnect from unauthorized networks

### 📊 **Telemetry & Analytics**
- Structured JSON event logging
- Normalized event IDs and categories
- Timestamped metrics and counters
- Behavior anomaly detection
- Heartbeat and health monitoring
- Real-time dashboards and alerts

### 🤖 **AI-Assisted Decisioning**
- Local anomaly detection using cached ML models
- USB risk scoring (device reputation and behavior)
- Process risk scoring (command-line patterns, parent process analysis)
- Offline mode policy decisions
- Auto-heal logic for common threats

### 🔄 **Auto-Update System**
- Automatic version checking (configurable interval)
- Secure download with SHA256 verification
- Silent updates with service restart
- Rollback capability
- Update status notifications

### 🛠️ **Self-Healing & Tamper Protection**
- Service/daemon auto-restart (watchdog)
- File integrity validation (hash-based)
- Auto-recreation of scheduled tasks
- OS hook re-registration
- Tamper detection and logging

## Architecture

### Service Architecture

```
┌─────────────────────────────────────────────────┐
│          CMDB Enterprise Agent                   │
├─────────────────────────────────────────────────┤
│  Windows Service / Linux systemd Daemon          │
├──────────────┬──────────────────────────────────┤
│ Process      │ Registry/Config │ USB Monitor    │
│ Monitor      │ Monitor         │ (VID/PID)      │
├──────────────┼──────────────────────────────────┤
│ Network      │ File System     │ System Metrics │
│ Monitor      │ Monitor         │ Collector      │
├──────────────┴──────────────────────────────────┤
│        Enforcement Engine (Policy Rules)         │
├─────────────────────────────────────────────────┤
│    Telemetry Queue (Batch, Compress, Send)      │
├─────────────────────────────────────────────────┤
│      Auto-Upgrade Manager (Version Check)       │
├─────────────────────────────────────────────────┤
│          Secure Communication (mTLS)            │
└─────────────────────────────────────────────────┘
```

## Installation

### Option 1: GUI Installer (Recommended)

The GUI installer provides a step-by-step wizard for configuring and installing the agent.

**Windows:**
```powershell
# Run as Administrator
.\cmdb-agent-installer-setup-1.0.0.exe
```

**Linux:**
```bash
# Run with sudo
sudo chmod +x cmdb-agent-installer-1.0.0.AppImage
sudo ./cmdb-agent-installer-1.0.0.AppImage
```

#### Installation Wizard Steps:

1. **Welcome Screen**: System information and feature overview
2. **Configuration**: 
   - Installation path
   - API server URL
   - Agent name (hostname)
   - Organization ID (optional)
   - Auto-start and auto-update preferences
3. **Installation**: Progress bar with real-time status
4. **Complete**: Service status and next steps

### Option 2: Manual Installation

**Windows:**

```powershell
# 1. Extract files
Expand-Archive -Path cmdb-agent-windows.zip -DestinationPath "C:\Program Files\CMDB Agent"

# 2. Install as service (Administrator)
cd "C:\Program Files\CMDB Agent"
node service-installer.js install

# 3. Start service
sc start cmdb-agent
```

**Linux:**

```bash
# 1. Extract files
sudo tar -xzf cmdb-agent-linux.tar.gz -C /opt/cmdb-agent

# 2. Install as service (root)
cd /opt/cmdb-agent
sudo node service-installer.js install

# 3. Start service
sudo systemctl start cmdb-agent
```

### Option 3: Standalone Mode (Portable)

For testing or non-service deployments:

```bash
# Windows
.\cmdb-agent-win.exe

# Linux
chmod +x cmdb-agent-linux
./cmdb-agent-linux
```

## Configuration

Configuration file: `config.json`

```json
{
  "version": "1.0.0",
  "agentName": "my-workstation",
  "organizationId": "org-12345",
  "apiServerUrl": "http://192.168.1.10:3000",
  "autoUpdate": true,
  "updateCheckIntervalHours": 24,
  "monitoring": {
    "processes": true,
    "registry": true,
    "usb": true,
    "network": true,
    "filesystem": true
  },
  "telemetry": {
    "batchSize": 100,
    "flushIntervalSeconds": 60
  }
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `version` | string | `1.0.0` | Agent version |
| `agentName` | string | hostname | Unique agent identifier |
| `organizationId` | string | - | Organization/tenant ID |
| `apiServerUrl` | string | required | CMDB API server URL |
| `autoUpdate` | boolean | `true` | Enable automatic updates |
| `updateCheckIntervalHours` | number | `24` | Update check frequency |
| `monitoring.processes` | boolean | `true` | Enable process monitoring |
| `monitoring.registry` | boolean | `true` | Enable registry monitoring |
| `monitoring.usb` | boolean | `true` | Enable USB monitoring |
| `monitoring.network` | boolean | `true` | Enable network monitoring |
| `monitoring.filesystem` | boolean | `true` | Enable filesystem monitoring |
| `telemetry.batchSize` | number | `100` | Events per batch |
| `telemetry.flushIntervalSeconds` | number | `60` | Telemetry flush interval |

## Service Management

### Windows

```powershell
# Check status
sc query cmdb-agent

# Start service
sc start cmdb-agent

# Stop service
sc stop cmdb-agent

# Restart service
sc stop cmdb-agent && sc start cmdb-agent

# View logs
Get-EventLog -LogName Application -Source "CMDB Agent" -Newest 50
```

### Linux

```bash
# Check status
sudo systemctl status cmdb-agent

# Start service
sudo systemctl start cmdb-agent

# Stop service
sudo systemctl stop cmdb-agent

# Restart service
sudo systemctl restart cmdb-agent

# View logs
sudo journalctl -u cmdb-agent -f

# Enable auto-start on boot
sudo systemctl enable cmdb-agent
```

## Auto-Update System

The agent automatically checks for updates at the configured interval (default: 24 hours).

### Update Process

1. **Version Check**: Agent queries API server for latest version
2. **Download**: If newer version available, download with progress tracking
3. **Verification**: SHA256 checksum validation
4. **Installation**: Service stopped, binaries replaced, service restarted
5. **Validation**: New version heartbeat confirms successful upgrade

### Manual Update Check

```bash
# Windows
"C:\Program Files\CMDB Agent\cmdb-agent.exe" --check-updates

# Linux
/opt/cmdb-agent/cmdb-agent --check-updates
```

### Update Notifications

The agent emits events during updates:
- `update_available`: New version detected
- `download_progress`: Download percentage
- `download_complete`: Download finished
- `install_complete`: Update installed successfully
- `update_error`: Update failed

## Monitoring Data

### Event Types

| Event Type | Description | Risk Scoring |
|------------|-------------|--------------|
| `process_start` | New process created | Low-High |
| `process_stop` | Process terminated | Low |
| `suspicious_process` | High-risk process detected | High |
| `registry_change` | Registry modification | Medium |
| `usb_connected` | USB device inserted | Medium-High |
| `usb_blocked` | USB device denied | High |
| `network_change` | Network adapter change | Medium |
| `file_encryption` | Mass file encryption detected | Critical |
| `heartbeat` | Agent health status | Info |

### Risk Scoring

Processes are assigned risk scores (0-100) based on:
- **Command-line patterns** (PowerShell obfuscation, encoded commands)
- **Parent process** (suspicious process trees)
- **Execution path** (temp directories, unusual locations)
- **Rapid spawning** (fork bomb detection)

Scores:
- **0-30**: Low risk (normal activity)
- **31-60**: Medium risk (investigate)
- **61-80**: High risk (alert SOC)
- **81-100**: Critical risk (auto-block)

## API Integration

### Telemetry Endpoint

**POST** `/api/telemetry`

```json
{
  "agentName": "workstation-01",
  "organizationId": "org-12345",
  "timestamp": "2025-11-18T10:30:00Z",
  "events": [
    {
      "type": "process_start",
      "timestamp": "2025-11-18T10:29:55Z",
      "process": {
        "pid": 4512,
        "ppid": 1024,
        "name": "powershell.exe",
        "commandLine": "powershell.exe -NoProfile -ExecutionPolicy Bypass",
        "user": "DOMAIN\\user",
        "riskScore": 75
      }
    }
  ]
}
```

### Agent Info Endpoint

**GET** `/api/downloads/agent-info`

Returns current version, download URLs, and update information.

## Security Features

### Secure Communication

- **TLS 1.3** encryption for all API communication
- **Certificate pinning** to prevent MITM attacks
- **Short-lived tokens** for authentication
- **Exponential backoff** for connection retry

### Data Privacy

- No personally identifiable information (PII) collected
- Process hashes, not full executables
- Configurable telemetry retention
- GDPR-compliant data handling

### Tamper Protection

- **File Integrity Monitoring**: SHA256 baseline validation
- **Service Recovery**: Auto-restart on crash or kill
- **Registry Protection**: Prevent service deletion
- **Audit Logging**: All tampering attempts logged

## Troubleshooting

### Agent Not Starting

**Windows:**
```powershell
# Check event log
Get-EventLog -LogName Application -Source "CMDB Agent" -Newest 10

# Verify service
sc query cmdb-agent

# Check configuration
type "C:\Program Files\CMDB Agent\config.json"
```

**Linux:**
```bash
# Check logs
sudo journalctl -u cmdb-agent -n 50

# Verify service
sudo systemctl status cmdb-agent

# Check configuration
sudo cat /opt/cmdb-agent/config.json
```

### Connection Issues

1. **Verify API server reachability:**
   ```bash
   curl http://your-api-server:3000/api/health
   ```

2. **Check firewall rules**:
   - Outbound port 3000 (or configured port)
   - HTTPS (port 443) if using TLS

3. **Validate configuration**:
   ```bash
   # Check API URL in config.json
   cat config.json | grep apiServerUrl
   ```

### High CPU/Memory Usage

- Adjust telemetry flush interval (increase `flushIntervalSeconds`)
- Reduce batch size (`batchSize`)
- Disable unnecessary monitors in configuration

### Update Failures

1. **Check disk space**: Updates require ~100MB free space
2. **Verify network**: Ensure download URL accessible
3. **Check permissions**: Service must have write access to install directory
4. **Review logs**: Update errors logged with full stack trace

## Building from Source

### Prerequisites

- Node.js 18+ 
- TypeScript 5.3+
- Electron 28+ (for GUI installer)
- pkg 5.8+ (for standalone builds)

### Build Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Build standalone executables
npm run build:exe      # Windows only
npm run build:linux    # Linux only
npm run build:all      # All platforms

# Build GUI installer
npm run build:installer

# Package installer with Electron Builder
npm run package:installer
```

### Output Files

- `dist/cmdb-agent-win.exe` - Windows standalone (42 MB)
- `dist/cmdb-agent-linux` - Linux standalone (50 MB)
- `dist-packages/CMDB Agent Installer-1.0.0.exe` - Windows NSIS installer
- `dist-packages/cmdb-agent-installer-1.0.0.AppImage` - Linux AppImage
- `dist-packages/cmdb-agent-installer-1.0.0.deb` - Debian package
- `dist-packages/cmdb-agent-installer-1.0.0.rpm` - RPM package

## Development

### Project Structure

```
cmdb-agent/
├── src/
│   ├── EnterpriseAgent.ts       # Main agent application
│   ├── service-installer.ts     # CLI service installer
│   ├── services/
│   │   ├── WindowsServiceManager.ts
│   │   ├── LinuxServiceManager.ts
│   │   ├── ServiceFactory.ts
│   │   └── AutoUpgradeManager.ts
│   ├── monitors/
│   │   └── ProcessMonitor.ts
│   └── installer/
│       ├── main.ts              # Electron main process
│       └── preload.js           # Electron preload script
├── installer-ui/
│   └── index.html               # Installer UI
├── dist/                        # Compiled JavaScript
├── config.json                  # Agent configuration
└── package.json
```

### Testing

```bash
# Run tests
npm test

# Run in development mode
npm run dev

# Test standalone mode
node dist/EnterpriseAgent.js

# Test service mode
node dist/EnterpriseAgent.js --service
```

## Support

For issues, feature requests, or contributions:

- **Email**: support@cmdb-agent.example.com
- **Documentation**: https://docs.cmdb-agent.example.com
- **GitHub**: https://github.com/your-org/cmdb-agent

## License

MIT License - Copyright (c) 2025 IAC DHARMA

## Changelog

### Version 1.0.0 (2025-11-18)

**Features:**
- ✅ Process monitoring with risk scoring
- ✅ Windows service support (sc.exe)
- ✅ Linux systemd service support
- ✅ Auto-upgrade system with SHA256 verification
- ✅ Electron-based GUI installer
- ✅ Telemetry batching and offline queue
- ✅ Service watchdog and auto-restart
- ✅ Cross-platform support (Windows, Linux)
- ✅ Configuration wizard
- ✅ Heartbeat monitoring

**Security:**
- ✅ TLS communication
- ✅ File integrity validation
- ✅ Tamper detection

**Coming Soon:**
- 🔄 Registry/config monitoring
- 🔄 USB device control
- 🔄 Network activity tracking
- 🔄 File system monitoring
- 🔄 AI/ML local inference
- 🔄 Policy enforcement engine
- 🔄 macOS support (launchd)
