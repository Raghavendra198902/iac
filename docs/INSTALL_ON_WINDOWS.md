# Windows Service Installation Guide

## ✅ VERIFIED: Heartbeat System Working!

The CMDB backend is now successfully registering agents. Test agent "rrd" registered successfully.

## 📥 Download and Install on Windows

### Step 1: Download the Service

**Option A: Direct Download**
```
http://192.168.1.9:5173/downloads/CMDBAgentService.exe
```

**Option B: Using PowerShell**
```powershell
# Run as Administrator
$url = "http://192.168.1.9:5173/downloads/CMDBAgentService.exe"
$output = "$env:TEMP\CMDBAgentService.exe"
Invoke-WebRequest -Uri $url -OutFile $output
```

### Step 2: Install the Service

**Method 1: Quick Install (Recommended)**

1. Open PowerShell as Administrator
2. Navigate to download location:
   ```powershell
   cd $env:TEMP
   ```

3. Create installation directory:
   ```powershell
   $installPath = "C:\Program Files\CMDB Agent"
   New-Item -ItemType Directory -Path $installPath -Force
   ```

4. Copy the service:
   ```powershell
   Copy-Item CMDBAgentService.exe -Destination $installPath
   ```

5. Create config file:
   ```powershell
   $config = @{
       serverUrl = "http://192.168.1.9:3001"
       version = "1.0.0"
       heartbeatInterval = 60
   } | ConvertTo-Json
   
   $config | Out-File -FilePath "$installPath\config.json" -Encoding UTF8
   ```

6. Install as Windows Service:
   ```powershell
   sc.exe create CMDBAgent binPath= "$installPath\CMDBAgentService.exe" start= auto DisplayName= "CMDB Agent Service"
   sc.exe description CMDBAgent "CMDB Monitoring Agent - Sends system information to CMDB server"
   sc.exe failure CMDBAgent reset= 86400 actions= restart/5000/restart/10000/restart/30000
   ```

7. Start the service:
   ```powershell
   Start-Service CMDBAgent
   ```

8. Verify it's running:
   ```powershell
   Get-Service CMDBAgent
   ```

**Method 2: Using Installation Script**

1. Download both files:
   - CMDBAgentService.exe
   - install-service.ps1 (from: http://192.168.1.9:5173/downloads/real/)

2. Run PowerShell as Administrator

3. Navigate to download folder:
   ```powershell
   cd $env:USERPROFILE\Downloads
   ```

4. Run installer:
   ```powershell
   .\install-service.ps1
   ```

### Step 3: Verify Installation

**Check Service Status:**
```powershell
Get-Service CMDBAgent
```

Expected output:
```
Status   Name               DisplayName
------   ----               -----------
Running  CMDBAgent          CMDB Agent Service
```

**Check in Services Panel:**
```powershell
services.msc
```
Look for "CMDB Agent Service" - should show as "Running"

**View Logs:**
```powershell
Get-Content "C:\Program Files\CMDB Agent\logs\cmdb-agent-*.log" -Tail 20
```

### Step 4: Verify Agent Registration

Within 60 seconds, your agent should appear in CMDB:

**Option 1: Web Interface**
```
http://192.168.1.9:5173/cmdb
```

**Option 2: API Check**
```powershell
Invoke-RestMethod -Uri "http://192.168.1.9:3001/api/agents" | ConvertTo-Json -Depth 3
```

You should see your computer name (hostname) in the list with status "online".

## 🔧 Troubleshooting

### Service Won't Start

1. Check Windows Event Viewer:
   ```powershell
   eventvwr.msc
   ```
   Navigate to: Windows Logs > Application
   Look for errors from "CMDBAgent"

2. Run manually to see errors:
   ```powershell
   cd "C:\Program Files\CMDB Agent"
   .\CMDBAgentService.exe
   ```

### Agent Not Appearing in CMDB

1. **Check Network Connectivity:**
   ```powershell
   Test-NetConnection -ComputerName 192.168.1.9 -Port 3001
   ```

2. **Test Heartbeat Manually:**
   ```powershell
   $body = @{
       hostname = $env:COMPUTERNAME
       os = "Windows 11"
       version = "1.0.0"
       memory = "16 GB"
       cpu = "Intel Core i7"
   } | ConvertTo-Json

   Invoke-RestMethod -Uri "http://192.168.1.9:3001/api/agents/heartbeat" `
       -Method POST `
       -Body $body `
       -ContentType "application/json"
   ```

   If this works, the agent should appear within 60 seconds.

3. **Check Firewall:**
   ```powershell
   # Allow outbound connection to CMDB server
   New-NetFirewallRule -DisplayName "CMDB Agent" -Direction Outbound -RemoteAddress 192.168.1.9 -RemotePort 3001 -Action Allow
   ```

4. **Check Service Logs:**
   ```powershell
   $logPath = "C:\Program Files\CMDB Agent\logs"
   Get-ChildItem $logPath | Sort-Object LastWriteTime -Descending | Select-Object -First 1 | Get-Content -Tail 50
   ```

### Service Crashes

The service is configured with automatic recovery:
- 1st failure: Restart after 5 seconds
- 2nd failure: Restart after 10 seconds  
- 3rd+ failure: Restart after 30 seconds

Check recovery settings:
```powershell
sc.exe qfailure CMDBAgent
```

## 🗑️ Uninstallation

**Stop and Remove Service:**
```powershell
# Run as Administrator
Stop-Service CMDBAgent
sc.exe delete CMDBAgent
Remove-Item "C:\Program Files\CMDB Agent" -Recurse -Force
```

## 📊 Monitoring

**View Real-time Logs:**
```powershell
Get-Content "C:\Program Files\CMDB Agent\logs\cmdb-agent-$(Get-Date -Format yyyy-MM-dd).log" -Wait -Tail 10
```

**Check Agent Status in CMDB:**
```powershell
# PowerShell script to check agent status
function Get-CMDBAgentStatus {
    $response = Invoke-RestMethod -Uri "http://192.168.1.9:3001/api/agents"
    $myAgent = $response.agents | Where-Object { $_.agentName -eq $env:COMPUTERNAME }
    
    if ($myAgent) {
        Write-Host "Agent Status: $($myAgent.status)" -ForegroundColor $(if($myAgent.status -eq 'online'){'Green'}else{'Red'})
        Write-Host "Last Seen: $($myAgent.lastSeen)"
        Write-Host "Heartbeats: $($myAgent.eventCounts.heartbeat)"
    } else {
        Write-Host "Agent not registered yet" -ForegroundColor Yellow
    }
}

Get-CMDBAgentStatus
```

## ✅ Success Criteria

Your installation is successful if:
1. ✅ Service shows as "Running" in services.msc
2. ✅ Log file exists: `C:\Program Files\CMDB Agent\logs\cmdb-agent-*.log`
3. ✅ Log shows "Heartbeat sent successfully" entries
4. ✅ Your hostname appears at http://192.168.1.9:3001/api/agents
5. ✅ Status shows as "online" in CMDB

## 🎯 Expected Behavior

Once installed:
- Service runs automatically on system startup
- Sends heartbeat every 60 seconds to http://192.168.1.9:3001/api/agents/heartbeat
- Collects and sends: hostname, OS version, memory, CPU info
- Logs all activities to daily log files
- Automatically restarts if it crashes
- Runs without requiring user login

## 📞 Support

If you encounter issues:
1. Check logs: `C:\Program Files\CMDB Agent\logs\`
2. View Windows Event Viewer for service errors
3. Test network connectivity to 192.168.1.9:3001
4. Verify backend service is running: http://192.168.1.9:3001/api/agents
