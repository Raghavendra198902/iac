# CMDB Advanced Agent - Feature Comparison

## 📊 Basic Agent vs Advanced Agent

| Feature | Basic Agent | Advanced Agent |
|---------|-------------|----------------|
| **Core Monitoring** |
| Hostname | ✅ | ✅ |
| OS Detection | ✅ | ✅ Enhanced |
| IP Address | ✅ | ✅ |
| MAC Address | ✅ | ✅ |
| CPU Info | ✅ | ✅ + Usage % |
| Memory | ✅ Total | ✅ Total + Used + Available + % |
| **Advanced Metrics** |
| CPU Usage % | ❌ | ✅ |
| Memory Usage % | ❌ | ✅ |
| Disk Usage | ❌ | ✅ All Filesystems |
| System Uptime | ❌ | ✅ |
| Load Average | ❌ | ✅ (1m, 5m, 15m) |
| Running Processes | ❌ | ✅ |
| **Network** |
| Primary IP | ✅ | ✅ |
| Network Interfaces | ❌ | ✅ All Interfaces |
| Network Traffic Stats | ❌ | ✅ RX/TX |
| **Security & Compliance** |
| Installed Packages Count | ❌ | ✅ |
| Security Updates Available | ❌ | ✅ |
| Logged In Users | ❌ | ✅ |
| **Intelligence** |
| Metrics History | ❌ | ✅ (100 samples) |
| Trend Analysis | ❌ | ✅ (CPU/Memory/Disk) |
| Health Monitoring | ❌ | ✅ |
| **Performance** |
| Static Info Caching | ❌ | ✅ (5 min TTL) |
| Failure Recovery | Basic | ✅ Advanced |
| Reconnection Logic | ❌ | ✅ |
| **Reporting** |
| Heartbeat Logging | Basic | ✅ Detailed |
| Error Tracking | Basic | ✅ Consecutive Failures |
| Status Reporting | Basic | ✅ Comprehensive |

## 🚀 Advanced Features

### 1. Real-time Performance Monitoring
```json
{
  "cpuUsage": 15.3,
  "memoryUsage": {
    "total": "31.08 GB",
    "used": "12.45 GB",
    "available": "18.63 GB",
    "usedPercent": 40.05
  },
  "loadAverage": {
    "1min": 0.52,
    "5min": 0.48,
    "15min": 0.51
  }
}
```

### 2. Disk Monitoring
```json
{
  "diskUsage": [
    {
      "device": "/dev/sda1",
      "fstype": "ext4",
      "size": "458G",
      "used": "125G",
      "available": "310G",
      "usedPercent": "29%",
      "mountPoint": "/"
    }
  ]
}
```

### 3. Network Monitoring
```json
{
  "networkInterfaces": [
    {
      "name": "eth0",
      "state": "UP",
      "addresses": ["192.168.1.9/24"]
    }
  ],
  "networkStats": {
    "totalReceived": "1.23 GB",
    "totalTransmitted": "456.78 MB"
  }
}
```

### 4. Security & Compliance
```json
{
  "installedPackages": 1847,
  "securityUpdates": 3,
  "loggedInUsers": [
    {
      "username": "admin",
      "terminal": "pts/0",
      "loginTime": "Nov 26 06:30"
    }
  ]
}
```

### 5. Trend Analysis
```json
{
  "metricsTrends": {
    "cpu": "stable",
    "memory": "increasing",
    "disk": "stable"
  }
}
```

## 📈 Performance Improvements

1. **Smart Caching**: Static info cached for 5 minutes (reduces CPU usage)
2. **Trend Analysis**: Historical data (100 samples) for pattern detection
3. **Health Monitoring**: Tracks consecutive failures for alerting
4. **Efficient Collection**: Optimized system calls and parsing

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
export CMDB_SERVER_URL="http://192.168.1.9:3001"
export CMDB_HEARTBEAT_INTERVAL="60"
export CMDB_AGENT_ID="custom-agent-name"
```

### Running the Advanced Agent

**Replace Basic Agent:**
```bash
# Stop basic agent
pkill -f test-agent-simulator.py

# Start advanced agent
cd ~/iac/backend/cmdb-agent
./advanced-agent.py
```

**Run as Background Service:**
```bash
nohup ./advanced-agent.py > /tmp/cmdb-advanced-agent.log 2>&1 &
```

**Check Logs:**
```bash
tail -f /tmp/cmdb-advanced-agent.log
```

## 📊 Sample Output

```
======================================================================
CMDB Advanced Agent - Enterprise Edition
======================================================================

[2025-11-26 07:00:00] Advanced CMDB Agent v2.0.0 initialized
[2025-11-26 07:00:00] Agent ID: rrd
[2025-11-26 07:00:00] Server: http://192.168.1.9:3001
[2025-11-26 07:00:00] Heartbeat Interval: 60s
[2025-11-26 07:00:00] 🚀 Starting Advanced CMDB Agent
[2025-11-26 07:00:00] Press Ctrl+C to stop

[2025-11-26 07:00:02] ✅ Heartbeat sent successfully
[2025-11-26 07:00:02]    CPU: 15.3% | Memory: 40.05% | Uptime: 1d 5h 23m

[2025-11-26 07:01:02] ✅ Heartbeat sent successfully
[2025-11-26 07:01:02]    CPU: 18.7% | Memory: 40.12% | Uptime: 1d 5h 24m
```

## 🎯 Use Cases

### 1. Performance Monitoring
- Real-time CPU, memory, and disk usage
- Identify resource bottlenecks
- Trend analysis for capacity planning

### 2. Security Compliance
- Track logged-in users
- Monitor security updates
- Package inventory management

### 3. Network Monitoring
- Track all network interfaces
- Monitor network traffic
- Identify connectivity issues

### 4. Health Alerting
- Consecutive failure tracking
- Automatic reconnection attempts
- Health status reporting

## 🔄 Migration Guide

### From Basic to Advanced Agent

1. **Stop Basic Agent:**
   ```bash
   pkill -f test-agent-simulator.py
   ```

2. **Start Advanced Agent:**
   ```bash
   cd ~/iac/backend/cmdb-agent
   ./advanced-agent.py
   ```

3. **Verify in CMDB:**
   - Navigate to http://192.168.1.9:5173/cmdb
   - Refresh page
   - Check for additional metrics in agent details

### Rollback (if needed)

```bash
# Stop advanced agent
pkill -f advanced-agent.py

# Start basic agent
cd ~/iac/backend/cmdb-agent
python3 test-agent-simulator.py
```

## 💡 Best Practices

1. **Monitoring Interval**: 
   - 60s for production (default)
   - 30s for critical systems
   - 300s for low-priority systems

2. **Log Rotation**:
   ```bash
   # Use logrotate for production
   /var/log/cmdb-agent/*.log {
       daily
       rotate 7
       compress
       delaycompress
       notifempty
   }
   ```

3. **Resource Usage**:
   - Advanced agent uses ~10-20 MB RAM
   - CPU usage: <1% average
   - Network: ~2-5 KB per heartbeat

## 🛠️ Troubleshooting

### High Memory Usage
- Check `METRICS_HISTORY_SIZE` (default: 100)
- Reduce history size if needed

### Missing Metrics
- Verify Linux commands available (`df`, `ps`, `who`, `ip`)
- Check permissions for `/proc` filesystem

### Connection Issues
- Check `CMDB_SERVER_URL` environment variable
- Verify network connectivity
- Check firewall rules

## 📚 API Compatibility

The advanced agent is **fully backward compatible** with the basic agent API. All existing CMDB dashboard features work without changes.

Additional fields are automatically displayed if the frontend is updated to support them.

---

**Version**: 2.0.0  
**Compatibility**: CMDB API v1.0+  
**Platform**: Linux (Ubuntu, Debian, RHEL, CentOS)  
**Requirements**: Python 3.6+
