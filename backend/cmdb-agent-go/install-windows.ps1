# Windows Service Installer Script
# Run as Administrator

$ServiceName = "CMDBAgent"
$DisplayName = "CMDB Agent"
$Description = "Unified CMDB Agent for configuration item collection and policy enforcement"
$BinaryPath = "C:\Program Files\CMDB Agent\cmdb-agent.exe"
$ConfigPath = "C:\Program Files\CMDB Agent\config.yaml"

Write-Host "Installing CMDB Agent Windows Service..." -ForegroundColor Green

# Check if running as administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Error "This script must be run as Administrator"
    exit 1
}

# Stop service if running
if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Write-Host "Stopping existing service..."
    Stop-Service -Name $ServiceName -Force
    Start-Sleep -Seconds 2
}

# Remove service if exists
if (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue) {
    Write-Host "Removing existing service..."
    sc.exe delete $ServiceName
    Start-Sleep -Seconds 2
}

# Create service
Write-Host "Creating service..."
$params = @{
    Name = $ServiceName
    DisplayName = $DisplayName
    Description = $Description
    BinaryPathName = "$BinaryPath --config=$ConfigPath"
    StartupType = "Automatic"
}

New-Service @params

# Configure service recovery options
sc.exe failure $ServiceName reset= 86400 actions= restart/60000/restart/60000/restart/60000

# Start service
Write-Host "Starting service..."
Start-Service -Name $ServiceName

# Verify service status
$service = Get-Service -Name $ServiceName
if ($service.Status -eq "Running") {
    Write-Host "CMDB Agent service installed and started successfully!" -ForegroundColor Green
    Write-Host "Service Status: $($service.Status)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Configuration file: $ConfigPath"
    Write-Host "Edit the configuration and restart the service to apply changes."
    Write-Host ""
    Write-Host "Service commands:"
    Write-Host "  Restart: Restart-Service $ServiceName"
    Write-Host "  Stop:    Stop-Service $ServiceName"
    Write-Host "  Status:  Get-Service $ServiceName"
} else {
    Write-Error "Service installation failed. Status: $($service.Status)"
    exit 1
}
