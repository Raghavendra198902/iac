package dharma.security.public_access

# Public Access Policy
# Restricts resources from being publicly accessible without approval

metadata := {
    "name": "Public Access Restricted",
    "description": "Resources should not be publicly accessible without explicit approval",
    "severity": "high",
    "category": "security"
}

default allow = false

# Allow if resource is explicitly marked for public access with approval
allow {
    input.properties.public == true
    input.properties.publicAccessApproved == true
}

# Allow if resource is not public
allow {
    not is_public
}

# Detect violations
violations[msg] {
    is_public
    not input.properties.publicAccessApproved
    msg := sprintf("Resource '%s' is configured for public access without approval", [input.name])
}

# Helper: Check if resource is public
is_public {
    input.properties.public == true
}

is_public {
    input.properties.publicAccess == "enabled"
}

is_public {
    input.properties.accessibility == "public"
}
