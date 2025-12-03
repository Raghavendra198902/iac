# CMDB Agent - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Download the Agent

Visit: **http://192.168.1.9:5173/agents/downloads**

Choose your platform:
- **Windows** - Download ZIP (6 MB)
- **Linux** - Download tar.gz for AMD64 (5.9 MB) or ARM64 (5.3 MB)
- **macOS** - Download tar.gz for Intel (5.9 MB) or Apple Silicon (5.5 MB)

### Step 2: Install

#### Windows
```powershell
# Extract the ZIP file
Expand-Archive cmdb-agent-windows-1.0.0.zip -DestinationPath C:\cmdb-agent

# Open PowerShell as Administrator
cd C:\cmdb-agent\cmdb-agent-windows-1.0.0

# Run the installer
.\Install.ps1

# The service will start automatically
```

#### Linux
```bash
# Extract the archive
tar xzf cmdb-agent-linux-amd64-1.0.0.tar.gz
cd cmdb-agent-linux-amd64-1.0.0

# Run the installer (requires sudo)
sudo ./install.sh

# The service starts automatically
```

#### macOS
```bash
# Extract the archive
tar xzf cmdb-agent-macos-arm64-1.0.0.tar.gz
cd cmdb-agent-macos-arm64-1.0.0

# Run the installer (requires sudo)
sudo ./install.sh

# The service starts automatically
```

### Step 3: Access the Web UI

Open your browser and go to:
```
http://localhost:8080
```

**Default Login:**
- Username: `admin`
- Password: `changeme`

⚠️ **Important:** Change the password immediately after first login!

### Step 4: Verify Installation

#### Check Service Status

**Windows:**
```powershell
Get-Service CMDBAgent
```

**Linux:**
```bash
systemctl status cmdb-agent
```

**macOS:**
```bash
sudo launchctl list | grep cmdb
```

#### Use CLI Tools

```bash
# Check agent status
cmdb-agent-cli status

# View inventory
cmdb-agent-cli inventory list

# Test connection to CMDB server
cmdb-agent-cli test connection
```

---

## 📋 What's Collected?

The agent automatically collects:

✅ **Hardware Information**
- CPU details (model, cores, speed)
- Memory (total, available, used)
- Disk drives (capacity, usage)
- Network interfaces (MAC, IP addresses)

✅ **Operating System**
- OS name and version
- Kernel version
- Hostname
- Uptime

✅ **Network Configuration**
- IP addresses (IPv4/IPv6)
- DNS servers
- Gateway information
- Active connections

---

## ⚙️ Configuration

The configuration file is located at:
- **Windows:** `C:\Program Files\CMDB Agent\config.yaml`
- **Linux:** `/etc/cmdb-agent/config.yaml`
- **macOS:** `/usr/local/etc/cmdb-agent/config.yaml`

### Basic Configuration

```yaml
# CMDB Server
server:
  endpoint: "https://cmdb.example.com/api"
  auth_token: "your-auth-token-here"

# Collection Schedule
collectors:
  interval: 300s  # 5 minutes
  
# Web UI
webui:
  enabled: true
  port: 8080
  username: "admin"
  password: "changeme"  # Change this!

# Logging
logging:
  level: "info"  # debug, info, warn, error
```

### After Editing Config

**Windows:**
```powershell
Restart-Service CMDBAgent
```

**Linux:**
```bash
sudo systemctl restart cmdb-agent
```

**macOS:**
```bash
sudo launchctl stop com.cmdb.agent
sudo launchctl start com.cmdb.agent
```

---

## 🔧 Common Tasks

### Change Web UI Port

Edit config.yaml:
```yaml
webui:
  port: 9090  # Change from 8080 to 9090
```

Then restart the service.

### Change Collection Interval

Edit config.yaml:
```yaml
collectors:
  interval: 600s  # Collect every 10 minutes
```

### Enable Debug Logging

Edit config.yaml:
```yaml
logging:
  level: "debug"
```

View logs:
- **Windows:** Event Viewer or `C:\ProgramData\CMDB Agent\logs\agent.log`
- **Linux:** `sudo journalctl -u cmdb-agent -f`
- **macOS:** `/usr/local/var/log/cmdb-agent/agent.log`

---

## 🗑️ Uninstallation

### Windows
```powershell
# Navigate to installation directory
cd C:\cmdb-agent\cmdb-agent-windows-1.0.0

# Run uninstaller as Administrator
.\Uninstall.ps1
```

### Linux
```bash
# Navigate to installation directory or use original extracted folder
cd cmdb-agent-linux-amd64-1.0.0

# Run uninstaller
sudo ./uninstall.sh
```

### macOS
```bash
# Navigate to installation directory
cd cmdb-agent-macos-arm64-1.0.0

# Run uninstaller
sudo ./uninstall.sh
```

**Note:** Uninstall scripts preserve configuration and data by default. To completely remove all files:

```bash
# Linux
sudo rm -rf /etc/cmdb-agent /var/lib/cmdb-agent /var/log/cmdb-agent

# macOS
sudo rm -rf /usr/local/etc/cmdb-agent /usr/local/var/cmdb-agent /usr/local/var/log/cmdb-agent
```

---

## 🆘 Troubleshooting

### Port 8080 Already in Use

**Solution:** Change the port in `config.yaml`:
```yaml
webui:
  port: 8081  # Use a different port
```

### Service Won't Start

**Check logs:**
- Windows: Event Viewer → Application → CMDB Agent
- Linux: `sudo journalctl -u cmdb-agent -n 50`
- macOS: `tail -f /usr/local/var/log/cmdb-agent/agent.log`

**Common causes:**
- Port already in use
- Invalid configuration syntax
- Missing permissions
- Firewall blocking

### Can't Access Web UI

1. Check if service is running
2. Verify port in config.yaml
3. Check firewall rules
4. Try `http://127.0.0.1:8080` instead of `localhost`

### Permission Errors

**Linux/macOS:**
- Ensure you used `sudo` for installation
- Check file ownership: `ls -la /usr/local/bin/cmdb-agent`

**Windows:**
- Run PowerShell as Administrator
- Check service account permissions

---

## 📚 More Information

### Documentation
- [FEATURES.md](FEATURES.md) - Complete feature list
- [WEBUI_GUIDE.md](WEBUI_GUIDE.md) - Web UI documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Developer guide
- [ROADMAP.md](ROADMAP.md) - Future plans

### Support
- **GitHub:** https://github.com/Raghavendra198902/iac
- **Issues:** https://github.com/Raghavendra198902/iac/issues
- **Discussions:** https://github.com/Raghavendra198902/iac/discussions

### Building from Source
See [DEVELOPMENT.md](DEVELOPMENT.md) for build instructions.

### Windows MSI Installer
Want a professional MSI installer? See the `msi-builder` folder in the Windows ZIP package and [BUILD_MSI_GUIDE.md](BUILD_MSI_GUIDE.md).

---

## ✅ What's Next?

After installation:

1. ✅ Access Web UI at http://localhost:8080
2. ✅ Change default password
3. ✅ Review collected inventory
4. ✅ Configure CMDB server endpoint
5. ✅ Customize collection intervals
6. ✅ Set up monitoring and alerts

---

## 🎉 Success!

Your CMDB Agent is now running and collecting system information. Check the Web UI dashboard to see real-time inventory data.

**Need help?** Open an issue on GitHub or check the documentation.

---

**Version:** 1.0.0  
**Last Updated:** December 3, 2024
