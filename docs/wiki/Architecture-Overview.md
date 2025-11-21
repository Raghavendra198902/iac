# Architecture Overview

Comprehensive overview of IAC Dharma's system architecture, design patterns, and component interactions.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           IAC DHARMA PLATFORM                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────────────┐  │
│  │   Web Frontend   │  │   Mobile App    │  │   CLI Tool           │  │
│  │   (React 18)     │  │   (React Native)│  │   (Node.js)          │  │
│  │   Port: 5173     │  │                 │  │   iac-dharma         │  │
│  └──────────────────┘  └─────────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           GATEWAY LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      API Gateway (Express)                       │   │
│  │  • Request routing & load balancing                             │   │
│  │  • Authentication & authorization (JWT + OAuth 2.0)             │   │
│  │  • Rate limiting & throttling                                   │   │
│  │  • Request/response transformation                              │   │
│  │  • Circuit breaker pattern                                      │   │
│  │  • Distributed tracing (Jaeger)                                 │   │
│  │  Port: 3000                                                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CORE SERVICE LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────────┐  │
│  │   Blueprint    │  │  IAC Generator │  │   Guardrails Engine     │  │
│  │    Service     │  │    Service     │  │   (Policy Validation)   │  │
│  │  Port: 3001    │  │  Port: 3002    │  │   Port: 3003            │  │
│  └────────────────┘  └────────────────┘  └─────────────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────────┐  │
│  │    Costing     │  │  Orchestrator  │  │   Automation Engine     │  │
│  │    Service     │  │    Service     │  │   (Workflow Mgmt)       │  │
│  │  Port: 3004    │  │  Port: 3005    │  │   Port: 3006            │  │
│  └────────────────┘  └────────────────┘  └─────────────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────────┐  │
│  │   Monitoring   │  │     SSO        │  │   Cloud Provider        │  │
│  │    Service     │  │   Service      │  │   Service               │  │
│  │  Port: 3007    │  │  Port: 3012    │  │   Port: 3010            │  │
│  └────────────────┘  └────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                  ┌────────────────┼────────────────┐
                  ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        INTELLIGENCE LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐   │
│  │       AI Engine (Python)      │  │  AI Recommendations Service   │   │
│  │  • ML model inference         │  │  • Cost optimization          │   │
│  │  • Pattern recognition        │  │  • Resource suggestions       │   │
│  │  • Anomaly detection          │  │  • Best practices             │   │
│  │  Port: 8000                   │  │  Port: 3011                   │   │
│  └──────────────────────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────────┐  │
│  │   PostgreSQL   │  │     Redis      │  │   Object Storage        │  │
│  │  (Primary DB)  │  │  (Cache/Queue) │  │   (Artifacts)           │  │
│  │  Port: 5432    │  │  Port: 6379    │  │                         │  │
│  └────────────────┘  └────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      OBSERVABILITY LAYER                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────────────┐  │
│  │   Prometheus   │  │    Grafana     │  │   Jaeger Tracing        │  │
│  │  (Metrics)     │  │  (Dashboards)  │  │   (Distributed)         │  │
│  │  Port: 9090    │  │  Port: 3030    │  │   Port: 16686           │  │
│  └────────────────┘  └────────────────┘  └─────────────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐                                │
│  │      Loki      │  │  Alertmanager  │                                │
│  │  (Logs)        │  │  (Alerts)      │                                │
│  │  Port: 3100    │  │  Port: 9093    │                                │
│  └────────────────┘  └────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Presentation Layer

#### Web Frontend (React 18 + TypeScript)
- **Technology**: React 18, TypeScript 5, Vite, TailwindCSS
- **Features**:
  - Blueprint designer with drag-and-drop
  - Real-time deployment status
  - Cost visualization dashboard
  - Multi-cloud resource browser
  - AI recommendation viewer
- **Architecture**: Micro-frontends with lazy loading
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6

#### CLI Tool (Node.js)
- **Technology**: Node.js 20, Commander.js, Chalk
- **Commands**: `init`, `start`, `stop`, `status`, `logs`, `health`, `docs`, `info`, `update`
- **Configuration**: `.iac-dharma.json` for project settings
- **Interactive**: Prompts for user input with validation

---

### 2. Gateway Layer

#### API Gateway (Express + TypeScript)
**Port**: 3000

**Responsibilities**:
1. **Request Routing**: Routes to appropriate microservices
2. **Authentication**: JWT validation + OAuth 2.0 integration
3. **Authorization**: Role-based access control (RBAC)
4. **Rate Limiting**: Token bucket algorithm (1000 req/min/user)
5. **Circuit Breaker**: Opossum library with 50% threshold
6. **Load Balancing**: Round-robin with health checks
7. **Transformation**: Request/response normalization
8. **Caching**: Redis-based response caching (TTL: 5 min)
9. **Compression**: gzip/brotli for responses > 1KB
10. **CORS**: Configurable cross-origin policies

**Key Features**:
- OpenAPI 3.0 documentation (Swagger UI)
- Request logging with correlation IDs
- Distributed tracing (Jaeger integration)
- WebSocket support for real-time updates
- GraphQL endpoint for flexible queries

**Tech Stack**:
- Express.js 4.18
- Helmet (security headers)
- express-rate-limit (rate limiting)
- opossum (circuit breaker)
- ioredis (Redis client)

---

### 3. Core Services Layer

#### Blueprint Service (Port: 3001)
**Purpose**: Manage infrastructure blueprints

**Capabilities**:
- CRUD operations for blueprints
- Versioning with semantic versioning (v1.0.0 format)
- Template library (AWS, Azure, GCP)
- Blueprint validation against JSON schemas
- Dependency resolution between resources
- Import/export blueprints (JSON/YAML)

**Data Model**:
```typescript
interface Blueprint {
  id: string;
  name: string;
  version: string;
  provider: 'aws' | 'azure' | 'gcp';
  resources: Resource[];
  variables: Variable[];
  outputs: Output[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
}
```

#### IAC Generator Service (Port: 3002)
**Purpose**: Generate Infrastructure as Code

**Supported Formats**:
- Terraform (HCL)
- AWS CloudFormation (JSON/YAML)
- Azure ARM Templates (JSON)
- Google Deployment Manager (YAML)
- Pulumi (TypeScript/Python)

**Process**:
1. Parse blueprint JSON
2. Validate resource types
3. Generate provider-specific code
4. Apply formatting (terraform fmt)
5. Run static analysis
6. Package artifacts

**Features**:
- Module generation for reusability
- Variable interpolation
- Resource dependency ordering
- State management configuration
- Backend configuration (S3, Azure Storage, GCS)

#### Guardrails Engine (Port: 3003)
**Purpose**: Policy validation and compliance

**Policy Types**:
1. **Security**: Encryption, IAM, network policies
2. **Cost**: Budget limits, instance size restrictions
3. **Compliance**: HIPAA, PCI-DSS, SOC 2, GDPR
4. **Best Practices**: Tagging, naming conventions, redundancy

**Policy Language**: Open Policy Agent (OPA) Rego

**Example Policy**:
```rego
package terraform.analysis

deny[msg] {
  resource := input.resource_changes[_]
  resource.type == "aws_s3_bucket"
  not resource.change.after.server_side_encryption_configuration
  msg := sprintf("S3 bucket '%s' must have encryption enabled", [resource.address])
}
```

**Enforcement**:
- Pre-deployment validation
- Blocking/warning modes
- Policy exceptions with approval workflow
- Audit logging

#### Costing Service (Port: 3004)
**Purpose**: Cloud cost estimation and optimization

**Features**:
- Real-time pricing API integration (AWS, Azure, GCP)
- Resource cost breakdown
- Monthly/annual projections
- Cost optimization recommendations
- Budget alerts and notifications
- Cost allocation by tags/projects

**Pricing Sources**:
- AWS Pricing API
- Azure Pricing Calculator API
- GCP Cloud Billing API

**Calculation Engine**:
```typescript
interface CostEstimate {
  totalMonthlyCost: number;
  breakdown: {
    resourceType: string;
    quantity: number;
    unitPrice: number;
    monthlyCost: number;
  }[];
  optimizationSavings: number;
  confidence: number; // 0-100%
}
```

#### Orchestrator Service (Port: 3005)
**Purpose**: Deployment orchestration and state management

**Workflow**:
1. Receive deployment request
2. Validate blueprint
3. Run guardrails checks
4. Generate IAC code
5. Estimate costs
6. Create deployment plan
7. Execute with provider
8. Monitor progress
9. Update state
10. Send notifications

**State Management**:
- Distributed locking (Redis)
- State versioning
- Rollback capability
- Concurrent deployment handling

**Deployment Strategies**:
- Blue/green deployments
- Canary releases
- Rolling updates
- A/B testing

#### Automation Engine (Port: 3006)
**Purpose**: Workflow automation and scheduling

**Features**:
- Workflow definition (YAML-based)
- Scheduled deployments (cron syntax)
- Event-driven triggers (webhooks, Git commits)
- Conditional logic
- Parallel execution
- Retry with exponential backoff
- Rollback on failure

**Workflow Example**:
```yaml
name: Deploy Production
trigger:
  type: webhook
  path: /deploy/production
steps:
  - name: Validate
    service: guardrails
    action: validate
  - name: Deploy Staging
    service: orchestrator
    action: deploy
    environment: staging
  - name: Run Tests
    service: testing
    action: smoke-tests
  - name: Deploy Production
    service: orchestrator
    action: deploy
    environment: production
    condition: ${{ steps.tests.status == 'success' }}
```

#### Monitoring Service (Port: 3007)
**Purpose**: Real-time monitoring and alerting

**Metrics Collected**:
- Deployment success/failure rates
- API response times (P50, P95, P99)
- Resource utilization (CPU, memory, disk)
- Error rates and types
- Queue depths
- Database connection pool stats

**Alerting Rules**:
- API latency > 500ms (P95)
- Error rate > 5%
- Service down for > 30 seconds
- Database connection pool exhaustion
- Disk space > 80%

#### SSO Service (Port: 3012)
**Purpose**: Single Sign-On and authentication

**Protocols Supported**:
- OAuth 2.0 / OpenID Connect
- SAML 2.0
- LDAP / Active Directory

**Identity Providers**:
- Google Workspace
- Microsoft Azure AD
- Okta
- Auth0
- Custom SAML providers

**Token Management**:
- JWT with RS256 signature
- Access tokens (15 min TTL)
- Refresh tokens (7 day TTL)
- Token rotation
- Revocation lists

#### Cloud Provider Service (Port: 3010)
**Purpose**: Multi-cloud abstraction layer

**Supported Providers**:
- AWS (boto3 SDK)
- Azure (Azure SDK for Python)
- Google Cloud (GCP Client Libraries)

**Capabilities**:
- Credential management (encrypted storage)
- Resource discovery
- Provider-specific API calls
- Cross-cloud resource mapping
- Multi-region support

---

### 4. Intelligence Layer

#### AI Engine (Port: 8000)
**Technology**: Python 3.11, FastAPI, TensorFlow/PyTorch

**ML Models**:
1. **Cost Predictor**: LSTM model for cost forecasting
2. **Anomaly Detector**: Isolation Forest for unusual patterns
3. **Resource Recommender**: Collaborative filtering
4. **Pattern Recognizer**: CNN for architecture patterns

**Inference Pipeline**:
```python
# Model serving with TensorFlow Serving
1. Preprocess input (normalize, encode)
2. Load model from registry
3. Run inference
4. Postprocess output
5. Return predictions with confidence scores
```

**Training**:
- Periodic retraining (weekly)
- Online learning for drift adaptation
- A/B testing for model versions
- MLflow for experiment tracking

#### AI Recommendations Service (Port: 3011)
**Purpose**: Generate actionable recommendations

**Recommendation Types**:
1. **Cost Optimization**:
   - Right-sizing instances
   - Reserved instance suggestions
   - Spot instance opportunities
   - Storage tier optimization

2. **Performance**:
   - Auto-scaling policies
   - CDN implementation
   - Database indexing
   - Caching strategies

3. **Security**:
   - IAM policy tightening
   - Encryption enablement
   - Network segmentation
   - Vulnerability remediation

4. **Reliability**:
   - Multi-AZ deployment
   - Backup strategies
   - Disaster recovery
   - Circuit breaker implementation

**Scoring Algorithm**:
```typescript
interface Recommendation {
  id: string;
  type: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  impact: {
    cost: number;  // Savings in USD/month
    performance: number;  // % improvement
    risk: number;  // Risk reduction score
  };
  effort: 'low' | 'medium' | 'high';
  implementation: string;
  confidence: number;  // 0-100%
}
```

---

### 5. Data Layer

#### PostgreSQL (Port: 5432)
**Version**: 15.x

**Schema Structure**:
```sql
-- Blueprints table
CREATE TABLE blueprints (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(20) NOT NULL,
  provider VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Deployments table
CREATE TABLE deployments (
  id UUID PRIMARY KEY,
  blueprint_id UUID REFERENCES blueprints(id),
  status VARCHAR(50) NOT NULL,
  environment VARCHAR(50) NOT NULL,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  metadata JSONB
);

-- Policies table
CREATE TABLE policies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true
);
```

**Optimizations**:
- B-tree indexes on frequently queried columns
- JSONB indexes (GIN) for JSON queries
- Partial indexes for active records
- Connection pooling (PgBouncer)
- Read replicas for scaling

#### Redis (Port: 6379)
**Version**: 7.x

**Use Cases**:
1. **Caching**: API responses, query results
2. **Session Storage**: User sessions, JWT tokens
3. **Rate Limiting**: Token bucket counters
4. **Pub/Sub**: Real-time notifications
5. **Queue**: Background job queue (Bull)
6. **Feature Flags**: Dynamic configuration

**Data Structures Used**:
- Strings: Cache values
- Hashes: Session data
- Lists: Job queues
- Sets: Unique items (active users)
- Sorted Sets: Leaderboards, rate limiting
- Streams: Event log

**Configuration**:
- Persistence: RDB snapshots + AOF
- Eviction policy: allkeys-lru
- Max memory: 2GB
- Replication: Master-replica setup

---

### 6. Observability Layer

#### Prometheus (Port: 9090)
**Purpose**: Metrics collection and storage

**Metrics Collected**:
- HTTP request duration (histogram)
- Request count (counter)
- Active connections (gauge)
- Database query time (histogram)
- Queue depth (gauge)
- Error count (counter)

**PromQL Queries**:
```promql
# Request rate (req/sec)
rate(http_requests_total[5m])

# Error rate percentage
rate(http_requests_errors[5m]) / rate(http_requests_total[5m]) * 100

# P95 latency
histogram_quantile(0.95, http_request_duration_seconds_bucket)

# Memory usage by service
container_memory_usage_bytes{service=~".*"}
```

**Retention**: 15 days (configurable)

#### Grafana (Port: 3030)
**Purpose**: Visualization and dashboards

**Pre-built Dashboards**:
1. **System Overview**: Service health, uptime, error rates
2. **API Performance**: Latency, throughput, error breakdown
3. **Database Metrics**: Connection pool, query time, slow queries
4. **Infrastructure**: CPU, memory, disk, network
5. **Business Metrics**: Deployments, costs, users

**Alerting**:
- Integration with PagerDuty, Slack, email
- Alert rules defined in dashboard
- Notification channels configurable

#### Jaeger (Port: 16686)
**Purpose**: Distributed tracing

**Trace Context**:
- Trace ID: Unique per request
- Span ID: Unique per operation
- Parent Span ID: For nested spans
- Tags: Metadata (service, operation, error)
- Logs: Timestamped events

**Span Example**:
```json
{
  "traceId": "abc123",
  "spanId": "def456",
  "operationName": "POST /api/blueprints",
  "startTime": 1640000000000,
  "duration": 250,
  "tags": {
    "http.method": "POST",
    "http.status_code": 201,
    "service": "blueprint-service"
  },
  "logs": [
    {
      "timestamp": 1640000000100,
      "fields": {"event": "validation_complete"}
    }
  ]
}
```

**Sampling**:
- Production: 10% sampling
- Development: 100% sampling
- Adaptive sampling based on error rate

---

## Design Patterns

### 1. Microservices Architecture
- **Decoupled services** with independent deployment
- **Domain-driven design** (DDD) for service boundaries
- **API-first** approach with OpenAPI specs

### 2. Event-Driven Architecture
- **Asynchronous communication** via message queues
- **Event sourcing** for audit trail
- **CQRS** (Command Query Responsibility Segregation)

### 3. Circuit Breaker Pattern
- **Failure detection** with configurable thresholds
- **Automatic recovery** after timeout
- **Fallback mechanisms** for degraded mode

### 4. Saga Pattern
- **Distributed transactions** across services
- **Compensating transactions** for rollback
- **Orchestration-based** saga implementation

### 5. Repository Pattern
- **Data access abstraction** layer
- **Testability** with mock repositories
- **Separation of concerns** (data vs. business logic)

### 6. Factory Pattern
- **IAC code generation** for different providers
- **Strategy selection** based on context

### 7. Observer Pattern
- **Real-time updates** via WebSockets
- **Event notifications** for deployment status

---

## Communication Protocols

### 1. HTTP/REST
- **Synchronous** request-response
- **JSON** payloads
- **HATEOAS** for API discoverability

### 2. WebSockets
- **Real-time bidirectional** communication
- **Deployment status updates**
- **Live logs streaming**

### 3. gRPC
- **High-performance** RPC (inter-service)
- **Protocol Buffers** for serialization
- **Streaming support**

### 4. Message Queue (Redis Pub/Sub)
- **Asynchronous** event publishing
- **Decoupled services**
- **Guaranteed delivery** (with acknowledgments)

---

## Security Architecture

### 1. Authentication
- **JWT tokens** with RS256 signature
- **OAuth 2.0** authorization code flow
- **Multi-factor authentication** (MFA) support

### 2. Authorization
- **Role-Based Access Control** (RBAC)
- **Attribute-Based Access Control** (ABAC)
- **Policy enforcement** at API Gateway

### 3. Data Security
- **Encryption at rest** (AES-256)
- **Encryption in transit** (TLS 1.3)
- **Secret management** (HashiCorp Vault integration)

### 4. Network Security
- **API Gateway** as single entry point
- **Rate limiting** and DDoS protection
- **CORS policies**
- **CSP headers**

### 5. Audit Logging
- **All API calls logged**
- **User actions tracked**
- **Compliance reports**

---

## Scalability

### Horizontal Scaling
- **Stateless services** for easy replication
- **Load balancer** (NGINX/HAProxy)
- **Auto-scaling** based on CPU/memory

### Vertical Scaling
- **Resource limits** configurable per service
- **Database sharding** for large datasets

### Caching Strategy
- **Multi-tier caching**: Redis (L1) → CDN (L2)
- **Cache invalidation** via event-driven updates
- **TTL-based expiration**

### Database Optimization
- **Read replicas** for read-heavy workloads
- **Connection pooling**
- **Query optimization** with EXPLAIN plans

---

## Reliability & Resilience

### High Availability
- **Multi-region deployment** (active-active)
- **Health checks** every 10 seconds
- **Automatic failover** within 30 seconds

### Disaster Recovery
- **Backup strategies**: Daily full + hourly incremental
- **RTO**: 1 hour
- **RPO**: 15 minutes
- **Restore testing**: Monthly

### Fault Tolerance
- **Circuit breakers** for service dependencies
- **Retry logic** with exponential backoff
- **Graceful degradation** (fallback responses)

### Monitoring & Alerting
- **Real-time dashboards** (Grafana)
- **Alert escalation** (PagerDuty)
- **SLA monitoring** (99.9% uptime target)

---

## Performance

### Targets
- **API Latency**: P95 < 200ms, P99 < 500ms
- **Throughput**: 1000+ req/sec per instance
- **Database**: < 10ms query time (P95)
- **Memory**: < 512MB per microservice

### Optimization Techniques
- **Connection pooling** (DB, Redis)
- **Lazy loading** for large datasets
- **Pagination** (limit/offset)
- **Compression** (gzip, brotli)
- **CDN** for static assets

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.x |
| | TypeScript | 5.x |
| | Vite | 4.x |
| | TailwindCSS | 3.x |
| **API Gateway** | Express.js | 4.18 |
| | Node.js | 20 LTS |
| **Backend Services** | Node.js | 20 LTS |
| | TypeScript | 5.x |
| | Express.js | 4.18 |
| **AI/ML** | Python | 3.11 |
| | FastAPI | 0.104 |
| | TensorFlow | 2.14 |
| **Database** | PostgreSQL | 15.x |
| | Redis | 7.x |
| **Monitoring** | Prometheus | 2.45 |
| | Grafana | 10.x |
| | Jaeger | 1.50 |
| **Container** | Docker | 24.x |
| | Docker Compose | 2.x |
| **IaC** | Terraform | 1.6.x |
| | Kubernetes | 1.28 |

---

## Next Steps

- [Multi-Cloud Support](Multi-Cloud-Support) - Cloud provider details
- [API Reference](API-Reference) - Complete API documentation
- [Development Setup](Development-Setup) - Contributing guide
- [Deployment Guide](Deployment-Guide) - Production deployment

---

**Have architecture questions? Open an [issue](https://github.com/Raghavendra198902/iac/issues)!**
