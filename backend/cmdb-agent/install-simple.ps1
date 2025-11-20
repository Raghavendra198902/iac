# One-line CMDB Agent installer for Windows (PowerShell)
# Usage: irm https://your-domain.com/agent/install.ps1 | iex

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CMDB Agent Installer for Windows" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Set variables
$ApiUrl = if ($env:CMDB_API_URL) { $env:CMDB_API_URL } else { "http://localhost:3000" }
$InstallDir = if ($env:CMDB_INSTALL_DIR) { $env:CMDB_INSTALL_DIR } else { "$HOME\cmdb-agent" }
$DownloadUrl = "$ApiUrl/api/downloads/cmdb-agent-windows.zip"
$TempZip = "$env:TEMP\cmdb-agent.zip"

Write-Host "Downloading CMDB Agent..." -ForegroundColor Yellow

try {
    # Create install directory
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    
    # Download zip file
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempZip -UseBasicParsing
    
    # Extract
    Expand-Archive -Path $TempZip -DestinationPath $InstallDir -Force
    
    # Move files from subdirectory if needed
    $SubDir = Get-ChildItem -Path $InstallDir -Directory | Select-Object -First 1
    if ($SubDir) {
        Get-ChildItem -Path $SubDir.FullName | Move-Item -Destination $InstallDir -Force
        Remove-Item -Path $SubDir.FullName -Force
    }
    
    # Cleanup
    Remove-Item -Path $TempZip -Force
    
    Write-Host "✓ Download complete" -ForegroundColor Green
    Write-Host ""
    
    # Check if Docker is installed
    $dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
    
    if ($dockerInstalled) {
        Write-Host "Docker detected. You can use:" -ForegroundColor Green
        Write-Host "  cd $InstallDir" -ForegroundColor White
        Write-Host "  docker-compose up -d" -ForegroundColor White
    } else {
        Write-Host "Docker not found. Installing Node.js version..." -ForegroundColor Yellow
        
        # Check Node.js
        $nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
        if (-not $nodeInstalled) {
            Write-Host "Error: Node.js is not installed" -ForegroundColor Red
            Write-Host "Please install Node.js 18+ from: https://nodejs.org" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        Set-Location $InstallDir
        npm install --production
        
        Write-Host ""
        Write-Host "✓ Installation complete!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "Configuration Required" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "Edit the .env file with your settings:" -ForegroundColor Yellow
    Write-Host "  cd $InstallDir" -ForegroundColor White
    Write-Host "  notepad .env" -ForegroundColor White
    Write-Host ""
    Write-Host "Required variables:" -ForegroundColor Yellow
    Write-Host "  - CMDB_API_URL: Your CMDB API endpoint" -ForegroundColor White
    Write-Host "  - CMDB_API_KEY: Your authentication key" -ForegroundColor White
    Write-Host "  - AGENT_ID: Unique agent identifier" -ForegroundColor White
    Write-Host ""
    Write-Host "Then start the agent:" -ForegroundColor Yellow
    Write-Host "  .\setup.ps1" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "Error during installation: $_" -ForegroundColor Red
    exit 1
}
