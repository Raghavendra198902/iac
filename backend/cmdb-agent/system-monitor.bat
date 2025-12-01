@echo off
REM ============================================================================
REM CMDB System Monitor - Windows Batch Launcher
REM ============================================================================
REM This batch file launches the PowerShell monitoring script
REM Can be double-clicked or run from command line
REM ============================================================================

setlocal enabledelayedexpansion

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

REM Check if PowerShell script exists
if not exist "system-monitor.ps1" (
    echo ERROR: system-monitor.ps1 not found in current directory
    echo Expected location: %SCRIPT_DIR%system-monitor.ps1
    pause
    exit /b 1
)

REM Display header
echo.
echo ============================================================================
echo   CMDB SYSTEM MONITOR - Windows Edition
echo ============================================================================
echo   Starting monitoring script...
echo.

REM Run the PowerShell script with execution policy bypass
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%SCRIPT_DIR%system-monitor.ps1"

REM Check exit code
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Script execution failed with error code %ERRORLEVEL%
    echo.
    pause
    exit /b %ERRORLEVEL%
)

REM Pause to keep window open
echo.
echo ============================================================================
echo   Script completed successfully
echo ============================================================================
echo.
pause
