# CMDB Agent (Go)

Unified, lightweight, cross-platform endpoint agent for CMDB inventory collection, telemetry, monitoring, enforcement, and deployment.

## Features

- **Inventory & CI Collection** – Hardware, software, network, services, users, certificates
- **Telemetry** – Real-time metrics, heartbeats, health status
- **Monitoring & Enforcement** – Configuration drift detection, policy violations, security posture
- **Deployment & Patching** – Automated software/patch deployment with rollback
- **Policy Evaluation** – Dynamic rule evaluation and adaptive enforcement
- **Self-Update & Health** – Automatic updates, health checks, and resilience

## Supported Platforms

- Linux (Ubuntu, Debian, RHEL, CentOS, Rocky, AlmaLinux, Fedora, SUSE)
- Windows (7, 8, 10, 11, Server 2012–2025)
- macOS (10.15+ Catalina → latest)
- BSD (FreeBSD, OpenBSD, NetBSD)

## Architecture

```
cmdb-agent (main daemon)
├── Collectors (system, hardware, software, network, services, users, certs)
├── Queue (BoltDB for local persistence)
├── Transport (HTTPS with mTLS)
├── Enforcement Engine (policy evaluation & actions)
├── Deployment Manager (software/patch deployment)
└── API Server (UNIX socket for local control)
```

## Quick Start

### Build from source

```bash
# Install Go 1.21+
# Clone repository
git clone https://github.com/iac/cmdb-agent.git
cd backend/cmdb-agent-go

# Build
./build.sh 1.0.0

# Binaries will be in dist/
```

### Install on Linux

```bash
# DEB-based (Ubuntu, Debian)
sudo dpkg -i cmdb-agent-1.0.0-amd64.deb

# RPM-based (RHEL, CentOS, Rocky)
sudo rpm -i cmdb-agent-1.0.0-1.x86_64.rpm

# Edit configuration
sudo vim /etc/cmdb-agent/config.yaml

# Restart agent
sudo systemctl restart cmdb-agent
```

### Configuration

Edit `/etc/cmdb-agent/config.yaml`:

```yaml
server:
  primary: https://cmdb.example.com:8443
  ca_bundle: /etc/cmdb-agent/ca.pem

agent:
  collectors:
    - name: system
      schedule: "@hourly"
      enabled: true

auth:
  method: mTLS
  cert_file: /etc/cmdb-agent/agent.crt
  key_file: /etc/cmdb-agent/agent.key
```

See `config.example.yaml` for full configuration options.

## CLI Usage

```bash
# Check status
cmdb-agent-cli status

# Run collector manually
cmdb-agent-cli scan software incremental

# Force push queued data
cmdb-agent-cli flush

# Enroll with CMDB
cmdb-agent-cli enroll --token=YOUR_TOKEN

# List active policies
cmdb-agent-cli policy list

# Test policy (dry-run)
cmdb-agent-cli policy test POLICY-001
```

## Development

### Project Structure

```
cmd/
  cmdb-agent/       # Main agent binary
  cmdb-agent-cli/   # CLI tool
internal/
  agent/            # Core agent logic
  api/              # Local API server
  collectors/       # Data collectors
  config/           # Configuration
  deployment/       # Deployment manager
  enforcement/      # Policy enforcement
  logger/           # Logging
  queue/            # Local queue (BoltDB)
  scheduler/        # Cron scheduler
  transport/        # HTTP transport
systemd/            # Systemd service files
```

### Run tests

```bash
go test ./...
```

### Build packages

```bash
# DEB package
./build-deb.sh 1.0.0 amd64

# RPM package
./build-rpm.sh 1.0.0 x86_64
```

## API Endpoints

### Agent → CMDB (push)

- `POST /api/v1/agent/ci` – Batch CI data
- `POST /api/v1/agent/telemetry` – Heartbeat and stats
- `GET /api/v1/agent/config` – Fetch config
- `GET /api/v1/agent/policy` – Fetch policies
- `GET /api/v1/agent/deployments` – Pending deployment jobs

### Local control (UNIX socket)

- `GET /status` – Agent status
- `POST /scan?collector=X&mode=Y` – Trigger collector
- `POST /flush` – Force push queue
- `POST /update` – Trigger self-update
- `GET /policy/list` – List policies
- `POST /policy/test?id=X` – Test policy

## Security

- **Authentication**: mTLS with device certificates or OAuth2 client credentials
- **Transport**: TLS 1.2+ (prefer TLS 1.3)
- **Local secrets**: Encrypted storage using OS keystore
- **Code signing**: All binaries and updates signed
- **Least privilege**: Collectors run with minimal permissions

## Performance

- **Memory**: < 50MB RSS idle
- **CPU**: < 5% on 1-core system during scan
- **Disk**: Embedded DB < 100MB
- **Network**: Batch limits, compression, rate-limiting

## Documentation

- [Low-Level Design](../../docs/CMDB_AGENT_LLD.md)
- [Agent Overview](../../docs/AGENTS_OVERVIEW.md)

## License

MIT

## Contributing

Pull requests welcome! See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

*For issues and questions, open an issue on GitHub.*
