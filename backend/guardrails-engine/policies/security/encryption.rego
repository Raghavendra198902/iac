package dharma.security.encryption

# Encryption Policy
# Ensures storage and database resources have encryption enabled

metadata := {
    "name": "Encryption Required",
    "description": "All storage and database resources must have encryption enabled",
    "severity": "high",
    "category": "security"
}

# Default deny
default allow = false

# Allow if resource has encryption enabled
allow {
    input.type == "storage"
    input.properties.encryption == true
}

allow {
    input.type == "database"
    input.properties.encrypted == true
}

allow {
    # Resource doesn't require encryption
    not requires_encryption
}

# Detect violations
violations[msg] {
    requires_encryption
    not has_encryption
    msg := sprintf("Resource '%s' of type '%s' must have encryption enabled", [input.name, input.type])
}

# Helper: Check if resource requires encryption
requires_encryption {
    resource_types := ["storage", "database", "s3", "rds", "storage-account", "sql-database", "storage-bucket", "cloud-sql"]
    input.type == resource_types[_]
}

# Helper: Check if encryption is enabled
has_encryption {
    input.properties.encryption == true
}

has_encryption {
    input.properties.encrypted == true
}

has_encryption {
    input.properties.encryptionAtRest == "enabled"
}
