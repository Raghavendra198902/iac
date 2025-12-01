# CMDB Agent Windows Installer
# Version: 1.0.0
# Download and run: powershell -ExecutionPolicy Bypass -File install-cmdb-agent-windows.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CMDB Agent Windows Installer v1.0   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$AgentVersion = "1.0.0"
$InstallPath = "C:\Program Files\CMDB Agent"
$ServiceName = "CMDBAgent"
$ServerUrl = "http://192.168.1.9:3001"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "✅ Running with Administrator privileges" -ForegroundColor Green

# Create installation directory
Write-Host "📁 Creating installation directory..." -ForegroundColor Yellow
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

# Download agent from server
Write-Host "⬇️  Downloading CMDB Agent..." -ForegroundColor Yellow
$AgentScript = @"
# CMDB Agent Main Script
`$version = "$AgentVersion"
`$serverUrl = "$ServerUrl"

Write-Host "CMDB Agent v`$version running..."
Write-Host "Server: `$serverUrl"

while (`$true) {
    try {
        # Collect system information
        `$hostname = `$env:COMPUTERNAME
        `$os = (Get-WmiObject Win32_OperatingSystem).Caption
        `$memory = [math]::Round((Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)
        `$cpu = (Get-WmiObject Win32_Processor).Name
        
        `$data = @{
            hostname = `$hostname
            os = `$os
            memory = "`$memory GB"
            cpu = `$cpu
            version = `$version
            timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        }
        
        # Send data to server
        `$json = ConvertTo-Json `$data
        Invoke-RestMethod -Uri "`$serverUrl/api/agents/heartbeat" -Method POST -Body `$json -ContentType "application/json" -ErrorAction SilentlyContinue
        
        Write-Host "[`$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Heartbeat sent to `$serverUrl"
    }
    catch {
        Write-Host "[`$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] Error: `$_"
    }
    
    Start-Sleep -Seconds 60
}
"@

# Save agent script
$AgentScript | Out-File -FilePath "$InstallPath\cmdb-agent.ps1" -Encoding UTF8

# Create Windows Service wrapper
Write-Host "🔧 Creating Windows Service..." -ForegroundColor Yellow
$ServiceScript = @"
# CMDB Agent Service Wrapper
`$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -NoProfile -File `"$InstallPath\cmdb-agent.ps1`""
`$trigger = New-ScheduledTaskTrigger -AtStartup
`$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
`$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -TaskName "$ServiceName" -Action `$action -Trigger `$trigger -Principal `$principal -Settings `$settings -Force
"@

# Install as scheduled task (works like a service)
Invoke-Expression $ServiceScript
Write-Host "✅ Service installed successfully" -ForegroundColor Green

# Start the service
Write-Host "🚀 Starting CMDB Agent service..." -ForegroundColor Yellow
Start-ScheduledTask -TaskName $ServiceName
Write-Host "✅ Service started successfully" -ForegroundColor Green

# Create uninstaller
$UninstallScript = @"
# CMDB Agent Uninstaller
Write-Host "Stopping CMDB Agent..."
Unregister-ScheduledTask -TaskName "$ServiceName" -Confirm:`$false -ErrorAction SilentlyContinue
Write-Host "Removing files..."
Remove-Item -Path "$InstallPath" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "Uninstallation complete!"
pause
"@

$UninstallScript | Out-File -FilePath "$InstallPath\uninstall.ps1" -Encoding UTF8

# Add to Programs and Features
$RegPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\CMDBAgent"
New-Item -Path $RegPath -Force | Out-Null
Set-ItemProperty -Path $RegPath -Name "DisplayName" -Value "CMDB Agent"
Set-ItemProperty -Path $RegPath -Name "DisplayVersion" -Value $AgentVersion
Set-ItemProperty -Path $RegPath -Name "Publisher" -Value "IAC Dharma"
Set-ItemProperty -Path $RegPath -Name "InstallLocation" -Value $InstallPath
Set-ItemProperty -Path $RegPath -Name "UninstallString" -Value "powershell.exe -ExecutionPolicy Bypass -File `"$InstallPath\uninstall.ps1`""

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   ✅ Installation Complete!          " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Installation Path: $InstallPath" -ForegroundColor Cyan
Write-Host "🔗 Server URL: $ServerUrl" -ForegroundColor Cyan
Write-Host "📊 Check logs: Get-ScheduledTaskInfo -TaskName $ServiceName" -ForegroundColor Cyan
Write-Host ""
Write-Host "To uninstall, run:" -ForegroundColor Yellow
Write-Host "  powershell -ExecutionPolicy Bypass -File `"$InstallPath\uninstall.ps1`"" -ForegroundColor White
Write-Host ""
pause
