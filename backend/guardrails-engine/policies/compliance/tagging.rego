package dharma.compliance.tagging

# Tagging Policy
# Enforces required tags on all resources

metadata := {
    "name": "Required Tags",
    "description": "All resources must have required tags: environment, owner, project",
    "severity": "medium",
    "category": "compliance"
}

required_tags := ["environment", "owner", "project"]

default allow = false

# Allow if all required tags are present
allow if {
    has_all_required_tags
}

# Detect violations
violations contains msg if {
    missing := missing_tags
    count(missing) > 0
    msg := sprintf("Resource '%s' is missing required tags: %v", [input.name, missing])
}

# Helper: Check if all required tags exist
has_all_required_tags if {
    count(missing_tags) == 0
}

# Helper: Get missing tags
missing_tags contains tag if {
    tag := required_tags[_]
    not input.tags[tag]
}

# Warnings for empty tag values
warnings contains msg if {
    tag := required_tags[_]
    input.tags[tag]
    input.tags[tag] == ""
    msg := sprintf("Resource '%s' has empty value for required tag '%s'", [input.name, tag])
}
