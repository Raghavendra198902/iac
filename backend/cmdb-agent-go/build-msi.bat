@echo off
setlocal

REM =====================================================
REM CMDB Agent MSI Builder for Windows
REM =====================================================

set VERSION=1.0.0
set ARCH=x64
set OUTPUT=cmdb-agent-%VERSION%-%ARCH%.msi
set WIX_BIN=C:\Program Files (x86)\WiX Toolset v3.11\bin

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   CMDB Agent MSI Builder v%VERSION%              ║
echo ╚═══════════════════════════════════════════════════╝
echo.

REM Check if WiX is installed
if not exist "%WIX_BIN%\candle.exe" (
    echo ✗ WiX Toolset not found!
    echo.
    echo Please install WiX Toolset:
    echo   choco install wixtoolset
    echo   or download from: https://wixtoolset.org/
    echo.
    pause
    exit /b 1
)

REM Check if binaries exist
if not exist "dist\cmdb-agent-windows-amd64.exe" (
    echo ✗ Windows binaries not found!
    echo.
    echo Please build the binaries first:
    echo   make build-windows
    echo.
    pause
    exit /b 1
)

echo [1/3] Compiling WiX source...
"%WIX_BIN%\candle.exe" -arch %ARCH% cmdb-agent.wxs
if errorlevel 1 (
    echo.
    echo ✗ Compilation failed!
    pause
    exit /b 1
)

echo [2/3] Linking MSI package...
"%WIX_BIN%\light.exe" -ext WixUIExtension -ext WixUtilExtension -out %OUTPUT% cmdb-agent.wixobj -sval
if errorlevel 1 (
    echo.
    echo ✗ Linking failed!
    pause
    exit /b 1
)

echo [3/3] Cleaning up...
del cmdb-agent.wixobj 2>nul
del cmdb-agent.wixpdb 2>nul

echo.
echo ╔═══════════════════════════════════════════════════╗
echo ║   ✓ MSI package created successfully!            ║
echo ╚═══════════════════════════════════════════════════╝
echo.
echo   File: %OUTPUT%
dir %OUTPUT% | find "%OUTPUT%"
echo.

REM Calculate SHA256
echo Calculating checksum...
certutil -hashfile %OUTPUT% SHA256 > %OUTPUT%.sha256
type %OUTPUT%.sha256 | find /V "CertUtil"
echo.

echo Installation commands:
echo   GUI:    msiexec /i %OUTPUT%
echo   Silent: msiexec /i %OUTPUT% /qn /l*v install.log
echo.

pause
endlocal
