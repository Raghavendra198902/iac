# CMDB Agent Windows Installer
# Run this script with: PowerShell -ExecutionPolicy Bypass -File install.ps1

param(
    [string]$InstallPath = "$env:ProgramFiles\CMDB Agent",
    [string]$ApiUrl = "",
    [string]$ApiKey = "",
    [string]$AgentName = $env:COMPUTERNAME
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "CMDB Agent Installer v1.0.0" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This installer requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    pause
    exit 1
}

# Get API configuration
if ([string]::IsNullOrEmpty($ApiUrl)) {
    $ApiUrl = Read-Host "Enter CMDB API URL (default: http://localhost:3000/api/cmdb)"
    if ([string]::IsNullOrEmpty($ApiUrl)) {
        $ApiUrl = "http://localhost:3000/api/cmdb"
    }
}

if ([string]::IsNullOrEmpty($ApiKey)) {
    $ApiKey = Read-Host "Enter API Key (required)"
    if ([string]::IsNullOrEmpty($ApiKey)) {
        Write-Host "ERROR: API Key is required!" -ForegroundColor Red
        pause
        exit 1
    }
}

# Create installation directory
Write-Host "Creating installation directory..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
New-Item -ItemType Directory -Path "$InstallPath\logs" -Force | Out-Null

# Copy executable
Write-Host "Copying executable..." -ForegroundColor Cyan
Copy-Item "cmdb-agent-win.exe" "$InstallPath\cmdb-agent.exe" -Force

# Create config
Write-Host "Creating configuration..." -ForegroundColor Cyan
$Config = @{
    apiUrl = $ApiUrl
    apiKey = $ApiKey
    agentId = "agent-$env:COMPUTERNAME"
    agentName = $AgentName
    syncInterval = 300000
    discoveryInterval = 3600000
    logLevel = "info"
} | ConvertTo-Json

$Config | Out-File -FilePath "$InstallPath\config.json" -Encoding UTF8

# Create shortcuts
Write-Host "Creating shortcuts..." -ForegroundColor Cyan
$WScriptShell = New-Object -ComObject WScript.Shell
$StartMenuPath = "$env:ProgramData\Microsoft\Windows\Start Menu\Programs\CMDB Agent"
New-Item -ItemType Directory -Path $StartMenuPath -Force | Out-Null

$Shortcut = $WScriptShell.CreateShortcut("$StartMenuPath\CMDB Agent.lnk")
$Shortcut.TargetPath = "$InstallPath\cmdb-agent.exe"
$Shortcut.WorkingDirectory = $InstallPath
$Shortcut.Save()

Write-Host ""
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Installation completed!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "Location: $InstallPath" -ForegroundColor Cyan
pause
