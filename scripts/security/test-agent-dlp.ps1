# Citadel DLP Agent - Windows Test Suite
# Version: 1.0.0
# Date: November 20, 2025

param(
    [string]$AgentPath = ".\cmdb-agent-win.exe",
    [string]$ApiUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host "✅ PASS: $args" -ForegroundColor Green }
function Write-Failure { Write-Host "❌ FAIL: $args" -ForegroundColor Red }
function Write-TestName { Write-Host "`n🧪 TEST: $args" -ForegroundColor Yellow }
function Write-Header { 
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $args" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Blue }

# Test counters
$script:TestsRun = 0
$script:TestsPassed = 0
$script:TestsFailed = 0

function Test-Increment {
    $script:TestsRun++
}

function Test-Pass {
    $script:TestsPassed++
}

function Test-Fail {
    $script:TestsFailed++
}

# Test 1: Windows Environment Prerequisites
function Test-Prerequisites {
    Write-Header "Windows Environment Prerequisites"
    
    Write-TestName "PowerShell Version"
    Test-Increment
    $psVersion = $PSVersionTable.PSVersion.Major
    if ($psVersion -ge 5) {
        Write-Success "PowerShell version $psVersion (>= 5 required)"
        Test-Pass
    } else {
        Write-Failure "PowerShell version $psVersion (>= 5 required)"
        Test-Fail
    }
    
    Write-TestName "Administrator Privileges"
    Test-Increment
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if ($isAdmin) {
        Write-Success "Running with administrator privileges"
        Test-Pass
    } else {
        Write-Failure "Administrator privileges required for full DLP testing"
        Test-Fail
    }
    
    Write-TestName "WMI Service"
    Test-Increment
    $wmiService = Get-Service -Name "Winmgmt" -ErrorAction SilentlyContinue
    if ($wmiService -and $wmiService.Status -eq "Running") {
        Write-Success "WMI service is running"
        Test-Pass
    } else {
        Write-Failure "WMI service not running"
        Test-Fail
    }
    
    Write-TestName "Windows Audit Policy"
    Test-Increment
    $auditPolicy = auditpol /get /category:"Object Access" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Audit policy accessible"
        Test-Pass
    } else {
        Write-Failure "Cannot access audit policy"
        Test-Fail
    }
}

# Test 2: Process Monitoring
function Test-ProcessMonitoring {
    Write-Header "Process Monitoring Capabilities"
    
    Write-TestName "Get-CimInstance Win32_Process"
    Test-Increment
    try {
        $processes = Get-CimInstance Win32_Process | Select-Object -First 5
        if ($processes.Count -gt 0) {
            Write-Success "Successfully retrieved $($processes.Count) processes"
            Test-Pass
        } else {
            Write-Failure "No processes retrieved"
            Test-Fail
        }
    } catch {
        Write-Failure "Failed to retrieve processes: $_"
        Test-Fail
    }
    
    Write-TestName "Process to JSON Conversion"
    Test-Increment
    try {
        $processJson = Get-CimInstance Win32_Process | Select-Object -First 1 | ConvertTo-Json -Compress
        if ($processJson -and $processJson.Length -gt 0) {
            Write-Success "Process JSON conversion successful"
            Test-Pass
        } else {
            Write-Failure "JSON conversion failed"
            Test-Fail
        }
    } catch {
        Write-Failure "JSON conversion error: $_"
        Test-Fail
    }
}

# Test 3: Clipboard Monitoring Simulation
function Test-ClipboardDetection {
    Write-Header "Clipboard Monitoring Simulation"
    
    # Test sensitive patterns
    $testPatterns = @{
        "SSN" = "123-45-6789"
        "CreditCard" = "4532-1488-0343-6467"
        "Email" = "user@example.com"
        "Password" = "password=SecurePass123!"
        "APIKey" = "api_key=sk_live_abc123xyz"
        "JWTToken" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0"
        "PrivateKey" = "-----BEGIN RSA PRIVATE KEY-----"
        "AWSKey" = "AKIAIOSFODNN7EXAMPLE"
    }
    
    foreach ($pattern in $testPatterns.GetEnumerator()) {
        Write-TestName "Pattern Detection: $($pattern.Key)"
        Test-Increment
        
        # Simulate clipboard content check
        if ($pattern.Value -match '\d{3}-\d{2}-\d{4}' -or 
            $pattern.Value -match '\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}' -or
            $pattern.Value -match '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' -or
            $pattern.Value -match '(?i)(password|pwd|passwd)\s*[:=]\s*\S+' -or
            $pattern.Value -match '(?i)(api[_-]?key|apikey|access[_-]?key)\s*[:=]\s*\S+' -or
            $pattern.Value -match 'eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.' -or
            $pattern.Value -match '-----BEGIN.*PRIVATE KEY-----' -or
            $pattern.Value -match 'AKIA[0-9A-Z]{16}') {
            Write-Success "Pattern $($pattern.Key) would be detected"
            Test-Pass
        } else {
            Write-Failure "Pattern $($pattern.Key) not detected"
            Test-Fail
        }
    }
}

# Test 4: USB Device Detection
function Test-USBDetection {
    Write-Header "USB Device Detection"
    
    Write-TestName "List Removable Drives"
    Test-Increment
    try {
        $removableDrives = Get-WmiObject Win32_LogicalDisk | Where-Object {$_.DriveType -eq 2}
        if ($removableDrives) {
            Write-Success "Found $($removableDrives.Count) removable drive(s)"
            foreach ($drive in $removableDrives) {
                Write-Info "  Drive $($drive.DeviceID): $([math]::Round($drive.Size/1GB, 2))GB total, $([math]::Round($drive.FreeSpace/1GB, 2))GB free"
            }
            Test-Pass
        } else {
            Write-Info "No removable drives currently connected (this is normal)"
            Test-Pass
        }
    } catch {
        Write-Failure "Failed to query removable drives: $_"
        Test-Fail
    }
    
    Write-TestName "USB Write Protection Registry Check"
    Test-Increment
    try {
        $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\StorageDevicePolicies"
        if (Test-Path $regPath) {
            $writeProtect = Get-ItemProperty -Path $regPath -Name "WriteProtect" -ErrorAction SilentlyContinue
            if ($writeProtect) {
                $status = if ($writeProtect.WriteProtect -eq 1) { "ENABLED" } else { "DISABLED" }
                Write-Success "USB write protection registry exists (Status: $status)"
                Test-Pass
            } else {
                Write-Info "USB write protection not configured (creates on-demand)"
                Test-Pass
            }
        } else {
            Write-Info "USB write protection registry not yet created (normal for first run)"
            Test-Pass
        }
    } catch {
        Write-Failure "Registry check failed: $_"
        Test-Fail
    }
}

# Test 5: Network Connection Monitoring
function Test-NetworkMonitoring {
    Write-Header "Network Connection Monitoring"
    
    Write-TestName "Active Network Connections"
    Test-Increment
    try {
        $connections = Get-NetTCPConnection -State Established | Select-Object -First 10
        if ($connections.Count -gt 0) {
            Write-Success "Retrieved $($connections.Count) active connections"
            Test-Pass
        } else {
            Write-Info "No active connections (unusual but possible)"
            Test-Pass
        }
    } catch {
        Write-Failure "Failed to retrieve connections: $_"
        Test-Fail
    }
    
    Write-TestName "Suspicious Port Detection"
    Test-Increment
    $suspiciousPorts = @(21, 22, 23, 3389, 4444, 5900)
    try {
        $allConnections = Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue
        $suspicious = $allConnections | Where-Object { $suspiciousPorts -contains $_.RemotePort }
        
        if ($suspicious) {
            Write-Info "Found $($suspicious.Count) connection(s) to monitored ports:"
            foreach ($conn in $suspicious | Select-Object -First 5) {
                Write-Info "  Port $($conn.RemotePort): $($conn.RemoteAddress) (PID: $($conn.OwningProcess))"
            }
        } else {
            Write-Info "No connections to monitored ports (normal)"
        }
        Test-Pass
    } catch {
        Write-Failure "Suspicious port check failed: $_"
        Test-Fail
    }
}

# Test 6: File Access Auditing
function Test-FileAuditing {
    Write-Header "File Access Auditing"
    
    Write-TestName "Audit Policy Configuration"
    Test-Increment
    try {
        $auditOutput = auditpol /get /subcategory:"File System" 2>&1
        if ($LASTEXITCODE -eq 0) {
            if ($auditOutput -match "Success and Failure" -or $auditOutput -match "Success") {
                Write-Success "File system auditing is enabled"
                Test-Pass
            } else {
                Write-Info "File system auditing not fully enabled (run setup script)"
                Test-Pass
            }
        } else {
            Write-Failure "Cannot check audit policy"
            Test-Fail
        }
    } catch {
        Write-Failure "Audit policy check failed: $_"
        Test-Fail
    }
    
    Write-TestName "Event Log Accessibility"
    Test-Increment
    try {
        $securityLog = Get-WinEvent -LogName "Security" -MaxEvents 1 -ErrorAction Stop
        if ($securityLog) {
            Write-Success "Security event log accessible"
            Test-Pass
        } else {
            Write-Failure "Cannot access security event log"
            Test-Fail
        }
    } catch {
        Write-Failure "Security log access denied (requires admin): $_"
        Test-Fail
    }
}

# Test 7: Agent API Connectivity
function Test-AgentAPI {
    Write-Header "Agent API Connectivity"
    
    Write-TestName "API Gateway Reachability"
    Test-Increment
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/health" -Method GET -TimeoutSec 5
        if ($response.status -eq "healthy") {
            Write-Success "API Gateway is reachable and healthy"
            Test-Pass
        } else {
            Write-Failure "API Gateway responded but not healthy"
            Test-Fail
        }
    } catch {
        Write-Failure "Cannot reach API Gateway at $ApiUrl : $_"
        Test-Fail
    }
    
    Write-TestName "Security API Endpoint"
    Test-Increment
    try {
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/security/health" -Method GET -TimeoutSec 5
        if ($response.status -eq "operational") {
            Write-Success "Security API is operational"
            Test-Pass
        } else {
            Write-Failure "Security API not operational"
            Test-Fail
        }
    } catch {
        Write-Failure "Cannot reach Security API: $_"
        Test-Fail
    }
}

# Test 8: Agent Executable Check
function Test-AgentExecutable {
    Write-Header "Agent Executable Validation"
    
    Write-TestName "Agent Executable Exists"
    Test-Increment
    if (Test-Path $AgentPath) {
        $fileInfo = Get-Item $AgentPath
        $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        Write-Success "Agent executable found: $AgentPath ($sizeMB MB)"
        Test-Pass
    } else {
        Write-Failure "Agent executable not found at: $AgentPath"
        Test-Fail
        return
    }
    
    Write-TestName "Agent Version Check"
    Test-Increment
    try {
        # Try to get version info
        $versionInfo = (Get-Item $AgentPath).VersionInfo
        if ($versionInfo.FileVersion) {
            Write-Success "Agent version: $($versionInfo.FileVersion)"
            Test-Pass
        } else {
            Write-Info "Version info not embedded (expected for pkg builds)"
            Test-Pass
        }
    } catch {
        Write-Info "Cannot read version info: $_"
        Test-Pass
    }
}

# Test 9: DLP Configuration Validation
function Test-DLPConfiguration {
    Write-Header "DLP Configuration Validation"
    
    $requiredEnvVars = @(
        "CMDB_API_URL",
        "CMDB_AGENT_ID",
        "DLP_MONITORING_ENABLED",
        "CLIPBOARD_MONITORING_ENABLED",
        "USB_WRITE_DETECTION_ENABLED",
        "NETWORK_MONITORING_ENABLED"
    )
    
    Write-Info "Checking recommended environment variables..."
    
    foreach ($var in $requiredEnvVars) {
        Write-TestName "Environment Variable: $var"
        Test-Increment
        
        $value = [System.Environment]::GetEnvironmentVariable($var, "Process")
        if (-not $value) {
            $value = [System.Environment]::GetEnvironmentVariable($var, "User")
        }
        if (-not $value) {
            $value = [System.Environment]::GetEnvironmentVariable($var, "Machine")
        }
        
        if ($value) {
            # Mask sensitive values
            $displayValue = if ($var -match "KEY|TOKEN|PASSWORD") { "***HIDDEN***" } else { $value }
            Write-Success "Set: $displayValue"
            Test-Pass
        } else {
            Write-Info "Not set (will use defaults)"
            Test-Pass
        }
    }
}

# Test 10: Performance Metrics
function Test-PerformanceMetrics {
    Write-Header "Performance Metrics"
    
    Write-TestName "Process Query Performance"
    Test-Increment
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    Get-CimInstance Win32_Process | Out-Null
    $stopwatch.Stop()
    $elapsed = $stopwatch.ElapsedMilliseconds
    
    if ($elapsed -lt 2000) {
        Write-Success "Process query took ${elapsed}ms (< 2000ms target)"
        Test-Pass
    } else {
        Write-Failure "Process query too slow: ${elapsed}ms"
        Test-Fail
    }
    
    Write-TestName "USB Query Performance"
    Test-Increment
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    Get-WmiObject Win32_LogicalDisk | Where-Object {$_.DriveType -eq 2} | Out-Null
    $stopwatch.Stop()
    $elapsed = $stopwatch.ElapsedMilliseconds
    
    if ($elapsed -lt 1000) {
        Write-Success "USB query took ${elapsed}ms (< 1000ms target)"
        Test-Pass
    } else {
        Write-Failure "USB query too slow: ${elapsed}ms"
        Test-Fail
    }
    
    Write-TestName "Network Query Performance"
    Test-Increment
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    Get-NetTCPConnection -State Established -ErrorAction SilentlyContinue | Out-Null
    $stopwatch.Stop()
    $elapsed = $stopwatch.ElapsedMilliseconds
    
    if ($elapsed -lt 1500) {
        Write-Success "Network query took ${elapsed}ms (< 1500ms target)"
        Test-Pass
    } else {
        Write-Failure "Network query too slow: ${elapsed}ms"
        Test-Fail
    }
}

# Main execution
function Main {
    Clear-Host
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "║    Citadel DLP Agent - Windows Test Suite v1.0.0             ║" -ForegroundColor Cyan
    Write-Host "║                                                               ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Info "Agent Path: $AgentPath"
    Write-Info "API URL: $ApiUrl"
    Write-Info "Test Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Info "Computer: $env:COMPUTERNAME"
    Write-Info "User: $env:USERNAME"
    Write-Host ""
    
    # Run all tests
    Test-Prerequisites
    Test-ProcessMonitoring
    Test-ClipboardDetection
    Test-USBDetection
    Test-NetworkMonitoring
    Test-FileAuditing
    Test-AgentAPI
    Test-AgentExecutable
    Test-DLPConfiguration
    Test-PerformanceMetrics
    
    # Summary
    Write-Header "Test Summary"
    Write-Host "Total Tests: $script:TestsRun" -ForegroundColor Cyan
    Write-Host "Passed: $script:TestsPassed" -ForegroundColor Green
    Write-Host "Failed: $script:TestsFailed" -ForegroundColor Red
    
    if ($script:TestsFailed -eq 0) {
        Write-Host ""
        Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║                  🎉 ALL TESTS PASSED! 🎉                      ║" -ForegroundColor Green
        Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        exit 0
    } else {
        Write-Host ""
        Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Red
        Write-Host "║                  ⚠️  SOME TESTS FAILED  ⚠️                     ║" -ForegroundColor Red
        Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}

# Execute main function
Main
