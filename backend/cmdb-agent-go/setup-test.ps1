# Quick CMDB Agent Test Script
# Run as Administrator

Write-Host "=== CMDB Agent v1.4.0 - Quick Test Setup ===" -ForegroundColor Cyan
Write-Host ""

# Check admin
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "ERROR: This script must be run as Administrator" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Setup directories
$testDir = "C:\cmdb-test"
Write-Host "[1/5] Creating test directory: $testDir" -ForegroundColor Green
New-Item -ItemType Directory -Force -Path $testDir | Out-Null
New-Item -ItemType Directory -Force -Path "$testDir\data" | Out-Null
New-Item -ItemType Directory -Force -Path "$testDir\logs" | Out-Null

# Create config
Write-Host "[2/5] Creating configuration file..." -ForegroundColor Green
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
  
  collection_mode: basic
  
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
  max_backups: 3
  max_age: 30
"@

$config | Out-File -FilePath "$testDir\config.yaml" -Encoding UTF8

# Copy binary if available
Write-Host "[3/5] Checking for agent binary..." -ForegroundColor Green
$sourceBinary = ".\dist\cmdb-agent-windows-amd64-v1.4.exe"
$targetBinary = "$testDir\cmdb-agent.exe"

if (Test-Path $sourceBinary) {
    Copy-Item $sourceBinary $targetBinary -Force
    Write-Host "    Binary copied successfully!" -ForegroundColor Green
} else {
    Write-Host "    Binary not found at: $sourceBinary" -ForegroundColor Yellow
    Write-Host "    You'll need to copy it manually to: $targetBinary" -ForegroundColor Yellow
}

# Create test script
Write-Host "[4/5] Creating test API script..." -ForegroundColor Green
$testScript = @'
# Test CMDB Agent API
# Run this after starting the agent

$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("admin:changeme"))
$headers = @{Authorization = "Basic $auth"}

Write-Host "`n=== Testing CMDB Agent API ===" -ForegroundColor Cyan

# Test health
Write-Host "`n[1] Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:8080/health
    Write-Host "    Status: " -NoNewline
    Write-Host $health.status -ForegroundColor Green
    Write-Host "    Version: $($health.version)"
} catch {
    Write-Host "    FAILED: $_" -ForegroundColor Red
}

# Test dashboard
Write-Host "`n[2] Testing Dashboard..." -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri http://localhost:8080/api/v1/dashboard -Headers $headers
    Write-Host "    Active Collectors: " -NoNewline
    Write-Host $dashboard.active_collectors -ForegroundColor Green
    Write-Host "    Total Collectors: $($dashboard.total_collectors)"
} catch {
    Write-Host "    FAILED: $_" -ForegroundColor Red
}

# Test Windows Defender
Write-Host "`n[3] Testing Windows Defender Status..." -ForegroundColor Yellow
try {
    $defender = Invoke-RestMethod -Uri http://localhost:8080/api/v1/collectors/windows_defender -Headers $headers
    Write-Host "    Antivirus Enabled: " -NoNewline
    Write-Host $defender.defender_status.antivirus_enabled -ForegroundColor Green
    Write-Host "    Real-time Protection: $($defender.defender_status.real_time_protection_enabled)"
    Write-Host "    Signature Version: $($defender.defender_status.antivirus_signature_version)"
} catch {
    Write-Host "    FAILED: $_" -ForegroundColor Red
}

# Test Windows Firewall
Write-Host "`n[4] Testing Windows Firewall..." -ForegroundColor Yellow
try {
    $firewall = Invoke-RestMethod -Uri http://localhost:8080/api/v1/collectors/windows_firewall -Headers $headers
    Write-Host "    Domain Profile: " -NoNewline
    Write-Host $firewall.profiles.domain.state -ForegroundColor Green
    Write-Host "    Private Profile: $($firewall.profiles.private.state)"
    Write-Host "    Public Profile: $($firewall.profiles.public.state)"
    Write-Host "    Total Rules: $($firewall.rule_statistics.total_rules)"
} catch {
    Write-Host "    FAILED: $_" -ForegroundColor Red
}

# Test Performance Metrics
Write-Host "`n[5] Testing Performance Metrics (PDH)..." -ForegroundColor Yellow
try {
    $perf = Invoke-RestMethod -Uri http://localhost:8080/api/v1/collectors/windows_pdh -Headers $headers
    Write-Host "    CPU Usage: " -NoNewline
    Write-Host "$($perf.processor.processor_time)%" -ForegroundColor Green
    Write-Host "    Available Memory: $($perf.memory_detailed.available_mb) MB"
    Write-Host "    Disk Read: $($perf.disk.read_bytes_per_sec) bytes/sec"
} catch {
    Write-Host "    FAILED: $_" -ForegroundColor Red
}

# Test Windows Updates
Write-Host "`n[6] Testing Windows Updates..." -ForegroundColor Yellow
try {
    $updates = Invoke-RestMethod -Uri http://localhost:8080/api/v1/collectors/windows_update -Headers $headers
    Write-Host "    Total Updates Installed: " -NoNewline
    Write-Host $updates.installed_updates.total_updates -ForegroundColor Green
    Write-Host "    Most Recent: $($updates.installed_updates.most_recent_update)"
} catch {
    Write-Host "    FAILED: $_" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
'@

$testScript | Out-File -FilePath "$testDir\test-api.ps1" -Encoding UTF8

# Summary
Write-Host "[5/5] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "======================== NEXT STEPS ========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the agent:" -ForegroundColor Yellow
Write-Host "   cd $testDir" -ForegroundColor White
Write-Host "   .\cmdb-agent.exe --config=config.yaml" -ForegroundColor White
Write-Host ""
Write-Host "2. In another PowerShell window, test the API:" -ForegroundColor Yellow
Write-Host "   cd $testDir" -ForegroundColor White
Write-Host "   .\test-api.ps1" -ForegroundColor White
Write-Host ""
Write-Host "3. Or test manually:" -ForegroundColor Yellow
Write-Host "   curl http://localhost:8080/health" -ForegroundColor White
Write-Host ""
Write-Host "======================== CREDENTIALS ========================" -ForegroundColor Cyan
Write-Host "   API URL: http://localhost:8080" -ForegroundColor White
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: changeme" -ForegroundColor White
Write-Host ""
Write-Host "======================== LOCATIONS ========================" -ForegroundColor Cyan
Write-Host "   Config: $testDir\config.yaml" -ForegroundColor White
Write-Host "   Binary: $testDir\cmdb-agent.exe" -ForegroundColor White
Write-Host "   Logs: $testDir\logs\agent.log" -ForegroundColor White
Write-Host "   Data: $testDir\data\cmdb.db" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
