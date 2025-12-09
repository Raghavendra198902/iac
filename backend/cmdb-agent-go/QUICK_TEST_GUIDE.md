# Quick Test Guide - Windows Agent

## Local Testing (Linux with existing agent)

✅ **COMPLETED** - Cross-platform collectors tested successfully

```bash
cd /home/rrd/iac/backend/cmdb-agent-go

# Start agent
./dist/cmdb-agent-linux-amd64 --config config.local.yaml &

# Run API tests
./test-api.sh

# Stop agent
pkill -f cmdb-agent-linux
```

**Result**: All 8 cross-platform collectors work perfectly ✅

---

## Windows Testing (Requires Windows Machine)

### Quick Start

1. **Copy files to Windows**:
   - `dist/cmdb-agent-windows-amd64-enhanced.exe`
   - `config.windows-test.yaml`

2. **Run on Windows** (PowerShell as Admin):
   ```powershell
   .\cmdb-agent-windows-amd64-enhanced.exe --config config.windows-test.yaml
   ```

3. **Test API**:
   ```powershell
   # Health check
   Invoke-RestMethod -Uri http://localhost:8080/health `
     -Credential (Get-Credential)
   
   # List collectors (should show 13 on Windows)
   Invoke-RestMethod -Uri http://localhost:8080/api/collectors `
     -Credential (Get-Credential)
   
   # Test Windows Registry collector
   Invoke-RestMethod -Uri "http://localhost:8080/api/collect?collector=windows_registry" `
     -Credential (Get-Credential)
   
   # Test Windows WMI collector
   Invoke-RestMethod -Uri "http://localhost:8080/api/collect?collector=windows_wmi" `
     -Credential (Get-Credential)
   ```

4. **Expected Output**:
   - 13 collectors registered (8 cross-platform + 5 Windows)
   - Registry data collected
   - WMI classes queried
   - Performance metrics available

---

## API Endpoints (with auth)

```bash
# Linux testing
AUTH="admin:changeme"
BASE="http://localhost:8080"

curl -u $AUTH $BASE/health
curl -u $AUTH $BASE/api/dashboard
curl -u $AUTH $BASE/api/inventory/system
curl -u $AUTH $BASE/api/inventory/hardware
curl -u $AUTH $BASE/api/monitoring/metrics
```

---

## Files Summary

| File | Purpose | Status |
|------|---------|--------|
| `dist/cmdb-agent-linux-amd64` | Linux agent (8.2 MB) | ✅ Works |
| `dist/cmdb-agent-windows-amd64-enhanced.exe` | Windows agent (13 MB) | ✅ Built, needs Windows to test |
| `config.local.yaml` | Linux config | ✅ Used |
| `config.windows-test.yaml` | Windows test config | ✅ Ready |
| `test-agent-local.sh` | Linux test script | ✅ Available |
| `test-api.sh` | API test script | ✅ Available |
| `install-windows.ps1` | Windows service installer | ✅ Ready |

---

## Current Status

✅ **Agent Built**: Enhanced Windows agent (13 MB) ready  
✅ **Linux Tested**: All cross-platform collectors work  
✅ **Documentation**: Complete (3,700+ lines)  
⏭️ **Windows Testing**: Needs real Windows environment  

---

## Next Action

**Deploy to Windows Server** to test the 5 Windows-specific collectors:
- windows_registry
- windows_eventlog
- windows_performance
- windows_security
- windows_wmi

---

**Credentials**: admin / changeme (default, change in production)
