# CMDB Agent Web UI - Quick Start Guide

## 🌐 Overview

The CMDB Agent now includes a built-in **Web UI** for monitoring, management, and enforcement. Access it at `http://localhost:8080` (configurable).

## 🚀 Starting the Web UI

### Enable in Configuration

Edit `config.dev.yaml` or `config.yaml`:

```yaml
webui:
  enabled: true
  listen_address: "127.0.0.1:8080"  # localhost only (secure)
  auth_enabled: true
  rate_limit: 60  # requests per minute
```

### Start the Agent

```bash
cd /home/rrd/iac/backend/cmdb-agent-go
./dist/cmdb-agent --config=config.dev.yaml
```

The Web UI automatically starts on `http://127.0.0.1:8080`

## 🔐 Authentication

### Default Users

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| **admin** | changeme | Admin | Full access - all operations |
| **viewer** | viewer123 | Viewer | Read-only access |

⚠️ **IMPORTANT:** Change default passwords immediately!

### User Roles

**Admin:**
- View all inventory and monitoring data
- Trigger collections
- Flush queue
- Update agent
- Manage policies
- Execute enforcement actions
- Configure agent
- Create/delete users

**Operator:**
- View inventory and monitoring
- Trigger collections
- Flush queue

**Viewer:**
- View inventory and monitoring only
- No modification permissions

## 📊 Web UI Features

### Homepage
- **URL:** `http://localhost:8080/`
- Overview of available endpoints
- No authentication required
- Shows API documentation

### Health Check
- **URL:** `http://localhost:8080/health`
- **Method:** GET
- **Auth:** None
- Returns agent status and version

```bash
curl http://localhost:8080/health
```

## 🔌 API Endpoints

### Dashboard

**Get Overview Statistics**
```bash
curl -u admin:changeme http://localhost:8080/api/dashboard
```

Returns:
- Agent version, uptime, status
- Collector statistics
- Queue depth
- Enforcement status
- Current user info

### Inventory Endpoints

**System Information**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/system
```

**Hardware Details**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/hardware
```

**Network Configuration**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/network
```

**Installed Software**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/software
```

**System Services**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/services
```

**License Audit**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/licenses
```

**Running Processes**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/processes
```

**User Accounts**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/users
```

**SSL/TLS Certificates**
```bash
curl -u admin:changeme http://localhost:8080/api/inventory/certificates
```

### Monitoring Endpoints

**Performance Metrics**
```bash
curl -u admin:changeme http://localhost:8080/api/monitoring/metrics
```

Returns CPU, memory, disk usage, network traffic.

**Process Monitoring**
```bash
curl -u admin:changeme http://localhost:8080/api/monitoring/processes
```

**Detailed Performance**
```bash
curl -u admin:changeme http://localhost:8080/api/monitoring/performance
```

Returns load average, per-core CPU, detailed memory stats.

### Collection Management

**Trigger Collector (Admin/Operator only)**
```bash
curl -u admin:changeme -X POST http://localhost:8080/api/collectors/run \
  -H "Content-Type: application/json" \
  -d '{"collector": "system", "mode": "full"}'
```

Available collectors: `system`, `hardware`, `network`, `software`, `service`, `process`, `user`, `certificate`

### Queue Management

**Get Queue Statistics**
```bash
curl -u admin:changeme http://localhost:8080/api/queue/stats
```

**Flush Queue (Admin/Operator only)**
```bash
curl -u admin:changeme -X POST http://localhost:8080/api/queue/flush
```

### Enforcement & Compliance

**List Policies**
```bash
curl -u admin:changeme http://localhost:8080/api/enforcement/policies
```

**View Violations**
```bash
curl -u admin:changeme http://localhost:8080/api/enforcement/violations
```

**Evaluate Policies (Admin only)**
```bash
curl -u admin:changeme -X POST http://localhost:8080/api/enforcement/policies/evaluate
```

**Execute Enforcement Action (Admin only)**
```bash
curl -u admin:changeme -X POST http://localhost:8080/api/enforcement/actions/execute \
  -H "Content-Type: application/json" \
  -d '{"action": "restart_service", "params": {"service": "nginx"}}'
```

### Logs

**View Agent Logs**
```bash
curl -u admin:changeme "http://localhost:8080/api/logs?level=INFO&limit=100"
```

### Configuration (Admin only)

**Get Configuration**
```bash
curl -u admin:changeme http://localhost:8080/api/config
```

**Update Configuration**
```bash
curl -u admin:changeme -X POST http://localhost:8080/api/config \
  -H "Content-Type: application/json" \
  -d '{"collectors": {...}}'
```

### User Management (Admin only)

**List Users**
```bash
curl -u admin:changeme http://localhost:8080/api/users/
```

**Create User**
```bash
curl -u admin:changeme -X POST http://localhost:8080/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "operator1", "password": "secure123", "role": "operator"}'
```

**Delete User**
```bash
curl -u admin:changeme -X DELETE http://localhost:8080/api/users/operator1
```

**Change Password**
```bash
curl -u admin:changeme -X POST http://localhost:8080/api/users/admin/password \
  -H "Content-Type: application/json" \
  -d '{"old_password": "changeme", "new_password": "NewSecurePass123!"}'
```

## 🔒 Security Best Practices

### 1. Change Default Passwords

**Change admin password immediately:**
```bash
curl -u admin:changeme -X POST http://localhost:8080/api/users/admin/password \
  -H "Content-Type: application/json" \
  -d '{"old_password": "changeme", "new_password": "YourSecurePassword123!"}'
```

### 2. Bind to Localhost Only

For production, keep `listen_address: "127.0.0.1:8080"` to prevent external access.

Access remotely via SSH tunnel:
```bash
ssh -L 8080:localhost:8080 user@remote-server
```

Then access: `http://localhost:8080` from your local machine.

### 3. Use Reverse Proxy (Production)

For external access, use nginx or Apache with HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name cmdb-agent.example.com;

    ssl_certificate /etc/ssl/certs/cmdb-agent.crt;
    ssl_certificate_key /etc/ssl/private/cmdb-agent.key;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Create Non-Admin Users

Don't share admin credentials. Create operator/viewer accounts:

```bash
# Create operator
curl -u admin:password -X POST http://localhost:8080/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "ops-team", "password": "SecureOps123!", "role": "operator"}'

# Create viewer for monitoring only
curl -u admin:password -X POST http://localhost:8080/api/users/ \
  -H "Content-Type: application/json" \
  -d '{"username": "readonly", "password": "ViewOnly123!", "role": "viewer"}'
```

### 5. Enable Rate Limiting

Already enabled by default (60 requests/minute). Adjust in config:

```yaml
webui:
  rate_limit: 30  # Reduce for tighter security
```

## 🎨 Integration Examples

### Python Script

```python
import requests
from requests.auth import HTTPBasicAuth

# API client
class CMDBAgent:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.auth = HTTPBasicAuth(username, password)
    
    def get_dashboard(self):
        r = requests.get(f"{self.base_url}/api/dashboard", auth=self.auth)
        return r.json()
    
    def trigger_scan(self, collector, mode="full"):
        data = {"collector": collector, "mode": mode}
        r = requests.post(f"{self.base_url}/api/collectors/run", 
                         json=data, auth=self.auth)
        return r.json()
    
    def get_licenses(self):
        r = requests.get(f"{self.base_url}/api/inventory/licenses", 
                        auth=self.auth)
        return r.json()

# Usage
agent = CMDBAgent("http://localhost:8080", "admin", "changeme")

# Get dashboard
dashboard = agent.get_dashboard()
print(f"Agent Status: {dashboard['agent']['status']}")

# Trigger system scan
result = agent.trigger_scan("system", "full")
print(f"Scan triggered: {result['status']}")

# Check expiring licenses
licenses = agent.get_licenses()
for lic in licenses:
    if lic['days_remaining'] < 60:
        print(f"⚠️ License expiring: {lic['software']} ({lic['days_remaining']} days)")
```

### Bash Monitoring Script

```bash
#!/bin/bash
# monitor-agent.sh - Check agent health and license expiry

API_URL="http://localhost:8080"
AUTH="admin:changeme"

# Check health
health=$(curl -s "$API_URL/health")
status=$(echo $health | jq -r '.status')

if [ "$status" = "healthy" ]; then
    echo "✅ Agent is healthy"
else
    echo "❌ Agent is down!"
    exit 1
fi

# Check expiring licenses
licenses=$(curl -s -u "$AUTH" "$API_URL/api/inventory/licenses")
expiring=$(echo $licenses | jq -r '.[] | select(.days_remaining < 60) | "\(.software): \(.days_remaining) days"')

if [ -n "$expiring" ]; then
    echo "⚠️ Licenses expiring soon:"
    echo "$expiring"
fi

# Check violations
violations=$(curl -s -u "$AUTH" "$API_URL/api/enforcement/violations")
count=$(echo $violations | jq 'length')

if [ "$count" -gt 0 ]; then
    echo "⚠️ $count policy violations detected"
    echo $violations | jq -r '.[] | "  - \(.policy_name)"'
fi
```

## 📱 Mobile Access

Web UI is responsive. Access from mobile browser:
1. SSH tunnel to agent machine
2. Connect to VPN
3. Open `http://localhost:8080` in mobile browser

## 🔧 Troubleshooting

### Web UI not accessible

**Check if enabled:**
```bash
grep -A 3 "webui:" config.dev.yaml
```

**Check if agent is running:**
```bash
ps aux | grep cmdb-agent
```

**Check port binding:**
```bash
sudo netstat -tlnp | grep 8080
```

### Authentication fails

**Verify credentials:**
Default admin: `admin` / `changeme`

**Check logs:**
```bash
tail -f /tmp/cmdb-agent.log | grep -i auth
```

### Permission denied errors

Your user role doesn't have required permissions. Contact admin to:
- Upgrade your role
- Grant specific permissions

## 🎯 Next Steps

1. **Change default passwords**
2. **Create user accounts** for your team
3. **Set up monitoring dashboard** (integrate with Grafana)
4. **Configure license alerts**
5. **Enable enforcement policies**
6. **Set up reverse proxy** for HTTPS access

## 📚 Related Documentation

- [FEATURES.md](FEATURES.md) - Complete feature list with license tracking
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [AGENTS_OVERVIEW.md](../../docs/AGENTS_OVERVIEW.md) - Agent architecture
- [CMDB_AGENT_LLD.md](../../docs/CMDB_AGENT_LLD.md) - Low-level design

## 🐛 Known Limitations

- Currently returns mock data (will be connected to real collectors)
- No WebSocket support yet (manual refresh required)
- No built-in charting (use external dashboard tools)
- Single-server only (fleet management coming soon)

## 💡 Feature Requests

Want to add:
- Real-time WebSocket updates
- Built-in charting with Chart.js
- Dark mode
- PDF report generation
- Email alerts
- Slack/Teams integration

Open an issue or submit a PR!
