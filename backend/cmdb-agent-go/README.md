# CMDB Agent

> **Production-Ready v1.0.0** - Unified, lightweight, cross-platform endpoint agent for comprehensive IT asset management, monitoring, and automation.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Go Version](https://img.shields.io/badge/go-1.22+-00ADD8.svg)](https://go.dev/)
[![Platforms](https://img.shields.io/badge/platforms-Windows%20%7C%20Linux%20%7C%20macOS-success.svg)](#supported-platforms)
[![Release](https://img.shields.io/badge/release-v1.0.0-green.svg)](https://github.com/Raghavendra198902/iac/releases)

## 🚀 Quick Start

**Download Now:** [http://192.168.1.9:5173/agents/downloads](http://192.168.1.9:5173/agents/downloads)

Choose your platform and follow the [Quick Start Guide](QUICKSTART.md) for installation in 5 minutes.

---

## ✨ Features

### Core Capabilities
- 📊 **Automated Inventory Collection** – Hardware, software, network, services
- 🔍 **Real-time Monitoring** – System health, resource usage, telemetry
- 🌐 **Built-in Web UI** – Interactive dashboard on port 8080
- 🔐 **Secure Communication** – mTLS/OAuth2 authentication
- ⚙️ **Configuration Management** – YAML-based, hot-reload support
- 🛠️ **CLI Tools** – Command-line interface for management
- 🔄 **Service Integration** – Windows Service, systemd, LaunchDaemon
- 📝 **Comprehensive Logging** – Debug, info, warn, error levels

### Coming Soon (v1.1+)
- 🎯 **Policy Enforcement** – Automated compliance and remediation
- 📦 **Deployment Automation** – Software/patch deployment with rollback
- 🔒 **Certificate Management** – SSL/TLS certificate discovery and tracking
- 👥 **User & Group Auditing** – Complete user management tracking

See the [Roadmap](ROADMAP.md) for detailed future plans.

---

## 🖥️ Supported Platforms

| Platform | Architecture | Package Size | Status |
|----------|-------------|--------------|--------|
| **Windows** | x64 | 6.0 MB | ✅ Ready |
| **Linux** | AMD64 | 5.9 MB | ✅ Ready |
| **Linux** | ARM64 | 5.3 MB | ✅ Ready |
| **macOS** | Intel | 5.9 MB | ✅ Ready |
| **macOS** | Apple Silicon | 5.5 MB | ✅ Ready |

**Requirements:**
- Windows 10/11, Server 2016+
- Linux: RHEL/CentOS 7+, Ubuntu 18.04+, Debian 10+
- macOS 10.15+ (Catalina or later)
- 100 MB RAM minimum
- 50 MB disk space

---

## 📥 Installation

### Quick Install

**Windows:**
```powershell
# Download and extract
Expand-Archive cmdb-agent-windows-1.0.0.zip -DestinationPath C:\cmdb-agent

# Run as Administrator
cd C:\cmdb-agent\cmdb-agent-windows-1.0.0
.\Install.ps1
```

**Linux:**
```bash
# Download
wget https://github.com/Raghavendra198902/iac/releases/download/v1.0.0/cmdb-agent-linux-amd64.tar.gz

# Extract
tar -xzf cmdb-agent-linux-amd64.tar.gz

# Install
sudo ./install.sh
```

**macOS:**
```bash
# Download and install
curl -O https://github.com/Raghavendra198902/iac/releases/download/v1.0.0/cmdb-agent-darwin-universal.pkg
sudo installer -pkg cmdb-agent-darwin-universal.pkg -target /
```

### Build from source

```bash
# Install Go 1.21+
# Clone repository
git clone https://github.com/iac/cmdb-agent.git
cd backend/cmdb-agent-go

# Build
./build.sh 1.0.0

# Binaries will be in dist/
```

### Install on Linux

```bash
# DEB-based (Ubuntu, Debian)
sudo dpkg -i cmdb-agent-1.0.0-amd64.deb

# RPM-based (RHEL, CentOS, Rocky)
sudo rpm -i cmdb-agent-1.0.0-1.x86_64.rpm

# Edit configuration
sudo vim /etc/cmdb-agent/config.yaml

# Restart agent
sudo systemctl restart cmdb-agent
```

### Install on Windows

```powershell
# Extract the downloaded ZIP file
Expand-Archive -Path "cmdb-agent-windows-1.0.0.zip" -DestinationPath "C:\Temp\cmdb-agent"

# Edit configuration (before installation)
notepad C:\Temp\cmdb-agent\cmdb-agent-windows-1.0.0\config.yaml

# Install service (run as Administrator)
cd C:\Temp\cmdb-agent\cmdb-agent-windows-1.0.0
.\install-windows.ps1

# Service management
Start-Service CMDBAgent
Stop-Service CMDBAgent
Restart-Service CMDBAgent
Get-Service CMDBAgent

# Access Web UI
Start-Process "http://localhost:8080"
# Default: admin/changeme
```

See [WINDOWS_BUILD_GUIDE.md](WINDOWS_BUILD_GUIDE.md) for detailed Windows instructions.

### Install on macOS

```bash
# Install PKG
sudo installer -pkg cmdb-agent-darwin-universal.pkg -target /

# Edit configuration
sudo vim /etc/cmdb-agent/config.yaml

# Manage service
sudo launchctl load /Library/LaunchDaemons/com.iac.cmdb-agent.plist
sudo launchctl unload /Library/LaunchDaemons/com.iac.cmdb-agent.plist
```

### Configuration

Edit `/etc/cmdb-agent/config.yaml`:

```yaml
server:
  primary: https://cmdb.example.com:8443
  ca_bundle: /etc/cmdb-agent/ca.pem

agent:
  collectors:
    - name: system
      schedule: "@hourly"
      enabled: true

auth:
  method: mTLS
  cert_file: /etc/cmdb-agent/agent.crt
  key_file: /etc/cmdb-agent/agent.key
```

See `config.example.yaml` for full configuration options.

## CLI Usage

```bash
# Check status
cmdb-agent-cli status

# Run collector manually
cmdb-agent-cli scan software incremental

# Force push queued data
cmdb-agent-cli flush

# Enroll with CMDB
cmdb-agent-cli enroll --token=YOUR_TOKEN

# List active policies
cmdb-agent-cli policy list

# Test policy (dry-run)
cmdb-agent-cli policy test POLICY-001
```

## Development

### Project Structure

```
cmd/
  cmdb-agent/       # Main agent binary
  cmdb-agent-cli/   # CLI tool
internal/
  agent/            # Core agent logic
  api/              # Local API server
  collectors/       # Data collectors
  config/           # Configuration
  deployment/       # Deployment manager
  enforcement/      # Policy enforcement
  logger/           # Logging
  queue/            # Local queue (BoltDB)
  scheduler/        # Cron scheduler
  transport/        # HTTP transport
systemd/            # Systemd service files
```

### Run tests

```bash
go test ./...
```

### Build packages

```bash
# Windows package (ZIP with installer)
./package-windows.sh 1.0.0
# Output: dist/release/cmdb-agent-windows-1.0.0.zip

# Windows MSI installer (requires msitools)
./build-windows-msi.sh 1.0.0 x64
# Output: dist/cmdb-agent-1.0.0-x64.msi

# DEB package
./build-deb.sh 1.0.0 amd64

# RPM package
./build-rpm.sh 1.0.0 x86_64
```

## API Endpoints

### Agent → CMDB (push)

- `POST /api/v1/agent/ci` – Batch CI data
- `POST /api/v1/agent/telemetry` – Heartbeat and stats
- `GET /api/v1/agent/config` – Fetch config
- `GET /api/v1/agent/policy` – Fetch policies
- `GET /api/v1/agent/deployments` – Pending deployment jobs

### Local control (UNIX socket)

- `GET /status` – Agent status
- `POST /scan?collector=X&mode=Y` – Trigger collector
- `POST /flush` – Force push queue
- `POST /update` – Trigger self-update
- `GET /policy/list` – List policies
- `POST /policy/test?id=X` – Test policy

## Security

- **Authentication**: mTLS with device certificates or OAuth2 client credentials
- **Transport**: TLS 1.2+ (prefer TLS 1.3)
- **Local secrets**: Encrypted storage using OS keystore
- **Code signing**: All binaries and updates signed
- **Least privilege**: Collectors run with minimal permissions

## Performance

- **Memory**: < 50MB RSS idle
- **CPU**: < 5% on 1-core system during scan
- **Disk**: Embedded DB < 100MB
- **Network**: Batch limits, compression, rate-limiting

## Documentation

- [Features Documentation](FEATURES.md) - Complete feature list with license tracking
- [Web UI Guide](WEBUI_GUIDE.md) - REST API and Web UI documentation
- [Flow Charts](FLOWCHART.md) - System architecture diagrams
- [Windows Build Guide](WINDOWS_BUILD_GUIDE.md) - Detailed Windows installation and configuration
- [Low-Level Design](../../docs/CMDB_AGENT_LLD.md)
- [Agent Overview](../../docs/AGENTS_OVERVIEW.md)

## License

MIT

## Contributing

Pull requests welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

*For issues and questions, open an issue on GitHub.*
