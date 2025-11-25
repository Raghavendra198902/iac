# EA - Enterprise Constraints
## IAC Dharma Platform

**Version:** 1.0  
**Date:** November 24, 2025  
**Status:** Active

---

## F) Enterprise Constraints

### Overview
This document defines the enterprise constraints that guide decision-making and implementation for the IAC Dharma platform, including budget, timeframe, compliance, hardware, and platform support.

---

## 💰 Budget Constraints

### Development Budget

#### Personnel Costs
| Role | Headcount | Annual Cost/Person | Total Annual Cost |
|------|-----------|-------------------|-------------------|
| Enterprise Architect | 2 | $180,000 | $360,000 |
| Solution Architect | 4 | $150,000 | $600,000 |
| Technical Architect | 4 | $140,000 | $560,000 |
| Senior Backend Developer | 6 | $130,000 | $780,000 |
| Senior Frontend Developer | 4 | $125,000 | $500,000 |
| DevOps Engineer | 4 | $135,000 | $540,000 |
| ML/AI Engineer | 2 | $160,000 | $320,000 |
| Security Engineer | 2 | $145,000 | $290,000 |
| QA Engineer | 3 | $110,000 | $330,000 |
| Product Manager | 2 | $140,000 | $280,000 |
| **Total Personnel** | **33** | | **$4,560,000/year** |

#### Infrastructure Costs (Annual)
| Category | Monthly Cost | Annual Cost |
|----------|-------------|-------------|
| **Development Environment** |
| - AWS Development | $5,000 | $60,000 |
| - Azure Development | $3,000 | $36,000 |
| - GCP Development | $2,000 | $24,000 |
| **Testing Environment** |
| - AWS Testing | $8,000 | $96,000 |
| - Azure Testing | $5,000 | $60,000 |
| - GCP Testing | $3,000 | $36,000 |
| **Production Environment** |
| - AWS Production | $20,000 | $240,000 |
| - Azure Production | $15,000 | $180,000 |
| - GCP Production | $10,000 | $120,000 |
| **Data Storage** |
| - Database (RDS/SQL/CloudSQL) | $8,000 | $96,000 |
| - Object Storage (S3/Blob/GCS) | $5,000 | $60,000 |
| - Backup Storage | $3,000 | $36,000 |
| **Monitoring & Observability** |
| - Prometheus/Grafana | $2,000 | $24,000 |
| - Log Management | $4,000 | $48,000 |
| - APM Tools | $3,000 | $36,000 |
| **Security & Compliance** |
| - WAF & DDoS Protection | $2,000 | $24,000 |
| - Security Scanning Tools | $1,500 | $18,000 |
| - Compliance Tools | $2,000 | $24,000 |
| **CI/CD & DevOps Tools** |
| - CI/CD Platform | $1,000 | $12,000 |
| - Container Registry | $500 | $6,000 |
| - Code Repository | $500 | $6,000 |
| **Total Infrastructure** | **$102,500** | **$1,230,000/year** |

#### Software Licenses (Annual)
| Software | Cost |
|----------|------|
| IDE Licenses (JetBrains, VS Code Pro) | $30,000 |
| Project Management (Jira, Confluence) | $50,000 |
| Communication (Slack, Teams) | $25,000 |
| Design Tools (Figma, Adobe) | $15,000 |
| Security Tools | $75,000 |
| Monitoring Tools (Datadog, New Relic) | $120,000 |
| **Total Software Licenses** | **$315,000/year** |

#### Contingency & Miscellaneous
| Category | Cost |
|----------|------|
| Training & Certification | $100,000 |
| Conferences & Travel | $75,000 |
| External Consultants | $200,000 |
| Hardware (Laptops, Servers) | $150,000 |
| Contingency (10%) | $630,000 |
| **Total Miscellaneous** | **$1,155,000/year** |

### Total Budget Summary
| Category | Annual Cost |
|----------|-------------|
| Personnel | $4,560,000 |
| Infrastructure | $1,230,000 |
| Software Licenses | $315,000 |
| Miscellaneous | $1,155,000 |
| **Total Annual Budget** | **$7,260,000** |

### Budget Allocation by Phase
| Phase | Duration | Budget Allocation | Amount |
|-------|----------|------------------|--------|
| Phase 1 (Foundation) | Q1-Q2 2025 | 25% | $1,815,000 |
| Phase 2 (Core Features) | Q3-Q4 2025 | 35% | $2,541,000 |
| Phase 3 (Advanced Features) | Q1-Q2 2026 | 25% | $1,815,000 |
| Phase 4 (Optimization) | Q3-Q4 2026 | 15% | $1,089,000 |

### Cost Optimization Targets
- **Year 1 ROI Target:** 150% (save $10.8M in infrastructure costs)
- **Infrastructure Cost Reduction:** 30-40% through optimization
- **Manual Effort Reduction:** 70% reduction in manual provisioning
- **Time-to-Market:** 60% faster deployment cycles

---

## ⏱️ Timeframe Constraints

### Project Timeline

#### Phase 1: Foundation (6 months - Jan 2025 to Jun 2025) ✅ COMPLETED
**Objectives:** Core infrastructure, basic features, MVP
- ✅ Infrastructure setup (Kubernetes, databases, monitoring)
- ✅ Core services (API Gateway, Authentication, Blueprint Service)
- ✅ Basic UI (Dashboard, Blueprint Designer)
- ✅ Single cloud provider support (AWS)
- ✅ MVP deployment

#### Phase 2: Core Features (6 months - Jul 2025 to Dec 2025) ✅ COMPLETED
**Objectives:** Multi-cloud support, advanced features, role-based workflows
- ✅ Multi-cloud support (Azure, GCP)
- ✅ IaC generator service
- ✅ Guardrails engine
- ✅ Role-based dashboards (EA/SA/TA/PM)
- ✅ Cost management
- ✅ AI recommendations (basic)

#### Phase 3: Advanced Features (6 months - Jan 2026 to Jun 2026)
**Objectives:** AI/ML, automation, enterprise integrations
- 🔄 Advanced AI/ML capabilities
- 🔄 Pattern recognition and recommendations
- 🔄 Cost forecasting and optimization
- 🔄 Enterprise integrations (AD, SIEM, Firewalls)
- 🔄 Automated remediation
- 🔄 Mobile application

#### Phase 4: Optimization & Scale (6 months - Jul 2026 to Dec 2026)
**Objectives:** Performance optimization, scale, enterprise features
- 📋 Performance tuning
- 📋 Global scale (multi-region)
- 📋 Advanced security features
- 📋 Compliance automation
- 📋 White-label support
- 📋 Marketplace/ecosystem

### Release Schedule
| Release | Date | Features |
|---------|------|----------|
| v1.0 (MVP) | Jun 2025 | ✅ Core platform, AWS support |
| v1.5 | Sep 2025 | ✅ Multi-cloud, basic AI |
| v2.0 | Dec 2025 | ✅ Role workflows, guardrails |
| v2.5 | Mar 2026 | 🔄 Advanced AI, integrations |
| v3.0 | Jun 2026 | 📋 Automation, mobile |
| v3.5 | Sep 2026 | 📋 Performance, scale |
| v4.0 | Dec 2026 | 📋 Enterprise features |

### Critical Milestones
| Milestone | Target Date | Status |
|-----------|------------|--------|
| Infrastructure Ready | Jan 31, 2025 | ✅ Complete |
| MVP Launch | Jun 30, 2025 | ✅ Complete |
| Multi-Cloud Support | Sep 30, 2025 | ✅ Complete |
| GA Release | Dec 31, 2025 | ✅ Complete |
| Enterprise Features | Jun 30, 2026 | 🔄 In Progress |
| Global Scale | Dec 31, 2026 | 📋 Planned |

### Time-to-Market Targets
- **New Feature Development:** 2-4 weeks
- **Bug Fix Turnaround:** 1-3 days (critical), 1-2 weeks (normal)
- **Security Patch:** <24 hours (critical vulnerabilities)
- **Infrastructure Provisioning:** <30 minutes (from blueprint to deployment)
- **Approval Cycle:** <24 hours (standard approvals)

---

## 📋 Compliance Constraints

### Regulatory Compliance Requirements

#### 1. HIPAA (Health Insurance Portability and Accountability Act)
**Applicability:** Healthcare customers
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Access Control:** MFA mandatory, audit all access
- **Audit Logging:** 7-year retention
- **Business Associate Agreement (BAA):** Required for cloud providers
- **PHI Protection:** Data classification, masking, secure deletion
- **Timeline:** Compliance by Q1 2026

#### 2. PCI-DSS (Payment Card Industry Data Security Standard)
**Applicability:** Payment processing customers
- **Network Segmentation:** Cardholder Data Environment (CDE) isolation
- **Encryption:** Strong cryptography for transmission
- **Access Control:** Least privilege, MFA for admin access
- **Vulnerability Management:** Quarterly scans, annual penetration tests
- **Audit Logging:** 90-day retention minimum
- **Timeline:** Compliance by Q2 2026

#### 3. GDPR (General Data Protection Regulation)
**Applicability:** EU customers and data
- **Data Residency:** EU data stays in EU regions
- **Consent:** Explicit consent for data collection
- **Right to Access:** Users can request their data
- **Right to Erasure:** "Right to be forgotten"
- **Data Portability:** Export user data in machine-readable format
- **Breach Notification:** <72 hours
- **Timeline:** Already compliant (mandatory)

#### 4. SOC 2 Type II
**Applicability:** Enterprise customers, SaaS compliance
- **Trust Service Criteria:** Security, Availability, Confidentiality, Processing Integrity
- **Controls:** 100+ controls across 5 categories
- **Audit:** Annual audit by third-party auditor
- **Report:** Shared with enterprise customers
- **Timeline:** Type I by Q2 2026, Type II by Q4 2026

#### 5. ISO 27001
**Applicability:** Information security management
- **ISMS:** Information Security Management System
- **Risk Assessment:** Annual risk assessments
- **Controls:** 114 controls across 14 domains
- **Certification:** Third-party certification
- **Timeline:** Certification by Q3 2026

#### 6. NIST Cybersecurity Framework
**Applicability:** U.S. government customers
- **Functions:** Identify, Protect, Detect, Respond, Recover
- **Implementation:** Maturity level 3 (Defined)
- **Documentation:** Complete framework mapping
- **Timeline:** Compliance by Q2 2026

#### 7. CIS Benchmarks
**Applicability:** Security configuration standards
- **Benchmarks:** CIS Level 1 (all systems)
- **Automated Scanning:** Weekly scans
- **Remediation:** <7 days for critical findings
- **Timeline:** Already implemented

### Compliance Monitoring
- **Automated Compliance Checks:** Daily
- **Compliance Dashboards:** Real-time visibility
- **Compliance Reports:** Monthly executive reports
- **Audit Support:** Dedicated compliance team
- **Remediation SLA:** <48 hours for violations

---

## 🖥️ Hardware Constraints

### Development Environment Hardware
- **Developer Laptops:** 16GB RAM minimum, 32GB recommended
- **Local Development:** Docker Desktop support required
- **GPU:** Optional for AI/ML development (NVIDIA recommended)

### Production Infrastructure Constraints

#### Compute Resources
| Tier | vCPU | Memory | Storage | Count | Purpose |
|------|------|--------|---------|-------|---------|
| Small | 2 | 4GB | 50GB | - | Dev/Test |
| Medium | 4 | 8GB | 100GB | - | Staging |
| Large | 8 | 16GB | 200GB | 10+ | Production APIs |
| XLarge | 16 | 32GB | 500GB | 5+ | AI/ML Services |
| 2XLarge | 32 | 64GB | 1TB | 2+ | Database |

#### Storage Requirements
| Type | Capacity | IOPS | Throughput | Purpose |
|------|----------|------|------------|---------|
| **SSD (EBS/SSD)** | 10TB | 10,000 | 500 MB/s | Database |
| **Object Storage** | 100TB | - | - | Backups, IaC files |
| **Cache (Redis)** | 100GB | - | - | Session, temp data |

#### Network Requirements
- **Bandwidth:** 10 Gbps minimum per AZ
- **Latency:** <10ms intra-region, <100ms inter-region
- **Throughput:** 10K+ requests/second per service

#### Database Sizing
- **PostgreSQL:** 500GB initial, auto-scale to 5TB
- **Read Replicas:** 2 per region
- **Connection Pool:** 100 connections per replica

### Hardware Limitations
- **Max Concurrent Users:** 10,000 (Phase 1), 100,000 (Phase 3)
- **Max Blueprints:** 1 million
- **Max Deployments:** 10 million
- **Max API Requests:** 10M requests/day initially, 100M/day target

---

## 🌐 Platform Support Constraints

### Cloud Provider Support

#### Supported Providers (Tier 1)
1. **Amazon Web Services (AWS)**
   - Regions: All commercial regions
   - Services: 50+ services supported
   - Compliance: All compliance frameworks
   - Status: ✅ Full support

2. **Microsoft Azure**
   - Regions: All commercial regions
   - Services: 40+ services supported
   - Compliance: All compliance frameworks
   - Status: ✅ Full support

3. **Google Cloud Platform (GCP)**
   - Regions: All commercial regions
   - Services: 30+ services supported
   - Compliance: Major frameworks
   - Status: ✅ Full support

#### Future Support (Tier 2 - Phase 3/4)
- IBM Cloud (Q3 2026)
- Oracle Cloud Infrastructure (Q4 2026)
- Alibaba Cloud (Q4 2026)
- Private Cloud / On-Premises (Q4 2026)

### Browser Support
| Browser | Version | Status |
|---------|---------|--------|
| Google Chrome | Latest 2 versions | ✅ Full support |
| Mozilla Firefox | Latest 2 versions | ✅ Full support |
| Microsoft Edge | Latest 2 versions | ✅ Full support |
| Safari | Latest 2 versions | ✅ Full support |
| Opera | Latest version | ⚠️ Basic support |
| Internet Explorer | - | ❌ Not supported |

### Mobile Platform Support
| Platform | Version | Status |
|----------|---------|--------|
| iOS | 14+ | 🔄 In development (Phase 3) |
| Android | 10+ | 🔄 In development (Phase 3) |
| React Native | Latest | 🔄 Framework selected |

### Operating System Support (Servers)
| OS | Version | Status |
|-----|---------|--------|
| Ubuntu Linux | 20.04 LTS, 22.04 LTS | ✅ Primary |
| Red Hat Enterprise Linux | 8, 9 | ✅ Supported |
| Amazon Linux | 2, 2023 | ✅ Supported |
| Windows Server | 2019, 2022 | ⚠️ Limited support |

### Container & Orchestration Support
| Technology | Version | Status |
|------------|---------|--------|
| Docker | 20.10+ | ✅ Full support |
| Kubernetes | 1.24+ | ✅ Full support |
| Docker Compose | 2.0+ | ✅ Development only |
| Helm | 3.x | ✅ Full support |
| OpenShift | 4.x | 🔄 Planned (Phase 4) |

### IaC Tool Support
| Tool | Version | Status |
|------|---------|--------|
| Terraform | 1.0+ | ✅ Primary tool |
| AWS CloudFormation | - | ✅ Full support |
| Azure ARM Templates | - | ✅ Full support |
| Azure Bicep | - | ✅ Full support |
| GCP Deployment Manager | - | ✅ Full support |
| Pulumi | - | 🔄 Planned (Phase 4) |
| Ansible | - | 🔄 Planned (Phase 4) |

### Database Support
| Database | Version | Status |
|----------|---------|--------|
| PostgreSQL | 13+ | ✅ Primary database |
| MySQL | 8.0+ | ⚠️ Limited support |
| MongoDB | 5.0+ | 🔄 Planned (Phase 3) |
| Redis | 6.2+ | ✅ Full support |
| Elasticsearch | 7.x, 8.x | ⚠️ Optional |

### API & Protocol Support
| Protocol | Version | Status |
|----------|---------|--------|
| REST | - | ✅ Primary API |
| GraphQL | - | 🔄 Planned (Phase 3) |
| WebSocket | - | ✅ Real-time updates |
| gRPC | - | 🔄 Planned (Phase 4) |

---

## 🚧 Known Limitations

### Technical Limitations
1. **Single Tenant per Database:** Multi-tenancy via logical separation, not physical
2. **Blueprint Size:** Max 10MB per blueprint definition
3. **Deployment Timeout:** 2 hours max per deployment
4. **Concurrent Deployments:** 50 per tenant max
5. **API Rate Limits:** 1000 requests/minute per user

### Functional Limitations
1. **IaC Generation:** Terraform only in Phase 1-2
2. **Cloud Providers:** AWS/Azure/GCP only initially
3. **Authentication:** OAuth2/OIDC only, no SAML in Phase 1
4. **Offline Mode:** Not supported (online-only)
5. **Mobile App:** iOS/Android only (no Windows Phone)

### Scalability Limitations (Current)
1. **Max Users:** 10,000 concurrent users
2. **Max Tenants:** 1,000 organizations
3. **Max Blueprints:** 1M blueprints
4. **Max Resources:** 100K resources per blueprint
5. **Max Deployments:** 10M total deployments

### Performance Targets
- **API Response Time:** <200ms (95th percentile)
- **UI Load Time:** <2 seconds
- **Deployment Time:** <15 minutes (standard)
- **Search Response:** <500ms

---

## Next Steps
1. ✅ Enterprise Understanding Complete
2. ✅ Domain Mapping Complete
3. ✅ Capability Mapping Complete (201 capabilities)
4. ✅ Data Architecture Complete
5. ✅ Enterprise Architecture Blueprint Complete
6. ✅ Enterprise Constraints Complete
7. ⏭️ Implement EA database schema extensions
8. ⏭️ Create EA API endpoints for macro-level operations

---

**Document Owner:** Enterprise Architecture Team  
**Last Updated:** November 24, 2025  
**Next Review:** January 24, 2026
