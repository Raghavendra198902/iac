@echo off
REM Build script for creating Windows installer

echo ====================================
echo CMDB Agent Windows Installer Builder
echo ====================================
echo.

REM Check if Inno Setup is installed
where iscc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Inno Setup Compiler not found!
    echo Please install Inno Setup from: https://jrsoftware.org/isinfo.php
    echo Make sure to add it to PATH or update this script with the full path.
    pause
    exit /b 1
)

REM Build the TypeScript code
echo Building TypeScript code...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: TypeScript build failed!
    pause
    exit /b 1
)

REM Create dist directory if it doesn't exist
if not exist "dist" mkdir dist

REM Package with pkg (creates standalone executable)
echo.
echo Creating standalone executable...
call npx pkg package.json --targets node18-win-x64 --output dist/cmdb-agent.exe
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: pkg failed to create executable!
    pause
    exit /b 1
)

REM Compile the installer with Inno Setup
echo.
echo Compiling Windows installer...
iscc installer.iss
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Inno Setup compilation failed!
    pause
    exit /b 1
)

echo.
echo ====================================
echo Build completed successfully!
echo Installer created at: dist\cmdb-agent-setup-1.0.0.exe
echo ====================================
pause
