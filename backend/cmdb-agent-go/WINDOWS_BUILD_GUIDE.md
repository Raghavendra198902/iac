# Windows Build Guide - CMDB Agent

This guide covers building, packaging, and deploying the CMDB Agent for Windows.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Building](#building)
- [Creating MSI Installer](#creating-msi-installer)
- [Installation](#installation)
- [Windows Service Setup](#windows-service-setup)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Build Environment (Linux)
```bash
# Go 1.21+ required
go version

# For MSI creation (optional)
sudo apt-get install msitools
```

### Target Windows System
- Windows Server 2016+ or Windows 10+
- .NET Framework 4.7.2+ (for service management)
- Administrator privileges
- 100 MB free disk space
- 100 MB RAM minimum

## Building

### Quick Build (Single Binary)
```bash
cd backend/cmdb-agent-go

# Build Windows x64 binary
GOOS=windows GOARCH=amd64 go build \
  -ldflags="-X main.version=1.0.0 -s -w" \
  -o dist/cmdb-agent-windows-amd64.exe \
  ./cmd/cmdb-agent

# Build CLI tool
GOOS=windows GOARCH=amd64 go build \
  -ldflags="-X main.version=1.0.0 -s -w" \
  -o dist/cmdb-agent-cli-windows-amd64.exe \
  ./cmd/cmdb-agent-cli
```

### Build with Version Info
```bash
VERSION=1.0.0
BUILD_TIME=$(date -u '+%Y-%m-%d_%H:%M:%S')
GIT_COMMIT=$(git rev-parse --short HEAD)

GOOS=windows GOARCH=amd64 go build \
  -ldflags="-X main.version=${VERSION} \
            -X main.buildTime=${BUILD_TIME} \
            -X main.gitCommit=${GIT_COMMIT} \
            -s -w" \
  -o dist/cmdb-agent-windows-amd64.exe \
  ./cmd/cmdb-agent
```

### Build All Architectures
```bash
# x64 (default)
GOOS=windows GOARCH=amd64 go build -o dist/cmdb-agent-windows-amd64.exe ./cmd/cmdb-agent

# x86 (32-bit)
GOOS=windows GOARCH=386 go build -o dist/cmdb-agent-windows-386.exe ./cmd/cmdb-agent

# ARM64 (Windows on ARM)
GOOS=windows GOARCH=arm64 go build -o dist/cmdb-agent-windows-arm64.exe ./cmd/cmdb-agent
```

## Creating MSI Installer

### Using Build Script (Linux)
```bash
# Install msitools
sudo apt-get install msitools

# Create MSI package
./build-windows-msi.sh 1.0.0 x64

# Output: dist/cmdb-agent-1.0.0-x64.msi
```

### Manual WiX Setup (Windows)
If building on Windows directly:

1. **Install WiX Toolset**
   ```powershell
   # Using Chocolatey
   choco install wixtoolset

   # Or download from: https://wixtoolset.org/
   ```

2. **Build MSI**
   ```powershell
   cd backend\cmdb-agent-go
   candle.exe -arch x64 windows-installer.wxs
   light.exe -ext WixUIExtension -out cmdb-agent-1.0.0-x64.msi windows-installer.wixobj
   ```

### MSI Features
The installer includes:
- ✅ System-wide installation to `C:\Program Files\CMDB Agent\`
- ✅ Adds binaries to PATH
- ✅ Start Menu shortcuts
- ✅ Uninstaller via Control Panel
- ✅ Configuration file template
- ✅ Service installation script
- ✅ Upgrade support (preserves config)

## Installation

### GUI Installation
```powershell
# Double-click the MSI file or:
msiexec /i cmdb-agent-1.0.0-x64.msi
```

### Silent Installation
```powershell
# Silent install
msiexec /i cmdb-agent-1.0.0-x64.msi /qn

# Silent install with log
msiexec /i cmdb-agent-1.0.0-x64.msi /qn /l*v install.log

# Custom install location
msiexec /i cmdb-agent-1.0.0-x64.msi INSTALLFOLDER="D:\Apps\CMDBAgent" /qn
```

### Manual Installation (No MSI)
```powershell
# Create directory
New-Item -ItemType Directory -Path "C:\Program Files\CMDB Agent" -Force

# Copy files
Copy-Item cmdb-agent-windows-amd64.exe "C:\Program Files\CMDB Agent\cmdb-agent.exe"
Copy-Item cmdb-agent-cli-windows-amd64.exe "C:\Program Files\CMDB Agent\cmdb-agent-cli.exe"
Copy-Item config.example.yaml "C:\Program Files\CMDB Agent\config.yaml"

# Add to PATH
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
$newPath = $path + ";C:\Program Files\CMDB Agent"
[Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
```

## Windows Service Setup

### Automatic Service Installation
```powershell
# Run as Administrator
cd "C:\Program Files\CMDB Agent"
.\install-windows.ps1
```

The script will:
1. Stop existing service (if any)
2. Remove old service
3. Create new service with recovery options
4. Start the service
5. Verify status

### Manual Service Creation
```powershell
# Create service
sc.exe create CMDBAgent `
  binPath= "C:\Program Files\CMDB Agent\cmdb-agent.exe --config=C:\Program Files\CMDB Agent\config.yaml" `
  DisplayName= "CMDB Agent" `
  start= auto

# Set description
sc.exe description CMDBAgent "Unified CMDB Agent for configuration item collection and policy enforcement"

# Configure recovery options
sc.exe failure CMDBAgent reset= 86400 actions= restart/60000/restart/60000/restart/60000

# Start service
sc.exe start CMDBAgent
```

### Service Management
```powershell
# Check status
Get-Service CMDBAgent

# Start service
Start-Service CMDBAgent

# Stop service
Stop-Service CMDBAgent

# Restart service
Restart-Service CMDBAgent

# View service details
Get-Service CMDBAgent | Format-List *

# Remove service
sc.exe delete CMDBAgent
```

### Service Logs
```powershell
# View service logs (Event Viewer)
Get-EventLog -LogName Application -Source "CMDB Agent" -Newest 50

# View agent logs
Get-Content "C:\Program Files\CMDB Agent\logs\agent.log" -Tail 50 -Wait
```

## Configuration

### Default Locations
- **Binary**: `C:\Program Files\CMDB Agent\cmdb-agent.exe`
- **Config**: `C:\Program Files\CMDB Agent\config.yaml`
- **Data**: `C:\ProgramData\CMDB Agent\`
- **Logs**: `C:\Program Files\CMDB Agent\logs\`

### Edit Configuration
```powershell
# Open in notepad
notepad "C:\Program Files\CMDB Agent\config.yaml"

# Or use your preferred editor
code "C:\Program Files\CMDB Agent\config.yaml"
```

### Key Settings for Windows
```yaml
agent:
  id: "windows-server-001"
  name: "Windows Production Server"
  
collectors:
  enabled: true
  schedule: "*/5 * * * *"  # Every 5 minutes
  
  # Windows-specific collectors
  system:
    enabled: true
  hardware:
    enabled: true
  network:
    enabled: true
  software:
    enabled: true
    registry_paths:  # Windows Registry
      - "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall"
      - "HKLM\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall"
  license:
    enabled: true
    track_windows_licenses: true
    track_office_licenses: true
  process:
    enabled: true
  security:
    enabled: true
    check_windows_firewall: true
    check_windows_defender: true
  user:
    enabled: true
    
webui:
  enabled: true
  listen_address: "127.0.0.1:8080"
  auth_enabled: true

logging:
  level: "info"
  output: "file"
  file_path: "logs/agent.log"
  max_size_mb: 100
  max_backups: 5

transport:
  endpoint: "https://cmdb-api.example.com"
  auth_type: "oauth2"
  tls_enabled: true
  verify_tls: true
```

### Restart After Config Changes
```powershell
Restart-Service CMDBAgent
```

## Testing

### Manual Test
```powershell
# Stop service
Stop-Service CMDBAgent

# Run manually in console
cd "C:\Program Files\CMDB Agent"
.\cmdb-agent.exe --config=config.yaml

# Press Ctrl+C to stop, then restart service
Start-Service CMDBAgent
```

### CLI Commands
```powershell
# Check agent status
cmdb-agent-cli status

# List collected inventory
cmdb-agent-cli inventory list

# Show system info
cmdb-agent-cli system info

# Test connectivity
cmdb-agent-cli test connection
```

### Web UI Access
```powershell
# Open browser
Start-Process "http://localhost:8080"

# Default credentials
# Username: admin
# Password: changeme
```

## Troubleshooting

### Service Won't Start

**Check service status:**
```powershell
Get-Service CMDBAgent | Format-List *
```

**Check Event Logs:**
```powershell
Get-EventLog -LogName Application -Source "CMDB Agent" -Newest 10
```

**Run manually to see errors:**
```powershell
Stop-Service CMDBAgent
cd "C:\Program Files\CMDB Agent"
.\cmdb-agent.exe --config=config.yaml
```

### Configuration Errors

**Validate YAML syntax:**
```powershell
# Use online YAML validator or:
cmdb-agent.exe --validate-config --config=config.yaml
```

### Permission Issues

**Check file permissions:**
```powershell
icacls "C:\Program Files\CMDB Agent"
```

**Run as Administrator:**
```powershell
# Right-click PowerShell and select "Run as Administrator"
```

### Network Connectivity

**Test endpoint:**
```powershell
Test-NetConnection -ComputerName cmdb-api.example.com -Port 443

# Or use curl
curl -v https://cmdb-api.example.com/health
```

**Check firewall:**
```powershell
Get-NetFirewallRule -DisplayName "*CMDB*"

# Allow CMDB Agent
New-NetFirewallRule -DisplayName "CMDB Agent" -Direction Outbound -Program "C:\Program Files\CMDB Agent\cmdb-agent.exe" -Action Allow
```

### High CPU/Memory Usage

**Check processes:**
```powershell
Get-Process | Where-Object {$_.Name -like "*cmdb*"} | Select-Object Name, CPU, WS
```

**Adjust collection frequency:**
```yaml
collectors:
  schedule: "*/15 * * * *"  # Every 15 minutes instead of 5
```

### Logs Not Appearing

**Check log path:**
```powershell
Test-Path "C:\Program Files\CMDB Agent\logs\"

# Create if missing
New-Item -ItemType Directory -Path "C:\Program Files\CMDB Agent\logs" -Force
```

**Check service account permissions:**
```powershell
# Service runs as LocalSystem by default
# Ensure LocalSystem has write access to log directory
```

## Uninstallation

### GUI Uninstall
```powershell
# Control Panel > Programs > Uninstall
# Or:
appwiz.cpl
```

### Silent Uninstall
```powershell
# Find product code
wmic product where "Name='CMDB Agent'" get IdentifyingNumber

# Uninstall by product code
msiexec /x {12345678-1234-1234-1234-123456789ABC} /qn

# Or by MSI file
msiexec /x cmdb-agent-1.0.0-x64.msi /qn
```

### Manual Cleanup
```powershell
# Stop and remove service
Stop-Service CMDBAgent -Force
sc.exe delete CMDBAgent

# Remove files
Remove-Item "C:\Program Files\CMDB Agent" -Recurse -Force
Remove-Item "C:\ProgramData\CMDB Agent" -Recurse -Force

# Remove from PATH
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
$newPath = $path -replace ";C:\\Program Files\\CMDB Agent", ""
[Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")

# Remove registry keys
Remove-Item "HKLM:\SOFTWARE\CMDBAgent" -Recurse -ErrorAction SilentlyContinue
```

## Binary Sizes

| Component | Architecture | Size |
|-----------|--------------|------|
| Agent | x64 | ~8.5 MB |
| CLI | x64 | ~5.9 MB |
| MSI | x64 | ~15 MB |

The agent is a single static binary with no external dependencies.

## Advanced Topics

### Dual-Stack Support (IPv4/IPv6)
```yaml
webui:
  listen_address: "[::]:8080"  # Listen on both IPv4 and IPv6
```

### Multiple Instances
Run multiple agents with different configs:
```powershell
# Create services with different names
sc.exe create CMDBAgent01 binPath= "C:\Path\To\cmdb-agent.exe --config=config01.yaml"
sc.exe create CMDBAgent02 binPath= "C:\Path\To\cmdb-agent.exe --config=config02.yaml"
```

### Performance Tuning
```yaml
queue:
  max_size: 10000        # Increase for high-volume systems
  batch_size: 100        # Process more items per batch
  
logging:
  level: "warn"          # Reduce logging overhead
```

## Support

For issues, questions, or contributions:
- GitHub: https://github.com/Raghavendra198902/iac
- Issues: https://github.com/Raghavendra198902/iac/issues
- Documentation: `/docs/`

## License

See LICENSE file in repository root.
