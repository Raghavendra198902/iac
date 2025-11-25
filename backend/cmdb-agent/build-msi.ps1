# PowerShell Script to Build Windows MSI Installer
# Requires WiX Toolset 3.11+

param(
    [string]$Version = "1.0.0",
    [string]$OutputDir = "dist\installers"
)

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Building CMDB Agent MSI Installer" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check for WiX Toolset
Write-Host "[1/6] Checking for WiX Toolset..." -ForegroundColor Yellow
$wixPath = "${env:ProgramFiles(x86)}\WiX Toolset v3.11\bin"
if (-not (Test-Path "$wixPath\candle.exe")) {
    Write-Host "❌ WiX Toolset not found!" -ForegroundColor Red
    Write-Host "Please install WiX Toolset from: https://wixtoolset.org/" -ForegroundColor Red
    exit 1
}
Write-Host "✅ WiX Toolset found" -ForegroundColor Green

# Build the Node.js application
Write-Host "`n[2/6] Building application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Application built successfully" -ForegroundColor Green

# Package executable
Write-Host "`n[3/6] Packaging executable..." -ForegroundColor Yellow
npm run build:exe
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Packaging failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Executable packaged" -ForegroundColor Green

# Create output directory
Write-Host "`n[4/6] Preparing output directory..." -ForegroundColor Yellow
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}
Write-Host "✅ Output directory ready: $OutputDir" -ForegroundColor Green

# Compile WiX source
Write-Host "`n[5/6] Compiling WiX source..." -ForegroundColor Yellow
$wixObj = "$OutputDir\installer.wixobj"
& "$wixPath\candle.exe" `
    -out $wixObj `
    -dVersion=$Version `
    -arch x64 `
    installer.wxs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ WiX compilation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ WiX source compiled" -ForegroundColor Green

# Link MSI
Write-Host "`n[6/6] Creating MSI package..." -ForegroundColor Yellow
$msiOutput = "$OutputDir\CMDBAgent-$Version-x64.msi"
& "$wixPath\light.exe" `
    -out $msiOutput `
    -ext WixUIExtension `
    -cultures:en-us `
    $wixObj

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ MSI creation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ MSI package created" -ForegroundColor Green

# Display results
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Build Complete!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "MSI Installer: $msiOutput" -ForegroundColor White
Write-Host "Version: $Version" -ForegroundColor White
$fileSize = (Get-Item $msiOutput).Length / 1MB
Write-Host ("Size: {0:N2} MB" -f $fileSize) -ForegroundColor White
Write-Host ""
Write-Host "Install Command:" -ForegroundColor Yellow
Write-Host "  msiexec /i `"$msiOutput`" /qn" -ForegroundColor Gray
Write-Host ""
Write-Host "Silent Install with Config:" -ForegroundColor Yellow
Write-Host "  msiexec /i `"$msiOutput`" /qn CMDB_SERVER_URL=`"http://your-server:3001`" CMDB_API_KEY=`"your-key`"" -ForegroundColor Gray
Write-Host ""
