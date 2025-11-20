# Enable Windows Audit Policy for Citadel DLP File Access Monitoring
# Version: 1.0.0
# Requires: Administrator privileges

param(
    [switch]$EnableAll,
    [switch]$DisableAll,
    [switch]$Status
)

$ErrorActionPreference = "Stop"

function Test-AdminPrivileges {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Write-Header {
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "║      Citadel DLP - Windows Audit Policy Configuration        ║" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Get-AuditStatus {
    Write-Header
    Write-Host "Current Audit Policy Status:`n" -ForegroundColor Yellow
    
    $categories = @(
        "Object Access",
        "Logon/Logoff",
        "Account Logon",
        "System"
    )
    
    foreach ($category in $categories) {
        Write-Host "Category: $category" -ForegroundColor Cyan
        auditpol /get /category:"$category"
        Write-Host ""
    }
}

function Enable-AuditPolicy {
    Write-Header
    
    if (-not (Test-AdminPrivileges)) {
        Write-Host "❌ ERROR: Administrator privileges required!" -ForegroundColor Red
        Write-Host "Please run this script as Administrator." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "🔧 Configuring Windows Audit Policy for DLP...`n" -ForegroundColor Yellow
    
    # File System auditing (Critical for file access monitoring)
    Write-Host "Enabling File System auditing..." -ForegroundColor Cyan
    auditpol /set /subcategory:"File System" /success:enable /failure:enable
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ File System auditing enabled" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to enable File System auditing" -ForegroundColor Red
    }
    
    # Removable Storage auditing (USB monitoring)
    Write-Host "`nEnabling Removable Storage auditing..." -ForegroundColor Cyan
    auditpol /set /subcategory:"Removable Storage" /success:enable /failure:enable
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Removable Storage auditing enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Removable Storage auditing may not be available on this OS version" -ForegroundColor Yellow
    }
    
    # Handle Manipulation (Process monitoring)
    Write-Host "`nEnabling Handle Manipulation auditing..." -ForegroundColor Cyan
    auditpol /set /subcategory:"Handle Manipulation" /success:enable /failure:enable
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Handle Manipulation auditing enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Handle Manipulation auditing may not be available on this OS version" -ForegroundColor Yellow
    }
    
    # Registry auditing
    Write-Host "`nEnabling Registry auditing..." -ForegroundColor Cyan
    auditpol /set /subcategory:"Registry" /success:enable /failure:enable
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Registry auditing enabled" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to enable Registry auditing" -ForegroundColor Red
    }
    
    # Logon/Logoff events
    Write-Host "`nEnabling Logon/Logoff auditing..." -ForegroundColor Cyan
    auditpol /set /subcategory:"Logon" /success:enable /failure:enable
    auditpol /set /subcategory:"Logoff" /success:enable
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Logon/Logoff auditing enabled" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to enable Logon/Logoff auditing" -ForegroundColor Red
    }
    
    # Process Creation (for tracking data exfiltration)
    Write-Host "`nEnabling Process Creation auditing..." -ForegroundColor Cyan
    auditpol /set /subcategory:"Process Creation" /success:enable
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Process Creation auditing enabled" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to enable Process Creation auditing" -ForegroundColor Red
    }
    
    # Network Connection Events (Windows Filtering Platform)
    Write-Host "`nEnabling Windows Filtering Platform Connection auditing..." -ForegroundColor Cyan
    auditpol /set /subcategory:"Filtering Platform Connection" /success:enable /failure:enable
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Network connection auditing enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Network connection auditing may not be available" -ForegroundColor Yellow
    }
    
    Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║           ✅ Audit Policy Configuration Complete!             ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. The audit policy is now configured system-wide" -ForegroundColor White
    Write-Host "2. Event ID 4663 (File Access) will be logged to Security Event Log" -ForegroundColor White
    Write-Host "3. Restart the Citadel DLP agent to start monitoring" -ForegroundColor White
    Write-Host "4. Verify with: Get-WinEvent -LogName Security -MaxEvents 10 -FilterXPath '*[System[EventID=4663]]'" -ForegroundColor White
    
    Write-Host "`n⚠️  IMPORTANT NOTES:" -ForegroundColor Yellow
    Write-Host "• Event logs will grow faster - ensure adequate log rotation" -ForegroundColor White
    Write-Host "• Monitor Security event log size: eventvwr.msc" -ForegroundColor White
    Write-Host "• Recommended max log size: 1GB (automatic archival)" -ForegroundColor White
    Write-Host ""
}

function Disable-AuditPolicy {
    Write-Header
    
    if (-not (Test-AdminPrivileges)) {
        Write-Host "❌ ERROR: Administrator privileges required!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🔧 Disabling Windows Audit Policy for DLP...`n" -ForegroundColor Yellow
    
    auditpol /set /subcategory:"File System" /success:disable /failure:disable
    auditpol /set /subcategory:"Removable Storage" /success:disable /failure:disable
    auditpol /set /subcategory:"Handle Manipulation" /success:disable /failure:disable
    auditpol /set /subcategory:"Registry" /success:disable /failure:disable
    auditpol /set /subcategory:"Process Creation" /success:disable
    auditpol /set /subcategory:"Filtering Platform Connection" /success:disable /failure:disable
    
    Write-Host "✅ Audit policies disabled" -ForegroundColor Green
    Write-Host ""
}

# Main execution
if ($Status) {
    Get-AuditStatus
} elseif ($DisableAll) {
    Disable-AuditPolicy
} else {
    # Default: Enable
    Enable-AuditPolicy
}
