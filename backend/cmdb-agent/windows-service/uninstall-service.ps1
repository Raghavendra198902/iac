# Uninstall CMDB Agent Windows Service
# Run as Administrator

param(
    [string]$InstallPath = "C:\Program Files\CMDB Agent",
    [switch]$RemoveFiles = $false
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " CMDB Agent Service Uninstaller v1.0  " -ForegroundColor Cyan
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

# Check if service exists
$serviceName = "CMDBAgent"
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Host "⚠️  Service '$serviceName' not found. Already uninstalled?" -ForegroundColor Yellow
} else {
    # Stop the service if running
    if ($service.Status -eq 'Running') {
        Write-Host "🛑 Stopping service..." -ForegroundColor Yellow
        Stop-Service -Name $serviceName -Force
        Start-Sleep -Seconds 3
        Write-Host "✅ Service stopped" -ForegroundColor Green
    }

    # Delete the service
    Write-Host "🗑️  Removing service..." -ForegroundColor Yellow
    sc.exe delete $serviceName
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service removed successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Failed to remove service (exit code: $LASTEXITCODE)" -ForegroundColor Yellow
    }
}

# Remove files if requested
if ($RemoveFiles) {
    if (Test-Path $InstallPath) {
        Write-Host "🗑️  Removing installation files..." -ForegroundColor Yellow
        try {
            Remove-Item -Path $InstallPath -Recurse -Force
            Write-Host "✅ Installation files removed" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Could not remove some files: $_" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    ✅ UNINSTALLATION COMPLETE!         " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if (-not $RemoveFiles) {
    Write-Host "Note: Installation files remain at: $InstallPath" -ForegroundColor Cyan
    Write-Host "To remove files, run: .\uninstall-service.ps1 -RemoveFiles" -ForegroundColor Yellow
}

Write-Host ""
pause
