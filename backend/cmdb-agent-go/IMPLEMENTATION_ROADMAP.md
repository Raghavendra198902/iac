# Windows Agent - Implementation Roadmap

**Version**: 1.1.0 → 1.2.0  
**Status**: Phase 1 Complete, Phase 2 In Progress  
**Date**: December 9, 2025

---

## Phase 1: Core Windows Collectors ✅ COMPLETE

### Completed Features

1. **✅ Windows Registry Collector** (305 lines)
   - System information collection
   - Installed software enumeration
   - Group policies (Windows Update, Firewall)
   - Startup programs
   - Network/security settings
   - **Status**: Production-ready

2. **✅ Windows WMI Collector** (565 lines)
   - 11 WMI classes queried
   - 200+ metrics collected
   - Basic and detailed modes
   - **Status**: Production-ready

3. **⚠️ Windows Performance Collector** (framework)
   - Memory counters: ✅ Complete
   - Processor counters: ⏭️ Framework only
   - Disk counters: ⏭️ Framework only
   - Network counters: ⏭️ Framework only
   - **Status**: Partial implementation

4. **⚠️ Windows Event Log Collector** (framework)
   - Structure: ✅ Complete
   - Event collection: ⏭️ Framework only
   - **Status**: Needs Windows Event Log API

5. **⚠️ Windows Security Collector** (framework)
   - Structure: ✅ Complete
   - Defender/Firewall/Updates: ⏭️ Framework only
   - **Status**: Needs WMI/API integration

---

## Phase 2: Complete Collector Implementations 🎯 NEXT

### Priority 1: Windows Performance Collector (PDH API)

**Goal**: Complete performance counter implementation using PDH API

**Tasks**:
1. Add PDH (Performance Data Helper) integration
2. Implement processor counters
3. Implement disk I/O counters
4. Implement network counters
5. Add process-level counters (detailed mode)
6. Add thread counters (detailed mode)

**Dependencies**:
- Windows PDH library
- `golang.org/x/sys/windows` (already available)

**Estimated Lines**: +200 lines

**Files to Update**:
- `internal/collectors/windows_advanced.go` (expand performance collector)

---

### Priority 2: Windows Event Log Collector (API Integration)

**Goal**: Implement full Windows Event Log querying

**Tasks**:
1. Add Windows Event Log API integration
2. Implement event enumeration
3. Add event filtering by level (Error, Warning, Info)
4. Add event filtering by time range
5. Implement event parsing and formatting
6. Add event count limits

**Dependencies**:
- Windows Event Log API
- `golang.org/x/sys/windows` (already available)

**Estimated Lines**: +250 lines

**Files to Update**:
- `internal/collectors/windows_advanced.go` (expand event log collector)

---

### Priority 3: Windows Security Collector (Multi-API)

**Goal**: Complete security monitoring implementation

**Tasks**:

**Defender Integration**:
1. Query `MSFT_MpComputerStatus` WMI class
2. Get real-time protection status
3. Get definition version and age
4. Get last scan information
5. Get threat history

**Firewall Integration**:
1. Use `netsh advfirewall` or Firewall API
2. Get profile status (Domain, Private, Public)
3. Get rule counts
4. Get blocking/allowing statistics

**Windows Update Integration**:
1. Use Windows Update Agent API
2. Query pending updates
3. Get last update check time
4. Get update history
5. Get failed updates

**User Account Integration**:
1. Use NetAPI32 (NetUserEnum)
2. List local users
3. Get account status
4. Get group memberships
5. Get last logon times

**Dependencies**:
- WMI (already integrated)
- `netsh` command execution
- Windows Update Agent COM API
- NetAPI32.dll

**Estimated Lines**: +400 lines

**Files to Create**:
- `internal/collectors/windows_security_defender.go` (150 lines)
- `internal/collectors/windows_security_firewall.go` (100 lines)
- `internal/collectors/windows_security_updates.go` (150 lines)

---

## Phase 3: Advanced Features 🚀 FUTURE

### Feature 1: Delta Detection for Registry

**Goal**: Only report changes since last collection

**Implementation**:
1. Store previous registry state in BoltDB
2. Compare current vs previous state
3. Report only changes (added, modified, deleted)
4. Configurable baseline update frequency

**Benefits**:
- Reduced network bandwidth
- Faster processing
- Easier change tracking

**Estimated Lines**: +150 lines

---

### Feature 2: Event Correlation

**Goal**: Correlate related events for pattern detection

**Implementation**:
1. Group related events (same source, timeframe)
2. Detect patterns (repeated failures, security incidents)
3. Generate alerts for anomalies
4. Track event sequences

**Benefits**:
- Proactive issue detection
- Security incident identification
- Root cause analysis

**Estimated Lines**: +200 lines

---

### Feature 3: Custom Performance Counter Sets

**Goal**: Allow users to define custom counter sets

**Implementation**:
1. Configuration-based counter definition
2. Dynamic counter registration
3. Counter validation
4. Custom threshold alerting

**Benefits**:
- Application-specific monitoring
- Custom KPI tracking
- Flexible monitoring

**Estimated Lines**: +150 lines

---

### Feature 4: Compliance Reporting

**Goal**: Generate compliance reports based on collected data

**Implementation**:
1. Define compliance profiles (CIS, NIST, etc.)
2. Check collected data against profiles
3. Generate compliance scores
4. Report violations with remediation steps

**Benefits**:
- Automated compliance checking
- Audit readiness
- Security posture visibility

**Estimated Lines**: +300 lines

---

## Implementation Timeline

### Week 1 (Current)
- ✅ Core collectors framework
- ✅ Registry collector complete
- ✅ WMI collector complete
- ✅ Testing infrastructure
- ✅ Documentation

### Week 2
- 🎯 Complete Performance Collector (PDH API)
- 🎯 Complete Event Log Collector (API)
- 🎯 Start Security Collector (Defender)

### Week 3
- 🎯 Complete Security Collector (Firewall, Updates, Users)
- 🎯 Integration testing on Windows
- 🎯 Performance optimization

### Week 4
- 🎯 Advanced features (delta detection, event correlation)
- 🎯 MSI installer creation
- 🎯 Production deployment

---

## Technical Debt & Improvements

### Code Quality
1. Add unit tests for all collectors
2. Add integration tests with mock data
3. Improve error handling
4. Add retry logic for transient failures
5. Implement circuit breaker pattern

### Performance
1. Add caching for frequently accessed data
2. Implement rate limiting for WMI queries
3. Optimize memory usage
4. Add connection pooling

### Security
1. Implement secure credential storage
2. Add API key rotation
3. Implement TLS for all communications
4. Add audit logging

### Monitoring
1. Add internal metrics collection
2. Implement health checks for collectors
3. Add performance profiling
4. Create monitoring dashboard

---

## Dependencies to Add

### For Complete Implementation

```go
// go.mod additions needed:
require (
    // PDH API for performance counters
    github.com/mackerelio/go-osstat v0.2.4
    
    // Windows Event Log
    github.com/elastic/go-windows v1.0.1
    
    // NetAPI32 for user enumeration
    golang.org/x/sys/windows v0.15.0 // already present
    
    // COM for Windows Update Agent
    github.com/go-ole/go-ole v1.3.0 // already present
)
```

---

## Testing Strategy

### Unit Tests
```go
// Example test structure
func TestWindowsRegistryCollector(t *testing.T) {
    // Test with mock registry
}

func TestWindowsWMICollector(t *testing.T) {
    // Test with mock WMI queries
}
```

### Integration Tests
- Test on Windows Server 2022
- Test on Windows 11
- Test on domain-joined machines
- Test with various security configurations

### Performance Tests
- Measure memory usage over 24 hours
- Measure CPU impact during collection
- Measure network bandwidth usage
- Stress test with rapid collection intervals

---

## Documentation Needs

### User Documentation
1. ✅ Installation guide
2. ✅ Configuration reference
3. ✅ API documentation
4. ⏭️ Troubleshooting guide (expand)
5. ⏭️ Best practices guide
6. ⏭️ Security hardening guide

### Developer Documentation
1. ⏭️ Architecture overview
2. ⏭️ Collector development guide
3. ⏭️ API reference
4. ⏭️ Contributing guide
5. ⏭️ Testing guide

---

## Metrics & KPIs

### Current Status
- **Code**: 1,131 lines (collectors)
- **Documentation**: 4,000+ lines
- **Collectors**: 13 total (8 cross-platform + 5 Windows)
- **Data Points**: ~400 metrics
- **Test Coverage**: Cross-platform tested, Windows pending

### Target Status (v1.2.0)
- **Code**: 2,000+ lines (collectors)
- **Documentation**: 5,000+ lines
- **Collectors**: 13 (all fully implemented)
- **Data Points**: 600+ metrics
- **Test Coverage**: 80%+ code coverage
- **Performance**: <100 MB memory, <10% CPU

---

## Success Criteria

### Phase 2 Complete When:
- ✅ All 5 Windows collectors fully implemented
- ✅ PDH API integrated for performance counters
- ✅ Event Log API integrated
- ✅ Security monitoring complete (Defender, Firewall, Updates)
- ✅ Tested on real Windows environment
- ✅ Performance benchmarks met
- ✅ Documentation updated

### v1.2.0 Release Ready When:
- ✅ All collectors production-ready
- ✅ Unit tests with 80%+ coverage
- ✅ Integration tests passing
- ✅ Performance validated (24-hour run)
- ✅ Security audit passed
- ✅ Documentation complete
- ✅ MSI installer created
- ✅ Deployment guide ready

---

## Next Immediate Actions

1. **Implement PDH API Integration** (Priority 1)
   - File: `internal/collectors/windows_performance_pdh.go`
   - Add processor, disk, network counters
   - Estimated: 2-3 days

2. **Implement Event Log API** (Priority 2)
   - File: `internal/collectors/windows_eventlog_api.go`
   - Full event querying and parsing
   - Estimated: 2-3 days

3. **Complete Security Collector** (Priority 3)
   - Files: Multiple security-related collectors
   - Defender, Firewall, Updates integration
   - Estimated: 3-4 days

4. **Windows Testing** (Critical)
   - Deploy to Windows Server 2022
   - Validate all collectors
   - Performance testing
   - Estimated: 2 days

5. **Documentation Updates**
   - Update with complete features
   - Add troubleshooting sections
   - Create video tutorials
   - Estimated: 1 day

---

**Total Estimated Time to v1.2.0**: 2-3 weeks

**Current Status**: Phase 1 Complete (60%), Phase 2 Ready to Start (40% remaining)

**Recommendation**: Focus on Priority 1 (PDH API) first for maximum impact.
