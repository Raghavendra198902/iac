#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build Windows executable for System Monitor

.DESCRIPTION
    Creates a standalone Windows executable (.exe) that embeds the PowerShell
    script and can be distributed as a single file.
    
    Uses PS2EXE or iexpress to create the executable.

.PARAMETER Version
    Version number for the executable (default: 1.0.0)

.PARAMETER OutputDir
    Output directory for the executable (default: dist/exe)

.PARAMETER Method
    Build method: 'ps2exe' or 'iexpress' (default: ps2exe)

.PARAMETER Icon
    Path to icon file (.ico) for the executable

.EXAMPLE
    .\build-exe.ps1
    .\build-exe.ps1 -Version "1.0.1"
    .\build-exe.ps1 -Method iexpress

.NOTES
    Requirements:
    - PowerShell 5.1+ or PowerShell Core 7+
    - PS2EXE module (Install-Module ps2exe) OR
    - iexpress.exe (built into Windows)
#>

param(
    [string]$Version = "1.0.0",
    [string]$OutputDir = "dist/exe",
    [ValidateSet('ps2exe', 'iexpress', 'auto')]
    [string]$Method = "auto",
    [string]$Icon = ""
)

$ErrorActionPreference = "Stop"

# Banner
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║       BUILDING WINDOWS EXECUTABLE - SYSTEM MONITOR          ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if running on Windows
if ($PSVersionTable.PSVersion.Major -lt 5 -and -not $IsWindows) {
    Write-Host "ERROR: This script must run on Windows or Windows PowerShell 5.1+" -ForegroundColor Red
    exit 1
}

# Create output directory
$OutputDir = $OutputDir.TrimEnd('/', '\')
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    Write-Host "✓ Created output directory: $OutputDir" -ForegroundColor Green
}

# Resolve paths
$ScriptRoot = $PSScriptRoot
$PS1Script = Join-Path $ScriptRoot "system-monitor.ps1"
$OutputExe = Join-Path $OutputDir "SystemMonitor-$Version.exe"
$OutputExeAbsolute = (Resolve-Path -Path $OutputDir -ErrorAction SilentlyContinue).Path
if (-not $OutputExeAbsolute) {
    $OutputExeAbsolute = (Get-Item $OutputDir).FullName
}
$OutputExe = Join-Path $OutputExeAbsolute "SystemMonitor-$Version.exe"

# Check if source script exists
if (-not (Test-Path $PS1Script)) {
    Write-Host "ERROR: Source script not found: $PS1Script" -ForegroundColor Red
    exit 1
}

Write-Host "Source Script: $PS1Script" -ForegroundColor Gray
Write-Host "Output EXE:    $OutputExe" -ForegroundColor Gray
Write-Host ""

# Determine build method
$selectedMethod = $Method
if ($Method -eq "auto") {
    # Check if PS2EXE is available
    if (Get-Module -ListAvailable -Name ps2exe) {
        $selectedMethod = "ps2exe"
        Write-Host "✓ PS2EXE module found - will use PS2EXE" -ForegroundColor Green
    } elseif (Get-Command iexpress.exe -ErrorAction SilentlyContinue) {
        $selectedMethod = "iexpress"
        Write-Host "✓ iexpress.exe found - will use IExpress" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Neither PS2EXE nor iexpress found" -ForegroundColor Yellow
        Write-Host "Attempting to install PS2EXE module..." -ForegroundColor Yellow
        try {
            Install-Module -Name ps2exe -Scope CurrentUser -Force -AllowClobber
            $selectedMethod = "ps2exe"
            Write-Host "✓ PS2EXE module installed successfully" -ForegroundColor Green
        } catch {
            Write-Host "ERROR: Failed to install PS2EXE module" -ForegroundColor Red
            Write-Host "Please install manually: Install-Module ps2exe" -ForegroundColor Yellow
            exit 1
        }
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " BUILD METHOD: $($selectedMethod.ToUpper())" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Build using selected method
if ($selectedMethod -eq "ps2exe") {
    # ========================================================================
    # METHOD 1: PS2EXE (Preferred - creates native executable)
    # ========================================================================
    
    Write-Host "Building with PS2EXE..." -ForegroundColor Cyan
    
    Import-Module ps2exe -ErrorAction Stop
    
    $ps2exeParams = @{
        InputFile = $PS1Script
        OutputFile = $OutputExe
        NoConsole = $false
        NoOutput = $false
        NoError = $false
        NoVisualStyles = $false
        ExitOnCancel = $false
        Title = "CMDB System Monitor v$Version"
        Description = "System monitoring tool for CMDB infrastructure"
        Company = "CMDB Project"
        Product = "System Monitor"
        Copyright = "Copyright © 2025 CMDB Project"
        Version = $Version
        Verbose = $true
    }
    
    # Add icon if specified and exists
    if ($Icon -and (Test-Path $Icon)) {
        $ps2exeParams['IconFile'] = $Icon
        Write-Host "Using icon: $Icon" -ForegroundColor Gray
    }
    
    try {
        Invoke-ps2exe @ps2exeParams
        Write-Host "✓ Executable created successfully" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: Failed to build with PS2EXE" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    }

} elseif ($selectedMethod -eq "iexpress") {
    # ========================================================================
    # METHOD 2: IExpress (Windows built-in self-extractor)
    # ========================================================================
    
    Write-Host "Building with IExpress..." -ForegroundColor Cyan
    
    # Create temporary SED file for IExpress
    $sedFile = Join-Path $env:TEMP "system-monitor-$([guid]::NewGuid()).sed"
    $batchFile = Join-Path $ScriptRoot "system-monitor.bat"
    
    # Check if batch file exists
    if (-not (Test-Path $batchFile)) {
        Write-Host "WARNING: Batch launcher not found, creating it..." -ForegroundColor Yellow
        # Create simple batch launcher
        $batchContent = @"
@echo off
powershell.exe -ExecutionPolicy Bypass -NoProfile -File "%~dp0system-monitor.ps1"
pause
"@
        Set-Content -Path $batchFile -Value $batchContent -Encoding ASCII
    }
    
    # Create IExpress SED configuration
    $sedContent = @"
[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=0
HideExtractAnimation=0
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=%InstallPrompt%
DisplayLicense=%DisplayLicense%
FinishMessage=%FinishMessage%
TargetName=%TargetName%
FriendlyName=%FriendlyName%
AppLaunched=%AppLaunched%
PostInstallCmd=%PostInstallCmd%
AdminQuietInstCmd=%AdminQuietInstCmd%
UserQuietInstCmd=%UserQuietInstCmd%
SourceFiles=SourceFiles
[Strings]
InstallPrompt=Run CMDB System Monitor?
DisplayLicense=
FinishMessage=System Monitor will now start
TargetName=$OutputExe
FriendlyName=CMDB System Monitor v$Version
AppLaunched=cmd /c system-monitor.bat
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
FILE0="system-monitor.ps1"
FILE1="system-monitor.bat"
[SourceFiles]
SourceFiles0=$ScriptRoot
[SourceFiles0]
%FILE0%=
%FILE1%=
"@
    
    Set-Content -Path $sedFile -Value $sedContent -Encoding ASCII
    
    Write-Host "Created IExpress configuration: $sedFile" -ForegroundColor Gray
    
    # Run IExpress
    try {
        $process = Start-Process -FilePath "iexpress.exe" -ArgumentList "/N", "/Q", $sedFile -Wait -PassThru -NoNewWindow
        
        if ($process.ExitCode -eq 0 -and (Test-Path $OutputExe)) {
            Write-Host "✓ Executable created successfully" -ForegroundColor Green
        } else {
            Write-Host "ERROR: IExpress failed with exit code $($process.ExitCode)" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "ERROR: Failed to run IExpress" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        exit 1
    } finally {
        # Cleanup temp SED file
        if (Test-Path $sedFile) {
            Remove-Item $sedFile -Force
        }
    }
}

# ========================================================================
# Verify and display results
# ========================================================================

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " BUILD COMPLETE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $OutputExe) {
    $fileInfo = Get-Item $OutputExe
    $fileSizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
    
    Write-Host "✓ Executable created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  File:    $($fileInfo.Name)" -ForegroundColor White
    Write-Host "  Path:    $($fileInfo.FullName)" -ForegroundColor Gray
    Write-Host "  Size:    $fileSizeMB MB" -ForegroundColor Gray
    Write-Host "  Version: $Version" -ForegroundColor Gray
    Write-Host "  Method:  $selectedMethod" -ForegroundColor Gray
    Write-Host ""
    
    # Generate checksum
    $hash = Get-FileHash -Path $OutputExe -Algorithm SHA256
    $hashFile = "$OutputExe.sha256"
    Set-Content -Path $hashFile -Value "$($hash.Hash)  $($fileInfo.Name)"
    
    Write-Host "✓ SHA256 checksum saved: $hashFile" -ForegroundColor Green
    Write-Host "  $($hash.Hash)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " USAGE" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Double-click to run:" -ForegroundColor White
    Write-Host "    $($fileInfo.Name)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Or run from command line:" -ForegroundColor White
    Write-Host "    .\$($fileInfo.Name)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Copy to Windows machines and distribute!" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host " DISTRIBUTION" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  • Copy to network share" -ForegroundColor White
    Write-Host "  • Upload to web server" -ForegroundColor White
    Write-Host "  • Distribute via email/USB" -ForegroundColor White
    Write-Host "  • Deploy via GPO startup script" -ForegroundColor White
    Write-Host "  • Add to software distribution portal" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "ERROR: Executable was not created" -ForegroundColor Red
    exit 1
}

Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
