-- Sample Architecture Decision Records for IAC DHARMA
-- Matches actual database schema

-- ADR 1: PostgreSQL Standard
INSERT INTO architecture_decisions (
    adr_number, title, status, context, problem_statement,
    decision_drivers, considered_options, decision_outcome, decision_rationale,
    positive_consequences, deciders, architecture_domain, technology_area,
    tags, created_by
) VALUES (
    1,
    'Use PostgreSQL as Standard Relational Database',
    'accepted',
    'Multiple teams using different databases (MySQL, SQL Server, Oracle) leading to operational complexity',
    'How do we standardize relational database technology to reduce complexity?',
    '["Performance", "Cost", "Cloud compatibility"]'::jsonb,
    '["PostgreSQL", "MySQL", "SQL Server", "Oracle"]'::jsonb,
    'Adopt PostgreSQL as the standard relational database',
    'PostgreSQL offers excellent performance, ACID compliance, JSON support, and is open source',
    '["Reduced complexity", "Lower costs", "Cloud-native support"]'::jsonb,
    '["Chief Architect", "Data Architect"]'::jsonb,
    'data',
    'Database Systems',
    '["database", "postgresql", "standardization"]'::jsonb,
    gen_random_uuid()
);

-- ADR 2: Kubernetes
INSERT INTO architecture_decisions (
    adr_number, title, status, context, problem_statement,
    decision_drivers, considered_options, decision_outcome, decision_rationale,
    positive_consequences, deciders, architecture_domain, technology_area,
    tags, created_by
) VALUES (
    2,
    'Adopt Kubernetes for Container Orchestration',
    'accepted',
    'Need scalable, cloud-agnostic platform for managing containers',
    'What container orchestration platform should we standardize on?',
    '["Scalability", "Multi-cloud", "Ecosystem"]'::jsonb,
    '["Kubernetes", "Docker Swarm", "ECS", "Nomad"]'::jsonb,
    'Kubernetes as standard container orchestration platform',
    'Industry standard with robust features, self-healing, and multi-cloud support',
    '["Industry standard", "Extensive ecosystem", "Multi-cloud"]'::jsonb,
    '["Platform Team", "DevOps Engineers"]'::jsonb,
    'technology',
    'Container Orchestration',
    '["kubernetes", "containers", "orchestration"]'::jsonb,
    gen_random_uuid()
);

-- ADR 3: Terraform
INSERT INTO architecture_decisions (
    adr_number, title, status, context, problem_statement,
    decision_drivers, considered_options, decision_outcome, decision_rationale,
    positive_consequences, deciders, architecture_domain, technology_area,
    tags, created_by
) VALUES (
    3,
    'Use Terraform for Infrastructure as Code',
    'accepted',
    'Teams using various IaC tools causing inconsistency',
    'How do we standardize infrastructure provisioning?',
    '["Multi-cloud", "Declarative", "State management"]'::jsonb,
    '["Terraform", "CloudFormation", "Pulumi", "Ansible"]'::jsonb,
    'Adopt Terraform as primary IaC tool',
    'Multi-cloud support, declarative syntax, strong state management',
    '["Multi-cloud capability", "Large ecosystem", "Industry adoption"]'::jsonb,
    '["Infrastructure Team", "Cloud Engineers"]'::jsonb,
    'technology',
    'Infrastructure as Code',
    '["terraform", "iac", "automation"]'::jsonb,
    gen_random_uuid()
);

-- ADR 4: API-First Design
INSERT INTO architecture_decisions (
    adr_number, title, status, context, problem_statement,
    decision_drivers, considered_options, decision_outcome, decision_rationale,
    positive_consequences, deciders, architecture_domain, technology_area,
    tags, created_by
) VALUES (
    4,
    'Adopt API-First Design Approach',
    'accepted',
    'Inconsistent API designs causing integration challenges',
    'How do we ensure consistent API design across services?',
    '["Consistency", "Integration", "Documentation"]'::jsonb,
    '["API-first", "Code-first", "Database-first"]'::jsonb,
    'Mandate API-first design using OpenAPI 3.0',
    'Improves consistency, enables parallel development, better documentation',
    '["Better developer experience", "Consistent design", "Early validation"]'::jsonb,
    '["Enterprise Architect", "API Team"]'::jsonb,
    'application',
    'API Design',
    '["api", "openapi", "design"]'::jsonb,
    gen_random_uuid()
);

-- ADR 5: Zero Trust Security
INSERT INTO architecture_decisions (
    adr_number, title, status, context, problem_statement,
    decision_drivers, considered_options, decision_outcome, decision_rationale,
    positive_consequences, deciders, architecture_domain, technology_area,
    tags, created_by
) VALUES (
    5,
    'Implement Zero Trust Security Architecture',
    'accepted',
    'Traditional perimeter security insufficient for cloud-native architectures',
    'How do we secure distributed cloud-native applications?',
    '["Security", "Compliance", "Remote access"]'::jsonb,
    '["Zero Trust", "VPN-based", "Network segmentation"]'::jsonb,
    'Implement Zero Trust with identity verification and least privilege',
    'Enhanced security posture for modern threat landscape',
    '["Enhanced security", "Better compliance", "Reduced attack surface"]'::jsonb,
    '["Security Team", "IAM Team"]'::jsonb,
    'security',
    'Security Architecture',
    '["security", "zero-trust", "identity"]'::jsonb,
    gen_random_uuid()
);

SELECT 'Inserted ' || COUNT(*) || ' sample ADRs' FROM architecture_decisions WHERE adr_number <= 5;
