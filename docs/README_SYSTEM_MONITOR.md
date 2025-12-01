# System Monitor - Cross-Platform Usage Guide

Monitor CPU, Memory, Network, and Disk usage across all platforms.

## 📋 Platform Support

| Platform | Script | Status |
|----------|--------|--------|
| **Linux** | `system-monitor.sh` | ✅ Ready |
| **macOS** | `system-monitor.sh` | ✅ Ready |
| **Windows** | `system-monitor.ps1` | ✅ Ready |
| **Android** | `system-monitor-android.sh` | ✅ Ready |
| **iOS** | Mobile App | ✅ Ready |

---

## 🐧 Linux / macOS Usage

### Quick Run
```bash
cd /home/rrd/iac/backend/cmdb-agent
chmod +x system-monitor.sh
./system-monitor.sh
```

### What It Shows
- ✅ CPU usage, model, cores, load average
- ✅ Memory: total, used, free, available
- ✅ Disk usage for all filesystems
- ✅ Network: RX/TX bytes and packets per interface
- ✅ Top 5 processes by CPU and memory
- ✅ System uptime
- ✅ CMDB agent status

### Auto-Run Every 60 Seconds
```bash
# Watch mode
watch -n 60 ./system-monitor.sh

# Or add to cron
crontab -e
# Add: */1 * * * * /path/to/system-monitor.sh >> /var/log/system-monitor.log
```

---

## 🪟 Windows Usage

### Quick Run (PowerShell)
```powershell
cd C:\path\to\iac\backend\cmdb-agent
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\system-monitor.ps1
```

### What It Shows
- ✅ CPU: model, cores, threads, usage, speed
- ✅ Memory: total, used, free, percentage
- ✅ Disk usage for all drives
- ✅ Network adapters: status, speed, MAC address
- ✅ Network statistics: RX/TX bytes and packets
- ✅ Active TCP connections (LISTENING ports)
- ✅ Top 5 processes by CPU and memory
- ✅ System uptime
- ✅ CMDB agent service status

### Auto-Run Every 60 Seconds
```powershell
# PowerShell loop
while ($true) {
    Clear-Host
    .\system-monitor.ps1
    Start-Sleep -Seconds 60
}

# Or create scheduled task
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\path\to\system-monitor.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 1)
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "CMDB System Monitor"
```

---

## 📱 Android Usage

### Method 1: Via ADB (from PC)
```bash
# Push script to device
adb push system-monitor-android.sh /sdcard/

# Run the script
adb shell sh /sdcard/system-monitor-android.sh

# Or for rooted devices
adb shell su -c sh /sdcard/system-monitor-android.sh
```

### Method 2: Termux App (on device)
```bash
# Install Termux from F-Droid or Play Store
# Then inside Termux:
cd ~/storage/downloads
sh system-monitor-android.sh
```

### What It Shows
- ✅ Device: manufacturer, model, Android version
- ✅ CPU: model, cores, frequency, load average
- ✅ Memory: total, free, available (from /proc/meminfo and dumpsys)
- ✅ Storage: all partitions (/data, /system, /sdcard)
- ✅ Battery: level, status, health, temperature, voltage
- ✅ Network: WiFi IP, mobile IP, RX/TX bytes per interface
- ✅ Top processes by CPU and memory
- ✅ System uptime
- ✅ CMDB agent status (if Android app installed)

### Additional Android Commands
```bash
# Detailed memory for specific app
adb shell dumpsys meminfo com.example.app

# CPU usage by process
adb shell dumpsys cpuinfo

# Battery details
adb shell dumpsys battery

# Network statistics
adb shell dumpsys netstats
```

---

## 📱 iOS Usage (React Native App)

### Run Mobile App
```bash
cd mobile
npm install
npm start

# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

### Features
- ✅ Real-time system monitoring UI
- ✅ Device information (model, OS version)
- ✅ Battery level and charging status
- ✅ Network type and IP address
- ✅ CPU usage history chart (6 data points)
- ✅ Memory usage history chart (6 data points)
- ✅ CMDB agent connection status
- ✅ Auto-refresh every 5 seconds
- ✅ Pull-to-refresh support

### Screen Navigation
```typescript
// Add to your navigation
import SystemMonitorScreen from './src/screens/SystemMonitorScreen';

// In your navigator
<Stack.Screen 
  name="SystemMonitor" 
  component={SystemMonitorScreen}
  options={{ title: 'System Monitor' }}
/>
```

---

## 📊 Data Collected (All Platforms)

### Common Metrics
| Category | Metrics |
|----------|---------|
| **CPU** | Model, Cores, Usage %, Load Average |
| **Memory** | Total, Used, Free, Available, Usage % |
| **Disk** | Size, Used, Free, Usage % per partition |
| **Network** | Interface, IP, MAC, RX/TX bytes/packets |
| **System** | Uptime, OS version, Hostname |
| **CMDB Agent** | Status, PID, CPU/Memory usage |

### Platform-Specific Metrics

**Windows Only:**
- Drive letters (C:, D:, etc.)
- Windows services
- Performance counters

**Android Only:**
- Battery temperature
- Battery voltage
- SDK version
- Build ID

**iOS Only:**
- Device model ID
- Battery state
- Carrier info

---

## 🔄 Integration with CMDB Agent

All system monitors work alongside the CMDB agent:

### Linux/macOS/Windows
The scripts detect if `advanced-agent.py` or `CMDBAgent` service is running and show:
- Agent status (RUNNING/STOPPED)
- Agent PID
- Agent CPU usage
- Agent memory usage

### Mobile (Android/iOS)
The React Native app shows:
- Connection status to CMDB backend
- Last sync time
- Data points being collected
- Agent version

---

## 🛠️ Customization

### Change Refresh Interval

**Linux/macOS:**
```bash
# Edit the watch command
watch -n 30 ./system-monitor.sh  # 30 seconds
```

**Windows:**
```powershell
# Edit sleep duration
Start-Sleep -Seconds 30  # 30 seconds
```

**Mobile App:**
```typescript
// Edit SystemMonitorScreen.tsx
const interval = setInterval(() => {
  loadSystemStats();
}, 10000);  // 10 seconds
```

### Add Custom Metrics

**Linux/macOS (system-monitor.sh):**
```bash
# Add at the end
echo "🔧 CUSTOM METRICS:"
echo "═══════════════════════════════════════════════════════════════════════"
# Your custom commands here
echo ""
```

**Windows (system-monitor.ps1):**
```powershell
# Add at the end
Write-Host "🔧 CUSTOM METRICS:" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════" -ForegroundColor Gray
# Your custom commands here
Write-Host ""
```

---

## 📈 Example Output

### Linux/macOS
```
╔══════════════════════════════════════════════════════════════════════╗
║            📊 SYSTEM RESOURCE USAGE - REAL-TIME STATUS 📊           ║
╚══════════════════════════════════════════════════════════════════════╝

🖥️  Platform: Linux
⏰ Current Time: 2025-11-26 14:30:45

🖥️  CPU USAGE:
  Model: Intel Xeon E3-1220 V2 @ 3.10GHz
  Cores: 4
  Usage: 55.3%
  Load Average: 7.22, 6.94, 6.92

💾 MEMORY USAGE:
  Total:     31.08 GB
  Used:      9.24 GB
  Free:      21.83 GB
  Available: 21.83 GB

💿 DISK USAGE:
  /dev/sda2     915G  151G  764G   18%  /

🌐 NETWORK USAGE:
  eth0            1.72 GB     42.27 GB    15234567    23456789

🤖 CMDB AGENT STATUS:
  Status: ✅ RUNNING
  PID: 436580
  CPU Usage: 0.5%
  Memory Usage: 0.8%
```

### Windows
```
╔══════════════════════════════════════════════════════════════════════╗
║            📊 SYSTEM RESOURCE USAGE - REAL-TIME STATUS 📊           ║
╚══════════════════════════════════════════════════════════════════════╝

🖥️  CPU USAGE:
  Model: Intel Core i7-9700K @ 3.60GHz
  Cores: 8 (Threads: 8)
  Usage: 45.23%
  Speed: 3600 MHz

💾 MEMORY USAGE:
  Total:     16.00 GB
  Used:      8.45 GB (52.81%)
  Free:      7.55 GB

💿 DISK USAGE:
  C:       238 GB   120 GB   118 GB   50.4%
  D:       931 GB   456 GB   475 GB   49.0%

🔌 ACTIVE NETWORK CONNECTIONS:
  TCP - 0.0.0.0:3001 - LISTENING
  TCP - 0.0.0.0:5173 - LISTENING

🤖 CMDB AGENT STATUS:
  Status: ✅ RUNNING
  Service: CMDBAgent
  PID: 12345
  Memory Usage: 25.6 MB
```

---

## 🚀 Next Steps

1. **Run on each platform** to verify data collection
2. **Integrate with CMDB dashboard** to visualize all agents
3. **Set up alerts** for high CPU/memory/disk usage
4. **Create historical reports** for capacity planning
5. **Add custom metrics** specific to your environment

---

## 📚 Related Documentation

- `ADVANCED_AGENT_V3.md` - Complete CMDB agent features
- `PATCH_STATUS_MONITORING.md` - Security patch monitoring
- `MULTIPLE_IP_MAC_FIXED.md` - Network detection details
- `BUILD_PACKAGES.md` - Building agents for all platforms

---

## 🆘 Troubleshooting

### Linux/macOS: Permission Denied
```bash
chmod +x system-monitor.sh
```

### Windows: Execution Policy Error
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Android: Permission Denied
```bash
# Use ADB root mode
adb root
adb shell sh /sdcard/system-monitor-android.sh
```

### Mobile App: Charts Not Showing
```bash
# Install dependencies
cd mobile
npm install react-native-chart-kit react-native-svg
```

---

**✅ All platforms ready for system monitoring!**
