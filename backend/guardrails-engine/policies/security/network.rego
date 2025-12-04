package dharma.security.network

# Network Security Policy
# Enforces network security best practices

metadata := {
    "name": "Network Security",
    "description": "Ensures proper network security configurations",
    "severity": "high",
    "category": "security"
}

default allow = false

# SSH should not be open to 0.0.0.0/0
violations[msg] {
    input.type == "security-group"
    rule := input.properties.ingressRules[_]
    rule.port == 22
    rule.cidr == "0.0.0.0/0"
    msg := sprintf("Security group '%s' allows SSH (port 22) from 0.0.0.0/0", [input.name])
}

# RDP should not be open to 0.0.0.0/0
violations[msg] {
    input.type == "security-group"
    rule := input.properties.ingressRules[_]
    rule.port == 3389
    rule.cidr == "0.0.0.0/0"
    msg := sprintf("Security group '%s' allows RDP (port 3389) from 0.0.0.0/0", [input.name])
}

# Database ports should not be open to internet
violations[msg] {
    input.type == "security-group"
    rule := input.properties.ingressRules[_]
    is_database_port(rule.port)
    rule.cidr == "0.0.0.0/0"
    msg := sprintf("Security group '%s' allows database port %d from 0.0.0.0/0", [input.name, rule.port])
}

# Helper: Check if port is a common database port
is_database_port(port) {
    database_ports := [3306, 5432, 1433, 27017, 6379]
    port == database_ports[_]
}

# All traffic should not be allowed from 0.0.0.0/0
violations[msg] {
    input.type == "security-group"
    rule := input.properties.ingressRules[_]
    rule.port == 0
    rule.cidr == "0.0.0.0/0"
    msg := sprintf("Security group '%s' allows all traffic from 0.0.0.0/0", [input.name])
}

# VPCs should have flow logs enabled
violations[msg] {
    input.type == "vpc"
    not input.properties.flowLogsEnabled
    msg := sprintf("VPC '%s' should have flow logs enabled for security monitoring", [input.name])
}

# Subnets should not auto-assign public IPs unless explicitly needed
warnings[msg] {
    input.type == "subnet"
    input.properties.mapPublicIpOnLaunch == true
    not input.tags.public == "true"
    msg := sprintf("Subnet '%s' auto-assigns public IPs but is not tagged as public", [input.name])
}

allow {
    count(violations) == 0
}
