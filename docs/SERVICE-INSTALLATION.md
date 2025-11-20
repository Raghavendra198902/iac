# CMDB Agent Service Installation Guide

## Overview

The CMDB Enterprise Agent can be installed as a system service to run automatically on boot and restart on failures. This guide covers installation and management on Windows and Linux.

## Prerequisites

- Administrator/root privileges
- CMDB Agent built (`npm run build` in `backend/cmdb-agent`)
- Network connectivity to API Gateway

---

## Installation

### Linux (systemd)

**1. Install as Service:**

```bash
cd /path/to/Iac/backend/cmdb-agent
sudo node dist/service-installer.js install /opt/cmdb-agent
```

**What happens:**
- Creates installation directory (`/opt/cmdb-agent`)
- Copies executable to install location
- Creates systemd service unit at `/etc/systemd/system/cmdb-agent.service`
- Enables auto-start on boot
- Starts the service immediately

**2. Verify Installation:**

```bash
sudo systemctl status cmdb-agent
```

Expected output:
```
● cmdb-agent.service - Enterprise endpoint monitoring, enforcement, and telemetry agent (v1.0.0)
     Loaded: loaded (/etc/systemd/system/cmdb-agent.service; enabled; preset: enabled)
     Active: active (running) since ...
```

---

### Windows (Services)

**1. Install as Service:**

```powershell
cd C:\path\to\Iac\backend\cmdb-agent
node dist\service-installer.js install "C:\Program Files\CMDB Agent"
```

**What happens:**
- Creates installation directory (`C:\Program Files\CMDB Agent`)
- Copies executable (`cmdb-agent.exe`)
- Registers Windows service with Service Control Manager
- Sets automatic startup type
- Starts the service

**2. Verify Installation:**

```powershell
sc query cmdb-agent
```

Or use Services Manager:
- Press `Win+R`, type `services.msc`
- Find "CMDB Enterprise Agent"
- Status should be "Running", Startup Type "Automatic"

---

## Service Management

### Linux Commands

| Action | Command | Description |
|--------|---------|-------------|
| **Start** | `sudo systemctl start cmdb-agent` | Start the agent service |
| **Stop** | `sudo systemctl stop cmdb-agent` | Stop the agent service |
| **Restart** | `sudo systemctl restart cmdb-agent` | Restart the agent service |
| **Status** | `sudo systemctl status cmdb-agent` | View service status |
| **Logs** | `sudo journalctl -u cmdb-agent -f` | Follow live logs |
| **Recent Logs** | `sudo journalctl -u cmdb-agent -n 100` | Last 100 log lines |
| **Enable Auto-start** | `sudo systemctl enable cmdb-agent` | Enable boot auto-start |
| **Disable Auto-start** | `sudo systemctl disable cmdb-agent` | Disable boot auto-start |

### Windows Commands

| Action | Command | Description |
|--------|---------|-------------|
| **Start** | `sc start cmdb-agent` | Start the agent service |
| **Stop** | `sc stop cmdb-agent` | Stop the agent service |
| **Status** | `sc query cmdb-agent` | View service status |
| **Configure** | `services.msc` | Open Services Manager GUI |

**PowerShell Alternatives:**

```powershell
# Start service
Start-Service -Name "cmdb-agent"

# Stop service
Stop-Service -Name "cmdb-agent"

# Restart service
Restart-Service -Name "cmdb-agent"

# Get status
Get-Service -Name "cmdb-agent"
```

---

## Uninstallation

### Linux

```bash
cd /path/to/Iac/backend/cmdb-agent
sudo node dist/service-installer.js uninstall
```

**What happens:**
- Stops the service
- Disables auto-start
- Removes systemd service unit
- **Note:** Installation files remain in `/opt/cmdb-agent`

**Complete Removal:**

```bash
sudo node dist/service-installer.js uninstall
sudo rm -rf /opt/cmdb-agent
```

### Windows

```powershell
cd C:\path\to\Iac\backend\cmdb-agent
node dist\service-installer.js uninstall
```

**What happens:**
- Stops the service
- Unregisters from Service Control Manager
- **Note:** Installation files remain in `C:\Program Files\CMDB Agent`

**Complete Removal:**

```powershell
node dist\service-installer.js uninstall
Remove-Item -Recurse -Force "C:\Program Files\CMDB Agent"
```

---

## Configuration

### Service Configuration File

**Linux:** `/etc/systemd/system/cmdb-agent.service`

```ini
[Unit]
Description=Enterprise endpoint monitoring, enforcement, and telemetry agent (v1.0.0)
After=network.target
Documentation=https://cmdb-agent.example.com

[Service]
Type=simple
ExecStart=/opt/cmdb-agent/cmdb-agent --service
WorkingDirectory=/opt/cmdb-agent
User=root
Group=root
Environment="NODE_ENV=production"
Environment="AGENT_VERSION=1.0.0"

# Restart configuration
Restart=always
RestartSec=10
StartLimitInterval=60
StartLimitBurst=3

# Security hardening
PrivateTmp=true
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/opt/cmdb-agent

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=cmdb-agent

[Install]
WantedBy=multi-user.target
```

**After editing:**

```bash
sudo systemctl daemon-reload
sudo systemctl restart cmdb-agent
```

---

## Service Features

### Auto-Restart

The service automatically restarts on failure:

**Linux:**
- Restart policy: `Restart=always`
- Wait 10 seconds before restart (`RestartSec=10`)
- Maximum 3 restarts per 60 seconds (`StartLimitBurst=3`)

**Windows:**
- Recovery configured for automatic restart on failure
- 10-second delay between restart attempts

### Auto-Start on Boot

Both platforms enable auto-start by default:

**Linux:**
```bash
# Check if enabled
systemctl is-enabled cmdb-agent

# Enable/disable
sudo systemctl enable cmdb-agent
sudo systemctl disable cmdb-agent
```

**Windows:**
- Startup Type: Automatic
- Change in `services.msc` or:
```powershell
sc config cmdb-agent start= auto   # Auto-start
sc config cmdb-agent start= demand # Manual start
```

### Logging

**Linux (systemd journal):**

```bash
# All logs
sudo journalctl -u cmdb-agent

# Follow live logs
sudo journalctl -u cmdb-agent -f

# Last 100 lines
sudo journalctl -u cmdb-agent -n 100

# Since specific time
sudo journalctl -u cmdb-agent --since "2025-11-19 10:00:00"

# Filter by severity
sudo journalctl -u cmdb-agent -p err  # Errors only
```

**Windows (Event Viewer):**
- Open Event Viewer (`eventvwr.msc`)
- Navigate to: Windows Logs → Application
- Filter by source: "cmdb-agent"

---

## Troubleshooting

### Service Won't Start

**Linux:**

1. Check logs:
   ```bash
   sudo journalctl -u cmdb-agent -n 50
   ```

2. Verify executable:
   ```bash
   ls -la /opt/cmdb-agent/cmdb-agent
   # Should be executable (755 permissions)
   ```

3. Test manually:
   ```bash
   sudo /opt/cmdb-agent/cmdb-agent --service
   # Watch for errors
   ```

4. Check systemd status:
   ```bash
   sudo systemctl status cmdb-agent -l
   ```

**Windows:**

1. Check Event Viewer for errors
2. Verify executable exists:
   ```powershell
   Test-Path "C:\Program Files\CMDB Agent\cmdb-agent.exe"
   ```

3. Check service configuration:
   ```powershell
   sc qc cmdb-agent
   ```

### Permission Issues

**Linux:**

Service runs as root by default. To run as different user:

```bash
# Edit service file
sudo nano /etc/systemd/system/cmdb-agent.service

# Change User= and Group= lines
User=cmdbuser
Group=cmdbuser

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart cmdb-agent
```

**Note:** Agent requires elevated privileges for process monitoring.

### Network Connectivity

Verify agent can reach API Gateway:

```bash
# Test from service installation directory
cd /opt/cmdb-agent  # or C:\Program Files\CMDB Agent
curl http://your-api-gateway:3000/api/telemetry

# Expected: HTTP 200 or 405 (not 404)
```

### Service Crashes Repeatedly

**Linux:**

1. Check crash count:
   ```bash
   systemctl show cmdb-agent | grep NRestarts
   ```

2. Reset failure state:
   ```bash
   sudo systemctl reset-failed cmdb-agent
   sudo systemctl restart cmdb-agent
   ```

3. Adjust restart limits in service file:
   ```ini
   StartLimitInterval=120  # Increase window
   StartLimitBurst=5       # Allow more restarts
   ```

---

## Verification

### Check Service Status

**Linux:**

```bash
sudo systemctl status cmdb-agent
```

Expected output:
- **Loaded:** enabled
- **Active:** active (running)
- **Main PID:** valid process ID
- **Tasks:** ~10 threads
- **Memory:** ~20-30 MB

**Windows:**

```powershell
sc query cmdb-agent
```

Expected output:
- **STATE:** 4 RUNNING
- **WIN32_EXIT_CODE:** 0 (no errors)

### Verify Telemetry

1. **Check agent is sending telemetry:**

   ```bash
   curl -s http://localhost:3000/api/agents/stats/summary | jq '.'
   ```

   Expected:
   ```json
   {
     "success": true,
     "summary": {
       "totalAgents": 1,
       "onlineAgents": 1,
       "totalEvents": 1234,
       ...
     }
   }
   ```

2. **View agent in dashboard:**

   Open browser: http://localhost:5173/agents

   - Should show 1 agent online
   - Status chip: Green
   - Events counter increasing

### Test Auto-Restart

**Linux:**

```bash
# Get current PID
PID=$(systemctl show -p MainPID cmdb-agent | cut -d= -f2)
echo "Current PID: $PID"

# Kill the process
sudo kill -9 $PID

# Wait and check (should auto-restart)
sleep 15
sudo systemctl status cmdb-agent

# PID should be different
```

**Windows:**

```powershell
# Get service PID
$pid = (Get-Process | Where-Object {$_.ProcessName -eq "cmdb-agent"}).Id
Write-Host "Current PID: $pid"

# Stop process forcefully
Stop-Process -Id $pid -Force

# Wait and check (should auto-restart)
Start-Sleep -Seconds 15
Get-Service cmdb-agent
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Agent built with production configuration
- [ ] API Gateway URL configured correctly
- [ ] Network firewall rules allow telemetry (port 3000)
- [ ] Authentication tokens configured
- [ ] Organization ID set
- [ ] Auto-upgrade URL configured
- [ ] Sufficient disk space (100MB minimum)
- [ ] Target OS compatibility verified

### Batch Installation

**Linux (Ansible/SSH):**

```yaml
- name: Install CMDB Agent
  hosts: all
  become: yes
  tasks:
    - name: Copy agent package
      copy:
        src: ./cmdb-agent-linux
        dest: /tmp/cmdb-agent
        mode: '0755'
    
    - name: Install service
      command: |
        mkdir -p /opt/cmdb-agent
        cp /tmp/cmdb-agent /opt/cmdb-agent/cmdb-agent
        chmod +x /opt/cmdb-agent/cmdb-agent
    
    - name: Create systemd service
      template:
        src: cmdb-agent.service.j2
        dest: /etc/systemd/system/cmdb-agent.service
    
    - name: Enable and start service
      systemd:
        name: cmdb-agent
        enabled: yes
        state: started
        daemon_reload: yes
```

**Windows (PowerShell DSC/GPO):**

```powershell
# Deploy via Group Policy
# Or PowerShell Remoting:

$computers = Get-Content "computers.txt"

Invoke-Command -ComputerName $computers -ScriptBlock {
  # Copy agent
  Copy-Item "\\share\cmdb-agent.exe" "C:\Program Files\CMDB Agent\"
  
  # Install service
  & "C:\Program Files\CMDB Agent\cmdb-agent.exe" --install-service
  
  # Start service
  Start-Service -Name "cmdb-agent"
}
```

---

## Best Practices

1. **Always use service installation** rather than running agent manually in production
2. **Monitor service health** via systemd/Windows Services + Agent Dashboard
3. **Keep logs rotated** to prevent disk space issues
4. **Test service restart** before deploying to production
5. **Use configuration management** (Ansible, Puppet, etc.) for fleet deployments
6. **Set up alerts** for service failures via monitoring system
7. **Document custom configurations** if modifying service files
8. **Test upgrades** in staging before production deployment

---

## See Also

- [Agent Installation Guide](./INSTALLATION.md)
- [API Gateway Configuration](./API-GATEWAY.md)
- [Telemetry System](./TELEMETRY.md)
- [Security Best Practices](./SECURITY.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
