#!/system/bin/sh
#
# Android System Monitor
# Run with: adb shell sh /sdcard/system-monitor.sh
# Or on rooted device: su -c sh /sdcard/system-monitor.sh
#

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║            📱 ANDROID SYSTEM MONITOR - REAL-TIME STATUS 📱          ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📱 Platform: Android"
echo "⏰ Current Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Device Info
echo "📱 DEVICE INFORMATION:"
echo "═══════════════════════════════════════════════════════════════════════"
echo "  Manufacturer: $(getprop ro.product.manufacturer)"
echo "  Model: $(getprop ro.product.model)"
echo "  Device: $(getprop ro.product.device)"
echo "  Android Version: $(getprop ro.build.version.release)"
echo "  SDK Version: $(getprop ro.build.version.sdk)"
echo "  Build ID: $(getprop ro.build.id)"
echo ""

# CPU Information
echo "🖥️  CPU USAGE:"
echo "═══════════════════════════════════════════════════════════════════════"

if [ -f /proc/cpuinfo ]; then
    cpu_cores=$(grep -c processor /proc/cpuinfo)
    cpu_model=$(grep "Hardware" /proc/cpuinfo | head -1 | cut -d':' -f2 | xargs)
    echo "  CPU Model: $cpu_model"
    echo "  CPU Cores: $cpu_cores"
fi

if [ -f /proc/stat ]; then
    # Read CPU stats
    cpu_line=$(grep "^cpu " /proc/stat)
    echo "  CPU Stats: $cpu_line"
fi

# CPU Frequency
if [ -d /sys/devices/system/cpu/cpu0/cpufreq ]; then
    cur_freq=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq 2>/dev/null)
    max_freq=$(cat /sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq 2>/dev/null)
    if [ ! -z "$cur_freq" ] && [ ! -z "$max_freq" ]; then
        cur_mhz=$((cur_freq / 1000))
        max_mhz=$((max_freq / 1000))
        echo "  Current Frequency: ${cur_mhz} MHz (Max: ${max_mhz} MHz)"
    fi
fi

# Load Average
if [ -f /proc/loadavg ]; then
    load=$(cat /proc/loadavg)
    echo "  Load Average: $load"
fi
echo ""

# Memory Information
echo "💾 MEMORY USAGE:"
echo "═══════════════════════════════════════════════════════════════════════"

if [ -f /proc/meminfo ]; then
    mem_total=$(grep MemTotal /proc/meminfo | awk '{printf "%.2f GB", $2/1024/1024}')
    mem_free=$(grep MemFree /proc/meminfo | awk '{printf "%.2f GB", $2/1024/1024}')
    mem_available=$(grep MemAvailable /proc/meminfo | awk '{printf "%.2f GB", $2/1024/1024}')
    
    echo "  Total Memory: $mem_total"
    echo "  Free Memory: $mem_free"
    echo "  Available Memory: $mem_available"
fi

# Using dumpsys for more detailed memory info
echo ""
echo "  Detailed Memory (from dumpsys):"
dumpsys meminfo | grep -E "Total RAM:|Free RAM:|Used RAM:|Lost RAM:" | sed 's/^/  /'
echo ""

# Storage Information
echo "💿 STORAGE USAGE:"
echo "═══════════════════════════════════════════════════════════════════════"

df -h | awk 'NR==1 || /^\/dev\/block/ || /^\/data/ || /^\/system/ || /^\/sdcard/' | while read line; do
    echo "  $line"
done
echo ""

# Battery Information
echo "🔋 BATTERY STATUS:"
echo "═══════════════════════════════════════════════════════════════════════"

dumpsys battery | grep -E "level:|status:|health:|temperature:|voltage:" | sed 's/^/  /'
echo ""

# Network Information
echo "🌐 NETWORK STATUS:"
echo "═══════════════════════════════════════════════════════════════════════"

# IP Address
ip_addr=$(ip addr show wlan0 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d'/' -f1)
if [ ! -z "$ip_addr" ]; then
    echo "  WiFi IP: $ip_addr"
fi

# Mobile data IP
mobile_ip=$(ip addr show rmnet0 2>/dev/null | grep "inet " | awk '{print $2}' | cut -d'/' -f1)
if [ ! -z "$mobile_ip" ]; then
    echo "  Mobile IP: $mobile_ip"
fi

# Network statistics
if [ -f /proc/net/dev ]; then
    echo ""
    echo "  Network Statistics:"
    echo "  Interface          RX Bytes      TX Bytes"
    echo "  ────────────────────────────────────────────"
    
    awk 'NR>2 && ($2 > 0 || $10 > 0) {
        interface = substr($1, 1, length($1)-1)
        rx_bytes = $2
        tx_bytes = $10
        
        if (rx_bytes > 1073741824) rx_str = sprintf("%.2f GB", rx_bytes/1073741824)
        else if (rx_bytes > 1048576) rx_str = sprintf("%.2f MB", rx_bytes/1048576)
        else if (rx_bytes > 1024) rx_str = sprintf("%.2f KB", rx_bytes/1024)
        else rx_str = sprintf("%d B", rx_bytes)
        
        if (tx_bytes > 1073741824) tx_str = sprintf("%.2f GB", tx_bytes/1073741824)
        else if (tx_bytes > 1048576) tx_str = sprintf("%.2f MB", tx_bytes/1048576)
        else if (tx_bytes > 1024) tx_str = sprintf("%.2f KB", tx_bytes/1024)
        else tx_str = sprintf("%d B", tx_bytes)
        
        printf "  %-16s %11s   %11s\n", interface, rx_str, tx_str
    }' /proc/net/dev
fi
echo ""

# Top Processes by CPU/Memory
echo "🔥 TOP PROCESSES:"
echo "═══════════════════════════════════════════════════════════════════════"

# Using ps command (Android style)
ps -A -o PID,PPID,%CPU,%MEM,CMD | head -15 | while read line; do
    echo "  $line"
done
echo ""

# System Uptime
echo "⏱️  SYSTEM UPTIME:"
echo "═══════════════════════════════════════════════════════════════════════"
uptime | sed 's/^/  /'
echo ""

# CMDB Agent Status (if installed)
echo "🤖 CMDB AGENT STATUS:"
echo "═══════════════════════════════════════════════════════════════════════"

agent_running=$(ps -A | grep -i cmdb | grep -v grep)
if [ ! -z "$agent_running" ]; then
    echo "  Status: ✅ RUNNING"
    echo "$agent_running" | sed 's/^/  /'
else
    echo "  Status: ⏳ NOT INSTALLED"
    echo "  Install Android agent APK from CMDB server"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "           📱 Android System Monitor"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Additional Android-specific commands
echo "💡 TIP: For more details, use:"
echo "   • dumpsys meminfo <package>  - Detailed memory for an app"
echo "   • dumpsys cpuinfo            - CPU usage by process"
echo "   • dumpsys battery            - Battery details"
echo "   • dumpsys netstats           - Network statistics"
echo ""
