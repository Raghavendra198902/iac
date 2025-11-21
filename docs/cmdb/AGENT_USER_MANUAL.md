# Citadel CMDB Agent - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Features](#features)
6. [Data Leakage Control](#data-leakage-control)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Troubleshooting](#troubleshooting)
9. [API Reference](#api-reference)
10. [Compliance & Security](#compliance--security)

---

## Introduction

The Citadel CMDB Agent is an enterprise-grade configuration management and security monitoring solution designed for Windows and Linux endpoints. It provides:

- **Real-time system monitoring** - CPU, memory, disk, network metrics
- **Data Loss Prevention (DLP)** - Clipboard, USB, file access, network monitoring
- **Automated enforcement** - Policy-based auto-blocking and remediation
- **Configuration Management Database (CMDB)** - Centralized asset inventory
- **Compliance reporting** - ISO 27001, SOC 2, GDPR, PCI DSS, HIPAA, NIST 800-53

**Version:** 1.0.0  
**Release Date:** November 20, 2025  
**Supported Platforms:** Windows 7/10/11, Linux (Ubuntu, CentOS, RHEL)

---

## System Requirements

### Windows
- **Operating System:** Windows 7, 10, 11 (64-bit)
- **Processor:** Intel/AMD x64 processor, 2+ cores recommended
- **Memory:** 512 MB RAM minimum (1 GB recommended)
- **Disk Space:** 200 MB for installation
- **PowerShell:** Version 5.1 or higher
- **Network:** TCP/IP connectivity to CMDB API server
- **Privileges:** Administrator or SYSTEM account

### Linux
- **Operating System:** Ubuntu 18.04+, CentOS 7+, RHEL 7+
- **Processor:** x86_64 architecture
- **Memory:** 256 MB RAM minimum (512 MB recommended)
- **Disk Space:** 150 MB for installation
- **Network:** TCP/IP connectivity to CMDB API server
- **Privileges:** Root or sudo access

### Network Requirements
- **Outbound HTTPS:** Port 443 (to CMDB API server)
- **Outbound HTTP:** Port 3000 (configurable)
- **Agent API:** Port 9000 (optional, for monitoring)

---

## Installation

### Windows Installation

#### Method 1: Manual Installation

1. **Download the agent executable:**
   ```
   Location: http://your-server:5173/downloads
   File: cmdb-agent-win.exe (45 MB)
   ```

2. **Create installation directory:**
   ```powershell
   New-Item -ItemType Directory -Path "C:\Program Files\Citadel" -Force
   ```

3. **Copy executable:**
   ```powershell
   Copy-Item cmdb-agent-win.exe "C:\Program Files\Citadel\"
   ```

4. **Create configuration file:**
   ```powershell
   # Create config directory
   New-Item -ItemType Directory -Path "C:\Program Files\Citadel\config" -Force
   
   # Set environment variables
   [Environment]::SetEnvironmentVariable("AGENT_ID", "agent-$(hostname)", "Machine")
   [Environment]::SetEnvironmentVariable("CMDB_API_URL", "http://your-server:3000/api/cmdb", "Machine")
   [Environment]::SetEnvironmentVariable("CMDB_API_KEY", "your-api-key-here", "Machine")
   ```

5. **Install as Windows Service:**
   ```powershell
   # Create service
   New-Service -Name "CitadelAgentSvc" `
     -BinaryPathName "C:\Program Files\Citadel\cmdb-agent-win.exe" `
     -DisplayName "Citadel CMDB Agent" `
     -Description "Enterprise configuration management and security monitoring" `
     -StartupType Automatic
   
   # Start service
   Start-Service CitadelAgentSvc
   
   # Verify service is running
   Get-Service CitadelAgentSvc
   ```

#### Method 2: Automated Installation (PowerShell Script)

```powershell
# Download and run installation script
Invoke-WebRequest -Uri "http://your-server:5173/downloads/install-windows.ps1" -OutFile "install.ps1"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\install.ps1 -ApiUrl "http://your-server:3000/api/cmdb" -ApiKey "your-api-key"
```

### Linux Installation

#### Method 1: Manual Installation

1. **Download the agent binary:**
   ```bash
   wget http://your-server:5173/downloads/cmdb-agent-linux
   chmod +x cmdb-agent-linux
   ```

2. **Create installation directory:**
   ```bash
   sudo mkdir -p /usr/local/citadel
   sudo mv cmdb-agent-linux /usr/local/citadel/
   ```

3. **Create configuration:**
   ```bash
   sudo tee /etc/citadel/agent.env << EOF
   AGENT_ID=agent-$(hostname)
   CMDB_API_URL=http://your-server:3000/api/cmdb
   CMDB_API_KEY=your-api-key-here
   AGENT_ENVIRONMENT=production
   SCAN_INTERVAL_MINUTES=5
   DLP_MONITORING_INTERVAL_SECONDS=30
   EOF
   ```

4. **Create systemd service:**
   ```bash
   sudo tee /etc/systemd/system/citadel-agent.service << EOF
   [Unit]
   Description=Citadel CMDB Agent
   After=network.target
   
   [Service]
   Type=simple
   User=root
   EnvironmentFile=/etc/citadel/agent.env
   ExecStart=/usr/local/citadel/cmdb-agent-linux
   Restart=always
   RestartSec=10
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   # Reload systemd and start service
   sudo systemctl daemon-reload
   sudo systemctl enable citadel-agent
   sudo systemctl start citadel-agent
   
   # Verify service status
   sudo systemctl status citadel-agent
   ```

---

## Configuration

### Environment Variables

All configuration is done via environment variables. Below are the available options:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `AGENT_ID` | Unique identifier for this agent | `agent-web-server-01` |
| `CMDB_API_URL` | CMDB API endpoint URL | `http://192.168.1.10:3000/api/cmdb` |
| `CMDB_API_KEY` | Authentication API key | `sk_live_abc123...` |

#### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AGENT_NAME` | `CMDB Agent` | Human-readable agent name |
| `AGENT_ENVIRONMENT` | `production` | Environment tag (dev/staging/prod) |
| `AGENT_PORT` | `9000` | Local API port for agent monitoring |
| `SCAN_INTERVAL_MINUTES` | `5` | Discovery scan interval |
| `AUTO_DISCOVERY_ENABLED` | `true` | Enable automatic resource discovery |
| `CPU_THRESHOLD_PERCENT` | `80` | CPU usage alert threshold |
| `MEMORY_THRESHOLD_PERCENT` | `85` | Memory usage alert threshold |
| `DISK_THRESHOLD_PERCENT` | `90` | Disk usage alert threshold |
| `HEALTH_CHECK_INTERVAL_SECONDS` | `30` | Health check frequency |
| `METRIC_COLLECTION_INTERVAL_SECONDS` | `60` | Metrics collection frequency |
| `DLP_MONITORING_INTERVAL_SECONDS` | `30` | DLP scan frequency |
| `LOG_LEVEL` | `info` | Logging level (debug/info/warn/error) |

#### Windows-Specific Configuration

```powershell
# Set all variables at once
$env:AGENT_ID = "agent-$(hostname)"
$env:CMDB_API_URL = "http://192.168.1.10:3000/api/cmdb"
$env:CMDB_API_KEY = "your-api-key"
$env:AGENT_ENVIRONMENT = "production"
$env:DLP_MONITORING_INTERVAL_SECONDS = "30"

# Make persistent
[Environment]::SetEnvironmentVariable("AGENT_ID", $env:AGENT_ID, "Machine")
[Environment]::SetEnvironmentVariable("CMDB_API_URL", $env:CMDB_API_URL, "Machine")
[Environment]::SetEnvironmentVariable("CMDB_API_KEY", $env:CMDB_API_KEY, "Machine")
```

#### Linux Configuration File

```bash
# /etc/citadel/agent.env
AGENT_ID=agent-web-server-01
CMDB_API_URL=http://192.168.1.10:3000/api/cmdb
CMDB_API_KEY=your-api-key-here
AGENT_ENVIRONMENT=production
SCAN_INTERVAL_MINUTES=5
AUTO_DISCOVERY_ENABLED=true
CPU_THRESHOLD_PERCENT=80
MEMORY_THRESHOLD_PERCENT=85
DISK_THRESHOLD_PERCENT=90
DLP_MONITORING_INTERVAL_SECONDS=30
LOG_LEVEL=info
```

---

## Features

### 1. System Monitoring

**Metrics Collected:**
- CPU usage (per core and aggregate)
- Memory usage (total, used, free, percentage)
- Disk usage (per volume, I/O statistics)
- Network interfaces (IP, MAC, throughput)
- Process list with resource consumption
- System uptime and boot time

**Collection Frequency:** Every 60 seconds (configurable)

**Windows Commands Used:**
- `Get-CimInstance Win32_Processor`
- `Get-CimInstance Win32_OperatingSystem`
- `Get-CimInstance Win32_LogicalDisk`
- `Get-CimInstance Win32_NetworkAdapterConfiguration`
- `Get-CimInstance Win32_Process`

### 2. Configuration Management

**Asset Discovery:**
- Docker containers (if Docker is installed)
- Windows services / Linux daemons
- File systems and mount points
- Network adapters and connections
- Installed software inventory

**CMDB Integration:**
- Automatic CI registration
- Real-time status updates
- Dependency mapping
- Tag-based classification

### 3. Health Monitoring

**Health Checks:**
- CPU threshold monitoring
- Memory threshold monitoring
- Disk threshold monitoring
- Service availability
- Network connectivity

**Alert Conditions:**
- CPU > 80% → Warning
- Memory > 85% → Warning
- Disk > 90% → Critical
- Service stopped → Critical
- API unreachable → Critical

### 4. Auto-Discovery

**Discovered Resources:**
- Running containers (Docker/Podman)
- System services
- File system mounts
- Network interfaces
- Application dependencies

**Registration:** Automatically creates CMDB configuration items (CIs) for all discovered resources.

---

## Data Leakage Control

### Overview

The Data Leakage Control (DLP) framework provides real-time detection and prevention of unauthorized data exfiltration.

### Features

#### 1. Clipboard Monitoring

**Detection Patterns:**
- Email addresses
- Social Security Numbers (SSN)
- Credit card numbers
- API keys and tokens
- Passwords
- Bearer tokens
- Private keys (PEM format)

**Scan Frequency:** Every 2 seconds

**Response Actions:**
- Low severity: Log event
- Medium severity: Alert + log
- High severity: Clear clipboard + alert + log

**Example Event:**
```json
{
  "id": "clip-001",
  "timestamp": "2025-11-20T10:00:00Z",
  "hostname": "WIN-SERVER-01",
  "username": "Administrator",
  "containsSensitive": true,
  "sensitivePatterns": ["PASSWORD", "API_KEY"],
  "severity": "high"
}
```

#### 2. USB Write Detection

**Monitoring:**
- USB device insertion (Drive Type 2)
- Free space delta tracking
- Write operation detection

**Thresholds:**
- > 1 MB written → Alert
- > 100 MB written → High severity

**Response Actions:**
- Medium severity: Log + alert
- High severity: Enable write protection + alert

**Registry Command (Auto-Block):**
```powershell
reg add "HKLM\SYSTEM\CurrentControlSet\Control\StorageDevicePolicies" /v WriteProtect /t REG_DWORD /d 1 /f
```

#### 3. File Access Monitoring

**Monitored Folders:**
- `C:\Users\*\Documents`
- `C:\Users\*\Desktop`
- `C:\Users\*\Downloads`
- `C:\ProgramData`
- `C:\Windows\System32\config`

**Requirements:**
- Windows Audit Policy enabled
- Event ID 4663 monitoring

**Enable Audit Policy:**
```powershell
auditpol /set /subcategory:"File System" /success:enable /failure:enable
```

#### 4. Network Exfiltration Detection

**Suspicious Ports:**
- 21 (FTP)
- 22 (SSH)
- 23 (Telnet)
- 3389 (RDP)
- 4444 (Metasploit)
- 5900 (VNC)
- 8080, 8888 (HTTP proxies)

**Detection Method:**
- Active connection monitoring
- Process-to-network correlation
- Baseline anomaly detection

**Response Actions:**
- Medium severity: Alert + log
- High severity: Terminate process + alert

### DLP Configuration

**Enable/Disable Monitoring:**
```powershell
# Windows
$env:CLIPBOARD_MONITORING_ENABLED = "true"
$env:USB_MONITORING_ENABLED = "true"
$env:FILE_ACCESS_MONITORING_ENABLED = "true"
$env:NETWORK_MONITORING_ENABLED = "true"
```

**Auto-Blocking Configuration:**
```powershell
$env:AUTO_BLOCK_HIGH_SEVERITY = "true"
$env:AUTO_BLOCK_CLIPBOARD = "true"
$env:AUTO_BLOCK_USB = "true"
$env:AUTO_BLOCK_NETWORK = "true"
```

---

## Monitoring & Alerts

### Agent Endpoints

Once the agent is running, the following endpoints are available:

#### Health Check
```bash
GET http://localhost:9000/health

Response:
{
  "status": "healthy",
  "registered": true,
  "uptime": 3600,
  "version": "1.0.0",
  "timestamp": "2025-11-20T10:00:00Z"
}
```

#### Status
```bash
GET http://localhost:9000/status

Response:
{
  "registered": true,
  "ciId": "ci-agent-web-server-01",
  "errors": 0,
  "lastSync": "2025-11-20T10:00:00Z",
  "security": {
    "totalEvents": 156,
    "clipboardMonitoring": true,
    "usbDevicesMonitored": 2,
    "sensitiveFolders": 5,
    "networkConnections": 34
  },
  "config": {
    "scanInterval": 5,
    "autoDiscovery": true,
    "thresholds": {
      "cpu": 80,
      "memory": 85,
      "disk": 90
    }
  },
  "uptime": 3600
}
```

#### Security Stats
```bash
GET http://localhost:9000/security/stats

Response:
{
  "totalSecurityEvents": 156,
  "clipboardMonitor": {
    "enabled": true,
    "patternCount": 8
  },
  "dataLeakageMonitor": {
    "usbDevices": 2,
    "sensitiveFolders": 5,
    "networkConnections": 34,
    "enabled": true
  }
}
```

### Log Files

#### Windows
```
C:\Program Files\Citadel\logs\agent.log
C:\Program Files\Citadel\logs\security-events.log
```

#### Linux
```
/var/log/citadel/agent.log
/var/log/citadel/security-events.log
```

### Windows Event Log

The agent also writes to Windows Event Log:
- **Source:** CitadelAgent
- **Log:** Application
- **Event IDs:**
  - 1000: Agent started
  - 1001: Agent stopped
  - 2000: Security event detected
  - 3000: Health check failed
  - 4000: Configuration error

**View Events:**
```powershell
Get-EventLog -LogName Application -Source CitadelAgent -Newest 50
```

---

## Troubleshooting

### Common Issues

#### Issue: Agent won't start

**Symptoms:** Service fails to start, immediate crash

**Possible Causes:**
1. Missing/invalid API key
2. Cannot reach CMDB API
3. Port 9000 already in use
4. Insufficient permissions

**Solutions:**
```powershell
# Check environment variables
Get-ChildItem Env: | Where-Object {$_.Name -like "*CMDB*"}

# Test API connectivity
Invoke-WebRequest -Uri "http://your-server:3000/api/cmdb/health"

# Check port availability
netstat -ano | findstr :9000

# Run as administrator
Start-Process powershell -Verb RunAs
```

#### Issue: Clipboard monitoring not working

**Cause:** PowerShell not available or execution policy

**Solution:**
```powershell
# Verify PowerShell
where.exe powershell.exe

# Check execution policy
Get-ExecutionPolicy

# Set execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine
```

#### Issue: USB events not detected

**Cause:** Insufficient privileges

**Solution:**
```powershell
# Run service as SYSTEM
sc.exe config CitadelAgentSvc obj= LocalSystem

# Restart service
Restart-Service CitadelAgentSvc
```

#### Issue: File access events empty

**Cause:** Audit policy not enabled

**Solution:**
```powershell
# Enable file system auditing
auditpol /set /subcategory:"File System" /success:enable /failure:enable

# Verify
auditpol /get /subcategory:"File System"
```

#### Issue: High CPU usage

**Cause:** Monitoring intervals too frequent

**Solution:**
```powershell
# Increase intervals
$env:METRIC_COLLECTION_INTERVAL_SECONDS = "120"
$env:DLP_MONITORING_INTERVAL_SECONDS = "60"

# Restart service
Restart-Service CitadelAgentSvc
```

### Debug Mode

Enable debug logging:
```powershell
$env:LOG_LEVEL = "debug"
Restart-Service CitadelAgentSvc
```

View real-time logs:
```powershell
# Windows
Get-Content "C:\Program Files\Citadel\logs\agent.log" -Wait -Tail 50

# Linux
tail -f /var/log/citadel/agent.log
```

---

## API Reference

### CMDB API Endpoints

#### Register/Update CI
```http
POST /api/cmdb/ci
Content-Type: application/json
Authorization: Bearer {API_KEY}

{
  "id": "ci-agent-web-server-01",
  "name": "WEB-SERVER-01",
  "type": "server",
  "status": "operational",
  "environment": "production",
  "metadata": {...}
}
```

#### Send Metrics
```http
POST /api/cmdb/ci/{ciId}/metrics
Content-Type: application/json

{
  "cpu": {"usage": 45, "cores": 4},
  "memory": {"usagePercent": 62},
  "disk": {"usagePercent": 38},
  "timestamp": "2025-11-20T10:00:00Z"
}
```

#### Send Security Event
```http
POST /api/security/events
Content-Type: application/json

{
  "ciId": "ci-agent-web-server-01",
  "eventType": "clipboard",
  "severity": "high",
  "timestamp": "2025-11-20T10:00:00Z",
  "eventId": "evt-001",
  "details": {...}
}
```

---

## Compliance & Security

### Compliance Frameworks

The agent supports the following compliance frameworks:

| Framework | Requirements Met |
|-----------|------------------|
| **ISO 27001** | A.8.2.3 (Data handling procedures) |
| **SOC 2** | CC6.2 (Logical access controls) |
| **GDPR** | Art. 32 (Security of processing) |
| **PCI DSS** | 10.2 (Audit trail requirements) |
| **HIPAA** | §164.312(b) (Audit controls) |
| **NIST 800-53** | SI-4 (System monitoring) |

### Security Features

**Data Encryption:**
- All API communications use HTTPS/TLS 1.3
- Event payloads encrypted with AES-256-GCM
- API keys stored in environment variables

**Authentication:**
- Bearer token authentication
- API key rotation supported
- Role-based access control (RBAC)

**Audit Trail:**
- All events logged with UUID correlation
- 180-day retention policy
- Tamper-evident logging

### Best Practices

1. **Use strong API keys** (minimum 32 characters, alphanumeric + symbols)
2. **Rotate API keys monthly**
3. **Run agent as dedicated service account** (not Administrator)
4. **Enable TLS/SSL** for all communications
5. **Monitor agent health** regularly
6. **Review security events** daily
7. **Keep agent updated** with latest version
8. **Backup configuration** before changes
9. **Test in non-production** first
10. **Document custom policies**

---

## Support

**Documentation:** https://github.com/Raghavendra198902/iac/docs  
**Issues:** https://github.com/Raghavendra198902/iac/issues  
**Version:** 1.0.0  
**Release Date:** November 20, 2025

---

**© 2025 Citadel Infrastructure Team. All rights reserved.**
