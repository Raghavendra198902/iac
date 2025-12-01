package dharma.cost.instance_size

# Instance Size Policy
# Restricts large instance types without approval

metadata := {
    "name": "Instance Size Limits",
    "description": "Large instance types require cost approval",
    "severity": "medium",
    "category": "cost"
}

# Large AWS instance types
large_aws_instances := [
    "m5.8xlarge", "m5.16xlarge", "m5.24xlarge",
    "c5.9xlarge", "c5.18xlarge", "c5.24xlarge",
    "r5.8xlarge", "r5.16xlarge", "r5.24xlarge"
]

default allow = false

# Allow if instance is not large
allow {
    input.cloudProvider == "aws"
    input.type == "ec2"
    not is_large_instance
}

# Allow if large instance has cost approval
allow {
    input.cloudProvider == "aws"
    input.type == "ec2"
    is_large_instance
    input.properties.costApproved == true
}

# Allow non-compute resources
allow {
    input.type != "ec2"
    input.type != "vm"
    input.type != "compute-instance"
}

# Detect violations
violations[msg] {
    input.cloudProvider == "aws"
    input.type == "ec2"
    is_large_instance
    not input.properties.costApproved
    msg := sprintf("Large instance type '%s' requires cost approval for resource '%s'", [input.properties.instanceType, input.name])
}

# Helper: Check if instance type is large
is_large_instance {
    instanceType := input.properties.instanceType
    instanceType == large_aws_instances[_]
}
