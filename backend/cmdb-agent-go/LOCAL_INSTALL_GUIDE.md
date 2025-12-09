# Local PC Installation Guide - Windows Agent v1.4.0

## Quick Install for Testing (No Service)

### Prerequisites
- Windows 10/11 or Windows Server 2016+
- Administrator privileges
- 100 MB free disk space
- Port 8080 available (or configure different port)

### Option 1: Quick Test (Run in Terminal)

1. **Download the agent**:
   ```powershell
   # Create test directory
   mkdir C:\cmdb-test
   cd C:\cmdb-test
   
   # Download from your repo (or copy from dist folder)
   # Copy the binary: backend/cmdb-agent-go/dist/cmdb-agent-windows-amd64-v1.4.exe
   ```

2. **Create test configuration**:
   Save as `C:\cmdb-test\config.yaml`:
   ```yaml
   server:
     host: 0.0.0.0
     port: 8080
     read_timeout: 30s
     write_timeout: 30s
   
   collectors:
     enabled:
       - system
       - hardware
       - software
       - license
       - performance
       - policy
       - user
       - certificate
       - windows_registry
       - windows_wmi
       - windows_pdh
       - windows_eventlog_api
       - windows_defender
       - windows_firewall
       - windows_update
     
     collection_mode: basic  # or "detailed" for more data
     
     intervals:
       system: 5m
       hardware: 10m
       software: 15m
       license: 30m
       performance: 1m
       policy: 5m
       user: 10m
       certificate: 30m
       windows_registry: 10m
       windows_wmi: 5m
       windows_pdh: 1m
       windows_eventlog_api: 5m
       windows_defender: 10m
       windows_firewall: 15m
       windows_update: 30m
   
   storage:
     type: boltdb
     path: C:\cmdb-test\data\cmdb.db
   
   api:
     enabled: true
     auth:
       enabled: true
       username: admin
       password: changeme
   
   logging:
     level: info
     file: C:\cmdb-test\logs\agent.log
     max_size: 100
     max_backups: 3
     max_age: 30
   ```

3. **Run the agent**:
   ```powershell
   # Open PowerShell as Administrator
   cd C:\cmdb-test
   
   # Run the agent
   .\cmdb-agent-windows-amd64-v1.4.exe --config=config.yaml
   ```

4. **Test the API** (in another PowerShell window):
   ```powershell
   # Test health endpoint
   curl http://localhost:8080/health
   
   # Test with authentication
   $headers = @{
       Authorization = "Basic " + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:changeme"))
   }
   
   # Get dashboard
   Invoke-WebRequest -Uri http://localhost:8080/api/v1/dashboard -Headers $headers
   
   # Get system inventory
   Invoke-WebRequest -Uri http://localhost:8080/api/v1/inventory/system -Headers $headers
   
   # Get Windows Defender status
   Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_defender -Headers $headers
   
   # Get Windows Firewall status
   Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_firewall -Headers $headers
   
   # Get performance metrics (PDH)
   Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_pdh -Headers $headers
   ```

### Option 2: Install as Windows Service

1. **Copy files to Program Files**:
   ```powershell
   # Run as Administrator
   mkdir "C:\Program Files\CMDB Agent"
   
   # Copy binary
   Copy-Item "cmdb-agent-windows-amd64-v1.4.exe" "C:\Program Files\CMDB Agent\cmdb-agent.exe"
   
   # Copy config
   Copy-Item "config.yaml" "C:\Program Files\CMDB Agent\config.yaml"
   ```

2. **Install the service**:
   ```powershell
   # Update config.yaml paths to use "C:\Program Files\CMDB Agent\..."
   # Update storage.path: C:\Program Files\CMDB Agent\data\cmdb.db
   # Update logging.file: C:\Program Files\CMDB Agent\logs\agent.log
   
   # Run install script
   cd backend\cmdb-agent-go
   .\install-windows.ps1
   ```

3. **Verify service**:
   ```powershell
   # Check service status
   Get-Service CMDBAgent
   
   # View logs
   Get-Content "C:\Program Files\CMDB Agent\logs\agent.log" -Tail 50
   ```

### Option 3: Quick Test Script (All-in-One)

Save as `test-agent.ps1` and run as Administrator:

```powershell
# Quick CMDB Agent Test Script
# Run as Administrator

Write-Host "=== CMDB Agent v1.4.0 - Quick Test ===" -ForegroundColor Cyan

# Check admin
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "Must run as Administrator"
    exit 1
}

# Setup
$testDir = "C:\cmdb-test"
Write-Host "`nCreating test directory: $testDir" -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $testDir | Out-Null
New-Item -ItemType Directory -Force -Path "$testDir\data" | Out-Null
New-Item -ItemType Directory -Force -Path "$testDir\logs" | Out-Null

# Create config
Write-Host "Creating configuration..." -ForegroundColor Green
$config = @"
server:
  host: 0.0.0.0
  port: 8080
  read_timeout: 30s
  write_timeout: 30s

collectors:
  enabled:
    - system
    - hardware
    - windows_registry
    - windows_wmi
    - windows_pdh
    - windows_defender
    - windows_firewall
    - windows_update
  
  collection_mode: basic
  
  intervals:
    system: 5m
    hardware: 10m
    windows_registry: 10m
    windows_wmi: 5m
    windows_pdh: 1m
    windows_defender: 10m
    windows_firewall: 15m
    windows_update: 30m

storage:
  type: boltdb
  path: $testDir\data\cmdb.db

api:
  enabled: true
  auth:
    enabled: true
    username: admin
    password: changeme

logging:
  level: info
  file: $testDir\logs\agent.log
  max_size: 100
"@

$config | Out-File -FilePath "$testDir\config.yaml" -Encoding UTF8

Write-Host "`nConfiguration created at: $testDir\config.yaml" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Copy cmdb-agent-windows-amd64-v1.4.exe to $testDir" -ForegroundColor White
Write-Host "2. Open PowerShell as Admin in $testDir" -ForegroundColor White
Write-Host "3. Run: .\cmdb-agent-windows-amd64-v1.4.exe --config=config.yaml" -ForegroundColor White
Write-Host "`nAPI will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Username: admin | Password: changeme" -ForegroundColor Cyan
Write-Host "`nTest with: curl http://localhost:8080/health" -ForegroundColor Green
```

## Testing Endpoints

Once the agent is running, test these endpoints:

### Basic Endpoints
```powershell
# Health check (no auth)
curl http://localhost:8080/health

# Dashboard (with auth)
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:changeme"))
$headers = @{Authorization = "Basic $auth"}

Invoke-WebRequest -Uri http://localhost:8080/api/v1/dashboard -Headers $headers | Select-Object -ExpandProperty Content
```

### Windows-Specific Endpoints
```powershell
# Windows Registry
Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_registry -Headers $headers

# Windows WMI (11 classes)
Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_wmi -Headers $headers

# Performance counters (PDH - 40+ metrics)
Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_pdh -Headers $headers

# Windows Defender
Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_defender -Headers $headers

# Windows Firewall
Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_firewall -Headers $headers

# Windows Update
Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_update -Headers $headers

# Event Logs
Invoke-WebRequest -Uri http://localhost:8080/api/v1/collectors/windows_eventlog_api -Headers $headers
```

## Viewing Results

### Using PowerShell
```powershell
# Pretty print JSON
$result = Invoke-RestMethod -Uri http://localhost:8080/api/v1/collectors/windows_defender -Headers $headers
$result | ConvertTo-Json -Depth 10

# Save to file
$result | ConvertTo-Json -Depth 10 | Out-File defender-status.json
```

### Using Browser
Open in browser with Basic Auth:
- http://localhost:8080/health
- http://localhost:8080/api/v1/dashboard

Or use Postman/Insomnia with Basic Auth (admin/changeme)

## Troubleshooting

### Port already in use
```powershell
# Find what's using port 8080
netstat -ano | findstr :8080

# Kill the process (replace PID)
taskkill /PID <process_id> /F

# Or change port in config.yaml
```

### Permission errors
- Run PowerShell as Administrator
- Check Windows Defender isn't blocking
- Verify firewall allows the application

### Collector errors
```powershell
# Check logs
Get-Content C:\cmdb-test\logs\agent.log -Tail 100

# Test specific collector (detailed mode)
# Add to config.yaml: collection_mode: detailed
```

### WMI access denied
- Ensure running as Administrator
- Add user to "Performance Monitor Users" group
- Check WMI service is running: `Get-Service Winmgmt`

## Stopping the Agent

```powershell
# If running in terminal: Press Ctrl+C

# If running as service:
Stop-Service CMDBAgent

# To uninstall service:
.\uninstall-windows.ps1
```

## What You Should See

When agent starts successfully:
```
INFO    Starting CMDB Agent    version=1.4.0
INFO    Loading configuration    path=config.yaml
INFO    Initializing collectors
INFO    Registered Windows-specific collectors    count=9
INFO    Starting HTTP server    address=0.0.0.0:8080
INFO    Agent started successfully
```

## Expected Data Collection

- **System Info**: Computer name, OS version, architecture
- **Hardware**: CPU, memory, disks (via WMI)
- **Registry**: Windows settings, installed software, policies
- **Performance**: CPU %, memory usage, disk I/O, network (40+ PDH metrics)
- **Security**:
  - Defender: Status, signatures, threats
  - Firewall: Profiles, rules, statistics
  - Updates: Installed updates, last check
- **Event Logs**: System, Application, Security events

## Support

If you encounter issues:
1. Check logs: `C:\cmdb-test\logs\agent.log`
2. Verify admin privileges
3. Check Windows Defender/Firewall isn't blocking
4. Ensure required ports are available
5. Review IMPLEMENTATION_ROADMAP.md for known limitations
