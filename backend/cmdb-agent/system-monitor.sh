#!/bin/bash
#
# Universal System Monitor for Linux/macOS/Unix
# Displays CPU, Memory, Network, Disk usage
#

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║            📊 SYSTEM RESOURCE USAGE - REAL-TIME STATUS 📊           ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Detect OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     PLATFORM=Linux;;
    Darwin*)    PLATFORM=Mac;;
    CYGWIN*)    PLATFORM=Windows;;
    MINGW*)     PLATFORM=Windows;;
    *)          PLATFORM="Unknown:${OS}"
esac

echo "🖥️  Platform: $PLATFORM"
echo "⏰ Current Time: $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# CPU Usage
echo "🖥️  CPU USAGE:"
echo "═══════════════════════════════════════════════════════════════════════"

if [ "$PLATFORM" = "Linux" ]; then
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    cpu_model=$(lscpu | grep "Model name" | cut -d':' -f2 | xargs)
    cpu_cores=$(nproc)
    load_avg=$(uptime | awk -F'load average:' '{print $2}' | xargs)
    
    echo "  Model: $cpu_model"
    echo "  Cores: $cpu_cores"
    echo "  Usage: ${cpu_usage}%"
    echo "  Load Average: $load_avg"
    
elif [ "$PLATFORM" = "Mac" ]; then
    cpu_usage=$(ps -A -o %cpu | awk '{s+=$1} END {print s}')
    cpu_model=$(sysctl -n machdep.cpu.brand_string)
    cpu_cores=$(sysctl -n hw.ncpu)
    load_avg=$(uptime | awk -F'load average:' '{print $2}' | xargs)
    
    echo "  Model: $cpu_model"
    echo "  Cores: $cpu_cores"
    echo "  Usage: ${cpu_usage}%"
    echo "  Load Average: $load_avg"
fi
echo ""

# Memory Usage
echo "💾 MEMORY USAGE:"
echo "═══════════════════════════════════════════════════════════════════════"

if [ "$PLATFORM" = "Linux" ]; then
    free -h | awk '
    /^Mem:/ {
        printf "  Total:     %s\n", $2
        printf "  Used:      %s\n", $3
        printf "  Free:      %s\n", $4
        printf "  Available: %s\n", $7
    }
    /^Swap:/ {
        if ($2 != "0B" && $2 != "0") {
            printf "  Swap Used: %s / %s\n", $3, $2
        }
    }'
    
elif [ "$PLATFORM" = "Mac" ]; then
    mem_total=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')
    mem_stats=$(vm_stat | perl -ne '/page size of (\d+)/ and $size=$1; /Pages\s+([^:]+)[^\d]+(\d+)/ and printf("%-16s % 16.2f Mi\n", "$1:", $2 * $size / 1048576);')
    
    echo "  Total: $mem_total"
    echo "$mem_stats" | head -5
fi
echo ""

# Disk Usage
echo "💿 DISK USAGE:"
echo "═══════════════════════════════════════════════════════════════════════"

df -h | awk '
BEGIN {print "  Filesystem        Size   Used  Avail  Use%  Mounted"}
NR==1 {next}
/^\// || /^overlay/ {
    printf "  %-16s %5s %5s %5s %5s  %s\n", $1, $2, $3, $4, $5, $9
}'
echo ""

# Network Usage
echo "🌐 NETWORK USAGE:"
echo "═══════════════════════════════════════════════════════════════════════"

if [ "$PLATFORM" = "Linux" ]; then
    echo "  Interface          RX Bytes      TX Bytes      RX Packets    TX Packets"
    echo "  ────────────────────────────────────────────────────────────────────"
    
    awk '
    NR>2 {
        if ($1 != "lo:" && $2 > 0) {
            rx_bytes = $2
            tx_bytes = $10
            rx_packets = $3
            tx_packets = $11
            
            if (rx_bytes > 1073741824) rx_str = sprintf("%.2f GB", rx_bytes/1073741824)
            else if (rx_bytes > 1048576) rx_str = sprintf("%.2f MB", rx_bytes/1048576)
            else if (rx_bytes > 1024) rx_str = sprintf("%.2f KB", rx_bytes/1024)
            else rx_str = sprintf("%d B", rx_bytes)
            
            if (tx_bytes > 1073741824) tx_str = sprintf("%.2f GB", tx_bytes/1073741824)
            else if (tx_bytes > 1048576) tx_str = sprintf("%.2f MB", tx_bytes/1048576)
            else if (tx_bytes > 1024) tx_str = sprintf("%.2f KB", tx_bytes/1024)
            else tx_str = sprintf("%d B", tx_bytes)
            
            interface = substr($1, 1, length($1)-1)
            printf "  %-16s %11s   %11s   %12s  %12s\n", interface, rx_str, tx_str, rx_packets, tx_packets
        }
    }' /proc/net/dev
    
elif [ "$PLATFORM" = "Mac" ]; then
    netstat -ib | awk 'NR>1 && $1 !~ /lo0/ && $7 > 0 {
        printf "  %-16s %11s   %11s\n", $1, $7, $10
    }'
fi

echo ""

# System Uptime
echo "⏱️  SYSTEM UPTIME:"
echo "═══════════════════════════════════════════════════════════════════════"
if [ "$PLATFORM" = "Linux" ]; then
    uptime -p | sed 's/up /  /'
elif [ "$PLATFORM" = "Mac" ]; then
    uptime | awk '{print "  " $3 " " $4}' | sed 's/,//'
fi
echo ""

# Agent Status
echo "🤖 CMDB AGENT STATUS:"
echo "═══════════════════════════════════════════════════════════════════════"
if ps aux | grep -q "[a]dvanced-agent.py"; then
    agent_pid=$(ps aux | grep "[a]dvanced-agent.py" | awk '{print $2}')
    agent_cpu=$(ps aux | grep "[a]dvanced-agent.py" | awk '{print $3}')
    agent_mem=$(ps aux | grep "[a]dvanced-agent.py" | awk '{print $4}')
    echo "  Status: ✅ RUNNING"
    echo "  PID: $agent_pid"
    echo "  CPU Usage: ${agent_cpu}%"
    echo "  Memory Usage: ${agent_mem}%"
else
    echo "  Status: ⏳ NOT RUNNING (install agent)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "           📡 System Monitor for $PLATFORM"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
