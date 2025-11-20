# Self-Extracting Installer Creator for Windows
# This script creates a self-extracting PowerShell installer

$VERSION = "1.0.0"
$OUTPUT_NAME = "cmdb-agent-installer-$VERSION.exe"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Creating Self-Extracting Installer" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Read the install.ps1 content
$installerScript = Get-Content -Path "install.ps1" -Raw

# Read the executable as base64
Write-Host "Encoding executable..." -ForegroundColor Yellow
$exeBytes = [System.IO.File]::ReadAllBytes("dist/cmdb-agent-win.exe")
$exeBase64 = [Convert]::ToBase64String($exeBytes)

# Read other files
$licenseContent = Get-Content -Path "LICENSE" -Raw
$readmeContent = Get-Content -Path "README.md" -Raw
$configExample = Get-Content -Path "config.example.json" -Raw

# Create the self-extracting script
$sfxScript = @"
# CMDB Agent Self-Extracting Installer
# Version: $VERSION
# This is a self-contained installer - no extraction needed!

`$ErrorActionPreference = 'Stop'

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "CMDB Agent Installer v$VERSION" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check for admin rights
`$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not `$isAdmin) {
    Write-Host "ERROR: This installer requires administrator privileges." -ForegroundColor Red
    Write-Host "Please right-click and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Extracting installer files..." -ForegroundColor Yellow

# Create temp directory
`$tempDir = Join-Path `$env:TEMP "cmdb-agent-install-`$(Get-Random)"
New-Item -ItemType Directory -Path `$tempDir -Force | Out-Null

try {
    # Decode and save executable
    `$exeData = @'
$exeBase64
'@
    `$exeBytes = [Convert]::FromBase64String(`$exeData)
    `$exePath = Join-Path `$tempDir "cmdb-agent-win.exe"
    [System.IO.File]::WriteAllBytes(`$exePath, `$exeBytes)
    
    # Save other files
    @'
$licenseContent
'@ | Out-File -FilePath (Join-Path `$tempDir "LICENSE") -Encoding UTF8
    
    @'
$configExample
'@ | Out-File -FilePath (Join-Path `$tempDir "config.example.json") -Encoding UTF8
    
    Write-Host "Files extracted successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Run the installer
    Write-Host "Starting installation..." -ForegroundColor Cyan
    Write-Host ""
    
    # Installer script embedded below
$installerScript
    
} catch {
    Write-Host "ERROR: Installation failed: `$_" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
} finally {
    # Cleanup
    if (Test-Path `$tempDir) {
        Remove-Item -Path `$tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
"@

# Save the script
$sfxScriptPath = "dist/installer-script.ps1"
$sfxScript | Out-File -FilePath $sfxScriptPath -Encoding UTF8
Write-Host "Created installer script: $sfxScriptPath" -ForegroundColor Green

# Create the EXE wrapper using ps2exe (if available)
if (Get-Command ps2exe -ErrorAction SilentlyContinue) {
    Write-Host "Creating EXE with ps2exe..." -ForegroundColor Yellow
    ps2exe -inputFile $sfxScriptPath -outputFile "dist/$OUTPUT_NAME" -noConsole:$false -requireAdmin
    Write-Host "Created: dist/$OUTPUT_NAME" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "NOTE: ps2exe not found. Install it with:" -ForegroundColor Yellow
    Write-Host "  Install-Module -Name ps2exe -Scope CurrentUser" -ForegroundColor White
    Write-Host ""
    Write-Host "For now, created PowerShell script: $sfxScriptPath" -ForegroundColor Yellow
    Write-Host "Users can run it with: powershell -ExecutionPolicy Bypass -File installer-script.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Installer Creation Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
