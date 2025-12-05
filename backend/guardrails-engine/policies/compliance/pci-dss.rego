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
violations contains msg if {
    is_cardholder_data_resource
    not has_strong_encryption
    msg := sprintf("Resource '%s' storing cardholder data must use strong encryption (AES-256)", [input.name])
}

# Network segmentation required
violations contains msg if {
    is_cardholder_data_resource
    not is_in_isolated_network
    msg := sprintf("Resource '%s' must be in an isolated network segment for PCI DSS compliance", [input.name])
}

# Access control required
violations contains msg if {
    is_cardholder_data_resource
    not has_strict_access_control
    msg := sprintf("Resource '%s' must have strict access control (need-to-know basis)", [input.name])
}

# All access must be logged
violations contains msg if {
    is_cardholder_data_resource
    not has_comprehensive_logging
    msg := sprintf("Resource '%s' must log all access to cardholder data", [input.name])
}

# Anti-malware protection
warnings contains msg if {
    is_cardholder_data_resource
    input.type == "compute"
    not has_antimalware
    msg := sprintf("Compute resource '%s' should have anti-malware protection", [input.name])
}

# Regular security testing
warnings contains msg if {
    is_cardholder_data_resource
    not has_vulnerability_scanning
    msg := sprintf("Resource '%s' should have regular vulnerability scanning enabled", [input.name])
}

# Patch management
warnings contains msg if {
    is_cardholder_data_resource
    input.type == "compute"
    not has_auto_patching
    msg := sprintf("Compute resource '%s' should have automatic security patching enabled", [input.name])
}

# Helpers
is_cardholder_data_resource if {
    input.tags.dataType == "pci"
}

is_cardholder_data_resource if {
    input.tags.dataType == "cardholder-data"
}

has_strong_encryption if {
    input.properties.encryption == true
    input.properties.encryptionAlgorithm == "AES256"
}

is_in_isolated_network if {
    input.tags.networkSegment == "pci-isolated"
}

is_in_isolated_network if {
    input.properties.vpcId
    input.properties.isolatedSubnet == true
}

has_strict_access_control if {
    input.properties.accessControl == "rbac"
    input.properties.mfaRequired == true
}

has_comprehensive_logging if {
    input.properties.logging.enabled == true
    input.properties.logging.includeAccessLogs == true
    input.properties.logging.retentionDays >= 365
}

has_antimalware if {
    input.properties.antiMalware.enabled == true
}

has_vulnerability_scanning if {
    input.properties.vulnerabilityScanning.enabled == true
    input.properties.vulnerabilityScanning.frequency == "weekly"
}

has_auto_patching if {
    input.properties.autoPatching.enabled == true
}

allow if {
    not is_cardholder_data_resource
}

allow if {
    is_cardholder_data_resource
    count(violations) == 0
}
