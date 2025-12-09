# Windows Agent - Policy Enforcement Features

**Version**: 1.5.0  
**Status**: Production-Ready  
**Date**: December 9, 2025

---

## 🛡️ Overview

The Windows Agent v1.5.0 now includes **automated policy enforcement** capabilities to ensure Windows systems comply with security policies and best practices. The agent can detect violations and automatically remediate them.

---

## ✨ Key Features

### 1. **Security Policy Enforcement**
- Guest account disabled
- User Account Control (UAC) enabled
- Remote Desktop NLA (Network Level Authentication) required
- Secure RDP configuration

### 2. **Firewall Policy Enforcement**
- Windows Firewall enabled for all profiles (Domain, Public, Private)
- Automatic firewall activation when disabled
- Profile-specific enforcement

### 3. **Windows Defender Policy Enforcement**
- Real-time protection enabled
- Cloud-based protection enabled
- Signature freshness (updated within 7 days)
- Automatic signature updates

### 4. **Windows Update Policy Enforcement**
- Automatic updates enabled
- Update settings compliance

### 5. **Service Policy Enforcement**
- Critical services running (Defender, Firewall, Event Log, Crypto Services)
- Unnecessary services disabled (Remote Registry, Telnet)
- Service state monitoring

### 6. **Password Policy Enforcement**
- Minimum password length (12+ characters)
- Password complexity requirements enabled
- Account lockout policies

---

## 📊 Enforcement Modes

### 1. **Audit Mode** (Default for initial deployment)
```yaml
enforcement_mode: audit
```
- **Behavior**: Detect violations only, no remediation
- **Use Case**: Assessment and reporting
- **Output**: List of violations with severity levels

### 2. **Enforce Mode** (Production mode)
```yaml
enforcement_mode: enforce
```
- **Behavior**: Detect violations and automatically remediate critical/high severity issues
- **Use Case**: Continuous compliance
- **Output**: Violations + Remediation actions taken

### 3. **Disabled Mode**
```yaml
enforcement_mode: disabled
```
- **Behavior**: No policy checking or enforcement
- **Use Case**: Troubleshooting or performance testing

---

## 🔍 Policy Checks

### Security Policies (3 checks)

#### SEC-001: Guest Account Disabled
- **Severity**: High
- **Check**: `net user Guest`
- **Expected**: Account disabled
- **Remediation**: `net user Guest /active:no`

#### SEC-002: UAC Enabled
- **Severity**: Critical
- **Check**: Registry `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System\EnableLUA`
- **Expected**: Value = 1
- **Remediation**: Set registry value to 1

#### SEC-003: RDP NLA Required
- **Severity**: High
- **Check**: Registry `HKLM\SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp\UserAuthentication`
- **Expected**: Value = 1 (if RDP enabled)
- **Remediation**: Set registry value to 1

### Firewall Policies (3 checks)

#### FW-001-domainprofile: Domain Firewall Enabled
- **Severity**: Critical
- **Check**: `netsh advfirewall show domainprofile state`
- **Expected**: State ON
- **Remediation**: `netsh advfirewall set domainprofile state on`

#### FW-001-publicprofile: Public Firewall Enabled
- **Severity**: Critical
- **Check**: `netsh advfirewall show publicprofile state`
- **Expected**: State ON
- **Remediation**: `netsh advfirewall set publicprofile state on`

#### FW-001-privateprofile: Private Firewall Enabled
- **Severity**: Critical
- **Check**: `netsh advfirewall show privateprofile state`
- **Expected**: State ON
- **Remediation**: `netsh advfirewall set privateprofile state on`

### Windows Defender Policies (3 checks)

#### DEF-001: Real-Time Protection Enabled
- **Severity**: Critical
- **Check**: `Get-MpPreference | Select-Object -ExpandProperty DisableRealtimeMonitoring`
- **Expected**: False
- **Remediation**: `Set-MpPreference -DisableRealtimeMonitoring $false`

#### DEF-002: Cloud Protection Enabled
- **Severity**: High
- **Check**: `Get-MpPreference | Select-Object -ExpandProperty MAPSReporting`
- **Expected**: Advanced (2)
- **Remediation**: `Set-MpPreference -MAPSReporting Advanced`

#### DEF-003: Signature Freshness
- **Severity**: Medium
- **Check**: `(Get-MpComputerStatus).AntivirusSignatureAge`
- **Expected**: Less than 7 days
- **Remediation**: `Update-MpSignature`

### Windows Update Policies (1 check)

#### UPD-001: Automatic Updates Enabled
- **Severity**: High
- **Check**: Registry `HKLM\SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU\NoAutoUpdate`
- **Expected**: Value = 0 or not present
- **Remediation**: Delete registry value or set to 0

### Service Policies (8+ checks)

#### SVC-001-*: Critical Services Running
- **Severity**: High
- **Services**: WinDefend, mpssvc, EventLog, CryptSvc, Dhcp, Dnscache
- **Expected**: Running
- **Remediation**: `sc start <service>`

#### SVC-002-*: Unnecessary Services Stopped
- **Severity**: Medium
- **Services**: RemoteRegistry, TlntSvr (Telnet)
- **Expected**: Stopped/Disabled
- **Remediation**: `sc stop <service>` + `sc config <service> start=disabled`

### Password Policies (2 checks)

#### PWD-001: Minimum Password Length
- **Severity**: High
- **Check**: `net accounts`
- **Expected**: 12+ characters
- **Remediation**: `net accounts /minpwlen:12`

#### PWD-002: Password Complexity Required
- **Severity**: Critical
- **Check**: `net accounts`
- **Expected**: Complexity enabled
- **Remediation**: Group Policy or local security policy update

---

## 📈 Compliance Scoring

The agent calculates a **compliance score** based on policy checks:

```
Compliance Score = (Policies Checked - Violations Found) / Policies Checked × 100
```

**Example**:
- Policies Checked: 25
- Violations Found: 3
- **Compliance Score**: 88%

### Severity Levels

- **Critical**: Immediate security risk, auto-remediated in enforce mode
- **High**: Significant security concern, auto-remediated in enforce mode
- **Medium**: Important but not urgent, logged for review
- **Low**: Best practice recommendation, logged for review

---

## 🔧 Configuration

### Enable Enforcement Collector

**config.yaml**:
```yaml
collectors:
  windows_enforcement:
    enabled: true
    interval: 3600  # Run every hour
    mode: enforce   # audit, enforce, disabled
```

### API Endpoint

**GET** `/api/v1/enforcement`

**Response**:
```json
{
  "collector": "windows_enforcement",
  "timestamp": "2025-12-09T10:30:00Z",
  "mode": "basic",
  "enforcement_mode": "enforce",
  "policies_checked": 25,
  "violations_found": 3,
  "remediations_applied": 2,
  "compliance_score": 88.0,
  "violations": [
    {
      "policy_id": "DEF-003",
      "policy_name": "Defender Signature Freshness",
      "severity": "medium",
      "description": "Windows Defender signatures should be updated regularly",
      "current_value": "8 days old",
      "expected_value": "Less than 7 days",
      "detected_at": "2025-12-09T10:30:00Z",
      "status": "detected"
    }
  ],
  "remediations": [
    {
      "action_id": "REM-DEF-001-1733744400",
      "policy_id": "DEF-001",
      "action_type": "enable_feature",
      "description": "Enabling Windows Defender Real-Time Protection",
      "executed_at": "2025-12-09T10:30:01Z",
      "success": true,
      "error_msg": ""
    }
  ]
}
```

---

## 🚀 Deployment Scenarios

### Scenario 1: Initial Assessment (Audit Mode)

**Goal**: Assess current compliance state without making changes

```yaml
collectors:
  windows_enforcement:
    enabled: true
    mode: audit
```

**Actions**:
1. Deploy agent with audit mode
2. Review violations report
3. Plan remediation strategy
4. Switch to enforce mode

### Scenario 2: Continuous Compliance (Enforce Mode)

**Goal**: Maintain continuous compliance with automatic remediation

```yaml
collectors:
  windows_enforcement:
    enabled: true
    mode: enforce
    interval: 3600  # Check every hour
```

**Actions**:
1. Agent runs hourly checks
2. Detects violations
3. Automatically remediates critical/high severity issues
4. Logs all actions
5. Alerts on remediation failures

### Scenario 3: Compliance Reporting

**Goal**: Generate compliance reports for audits

```bash
# Query enforcement API
curl http://localhost:8080/api/v1/enforcement

# Generate report
python scripts/generate_compliance_report.py --format pdf --output compliance-report.pdf
```

---

## 📊 Metrics & Monitoring

### Key Metrics

1. **Compliance Score**: Overall compliance percentage
2. **Violations Count**: Total policy violations
3. **Critical Violations**: High-priority issues
4. **Remediation Success Rate**: Percentage of successful auto-remediations
5. **Time to Remediation**: Average time from detection to fix

### Grafana Dashboard

Create a compliance dashboard:

```promql
# Compliance Score
cmdb_enforcement_compliance_score{instance="hostname"}

# Violations by Severity
sum by (severity) (cmdb_enforcement_violations_total)

# Remediation Success Rate
rate(cmdb_enforcement_remediations_success[1h]) / rate(cmdb_enforcement_remediations_total[1h]) * 100
```

---

## 🔐 Security Considerations

### Permissions Required

The enforcement collector requires **Administrator privileges**:
- Service control (start/stop services)
- Registry write access
- Security policy management
- PowerShell execution

### Audit Trail

All enforcement actions are logged:
- **What**: Policy violation and remediation action
- **When**: Timestamp of detection and remediation
- **Why**: Policy ID and description
- **Outcome**: Success or failure with error details

### Rollback

If automatic remediation causes issues:

```powershell
# Disable enforcement
Stop-Service "CMDB Agent"
# Edit config.yaml, set mode: audit
Start-Service "CMDB Agent"
```

---

## 🧪 Testing

### Test Enforcement Policies

```powershell
# 1. Disable Windows Defender (for testing)
Set-MpPreference -DisableRealtimeMonitoring $true

# 2. Run agent
.\cmdb-agent.exe --config=config.yaml

# 3. Check API response
curl http://localhost:8080/api/v1/enforcement

# 4. Verify remediation
Get-MpPreference | Select-Object DisableRealtimeMonitoring
# Should show: DisableRealtimeMonitoring: False
```

### Test Scenarios

**Test 1: UAC Disabled**
```powershell
# Disable UAC
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v EnableLUA /t REG_DWORD /d 0 /f

# Wait for agent to detect and remediate
Start-Sleep -Seconds 10

# Verify remediation
reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\System" /v EnableLUA
# Should show: EnableLUA REG_DWORD 0x1
```

**Test 2: Firewall Disabled**
```powershell
# Disable firewall
netsh advfirewall set allprofiles state off

# Wait for agent
Start-Sleep -Seconds 10

# Verify
netsh advfirewall show allprofiles state
# Should show: State ON for all profiles
```

---

## 📚 Best Practices

### 1. Start with Audit Mode
Always deploy in audit mode first to understand the current state before enabling automatic remediation.

### 2. Monitor Remediation Actions
Set up alerts for remediation failures:
```yaml
alerts:
  - name: EnforcementFailure
    condition: remediations_failed > 0
    severity: high
    notify: security-team@company.com
```

### 3. Schedule Regular Reports
Generate weekly compliance reports:
```bash
# Cron job
0 9 * * MON /usr/local/bin/generate-compliance-report.sh
```

### 4. Document Exceptions
If certain policies don't apply, document why:
```yaml
enforcement:
  exceptions:
    - policy_id: SEC-003
      reason: "RDP not used in this environment"
      approved_by: "Security Team"
      approval_date: "2025-12-01"
```

---

## 🎯 Roadmap

### v1.6.0 - Advanced Enforcement
- [ ] Custom policy definitions (YAML-based)
- [ ] Policy templates (CIS, NIST, PCI-DSS)
- [ ] Scheduled enforcement windows
- [ ] Dry-run mode (simulate remediation)
- [ ] Policy exceptions management

### v1.7.0 - Integration
- [ ] SIEM integration (Splunk, ELK)
- [ ] ServiceNow incident creation
- [ ] Slack/Teams notifications
- [ ] Email reports

### v1.8.0 - Advanced Features
- [ ] Machine learning-based anomaly detection
- [ ] Predictive compliance scoring
- [ ] Automated policy recommendations
- [ ] Compliance as Code integration

---

## 📞 Support

For questions or issues:
- **Documentation**: See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md)
- **GitHub Issues**: https://github.com/your-org/cmdb-agent/issues
- **Email**: support@yourcompany.com

---

**Generated by**: IAC Dharma Platform - Windows Agent Team  
**Version**: 1.5.0  
**Last Updated**: December 9, 2025
