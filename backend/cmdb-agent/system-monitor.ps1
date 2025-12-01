# Universal System Monitor for Windows
# Displays CPU, Memory, Network, Disk usage

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                                      ║" -ForegroundColor Cyan
Write-Host "║            📊 SYSTEM RESOURCE USAGE - REAL-TIME STATUS 📊           ║" -ForegroundColor Cyan
Write-Host "║                                                                      ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "🖥️  Platform: Windows" -ForegroundColor Yellow
Write-Host "⏰ Current Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# CPU Usage
Write-Host "🖥️  CPU USAGE:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$cpu = Get-CimInstance Win32_Processor
$cpuUsage = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
$cpuCores = $cpu.NumberOfCores
$cpuThreads = $cpu.NumberOfLogicalProcessors

Write-Host "  Model: $($cpu.Name)" -ForegroundColor White
Write-Host "  Cores: $cpuCores (Threads: $cpuThreads)" -ForegroundColor White
Write-Host "  Usage: $([math]::Round($cpuUsage, 2))%" -ForegroundColor White
Write-Host "  Speed: $($cpu.MaxClockSpeed) MHz" -ForegroundColor White
Write-Host ""

# Memory Usage
Write-Host "💾 MEMORY USAGE:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$os = Get-CimInstance Win32_OperatingSystem
$totalMemory = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeMemory = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$usedMemory = $totalMemory - $freeMemory
$memoryUsage = [math]::Round(($usedMemory / $totalMemory) * 100, 2)

Write-Host "  Total:     $totalMemory GB" -ForegroundColor White
Write-Host "  Used:      $usedMemory GB ($memoryUsage%)" -ForegroundColor White
Write-Host "  Free:      $freeMemory GB" -ForegroundColor White
Write-Host "  Available: $freeMemory GB" -ForegroundColor White
Write-Host ""

# Disk Usage
Write-Host "💿 DISK USAGE:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$disks = Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3"
Write-Host "  Drive    Size      Used      Free      Use%" -ForegroundColor Gray
Write-Host "  ────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($disk in $disks) {
    $size = [math]::Round($disk.Size / 1GB, 2)
    $free = [math]::Round($disk.FreeSpace / 1GB, 2)
    $used = $size - $free
    $usage = [math]::Round(($used / $size) * 100, 1)
    
    Write-Host ("  {0,-8} {1,6} GB {2,6} GB {3,6} GB {4,5}%" -f $disk.DeviceID, $size, $used, $free, $usage) -ForegroundColor White
}
Write-Host ""

# Network Usage
Write-Host "🌐 NETWORK USAGE:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$adapters = Get-NetAdapter | Where-Object {$_.Status -eq "Up"}
Write-Host "  Interface                 Status    Speed       MAC Address" -ForegroundColor Gray
Write-Host "  ────────────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($adapter in $adapters) {
    $speed = if ($adapter.LinkSpeed) { $adapter.LinkSpeed } else { "N/A" }
    Write-Host ("  {0,-24} {1,-9} {2,-11} {3}" -f $adapter.Name, $adapter.Status, $speed, $adapter.MacAddress) -ForegroundColor White
}
Write-Host ""

# Network Statistics
Write-Host "📊 NETWORK STATISTICS:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$netStats = Get-NetAdapterStatistics | Where-Object {$_.ReceivedBytes -gt 0 -or $_.SentBytes -gt 0}
Write-Host "  Interface          RX Bytes      TX Bytes      RX Packets    TX Packets" -ForegroundColor Gray
Write-Host "  ────────────────────────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($stat in $netStats) {
    $rxGB = [math]::Round($stat.ReceivedBytes / 1GB, 2)
    $txGB = [math]::Round($stat.SentBytes / 1GB, 2)
    
    Write-Host ("  {0,-16} {1,8} GB   {2,8} GB   {3,12}  {4,12}" -f `
        $stat.Name.Substring(0, [Math]::Min(16, $stat.Name.Length)), `
        $rxGB, $txGB, $stat.ReceivedUnicastPackets, $stat.SentUnicastPackets) -ForegroundColor White
}
Write-Host ""

# Active Connections
Write-Host "🔌 ACTIVE NETWORK CONNECTIONS:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$connections = Get-NetTCPConnection -State Listen | Select-Object -First 10 LocalAddress, LocalPort | Sort-Object LocalPort
foreach ($conn in $connections) {
    Write-Host "  TCP - $($conn.LocalAddress):$($conn.LocalPort) - LISTENING" -ForegroundColor White
}
Write-Host ""

# Top Processes by CPU
Write-Host "🔥 TOP 5 PROCESSES BY CPU:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$topCPU = Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
foreach ($proc in $topCPU) {
    $cpu = [math]::Round($proc.CPU, 2)
    Write-Host ("  {0,8} CPU  {1,6}  {2}" -f $cpu, $proc.Id, $proc.Name) -ForegroundColor White
}
Write-Host ""

# Top Processes by Memory
Write-Host "🧠 TOP 5 PROCESSES BY MEMORY:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$topMem = Get-Process | Sort-Object WorkingSet -Descending | Select-Object -First 5
foreach ($proc in $topMem) {
    $mem = [math]::Round($proc.WorkingSet / 1MB, 2)
    Write-Host ("  {0,8} MB  {1,6}  {2}" -f $mem, $proc.Id, $proc.Name) -ForegroundColor White
}
Write-Host ""

# System Uptime
Write-Host "⏱️  SYSTEM UPTIME:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
$days = $uptime.Days
$hours = $uptime.Hours
$minutes = $uptime.Minutes

Write-Host "  $days days, $hours hours, $minutes minutes" -ForegroundColor White
Write-Host ""

# CMDB Agent Status
Write-Host "🤖 CMDB AGENT STATUS:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray

$service = Get-Service -Name "CMDBAgent" -ErrorAction SilentlyContinue
if ($service) {
    $status = if ($service.Status -eq "Running") { "✅ RUNNING" } else { "❌ STOPPED" }
    Write-Host "  Status: $status" -ForegroundColor White
    Write-Host "  Service: $($service.Name)" -ForegroundColor White
    Write-Host "  Display Name: $($service.DisplayName)" -ForegroundColor White
    
    if ($service.Status -eq "Running") {
        $process = Get-Process | Where-Object {$_.Name -like "*CMDB*"} | Select-Object -First 1
        if ($process) {
            $cpu = [math]::Round($process.CPU, 2)
            $mem = [math]::Round($process.WorkingSet / 1MB, 2)
            Write-Host "  PID: $($process.Id)" -ForegroundColor White
            Write-Host "  CPU Usage: $cpu seconds" -ForegroundColor White
            Write-Host "  Memory Usage: $mem MB" -ForegroundColor White
        }
    }
} else {
    Write-Host "  Status: ⏳ NOT INSTALLED" -ForegroundColor Yellow
    Write-Host "  Install agent from: http://192.168.1.9:5173/downloads" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host "           📡 System Monitor for Windows" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
