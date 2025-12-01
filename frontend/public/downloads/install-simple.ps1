# ============================================================================
# CMDB Agent - Simple Installation Script
# Run this in PowerShell as Administrator
# ============================================================================

# Check Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Please run PowerShell as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CMDB Agent Service Installation" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Delete old service if exists
Write-Host "[1/6] Checking for existing service..." -ForegroundColor Yellow
$service = Get-Service -Name "CMDBAgent" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "      Found existing service. Removing..." -ForegroundColor Yellow
    Stop-Service -Name "CMDBAgent" -Force -ErrorAction SilentlyContinue
    sc.exe delete CMDBAgent
    Start-Sleep -Seconds 3
    Write-Host "      Old service removed" -ForegroundColor Green
} else {
    Write-Host "      No existing service found" -ForegroundColor Green
}

# Step 2: Create directory
Write-Host "`n[2/6] Creating installation directory..." -ForegroundColor Yellow
$installDir = "C:\Program Files\CMDB Agent"
New-Item -ItemType Directory -Path $installDir -Force | Out-Null
Write-Host "      Created: $installDir" -ForegroundColor Green

# Step 3: Copy executable
Write-Host "`n[3/6] Looking for executable..." -ForegroundColor Yellow
$exeName = "CMDBAgentService.exe"
$downloadPath = "$env:USERPROFILE\Downloads\$exeName"
$desktopPath = "$env:USERPROFILE\Desktop\$exeName"
$installPath = "$installDir\$exeName"

$foundPath = $null
if (Test-Path $downloadPath) {
    $foundPath = $downloadPath
    Write-Host "      Found in Downloads" -ForegroundColor Green
} elseif (Test-Path $desktopPath) {
    $foundPath = $desktopPath
    Write-Host "      Found on Desktop" -ForegroundColor Green
} elseif (Test-Path $installPath) {
    $foundPath = $installPath
    Write-Host "      Already installed" -ForegroundColor Green
}

if (-not $foundPath) {
    Write-Host "      ERROR: Cannot find $exeName" -ForegroundColor Red
    Write-Host "      Please download from:" -ForegroundColor Yellow
    Write-Host "      http://192.168.1.9:5173/downloads/CMDBAgentService.exe" -ForegroundColor Cyan
    Write-Host "`n      Save to Downloads or Desktop folder" -ForegroundColor Yellow
    pause
    exit 1
}

if ($foundPath -ne $installPath) {
    Write-Host "      Copying to installation directory..." -ForegroundColor Yellow
    Copy-Item $foundPath -Destination $installPath -Force
    Unblock-File $installPath -ErrorAction SilentlyContinue
}

$fileSize = [math]::Round((Get-Item $installPath).Length / 1MB, 2)
Write-Host "      Installed: $installPath ($fileSize MB)" -ForegroundColor Green

# Step 4: Create config file
Write-Host "`n[4/6] Creating configuration..." -ForegroundColor Yellow
$configPath = "$installDir\config.json"
$config = @"
{
  "serverUrl": "http://192.168.1.9:3001",
  "version": "1.0.0",
  "heartbeatInterval": 60
}
"@
$config | Out-File $configPath -Encoding UTF8 -Force
Write-Host "      Config: $configPath" -ForegroundColor Green

# Step 5: Create Windows Service
Write-Host "`n[5/6] Creating Windows Service..." -ForegroundColor Yellow
$binaryPath = "`"$installPath`""
Write-Host "      Service Name: CMDBAgent" -ForegroundColor Cyan
Write-Host "      Binary Path: $binaryPath" -ForegroundColor Cyan

$createResult = sc.exe create CMDBAgent binPath= $binaryPath start= auto DisplayName= "CMDB Agent Service"

if ($LASTEXITCODE -eq 0) {
    Write-Host "      Service created successfully!" -ForegroundColor Green
    
    # Set description and recovery
    sc.exe description CMDBAgent "CMDB Monitoring Agent - Sends system info to CMDB server" | Out-Null
    sc.exe failure CMDBAgent reset= 86400 actions= restart/5000/restart/10000/restart/30000 | Out-Null
    Write-Host "      Recovery options configured" -ForegroundColor Green
} else {
    Write-Host "      ERROR: Failed to create service!" -ForegroundColor Red
    Write-Host "      $createResult" -ForegroundColor Red
    pause
    exit 1
}

# Step 6: Start the service
Write-Host "`n[6/6] Starting service..." -ForegroundColor Yellow
try {
    Start-Service -Name "CMDBAgent" -ErrorAction Stop
    Start-Sleep -Seconds 2
    
    $svc = Get-Service -Name "CMDBAgent"
    if ($svc.Status -eq 'Running') {
        Write-Host "      Service is RUNNING!" -ForegroundColor Green
    } else {
        Write-Host "      Service Status: $($svc.Status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "      Warning: Could not start service" -ForegroundColor Yellow
    Write-Host "      Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`n      Try starting manually:" -ForegroundColor Yellow
    Write-Host "      Start-Service CMDBAgent" -ForegroundColor Cyan
}

# Final summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Service Status:" -ForegroundColor Yellow
Get-Service -Name "CMDBAgent" | Format-List Name, DisplayName, Status, StartType

Write-Host "\nVerify in CMDB:" -ForegroundColor Yellow
Write-Host "http://192.168.1.100:5173/cmdb" -ForegroundColor Cyan

Write-Host "`nUseful Commands:" -ForegroundColor Yellow
Write-Host "  Get-Service CMDBAgent           # Check status" -ForegroundColor Cyan
Write-Host "  Start-Service CMDBAgent         # Start service" -ForegroundColor Cyan
Write-Host "  Stop-Service CMDBAgent          # Stop service" -ForegroundColor Cyan
Write-Host "  Restart-Service CMDBAgent       # Restart service" -ForegroundColor Cyan
Write-Host "  services.msc                    # Open Services GUI" -ForegroundColor Cyan

Write-Host "`nLogs location:" -ForegroundColor Yellow
Write-Host "$installDir\logs\" -ForegroundColor Cyan

Write-Host "`n"
pause
