###############################################################################
# Pro Agent Installer for Windows
# 
# This script installs the IAC Pro Agent on Windows systems
# 
# Usage:
#   irm https://install.iac-dharma.com/windows.ps1 | iex
#   
# Or with configuration:
#   $env:CMDB_SERVER_URL="http://your-server:3001"
#   $env:CMDB_API_KEY="your-api-key"
#   irm https://install.iac-dharma.com/windows.ps1 | iex
###############################################################################

$ErrorActionPreference = "Stop"

# Configuration
$AgentName = "IAC Pro Agent"
$ServiceName = "IACProAgent"
$InstallDir = "$env:ProgramFiles\IACAgent"
$ConfigDir = "$env:ProgramData\IACAgent"
$DefaultServerUrl = "http://localhost:3001"
$DefaultInterval = "60000"

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host "   IAC Pro Agent Installer for Windows" -ForegroundColor Blue
Write-Host "   Version 2.0" -ForegroundColor Blue
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Blue
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Error: This installer must be run as Administrator" -ForegroundColor Red
    Write-Host "   Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    exit 1
}

# Detect architecture
$arch = (Get-WmiObject Win32_OperatingSystem).OSArchitecture
if ($arch -like "*64*") {
    Write-Host "✓ Detected 64-bit Windows" -ForegroundColor Green
    $AgentArch = "x64"
} else {
    Write-Host "✓ Detected 32-bit Windows" -ForegroundColor Green
    $AgentArch = "x86"
}

# Check for Node.js
Write-Host ""
Write-Host "🔍 Checking prerequisites..." -ForegroundColor Blue

$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeInstalled) {
    Write-Host "⚠️  Node.js not found. Installing..." -ForegroundColor Yellow
    
    # Check for Chocolatey
    $chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue
    
    if (-not $chocoInstalled) {
        Write-Host "⚠️  Chocolatey not found. Installing Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    
    choco install nodejs -y
    refreshenv
}

$nodeVersion = node --version
Write-Host "✓ Node.js installed: $nodeVersion" -ForegroundColor Green

# Get configuration
Write-Host ""
Write-Host "⚙️  Configuration:" -ForegroundColor Blue

if (-not $env:CMDB_SERVER_URL) {
    $ServerUrl = Read-Host "Server URL [$DefaultServerUrl]"
    if ([string]::IsNullOrWhiteSpace($ServerUrl)) {
        $ServerUrl = $DefaultServerUrl
    }
} else {
    $ServerUrl = $env:CMDB_SERVER_URL
}

if (-not $env:CMDB_API_KEY) {
    $ApiKey = Read-Host "API Key (optional)"
} else {
    $ApiKey = $env:CMDB_API_KEY
}

if (-not $env:COLLECTION_INTERVAL) {
    $CollectionInterval = $DefaultInterval
} else {
    $CollectionInterval = $env:COLLECTION_INTERVAL
}

Write-Host "✓ Server URL: $ServerUrl" -ForegroundColor Green
Write-Host "✓ Collection Interval: ${CollectionInterval}ms" -ForegroundColor Green

# Download agent
Write-Host ""
Write-Host "📥 Downloading Pro Agent..." -ForegroundColor Blue

$DownloadUrl = "https://github.com/your-org/iac/releases/latest/download/iac-pro-agent-windows-$AgentArch.zip"
$TmpDir = "$env:TEMP\iac-agent-install"
$TmpZip = "$TmpDir\agent.zip"

New-Item -ItemType Directory -Force -Path $TmpDir | Out-Null

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest -Uri $DownloadUrl -OutFile $TmpZip

Write-Host "✓ Download complete" -ForegroundColor Green

# Extract
Write-Host "📦 Extracting..." -ForegroundColor Blue
Expand-Archive -Path $TmpZip -DestinationPath $TmpDir -Force

# Create directories
Write-Host "📁 Creating directories..." -ForegroundColor Blue
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null
New-Item -ItemType Directory -Force -Path $ConfigDir | Out-Null

# Stop existing service if running
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "🛑 Stopping existing service..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force
    Start-Sleep -Seconds 2
}

# Install agent
Write-Host "📲 Installing agent..." -ForegroundColor Blue
Copy-Item -Path "$TmpDir\iac-pro-agent\*" -Destination $InstallDir -Recurse -Force

Write-Host "✓ Agent installed to $InstallDir" -ForegroundColor Green

# Create configuration file
Write-Host "⚙️  Creating configuration..." -ForegroundColor Blue

$ConfigFile = "$ConfigDir\config.json"
$ConfigContent = @{
    serverUrl = $ServerUrl
    apiKey = $ApiKey
    collectionInterval = [int]$CollectionInterval
    aiAnalytics = @{
        enabled = $true
        anomalyDetection = $true
        predictiveMaintenance = $true
        performanceOptimization = $true
    }
    security = @{
        vulnerabilityScanning = $true
        defenderIntegration = $true
        registryMonitoring = $true
        eventLogAnalysis = $true
    }
    autoRemediation = @{
        enabled = $true
        autoRestartServices = $true
        autoClearLogs = $false
        autoUpdateDrivers = $false
    }
}

$ConfigContent | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigFile

Write-Host "✓ Configuration saved to $ConfigFile" -ForegroundColor Green

# Install as Windows Service
Write-Host "🚀 Installing Windows Service..." -ForegroundColor Blue

$ServicePath = "$InstallDir\bin\pro-agent.exe"
$ServiceDescription = "IAC Pro Agent - Enterprise monitoring with AI/ML capabilities"

# Create service using sc.exe
$scArgs = @(
    "create"
    $ServiceName
    "binPath= `"$ServicePath`""
    "DisplayName= `"$AgentName`""
    "start= auto"
)

& sc.exe $scArgs | Out-Null

# Set service description
& sc.exe description $ServiceName $ServiceDescription | Out-Null

# Set recovery options (restart on failure)
& sc.exe failure $ServiceName reset= 86400 actions= restart/60000/restart/60000/restart/60000 | Out-Null

Write-Host "✓ Service installed" -ForegroundColor Green

# Set environment variables for service
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName"
$envVars = @(
    "CMDB_SERVER_URL=$ServerUrl"
    "COLLECTION_INTERVAL=$CollectionInterval"
)

if ($ApiKey) {
    $envVars += "CMDB_API_KEY=$ApiKey"
}

Set-ItemProperty -Path $regPath -Name Environment -Value $envVars

# Start service
Write-Host "▶️  Starting agent..." -ForegroundColor Blue
Start-Service -Name $ServiceName
Start-Sleep -Seconds 3

# Verify service is running
$service = Get-Service -Name $ServiceName
if ($service.Status -eq "Running") {
    Write-Host "✓ Agent started successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to start agent" -ForegroundColor Red
    Write-Host "   Check Event Viewer for details" -ForegroundColor Yellow
}

# Add firewall rule
Write-Host "🔥 Adding firewall rule..." -ForegroundColor Blue
New-NetFirewallRule -DisplayName "IAC Pro Agent" -Direction Outbound -Program $ServicePath -Action Allow -ErrorAction SilentlyContinue | Out-Null
Write-Host "✓ Firewall rule added" -ForegroundColor Green

# Cleanup
Remove-Item -Path $TmpDir -Recurse -Force

# Success message
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "✅ Installation Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Agent Status:" -ForegroundColor Blue
Write-Host "   Command: Get-Service $ServiceName"
Write-Host ""
Write-Host "🔍 View Logs:" -ForegroundColor Blue
Write-Host "   Event Viewer -> Windows Logs -> Application"
Write-Host "   Source: $ServiceName"
Write-Host ""
Write-Host "🛑 Stop Agent:" -ForegroundColor Blue
Write-Host "   Stop-Service $ServiceName"
Write-Host ""
Write-Host "▶️  Start Agent:" -ForegroundColor Blue
Write-Host "   Start-Service $ServiceName"
Write-Host ""
Write-Host "🔧 Configuration:" -ForegroundColor Blue
Write-Host "   $ConfigFile"
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Blue
Write-Host "   https://docs.iac-dharma.com/pro-agents"
Write-Host ""
