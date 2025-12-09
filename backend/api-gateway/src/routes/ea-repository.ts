import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'iac_dharma',
  user: process.env.DB_USER || 'dharma_admin',
  password: process.env.DB_PASSWORD || 'dharma_pass_dev',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Get all artifacts
router.get('/artifacts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_repository_artifacts 
      WHERE deleted_at IS NULL 
      ORDER BY last_modified DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    logger.error('Error fetching artifacts:', { error });
    res.status(500).json({ error: 'Failed to fetch artifacts', details: error.message });
  }
});

// Get artifact by ID
router.get('/artifacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_repository_artifacts WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artifact not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error fetching artifact:', { error });
    res.status(500).json({ error: 'Failed to fetch artifact', details: error.message });
  }
});

// Get all models
router.get('/models', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM ea_repository_models 
      WHERE deleted_at IS NULL 
      ORDER BY last_updated DESC
    `);
    res.json(result.rows);
  } catch (error: any) {
    logger.error('Error fetching models:', { error });
    res.status(500).json({ error: 'Failed to fetch models', details: error.message });
  }
});

// Get model by ID
router.get('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM ea_repository_models WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error fetching model:', { error });
    res.status(500).json({ error: 'Failed to fetch model', details: error.message });
  }
});

// Create new artifact (HLD)
router.post('/artifacts', async (req, res) => {
  try {
    const {
      name,
      description,
      artifact_type,
      category,
      version,
      status,
      owner,
      file_path,
      file_size_kb,
      tags,
      related_domains,
      notes,
      document_content,
      executive_summary,
      technical_details,
      diagrams,
      document_references
    } = req.body;

    if (!name || !description || !artifact_type || !category) {
      return res.status(400).json({ error: 'Missing required fields: name, description, artifact_type, category' });
    }

    const result = await pool.query(
      `INSERT INTO ea_repository_artifacts 
       (name, description, artifact_type, category, version, status, owner, file_path, 
        file_size_kb, last_modified, tags, related_domains, notes, document_content, 
        executive_summary, technical_details, diagrams, document_references)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_DATE, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [name, description, artifact_type, category, version || '1.0', status || 'Draft', 
       owner || 'System', file_path || '', file_size_kb || 0, tags || '', related_domains || '', notes || '',
       document_content ? JSON.stringify(document_content) : null,
       executive_summary || null,
       technical_details ? JSON.stringify(technical_details) : null,
       diagrams ? JSON.stringify(diagrams) : null,
       document_references || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error creating artifact:', { error });
    res.status(500).json({ error: 'Failed to create artifact', details: error.message });
  }
});

// Update artifact
router.put('/artifacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      artifact_type,
      category,
      version,
      status,
      owner,
      file_path,
      file_size_kb,
      tags,
      related_domains,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE ea_repository_artifacts 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           artifact_type = COALESCE($3, artifact_type),
           category = COALESCE($4, category),
           version = COALESCE($5, version),
           status = COALESCE($6, status),
           owner = COALESCE($7, owner),
           file_path = COALESCE($8, file_path),
           file_size_kb = COALESCE($9, file_size_kb),
           last_modified = CURRENT_DATE,
           tags = COALESCE($10, tags),
           related_domains = COALESCE($11, related_domains),
           notes = COALESCE($12, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13 AND deleted_at IS NULL
       RETURNING *`,
      [name, description, artifact_type, category, version, status, owner, file_path, 
       file_size_kb, tags, related_domains, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error updating artifact:', { error });
    res.status(500).json({ error: 'Failed to update artifact', details: error.message });
  }
});

// Delete artifact (soft delete)
router.delete('/artifacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE ea_repository_artifacts 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND deleted_at IS NULL 
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artifact not found' });
    }

    res.json({ message: 'Artifact deleted successfully', id: result.rows[0].id });
  } catch (error: any) {
    logger.error('Error deleting artifact:', { error });
    res.status(500).json({ error: 'Failed to delete artifact', details: error.message });
  }
});

// Create new model
router.post('/models', async (req, res) => {
  try {
    const {
      name,
      description,
      model_type,
      notation,
      owner,
      status,
      complexity,
      stakeholders,
      related_artifacts,
      notes
    } = req.body;

    if (!name || !description || !model_type) {
      return res.status(400).json({ error: 'Missing required fields: name, description, model_type' });
    }

    const result = await pool.query(
      `INSERT INTO ea_repository_models 
       (name, description, model_type, notation, owner, status, last_updated, 
        complexity, stakeholders, related_artifacts, notes)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9, $10)
       RETURNING *`,
      [name, description, model_type, notation || 'UML', owner || 'System', 
       status || 'Draft', complexity || 'Medium', stakeholders || '', related_artifacts || '', notes || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error creating model:', { error });
    res.status(500).json({ error: 'Failed to create model', details: error.message });
  }
});

// Update model
router.put('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      model_type,
      notation,
      owner,
      status,
      complexity,
      stakeholders,
      related_artifacts,
      notes
    } = req.body;

    const result = await pool.query(
      `UPDATE ea_repository_models 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           model_type = COALESCE($3, model_type),
           notation = COALESCE($4, notation),
           owner = COALESCE($5, owner),
           status = COALESCE($6, status),
           last_updated = CURRENT_DATE,
           complexity = COALESCE($7, complexity),
           stakeholders = COALESCE($8, stakeholders),
           related_artifacts = COALESCE($9, related_artifacts),
           notes = COALESCE($10, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 AND deleted_at IS NULL
       RETURNING *`,
      [name, description, model_type, notation, owner, status, complexity, 
       stakeholders, related_artifacts, notes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    logger.error('Error updating model:', { error });
    res.status(500).json({ error: 'Failed to update model', details: error.message });
  }
});

// Delete model (soft delete)
router.delete('/models/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE ea_repository_models 
       SET deleted_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND deleted_at IS NULL 
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model not found' });
    }

    res.json({ message: 'Model deleted successfully', id: result.rows[0].id });
  } catch (error: any) {
    logger.error('Error deleting model:', { error });
    res.status(500).json({ error: 'Failed to delete model', details: error.message });
  }
});

// AI-assisted HLD generation
router.post('/artifacts/generate', async (req, res) => {
  try {
    const { description, category, artifact_type } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required for AI generation' });
    }

    // AI-powered suggestions based on description
    const suggestions = {
      name: generateNameFromDescription(description),
      recommended_type: artifact_type || detectArtifactType(description),
      recommended_category: category || detectCategory(description),
      tags: extractKeywords(description),
      related_domains: suggestDomains(description),
      version: '1.0',
      status: 'Draft',
      notes: `AI-generated HLD based on: "${description}"`
    };

    res.json(suggestions);
  } catch (error: any) {
    logger.error('Error generating AI suggestions:', { error });
    res.status(500).json({ error: 'Failed to generate suggestions', details: error.message });
  }
});

// Helper functions for AI assistance
function generateNameFromDescription(description: string): string {
  const words = description.split(' ').slice(0, 5);
  return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Architecture';
}

function detectArtifactType(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes('document') || lower.includes('guide')) return 'Document';
  if (lower.includes('model') || lower.includes('diagram')) return 'Model';
  if (lower.includes('template') || lower.includes('pattern')) return 'Template';
  if (lower.includes('catalog') || lower.includes('inventory')) return 'Catalog';
  return 'Document';
}

function detectCategory(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes('strategy') || lower.includes('vision')) return 'Strategy';
  if (lower.includes('application') || lower.includes('app')) return 'Application';
  if (lower.includes('data') || lower.includes('database')) return 'Data';
  if (lower.includes('integration') || lower.includes('api')) return 'Integration';
  if (lower.includes('security') || lower.includes('compliance')) return 'Security';
  if (lower.includes('technology') || lower.includes('infrastructure')) return 'Technology';
  return 'Strategy';
}

function extractKeywords(description: string): string {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
  const words = description.toLowerCase().split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.includes(w))
    .slice(0, 5);
  return words.join(', ');
}

function suggestDomains(description: string): string {
  const domains = [];
  const lower = description.toLowerCase();
  
  if (lower.includes('business') || lower.includes('process')) domains.push('Business');
  if (lower.includes('application') || lower.includes('software')) domains.push('Application');
  if (lower.includes('data') || lower.includes('analytics')) domains.push('Data');
  if (lower.includes('technology') || lower.includes('infrastructure')) domains.push('Technology');
  if (lower.includes('security')) domains.push('Security');
  
  return domains.length > 0 ? domains.join(', ') : 'Enterprise';
}

// Generate comprehensive LLD document with AI
router.post('/artifacts/generate-lld', async (req, res) => {
  try {
    const { title, description, systemType, technologiesUsed } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const systemTypeStr = systemType || 'web';
    const techStack = technologiesUsed && technologiesUsed.length > 0 ? technologiesUsed : undefined;

    // Generate comprehensive LLD document structure
    const lldDocument = {
      documentTitle: title,
      documentVersion: '1.0',
      documentDate: new Date().toISOString().split('T')[0],
      author: 'AI Assistant',
      reviewers: 'Technical Lead, Solution Architect',
      approvers: 'Chief Architect, CTO',
      
      executiveSummary: `This Low-Level Design (LLD) document outlines the detailed technical architecture for ${title}. ${description} This document provides comprehensive specifications including system components, data models, API interfaces, security measures, deployment architecture, and testing strategies.`,
      businessContext: systemTypeStr === 'mobile' ? 'Mobile applications are essential for reaching users on-the-go and providing seamless user experiences across devices.' : systemTypeStr === 'api' ? 'API services form the backbone of modern microservices architectures, enabling system integration and data exchange.' : 'In todays digital landscape, applications serve as critical business enablers for customer engagement and operational efficiency.',
      objectives: [
        `Deliver a scalable and maintainable ${systemTypeStr} solution`,
        'Ensure high availability and fault tolerance',
        'Implement robust security measures',
        'Optimize performance and response times',
        'Enable seamless integration with existing systems'
      ],
      scope: `This LLD covers the detailed design of ${title}, including architecture, data models, APIs, security, deployment, and testing. Out of scope: Third-party integrations not explicitly mentioned, legacy system migration details.`,
      
      systemName: title,
      systemPurpose: description,
      systemBoundaries: 'The system interfaces with external authentication providers, database systems, monitoring platforms, and client applications. Internal boundaries include separate layers for presentation, business logic, data access, and infrastructure.',
      
      architecturalStyle: description.toLowerCase().includes('microservice') ? 'Microservices Architecture' : description.toLowerCase().includes('serverless') ? 'Serverless Architecture' : 'Layered Architecture with RESTful APIs',
      technologyStack: techStack || ['React 18', 'Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
      components: [
        {
          name: 'API Gateway',
          description: 'Entry point for all client requests, handles routing and load balancing',
          technology: 'Express.js / Kong',
          responsibilities: 'Request routing, authentication, rate limiting, API versioning'
        },
        {
          name: 'Business Logic Layer',
          description: 'Core application logic and business rules',
          technology: 'Node.js / TypeScript',
          responsibilities: 'Business validation, workflow orchestration, data transformation'
        },
        {
          name: 'Data Access Layer',
          description: 'Database abstraction and ORM',
          technology: 'TypeORM / Prisma',
          responsibilities: 'Database queries, transaction management, data mapping'
        }
      ],
      
      dataModels: 'Primary entities include User, Profile, Transaction, and AuditLog. Each entity follows normalized database design principles with proper relationships and constraints.',
      databaseSchema: `PostgreSQL relational database with tables for core entities:\n- users (id, email, password_hash, created_at)\n- profiles (id, user_id, name, metadata)\n- transactions (id, user_id, type, amount, status, timestamp)\n- audit_logs (id, entity_type, entity_id, action, timestamp)`,
      dataFlow: 'Data flows from client → API Gateway → Business Logic → Data Access Layer → Database. Read operations utilize Redis cache when available.',
      
      apiEndpoints: [
        {
          method: 'POST',
          endpoint: '/api/v1/auth/login',
          description: 'User authentication',
          request: '{ "email": "string", "password": "string" }',
          response: '{ "token": "string", "user": {...} }'
        },
        {
          method: 'GET',
          endpoint: '/api/v1/users/:id',
          description: 'Retrieve user profile',
          request: 'Path param: id',
          response: '{ "id": "string", "name": "string", "email": "string" }'
        }
      ],
      
      authentication: 'JWT-based authentication with OAuth 2.0 support. Access tokens valid for 1 hour, refresh tokens for 7 days. Multi-factor authentication (MFA) optional.',
      authorization: 'Role-Based Access Control (RBAC) with hierarchical roles: Admin, Manager, User, Guest. Fine-grained permissions using attribute-based access control (ABAC).',
      dataEncryption: 'TLS 1.3 for data in transit. AES-256 encryption for sensitive data at rest. Key management using AWS KMS / HashiCorp Vault.',
      securityControls: [
        'Input validation and sanitization',
        'SQL injection prevention via parameterized queries',
        'XSS protection with content security policy',
        'Rate limiting (100 requests/minute per user)',
        'Security headers (HSTS, X-Frame-Options)'
      ],
      
      deploymentModel: 'Containerized deployment using Docker on Kubernetes cluster. Blue-green deployment strategy for zero-downtime releases.',
      infrastructure: 'Cloud-native infrastructure on AWS/Azure/GCP. Auto-scaling groups for application servers. Managed database service. Load balancers with health checks.',
      scalability: 'Horizontal scaling via Kubernetes HPA based on CPU/memory utilization. Caching layer reduces database load. Stateless application design enables unlimited scaling.',
      availability: 'Target SLA: 99.9% uptime. Multi-AZ deployment for fault tolerance. Automated failover within 60 seconds. Regular backups every 6 hours.',
      
      responseTime: 'P50: < 200ms, P95: < 500ms, P99: < 1000ms for API requests. Database queries: < 100ms.',
      throughput: 'Target: 10,000 requests per second per service instance. Peak capacity: 50,000 requests per second with auto-scaling.',
      concurrency: 'Support 10,000 concurrent users under normal load. Peak support: 50,000 concurrent connections.',
      
      errorHandlingStrategy: 'Centralized error handling middleware. Standardized error responses with error codes. Circuit breaker pattern for external dependencies.',
      logging: 'Structured logging with JSON format. Log levels: DEBUG, INFO, WARN, ERROR. Centralized logging using ELK Stack. Log retention: 90 days.',
      monitoring: 'Application monitoring: Prometheus + Grafana dashboards. APM: New Relic / Datadog. Alert thresholds: Error rate > 1%, Response time > 1s.',
      
      unitTesting: 'Framework: Jest / Mocha. Target: 80% code coverage. Test pyramid approach. Automated test execution in CI/CD.',
      integrationTesting: 'API testing using Postman / REST Assured. End-to-end tests using Cypress / Selenium. Contract testing for microservices.',
      performanceTesting: 'Load testing using JMeter / Gatling. Stress testing to identify breaking points. Performance baselines established and tracked.',
      
      references: [
        'IEEE Software Design Document Template',
        'Enterprise Architecture Framework Documentation',
        'Technology Stack Best Practices'
      ],
      glossary: 'API: Application Programming Interface\nJWT: JSON Web Token\nRBAC: Role-Based Access Control\nSLA: Service Level Agreement',
      appendix: 'Additional technical specifications and diagrams will be added during detailed design phase.'
    };

    res.json(lldDocument);
  } catch (error: any) {
    logger.error('Error generating LLD:', { error });
    res.status(500).json({ error: 'Failed to generate LLD', details: error.message });
  }
});

// Generate comprehensive SA (Solution Architecture) document with AI
router.post('/artifacts/generate-sa', async (req, res) => {
  try {
    const { title, description, platformType } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const platform = platformType || 'enterprise';

    const saDocument = {
      documentTitle: title,
      documentVersion: '1.0',
      documentDate: new Date().toISOString().split('T')[0],
      architect: 'AI Solution Architect',
      reviewers: 'Technical Lead, Senior Architect, Security Architect',
      approvers: 'Chief Architect, CTO, CISO',
      
      // 1. System Context
      systemContext: description,
      externalSystems: generateExternalSystems(platform),
      systemBoundaries: `The ${title} operates within well-defined boundaries including internal services, external integrations, and user interfaces. Trust boundaries separate public-facing components from internal systems. Network segmentation enforces security zones.`,
      trustZones: ['Public DMZ', 'Application Zone', 'Data Zone', 'Management Zone', 'External Partners'],
      
      // 2. System Decomposition
      subsystems: generateSubsystems(platform),
      
      // 3. Microservices
      microservices: generateMicroservices(platform),
      
      // 4. API Architecture
      apiCommunicationModel: `RESTful APIs with JSON payloads for synchronous operations. gRPC for high-performance inter-service communication. WebSocket for real-time updates. GraphQL for flexible client queries. API versioning using URL path (v1, v2). OpenAPI 3.0 specifications for all endpoints.`,
      apiEndpoints: generateAPIEndpoints(platform),
      rateLimiting: 'Token bucket algorithm: 1000 req/min per user, 10000 req/min per service. Sliding window for burst protection. Rate limits enforced at API Gateway. Separate limits for read vs write operations. Premium tiers with higher limits.',
      
      // 5. Data Flow
      dataFlowDescription: `Data flows: Client → API Gateway → Authentication → Service Mesh → Microservices → Database. Events: Agent → Ingestion Gateway → Kafka → Stream Processing → Analytics → Storage. Batch: Scheduled Jobs → Data Lake → ETL → Data Warehouse → Reporting.`,
      streamingArchitecture: 'Apache Kafka with 3-node cluster, 30-day retention. Topics partitioned by tenant/region. Consumer groups for parallel processing. Kafka Streams for real-time transformations. Schema Registry for data governance.',
      batchProcessing: 'Apache Airflow for DAG orchestration. Spark jobs for heavy transformations. Scheduled nightly aggregations. Incremental processing with watermarks. Error handling with dead letter queues.',
      encryptionFlow: 'TLS 1.3 in transit. AES-256-GCM at rest. End-to-end encryption for sensitive data. Key rotation every 90 days. Envelope encryption for data keys using KMS.',
      
      // 6. Database Design
      logicalSchema: generateDatabaseSchema(platform),
      databaseEntities: ['Users', 'Sessions', 'Events', 'Alerts', 'Cases', 'Evidence', 'Assets', 'Policies', 'Audit Logs'],
      indexingStrategy: 'B-tree indexes on primary keys and foreign keys. Hash indexes for equality searches. GiST indexes for full-text search. Partial indexes for filtered queries. Covering indexes for read-heavy operations.',
      partitioningLogic: 'Range partitioning by date (monthly tables). Hash partitioning by tenant_id for multi-tenancy. List partitioning by region. Automatic partition creation and pruning. Partition-wise joins enabled.',
      storageTypes: 'PostgreSQL 15 for relational data. TimescaleDB for time-series events. MongoDB for unstructured logs. Redis for caching and sessions. Elasticsearch for full-text search. S3 for object storage.',
      
      // 7. Deployment
      deploymentModel: 'Kubernetes 1.28+ on AWS EKS/Azure AKS/GCP GKE. Helm charts for package management. GitOps with ArgoCD for continuous deployment. Multi-region active-active setup. Istio service mesh for traffic management.',
      autoscalingRules: 'HPA: Scale pods when CPU > 70% or Memory > 80%. VPA for resource optimization. Cluster Autoscaler for node provisioning. Predictive autoscaling using ML models. Scale-to-zero for dev environments.',
      loadBalancing: 'Layer 7 ALB/NLB for external traffic. Istio VirtualServices for internal routing. Sticky sessions using consistent hashing. Health checks every 10s. Connection draining during scale-down.',
      deploymentStrategies: 'Blue-Green: Zero downtime with instant rollback. Canary: 10% → 25% → 50% → 100% over 2 hours. Rolling updates with 25% max surge. Feature flags for gradual rollout. Automated rollback on error spike.',
      
      // 8. Integration
      integrations: generateIntegrations(platform),
      
      // 9. Security
      authenticationMechanism: 'JWT with RS256 signing. OAuth 2.0 + OIDC for SSO. SAML 2.0 for enterprise federation. MFA using TOTP/SMS. Certificate-based auth for services. Session timeout: 1 hour (access), 7 days (refresh).',
      authorizationModel: 'RBAC with hierarchical roles. ABAC for fine-grained permissions. Policy as Code using OPA. Resource-level ACLs. Dynamic permission evaluation. Principle of least privilege enforced.',
      secretsManagement: 'HashiCorp Vault for secrets storage. Dynamic secrets with TTL. Automatic rotation for DB credentials. Sealed Secrets for K8s. IRSA/Workload Identity for cloud access. No secrets in code or configs.',
      networkSecurity: 'Zero-trust network with mutual TLS. Network policies isolating namespaces. WAF with OWASP rule sets. DDoS protection at edge. Private VPC with NAT gateways. VPN for admin access.',
      auditLogging: 'Comprehensive audit trail for all changes. Tamper-proof logs using blockchain. SIEM integration for correlation. Retention: 7 years. Compliance with SOC2, ISO27001, GDPR.',
      
      // 10. High Availability
      haArchitecture: 'Multi-AZ deployment across 3 availability zones. Active-active configuration for stateless services. Active-passive for stateful components. No single point of failure. Geographic redundancy across regions.',
      failoverStrategy: 'Automatic failover within 60 seconds. DNS-based failover with Route53/Traffic Manager. Database replicas with synchronous replication. StatefulSet with persistent volumes. Chaos engineering for resilience testing.',
      healthChecks: 'Liveness probes for crash detection. Readiness probes for traffic control. Startup probes for slow-starting apps. /health endpoint with detailed status. Dependency health checks.',
      autoRecovery: 'Pod restart on failure. Node replacement on unhealthy status. Self-healing with Operator patterns. Circuit breakers preventing cascade failures. Exponential backoff for retries.',
      
      // 11. Observability
      loggingStrategy: 'Structured JSON logs with correlation IDs. ELK Stack (Elasticsearch, Logstash, Kibana) for centralization. FluentBit as log forwarder. Log levels: DEBUG, INFO, WARN, ERROR, FATAL. PII masking in logs.',
      metricsCollection: 'Prometheus for metrics scraping. Thanos for long-term storage. Grafana dashboards for visualization. RED metrics (Rate, Errors, Duration). USE metrics (Utilization, Saturation, Errors). Custom business metrics.',
      distributedTracing: 'OpenTelemetry for instrumentation. Jaeger for trace collection. Zipkin-compatible format. Trace sampling: 100% for errors, 10% for success. Span attributes for context.',
      alertingRules: 'Prometheus AlertManager for alert routing. Alert severity: Critical (P1), High (P2), Medium (P3), Low (P4). Escalation policies. Alert grouping to prevent fatigue. Runbooks for common alerts.',
      
      // 12. Workflow Orchestration
      automatedWorkflows: 'Temporal for durable workflows. State machines for complex logic. Compensation transactions for rollback. Saga pattern for distributed transactions. Workflow versioning for updates.',
      eventProcessing: 'Event-driven architecture with pub/sub. Event sourcing for audit trail. CQRS for read/write separation. Event replay for debugging. Schema evolution with Avro.',
      orchestrationPipeline: 'Airflow DAGs for data pipelines. Argo Workflows for K8s jobs. Step Functions for serverless orchestration. Dependency management between tasks. SLA monitoring.',
      
      // 13. Analytics Pipeline
      dataIngestion: 'Kafka for stream ingestion. Kinesis/Event Hubs as alternatives. Schema validation at ingestion. Data quality checks. Duplicate detection. Late-arriving data handling.',
      enrichmentLogic: 'Real-time enrichment with reference data. Geo-IP lookup. Threat intelligence feeds. User behavior profiling. Context injection from multiple sources.',
      mlIntegration: 'MLflow for model registry. Sagemaker/Vertex AI for training. Real-time inference with low latency. A/B testing for model versions. Feature store for consistency. Model monitoring for drift.',
      queryOptimization: 'Materialized views for aggregates. Query result caching. Indexed columns for filters. Query plan analysis. Read replicas for reporting. Column-store for analytics.',
      
      // 14. Evidence & Forensics
      evidenceCollection: 'Secure collection agents. Memory dumps and disk images. Network packet captures. Log snapshots. Metadata preservation. Chain-of-custody documentation.',
      chainOfCustody: 'Cryptographic signing of evidence. Immutable storage with WORM. Access logs for evidence viewing. Transfer records. Court-admissible format. Witness statements.',
      integrityVerification: 'SHA-256 hashing on collection. Periodic integrity checks. Hash verification on access. Tamper detection. Digital signatures. Time-stamping service.',
      secureStorage: 'Encrypted evidence vault. Access control with least privilege. Retention policies by evidence type. Secure deletion after retention. Geographic restrictions. Compliance with legal holds.',
      
      // 15. Notification & Alerting
      alertRouting: 'Real-time WebSocket for dashboards. Email for non-urgent. SMS for critical. Slack/Teams integration. PagerDuty for on-call. Routing based on severity and role.',
      alertPrioritization: 'ML-based scoring (0-100). Risk-based prioritization. Business impact assessment. Alert correlation to reduce noise. Dynamic thresholds. Alert fatigue prevention.',
      notificationChannels: ['Email (SMTP)', 'SMS (Twilio)', 'Slack', 'Microsoft Teams', 'PagerDuty', 'Webhook', 'Mobile Push'],
      alertDeduplication: 'Time-window deduplication (5 minutes). Fingerprint-based grouping. Similar alert clustering. Suppression rules. Maintenance mode.',
      
      // 16. UI/UX Architecture
      uiComponentMapping: 'React 18 with TypeScript. Micro-frontend architecture. Component library with Storybook. Atomic design methodology. Lazy loading for performance. Server-side rendering for SEO.',
      stateManagement: 'Redux Toolkit for global state. React Query for server state. Context API for theme/auth. Local storage for persistence. State normalization. Optimistic updates.',
      realtimeDashboards: 'WebSocket connection for live data. Chart.js/D3.js for visualizations. Virtual scrolling for large lists. Progressive data loading. Auto-refresh with backoff. Responsive design.',
      roleBasedUI: 'Component-level authorization. Dynamic menu based on permissions. Feature flags for gradual rollout. A/B testing framework. Personalization engine.',
      
      // 17. Mobile & Agent Framework
      agentCommunication: 'Bidirectional gRPC for efficiency. Protobuf for serialization. TLS mutual authentication. Compression for bandwidth. Offline queue for unreliable networks.',
      heartbeatMechanism: 'Heartbeat every 60 seconds. Exponential backoff on failure. Server-initiated health checks. Agent status tracking. Stale agent detection (5 min timeout).',
      updateDistribution: 'Signed agent packages. Differential updates. Staged rollout by percentage. Automatic rollback on errors. Version compatibility matrix. Manual override capability.',
      offlineSupport: 'Local SQLite cache. Event queuing with size limits. Sync on reconnection. Conflict resolution. Offline-first architecture. Background sync.',
      
      // 18. Performance Engineering
      scalingStrategy: 'Horizontal pod autoscaling. Read replicas for databases. CDN for static assets. Regional data centers. Edge computing for low latency. Microservice isolation.',
      cachingStrategy: 'Redis for application cache. CDN for assets. Database query cache. API response cache. Cache warming. TTL-based expiration. Cache invalidation patterns.',
      throughputOptimization: 'Connection pooling. Async I/O with non-blocking calls. Batch operations. Stream processing. Load shedding under stress. Backpressure handling.',
      performanceTargets: 'API P50: < 100ms, P95: < 300ms, P99: < 1s. Page load: < 2s. Search latency: < 500ms. Event ingestion: 100K events/sec. Database queries: < 50ms.',
      
      // 19. Disaster Recovery
      rtoRpoMapping: 'Critical services: RTO 1 hour, RPO 15 min. Important services: RTO 4 hours, RPO 1 hour. Normal services: RTO 24 hours, RPO 24 hours. Data tier: RPO 5 min with continuous replication.',
      backupStrategy: 'Continuous replication for databases. Snapshots every 6 hours. Full backups weekly. Incremental daily. Cross-region backup copies. Backup testing monthly. 90-day retention.',
      failoverPlan: 'Automated failover for database. Manual approval for region failover. Runbooks for DR activation. Periodic DR drills. Communications plan. Customer notification procedures.',
      drSiteStrategy: 'Hot DR site with active-active. Warm standby in secondary region. Cold backup in tertiary region. Data synchronization every 15 min. Automated health checks. Quarterly DR testing.',
      
      // 20. Governance
      architectureDecisions: [
        { decision: 'Microservices over Monolith', rationale: 'Independent scaling, deployment, and team autonomy', date: new Date().toISOString().split('T')[0] },
        { decision: 'Kubernetes for Orchestration', rationale: 'Industry standard, cloud-agnostic, rich ecosystem', date: new Date().toISOString().split('T')[0] },
        { decision: 'PostgreSQL for Primary Database', rationale: 'ACID compliance, strong consistency, JSON support', date: new Date().toISOString().split('T')[0] }
      ],
      versioningStrategy: 'Semantic versioning (Major.Minor.Patch). API versioning in URL path. Backward compatibility for 2 major versions. Deprecation notices 6 months in advance. Change logs published.',
      reviewCheckpoints: 'Architecture review before epic kickoff. Design review before implementation. Security review before production. Performance review post-deployment. Quarterly architecture health checks.',
      
      references: [
        'Microservices Patterns by Chris Richardson',
        'Building Microservices by Sam Newman',
        'Site Reliability Engineering by Google',
        'Designing Data-Intensive Applications by Martin Kleppmann',
        'Cloud Native Patterns by Cornelia Davis'
      ],
      glossary: 'ADR: Architecture Decision Record\nCQRS: Command Query Responsibility Segregation\nHA: High Availability\nHPA: Horizontal Pod Autoscaler\nRBAC: Role-Based Access Control\nRPO: Recovery Point Objective\nRTO: Recovery Time Objective\nSLA: Service Level Agreement',
      appendix: 'Detailed network diagrams, API specifications, database schemas, and deployment manifests are maintained in the technical repository.'
    };

    res.json(saDocument);
  } catch (error: any) {
    logger.error('Error generating SA:', { error });
    res.status(500).json({ error: 'Failed to generate SA', details: error.message });
  }
});

function generateExternalSystems(platform: string): any[] {
  const common = [
    { name: 'Active Directory / LDAP', type: 'Identity Provider', interaction: 'LDAP/SAML for user sync and authentication' },
    { name: 'Email Gateway', type: 'Notification', interaction: 'SMTP for email alerts and reports' },
    { name: 'SMS Provider', type: 'Notification', interaction: 'REST API for SMS alerts' }
  ];
  
  if (platform === 'security') {
    return [
      ...common,
      { name: 'SIEM (Splunk/ELK)', type: 'Security', interaction: 'Syslog/HTTP for event forwarding' },
      { name: 'EDR Solutions', type: 'Security', interaction: 'REST API for endpoint data' },
      { name: 'Threat Intelligence Feeds', type: 'Security', interaction: 'TAXII/STIX for threat data' },
      { name: 'Ticketing System', type: 'ITSM', interaction: 'REST API for incident creation' }
    ];
  }
  
  return [
    ...common,
    { name: 'Payment Gateway', type: 'Financial', interaction: 'REST API for payments' },
    { name: 'CRM System', type: 'Business', interaction: 'REST API for customer data' }
  ];
}

function generateSubsystems(platform: string): any[] {
  if (platform === 'security') {
    return [
      { name: 'Authentication Service', purpose: 'User authentication and session management', responsibilities: 'JWT issuance, OAuth flows, MFA, session tracking' },
      { name: 'Event Ingestion Gateway', purpose: 'High-throughput event collection', responsibilities: 'Protocol conversion, validation, queueing, backpressure' },
      { name: 'Analytics Engine', purpose: 'Real-time event analysis', responsibilities: 'Correlation, enrichment, threat detection, ML scoring' },
      { name: 'Forensics Engine', purpose: 'Evidence collection and analysis', responsibilities: 'Data preservation, chain of custody, investigation tools' },
      { name: 'Agent Management', purpose: 'Endpoint agent lifecycle', responsibilities: 'Deployment, updates, configuration, monitoring' },
      { name: 'Alerting Service', purpose: 'Multi-channel notifications', responsibilities: 'Alert routing, prioritization, deduplication, delivery' }
    ];
  }
  
  return [
    { name: 'API Gateway', purpose: 'Unified entry point', responsibilities: 'Routing, auth, rate limiting, transformation' },
    { name: 'Business Logic Layer', purpose: 'Core functionality', responsibilities: 'Business rules, workflows, validation' },
    { name: 'Data Layer', purpose: 'Data persistence', responsibilities: 'CRUD operations, transactions, caching' },
    { name: 'Integration Layer', purpose: 'External connectivity', responsibilities: 'Third-party APIs, message queues, webhooks' }
  ];
}

function generateMicroservices(platform: string): any[] {
  return [
    { name: 'auth-service', type: 'stateless', purpose: 'Authentication and authorization', dependencies: 'user-service, redis' },
    { name: 'user-service', type: 'stateful', purpose: 'User profile management', dependencies: 'postgres, redis' },
    { name: 'api-gateway', type: 'stateless', purpose: 'API routing and composition', dependencies: 'all services' },
    { name: 'notification-service', type: 'stateless', purpose: 'Multi-channel notifications', dependencies: 'user-service, message-queue' },
    { name: 'analytics-service', type: 'stateful', purpose: 'Data processing and insights', dependencies: 'timescaledb, kafka' }
  ];
}

function generateAPIEndpoints(platform: string): any[] {
  return [
    { service: 'auth-service', endpoint: '/api/v1/auth/login', method: 'POST', authentication: 'None (public)' },
    { service: 'auth-service', endpoint: '/api/v1/auth/refresh', method: 'POST', authentication: 'Refresh Token' },
    { service: 'user-service', endpoint: '/api/v1/users/:id', method: 'GET', authentication: 'JWT Bearer' },
    { service: 'analytics-service', endpoint: '/api/v1/analytics/dashboard', method: 'GET', authentication: 'JWT Bearer' }
  ];
}

function generateDatabaseSchema(platform: string): string {
  if (platform === 'security') {
    return `Events Table (Hypertable):\n- event_id (UUID PK)\n- timestamp (TIMESTAMPTZ, indexed)\n- source_ip (INET)\n- event_type (VARCHAR)\n- severity (INT)\n- payload (JSONB)\n- tenant_id (UUID, partition key)\n\nAlerts Table:\n- alert_id (UUID PK)\n- event_id (UUID FK)\n- status (ENUM: open, investigating, closed)\n- assigned_to (UUID FK)\n- priority_score (INT)\n\nCases Table:\n- case_id (UUID PK)\n- created_at (TIMESTAMPTZ)\n- status (VARCHAR)\n- investigator_id (UUID FK)\n- related_alerts (JSONB)`;
  }
  
  return `Users Table:\n- user_id (UUID PK)\n- email (VARCHAR UNIQUE)\n- password_hash (VARCHAR)\n- created_at (TIMESTAMPTZ)\n\nProfiles Table:\n- profile_id (UUID PK)\n- user_id (UUID FK)\n- metadata (JSONB)\n\nTransactions Table (Partitioned):\n- tx_id (UUID PK)\n- user_id (UUID FK)\n- amount (DECIMAL)\n- timestamp (TIMESTAMPTZ)\n- status (ENUM)`;
}

function generateIntegrations(platform: string): any[] {
  return [
    { system: 'Active Directory', method: 'LDAP/LDAPS', purpose: 'User authentication and group sync' },
    { system: 'Email Server', method: 'SMTP', purpose: 'Alert notifications' },
    { system: 'Slack', method: 'Webhook', purpose: 'Team notifications' },
    { system: 'Cloud Provider', method: 'SDK/API', purpose: 'Infrastructure management' }
  ];
}

// Generate TA Document with AI
router.post('/artifacts/generate-ta', async (req, res) => {
  try {
    const { systemName, architect } = req.body;

    if (!systemName) {
      return res.status(400).json({ error: 'System name is required' });
    }

    const taDocument = {
      documentTitle: `${systemName} - Technical Architecture`,
      documentVersion: '1.0',
      architect: architect || 'Lead Technical Architect',
      systemName,

      // 1. Component Architecture
      components: [
        { name: 'AuthController', layer: 'API', purpose: 'Handle authentication requests', technologies: 'Node.js, Express, JWT' },
        { name: 'EventProcessor', layer: 'Service', purpose: 'Process and enrich events', technologies: 'Python, FastAPI, Kafka' },
        { name: 'EventRepository', layer: 'Data', purpose: 'Persist events to database', technologies: 'PostgreSQL, TimescaleDB' },
        { name: 'LoadBalancer', layer: 'Infrastructure', purpose: 'Distribute traffic', technologies: 'NGINX, Istio' }
      ],

      // 2. Technology Stack
      techStack: {
        backend: 'Python 3.11 with FastAPI for high-performance APIs, Go 1.21 for agent services, Node.js 20 with Express for legacy integrations',
        frontend: 'React 18 with TypeScript 5, Material-UI and Tailwind CSS for styling, WebSockets for real-time updates',
        agents: 'Python for cross-platform, Go for lightweight agents, C++ for kernel-level monitoring, Swift for iOS, Kotlin for Android',
        databases: 'PostgreSQL 15 for relational data, TimescaleDB for time-series, Redis 7 for caching, MongoDB 7 for unstructured data',
        messageBrokers: 'Apache Kafka 3.6 with Zookeeper, RabbitMQ 3.12 as secondary broker',
        cicd: 'GitHub Actions for CI, Docker for containerization, Kubernetes 1.28 for orchestration, Helm 3 for package management',
        codeQuality: 'Black and Pylint for Python, ESLint and Prettier for TypeScript, SonarQube for code analysis, Snyk for security scanning'
      },

      // 3. API Contracts
      apiContracts: [
        { endpoint: '/api/v1/auth/login', method: 'POST', request: '{ email, password }', response: '{ access_token, refresh_token, user }', errorCodes: '400, 401, 429, 500' },
        { endpoint: '/api/v1/events', method: 'GET', request: 'Query params: page, limit, filter', response: '{ events: [], total, page }', errorCodes: '400, 401, 403, 500' },
        { endpoint: '/api/v1/events/{id}', method: 'GET', request: 'Path param: id', response: '{ event }', errorCodes: '401, 404, 500' },
        { endpoint: '/api/v1/alerts', method: 'POST', request: '{ title, severity, description }', response: '{ alert_id, created_at }', errorCodes: '400, 401, 500' }
      ],

      // 4. Sequence Diagrams
      sequenceDiagrams: [
        { flow: 'Authentication Flow', steps: 'Client → API Gateway → Auth Service → Token Validation → JWT Generation → Redis Cache → Response to Client → Token Refresh Logic' },
        { flow: 'Event Ingestion', steps: 'Agent → TLS Connection → Gateway → Schema Validation → Kafka Topic → Stream Processor → Enrichment → TimescaleDB → Alert Engine' },
        { flow: 'Forensics Workflow', steps: 'Analyst → UI → Evidence Request → Agent Command → File Collection → Encryption → Upload → Hash Verification → Storage → Chain of Custody' }
      ],

      // 5. Database Schema
      databaseSchema: [
        { table: 'events', columns: 'id (PK, UUIDv7), timestamp, source, severity, raw_data (JSONB), enriched_data (JSONB)', indexes: 'btree(timestamp), gin(raw_data), brin(timestamp)', partitioning: 'Range by timestamp (monthly hypertables)' },
        { table: 'users', columns: 'id (PK, UUID), email (UNIQUE), password_hash, role, created_at, last_login', indexes: 'btree(id), hash(email), btree(role)', partitioning: 'None' },
        { table: 'alerts', columns: 'id (PK, UUID), event_id (FK), severity, status, assigned_to (FK), created_at', indexes: 'btree(created_at), btree(severity), btree(status)', partitioning: 'Range by created_at (quarterly)' }
      ],

      // 6. Data Integrity
      integrityRules: [
        { field: 'email', validation: 'RFC 5322 email format, max 255 chars, lowercase', enforcement: 'Database constraint + API validation' },
        { field: 'event.severity', validation: 'ENUM(critical, high, medium, low, info)', enforcement: 'Database CHECK constraint' },
        { field: 'timestamp', validation: 'ISO 8601 format, not in future', enforcement: 'Application layer with server time' }
      ],

      // 7-20: Other sections
      eventProcessing: {
        ingestion: 'Kafka ingestion with 3-node cluster, partitioned by tenant_id, 30-day retention, exactly-once semantics',
        enrichment: 'GeoIP lookup, threat intelligence correlation, user context injection, asset mapping',
        failover: 'Multi-broker replication factor 3, ISR monitoring, automatic leader election',
        deadLetter: 'Failed events to DLQ topic, retry with exponential backoff, manual review after 5 attempts',
        normalization: 'ECS (Elastic Common Schema) standard, field mapping, data type coercion'
      },

      cachingStrategy: {
        patterns: 'Cache-aside for user sessions, Write-through for configurations, Read-through for reference data',
        invalidation: 'TTL-based expiration, event-driven invalidation on updates, LRU eviction policy',
        queryCaching: 'Result caching for dashboard queries with 60s TTL, cache key includes user + filters',
        sessionCaching: 'Redis-based sessions with 1-hour TTL, sliding expiration on activity',
        bloomFilters: 'Event deduplication using bloom filters, 1M capacity, 0.01% false positive rate'
      },

      securityHardening: {
        sanitization: 'All inputs validated with Joi schemas, SQL injection prevention with parameterized queries',
        injectionProtection: 'NoSQL injection via input type checking, XSS prevention with DOMPurify',
        middlewares: 'Helmet.js for HTTP headers, CORS with whitelist, rate limiting per IP/user',
        tlsEnforcement: 'TLS 1.3 only, strong cipher suites (ECDHE-RSA-AES256-GCM-SHA384), HSTS enabled',
        jwtPolicies: 'RS256 algorithm, 15-min access tokens, 7-day refresh tokens, token rotation',
        cookieRules: 'HttpOnly, Secure, SameSite=Strict flags, signed cookies, 24-hour max age'
      },

      cryptography: {
        encryption: 'AES-256-GCM for data-at-rest, key derivation with PBKDF2 (100k iterations)',
        keyExchange: 'RSA-4096 for key exchange, ECDHE for forward secrecy',
        hashing: 'SHA-512 for evidence integrity, Argon2id for password hashing',
        keyStorage: 'AWS KMS/HashiCorp Vault for master keys, envelope encryption for data keys',
        certRotation: 'Automated cert rotation every 90 days with Let\'s Encrypt/cert-manager',
        randomGeneration: 'Cryptographically secure PRNG (crypto.randomBytes), no predictable seeds'
      },

      messageBroker: {
        topicNaming: 'Naming: <domain>.<entity>.<action> (e.g., security.event.created)',
        partitioning: 'Hash partitioning by tenant_id, 12 partitions per topic for parallelism',
        consumerGroups: 'One group per microservice, parallel consumers within group',
        retryTopics: 'Retry topics with increasing delays (1m, 5m, 15m), DLQ after exhaustion',
        backpressure: 'Consumer lag monitoring, dynamic scaling, rate limiting at producer',
        schemaRegistry: 'Confluent Schema Registry, Avro schemas, backward compatibility enforced'
      },

      evidenceHandling: {
        multipartUpload: 'Chunked upload (5MB chunks), resumable uploads, S3 multipart API',
        virusScanning: 'ClamAV scanning on upload, quarantine suspicious files, async processing',
        checksumVerification: 'SHA-256 hash on upload, verification on download, hash stored in metadata',
        tamperProof: 'Immutable storage with versioning, blockchain-style hash chain',
        signedMetadata: 'Digital signature on metadata, timestamp from trusted source, UUIDv7 for ordering',
        secureStorage: 'S3 with server-side encryption (SSE-KMS), versioning enabled, lifecycle policies'
      },

      agentArchitecture: {
        lifecycle: 'Install → Register (get agent_id) → Heartbeat (every 30s) → Update (signed packages) → Retire (graceful shutdown)',
        offlineBuffering: 'Local SQLite buffer (max 1GB), compression, upload when online, queue prioritization',
        signedConfigs: 'Config bundles signed with Ed25519, signature verification before apply',
        encryption: 'Event encryption with agent-specific keys, TLS for transport',
        privilegeHandling: 'Least privilege principle, drop privileges after init, capability-based security on Linux',
        commandSandbox: 'Restricted shell for command execution, whitelist of allowed commands, timeout enforcement'
      },

      loadBalancing: {
        routingPolicies: 'Path-based routing (/api/v1/* → services), host-based (api.example.com)',
        layer4vs7: 'Layer 7 ALB for HTTP/HTTPS, Layer 4 NLB for TCP/UDP, gRPC over L7',
        stickySessions: 'Cookie-based affinity for stateful sessions, consistent hashing for distributed cache',
        grpcBalancing: 'Client-side load balancing with gRPC, round-robin across healthy endpoints',
        failoverRouting: 'Active health checks, automatic failover in 10s, circuit breaker pattern'
      },

      loggingArchitecture: {
        structuredLogging: 'JSON logs with correlation_id, request_id, user_id, timestamp (ISO 8601)',
        logLevels: 'TRACE for debugging, DEBUG for development, INFO for production, WARN for issues, ERROR for failures, FATAL for crashes',
        sampling: '100% ERROR/FATAL, 10% INFO/DEBUG, 1% TRACE to reduce volume',
        redaction: 'PII masking (email → e***@***.com, SSN → ***-**-1234), credit card redaction',
        logShipping: 'FluentBit sidecar → Elasticsearch, batched sends, retry on failure'
      },

      observability: {
        tracing: 'OpenTelemetry auto-instrumentation, context propagation via W3C Trace Context',
        tracePropagation: 'trace-id + span-id in HTTP headers, baggage for metadata',
        spanNaming: 'Convention: <service>.<operation> (e.g., auth-service.login)',
        flameGraphs: 'Continuous profiling with pprof/py-spy, flame graphs for CPU/memory hotspots',
        alerting: 'Alert on p99 latency > 500ms, error rate > 1%, trace error spikes'
      },

      performance: {
        latencyBudget: 'API: p50 < 100ms, p95 < 300ms, p99 < 500ms; DB queries: < 50ms',
        queryOptimization: 'EXPLAIN ANALYZE for slow queries, index on WHERE/JOIN columns, query result caching',
        asyncVsSync: 'Async for I/O-bound (file upload, external API), sync for CPU-bound',
        benchmarking: 'JMeter/k6 load tests, 10k RPS target, 95% success rate under load',
        profiling: 'Continuous profiling in production (1% overhead), pprof for Go, py-spy for Python',
        autoscaling: 'HPA: scale at 70% CPU/80% memory, scale up faster than down, min 3 replicas'
      },

      testing: {
        unitTesting: 'Jest for TypeScript (>80% coverage), pytest for Python, table-driven tests for Go',
        integrationTesting: 'Testcontainers for DB/Kafka, mock external services, E2E for critical paths',
        contractTesting: 'Pact for consumer-driven contracts, Postman collections for API testing',
        e2eTesting: 'Playwright for UI, Selenium for legacy browsers, smoke tests on deploy',
        loadTesting: 'k6 for performance tests, JMeter for complex scenarios, chaos engineering with Chaos Mesh',
        securityTesting: 'SAST with SonarQube, DAST with OWASP ZAP, dependency scanning with Snyk'
      },

      deploymentModel: {
        helmCharts: 'Helm charts for all services, values per environment, chart versioning',
        gitops: 'ArgoCD for continuous deployment, Git as single source of truth, auto-sync enabled',
        canaryDeployments: 'Flagger for automated canary analysis, 10% → 50% → 100% rollout, rollback on metrics',
        featureFlags: 'LaunchDarkly/Unleash for feature toggles, percentage rollouts, kill switches',
        secretsInjection: 'External Secrets Operator, Vault CSI driver, no secrets in Git'
      },

      governance: {
        adrTemplates: 'ADR template with context, decision, consequences, status (proposed/accepted/deprecated)',
        reviewCheckpoints: 'Architecture review before epic start, design review before implementation',
        breakingChanges: 'Breaking changes require RFC, deprecation notice (2 releases), migration guide',
        complianceScanning: 'OPA policies for K8s manifests, Terraform compliance checks, security scans in CI',
        documentation: 'Architecture docs in Git, auto-generated API docs with Swagger, living documentation'
      },

      references: [
        'https://www.12factor.net/',
        'https://martinfowler.com/microservices/',
        'https://kubernetes.io/docs/concepts/',
        'https://opentelemetry.io/docs/'
      ]
    };

    res.json(taDocument);
  } catch (error: any) {
    logger.error('Error generating TA:', { error });
    res.status(500).json({ error: 'Failed to generate TA document', details: error.message });
  }
});

export default router;
