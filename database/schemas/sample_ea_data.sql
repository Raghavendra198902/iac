-- Sample Architecture Decision Records for IAC DHARMA

-- First, let's insert a sample user for created_by references
-- Assuming users table exists, otherwise we'll use a UUID directly

-- ADR 1: Adopt PostgreSQL as Standard Database
INSERT INTO architecture_decisions (
    id, adr_number, title, status, decision_date, created_by,
    context, problem_statement, decision_drivers, considered_options, 
    decision_outcome, decision_rationale, positive_consequences, 
    negative_consequences, deciders, stakeholders, architecture_domain,
    technology_area, tags, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    1,
    'Use PostgreSQL as Standard Relational Database',
    'accepted',
    CURRENT_TIMESTAMP,
    gen_random_uuid(), -- Placeholder user ID
    'Multiple teams are using different databases (MySQL, SQL Server, Oracle) leading to operational complexity and higher costs. We need to standardize on a single relational database platform.',
    'How do we standardize our relational database technology to reduce complexity and operational overhead?',
    '["Performance requirements", "Cost considerations", "Team expertise", "Cloud compatibility", "Feature requirements"]'::jsonb,
    '["PostgreSQL", "MySQL", "Microsoft SQL Server", "Oracle Database", "Amazon Aurora"]'::jsonb,
    'Adopt PostgreSQL as the standard relational database across the organization for all new projects.',
    'PostgreSQL offers excellent performance, ACID compliance, extensive features (including JSON support), strong community support, open source licensing, and native cloud provider support.',
    '["Reduced operational complexity", "Lower licensing costs", "Strong JSON/JSONB support", "Active community and ecosystem", "Cloud-native support across all major providers", "Advanced features (CTEs, window functions, etc.)"]'::jsonb,
    '["Migration effort for existing systems", "Team training requirements", "May not be optimal for all use cases"]'::jsonb,
    '["Chief Architect", "Data Architect", "Database Team Lead"]'::jsonb,
    '["Development Teams", "Operations Team", "Database Administrators"]'::jsonb,
    'data',
    'Database Systems',
    '["database", "postgresql", "standardization", "data-tier"]'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ADR 2: Kubernetes for Container Orchestration
INSERT INTO architecture_decisions (
    id, adr_number, title, status, decision_date, created_by,
    summary, context, alternatives_considered, decision, consequences,
    rationale, stakeholders, domain, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'ADR-002',
    'Adopt Kubernetes for Container Orchestration',
    'accepted',
    CURRENT_TIMESTAMP,
    'cloud-architect@company.com',
    'Use Kubernetes as the standard platform for deploying and managing containerized applications',
    'Need a scalable, cloud-agnostic platform for managing containers across multiple environments',
    '["Docker Swarm", "Apache Mesos", "HashiCorp Nomad", "AWS ECS", "Azure Container Instances"]',
    'Kubernetes will be the standard container orchestration platform for all new containerized workloads',
    'Kubernetes provides robust orchestration, self-healing, auto-scaling, and multi-cloud portability',
    '["Industry standard", "Extensive ecosystem", "Multi-cloud support", "Strong community", "Advanced features"]',
    '["Platform Team", "DevOps Engineers", "Development Teams"]',
    'technology',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ADR 3: Terraform for Infrastructure as Code
INSERT INTO architecture_decisions (
    id, adr_number, title, status, decision_date, created_by,
    summary, context, alternatives_considered, decision, consequences,
    rationale, stakeholders, domain, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'ADR-003',
    'Use Terraform for Infrastructure as Code',
    'accepted',
    CURRENT_TIMESTAMP,
    'platform-architect@company.com',
    'Terraform is the standard tool for defining and provisioning cloud infrastructure',
    'Teams are using various tools (CloudFormation, ARM templates, scripts) causing inconsistency and technical debt',
    '["AWS CloudFormation", "Azure Resource Manager", "Pulumi", "Ansible", "Custom Scripts"]',
    'Adopt Terraform as the primary IaC tool with HCL as the configuration language',
    'Terraform provides multi-cloud support, declarative syntax, state management, and extensive provider ecosystem',
    '["Multi-cloud capability", "Declarative approach", "Strong state management", "Large provider ecosystem", "Industry adoption"]',
    '["Infrastructure Team", "Cloud Engineers", "Platform Team"]',
    'technology',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ADR 4: API-First Design Approach
INSERT INTO architecture_decisions (
    id, adr_number, title, status, decision_date, created_by,
    summary, context, alternatives_considered, decision, consequences,
    rationale, stakeholders, domain, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'ADR-004',
    'Adopt API-First Design Approach',
    'accepted',
    CURRENT_TIMESTAMP,
    'solution-architect@company.com',
    'All new services must be designed with APIs as the primary interface using OpenAPI specification',
    'Inconsistent API designs across services leading to integration challenges and poor developer experience',
    '["Code-first approach", "Database-first design", "Ad-hoc API design"]',
    'Mandate API-first design using OpenAPI 3.0 specifications before implementation begins',
    'Improves consistency, enables parallel development, better documentation, and easier integration',
    '["Better developer experience", "Consistent API design", "Early validation", "Automated documentation", "Contract-first testing"]',
    '["Enterprise Architect", "API Team", "Development Leads"]',
    'application',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ADR 5: Zero Trust Security Model
INSERT INTO architecture_decisions (
    id, adr_number, title, status, decision_date, created_by,
    summary, context, alternatives_considered, decision, consequences,
    rationale, stakeholders, domain, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'ADR-005',
    'Implement Zero Trust Security Architecture',
    'accepted',
    CURRENT_TIMESTAMP,
    'security-architect@company.com',
    'Transition from perimeter-based security to Zero Trust model with continuous verification',
    'Traditional perimeter-based security is insufficient for cloud-native, distributed architectures',
    '["VPN-based access", "Network segmentation only", "Traditional firewall approach"]',
    'Implement Zero Trust with identity verification, least privilege access, and continuous monitoring',
    'Enhanced security posture but requires comprehensive identity management and monitoring infrastructure',
    '["Modern threat landscape", "Cloud-native architecture", "Remote work requirements", "Compliance mandates", "Reduced attack surface"]',
    '["Security Team", "IAM Team", "Network Team", "Compliance Officer"]',
    'security',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ADR 6: Microservices Architecture Pattern
INSERT INTO architecture_decisions (
    id, adr_number, title, status, decision_date, created_by,
    summary, context, alternatives_considered, decision, consequences,
    rationale, stakeholders, domain, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'ADR-006',
    'Adopt Microservices Architecture for New Applications',
    'accepted',
    CURRENT_TIMESTAMP,
    'enterprise-architect@company.com',
    'New applications should be designed using microservices architecture with bounded contexts',
    'Monolithic applications are difficult to scale, deploy, and maintain independently',
    '["Monolithic architecture", "Service-oriented architecture", "Modular monolith"]',
    'Use microservices with clear domain boundaries, independent deployment, and API-based communication',
    'Increased operational complexity but better scalability, fault isolation, and team autonomy',
    '["Independent scaling", "Technology flexibility", "Fault isolation", "Team independence", "Faster deployment"]',
    '["Architecture Board", "Development Teams", "Operations Team"]',
    'application',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ADR 7: Event-Driven Architecture for Async Communication
INSERT INTO architecture_decisions (
    id, adr_number, title, status, decision_date, created_by,
    summary, context, alternatives_considered, decision, consequences,
    rationale, stakeholders, domain, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'ADR-007',
    'Use Event-Driven Architecture for Asynchronous Communication',
    'accepted',
    CURRENT_TIMESTAMP,
    'integration-architect@company.com',
    'Adopt event-driven patterns using message brokers for asynchronous service communication',
    'Tight coupling between services through synchronous calls creates cascading failures and scalability issues',
    '["Direct REST API calls", "Database polling", "File-based integration", "ETL batch processing"]',
    'Use Apache Kafka for event streaming and RabbitMQ for message queuing between services',
    'Improved decoupling and resilience but adds complexity in debugging and data consistency management',
    '["Loose coupling", "Better resilience", "Scalability", "Event sourcing capability", "Real-time processing"]',
    '["Integration Team", "Development Teams", "Operations Team"]',
    'integration',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- ADR 8: Observability with OpenTelemetry
INSERT INTO architecture_decisions (
    id, adr_number, title, status, decision_date, created_by,
    summary, context, alternatives_considered, decision, consequences,
    rationale, stakeholders, domain, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'ADR-008',
    'Standardize on OpenTelemetry for Observability',
    'accepted',
    CURRENT_TIMESTAMP,
    'platform-architect@company.com',
    'Use OpenTelemetry for distributed tracing, metrics, and logging across all services',
    'Multiple monitoring tools and proprietary agents creating vendor lock-in and operational overhead',
    '["Proprietary APM tools", "Custom logging frameworks", "Multiple vendor-specific agents"]',
    'Adopt OpenTelemetry SDK and instrumentation with vendor-neutral data collection',
    'Vendor independence and standardization but requires migration effort from existing solutions',
    '["Vendor neutrality", "Industry standard", "Unified observability", "Cost efficiency", "Flexibility"]',
    '["Observability Team", "SRE Team", "Development Teams"]',
    'technology',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Sample Architecture Review Request
INSERT INTO architecture_review_requests (
    id, blueprint_id, requestor, status, priority, complexity,
    estimated_cost_monthly, submitted_at, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'bp-sample-001',
    'developer@company.com',
    'submitted',
    'medium',
    'moderate',
    3500,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Sample Architecture Template
INSERT INTO architecture_templates (
    id, name, description, category, version, complexity,
    estimated_cost_monthly_min, estimated_cost_monthly_max,
    compliance_frameworks, architecture_decisions,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'Three-Tier Web Application',
    'Standard three-tier architecture with web, application, and database layers',
    'web-application',
    '1.0.0',
    'moderate',
    2500,
    8000,
    '["SOC2", "ISO27001"]',
    '["ADR-001", "ADR-002", "ADR-003", "ADR-005"]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Sample Architecture Asset (CMDB)
INSERT INTO architecture_assets (
    id, asset_type, name, description, domain, architecture_layer,
    status, version, owner, tags, usage_count,
    created_at, updated_at
) VALUES (
    gen_random_uuid(),
    'pattern',
    'Microservices Pattern',
    'Standard microservices architecture pattern with API gateway and service mesh',
    'application',
    'logical',
    'active',
    '2.0.0',
    'architecture-team@company.com',
    '["microservices", "kubernetes", "service-mesh", "api-gateway"]',
    25,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Link ADRs to Templates (many-to-many relationship)
-- This would be in blueprint_architecture_decisions table when blueprints exist

COMMENT ON TABLE architecture_decisions IS 'Sample ADRs populated for IAC DHARMA EA integration';
