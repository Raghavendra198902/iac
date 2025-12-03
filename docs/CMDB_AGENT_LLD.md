# Low-Level Design (LLD): CMDB Agent

Version: 1.0
Author: (Draft)
Date: 2025-12-03

---

## 1. Purpose

This document provides a unified low-level design for the One Unified CMDB Agent — a single, consolidated endpoint agent that handles:

- Inventory & CI collection
- Telemetry
- Monitoring & enforcement
- Deployment & patching
- Policy evaluation
- Self-update & health reporting

The goal is to avoid multiple agents on endpoints by merging all capabilities into one lightweight, modular, policy-driven agent.
This document provides a low-level design for the CMDB Agent — a lightweight, cross-platform data collector that runs on endpoints and reports Configuration Items (CIs) and inventory/telemetry to the central CMDB server.

Goals:

- Reliable, secure collection of hardware/software/inventory and runtime telemetry
- Minimal resource usage and robust offline buffering
- Secure authentication and transport to CMDB backends
- Easy deployment & upgrades, extensible plugin architecture

Non-goals:

- Full configuration management (this is a collector only)

---

## 2. High-level architecture

### 2.1 Cross-Platform OS Support

The Unified CMDB Agent supports all major operating systems with native binaries, service management integration, and OS-specific collectors.

Supported platforms:

- Windows (7, 8, 10, 11, Server 2012–2025)
- Linux (Ubuntu, Debian, RHEL, CentOS, Rocky, AlmaLinux, Fedora, SUSE, Amazon Linux)
- macOS (10.15+ Catalina → latest)
- BSD family (FreeBSD, OpenBSD, NetBSD – limited collectors)
- Container OS (Docker, containerd, Kubernetes nodes)
- Android (Enterprise mode / EMM) – via restricted agent
- iOS/iPadOS (MDM-based lightweight collector – limited)

Key OS-level design principles:

- Each platform uses a native service wrapper:
  - Windows → Windows Service + EventLog integration
  - Linux → systemd service (fallback: SysVinit/OpenRC)
  - macOS → launchd daemon
  - Android → background service with EMM policies
  - Kubernetes → DaemonSet agent

- Platform-aware collectors:
  - Windows Registry, WMI/WinRM, ETW, MSI inventory
  - Linux `/proc`, `/sys`, dpkg/rpm, systemd, network scripts
  - macOS System Profiler, launchctl, profiles
  - Containers: cgroup metrics, namespace-aware discovery

- Unified API but modular backend per OS
- Dynamic loading of OS-specific plugins
- Auto-detection of OS family, version, kernel, virtualization layer

---

## 2. High-level architecture

Agent runs on endpoints (Windows, Linux, macOS). Core pieces:

- Core Agent Process (daemon/service)
  - Scheduler
  - Inventory Collector
  - Telemetry Collector
  - Local Storage/Queue
  - Transport/Sync Engine
  - Plugin/Extension Manager
  - Health & Self-update module

- Local API / CLI
  - UNIX socket / named pipe for local integration and control
  - CLI binary for manual operations (scan, push, status)

- Configuration
  - YAML/JSON config with override precedence: local file → env → central policy

- Backend
  - CMDB HTTP(S) REST / gRPC endpoints
  - Auth: mTLS + JWT (short lived) or OAuth2 client credentials depending on environment

- Optional
  - Sidecar for proxying through constrained networks
  - Centralized provisioning service (for zero-touch installs)

---

## 3. Component design

### 3.1 Core Agent

- Language: Go or Rust recommended (static binary, cross-compile, low memory footprint). Node/Python possible but bring runtime maintenance.
- Process model: single main process with internal goroutine/thread pool. Use event-driven non-blocking I/O for network.
- Memory/CPU targets: < 50MB RSS idle, <5% CPU on 1-core system during scan.

### 3.2 Collector modules (plugins)

Each collector implements a well-defined interface:

```
interface Collector {
  Name() string
  RequiredPermissions() []string
  Run(ctx) -> CollectionResult
  Schedule() -> cron-like spec
}
```

Built-in collectors:

- System (hostname, OS, uptime)
- Hardware (CPU, memory, disks, NICs, serial numbers)
- Software (installed packages, apps, versions)
- Processes & Services
- Network configuration & routes
- Users & groups
- Certificates & keys inventory
- USB/devices
- Cloud metadata (if running in cloud VM)
- Custom tags (from local file)

Collectors should support incremental discovery and full-scan modes.

### 3.3 Local Storage / Queue

- Use embedded key-value store (BoltDB/SQLite/LMDB) for state and queue
- Schema:
  - `last_collected_{collector}` timestamp
  - `pending_events` queue with retry metadata
- Implement FIFO queue with exponential backoff and max retries. Persist across reboots.

### 3.4 Transport / Sync Engine

- Protocol: HTTPS REST with JSON or gRPC (protobuf) depending on backend.
- Features:
  - Batch payloads with configurable max size (e.g., 512KB) and max items per batch
  - Compression (gzip) negotiated via Accept-Encoding
  - Retry with jittered exponential backoff
  - Circuit breaker when backend is unreachable for N attempts
  - Offline mode: queue persists locally until network recovery

### 3.5 Authentication

- Primary: mTLS using device certificate provisioned during install or enrollment
- Secondary (fallback): client credentials + JWT renewal via OAuth2
- Short-lived session tokens stored encrypted locally (use OS keyring where available)

### 3.6 Configuration & Policy

- Config sources & precedence: CLI flags > env vars > local config file > central policy
- Central policy: agent polls central config endpoint periodically and applies delta
- Config options:
  - Server endpoints (primary/secondary)
  - Schedule per collector
  - Batch size & intervals
  - Allowed/forbidden collectors
  - Proxy settings
  - Logging level

### 3.7 Health & Self-update

- Health checks: runtime memory, connectivity, collector error rate
- Expose local health status via socket/HTTP (read-only)
- Self-update mechanism:
  - Signed update artifacts (binary + signature)
  - Agent fetches update, verifies signature, atomically swap binary and restart
  - Windows: use service control to update; Linux/macOS: systemd/launchd friendly

### 3.8 Logging & Telemetry

- Local logs: structured JSON, rotated by size and time, preserve last N logs
- Telemetry: agent reports heartbeat with stats (uptime, queue depth, errors)
- Sensitive logs (PII) should be scrubbed before sending

---

## 4. Data model (sample)

### 4.1 CI JSON schema (example)

```json
{
  "ci_id": "host-{{uuid}}",
  "hostname": "host1.example.com",
  "platform": "ubuntu:24.04",
  "serial_number": "ABC123",
  "hardware": {
    "cpu": "Intel(R) Xeon",
    "memory_mb": 32768,
    "disks": [ {"name":"/dev/sda","size_gb":512} ]
  },
  "software": [ {"name":"nginx","version":"1.22.1"} ],
  "network_interfaces": [ {"name":"eth0","mac":"aa:bb:cc","ips":["10.0.0.5"]} ],
  "collected_at": "2025-12-03T12:34:56Z",
  "agent_version":"1.0.0",
  "tags": { "env":"prod", "owner":"infra" }
}
```

Field rules:

- `ci_id` deterministic where possible (MAC + hostname hash) but allow server-side reconciliation
- Timestamps in ISO8601 UTC
- Avoid very large fields — for big artifacts (like logs) provide pointers to storage

---

## 5. APIs / Endpoints

### 5.1 Agent -> CMDB (push)

- `POST /api/v1/agent/ci` (batch) -> Accepts array of CI objects
- `POST /api/v1/agent/telemetry` -> agent heartbeat, queue depth, errors
- `GET /api/v1/agent/config` -> fetch central config (ETag for delta)
- `POST /api/v1/agent/file` -> upload artifact (signed URL recommended)

Auth: mTLS or Bearer token

### 5.2 Local control

- UNIX socket / named pipe endpoints
  - `GET /status` -> JSON
  - `POST /scan?collector=software` -> trigger
  - `POST /flush` -> force push queued items
  - `POST /update` -> trigger update

CLI mirrors these operations.

---

## 6. Security

- Least privilege: run collectors with minimal privilege; escalation only for collectors that require it with clear audit logging
- Sensitive data minimization: hash or redact secrets, API keys, user passwords
- Protect local secrets: use OS key store (Windows DPAPI, macOS Keychain, Linux libsecret) and fall back to an encrypted file (AES-256) with machine-specific key
- Network: enforce TLS1.2+ (prefer TLS1.3), validate server certs, support custom CA bundles
- Code signing for updates and installer packages
- Audit logs: local immutable append-only log for critical operations (enrollment, config changes)

---

## 7. Deployment & Provisioning

### 7.1 Packaging

- Cross-platform installers:
  - Windows: MSI + signed EXE
  - Linux: DEB/RPM + tarball for custom installs
  - macOS: signed PKG or Homebrew tap

### 7.2 Provisioning

- Manual: admin installs and registers with enrollment token
- Automated: MDM/CM tools or bootstrap token via ephemeral provisioning service
- Enrollment flow:
  1. Agent installs
  2. Admin provides enrollment token or pre-provisioned cert
  3. Agent calls `POST /enroll` with device metadata and receives device cert or credentials

### 7.3 Upgrades

- Rolling upgrades supported. Use blue/green pattern with health checks.

---

## 8. Error handling & retries

- Retryable errors: network timeouts, 5xx -> retry with backoff
- Non-retryable: 4xx (except 429) -> notify admin and drop item after audit
- Poison message handling: if an item fails repeatedly, move to dead-letter store and surface in telemetry

---

## 9. Scalability & Performance

- Agent is single-node; scalability concerns are on backend. Ensure batch limits and backoff to avoid overloading network.
- Provide rate-limiting config and CPU/disk throttling for low-resource devices.

---

## 10. Testing & QA

- Unit tests for collectors, config parsing, transport
- Integration tests: local mock server + TLS tests
- E2E tests: full enroll -> collect -> push -> server ingest
- Fuzz tests for schema and large payloads
- Regression tests for upgrade path

---

## 11. Observability & Monitoring

- Expose Prometheus metrics on localhost (scrape disabled by default) or push metrics through telemetry endpoint
- Key metrics: last_seen, queue_depth, failed_collections, bytes_sent, agent_uptime, update_status
- Central collector aggregates agent telemetry into CMDB monitoring dashboards

---

## 12. Backwards compatibility & versioning

- Agent version header in all requests
- Server should support schema version negotiation; agent includes `schema_version` in payload
- Deprecation policy: server accepts vN and vN-1 schemas for at least 12 months

---

## 13. Example sequence (Full scan + push)

1. Scheduler triggers `FullInventoryCollector`.
2. Collector reads system, writes CollectionResult to local queue.
3. Transport engine batches items (<=512KB) and POSTs to `/api/v1/agent/ci` using mTLS.
4. On success (200/202), remove items from queue and update `last_collected` timestamps.
5. On failure, apply retry/backoff; if max retries hit, push to dead-letter.

---

## 15. Monitoring & Enforcement Policy

### 15.1 Purpose

This section extends the CMDB Agent with Monitoring and Enforcement Policy capabilities to ensure endpoint compliance, configuration drift detection, and security policy enforcement.

### 15.2 Monitoring Scope

The agent continuously monitors the following:

- Configuration drift (OS, software versions, services, certificates)
- Policy violations (forbidden software, disabled services, outdated patches)
- Security posture (firewall status, antivirus, disk encryption state)
- Resource thresholds (CPU, memory, disk usage)
- Network posture (open ports, unauthorized adapters, routing changes)
- Device posture (USB events, peripheral changes)
- Compliance tags applied by CMDB backend policies

Collectors enhanced for monitoring mode run in incremental, event-driven, or threshold-based mode.

### 15.3 Enforcement Engine

An internal enforcement engine applies CMDB-approved rules.

Rules types:

- Preventive – block/disable actions (e.g., block blacklisted software)
- Corrective – auto-remediate drift (restart service, enforce config)
- Detective – log only, send violations to CMDB
- Adaptive – dynamic configuration updates based on device risk score

Enforcement actions:

- Stop/disable unauthorized services
- Remove or quarantine blacklisted applications
- Enforce security settings (firewall enabled, password policies)
- Revert config files to baseline (for supported OS)
- Disable/block USB devices (where OS API allows)
- Alert-only for high‑risk operations

All enforcement actions are logged locally + sent to CMDB.

### 15.4 Policy Model

Each policy contains:

```yaml
policy_id: "POLICY-001"
type: security | compliance | resource | software
mode: enforce | monitor | adaptive
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
version: 1.1
```

### 15.5 Policy Distribution

Policies flow from central CMDB → Agent via:

- `GET /api/v1/agent/policy` (ETag, delta sync)
- Policies cached locally in encrypted store
- Hot‑reload without restarting agent

### 15.6 Enforcement Flow

1. Collector detects state change
2. Monitoring rules evaluate conditions
3. If violation → trigger enforcement action
4. Enforcement logs written locally + queued for CMDB
5. Telemetry sends summary of violations
6. If adaptive policy → fetch updated rules

### 15.7 Safety & Fail‑Safes

- Enforcement sandbox (dry-run) for testing
- Severity‑based action throttling
- Undo/rollback for last N enforcement changes
- Safe mode: if agent detects self-failure → switch to monitor-only mode

### 15.8 Example Violation Event

```json
{
  "policy_id": "POLICY-SEC-004",
  "hostname": "server42",
  "violation": "Unauthorized USB mass-storage device connected",
  "action_taken": "blocked",
  "timestamp": "2025-12-03T15:24:52Z",
  "agent_version": "1.0.0"
}
```

---

## 16. Deployment Agent Module

### 16.1 Purpose

The Deployment Agent Module extends the CMDB Agent to support automated, secure, and policy‑controlled deployment of software, patches, configurations, and scripts across endpoints. It integrates tightly with CMDB policies and compliance workflows.

This module does not replace full configuration management tools — instead, it enables lightweight, controlled, event-driven deployments.

### 16.2 Capabilities

- Software deployment (install/upgrade/uninstall)
- Patch deployment (OS & application updates)
- Configuration file deployment and templating
- Script execution (PowerShell, Bash, Python)
- Package validation (hash/signature)
- Rollback & version tracking
- Dependency and pre-check validation
- Dry-run mode for testing

### 16.3 Deployment Package Structure

Each deployment artifact uses a standard format:

```yaml
deployment_id: DEP-2025-001
name: "Install Agent Extension"
version: "1.0.2"
type: software | patch | config | script
os: [windows, linux, macos]
arch: [amd64, arm64]
pre_checks:
  - type: file_exists
    path: "/usr/bin/python3"
actions:
  - type: download
    src: https://cdn.example.com/pkgs/agent-ext-1.0.2.rpm
    dest: /tmp/agent-ext.rpm
  - type: install
    package: /tmp/agent-ext.rpm
post_checks:
  - type: service_running
    service: agent-ext
rollback:
  - type: uninstall
    package: agent-ext
signature:
  sha256: "<hash>"
```

### 16.4 Deployment Execution Flow

1. CMDB backend pushes a deployment job or agent polls for new jobs.
2. Agent downloads artifact or script securely.
3. Validates signature & integrity.
4. Runs pre-checks (OS, disk, dependencies, version requirements).
5. Executes actions in order:
   - install/update/remove/configure
   - run scripts
6. Performs post-checks.
7. Reports status + logs back to CMDB.
8. If failure → attempts rollback (if defined).

### 16.5 Safety Controls

- Mandatory signature validation
- Allowed‑actions whitelist
- Max runtime per action
- Execution sandbox (script isolation)
- Rollback on failure
- No modification of core OS components
- Strict privilege escalation rules

### 16.6 Deployment Job API

Agent interacts with backend via:

- `GET /api/v1/agent/deployments` → pending jobs
- `POST /api/v1/agent/deployments/status` → job results
- `POST /api/v1/agent/artifact` → request signed URLs

Job states:

- pending
- running
- success
- failed
- rolled_back

### 16.7 Local Execution Engine

Supports:

- Windows: MSI, EXE, PowerShell scripts, Chocolatey-style packages
- Linux: DEB, RPM, tar.gz, shell scripts, systemd service configuration
- macOS: PKG, DMG, plist configuration, launchctl integration

Executes scripts using restricted runtime:

- PowerShell constrained mode
- Bash with limited environment
- Python with no external module access unless allowed

### 16.8 Telemetry

Agent sends detailed deployment results:

```json
{
  "deployment_id": "DEP-2025-001",
  "hostname": "server10",
  "status": "success",
  "duration_sec": 32,
  "actions_executed": 5,
  "rollback_used": false,
  "timestamp": "2025-12-03T18:11:40Z"
}
```

### 16.9 Integration With Enforcement Policies

Deployment module works together with Monitoring/Enforcement module:

- Enforcement policies may trigger deployments (e.g., missing patch)
- Deployment success/failure updates compliance state
- Drift detected by monitoring can result in deployment job creation

---

## 14. Appendix

### 14.1 Sample CLI commands

```bash
cmdb-agent status
cmdb-agent scan --collector=software --mode=incremental
cmdb-agent flush
cmdb-agent enroll --token=xxxx
```

### 14.2 Minimal config example (YAML)

```yaml
server:
  primary: https://cmdb.example.com:8443
  ca_bundle: /etc/cmdb/ca.pem
agent:
  version: 1.0.0
  collectors:
    - system: { schedule: "@hourly" }
    - software: { schedule: "@daily" }
  batch:
    max_size_kb: 512
    max_items: 50
  auth:
    method: mTLS
```

---

*End of LLD.*
