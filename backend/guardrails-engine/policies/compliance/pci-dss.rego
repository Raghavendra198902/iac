package dharma.compliance.pci_dss

# PCI DSS Compliance Policy
# Enforces PCI DSS requirements for payment card data

metadata := {
    "name": "PCI DSS Compliance",
    "description": "Ensures resources comply with PCI DSS requirements for cardholder data",
    "severity": "critical",
    "category": "compliance"
}

default allow = false

# Cardholder data must be encrypted
violations[msg] {
    is_cardholder_data_resource
    not has_strong_encryption
    msg := sprintf("Resource '%s' storing cardholder data must use strong encryption (AES-256)", [input.name])
}

# Network segmentation required
violations[msg] {
    is_cardholder_data_resource
    not is_in_isolated_network
    msg := sprintf("Resource '%s' must be in an isolated network segment for PCI DSS compliance", [input.name])
}

# Access control required
violations[msg] {
    is_cardholder_data_resource
    not has_strict_access_control
    msg := sprintf("Resource '%s' must have strict access control (need-to-know basis)", [input.name])
}

# All access must be logged
violations[msg] {
    is_cardholder_data_resource
    not has_comprehensive_logging
    msg := sprintf("Resource '%s' must log all access to cardholder data", [input.name])
}

# Anti-malware protection
warnings[msg] {
    is_cardholder_data_resource
    input.type == "compute"
    not has_antimalware
    msg := sprintf("Compute resource '%s' should have anti-malware protection", [input.name])
}

# Regular security testing
warnings[msg] {
    is_cardholder_data_resource
    not has_vulnerability_scanning
    msg := sprintf("Resource '%s' should have regular vulnerability scanning enabled", [input.name])
}

# Patch management
warnings[msg] {
    is_cardholder_data_resource
    input.type == "compute"
    not has_auto_patching
    msg := sprintf("Compute resource '%s' should have automatic security patching enabled", [input.name])
}

# Helpers
is_cardholder_data_resource {
    input.tags.dataType == "pci"
}

is_cardholder_data_resource {
    input.tags.dataType == "cardholder-data"
}

has_strong_encryption {
    input.properties.encryption == true
    input.properties.encryptionAlgorithm == "AES256"
}

is_in_isolated_network {
    input.tags.networkSegment == "pci-isolated"
}

is_in_isolated_network {
    input.properties.vpcId
    input.properties.isolatedSubnet == true
}

has_strict_access_control {
    input.properties.accessControl == "rbac"
    input.properties.mfaRequired == true
}

has_comprehensive_logging {
    input.properties.logging.enabled == true
    input.properties.logging.includeAccessLogs == true
    input.properties.logging.retentionDays >= 365
}

has_antimalware {
    input.properties.antiMalware.enabled == true
}

has_vulnerability_scanning {
    input.properties.vulnerabilityScanning.enabled == true
    input.properties.vulnerabilityScanning.frequency == "weekly"
}

has_auto_patching {
    input.properties.autoPatching.enabled == true
}

allow {
    not is_cardholder_data_resource
}

allow {
    is_cardholder_data_resource
    count(violations) == 0
}
