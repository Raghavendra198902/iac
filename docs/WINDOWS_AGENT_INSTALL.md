# Windows Agent Installation - Quick Reference

## 📋 System Status

| Component | URL/Location | Status |
|-----------|-------------|--------|
| Backend API | http://192.168.1.9:3001 | ✅ Running |
| Frontend UI | http://192.168.1.9:5173 | ✅ Running |
| CMDB Dashboard | http://192.168.1.9:5173/cmdb | ✅ Working |
| Downloads | http://192.168.1.9:5173/downloads | ✅ Available |
| Linux Agent | 192.168.1.9 (rrd) | ✅ Online |
| Windows Agent | 192.168.0.100 | ⏳ Ready to install |

## 🪟 Windows Installation Commands

### On Windows Machine (192.168.0.100)

**Open PowerShell as Administrator**, then run:

```powershell
# Navigate to Downloads
cd $env:USERPROFILE\Downloads

# Download files
Invoke-WebRequest -Uri "http://192.168.1.9:5173/downloads/CMDBAgentService.exe" -OutFile "CMDBAgentService.exe"
Invoke-WebRequest -Uri "http://192.168.1.9:5173/downloads/install-simple.ps1" -OutFile "install-simple.ps1"

# Allow script execution (for this session only)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Run installer
.\install-simple.ps1

# Verify installation
Get-Service CMDBAgent
```

## ✅ Expected Results

### After Installation

**Service Status:**
```
Status   Name         DisplayName
------   ----         -----------
Running  CMDBAgent    CMDB Agent Service
```

**CMDB Dashboard** (http://192.168.1.9:5173/cmdb) will show:

1. **rrd** (Linux Server)
   - IP: 192.168.1.9
   - OS: Ubuntu 24.04.3 LTS
   - CPU: Intel Xeon E3-1220 V2
   - RAM: 31.08 GB
   - Status: 🟢 ONLINE

2. **rrd_laptopnew** (Windows Workstation)
   - IP: 192.168.0.100
   - OS: Microsoft Windows 11 Pro
   - CPU: [Your actual CPU]
   - RAM: [Your actual RAM]
   - Status: 🟢 ONLINE

## 🔍 Data Collection

The Windows agent automatically collects:
- ✅ Real IP Address (filtered IPv4 only)
- ✅ MAC Address (physical adapter)
- ✅ OS Version (e.g., "Microsoft Windows 11 Pro")
- ✅ CPU Information (from WMI)
- ✅ RAM Size (total physical memory)
- ✅ Hostname (computer name)
- ✅ Domain/Workgroup status

**Automatically filters out:**
- ❌ IPv6 addresses
- ❌ Link-local addresses (169.254.x.x)
- ❌ Virtual network adapters

## 🔧 Troubleshooting

### Agent Not Showing in CMDB

1. **Check service status:**
   ```powershell
   Get-Service CMDBAgent
   ```

2. **Test network connectivity:**
   ```powershell
   Test-NetConnection 192.168.1.9 -Port 3001
   ```

3. **Verify config file:**
   ```powershell
   Get-Content "C:\Program Files\CMDB Agent\config.json"
   ```
   Should show:
   ```json
   {
     "serverUrl": "http://192.168.1.9:3001",
     "version": "1.0.0",
     "heartbeatInterval": 60
   }
   ```

4. **Restart service:**
   ```powershell
   Restart-Service CMDBAgent
   ```

5. **View Windows Event Logs:**
   ```powershell
   Get-EventLog -LogName Application -Source "CMDBAgent" -Newest 10
   ```

### Complete Uninstall/Reinstall

```powershell
# Stop and remove service
Stop-Service CMDBAgent -Force
sc.exe delete CMDBAgent

# Wait for deletion
Start-Sleep -Seconds 3

# Remove installation directory
Remove-Item "C:\Program Files\CMDB Agent" -Recurse -Force

# Re-run installer
cd $env:USERPROFILE\Downloads
.\install-simple.ps1
```

## 📂 File Locations

### Download Files
- **EXE**: http://192.168.1.9:5173/downloads/CMDBAgentService.exe (64 MB)
- **Installer**: http://192.168.1.9:5173/downloads/install-simple.ps1 (6 KB)

### Installation Paths (Windows)
- **Executable**: `C:\Program Files\CMDB Agent\CMDBAgentService.exe`
- **Config**: `C:\Program Files\CMDB Agent\config.json`
- **Service Name**: `CMDBAgent`
- **Display Name**: `CMDB Agent Service`

## 🚀 Quick Commands Reference

### Windows Service Management
```powershell
# Check status
Get-Service CMDBAgent

# Start service
Start-Service CMDBAgent

# Stop service
Stop-Service CMDBAgent

# Restart service
Restart-Service CMDBAgent

# View detailed info
Get-Service CMDBAgent | Format-List *

# Check if running
Get-Service CMDBAgent | Select-Object Status, Name, DisplayName
```

### Network Testing
```powershell
# Test backend connectivity
Test-NetConnection 192.168.1.9 -Port 3001

# Test if backend is responding
Invoke-WebRequest -Uri "http://192.168.1.9:3001/api/agents" -Method GET

# View your IP address
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*"}
```

## 📊 Monitoring

### Check CMDB Dashboard
- URL: http://192.168.1.9:5173/cmdb
- Refresh interval: 30 seconds (automatic)
- Shows all registered agents with real-time status

### Backend API
- Base URL: http://192.168.1.9:3001
- Agents endpoint: http://192.168.1.9:3001/api/agents
- Returns JSON with all registered agents

## ⏰ Heartbeat Timing

- **Linux Agent**: Every 10 seconds
- **Windows Agent**: Every 60 seconds (configurable in config.json)
- **Status timeout**: Agents marked offline after 10 minutes of no heartbeat

## 🎯 Success Criteria

✅ Service shows "Running" status
✅ Agent appears in CMDB dashboard within 2 minutes
✅ Real IP address displayed (not placeholder)
✅ Real CPU and RAM information shown
✅ MAC address populated
✅ Heartbeat updates every 60 seconds

---

**Created**: November 26, 2025  
**System**: CMDB Enterprise Monitoring  
**Version**: 1.0.0
