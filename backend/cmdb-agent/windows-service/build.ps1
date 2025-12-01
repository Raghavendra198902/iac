# Build CMDB Agent Windows Service
# Run this on Windows with .NET SDK installed

param(
    [string]$Configuration = "Release",
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Building CMDB Agent Windows Service  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .NET SDK is installed
Write-Host "Checking .NET SDK..." -ForegroundColor Yellow
$dotnetVersion = dotnet --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: .NET SDK not found!" -ForegroundColor Red
    Write-Host "Please install .NET 6.0 SDK or later from: https://dotnet.microsoft.com/download" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ .NET SDK version: $dotnetVersion" -ForegroundColor Green

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "bin") {
    Remove-Item -Path "bin" -Recurse -Force
}
if (Test-Path "obj") {
    Remove-Item -Path "obj" -Recurse -Force
}

# Restore NuGet packages
Write-Host "📦 Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to restore packages" -ForegroundColor Red
    exit 1
}

# Build the service
Write-Host "🔨 Building Windows Service..." -ForegroundColor Yellow
dotnet publish -c $Configuration -r win-x64 --self-contained true -p:PublishSingleFile=true -p:Version=$Version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Create distribution directory
$distPath = "..\dist\windows-service"
Write-Host "📁 Creating distribution package..." -ForegroundColor Yellow
if (-not (Test-Path $distPath)) {
    New-Item -ItemType Directory -Path $distPath -Force | Out-Null
}

# Copy executable and config
Copy-Item "bin\$Configuration\net6.0-windows\win-x64\publish\CMDBAgentService.exe" -Destination "$distPath\" -Force
Copy-Item "config.json" -Destination "$distPath\" -Force

# Copy installation script
Copy-Item "install-service.ps1" -Destination "$distPath\" -Force
Copy-Item "uninstall-service.ps1" -Destination "$distPath\" -Force

# Get file size
$exeFile = Get-Item "$distPath\CMDBAgentService.exe"
$fileSizeMB = [math]::Round($exeFile.Length / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "         ✅ BUILD SUCCESSFUL!           " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Output:" -ForegroundColor Cyan
Write-Host "  Location: $distPath" -ForegroundColor White
Write-Host "  Executable: CMDBAgentService.exe ($fileSizeMB MB)" -ForegroundColor White
Write-Host "  Config: config.json" -ForegroundColor White
Write-Host ""
Write-Host "To install the service:" -ForegroundColor Yellow
Write-Host "  cd $distPath" -ForegroundColor White
Write-Host "  .\install-service.ps1" -ForegroundColor White
Write-Host ""
