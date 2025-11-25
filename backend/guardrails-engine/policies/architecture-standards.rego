package architecture

# ============================================================================
# Approved Technology Catalog
# ============================================================================

approved_databases := ["postgresql", "mysql", "mongodb", "redis", "cosmosdb", "dynamodb", "aurora"]
approved_compute := ["vm", "kubernetes", "aks", "eks", "gke", "container_instances", "app_service", "function_app", "lambda"]
approved_storage := ["blob_storage", "file_storage", "managed_disk", "s3", "efs", "ebs", "azure-disk"]
approved_messaging := ["service_bus", "event_hubs", "kafka", "rabbitmq", "sqs", "sns", "pubsub"]
approved_registries := ["acr.azurecr.io", "gcr.io", "docker.io", "quay.io"]

# ============================================================================
# Technology Compliance
# ============================================================================

# Deny unapproved database technologies
deny contains msg if {
    resource := input.resources[_]
    resource.type == "database"
    not resource.engine in approved_databases
    msg := sprintf("Database engine '%s' is not approved. Use: %v", [resource.engine, approved_databases])
}

# Deny unapproved compute resources
deny contains msg if {
    resource := input.resources[_]
    resource.category == "compute"
    not resource.type in approved_compute
    msg := sprintf("Compute type '%s' is not approved. Use: %v", [resource.type, approved_compute])
}

# Deny unapproved storage services
deny contains msg if {
    resource := input.resources[_]
    resource.category == "storage"
    not resource.type in approved_storage
    msg := sprintf("Storage type '%s' is not approved. Use: %v", [resource.type, approved_storage])
}

# ============================================================================
# Encryption Requirements
# ============================================================================

# Require encryption at rest
deny contains msg if {
    resource := input.resources[_]
    resource.type in ["database", "storage_account", "blob_storage", "file_storage", "s3"]
    not resource.config.encryption_enabled == true
    msg := sprintf("Resource '%s' must have encryption at rest enabled", [resource.name])
}

# Require encryption in transit (HTTPS/TLS)
deny contains msg if {
    resource := input.resources[_]
    resource.type in ["web_app", "api", "load_balancer"]
    not resource.config.https_only == true
    msg := sprintf("Resource '%s' must enforce HTTPS/TLS for data in transit", [resource.name])
}

# ============================================================================
# Network Security
# ============================================================================

# Deny public database access in production
deny contains msg if {
    input.environment == "production"
    resource := input.resources[_]
    resource.type == "database"
    resource.config.publicly_accessible == true
    msg := sprintf("Production database '%s' cannot be publicly accessible", [resource.name])
}

# Require network segmentation
deny contains msg if {
    input.environment == "production"
    resource := input.resources[_]
    resource.category == "compute"
    not resource.config.subnet_id
    msg := sprintf("Production resource '%s' must be in a private subnet", [resource.name])
}

# Require network security groups
warn contains msg if {
    resource := input.resources[_]
    resource.category == "compute"
    not resource.config.security_groups
    msg := sprintf("Resource '%s' should have network security groups configured", [resource.name])
}

# ============================================================================
# Tagging Requirements
# ============================================================================

required_tags := ["environment", "cost_center", "owner", "project", "compliance"]

# Require all mandatory tags
deny contains msg if {
    input.environment == "production"
    tag := required_tags[_]
    not input.tags[tag]
    msg := sprintf("Production deployments must have '%s' tag", [tag])
}

# Warn on missing optional tags
warn contains msg if {
    not input.tags.cost_center
    msg := "Missing 'cost_center' tag - recommended for cost tracking"
}

warn contains msg if {
    not input.tags.owner
    msg := "Missing 'owner' tag - recommended for accountability"
}

# ============================================================================
# High Availability
# ============================================================================

# Require multi-AZ for production
deny contains msg if {
    input.environment == "production"
    resource := input.resources[_]
    resource.criticality == "high"
    not resource.config.multi_az == true
    msg := sprintf("High-criticality production resource '%s' must be multi-AZ", [resource.name])
}

# Require backup enabled
warn contains msg if {
    input.environment == "production"
    resource := input.resources[_]
    resource.type == "database"
    not resource.config.backup_enabled == true
    msg := sprintf("Production database '%s' should have backups enabled", [resource.name])
}

# ============================================================================
# Cost Governance
# ============================================================================

# Deny deployments over threshold without approval
deny contains msg if {
    input.estimated_monthly_cost > 5000
    not input.approval_status == "approved"
    msg := sprintf("Deployments over $5,000/month require architecture approval (estimated: $%d)", [input.estimated_monthly_cost])
}

# Warn on high costs
warn contains msg if {
    input.estimated_monthly_cost > 1000
    input.estimated_monthly_cost <= 5000
    msg := sprintf("High monthly cost detected: $%d - consider optimization", [input.estimated_monthly_cost])
}

# ============================================================================
# Compliance Requirements
# ============================================================================

# HIPAA compliance requirements
deny contains msg if {
    "HIPAA" in input.compliance_frameworks
    resource := input.resources[_]
    resource.type == "storage"
    not resource.region in ["us-east-1", "us-west-2", "eu-west-1"]
    msg := sprintf("HIPAA workloads must use approved regions. '%s' is not approved", [resource.region])
}

# PCI-DSS compliance
deny contains msg if {
    "PCI-DSS" in input.compliance_frameworks
    not input.audit_logging_enabled == true
    msg := "PCI-DSS compliance requires audit logging to be enabled"
}

# GDPR data residency
deny contains msg if {
    "GDPR" in input.compliance_frameworks
    resource := input.resources[_]
    resource.contains_pii == true
    not resource.region in ["eu-west-1", "eu-central-1", "eu-north-1"]
    msg := sprintf("GDPR requires PII data to remain in EU. Resource '%s' is in '%s'", [resource.name, resource.region])
}

# ============================================================================
# Security Best Practices
# ============================================================================

# Require managed identities
warn contains msg if {
    resource := input.resources[_]
    resource.category == "compute"
    not resource.config.managed_identity == true
    msg := sprintf("Resource '%s' should use managed identity instead of credentials", [resource.name])
}

# Require private endpoints for data services
warn contains msg if {
    input.environment == "production"
    resource := input.resources[_]
    resource.type in ["database", "storage_account", "key_vault"]
    not resource.config.private_endpoint == true
    msg := sprintf("Production data service '%s' should use private endpoints", [resource.name])
}

# Deny public blob access
deny contains msg if {
    resource := input.resources[_]
    resource.type == "blob_storage"
    resource.config.public_access == true
    not resource.purpose == "public_content"
    msg := sprintf("Blob storage '%s' should not allow public access unless explicitly for public content", [resource.name])
}

# ============================================================================
# Container Security
# ============================================================================

# Deny privileged containers
deny contains msg if {
    resource := input.resources[_]
    resource.type == "container"
    resource.config.privileged == true
    msg := sprintf("Container '%s' cannot run in privileged mode", [resource.name])
}

# Require approved container registries
deny contains msg if {
    resource := input.resources[_]
    resource.type == "container"
    image_parts := split(resource.config.image, "/")
    registry := image_parts[0]
    not registry in approved_registries
    msg := sprintf("Container image must use approved registry. '%s' is not approved", [registry])
}

# Require resource limits
warn contains msg if {
    resource := input.resources[_]
    resource.type == "container"
    not resource.config.cpu_limit
    not resource.config.memory_limit
    msg := sprintf("Container '%s' should have CPU and memory limits defined", [resource.name])
}

# ============================================================================
# Kubernetes Security
# ============================================================================

# Require network policies
deny contains msg if {
    resource := input.resources[_]
    resource.type == "kubernetes_deployment"
    not resource.config.network_policy_enabled == true
    msg := sprintf("Kubernetes deployment '%s' must have network policies enabled", [resource.name])
}

# Require pod security policy
warn contains msg if {
    resource := input.resources[_]
    resource.type == "kubernetes_namespace"
    not resource.config.pod_security_policy
    msg := sprintf("Kubernetes namespace '%s' should enforce pod security policies", [resource.name])
}

# Require RBAC
deny contains msg if {
    resource := input.resources[_]
    resource.type == "kubernetes_cluster"
    not resource.config.rbac_enabled == true
    msg := "Kubernetes cluster must have RBAC enabled"
}

# ============================================================================
# Monitoring & Observability
# ============================================================================

# Require monitoring for production
warn contains msg if {
    input.environment == "production"
    not input.monitoring_enabled == true
    msg := "Production deployments should have monitoring enabled"
}

# Require audit logging
warn contains msg if {
    input.environment == "production"
    not input.audit_logging_enabled == true
    msg := "Production deployments should have audit logging enabled"
}

# ============================================================================
# Naming Conventions
# ============================================================================

# Enforce naming pattern
warn contains msg if {
    resource := input.resources[_]
    not regex.match(`^[a-z0-9-]+$`, resource.name)
    msg := sprintf("Resource name '%s' should follow naming convention (lowercase, numbers, hyphens only)", [resource.name])
}

# ============================================================================
# Disaster Recovery
# ============================================================================

# Require DR for critical production resources
warn contains msg if {
    input.environment == "production"
    resource := input.resources[_]
    resource.criticality == "high"
    not resource.config.disaster_recovery_configured == true
    msg := sprintf("Critical production resource '%s' should have disaster recovery configured", [resource.name])
}

# ============================================================================
# Compliance Score Calculation
# ============================================================================

compliance_score := 100 if {
    count(deny) == 0
    count(warn) == 0
}

compliance_score := score if {
    violations := count(deny)
    warnings := count(warn)
    violations > 0
    penalty := (violations * 10) + (warnings * 2)
    calculated := 100 - penalty
    calculated > 0
    score := calculated
}

compliance_score := 0 if {
    violations := count(deny)
    warnings := count(warn)
    violations > 0
    penalty := (violations * 10) + (warnings * 2)
    100 - penalty <= 0
}

# ============================================================================
# Allow Decision
# ============================================================================

default allow := false

allow if {
    count(deny) == 0
}
