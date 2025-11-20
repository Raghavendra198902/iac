# IAC Dharma - Integration Connectors

This directory contains integration adapters for external systems and services.

## Connector Types

### 1. Cloud Provider Connectors
**Location**: `connectors/cloud/`

#### AWS Connector
- **Purpose**: Discover and manage AWS resources
- **Services**: EC2, VPC, RDS, S3, EKS, IAM, etc.
- **Authentication**: IAM roles, access keys
- **API**: boto3 SDK

#### Azure Connector
- **Purpose**: Discover and manage Azure resources
- **Services**: VMs, VNets, AKS, SQL, Storage, etc.
- **Authentication**: Service Principal, Managed Identity
- **API**: Azure SDK for Python/Node.js

#### GCP Connector
- **Purpose**: Discover and manage GCP resources
- **Services**: Compute, VPC, GKE, Cloud SQL, etc.
- **Authentication**: Service Account
- **API**: Google Cloud Client Libraries

### 2. Identity System Connectors
**Location**: `connectors/identity/`

#### Active Directory (AD)
- **Purpose**: User authentication, group management, OU discovery
- **Protocol**: LDAP, Kerberos
- **Features**: User sync, group mapping, GPO analysis

#### Azure AD (AAD)
- **Purpose**: Cloud identity and SSO
- **Protocol**: OIDC, SAML
- **Features**: User provisioning, app registration, conditional access

#### LDAP Connector
- **Purpose**: Generic LDAP directory access
- **Protocol**: LDAP v3
- **Features**: User/group queries, schema discovery

### 3. CMDB Connectors
**Location**: `connectors/cmdb/`

#### ServiceNow CMDB
- **Purpose**: Asset discovery and sync
- **API**: ServiceNow REST API
- **Features**: CI import/export, relationship mapping, change tracking

#### BMC Helix
- **Purpose**: Configuration management
- **API**: BMC Helix REST API
- **Features**: Asset inventory, relationship graphs

### 4. ITSM Connectors
**Location**: `connectors/itsm/`

#### ServiceNow ITSM
- **Purpose**: Change management and ticketing
- **API**: ServiceNow REST API
- **Features**: Change request creation, approval workflows, incident linking

#### Jira Service Management
- **Purpose**: Issue tracking and approvals
- **API**: Jira REST API v3
- **Features**: Ticket creation, status updates, approval tracking

### 5. DevOps Tool Connectors
**Location**: `connectors/devops/`

#### GitHub
- **Purpose**: Source control and CI/CD
- **API**: GitHub REST API, GraphQL
- **Features**: Repo management, pipeline triggers, PR automation

#### Azure DevOps
- **Purpose**: Boards, repos, pipelines
- **API**: Azure DevOps REST API
- **Features**: Work item tracking, pipeline execution, artifact storage

#### GitLab
- **Purpose**: Source control and CI/CD
- **API**: GitLab REST API
- **Features**: Project management, pipeline orchestration

### 6. Monitoring & Observability
**Location**: `connectors/monitoring/`

#### Prometheus
- **Purpose**: Metrics collection
- **Protocol**: PromQL
- **Features**: Custom exporters, alerting rules

#### Datadog
- **Purpose**: Infrastructure monitoring
- **API**: Datadog API
- **Features**: Metrics ingestion, dashboard creation

## Connector Architecture

### Base Connector Interface
```typescript
interface IConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  discover(): Promise<Resource[]>;
  validate(): Promise<ValidationResult>;
  sync(): Promise<SyncResult>;
}
```

### Authentication
All connectors support:
- OAuth 2.0
- API Keys
- Service Accounts
- Certificate-based auth

### Error Handling
- Automatic retry with exponential backoff
- Circuit breaker pattern
- Graceful degradation

### Rate Limiting
- Respect provider rate limits
- Queue-based throttling
- Batch operations where possible

## Configuration

### Connector Config Schema
```yaml
connector:
  type: aws
  name: Production AWS Account
  credentials:
    type: iam_role
    role_arn: arn:aws:iam::123456789:role/IAC-Dharma
  settings:
    regions:
      - us-east-1
      - us-west-2
    discovery_interval: 3600
    resource_types:
      - ec2
      - vpc
      - rds
```

### Secrets Management
- Credentials stored in Vault/KMS
- No plaintext secrets in configs
- Automatic credential rotation

## Testing

### Unit Tests
```bash
cd connectors/cloud/aws
npm test
```

### Integration Tests
```bash
cd connectors
npm run test:integration
```

### Mock Servers
Test connectors use mock servers for CI/CD

## Deployment

Connectors can be deployed as:
1. **Sidecar containers** - In Kubernetes pods
2. **Lambda functions** - Serverless for event-driven discovery
3. **Standalone services** - For on-premises environments

## Monitoring

### Health Checks
- Connection status
- Last successful sync timestamp
- Error rates

### Metrics
- Discovery duration
- Resource counts
- API call latency

## Security

### Network Isolation
- Connectors run in isolated subnets
- Outbound-only connections
- No direct internet access for sensitive connectors

### Audit Logging
- All API calls logged
- Credential usage tracked
- Changes audited

## Directory Structure

```
connectors/
├── cloud/
│   ├── aws/
│   ├── azure/
│   └── gcp/
├── identity/
│   ├── ad/
│   ├── aad/
│   └── ldap/
├── cmdb/
│   ├── servicenow/
│   └── bmc/
├── itsm/
│   ├── servicenow/
│   └── jira/
├── devops/
│   ├── github/
│   ├── azure-devops/
│   └── gitlab/
├── monitoring/
│   ├── prometheus/
│   └── datadog/
└── shared/
    ├── auth/
    ├── retry/
    └── cache/
```
