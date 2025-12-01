# CMDB Enterprise Agent - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Choose Your Installation Method

You have **3 options**:

#### Option A: GUI Installer (Easiest) ⭐ **RECOMMENDED**
- Beautiful installation wizard
- Configuration prompts
- Automatic service installation
- **Best for**: First-time users, production deployments

#### Option B: Standalone Executable
- No installation required
- Portable
- **Best for**: Testing, temporary deployments

#### Option C: Manual Service Installation
- Full control
- Command-line based
- **Best for**: Automated deployments, DevOps

---

## Option A: GUI Installer (RECOMMENDED)

### Windows

1. **Download Installer**
   ```
   Download: CMDB-Agent-Installer-1.0.0.exe
   From: http://192.168.1.10:3000/api/downloads/cmdb-agent-installer.zip
   ```

2. **Run as Administrator**
   - Right-click installer
   - Select "Run as administrator"
   - Click "Yes" on UAC prompt

3. **Follow Wizard**
   - **Step 1**: Review features and system info
   - **Step 2**: Configure:
     ```
     Install Path: C:\Program Files\CMDB Agent
     API URL: http://192.168.1.10:3000
     Agent Name: (your hostname)
     ✓ Auto-start service
     ✓ Enable auto-updates
     ```
   - **Step 3**: Wait for installation (1-2 minutes)
   - **Step 4**: Click "Finish"

4. **Verify Installation**
   ```powershell
   sc query cmdb-agent
   # Should show: STATE: RUNNING
   ```

### Linux

1. **Download Installer**
   ```bash
   wget http://192.168.1.10:3000/api/downloads/cmdb-agent-setup.run
   chmod +x cmdb-agent-setup.run
   ```

2. **Run Installer**
   ```bash
   sudo ./cmdb-agent-setup.run
   ```

3. **Follow Prompts**
   ```
   Install Path: /opt/cmdb-agent
   API URL: http://192.168.1.10:3000
   Agent Name: (your hostname)
   ```

4. **Verify Installation**
   ```bash
   sudo systemctl status cmdb-agent
   # Should show: active (running)
   ```

---

## Option B: Standalone Executable

### Windows

1. **Download**
   ```powershell
   # Download from Downloads page
   # File: cmdb-agent-win.exe (42 MB)
   ```

2. **Run**
   ```powershell
   .\cmdb-agent-win.exe
   ```

3. **Configuration**
   - Create `config.json` in same directory:
   ```json
   {
     "agentName": "my-workstation",
     "apiServerUrl": "http://192.168.1.10:3000",
     "autoUpdate": true
   }
   ```

### Linux

1. **Download**
   ```bash
   wget http://192.168.1.10:3000/api/downloads/cmdb-agent-linux
   chmod +x cmdb-agent-linux
   ```

2. **Run**
   ```bash
   ./cmdb-agent-linux
   ```

3. **Configuration**
   ```bash
   cat > config.json << 'EOF'
   {
     "agentName": "my-workstation",
     "apiServerUrl": "http://192.168.1.10:3000",
     "autoUpdate": true
   }
   EOF
   ```

---

## Option C: Manual Service Installation

### Windows

1. **Extract Files**
   ```powershell
   Expand-Archive cmdb-agent-windows.zip -Destination "C:\Program Files\CMDB Agent"
   cd "C:\Program Files\CMDB Agent"
   ```

2. **Create Configuration**
   ```powershell
   @"
   {
     "agentName": "$env:COMPUTERNAME",
     "apiServerUrl": "http://192.168.1.10:3000",
     "autoUpdate": true
   }
   "@ | Out-File -FilePath config.json
   ```

3. **Install Service**
   ```powershell
   node service-installer.js install
   ```

4. **Start Service**
   ```powershell
   sc start cmdb-agent
   ```

### Linux

1. **Extract Files**
   ```bash
   sudo mkdir -p /opt/cmdb-agent
   sudo tar -xzf cmdb-agent-linux.tar.gz -C /opt/cmdb-agent
   cd /opt/cmdb-agent
   ```

2. **Create Configuration**
   ```bash
   sudo tee config.json > /dev/null << 'EOF'
   {
     "agentName": "$(hostname)",
     "apiServerUrl": "http://192.168.1.10:3000",
     "autoUpdate": true
   }
   EOF
   ```

3. **Install Service**
   ```bash
   sudo node service-installer.js install
   ```

4. **Start Service**
   ```bash
   sudo systemctl start cmdb-agent
   ```

---

## ✅ Verification

### Check Service Status

**Windows:**
```powershell
sc query cmdb-agent
# Expected: STATE: 4 RUNNING
```

**Linux:**
```bash
sudo systemctl status cmdb-agent
# Expected: Active: active (running)
```

### Check Logs

**Windows:**
```powershell
Get-EventLog -LogName Application -Source "CMDB Agent" -Newest 5
```

**Linux:**
```bash
sudo journalctl -u cmdb-agent -n 20
```

### Test API Connection

```bash
# From the agent machine
curl http://192.168.1.10:3000/api/health
# Expected: {"status":"healthy"}
```

---

## 🎛️ Configuration Reference

**Minimal Configuration:**
```json
{
  "agentName": "workstation-01",
  "apiServerUrl": "http://192.168.1.10:3000"
}
```

**Full Configuration:**
```json
{
  "version": "1.0.0",
  "agentName": "workstation-01",
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

---

## 🔧 Common Issues

### Issue: "Service won't start"

**Solution:**
1. Check configuration file exists:
   ```bash
   # Windows
   type "C:\Program Files\CMDB Agent\config.json"
   
   # Linux
   cat /opt/cmdb-agent/config.json
   ```

2. Check API server reachable:
   ```bash
   curl http://192.168.1.10:3000/api/health
   ```

3. Check logs for errors

### Issue: "Permission Denied"

**Solution:**
- **Windows**: Run as Administrator
- **Linux**: Use `sudo`

### Issue: "Cannot connect to API"

**Solution:**
1. Verify API server URL in `config.json`
2. Check firewall rules (allow outbound port 3000)
3. Test connectivity: `ping 192.168.1.10`

---

## 📊 Monitoring Dashboard

After installation, view agent data:

1. **Open Frontend**
   ```
   http://192.168.1.10:5173
   ```

2. **Navigate to Dashboard**
   - View connected agents
   - See real-time telemetry
   - Monitor process events
   - Check agent health

---

## 🔄 Auto-Updates

The agent automatically checks for updates every 24 hours.

**Manual Update Check:**
```bash
# Windows
"C:\Program Files\CMDB Agent\cmdb-agent.exe" --check-updates

# Linux
/opt/cmdb-agent/cmdb-agent --check-updates
```

**Update Process:**
1. Version check (API call)
2. Download new version (with progress)
3. Verify SHA256
4. Stop service
5. Replace binary
6. Start service
7. Verify new version running

---

## 🛑 Uninstallation

### Windows (Administrator)
```powershell
cd "C:\Program Files\CMDB Agent"
node service-installer.js uninstall
Remove-Item -Recurse -Force "C:\Program Files\CMDB Agent"
```

### Linux (root)
```bash
cd /opt/cmdb-agent
sudo node service-installer.js uninstall
sudo rm -rf /opt/cmdb-agent
```

---

## 📞 Support

**Documentation**: `README-ENTERPRISE.md`  
**Troubleshooting**: Check logs first  
**API Issues**: Verify API Gateway running (`http://192.168.1.10:3000/api/health`)

---

## 🎉 Success Criteria

After setup, you should see:

✅ Service running  
✅ Logs showing heartbeat every 5 minutes  
✅ Agent visible in dashboard  
✅ Process monitoring events appearing  
✅ Auto-update checks working  

**Congratulations! Your CMDB Enterprise Agent is now operational.**

---

**Installation Time**: 5-10 minutes  
**Memory Usage**: ~50-100 MB  
**CPU Usage**: <1% idle, 2-5% during monitoring  
**Disk Space**: 100 MB (agent) + logs  
**Network**: Minimal (batch telemetry every 60s)
