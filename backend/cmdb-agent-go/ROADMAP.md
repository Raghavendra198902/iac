# CMDB Agent Roadmap

## Version 1.0.0 - ✅ COMPLETE (December 3, 2024)

### Core Features Delivered
- [x] Cross-platform agent (Windows, Linux, macOS)
- [x] Multi-architecture support (x64, ARM64)
- [x] Hardware inventory collection
- [x] Network configuration discovery
- [x] Built-in Web UI dashboard
- [x] RESTful API
- [x] Configuration management
- [x] Automated installers for all platforms
- [x] Service integration (Windows Service, systemd, LaunchDaemon)
- [x] CLI tools
- [x] MSI installer builder (Windows)

### Distribution Packages
- [x] Windows x64 ZIP with MSI builder
- [x] Linux AMD64 tar.gz
- [x] Linux ARM64 tar.gz
- [x] macOS Intel tar.gz
- [x] macOS Apple Silicon tar.gz

---

## Version 1.1.0 - Software Inventory Enhancement (Planned)

### Priority: High
**Target:** Q1 2025

### Features
- [ ] **Linux Package Manager Integration**
  - Implement dpkg package listing (Debian/Ubuntu)
  - Implement rpm package listing (RHEL/CentOS/Fedora)
  - Support for Snap/Flatpak packages
  - AppImage detection

- [ ] **Windows Software Detection**
  - Windows Registry scanning (Uninstall keys)
  - WMI Win32_Product queries
  - Microsoft Store apps detection
  - Portable software detection

- [ ] **macOS Application Listing**
  - Applications folder scanning
  - Homebrew package detection
  - Mac App Store apps
  - PKG installation tracking

### Technical Tasks
- Update `internal/collectors/software.go`
- Add OS-specific package managers
- Implement caching for performance
- Add software version tracking

---

## Version 1.2.0 - Service & Certificate Management (Planned)

### Priority: High
**Target:** Q1 2025

### Features
- [ ] **Service Discovery**
  - systemd services (Linux)
  - Windows services enumeration
  - launchd/LaunchDaemons (macOS)
  - Service status monitoring
  - Startup configuration tracking

- [ ] **User & Group Management**
  - Local user enumeration
  - Group membership tracking
  - Permission auditing
  - Last login tracking

- [ ] **Certificate Scanning**
  - SSL/TLS certificate discovery
  - Common certificate store locations
  - Expiration tracking
  - Certificate chain validation
  - Private key detection

### Technical Tasks
- Update `internal/collectors/services.go`
- Add platform-specific service APIs
- Implement certificate parsing
- Add expiration alerts

---

## Version 1.3.0 - Policy Enforcement Engine (Planned)

### Priority: Medium
**Target:** Q2 2025

### Features
- [ ] **Policy Condition Evaluation**
  - Resource-based conditions
  - Time-based conditions
  - Compliance checking
  - Custom rule engine

- [ ] **Action Execution**
  - Service control (start/stop/restart)
  - Process termination
  - Configuration enforcement
  - Automated remediation

- [ ] **Compliance Reporting**
  - Policy violation detection
  - Audit trail generation
  - Real-time alerts
  - Historical compliance tracking

### Technical Tasks
- Complete `internal/enforcement/engine.go`
- Implement condition parser
- Add action executors
- Build policy DSL

---

## Version 1.4.0 - Deployment Automation (Planned)

### Priority: Medium
**Target:** Q2 2025

### Features
- [ ] **Remote Deployment Management**
  - Fetch deployments from CMDB backend
  - Multi-step deployment execution
  - Rollback capabilities
  - Deployment scheduling

- [ ] **Health Checks**
  - Pre-deployment validation
  - Post-deployment verification
  - Service health monitoring
  - Automated recovery

- [ ] **Status Reporting**
  - Real-time deployment status
  - Progress tracking
  - Failure notifications
  - Success metrics

### Technical Tasks
- Complete `internal/deployment/manager.go`
- Add CMDB backend integration
- Implement rollback logic
- Add deployment templates

---

## Version 1.5.0 - Enhanced Web UI (Planned)

### Priority: Low
**Target:** Q3 2025

### Features
- [ ] **Dashboard Improvements**
  - Real uptime tracking
  - Performance metrics
  - Resource utilization graphs
  - Historical data visualization

- [ ] **System Details**
  - Actual hardware data display
  - Real-time system stats
  - Interactive inventory browser
  - Export capabilities

- [ ] **Configuration Editor**
  - Live config editing
  - Validation
  - Hot-reload support
  - Configuration templates

### Technical Tasks
- Update `internal/webui/server.go`
- Replace TODO placeholders
- Add real data integration
- Implement WebSocket for real-time updates

---

## Version 2.0.0 - Enterprise Features (Future)

### Priority: Low
**Target:** Q4 2025

### Features
- [ ] **High Availability**
  - Agent clustering
  - Failover support
  - Load balancing
  - Distributed configuration

- [ ] **Advanced Security**
  - mTLS with certificate rotation
  - OAuth2 integration
  - RBAC for Web UI
  - Audit logging

- [ ] **Container Support**
  - Docker container discovery
  - Kubernetes pod tracking
  - Container orchestration integration
  - Image inventory

- [ ] **Cloud Integration**
  - AWS metadata collection
  - Azure VM insights
  - GCP instance details
  - Multi-cloud support

- [ ] **Plugin System**
  - Custom collector plugins
  - Third-party integrations
  - Scripted collectors
  - Community plugins

---

## Build & Distribution Improvements

### Short-term (Q1 2025)
- [ ] Set up GitHub Actions CI/CD
- [ ] Automated multi-platform builds
- [ ] Signed binaries (code signing)
- [ ] DEB package generation
- [ ] RPM package generation
- [ ] Homebrew formula
- [ ] Chocolatey package (Windows)

### Long-term (Q2-Q3 2025)
- [ ] Auto-update mechanism
- [ ] Delta updates
- [ ] Mirror/CDN distribution
- [ ] Package verification
- [ ] Release channels (stable/beta/dev)

---

## Performance & Optimization

### Ongoing
- [ ] Memory usage optimization
- [ ] CPU usage profiling
- [ ] Disk I/O reduction
- [ ] Network traffic optimization
- [ ] Battery efficiency (laptops)
- [ ] Background task scheduling

---

## Documentation

### Short-term
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Developer guide
- [ ] Contribution guidelines
- [ ] Architecture documentation
- [ ] Security best practices

### Long-term
- [ ] Video tutorials
- [ ] Community wiki
- [ ] Use case examples
- [ ] Troubleshooting guide
- [ ] FAQ

---

## Testing & Quality

### Ongoing
- [ ] Unit test coverage >80%
- [ ] Integration tests
- [ ] E2E tests for all platforms
- [ ] Performance benchmarks
- [ ] Security audits
- [ ] Penetration testing

---

## Community & Support

### Future
- [ ] Community forum
- [ ] Discord/Slack channel
- [ ] Issue templates
- [ ] Feature request process
- [ ] Regular release schedule
- [ ] Changelog automation

---

## Current TODO Items from Code

### High Priority
1. Track actual uptime in agent (`internal/agent/agent.go:280`)
2. Implement software package listing (`internal/collectors/software.go:51,59,67`)
3. Implement service discovery (`internal/collectors/services.go:27`)

### Medium Priority
4. Policy condition evaluation (`internal/enforcement/engine.go:107,122`)
5. CMDB backend integration (`internal/enforcement/engine.go:156`)
6. Deployment fetching (`internal/deployment/manager.go:93`)

### Low Priority
7. Web UI data integration (`internal/webui/server.go:242,271,285,465,492,557,591`)
8. Configuration API (`internal/webui/server.go:591`)

---

## Contributing

Want to help? Check out:
1. [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
2. [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup
3. [GitHub Issues](https://github.com/Raghavendra198902/iac/issues) - Current tasks

---

## Version History

- **v1.0.0** (Dec 3, 2024) - Initial release
  - Multi-platform support
  - Basic inventory collection
  - Web UI dashboard
  - Automated installers

---

*This roadmap is subject to change based on community feedback and priorities.*
