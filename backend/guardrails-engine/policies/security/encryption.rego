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
allow if {
    input.type == "storage"
    input.properties.encryption == true
}

allow if {
    input.type == "database"
    input.properties.encrypted == true
}

allow if {
    # Resource doesn't require encryption
    not requires_encryption
}

# Detect violations
violations contains msg if {
    requires_encryption
    not has_encryption
    msg := sprintf("Resource '%s' of type '%s' must have encryption enabled", [input.name, input.type])
}

# Helper: Check if resource requires encryption
requires_encryption if {
    resource_types := ["storage", "database", "s3", "rds", "storage-account", "sql-database", "storage-bucket", "cloud-sql"]
    input.type == resource_types[_]
}

# Helper: Check if encryption is enabled
has_encryption if {
    input.properties.encryption == true
}

has_encryption if {
    input.properties.encrypted == true
}

has_encryption if {
    input.properties.encryptionAtRest == "enabled"
}
