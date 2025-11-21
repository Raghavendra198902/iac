# Compliance and Governance

Comprehensive guide to maintaining regulatory compliance and implementing governance policies in IAC Dharma.

---

## 📋 Overview

IAC Dharma provides enterprise-grade compliance and governance capabilities:

- **Multi-Framework Support**: HIPAA, PCI-DSS, SOC 2, GDPR, CIS Benchmarks
- **Policy as Code**: Define and enforce policies programmatically
- **Continuous Compliance**: Automated scanning and remediation
- **Audit Trail**: Comprehensive logging of all operations
- **Compliance Reporting**: Generate compliance reports on-demand

---

## 🎯 Supported Compliance Frameworks

### 1. HIPAA (Healthcare)

**Health Insurance Portability and Accountability Act**

**Key Requirements**:
- Encryption at rest and in transit
- Access controls and authentication
- Audit logging
- Breach notification
- Business Associate Agreements (BAA)

**IAC Dharma Implementation**:
```yaml
compliance:
  hipaa:
    enabled: true
    controls:
      encryption:
        at_rest: required
        in_transit: required
        algorithm: AES-256
      
      access_control:
        mfa: required
        password_policy:
          min_length: 12
          complexity: high
          rotation_days: 90
      
      audit_logging:
        retention_days: 2555  # 7 years
        immutable: true
        encryption: true
      
      phi_handling:
        data_classification: enabled
        dlp_scanning: enabled
        anonymization: required
```

**Automated Checks**:
- ✅ All databases encrypted with AES-256
- ✅ TLS 1.3 enforced for all connections
- ✅ MFA enabled for all users
- ✅ Audit logs retained for 7 years
- ✅ Access logs reviewed monthly
- ✅ Security patches applied within 30 days

### 2. PCI-DSS (Payment Card Industry)

**Payment Card Industry Data Security Standard**

**Key Requirements**:
- Secure network architecture
- Protect cardholder data
- Vulnerability management
- Access control measures
- Regular testing
- Information security policy

**IAC Dharma Implementation**:
```yaml
compliance:
  pci_dss:
    enabled: true
    level: 1  # Merchant level (1-4)
    
    network_security:
      firewall: required
      default_deny: true
      dmz: required
      network_segmentation: true
    
    data_protection:
      cardholder_data_encryption: required
      key_management: hsm  # Hardware Security Module
      data_retention:
        max_days: 90  # Minimize retention
        secure_deletion: required
    
    vulnerability_management:
      antivirus: required
      patch_management:
        critical: 30_days
        high: 90_days
      vulnerability_scanning:
        frequency: quarterly
        approved_vendor: required
    
    access_control:
      unique_ids: required
      physical_access: restricted
      logging: comprehensive
    
    monitoring:
      log_review: daily
      file_integrity_monitoring: enabled
      intrusion_detection: enabled
    
    testing:
      penetration_testing: quarterly
      security_testing: required
```

**PCI-DSS Compliance Dashboard**:
```bash
# Check PCI-DSS compliance status
curl http://localhost:3007/api/compliance/pci-dss/status

# Response
{
  "compliant": true,
  "level": 1,
  "requirements": {
    "req1_firewall": "compliant",
    "req2_defaults": "compliant",
    "req3_data_protection": "compliant",
    "req4_encryption": "compliant",
    "req5_antivirus": "compliant",
    "req6_secure_systems": "compliant",
    "req7_access_control": "compliant",
    "req8_authentication": "compliant",
    "req9_physical_access": "compliant",
    "req10_monitoring": "compliant",
    "req11_testing": "compliant",
    "req12_policy": "compliant"
  },
  "last_audit": "2025-11-01",
  "next_audit": "2025-12-01"
}
```

### 3. SOC 2 (Service Organization Control)

**Trust Services Criteria**

**Five Trust Principles**:
1. **Security**: Protection against unauthorized access
2. **Availability**: System available for operation and use
3. **Processing Integrity**: System processing is complete, valid, accurate
4. **Confidentiality**: Information designated as confidential is protected
5. **Privacy**: Personal information is collected, used, retained, disclosed appropriately

**IAC Dharma Implementation**:
```yaml
compliance:
  soc2:
    enabled: true
    type: 2  # Type I or Type II
    
    security:
      access_control:
        least_privilege: enforced
        regular_review: quarterly
      
      change_management:
        approval_required: true
        testing: mandatory
        rollback_plan: required
      
      incident_response:
        plan: documented
        testing: annual
        notification: automated
    
    availability:
      uptime_target: 99.9  # %
      monitoring: continuous
      failover: automated
      backup:
        frequency: daily
        retention: 30_days
        testing: monthly
    
    processing_integrity:
      data_validation: enabled
      error_handling: comprehensive
      reconciliation: automated
    
    confidentiality:
      data_classification: required
      encryption: enforced
      access_logging: comprehensive
    
    privacy:
      consent_management: enabled
      data_minimization: enforced
      retention_policy: defined
      deletion_process: automated
```

**SOC 2 Controls**:
```yaml
controls:
  CC1_control_environment:
    - integrity_ethical_values
    - board_oversight
    - organizational_structure
    - commitment_competence
    - accountability
  
  CC2_communication:
    - internal_communication
    - external_communication
  
  CC3_risk_assessment:
    - risk_identification
    - risk_analysis
    - fraud_risk
    - change_management
  
  CC4_monitoring:
    - ongoing_monitoring
    - separate_evaluations
    - deficiency_communication
  
  CC5_control_activities:
    - policy_enforcement
    - transaction_authorization
    - segregation_duties
```

### 4. GDPR (European Data Protection)

**General Data Protection Regulation**

**Key Principles**:
- Lawfulness, fairness, transparency
- Purpose limitation
- Data minimization
- Accuracy
- Storage limitation
- Integrity and confidentiality
- Accountability

**IAC Dharma Implementation**:
```yaml
compliance:
  gdpr:
    enabled: true
    scope: eu_data_subjects
    
    data_protection:
      lawful_basis:
        - consent
        - contract
        - legal_obligation
        - legitimate_interest
      
      purpose_limitation:
        enforce: true
        documentation: required
      
      data_minimization:
        collect_only_necessary: true
        retention_limits: enforced
      
      accuracy:
        update_mechanism: enabled
        rectification_process: automated
      
      storage_limitation:
        retention_policies:
          user_data: 2_years
          logs: 1_year
          backups: 30_days
        automatic_deletion: enabled
      
      security_measures:
        encryption: required
        pseudonymization: enabled
        access_controls: strict
    
    data_subject_rights:
      right_to_access:
        enabled: true
        response_time: 30_days
      
      right_to_rectification:
        enabled: true
        automated: true
      
      right_to_erasure:
        enabled: true
        automated: true
        verification: required
      
      right_to_portability:
        enabled: true
        formats:
          - json
          - csv
          - xml
      
      right_to_object:
        enabled: true
        processing_stop: immediate
    
    breach_notification:
      enabled: true
      authority_notification: 72_hours
      data_subject_notification: without_undue_delay
      documentation: required
```

**GDPR API Endpoints**:
```bash
# Data subject access request
POST /api/gdpr/data-access
{
  "email": "user@example.com",
  "verification_token": "..."
}

# Right to erasure (right to be forgotten)
POST /api/gdpr/erasure
{
  "email": "user@example.com",
  "reason": "user_request"
}

# Data portability
POST /api/gdpr/data-export
{
  "email": "user@example.com",
  "format": "json"
}
```

### 5. CIS Benchmarks

**Center for Internet Security Best Practices**

**Implementation**:
```yaml
compliance:
  cis_benchmarks:
    enabled: true
    profiles:
      - level_1  # Basic security
      - level_2  # Enhanced security
    
    categories:
      initial_setup:
        - filesystem_configuration
        - configure_software_updates
        - filesystem_integrity
        - secure_boot_settings
      
      services:
        - inetd_services
        - special_purpose_services
        - service_clients
      
      network_configuration:
        - network_parameters_host_only
        - network_parameters_host_router
        - ipv6
        - tcp_wrappers
      
      logging_auditing:
        - configure_system_accounting
        - configure_logging
      
      access_authentication:
        - configure_cron
        - ssh_server_configuration
        - configure_pam
        - user_accounts_environment
```

---

## 🛡️ Policy Engine

### Policy as Code

**OPA (Open Policy Agent) Integration**:

```rego
# Example: Require encryption for production databases
package iac.policies

deny[msg] {
  input.resource_type == "aws_db_instance"
  input.environment == "production"
  not input.storage_encrypted
  msg := "Production databases must have encryption enabled"
}

deny[msg] {
  input.resource_type == "aws_s3_bucket"
  input.environment == "production"
  not input.server_side_encryption_configuration
  msg := "Production S3 buckets must have encryption enabled"
}

# Require MFA for production access
deny[msg] {
  input.action == "assume_role"
  input.environment == "production"
  not input.mfa_authenticated
  msg := "MFA required for production access"
}

# Enforce tagging requirements
deny[msg] {
  input.resource_type
  not input.tags.Environment
  msg := "All resources must have an Environment tag"
}

deny[msg] {
  input.resource_type
  not input.tags.Owner
  msg := "All resources must have an Owner tag"
}
```

**Policy Configuration**:
```yaml
policy_engine:
  enabled: true
  engine: opa
  
  policy_sources:
    - path: ./policies/security
      enabled: true
    - path: ./policies/compliance
      enabled: true
    - path: ./policies/cost
      enabled: true
  
  enforcement:
    mode: enforcing  # enforcing, permissive, disabled
    block_on_violation: true
    notification: true
  
  exceptions:
    enabled: true
    approval_required: true
    expiry: 90_days  # Auto-expire exceptions
```

### Pre-Deployment Validation

**Validation Pipeline**:
```yaml
validation:
  stages:
    - name: "Syntax validation"
      type: syntax
      blocking: true
    
    - name: "Security scan"
      type: security
      tools:
        - checkov
        - tfsec
        - terrascan
      blocking: true
      severity_threshold: high
    
    - name: "Compliance check"
      type: compliance
      frameworks:
        - hipaa
        - pci_dss
        - soc2
      blocking: true
    
    - name: "Cost estimation"
      type: cost
      threshold: 10000  # USD
      blocking: false  # Warning only
    
    - name: "Policy validation"
      type: policy
      engine: opa
      blocking: true
```

**API Usage**:
```bash
# Validate blueprint before deployment
curl -X POST http://localhost:3007/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "bp-123",
    "environment": "production",
    "frameworks": ["hipaa", "pci_dss"]
  }'

# Response
{
  "valid": false,
  "violations": [
    {
      "severity": "high",
      "policy": "encryption_required",
      "resource": "aws_db_instance.main",
      "message": "Production databases must have encryption enabled",
      "remediation": "Set storage_encrypted = true"
    }
  ],
  "passed_checks": 45,
  "failed_checks": 1
}
```

---

## 📊 Audit & Logging

### Comprehensive Audit Trail

**Logged Events**:
- User authentication and authorization
- Resource creation, modification, deletion
- Policy violations and exceptions
- Configuration changes
- Access to sensitive data
- Failed login attempts
- Privilege escalation
- API calls

**Audit Log Format**:
```json
{
  "timestamp": "2025-11-21T10:30:45Z",
  "event_id": "evt-123456",
  "event_type": "resource_created",
  "severity": "info",
  "user": {
    "id": "user-789",
    "email": "user@company.com",
    "ip_address": "203.0.113.45",
    "mfa_verified": true
  },
  "resource": {
    "type": "aws_db_instance",
    "id": "db-prod-001",
    "environment": "production"
  },
  "action": "create",
  "result": "success",
  "metadata": {
    "request_id": "req-abc123",
    "session_id": "sess-xyz789",
    "user_agent": "iac-cli/1.0.0"
  },
  "compliance": {
    "frameworks": ["hipaa", "soc2"],
    "controls": ["CC6.1", "CC6.2"]
  }
}
```

**Audit Log Configuration**:
```yaml
audit_logging:
  enabled: true
  
  storage:
    backend: postgresql
    retention_days: 2555  # 7 years for HIPAA
    immutable: true
    encryption: true
  
  shipping:
    - type: s3
      bucket: audit-logs-backup
      encryption: AES-256
      lifecycle:
        glacier_after: 90_days
    
    - type: splunk
      endpoint: https://splunk.company.com
      index: iac_audit
  
  alerting:
    - event: failed_login_attempts
      threshold: 5
      window: 5_minutes
      action: block_user
    
    - event: privilege_escalation
      threshold: 1
      action: alert_security_team
    
    - event: production_access
      threshold: 1
      action: log_and_notify
```

### Compliance Reporting

**Generate Compliance Reports**:
```bash
# Generate HIPAA compliance report
iac-dharma compliance report \
  --framework hipaa \
  --start-date 2025-10-01 \
  --end-date 2025-10-31 \
  --format pdf \
  --output hipaa-october-2025.pdf

# Generate SOC 2 control evidence
iac-dharma compliance evidence \
  --framework soc2 \
  --control CC6.1 \
  --period Q4-2025 \
  --format zip
```

**Report Contents**:
- Executive summary
- Control implementation status
- Audit findings
- Remediation actions
- Evidence artifacts
- Risk assessment
- Compliance score

---

## 🔐 Access Control & Governance

### Role-Based Access Control (RBAC)

**Predefined Roles**:
```yaml
roles:
  admin:
    permissions:
      - "*"
    description: "Full system access"
  
  security_admin:
    permissions:
      - "policies:*"
      - "audit:read"
      - "compliance:*"
    description: "Security and compliance management"
  
  devops:
    permissions:
      - "blueprints:*"
      - "deployments:*"
      - "monitoring:read"
    environments:
      - development
      - staging
  
  developer:
    permissions:
      - "blueprints:read"
      - "blueprints:create"
      - "deployments:read"
    environments:
      - development
  
  auditor:
    permissions:
      - "audit:read"
      - "compliance:read"
      - "reports:generate"
    read_only: true
```

**Custom Role Creation**:
```yaml
custom_roles:
  - name: "cost_manager"
    permissions:
      - "cost:read"
      - "cost:optimize"
      - "budgets:*"
      - "reports:generate"
    
  - name: "network_admin"
    permissions:
      - "network:*"
      - "security_groups:*"
      - "vpcs:*"
```

### Approval Workflows

**Change Approval**:
```yaml
approval_workflows:
  production_deployment:
    required_approvers: 2
    approver_roles:
      - devops_lead
      - security_admin
    timeout: 24_hours
    auto_reject_on_timeout: true
  
  policy_exception:
    required_approvers: 1
    approver_roles:
      - security_admin
    max_duration: 90_days
  
  cost_threshold:
    trigger: deployment_cost > 10000
    required_approvers: 1
    approver_roles:
      - finance_manager
```

---

## 📈 Continuous Compliance

### Automated Scanning

**Scan Schedule**:
```yaml
compliance_scanning:
  schedule:
    security: "0 */6 * * *"  # Every 6 hours
    compliance: "0 2 * * *"   # Daily at 2 AM
    cost: "0 8 * * *"         # Daily at 8 AM
  
  scans:
    - name: "Security vulnerabilities"
      tools:
        - trivy
        - grype
        - snyk
    
    - name: "Compliance frameworks"
      frameworks:
        - hipaa
        - pci_dss
        - soc2
        - gdpr
    
    - name: "Policy violations"
      engine: opa
      policies: all
```

### Auto-Remediation

**Remediation Actions**:
```yaml
auto_remediation:
  enabled: true
  
  rules:
    - violation: "unencrypted_s3_bucket"
      action: "enable_default_encryption"
      auto_apply: true
    
    - violation: "public_database"
      action: "remove_public_access"
      auto_apply: true
      notify: security_team
    
    - violation: "weak_password_policy"
      action: "enforce_strong_policy"
      auto_apply: true
    
    - violation: "missing_tags"
      action: "apply_default_tags"
      auto_apply: false  # Requires approval
```

---

## 🎯 Best Practices

### 1. Defense in Depth

**Multiple Layers**:
- Network security (firewalls, VPCs)
- Application security (input validation, authentication)
- Data security (encryption, access control)
- Physical security (for on-premises)

### 2. Least Privilege

**Implementation**:
- Grant minimum necessary permissions
- Regular access reviews (quarterly)
- Time-bound elevated access
- Just-in-time access provisioning

### 3. Separation of Duties

**Examples**:
- Different teams for deployment and approval
- Separate roles for development and production
- Independent security audit function

### 4. Regular Audits

**Audit Schedule**:
- **Weekly**: Security logs review
- **Monthly**: Access rights review
- **Quarterly**: Compliance assessment
- **Annually**: Comprehensive security audit

---

## 🔍 Troubleshooting

### Compliance Check Failures

```bash
# View detailed compliance status
iac-dharma compliance status --framework hipaa --verbose

# Fix common issues
iac-dharma compliance remediate --framework hipaa --auto-fix
```

### Audit Log Issues

```bash
# Verify audit logging
iac-dharma audit verify --days 7

# Repair missing logs
iac-dharma audit repair --start-date 2025-11-01
```

---

## 📚 Related Documentation

- [Security Best Practices](Security-Best-Practices) - Security hardening
- [API Reference](API-Reference) - Compliance API endpoints
- [Observability](Observability) - Compliance monitoring
- [Backup and Recovery](Backup-and-Recovery) - Data retention

---

**Next Steps**: Review [Advanced-Networking](Advanced-Networking) for network security.
