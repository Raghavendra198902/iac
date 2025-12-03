# CMDB Agent Documentation

## Overview

The **Unified CMDB Agent** is a single, lightweight, cross-platform endpoint agent that consolidates multiple capabilities into one modular, policy-driven system.

**Key Capabilities:**

- **Inventory & CI Collection** – Hardware, software, network, services, users, certificates
- **Telemetry** – Real-time metrics, heartbeats, health status
- **Monitoring & Enforcement** – Configuration drift detection, policy violations, security posture
- **Deployment & Patching** – Automated software/patch deployment with rollback
- **Policy Evaluation** – Dynamic rule evaluation and adaptive enforcement
- **Self-Update & Health** – Automatic updates, health checks, and resilience

---

## Architecture

The agent runs as a native service/daemon on endpoints:

- **Windows** – Windows Service + EventLog
- **Linux** – systemd service (fallback: SysVinit/OpenRC)
- **macOS** – launchd daemon
- **Android** – EMM-managed background service
- **iOS/iPadOS** – MDM-based lightweight collector (limited)
- **Kubernetes** – DaemonSet agent

**Core Components:**

- Scheduler
- Inventory & Telemetry Collectors (modular plugins)
- Local Storage/Queue (BoltDB/SQLite)
- Transport/Sync Engine (REST/gRPC with mTLS)
- Plugin/Extension Manager
- Policy & Enforcement Engine
- Deployment Module
- Health & Self-update Module
- Local API / CLI (UNIX socket / named pipe)

---

## Supported Platforms

- **Windows** – 7, 8, 10, 11, Server 2012–2025
- **Linux** – Ubuntu, Debian, RHEL, CentOS, Rocky, AlmaLinux, Fedora, SUSE, Amazon Linux
- **macOS** – 10.15+ (Catalina → latest)
- **BSD** – FreeBSD, OpenBSD, NetBSD (limited collectors)
- **Containers** – Docker, containerd, Kubernetes nodes
- **Mobile** – Android (Enterprise/EMM), iOS/iPadOS (MDM-based)

---

## Collectors

Built-in collectors gather data from:

- System (hostname, OS, uptime, kernel)
- Hardware (CPU, memory, disks, NICs, serial numbers)
- Software (packages, apps, versions)
- Processes & Services
- Network configuration & routes
- Users & groups
- Certificates & keys
- USB/peripheral devices
- Cloud metadata (AWS, Azure, GCP)
- Custom tags

Each collector supports:

- **Full scan** – Complete inventory snapshot
- **Incremental** – Delta-based updates
- **Event-driven** – Real-time change detection

---

## Security

- **Authentication** – mTLS (device certificates) + OAuth2 fallback
- **Transport** – TLS 1.2+ (prefer TLS 1.3), certificate validation, custom CA bundles
- **Local secrets** – OS keystore (Windows DPAPI, macOS Keychain, Linux libsecret)
- **Code signing** – All binaries and updates are signed
- **Least privilege** – Collectors run with minimal permissions
- **Audit logs** – Immutable local logs for critical operations

---

## Monitoring & Enforcement

The agent continuously monitors:

- Configuration drift (OS, software, services, certificates)
- Policy violations (forbidden software, disabled services, outdated patches)
- Security posture (firewall, antivirus, encryption)
- Resource thresholds (CPU, memory, disk)
- Network posture (open ports, unauthorized adapters)
- Device posture (USB events, peripheral changes)

**Enforcement modes:**

- **Preventive** – Block/disable unauthorized actions
- **Corrective** – Auto-remediate drift (restart services, enforce config)
- **Detective** – Log violations and alert
- **Adaptive** – Dynamic configuration based on risk score

**Safety controls:**

- Enforcement sandbox (dry-run testing)
- Rollback for last N changes
- Safe mode on agent failure → monitor-only

---

## Deployment Module

Automated deployment of:

- Software (install/upgrade/uninstall)
- Patches (OS & application updates)
- Configuration files (templating supported)
- Scripts (PowerShell, Bash, Python)

**Safety features:**

- Mandatory signature validation
- Pre-checks (OS, disk, dependencies)
- Post-checks (service running, version verified)
- Rollback on failure
- Execution sandbox

**Supported formats:**

- Windows: MSI, EXE, PowerShell, Chocolatey packages
- Linux: DEB, RPM, tar.gz, shell scripts, systemd configs
- macOS: PKG, DMG, plist configs, launchctl integration

---

## Configuration & Policy

**Config precedence:**

```
CLI flags > env vars > local config file > central policy
```

**Central policy:**

- Fetched from CMDB backend via `GET /api/v1/agent/policy`
- ETag-based delta sync
- Hot-reload without agent restart
- Policies cached locally in encrypted store

**Example policy:**

```yaml
policy_id: "POLICY-001"
type: security
mode: enforce
conditions:
  - key: software.nginx.version
    operator: <
    value: "1.20.0"
actions:
  - type: alert
  - type: block
    target: service
    id: nginx
schedule: "@every 10m"
severity: high
```

---

## APIs

### Agent → CMDB (push)

- `POST /api/v1/agent/ci` – Batch CI data
- `POST /api/v1/agent/telemetry` – Heartbeat, queue depth, errors
- `GET /api/v1/agent/config` – Fetch central config
- `GET /api/v1/agent/policy` – Fetch policies
- `GET /api/v1/agent/deployments` – Pending deployment jobs
- `POST /api/v1/agent/deployments/status` – Job results

### Local control (UNIX socket / named pipe)

- `GET /status` – Agent status (JSON)
- `POST /scan?collector=software` – Trigger collector
- `POST /flush` – Force push queued items
- `POST /update` – Trigger self-update

---

## CLI

```bash
cmdb-agent status                          # Show agent status
cmdb-agent scan --collector=software       # Run specific collector
cmdb-agent scan --mode=incremental         # Incremental scan
cmdb-agent flush                           # Force push queue
cmdb-agent enroll --token=xxxx             # Enroll with CMDB
cmdb-agent update                          # Check and apply updates
cmdb-agent policy list                     # List active policies
cmdb-agent policy test --id=POLICY-001     # Dry-run policy
```

---

## Deployment & Installation

### Packaging

- **Windows** – MSI + signed EXE
- **Linux** – DEB/RPM + tarball
- **macOS** – signed PKG or Homebrew tap

### Provisioning

1. Install package
2. Provide enrollment token or pre-provisioned certificate
3. Agent calls `POST /enroll` with device metadata
4. Receives device cert or credentials
5. Starts collecting and reporting

### Upgrades

- Signed update artifacts (binary + signature)
- Agent verifies signature, atomically swaps binary, restarts
- Rolling upgrades with health checks

---

## Observability

**Metrics:**

- `last_seen` – Last successful check-in
- `queue_depth` – Pending events in local queue
- `failed_collections` – Collector error count
- `bytes_sent` – Data transmitted
- `agent_uptime` – Uptime since last restart
- `update_status` – Update check and apply status

**Logs:**

- Structured JSON logs (rotated by size and time)
- Scrubbed for PII
- Local and remote (CMDB backend)

**Prometheus:**

- Optional metrics endpoint on localhost (disabled by default)
- Push metrics via telemetry endpoint

---

## Performance

- **Memory**: < 50MB RSS idle
- **CPU**: < 5% on 1-core system during scan
- **Disk**: Embedded DB < 100MB
- **Network**: Batch limits, compression, rate-limiting

---

## Design Reference

For detailed low-level design, see:

- [CMDB Agent LLD](CMDB_AGENT_LLD.md) – Complete low-level design specification

---

## Agent Implementations

The unified agent is being developed in:

- **Go** – Primary implementation (`backend/cmdb-agent-go/`)
- **TypeScript** – Legacy implementation (`backend/cmdb-agent/`)

The Go implementation is the recommended production agent with full cross-platform support.

---

*Last updated: 2025-12-03*
