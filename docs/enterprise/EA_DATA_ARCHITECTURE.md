# EA - Enterprise Data Architecture
## IAC Dharma Platform

**Version:** 1.0  
**Date:** November 24, 2025  
**Status:** Active

---

## D) Enterprise Data Architecture

### Overview
This document defines the data architecture strategy for IAC Dharma, including data sources, targets, classification, retention, encryption, and governance policies.

---

## 📥 Enterprise Data Sources

### 1. Internal Data Sources

#### User & Identity Data
- **Source:** PostgreSQL (iac_dharma.users, iac_dharma.roles, iac_dharma.permissions)
- **Type:** Structured
- **Classification:** Restricted
- **Volume:** 1K-10K users
- **Update Frequency:** Real-time
- **Retention:** Active users: Indefinite, Inactive: 7 years after termination

#### Blueprint Data
- **Source:** PostgreSQL (iac_dharma.blueprints, iac_dharma.blueprint_resources)
- **Type:** Structured + JSON
- **Classification:** Internal
- **Volume:** 10K-100K blueprints
- **Update Frequency:** Real-time
- **Retention:** Active: Indefinite, Archived: 5 years

#### Infrastructure State Data
- **Source:** PostgreSQL (iac_dharma.deployments, iac_dharma.deployment_resources)
- **Type:** Structured
- **Classification:** Internal
- **Volume:** 50K-500K deployments
- **Update Frequency:** Real-time
- **Retention:** Active: Indefinite, Historical: 3 years

#### Architecture Decision Records (ADRs)
- **Source:** PostgreSQL (iac_dharma.architecture_decisions)
- **Type:** Structured + Markdown
- **Classification:** Internal
- **Volume:** 1K-10K ADRs
- **Update Frequency:** Daily
- **Retention:** Indefinite (permanent record)

#### Audit Logs
- **Source:** PostgreSQL (iac_dharma.audit_logs, iac_dharma.enforcement_events)
- **Type:** Structured
- **Classification:** Restricted
- **Volume:** 1M-10M events/year
- **Update Frequency:** Real-time
- **Retention:** 7 years (compliance requirement)

#### Monitoring Metrics
- **Source:** Prometheus + PostgreSQL (iac_dharma.metrics)
- **Type:** Time-series
- **Classification:** Internal
- **Volume:** 100M-1B metrics/day
- **Update Frequency:** Real-time (15s-1m intervals)
- **Retention:** Raw: 30 days, Aggregated: 1 year

#### Cost Data
- **Source:** PostgreSQL (iac_dharma.costs, iac_dharma.cost_forecasts)
- **Type:** Structured
- **Classification:** Sensitive
- **Volume:** 100K-1M records/month
- **Update Frequency:** Hourly
- **Retention:** 3 years

---

### 2. External Data Sources

#### Cloud Provider APIs
- **Sources:** AWS, Azure, GCP APIs
- **Type:** API responses (JSON)
- **Classification:** Internal
- **Data Types:**
  - Resource inventory
  - Cost and billing data
  - Service quotas
  - Configuration details
  - Health status
- **Update Frequency:** Polling every 5-15 minutes
- **Retention:** Synchronized to internal database

#### Active Directory / LDAP
- **Source:** Corporate AD/LDAP servers
- **Type:** Structured
- **Classification:** Restricted
- **Data Types:**
  - User identities
  - Groups and memberships
  - Organizational structure
- **Update Frequency:** Sync every 15 minutes
- **Retention:** Cached, not stored permanently

#### SSO Identity Providers
- **Sources:** Okta, Azure AD, Auth0, etc.
- **Type:** SAML/OAuth tokens
- **Classification:** Restricted
- **Data Types:**
  - User attributes
  - Authentication tokens
  - Authorization claims
- **Update Frequency:** Real-time (on login)
- **Retention:** Session tokens only (expires in 24h)

#### Threat Intelligence Feeds
- **Sources:** CVE databases, threat feeds, security vendors
- **Type:** Structured + Unstructured
- **Classification:** Public/Internal
- **Data Types:**
  - Vulnerability information
  - Threat indicators
  - Security advisories
- **Update Frequency:** Daily
- **Retention:** 2 years

#### Terraform State Files
- **Sources:** S3/Azure Blob/GCS buckets
- **Type:** JSON
- **Classification:** Sensitive
- **Data Types:**
  - Infrastructure state
  - Resource configurations
  - Secrets (encrypted)
- **Update Frequency:** On deployment
- **Retention:** All versions (indefinite)

---

## 📤 Enterprise Data Targets

### 1. Operational Data Targets

#### PostgreSQL Database
- **Target:** iac_dharma database
- **Purpose:** Primary operational data store
- **Data Types:** All structured operational data
- **Performance:** 10K+ transactions/second
- **HA:** Multi-AZ with replication
- **Backup:** Daily full, hourly incremental

#### Redis Cache
- **Target:** dharma-redis cluster
- **Purpose:** Session cache, real-time data
- **Data Types:** Sessions, temporary data, real-time metrics
- **Performance:** 100K+ ops/second
- **HA:** Redis Sentinel or Cluster mode
- **Backup:** AOF persistence

#### S3/Blob/Cloud Storage
- **Target:** Cloud object storage
- **Purpose:** Large file storage (IaC files, logs, backups)
- **Data Types:** Terraform files, CloudFormation templates, logs
- **Performance:** High throughput
- **HA:** 99.999999999% durability
- **Retention:** Per data classification policy

---

### 2. Analytics Data Targets

#### Data Warehouse (Optional)
- **Target:** Snowflake/Redshift/BigQuery
- **Purpose:** Historical analytics and reporting
- **Data Types:** Historical metrics, cost data, audit logs
- **Performance:** Complex query optimization
- **HA:** Managed service HA
- **Retention:** 5+ years

#### Elasticsearch (Optional)
- **Target:** Elasticsearch cluster
- **Purpose:** Log search and analytics
- **Data Types:** Application logs, audit logs, events
- **Performance:** Full-text search optimized
- **HA:** Multi-node cluster
- **Retention:** 90 days (configurable)

---

### 3. Integration Data Targets

#### SIEM Systems
- **Target:** Splunk, QRadar, ArcSight, etc.
- **Purpose:** Security event correlation
- **Data Types:** Security events, audit logs, alerts
- **Protocol:** Syslog, HTTP/REST
- **Performance:** Real-time streaming
- **Retention:** Per SIEM configuration

#### Monitoring Platforms
- **Target:** Datadog, New Relic, Dynatrace, etc.
- **Purpose:** Infrastructure and application monitoring
- **Data Types:** Metrics, traces, logs
- **Protocol:** Agent-based or API
- **Performance:** Real-time
- **Retention:** Per platform limits

#### Ticketing Systems
- **Target:** Jira, ServiceNow, etc.
- **Purpose:** Incident and change management
- **Data Types:** Incidents, change requests, approvals
- **Protocol:** REST API, webhooks
- **Performance:** Async integration
- **Retention:** Per system policy

#### Communication Platforms
- **Target:** Slack, Microsoft Teams, PagerDuty
- **Purpose:** Notifications and alerts
- **Data Types:** Alerts, status updates, incidents
- **Protocol:** Webhooks, REST API
- **Performance:** Real-time
- **Retention:** N/A (transient)

---

## 🏷️ Data Classification

### Classification Levels

#### 1. **PUBLIC**
- **Definition:** Data that can be freely shared publicly
- **Examples:**
  - Public documentation
  - Open-source templates
  - Marketing materials
- **Access Control:** No restrictions
- **Encryption:** Optional
- **Retention:** Indefinite
- **Examples in IAC Dharma:**
  - Public architecture patterns
  - Documentation

#### 2. **INTERNAL**
- **Definition:** Data for internal use, no external disclosure
- **Examples:**
  - Blueprints
  - Architecture patterns
  - Internal documentation
  - Non-sensitive metrics
- **Access Control:** Authenticated users only
- **Encryption:** TLS in transit, optional at rest
- **Retention:** 3-5 years
- **Examples in IAC Dharma:**
  - Blueprints
  - Deployments
  - Architecture decisions
  - Performance metrics

#### 3. **SENSITIVE**
- **Definition:** Data that requires protection, limited access
- **Examples:**
  - Cost data
  - Resource configurations
  - Infrastructure topology
  - User profiles
- **Access Control:** Role-based, need-to-know
- **Encryption:** TLS in transit, AES-256 at rest
- **Retention:** 3 years
- **Examples in IAC Dharma:**
  - Cost and billing data
  - Terraform state files
  - Resource inventory
  - Approval workflows

#### 4. **RESTRICTED**
- **Definition:** Highly confidential data, strict access controls
- **Examples:**
  - Credentials and secrets
  - Audit logs
  - User authentication data
  - Compliance evidence
- **Access Control:** Explicit approval required, MFA enforced
- **Encryption:** TLS 1.3 in transit, AES-256 at rest, key rotation
- **Retention:** 7 years (compliance)
- **Examples in IAC Dharma:**
  - User credentials
  - Cloud provider API keys
  - Audit logs
  - Authentication tokens
  - Encryption keys

---

## 🗂️ Data Retention Rules

### By Data Type

| Data Type | Classification | Retention Period | Archive After | Delete After | Compliance |
|-----------|---------------|------------------|---------------|--------------|------------|
| User Accounts (Active) | Restricted | Indefinite | N/A | Never | GDPR |
| User Accounts (Inactive) | Restricted | 7 years | 1 year | 7 years | SOX, GDPR |
| Authentication Logs | Restricted | 7 years | 1 year | 7 years | SOX, HIPAA |
| Audit Logs | Restricted | 7 years | 1 year | 7 years | SOX, HIPAA, PCI-DSS |
| Blueprints (Active) | Internal | Indefinite | N/A | User discretion | N/A |
| Blueprints (Archived) | Internal | 5 years | Immediate | 5 years | N/A |
| Deployments (Active) | Internal | Indefinite | N/A | On resource deletion | N/A |
| Deployments (Historical) | Internal | 3 years | 6 months | 3 years | N/A |
| ADRs | Internal | Indefinite | N/A | Never | N/A |
| Cost Data | Sensitive | 3 years | 1 year | 3 years | Tax/Audit |
| Metrics (Raw) | Internal | 30 days | N/A | 30 days | N/A |
| Metrics (Aggregated) | Internal | 1 year | 90 days | 1 year | N/A |
| Application Logs | Internal | 90 days | 30 days | 90 days | N/A |
| Security Events | Restricted | 7 years | 1 year | 7 years | SOX, HIPAA |
| Compliance Reports | Restricted | 7 years | 1 year | 7 years | All |
| Terraform State | Sensitive | Indefinite | 1 year | User discretion | N/A |
| Backup Data | Varies | 90 days | N/A | 90 days | N/A |

### Retention Policy Automation
- **Daily Job:** Archive data past active period
- **Weekly Job:** Delete data past retention period
- **Monthly Job:** Compliance report generation
- **Quarterly Job:** Retention policy review

---

## 🔐 Encryption Policies

### Data at Rest

#### Database Encryption
- **PostgreSQL:** AES-256 encryption at rest (AWS RDS encryption, Azure SQL TDE)
- **Redis:** AOF file encryption
- **Backup Encryption:** AES-256 for all backups
- **Key Management:** AWS KMS, Azure Key Vault, or GCP KMS

#### File Storage Encryption
- **S3/Blob/GCS:** Server-side encryption (SSE-KMS)
- **Terraform State:** Encrypted using KMS keys
- **Log Files:** Encrypted before upload
- **Backup Archives:** Encrypted archives (AES-256)

#### Secrets Management
- **Credentials:** Stored in AWS Secrets Manager, Azure Key Vault, HashiCorp Vault
- **API Keys:** Encrypted in database, retrieved via secrets service
- **Certificates:** Stored in certificate manager services
- **Encryption Keys:** Hardware Security Module (HSM) backed

---

### Data in Transit

#### Network Encryption
- **External APIs:** TLS 1.3 mandatory
- **Internal APIs:** TLS 1.2 minimum (TLS 1.3 preferred)
- **Database Connections:** SSL/TLS enforced
- **Cache Connections:** TLS for Redis connections
- **Cloud Provider APIs:** TLS 1.2+ enforced by providers

#### API Security
- **Authentication:** JWT tokens (HS256 or RS256)
- **Authorization:** Bearer token in Authorization header
- **Certificate Pinning:** For critical external integrations
- **Mutual TLS:** For service-to-service communication (optional)

---

### Key Management

#### Key Rotation Policy
- **Encryption Keys:** Rotate every 90 days
- **API Keys:** Rotate every 180 days or on compromise
- **JWT Secrets:** Rotate every 365 days
- **Database Credentials:** Rotate every 90 days
- **SSL Certificates:** Renew 30 days before expiration

#### Key Storage
- **Production Keys:** Cloud-native KMS (AWS KMS, Azure Key Vault, GCP KMS)
- **Development Keys:** Environment variables (not committed to git)
- **Service Keys:** Secrets management service
- **Backup Keys:** Offline storage in secure location

---

## 🔄 Data Flow Architecture

### Ingestion Flow
```
External Sources → API Gateway → Authentication/Authorization → 
  Business Logic → Data Validation → Database → Cache → 
  Monitoring → Audit Log
```

### Analytics Flow
```
Operational DB → ETL Pipeline → Data Warehouse → 
  BI Tools → Dashboards/Reports
```

### Integration Flow
```
IAC Dharma → Event Bus → Webhooks → 
  External Systems (SIEM, Monitoring, Ticketing)
```

### Backup Flow
```
Database → Backup Service → Encryption → 
  Object Storage (S3/Blob/GCS) → Archive Storage
```

---

## 📊 Data Quality & Governance

### Data Quality Metrics
1. **Accuracy:** 99.9% data accuracy target
2. **Completeness:** 100% required fields populated
3. **Consistency:** No data conflicts across systems
4. **Timeliness:** Real-time or <5 minute delay
5. **Validity:** Schema validation on all inputs

### Data Governance
1. **Data Ownership:** Each data entity has assigned owner
2. **Data Stewardship:** Regular data quality reviews
3. **Data Catalog:** Maintain metadata repository
4. **Data Lineage:** Track data origin and transformations
5. **Privacy Compliance:** GDPR, CCPA compliance

### Privacy & Consent
1. **User Consent:** Explicit consent for data collection
2. **Right to Access:** Users can request their data
3. **Right to Delete:** Users can request data deletion (GDPR)
4. **Data Minimization:** Collect only necessary data
5. **Purpose Limitation:** Use data only for stated purposes

---

## Next Steps
1. ✅ Enterprise Understanding Complete
2. ✅ Domain Mapping Complete
3. ✅ Capability Mapping Complete
4. ✅ Data Architecture Complete
5. ⏭️ Enterprise Architecture Blueprint
6. ⏭️ Enterprise Constraints documentation

---

**Document Owner:** Enterprise Architecture Team  
**Last Updated:** November 24, 2025  
**Next Review:** January 24, 2026
