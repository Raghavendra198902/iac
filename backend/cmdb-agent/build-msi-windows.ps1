# CMDB Agent - Build MSI on Windows
# Prerequisites: WiX Toolset 3.11+ installed
# Download from: https://github.com/wixtoolset/wix3/releases

param(
    [string]$Version = "1.0.0"
)

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   CMDB Agent MSI Builder" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if WiX is installed
$wixPath = Get-Command candle.exe -ErrorAction SilentlyContinue
if (-not $wixPath) {
    Write-Host "❌ ERROR: WiX Toolset not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install WiX Toolset from:" -ForegroundColor Yellow
    Write-Host "https://github.com/wixtoolset/wix3/releases" -ForegroundColor White
    Write-Host ""
    Write-Host "After installation, add to PATH:" -ForegroundColor Yellow
    Write-Host 'C:\Program Files (x86)\WiX Toolset v3.11\bin' -ForegroundColor White
    exit 1
}

Write-Host "✅ [1/6] WiX Toolset found: $($wixPath.Source)" -ForegroundColor Green
Write-Host ""

Write-Host "📦 [2/6] Building version: $Version" -ForegroundColor Yellow
Write-Host ""

# Create build directory
New-Item -ItemType Directory -Path "dist\msi" -Force | Out-Null

# Build the agent
Write-Host "🔨 [3/6] Building agent source..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { exit 1 }

npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Prepare files
Write-Host "📁 [4/6] Preparing installer files..." -ForegroundColor Yellow
if (Test-Path "temp_msi") {
    Remove-Item -Path "temp_msi" -Recurse -Force
}
New-Item -ItemType Directory -Path "temp_msi" | Out-Null

# Copy files to package
Copy-Item -Path "dist" -Destination "temp_msi\dist" -Recurse
Copy-Item -Path "package.json" -Destination "temp_msi\"
Copy-Item -Path "README.md" -Destination "temp_msi\"
if (Test-Path "LICENSE") {
    Copy-Item -Path "LICENSE" -Destination "temp_msi\"
}

Write-Host "✅ Files prepared" -ForegroundColor Green
Write-Host ""

# Update version in WiX XML
Write-Host "📝 [5/6] Updating version in WiX definition..." -ForegroundColor Yellow
$wixContent = Get-Content "installer.wxs" -Raw
$wixContent = $wixContent -replace 'Version="1\.0\.0\.0"', "Version=`"$Version.0`""
$wixContent | Set-Content "temp_installer.wxs"

Write-Host "✅ Version updated" -ForegroundColor Green
Write-Host ""

# Compile with WiX
Write-Host "⚙️  [6/6] Compiling MSI with WiX..." -ForegroundColor Yellow

Write-Host "  → Running candle.exe..." -ForegroundColor Gray
& candle.exe temp_installer.wxs -out "dist\msi\installer.wixobj"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ WiX compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "  → Running light.exe..." -ForegroundColor Gray
& light.exe "dist\msi\installer.wixobj" `
    -out "dist\msi\CMDBAgent-$Version-x64.msi" `
    -ext WixUIExtension `
    -cultures:en-US

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ MSI linking failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ MSI compiled successfully" -ForegroundColor Green
Write-Host ""

# Cleanup
Remove-Item "temp_installer.wxs"
Remove-Item -Path "temp_msi" -Recurse -Force
Remove-Item "dist\msi\installer.wixobj"

# Generate checksum
Write-Host "🔐 Generating SHA-256 checksum..." -ForegroundColor Yellow
$hash = Get-FileHash "dist\msi\CMDBAgent-$Version-x64.msi" -Algorithm SHA256
$hash.Hash | Out-File "dist\msi\CMDBAgent-$Version-x64.msi.sha256" -Encoding ASCII

# Get file size
$fileSize = (Get-Item "dist\msi\CMDBAgent-$Version-x64.msi").Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)

Write-Host "✅ Checksum generated" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Green
Write-Host "   ✅ BUILD COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📦 MSI Package:" -ForegroundColor Cyan
Write-Host "   dist\msi\CMDBAgent-$Version-x64.msi" -ForegroundColor White
Write-Host "   Size: $fileSizeMB MB" -ForegroundColor Gray
Write-Host ""
Write-Host "🔐 Checksum:" -ForegroundColor Cyan
Write-Host "   dist\msi\CMDBAgent-$Version-x64.msi.sha256" -ForegroundColor White
Write-Host "   $($hash.Hash)" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test install:" -ForegroundColor Yellow
Write-Host "      msiexec /i dist\msi\CMDBAgent-$Version-x64.msi" -ForegroundColor White
Write-Host ""
Write-Host "   2. Silent install:" -ForegroundColor Yellow
Write-Host "      msiexec /i dist\msi\CMDBAgent-$Version-x64.msi /quiet" -ForegroundColor White
Write-Host ""
Write-Host "   3. Upload to server:" -ForegroundColor Yellow
Write-Host '      $file = "dist\msi\CMDBAgent-' + $Version + '-x64.msi"' -ForegroundColor White
Write-Host '      Invoke-RestMethod -Uri "http://192.168.1.9:3001/api/updates/upload" `' -ForegroundColor White
Write-Host '          -Method POST -InFile $file' -ForegroundColor White
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
