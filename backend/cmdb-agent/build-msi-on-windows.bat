@echo off
REM CMDB Agent MSI Builder for Windows
REM Run this on a Windows machine with WiX Toolset installed
REM Download WiX from: https://wixtoolset.org/

SETLOCAL EnableDelayedExpansion

echo ============================================
echo    CMDB Agent MSI Builder
echo ============================================
echo.

REM Check if WiX is installed
where candle.exe >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] WiX Toolset not found!
    echo.
    echo Please install WiX Toolset from:
    echo https://github.com/wixtoolset/wix3/releases
    echo.
    echo After installation, add to PATH:
    echo C:\Program Files ^(x86^)\WiX Toolset v3.11\bin
    pause
    exit /b 1
)

echo [1/5] WiX Toolset found
echo.

REM Set version
set VERSION=1.0.0
if not "%1"=="" set VERSION=%1

echo [2/5] Building version: %VERSION%
echo.

REM Create build directory
if not exist "dist\msi" mkdir dist\msi

REM Build the agent files
echo [3/5] Building agent source...
call npm install
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

REM Create temp directory with files to package
echo [4/5] Preparing installer files...
if exist "temp_msi" rmdir /s /q temp_msi
mkdir temp_msi
xcopy /E /I dist temp_msi\dist
copy package.json temp_msi\
copy README.md temp_msi\
copy LICENSE temp_msi\ 2>nul

REM Update version in WiX file
powershell -Command "(Get-Content installer.wxs) -replace 'Version=\"1.0.0.0\"', 'Version=\"%VERSION%.0\"' | Set-Content temp_installer.wxs"

REM Compile WiX
echo [5/5] Compiling MSI with WiX...
candle.exe temp_installer.wxs -out dist\msi\installer.wixobj

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] WiX compilation failed!
    pause
    exit /b 1
)

REM Link MSI
light.exe dist\msi\installer.wixobj -out dist\msi\CMDBAgent-%VERSION%-x64.msi -ext WixUIExtension

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MSI linking failed!
    pause
    exit /b 1
)

REM Cleanup
del temp_installer.wxs
rmdir /s /q temp_msi

REM Generate checksum
echo.
echo Generating SHA-256 checksum...
certutil -hashfile dist\msi\CMDBAgent-%VERSION%-x64.msi SHA256 > dist\msi\CMDBAgent-%VERSION%-x64.msi.sha256

echo.
echo ============================================
echo    BUILD COMPLETE!
echo ============================================
echo.
echo MSI Package: dist\msi\CMDBAgent-%VERSION%-x64.msi
echo Checksum:    dist\msi\CMDBAgent-%VERSION%-x64.msi.sha256
echo.
echo You can now:
echo 1. Test install: msiexec /i dist\msi\CMDBAgent-%VERSION%-x64.msi
echo 2. Upload to server
echo 3. Distribute to clients
echo.
pause
