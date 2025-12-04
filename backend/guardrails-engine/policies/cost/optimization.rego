package dharma.cost.optimization

# Cost Optimization Policy
# Enforces cost optimization best practices

metadata := {
    "name": "Cost Optimization",
    "description": "Ensures resources follow cost optimization best practices",
    "severity": "medium",
    "category": "cost"
}

default allow = true

# Unused resources should be removed
warnings[msg] {
    input.type == "compute"
    input.properties.utilizationPercent < 10
    msg := sprintf("Compute resource '%s' has low utilization (<10%%) - consider downsizing or removing", [input.name])
}

# Oversized instances
warnings[msg] {
    input.type == "compute"
    is_oversized_instance
    msg := sprintf("Compute resource '%s' may be oversized for workload - consider using instance type '%s'", [input.name, recommended_instance_size])
}

# Reserved instances for predictable workloads
warnings[msg] {
    input.type == "compute"
    input.properties.pricingModel == "on-demand"
    input.properties.runningHours >= 720  # Running 24/7
    msg := sprintf("Compute resource '%s' runs 24/7 - consider reserved instances for 40-60%% cost savings", [input.name])
}

# Spot instances for fault-tolerant workloads
warnings[msg] {
    input.type == "compute"
    input.properties.pricingModel == "on-demand"
    input.tags.faultTolerant == "true"
    msg := sprintf("Compute resource '%s' is fault-tolerant - consider spot instances for up to 90%% cost savings", [input.name])
}

# Storage optimization
warnings[msg] {
    input.type == "storage"
    input.properties.accessFrequency == "infrequent"
    input.properties.storageClass == "standard"
    msg := sprintf("Storage resource '%s' has infrequent access - consider infrequent access or glacier storage class", [input.name])
}

# Unattached volumes
violations[msg] {
    input.type == "volume"
    not input.properties.attachedTo
    input.properties.ageInDays > 30
    msg := sprintf("Volume '%s' has been unattached for 30+ days - consider deleting to save costs", [input.name])
}

# Old snapshots
warnings[msg] {
    input.type == "snapshot"
    input.properties.ageInDays > 90
    msg := sprintf("Snapshot '%s' is over 90 days old - review retention policy and delete if no longer needed", [input.name])
}

# Right-sizing recommendations
is_oversized_instance {
    input.type == "compute"
    input.properties.cpuUtilization < 30
    input.properties.memoryUtilization < 30
}

recommended_instance_size = size {
    input.properties.instanceSize == "xlarge"
    is_oversized_instance
    size := "large"
}

recommended_instance_size = size {
    input.properties.instanceSize == "large"
    is_oversized_instance
    size := "medium"
}

# Public IP addresses that aren't needed
warnings[msg] {
    input.type == "compute"
    input.properties.hasPublicIP == true
    not input.tags.requiresPublicAccess == "true"
    msg := sprintf("Compute resource '%s' has public IP but may not need it - removing saves $3-5/month", [input.name])
}

# Data transfer optimization
warnings[msg] {
    input.type == "load-balancer"
    input.properties.crossRegionTraffic == true
    msg := sprintf("Load balancer '%s' routes cross-region traffic - consider regional endpoints to reduce data transfer costs", [input.name])
}
