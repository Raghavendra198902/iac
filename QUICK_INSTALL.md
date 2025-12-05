# 🚀 Quick Installation Scripts

One-command installation for all platforms.

## Windows

### PowerShell One-Liner
```powershell
irm https://install.iac-dharma.com/windows.ps1 | iex
```

### With Custom Configuration
```powershell
$env:CMDB_SERVER_URL="http://your-server:3001"; $env:CMDB_API_KEY="your-key"; irm https://install.iac-dharma.com/windows.ps1 | iex
```

## macOS

### Bash One-Liner
```bash
curl -fsSL https://install.iac-dharma.com/macos.sh | bash
```

### With Custom Configuration
```bash
export CMDB_SERVER_URL="http://your-server:3001" CMDB_API_KEY="your-key"; curl -fsSL https://install.iac-dharma.com/macos.sh | bash
```

## Linux

### Ubuntu/Debian
```bash
curl -fsSL https://install.iac-dharma.com/linux-deb.sh | sudo bash
```

### RHEL/CentOS
```bash
curl -fsSL https://install.iac-dharma.com/linux-rpm.sh | sudo bash
```

## Android (Termux)

### Termux One-Liner
```bash
pkg install wget && wget -O - https://install.iac-dharma.com/android.sh | bash
```

## iOS (Jailbroken)

### Cydia Source
```
Add source: https://repo.iac-dharma.com
Search: IAC Pro Agent
Install
```

---

## Manual Installation

See [PRO_CROSS_PLATFORM_GUIDE.md](./PRO_CROSS_PLATFORM_GUIDE.md) for detailed instructions.
