# CMDB Agent Features

## 📊 Data Collection & Inventory

### 1. System Information Collector

**Purpose:** Captures core operating system and platform details.

**Data Points:**
- **Hostname:** Machine name as reported by OS
- **Domain:** DNS domain name
- **FQDN:** Fully qualified domain name
- **OS Type:** Linux, Windows, Darwin (macOS)
- **OS Version:** Kernel version, build number
- **Architecture:** x86_64, arm64, i386
- **Platform:** ubuntu, windows, darwin
- **Platform Family:** debian, rhel, standalone
- **Platform Version:** Specific OS release (22.04, 11, etc.)
- **Kernel Version:** Full kernel string
- **Kernel Architecture:** Kernel build architecture
- **System Uptime:** Seconds since boot
- **Boot Time:** Timestamp of last system boot
- **Virtualization:** Detection of VM/container (KVM, VMware, Docker, etc.)
- **Host ID:** Unique machine identifier

**Collection Modes:**
- **Quick:** Hostname, OS, uptime only
- **Full:** All available system information
- **Delta:** Changes since last collection

**Implementation Status:** ✅ Core implemented with gopsutil
**OS-Specific Extensions Needed:**
- Linux: `/etc/os-release`, `/proc/version`, `hostnamectl`
- Windows: WMI `Win32_OperatingSystem`, Registry
- macOS: `system_profiler SPSoftwareDataType`, `sw_vers`

**API Endpoint:** `POST /api/v1/ci` (Type: `system`)

---

### 2. Hardware Inventory Collector

**Purpose:** Complete hardware asset discovery and tracking.

**CPU Information:**
- **Model Name:** CPU brand and model (Intel Core i7-9700K, AMD Ryzen 9)
- **Vendor:** Intel, AMD, ARM
- **Physical Cores:** Number of physical CPU cores
- **Logical Cores:** Including hyperthreading
- **Threads per Core:** Hyperthreading factor
- **CPU Speed:** Current frequency in MHz/GHz
- **CPU Cache:** L1, L2, L3 cache sizes
- **CPU Flags:** Supported instruction sets (SSE, AVX, AES-NI)
- **Microcode Version:** CPU microcode level
- **CPU Load:** Current utilization percentage

**Memory Information:**
- **Total Physical RAM:** Total installed memory
- **Available RAM:** Currently free memory
- **Used RAM:** Memory in use
- **Swap Total:** Total swap space
- **Swap Used:** Swap space in use
- **Memory Type:** DDR3, DDR4, DDR5
- **Memory Speed:** MHz rating
- **Memory Slots:** Total and occupied
- **Memory Modules:** Per-module details (size, manufacturer, serial)

**Disk/Storage Information:**
- **Device Name:** `/dev/sda`, `C:`, etc.
- **Device Type:** HDD, SSD, NVMe
- **Capacity:** Total size in bytes
- **Used Space:** Current utilization
- **Free Space:** Available space
- **File System:** ext4, NTFS, APFS, XFS
- **Mount Point:** Where mounted in filesystem
- **Partition Table:** GPT, MBR
- **Serial Number:** Drive serial
- **Model:** Drive manufacturer and model
- **SMART Status:** Health monitoring data
- **I/O Statistics:** Read/write operations
- **Partition Details:** All partitions on disk

**Motherboard Information:**
- **Vendor:** ASUS, Dell, HP, Supermicro
- **Model:** Board model number
- **Version:** Board revision
- **Serial Number:** Unique board serial
- **BIOS/UEFI Version:** Firmware version
- **BIOS Date:** Firmware release date
- **Asset Tag:** Corporate asset identifier

**Additional Hardware:**
- **GPU Information:** Graphics cards
- **Network Cards:** NICs with MAC addresses
- **USB Devices:** Connected USB peripherals
- **PCI Devices:** All PCI/PCIe devices
- **Sensors:** Temperature, fan speed, voltage

**Collection Modes:**
- **Quick:** CPU, memory, disk summary
- **Full:** All hardware details including sensors
- **Delta:** Hardware changes (new disks, memory upgrades)

**Implementation Status:** ✅ Core implemented with gopsutil
**OS-Specific Extensions Needed:**
- Linux: `lshw`, `dmidecode`, `smartctl`, `/proc/cpuinfo`, `/sys/class/dmi`
- Windows: WMI (`Win32_Processor`, `Win32_PhysicalMemory`, `Win32_DiskDrive`, `Win32_BaseBoard`)
- macOS: `system_profiler SPHardwareDataType`, `sysctl`

**API Endpoint:** `POST /api/v1/ci` (Type: `hardware`)

---

### 3. Network Discovery Collector

**Purpose:** Map network configuration and connectivity.

**Network Interfaces:**
- **Interface Name:** eth0, wlan0, en0, Ethernet0
- **Interface Type:** Physical, virtual, loopback, tunnel
- **MAC Address:** Hardware address
- **MTU:** Maximum transmission unit
- **Speed:** Link speed (1000Mbps, 10Gbps)
- **Duplex:** Full, half
- **Status:** Up, down, unknown
- **Driver:** Kernel driver name
- **Driver Version:** Driver version
- **Firmware Version:** NIC firmware

**IP Addressing:**
- **IPv4 Addresses:** All assigned IPv4 addresses
- **IPv6 Addresses:** All assigned IPv6 addresses
- **Netmask/Prefix:** Network masks
- **Broadcast Address:** Broadcast IP
- **Scope:** Global, link-local, host
- **DHCP Configuration:** Static vs DHCP assigned

**Routing Information:**
- **Default Gateway:** Primary route
- **Routing Table:** All routes
- **Route Metrics:** Route priorities
- **Route Protocols:** Static, DHCP, OSPF, BGP

**DNS Configuration:**
- **DNS Servers:** All configured DNS
- **DNS Search Domains:** Search path
- **DNS Suffix:** Domain suffix

**Network Statistics:**
- **Bytes Sent:** Total TX bytes
- **Bytes Received:** Total RX bytes
- **Packets Sent:** Total TX packets
- **Packets Received:** Total RX packets
- **Errors:** TX/RX errors
- **Drops:** Dropped packets
- **Collisions:** Network collisions

**Advanced Network Info:**
- **VLAN Configuration:** VLAN IDs and tags
- **Bond/Team Interfaces:** Link aggregation
- **Bridge Interfaces:** Network bridges
- **Tunnels:** VPN, GRE, VXLAN
- **Firewall Rules:** Active firewall state
- **Open Ports:** Listening ports and services
- **Active Connections:** Established connections

**Collection Modes:**
- **Quick:** Interfaces, IPs, gateway
- **Full:** All network details including statistics
- **Delta:** Configuration changes

**Implementation Status:** ✅ Core implemented with gopsutil
**OS-Specific Extensions Needed:**
- Linux: `ip addr`, `ip route`, `ethtool`, `/proc/net/*`, `netstat`, `ss`
- Windows: `Get-NetAdapter`, `Get-NetIPAddress`, `Get-NetRoute`, WMI
- macOS: `ifconfig`, `netstat`, `networksetup`

**API Endpoint:** `POST /api/v1/ci` (Type: `network`)

---

### 4. Software Inventory Collector

**Purpose:** Track all installed software and packages.

**Package Information:**
- **Package Name:** Software name
- **Version:** Installed version
- **Architecture:** x86_64, arm64, all
- **Description:** Package description
- **Install Date:** When installed
- **Install Source:** Repository or manual
- **Size:** Installed size in bytes
- **License:** Software license type (GPL, MIT, Apache, Proprietary, etc.)
- **License Status:** Active, expired, trial, unregistered, compliant
- **License Key/Serial:** Activation key or serial number (if applicable)
- **License Expiry Date:** When license expires
- **License Type:** Per-user, per-device, site license, subscription
- **License Count:** Number of licenses/seats
- **Vendor/Publisher:** Software vendor
- **Package Manager:** dpkg, rpm, brew, msi
- **Maintainer:** Package maintainer contact
- **Homepage:** Official software URL

**Linux - Debian/Ubuntu (dpkg):**
- Query: `dpkg-query -W -f='${Package}\t${Version}\t${Architecture}\t${Installed-Size}\n'`
- License info: `dpkg-query -W -f='${Package}\t${License}\n'`
- Source: `/var/lib/dpkg/status`
- APT Repository info: `/etc/apt/sources.list`
- Copyright files: `/usr/share/doc/*/copyright`

**Linux - RHEL/CentOS (rpm):**
- Query: `rpm -qa --queryformat '%{NAME}\t%{VERSION}-%{RELEASE}\t%{ARCH}\t%{INSTALLTIME}\t%{SIZE}\n'`
- License: `rpm -qa --queryformat '%{NAME}\t%{LICENSE}\n'`
- YUM/DNF history: `/var/lib/yum/history`, `/var/lib/dnf/history`
- Package info: `rpm -qi <package>` (includes license field)

**Windows:**
- Registry: `HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall`
- Registry: `HKLM\Software\Wow6432Node\Microsoft\Windows\CurrentVersion\Uninstall`
- PowerShell: `Get-Package`, `Get-WmiObject Win32_Product`
- License info: `Get-ItemProperty` from Registry keys (DisplayName, Publisher, DisplayVersion, InstallDate, etc.)
- Windows License: `slmgr /dli` (Windows activation status)
- Volume License: `slmgr /dlv` (detailed licensing info)
- Product keys: Registry `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\DigitalProductId`
- Office licenses: `cscript "C:\Program Files\Microsoft Office\Office16\OSPP.VBS" /dstatus`
- MSI Database queries

**macOS:**
- Homebrew: `brew list --versions`
- Homebrew license: `brew info <package>` (includes license field)
- Mac App Store: `mdfind "kMDItemKind == 'Application'"`
- System Applications: `/Applications`, `/System/Applications`
- Package receipts: `/var/db/receipts`
- App Store purchases: `mas list` (requires mas-cli)
- License files: `/Library/Application Support/*/Licenses/`

**Additional Software Data:**
- **Patches/Updates:** Installed updates and hotfixes
- **Shared Libraries:** .so, .dll, .dylib files
- **Python Packages:** `pip list`, virtual environments
- **Node Modules:** `npm list -g`, package.json
- **Ruby Gems:** `gem list`
- **Java JARs:** Installed JARs and versions
- **Container Images:** Docker images
- **Browser Extensions:** Chrome, Firefox extensions

**Commercial Software License Tracking:**
- **Microsoft Products:**
  - Windows activation: `slmgr /dli`, `slmgr /xpr`
  - Office: `OSPP.VBS /dstatus`
  - SQL Server: Registry and service queries
  - Visual Studio: License files and Registry
- **Adobe Products:**
  - License files: `/Library/Application Support/Adobe/` (macOS)
  - Registry: `HKLM\SOFTWARE\Adobe` (Windows)
- **Oracle Products:**
  - Database: `SELECT * FROM V$LICENSE`
  - Java: `java -version` + installation records
- **VMware:**
  - vSphere licenses via API
  - Workstation: License files
- **AutoCAD/Autodesk:**
  - License files and network license servers
- **SAP:**
  - License info via SAP License Administration Workbench
- **IBM Products:**
  - License metric tool data
  - WebSphere, DB2 license info

**Open Source License Compliance:**
- **GPL Violations:** Track GPL software and derivative works
- **LGPL Dependencies:** Shared library usage
- **Apache/MIT:** Attribution requirements
- **Copyleft Detection:** Identify copyleft licenses
- **License Conflicts:** Detect incompatible licenses

**License Management Features:**
- **Expiry Alerts:** Warn before license expiration (30/14/7 days)
- **Compliance Checking:** Verify license count vs. installations
- **Audit Reports:** Generate license audit reports
- **Cost Tracking:** License cost per installation
- **Vendor Management:** Track license vendors and support contracts

**Collection Modes:**
- **Quick:** Package names and versions only
- **Full:** All metadata including dependencies, licenses, and activation status
- **Delta:** Package changes (installed/removed/updated)
- **License Audit:** Focus on commercial software and license compliance

**Implementation Status:** 🔨 Stub implemented, needs OS-specific logic
**Priority:** HIGH - Most valuable inventory data + license compliance

**Use Cases:**
- Software asset management (SAM)
- License compliance auditing
- Vulnerability scanning (CVE tracking)
- Cost optimization (unused licenses)
- Software standardization
- Audit preparation (Microsoft, Oracle, Adobe audits)
- Open source license compliance

**API Endpoint:** `POST /api/v1/ci` (Type: `software`)

---

### 5. Process Monitoring Collector

**Purpose:** Track running processes and resource consumption.

**Process Information:**
- **Process ID (PID):** Unique process identifier
- **Parent PID:** Parent process
- **Process Name:** Executable name
- **Command Line:** Full command with arguments
- **User/Owner:** Running user
- **Status:** Running, sleeping, stopped, zombie
- **Start Time:** When process started
- **CPU Usage:** Current CPU percentage
- **Memory Usage:** RSS, VMS memory
- **Threads:** Thread count
- **Priority/Nice:** Scheduling priority
- **Working Directory:** Current directory
- **Open Files:** File descriptors
- **Network Connections:** Sockets opened by process

**System-Wide Metrics:**
- **Total Processes:** Process count
- **Running:** Active processes
- **Sleeping:** Idle processes
- **Stopped:** Paused processes
- **Zombie:** Defunct processes
- **Load Average:** 1min, 5min, 15min

**Process Tree:**
- Parent-child relationships
- Process hierarchy
- Session and group IDs

**Collection Modes:**
- **Quick:** Process count and top 10 by CPU/memory
- **Full:** All processes with details
- **Delta:** New/terminated processes
- **Filtered:** Specific process monitoring

**Implementation Status:** ✅ Core implemented with gopsutil
**OS-Specific Extensions Needed:**
- Linux: `/proc/[pid]/*`, `ps`, `top`
- Windows: `Get-Process`, WMI `Win32_Process`
- macOS: `ps`, `top`, Activity Monitor data

**Use Cases:**
- Security monitoring (unauthorized processes)
- Resource usage tracking
- Application dependency mapping
- Performance troubleshooting

**API Endpoint:** `POST /api/v1/ci` (Type: `process`)

---

### 6. Service Discovery Collector

**Purpose:** Inventory system services and their states.

**Service Information:**
- **Service Name:** Unique service identifier
- **Display Name:** Friendly name
- **Description:** Service purpose
- **Status:** Running, stopped, starting, stopping
- **Startup Type:** Automatic, manual, disabled
- **Account:** Service account/user
- **Executable Path:** Service binary
- **PID:** Process ID if running
- **Dependencies:** Required services
- **Port Bindings:** Listening ports

**Linux - systemd:**
- Query: `systemctl list-units --type=service --all`
- Unit files: `/etc/systemd/system/`, `/lib/systemd/system/`
- Service status: `systemctl status <service>`
- Journal logs: `journalctl -u <service>`

**Linux - init.d (legacy):**
- Scripts: `/etc/init.d/`
- Query: `service --status-all`

**Windows Services:**
- Query: `Get-Service`, `sc query`
- WMI: `Win32_Service`
- Service configuration in Registry
- Service control manager database

**macOS - launchd:**
- Query: `launchctl list`
- Launch agents: `~/Library/LaunchAgents/`, `/Library/LaunchAgents/`
- Launch daemons: `/Library/LaunchDaemons/`, `/System/Library/LaunchDaemons/`

**Service Details:**
- **Restart Policies:** On-failure, always
- **Environment Variables:** Service environment
- **Working Directory:** Service execution path
- **Limits:** Memory, CPU, file descriptors
- **Security Context:** User, group, capabilities

**Collection Modes:**
- **Quick:** Service names and status only
- **Full:** All configuration details
- **Delta:** Service changes (new/removed/status change)

**Implementation Status:** 🔨 Stub implemented, needs OS-specific logic
**Priority:** HIGH - Critical for compliance and security

**API Endpoint:** `POST /api/v1/ci` (Type: `service`)

---

### 7. User & Group Collector

**Purpose:** Audit user accounts and access control.

**User Account Information:**
- **Username:** Login name
- **User ID (UID):** Numeric user ID
- **Primary Group ID (GID):** Primary group
- **Full Name/GECOS:** User description
- **Home Directory:** User home path
- **Shell:** Login shell
- **Account Status:** Active, disabled, locked
- **Password Status:** Set, expired, locked
- **Last Login:** Last login timestamp
- **Login Count:** Total logins
- **Account Expiry:** Expiration date
- **Password Expiry:** Password age and expiry

**Group Information:**
- **Group Name:** Group identifier
- **Group ID (GID):** Numeric group ID
- **Group Members:** Users in group
- **Group Type:** Local, domain, system

**Linux:**
- Files: `/etc/passwd`, `/etc/shadow`, `/etc/group`
- Commands: `getent passwd`, `getent group`
- Last login: `/var/log/lastlog`, `last`, `lastlog`
- Failed logins: `/var/log/faillog`, `/var/log/auth.log`

**Windows:**
- Local users: `Get-LocalUser`, `net user`
- Local groups: `Get-LocalGroup`, `net localgroup`
- Domain users: `Get-ADUser` (if domain-joined)
- WMI: `Win32_UserAccount`, `Win32_Group`

**macOS:**
- Commands: `dscl . -list /Users`, `dscl . -list /Groups`
- Directory Service queries
- System Preferences data

**Security Auditing:**
- **Privileged Accounts:** Root, administrators, sudo users
- **Service Accounts:** Non-interactive accounts
- **Stale Accounts:** No recent login
- **Shared Accounts:** Multiple users sharing account
- **SSH Keys:** Authorized keys for users
- **Sudo Configuration:** sudo rules and permissions

**Collection Modes:**
- **Quick:** Username, UID, status
- **Full:** All user details and login history
- **Delta:** New/removed/modified accounts

**Implementation Status:** 🔨 Stub implemented, needs OS-specific logic
**Priority:** HIGH - Security and compliance requirement

**API Endpoint:** `POST /api/v1/ci` (Type: `user`)

---

### 8. Certificate Inventory Collector

**Purpose:** Track SSL/TLS certificates and expiration.

**Certificate Information:**
- **Subject:** Certificate subject DN
- **Issuer:** Certificate authority
- **Serial Number:** Unique certificate serial
- **Not Before:** Validity start date
- **Not After:** Expiration date
- **Days Until Expiry:** Remaining validity
- **Signature Algorithm:** RSA, ECDSA
- **Key Size:** 2048-bit, 4096-bit
- **Public Key:** Public key data
- **Fingerprints:** SHA1, SHA256 thumbprints
- **Subject Alternative Names:** SAN entries
- **Key Usage:** Usage extensions
- **Certificate Chain:** Full chain
- **Location:** File path or store

**Certificate Sources:**

**Linux:**
- System store: `/etc/ssl/certs/`, `/etc/pki/tls/certs/`
- Application configs: `/etc/nginx/ssl/`, `/etc/apache2/ssl/`
- User certificates: `~/.ssh/`, `~/.certs/`

**Windows:**
- Certificate stores: Personal, Trusted Root, Intermediate
- PowerShell: `Get-ChildItem Cert:\LocalMachine\My`
- IIS bindings
- Service certificates

**macOS:**
- Keychain: `security find-certificate`
- System Keychain: `/Library/Keychains/System.keychain`
- User Keychain: `~/Library/Keychains/`

**Certificate Validation:**
- Chain validation
- Revocation checking (CRL, OCSP)
- Expiry warnings (30, 14, 7 days)
- Weak algorithm detection
- Self-signed detection

**Use Cases:**
- Certificate expiration monitoring
- Compliance auditing (key sizes, algorithms)
- Security vulnerability detection
- Certificate inventory for renewal

**Collection Modes:**
- **Quick:** Certificate count and near-expiry
- **Full:** All certificates with details
- **Delta:** New/expired/removed certificates

**Implementation Status:** 🔨 Stub implemented, needs certificate parsing
**Priority:** MEDIUM - Important for security

**API Endpoint:** `POST /api/v1/ci` (Type: `certificate`)

---

## Collection Framework

### Collector Interface

```go
type Collector interface {
    Collect(mode CollectionMode) (map[string]any, error)
    Name() string
    Type() string
}

type CollectionMode string
const (
    ModeQuick CollectionMode = "quick"
    ModeFull  CollectionMode = "full"
    ModeDelta CollectionMode = "delta"
)
```

### Collection Scheduling

- **Configurable per collector:** Different intervals for different data types
- **Cron-based:** Flexible scheduling (every 30s, hourly, daily)
- **Manual trigger:** On-demand collection via CLI
- **Event-driven:** Triggered by system events (planned)

### Data Flow

```
Collector → JSON → Queue → Transport → CMDB Backend
              ↓
         Local Cache
         (for delta)
```

### Performance Considerations

- **Parallel collection:** Collectors run independently
- **Resource throttling:** CPU and memory limits
- **Batch processing:** Queue batching for efficiency
- **Incremental collection:** Delta mode reduces data volume
- **Caching:** Avoid redundant system calls

---

## Implementation Priority

| Collector | Status | Priority | Reason |
|-----------|--------|----------|--------|
| System | ✅ Done | HIGH | Core identity |
| Hardware | ✅ Done | HIGH | Asset tracking |
| Network | ✅ Done | HIGH | Connectivity |
| Software | 🔨 Partial | **CRITICAL** | Most valuable for compliance |
| Process | ✅ Done | MEDIUM | Performance monitoring |
| Service | 🔨 Partial | **HIGH** | Security and compliance |
| User | 🔨 Partial | **HIGH** | Security auditing |
| Certificate | 🔨 Partial | MEDIUM | Expiration tracking |

---

## Next Steps for Enhancement

1. **Implement OS-specific package collectors** (Linux dpkg/rpm first)
2. **Add service enumeration** (systemd, Windows Service)
3. **Implement user account auditing**
4. **Add certificate scanning and parsing**
5. **Create delta collection logic** (track changes between runs)
6. **Add filtering and exclusion rules** (skip certain packages/processes)
7. **Implement custom collectors** (plugin system)
8. **Add collection metrics** (timing, success rates)

