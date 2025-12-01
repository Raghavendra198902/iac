# Install CMDB Agent Windows Service
# Run as Administrator

param(
    [string]$ServerUrl = "http://192.168.1.9:3001",
    [string]$InstallPath = "C:\Program Files\CMDB Agent"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CMDB Agent Service Installer v1.0   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green

# Stop and remove existing service if present
$serviceName = "CMDBAgent"
$existingService = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "⚠️  Existing service found. Removing..." -ForegroundColor Yellow
    
    if ($existingService.Status -eq 'Running') {
        Stop-Service -Name $serviceName -Force
        Start-Sleep -Seconds 2
    }
    
    sc.exe delete $serviceName
    Start-Sleep -Seconds 2
    Write-Host "✅ Old service removed" -ForegroundColor Green
}

# Create installation directory
Write-Host "📁 Creating installation directory..." -ForegroundColor Yellow
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

# Copy service executable
Write-Host "📦 Installing service files..." -ForegroundColor Yellow
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Copy-Item "$scriptPath\CMDBAgentService.exe" -Destination "$InstallPath\" -Force
Copy-Item "$scriptPath\config.json" -Destination "$InstallPath\" -Force

# Update config with server URL
$configPath = "$InstallPath\config.json"
$config = Get-Content $configPath | ConvertFrom-Json
$config.serverUrl = $ServerUrl
$config | ConvertTo-Json | Set-Content $configPath

Write-Host "✅ Files installed to $InstallPath" -ForegroundColor Green

# Create Windows Service
Write-Host "🔧 Creating Windows Service..." -ForegroundColor Yellow
$servicePath = "$InstallPath\CMDBAgentService.exe"

# Use sc.exe to create the service
sc.exe create $serviceName binPath= "`"$servicePath`"" start= auto DisplayName= "CMDB Agent Service"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create service" -ForegroundColor Red
    exit 1
}

# Set service description
sc.exe description $serviceName "CMDB Monitoring Agent - Sends system information to CMDB server"

# Set service recovery options (restart on failure)
sc.exe failure $serviceName reset= 86400 actions= restart/5000/restart/10000/restart/30000

Write-Host "✅ Service created successfully" -ForegroundColor Green

# Create logs directory
$logsPath = "$InstallPath\logs"
if (-not (Test-Path $logsPath)) {
    New-Item -ItemType Directory -Path $logsPath -Force | Out-Null
}

# Set appropriate permissions (allow service to write logs)
$acl = Get-Acl $InstallPath
$permission = "NT AUTHORITY\LOCAL SERVICE", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow"
$accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule $permission
$acl.SetAccessRule($accessRule)
Set-Acl $InstallPath $acl

# Start the service
Write-Host "🚀 Starting CMDB Agent service..." -ForegroundColor Yellow
Start-Service -Name $serviceName
Start-Sleep -Seconds 3

# Verify service is running
$service = Get-Service -Name $serviceName
if ($service.Status -eq 'Running') {
    Write-Host "✅ Service started successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Service created but not running. Status: $($service.Status)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "     ✅ INSTALLATION COMPLETE!          " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Service Details:" -ForegroundColor Cyan
Write-Host "  Name: CMDBAgent" -ForegroundColor White
Write-Host "  Status: $($service.Status)" -ForegroundColor White
Write-Host "  Start Type: Automatic" -ForegroundColor White
Write-Host "  Server URL: $ServerUrl" -ForegroundColor White
Write-Host "  Install Path: $InstallPath" -ForegroundColor White
Write-Host ""
Write-Host "Management Commands:" -ForegroundColor Yellow
Write-Host "  View Status:   Get-Service CMDBAgent" -ForegroundColor White
Write-Host "  Start Service: Start-Service CMDBAgent" -ForegroundColor White
Write-Host "  Stop Service:  Stop-Service CMDBAgent" -ForegroundColor White
Write-Host "  View Logs:     Get-Content '$InstallPath\logs\cmdb-agent-*.log'" -ForegroundColor White
Write-Host "  Uninstall:     .\uninstall-service.ps1" -ForegroundColor White
Write-Host ""
Write-Host "The agent will send heartbeats to $ServerUrl every 60 seconds." -ForegroundColor Cyan
Write-Host ""
pause
