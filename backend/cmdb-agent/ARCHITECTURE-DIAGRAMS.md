# CMDB Enterprise Agent - Architecture Diagrams

## System Architecture Overview

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                       CMDB Enterprise Agent Architecture                       ║
║                              Version 1.0.0                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────────────────────┐
│                          Operating System Layer                                │
├─────────────────┬─────────────────────┬───────────────────────────────────────┤
│   Windows       │      Linux          │         macOS (Planned)              │
│  ┌───────────┐  │   ┌───────────┐    │      ┌───────────┐                  │
│  │  sc.exe   │  │   │  systemd  │    │      │  launchd  │                  │
│  │ Services  │  │   │  Daemon   │    │      │  Daemon   │                  │
│  └─────┬─────┘  │   └─────┬─────┘    │      └─────┬─────┘                  │
└────────┼────────┴─────────┼──────────┴────────────┼────────────────────────┘
         │                  │                        │
         └──────────────────┴────────────────────────┘
                            │
                ┌───────────▼──────────────┐
                │   ServiceFactory.ts      │
                │  (Platform Abstraction)  │
                └───────────┬──────────────┘
                            │
         ┌──────────────────┴───────────────────┐
         │                                      │
┌────────▼─────────┐                  ┌────────▼─────────┐
│ WindowsService   │                  │  LinuxService    │
│   Manager        │                  │   Manager        │
└────────┬─────────┘                  └────────┬─────────┘
         │                                      │
         └──────────────────┬───────────────────┘
                            │
                ┌───────────▼──────────────┐
                │  EnterpriseAgent.ts      │
                │  (Main Application)      │
                │                          │
                │  • Config Management     │
                │  • Lifecycle Control     │
                │  • Component Orchestr.   │
                │  • Event Coordination    │
                └───────────┬──────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐   ┌───────▼────────┐
│   Monitoring   │  │  Telemetry  │   │  Auto-Upgrade  │
│   Subsystems   │  │   System    │   │    Manager     │
└───────┬────────┘  └──────┬──────┘   └───────┬────────┘
        │                   │                   │
        │                   │                   │
┌───────▼─────────────────────────────────────────────────┐
│                 Monitoring Modules                       │
├──────────────┬──────────────┬──────────────┬────────────┤
│   Process    │  Registry/   │     USB      │  Network   │
│   Monitor    │   Config     │   Monitor    │  Monitor   │
│              │   Monitor    │              │            │
│ • Start/Stop │ • Baseline   │ • VID/PID    │ • Adapters │
│ • Risk Score │ • Drift      │ • Whitelist  │ • Wi-Fi    │
│ • Patterns   │ • Changes    │ • Block/Allow│ • Rogue AP │
└──────────────┴──────────────┴──────────────┴────────────┘

┌─────────────────────────────────────────────────────────┐
│              Telemetry & Communication                   │
├──────────────────┬──────────────────────────────────────┤
│  Event Queue     │  • In-memory buffer                  │
│  (Batching)      │  • Size-based flushing               │
│                  │  • Time-based flushing               │
│                  │  • Offline persistence               │
├──────────────────┼──────────────────────────────────────┤
│  HTTP Client     │  • POST /api/telemetry               │
│                  │  • JSON payload                      │
│                  │  • Retry w/ backoff                  │
│                  │  • Error handling                    │
└──────────────────┴──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           Auto-Upgrade Manager Workflow                  │
├──────────────────────────────────────────────────────────┤
│  1. Version Check  → GET /api/downloads/agent-info      │
│  2. Download       → Progress tracking                  │
│  3. Verify         → SHA256 checksum                    │
│  4. Stop Service   → Graceful shutdown                  │
│  5. Backup         → Save current binary                │
│  6. Replace        → Install new binary                 │
│  7. Start Service  → Resume operations                  │
│  8. Verify         → Heartbeat confirmation             │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              External Integrations                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐         ┌────────────────┐         │
│  │  CMDB API      │◄────────┤  Agent         │         │
│  │  Gateway       │         │  Telemetry     │         │
│  │  :3000         │         │                │         │
│  └────────────────┘         └────────────────┘         │
│         │                                                │
│         │                                                │
│  ┌──────▼──────────┐       ┌────────────────┐         │
│  │  Dashboard UI   │       │  Auto-Update   │         │
│  │  :5173          │       │  Downloads     │         │
│  └─────────────────┘       └────────────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Component Interaction Diagram

```
Event Flow: Process Start Detection

┌─────────────┐
│ Windows OS  │  Process Created (notepad.exe)
└──────┬──────┘
       │
       │ WMI Event / ETW
       │
┌──────▼──────────────────┐
│  ProcessMonitor.ts      │
│                         │
│  1. Capture Event       │
│  2. Extract Metadata    │
│     • PID: 4512         │
│     • Name: notepad.exe │
│     • User: DOMAIN\user │
│     • Command-line      │
└──────┬──────────────────┘
       │
       │ Enrich Event
       │
┌──────▼──────────────────┐
│  Risk Scoring Engine    │
│                         │
│  Analyze:               │
│  • Command-line         │
│  • Parent process       │
│  • Execution path       │
│  • Spawn rate           │
│                         │
│  Score: 15/100 (Low)    │
└──────┬──────────────────┘
       │
       │ Emit Event
       │
┌──────▼──────────────────┐
│  EnterpriseAgent.ts     │
│                         │
│  queueTelemetry()       │
└──────┬──────────────────┘
       │
       │ Add to Queue
       │
┌──────▼──────────────────┐
│  Telemetry Queue        │
│  [Event 1, Event 2, ...] │
│                         │
│  Batch Size: 100        │
│  Current: 23            │
└──────┬──────────────────┘
       │
       │ Flush Trigger (60s OR 100 events)
       │
┌──────▼──────────────────┐
│  HTTP POST              │
│  /api/telemetry         │
│                         │
│  {                      │
│    "agentName": "...",  │
│    "events": [...]      │
│  }                      │
└──────┬──────────────────┘
       │
       │ Response 200 OK
       │
┌──────▼──────────────────┐
│  CMDB Backend           │
│                         │
│  • Store events         │
│  • Trigger alerts       │
│  • Update dashboard     │
└─────────────────────────┘
```

---

## Auto-Upgrade Sequence Diagram

```
Agent                 API Gateway            Update Server
  │                       │                       │
  │  1. Check Version     │                       │
  ├──────────────────────►│                       │
  │  GET /agent-info      │                       │
  │                       │                       │
  │  2. Version Response  │                       │
  │◄──────────────────────┤                       │
  │  { version: "1.1.0" } │                       │
  │                       │                       │
  │  3. Compare Versions  │                       │
  │  Current: 1.0.0       │                       │
  │  Latest: 1.1.0        │                       │
  │  → Update Available   │                       │
  │                       │                       │
  │  4. Download Binary   │                       │
  ├──────────────────────►│                       │
  │  GET /downloads/exe   │                       │
  │                       │  Fetch Binary         │
  │                       ├──────────────────────►│
  │                       │                       │
  │  5. Binary Stream     │                       │
  │◄──────────────────────┤◄──────────────────────┤
  │  [42 MB, progress]    │                       │
  │                       │                       │
  │  6. Verify SHA256     │                       │
  │  Expected: abc123...  │                       │
  │  Actual: abc123...    │                       │
  │  ✓ Match              │                       │
  │                       │                       │
  │  7. Stop Service      │                       │
  │  sc stop cmdb-agent   │                       │
  │                       │                       │
  │  8. Backup Current    │                       │
  │  mv cmdb-agent.exe    │                       │
  │     cmdb-agent.bak    │                       │
  │                       │                       │
  │  9. Install New       │                       │
  │  cp new.exe           │                       │
  │     cmdb-agent.exe    │                       │
  │                       │                       │
  │  10. Start Service    │                       │
  │  sc start cmdb-agent  │                       │
  │                       │                       │
  │  11. Send Heartbeat   │                       │
  ├──────────────────────►│                       │
  │  POST /telemetry      │                       │
  │  { version: "1.1.0" } │                       │
  │                       │                       │
  │  12. Confirm Success  │                       │
  │◄──────────────────────┤                       │
  │  200 OK               │                       │
  │                       │                       │
```

---

## GUI Installer Flow

```
┌─────────────────────────────────────────────────────────┐
│              GUI Installer Architecture                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  Electron Main Process (main.ts)                        │
├─────────────────────────────────────────────────────────┤
│  • Window Management                                    │
│  • IPC Handlers                                         │
│  • System Operations                                    │
└────────────┬────────────────────────────────────────────┘
             │
             │ Context Bridge (preload.js)
             │
┌────────────▼────────────────────────────────────────────┐
│  Renderer Process (index.html)                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 1: Welcome                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • System Info Display                           │   │
│  │ • Feature List                                   │   │
│  │ • Admin Check                                    │   │
│  └─────────────────────────────────────────────────┘   │
│               │ [Next]                                   │
│               ▼                                          │
│  Step 2: Configuration                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • Installation Path                              │   │
│  │ • API Server URL ──────► Test Connection        │   │
│  │ • Agent Name                                     │   │
│  │ • Organization ID                                │   │
│  │ • ☑ Auto-start                                   │   │
│  │ • ☑ Auto-update                                  │   │
│  └─────────────────────────────────────────────────┘   │
│               │ [Test & Continue]                       │
│               ▼                                          │
│  Step 3: Installation                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Progress Bar: ████████░░ 80%                    │   │
│  │                                                  │   │
│  │ Status: "Installing service..."                 │   │
│  │                                                  │   │
│  │ Operations:                                      │   │
│  │  ✓ Create directory                             │   │
│  │  ✓ Copy files                                   │   │
│  │  ✓ Create config                                │   │
│  │  ► Install service                              │   │
│  │  ○ Start service                                │   │
│  └─────────────────────────────────────────────────┘   │
│               │ Auto-proceed                            │
│               ▼                                          │
│  Step 4: Complete                                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ✓ Success Message                               │   │
│  │ ✓ Service Status                                │   │
│  │ ✓ Features Installed                            │   │
│  │ ✓ Next Steps                                    │   │
│  └─────────────────────────────────────────────────┘   │
│               │ [Finish]                                │
│               ▼                                          │
│           Exit Installer                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Telemetry Data Flow                               │
└─────────────────────────────────────────────────────────────────────┘

OS Event
   │
   │ (1) Detection
   │
   ▼
┌──────────────────┐
│ Monitor Module   │
│ • Process        │
│ • Registry       │
│ • USB            │
│ • Network        │
│ • File System    │
└────────┬─────────┘
         │
         │ (2) Capture & Enrich
         │     • Metadata
         │     • Context
         │     • Risk Score
         │
         ▼
┌──────────────────┐
│ Event Object     │
│ {                │
│   type: "...",   │
│   timestamp,     │
│   data: {...},   │
│   riskScore: N   │
│ }                │
└────────┬─────────┘
         │
         │ (3) Queue
         │
         ▼
┌──────────────────────────────┐
│ In-Memory Queue              │
│ [Event1, Event2, Event3, ...] │
│                              │
│ Triggers:                    │
│ • Size: 100 events           │
│ • Time: 60 seconds           │
└────────┬─────────────────────┘
         │
         │ (4) Flush
         │
         ▼
┌──────────────────┐
│ Batch Payload    │
│ {                │
│   agentName,     │
│   timestamp,     │
│   events: [...]  │
│ }                │
└────────┬─────────┘
         │
         │ (5) HTTP POST
         │
         ▼
┌──────────────────┐
│ API Gateway      │
│ POST /telemetry  │
└────────┬─────────┘
         │
         │ (6) Processing
         │
         ▼
┌────────────────────────────┐
│ Backend Processing         │
│ • Database Storage         │
│ • Alert Triggering         │
│ • Dashboard Update         │
│ • Analytics Processing     │
└────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Security Layers & Controls                  │
└─────────────────────────────────────────────────────────┘

Layer 1: OS Integration
┌─────────────────────────────────────────────────────────┐
│ • Service runs as SYSTEM/root                           │
│ • Process isolation                                     │
│ • Memory protection                                     │
│ • File permissions (0o755)                              │
└─────────────────────────────────────────────────────────┘

Layer 2: Service Protection
┌─────────────────────────────────────────────────────────┐
│ Windows:                      Linux:                    │
│ • Recovery on failure         • Restart=always          │
│ • Requires admin to stop      • ProtectSystem=strict    │
│ • Service dependency chain    • PrivateTmp=true         │
│                               • NoNewPrivileges=true    │
└─────────────────────────────────────────────────────────┘

Layer 3: Communication Security
┌─────────────────────────────────────────────────────────┐
│ • HTTPS/TLS 1.3 support                                 │
│ • SHA256 checksum verification                          │
│ • Timeout protection (30s)                              │
│ • Retry logic w/ exponential backoff                    │
│ • Error handling & logging                              │
└─────────────────────────────────────────────────────────┘

Layer 4: Data Security
┌─────────────────────────────────────────────────────────┐
│ • No PII collection                                     │
│ • Process hashes (not full executables)                │
│ • Encrypted config storage (planned)                   │
│ • Audit logging                                        │
└─────────────────────────────────────────────────────────┘

Layer 5: Update Security
┌─────────────────────────────────────────────────────────┐
│ • SHA256 integrity verification                         │
│ • Secure download channels                              │
│ • Backup before update                                  │
│ • Rollback on failure                                   │
│ • Version confirmation                                  │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Topology

```
┌────────────────────────────────────────────────────────────────┐
│                    Enterprise Deployment                        │
└────────────────────────────────────────────────────────────────┘

                    CMDB Control Plane
                  ┌───────────────────┐
                  │  API Gateway      │
                  │  :3000            │
                  └─────────┬─────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
    ┌─────────▼───────┐ ┌──▼──────┐ ┌───▼────────┐
    │   Dashboard     │ │Database │ │  Update    │
    │   UI :5173      │ │         │ │  Server    │
    └─────────────────┘ └─────────┘ └────────────┘
                            │
              Network (LAN/WAN)
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼─────────┐
│ Windows Client │  │ Linux Server   │  │ Linux Server   │
│                │  │                │  │                │
│ CMDB Agent     │  │ CMDB Agent     │  │ CMDB Agent     │
│ (Service)      │  │ (systemd)      │  │ (systemd)      │
│                │  │                │  │                │
│ • Monitoring   │  │ • Monitoring   │  │ • Monitoring   │
│ • Telemetry    │  │ • Telemetry    │  │ • Telemetry    │
│ • Auto-Update  │  │ • Auto-Update  │  │ • Auto-Update  │
└────────────────┘  └────────────────┘  └────────────────┘

        Heartbeat every 5 minutes ──►
             ◄── Telemetry batches every 60s
        ◄── Auto-update check every 24h
```

---

This architecture documentation provides a comprehensive visual representation of the CMDB Enterprise Agent system, showing all layers from OS integration through to enterprise deployment.
