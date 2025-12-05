package dharma.compliance.hipaa

# HIPAA Compliance Policy
# Enforces HIPAA requirements for healthcare applications

metadata := {
    "name": "HIPAA Compliance",
    "description": "Ensures resources comply with HIPAA requirements",
    "severity": "critical",
    "category": "compliance"
}

default allow = false

# Storage must have encryption at rest
violations contains msg if {
    is_phi_storage
    not has_encryption_at_rest
    msg := sprintf("Storage resource '%s' must have encryption at rest for HIPAA compliance", [input.name])
}

# Storage must have encryption in transit
violations contains msg if {
    is_phi_storage
    not has_encryption_in_transit
    msg := sprintf("Storage resource '%s' must have encryption in transit (HTTPS/TLS) for HIPAA compliance", [input.name])
}

# Access logging must be enabled
violations contains msg if {
    is_phi_resource
    not has_access_logging
    msg := sprintf("Resource '%s' must have access logging enabled for HIPAA audit requirements", [input.name])
}

# Backup must be enabled
violations contains msg if {
    is_phi_storage
    not has_backup_enabled
    msg := sprintf("Storage resource '%s' must have automated backups for HIPAA compliance", [input.name])
}

# MFA should be required for access
warnings contains msg if {
    is_phi_resource
    not requires_mfa
    msg := sprintf("Resource '%s' should require MFA for access to PHI", [input.name])
}

# Data retention policy required
violations contains msg if {
    is_phi_storage
    not has_retention_policy
    msg := sprintf("Storage resource '%s' must have a data retention policy (6 years for HIPAA)", [input.name])
}

# Helpers
is_phi_storage if {
    storage_types := ["storage", "database", "s3", "rds", "storage-account", "sql-database"]
    input.type == storage_types[_]
    input.tags.dataType == "phi"
}

is_phi_resource if {
    input.tags.dataType == "phi"
}

has_encryption_at_rest if {
    input.properties.encryption == true
}

has_encryption_at_rest if {
    input.properties.encryptionAtRest == "enabled"
}

has_encryption_in_transit if {
    input.properties.httpsOnly == true
}

has_encryption_in_transit if {
    input.properties.requireSSL == true
}

has_access_logging if {
    input.properties.logging.enabled == true
}

has_access_logging if {
    input.properties.auditLogging == true
}

has_backup_enabled if {
    input.properties.backup.enabled == true
}

has_backup_enabled if {
    input.properties.backupRetentionDays > 0
}

requires_mfa if {
    input.properties.mfaRequired == true
}

has_retention_policy if {
    input.properties.retentionPolicy.enabled == true
    input.properties.retentionPolicy.days >= 2190  # 6 years
}

allow if {
    not is_phi_resource
}

allow if {
    is_phi_resource
    count(violations) == 0
}
