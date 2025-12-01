# Build System Monitor MSI Installer
# Requires: WiX Toolset 3.11+ installed
# Usage: .\build-system-monitor-msi.ps1 -Version "1.0.0"

param(
    [Parameter(Mandatory=$false)]
    [string]$Version = "1.0.0",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "dist\msi",
    
    [Parameter(Mandatory=$false)]
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║        BUILDING SYSTEM MONITOR MSI INSTALLER                ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check WiX Toolset installation
Write-Host "Checking WiX Toolset installation..." -ForegroundColor Yellow

$wixPath = "${env:WIX}bin"
if (-not (Test-Path $wixPath)) {
    Write-Host "❌ ERROR: WiX Toolset not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install WiX Toolset 3.11 or later from:" -ForegroundColor Yellow
    Write-Host "https://wixtoolset.org/releases/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or install via Chocolatey:" -ForegroundColor Yellow
    Write-Host "choco install wixtoolset" -ForegroundColor Yellow
    exit 1
}

$candleExe = Join-Path $wixPath "candle.exe"
$lightExe = Join-Path $wixPath "light.exe"

Write-Host "✅ WiX Toolset found: $wixPath" -ForegroundColor Green
Write-Host ""

# Create output directory
if ($Clean -and (Test-Path $OutputDir)) {
    Write-Host "Cleaning output directory..." -ForegroundColor Yellow
    Remove-Item -Path $OutputDir -Recurse -Force
}

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Host "Output directory: $OutputDir" -ForegroundColor White
Write-Host ""

# Create launch batch script
Write-Host "Creating launch script..." -ForegroundColor Yellow

$launchScript = @'
@echo off
REM CMDB System Monitor Launcher
REM This script launches the PowerShell-based system monitor

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo Starting CMDB System Monitor...
echo.

powershell.exe -ExecutionPolicy Bypass -NoExit -File "%SCRIPT_DIR%system-monitor.ps1"

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start System Monitor
    pause
)
'@

Set-Content -Path "launch-monitor.bat" -Value $launchScript -Encoding ASCII
Write-Host "✅ Launch script created" -ForegroundColor Green

# Create icon file (simple placeholder)
Write-Host "Creating icon..." -ForegroundColor Yellow

# Create a simple icon using PowerShell (base64 encoded ICO file)
$iconBase64 = @"
AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAgMDAwUFBQUHBwcHCQkJCgsLCwwMDAwNDQ0ODg4ODw8PEBAQEBEREREREREREREREREREREREREREREREREREREREREREREREBAQEBEREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREREAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==
"@

$iconBytes = [Convert]::FromBase64String($iconBase64)
[System.IO.File]::WriteAllBytes("icon.ico", $iconBytes)
Write-Host "✅ Icon created" -ForegroundColor Green

# Create License RTF
Write-Host "Creating license file..." -ForegroundColor Yellow

$licenseRtf = @'
{\rtf1\ansi\deff0 {\fonttbl {\f0 Times New Roman;}}
\f0\fs24
CMDB System Monitor License\par
\par
MIT License\par
\par
Copyright (c) 2025 CMDB Project\par
\par
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:\par
\par
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.\par
\par
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.\par
}
'@

Set-Content -Path "License.rtf" -Value $licenseRtf -Encoding ASCII
Write-Host "✅ License file created" -ForegroundColor Green
Write-Host ""

# Build MSI
Write-Host "Building MSI installer..." -ForegroundColor Yellow
Write-Host ""

$msiFileName = "CMDB-SystemMonitor-$Version-x64.msi"
$wixobjFile = Join-Path $OutputDir "system-monitor.wixobj"
$msiFile = Join-Path $OutputDir $msiFileName

# Step 1: Compile WiX source
Write-Host "Step 1: Compiling WiX source..." -ForegroundColor Cyan
$candleArgs = @(
    "system-monitor.wxs",
    "-out", $wixobjFile,
    "-ext", "WixUIExtension",
    "-dVersion=$Version"
)

& $candleExe $candleArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Compilation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Compilation successful" -ForegroundColor Green
Write-Host ""

# Step 2: Link and create MSI
Write-Host "Step 2: Creating MSI package..." -ForegroundColor Cyan
$lightArgs = @(
    $wixobjFile,
    "-out", $msiFile,
    "-ext", "WixUIExtension",
    "-cultures:en-US",
    "-sval"
)

& $lightExe $lightArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: MSI creation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ MSI package created successfully" -ForegroundColor Green
Write-Host ""

# Get file info
$msiInfo = Get-Item $msiFile
$msiSize = "{0:N2} MB" -f ($msiInfo.Length / 1MB)

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║              ✅ MSI BUILD COMPLETED! ✅                     ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 MSI Package Details:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "  Name:     $msiFileName" -ForegroundColor White
Write-Host "  Version:  $Version" -ForegroundColor White
Write-Host "  Size:     $msiSize" -ForegroundColor White
Write-Host "  Path:     $($msiInfo.FullName)" -ForegroundColor White
Write-Host ""

# Generate SHA256 checksum
Write-Host "Generating checksum..." -ForegroundColor Yellow
$hash = Get-FileHash -Path $msiFile -Algorithm SHA256
$hashFile = "$msiFile.sha256"
"$($hash.Hash)  $msiFileName" | Out-File -FilePath $hashFile -Encoding ASCII
Write-Host "✅ SHA256: $($hash.Hash)" -ForegroundColor Green
Write-Host "✅ Checksum saved to: $hashFile" -ForegroundColor Green
Write-Host ""

Write-Host "🎯 Installation Instructions:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Silent Install:" -ForegroundColor Cyan
Write-Host "  msiexec /i ""$msiFileName"" /qn" -ForegroundColor White
Write-Host ""
Write-Host "Interactive Install:" -ForegroundColor Cyan
Write-Host "  msiexec /i ""$msiFileName""" -ForegroundColor White
Write-Host ""
Write-Host "Install with Logging:" -ForegroundColor Cyan
Write-Host "  msiexec /i ""$msiFileName"" /l*v install.log" -ForegroundColor White
Write-Host ""
Write-Host "Uninstall:" -ForegroundColor Cyan
Write-Host "  msiexec /x ""$msiFileName"" /qn" -ForegroundColor White
Write-Host ""

Write-Host "📍 After Installation:" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "  • Start Menu: CMDB System Monitor > System Monitor" -ForegroundColor White
Write-Host "  • Desktop Shortcut: System Monitor" -ForegroundColor White
Write-Host "  • Install Location: C:\Program Files\CMDB System Monitor\" -ForegroundColor White
Write-Host "  • Run from CMD: system-monitor.ps1 (added to PATH)" -ForegroundColor White
Write-Host ""

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
