# Windows Service Uninstaller Script
# Run as Administrator to remove CMDB Agent

$ServiceName = "CMDBAgent"
$InstallPath = "C:\Program Files\CMDB Agent"

Write-Host "Uninstalling CMDB Agent..." -ForegroundColor Yellow

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

# Stop service if running
if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Write-Host "Stopping service..." -ForegroundColor Cyan
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    # Remove service
    Write-Host "Removing service..." -ForegroundColor Cyan
    sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
} else {
    Write-Host "Service not found (may already be uninstalled)" -ForegroundColor Yellow
}

# Remove from PATH
Write-Host "Removing from PATH..." -ForegroundColor Cyan
$path = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($path -like "*$InstallPath*") {
    $newPath = $path -replace [regex]::Escape(";$InstallPath"), ""
    $newPath = $newPath -replace [regex]::Escape("$InstallPath;"), ""
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
    Write-Host "Removed from PATH" -ForegroundColor Green
}

# Remove Start Menu shortcuts
$startMenuPath = "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\CMDB Agent"
if (Test-Path $startMenuPath) {
    Write-Host "Removing Start Menu shortcuts..." -ForegroundColor Cyan
    Remove-Item $startMenuPath -Recurse -Force -ErrorAction SilentlyContinue
}

# Prompt for config/data removal
$removeData = Read-Host "Remove configuration and data files? (y/N)"
if ($removeData -eq "y" -or $removeData -eq "Y") {
    # Remove program files
    if (Test-Path $InstallPath) {
        Write-Host "Removing program files..." -ForegroundColor Cyan
        Remove-Item $InstallPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Remove data directory
    $dataPath = "C:\ProgramData\CMDB Agent"
    if (Test-Path $dataPath) {
        Write-Host "Removing data directory..." -ForegroundColor Cyan
        Remove-Item $dataPath -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Remove registry keys
    Write-Host "Removing registry keys..." -ForegroundColor Cyan
    Remove-Item "HKLM:\SOFTWARE\CMDBAgent" -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "CMDB Agent has been completely removed." -ForegroundColor Green
} else {
    Write-Host "Configuration and data files preserved at:" -ForegroundColor Yellow
    Write-Host "  $InstallPath" -ForegroundColor Yellow
    Write-Host "  C:\ProgramData\CMDB Agent" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Uninstallation complete!" -ForegroundColor Green
Write-Host "You may need to restart your terminal for PATH changes to take effect." -ForegroundColor Cyan
