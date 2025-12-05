"""
OPA (Open Policy Agent) Integration for IAC Dharma v2.0
Provides policy-as-code enforcement for infrastructure deployments
"""

import requests
import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)


class OPAClient:
    """
    Client for Open Policy Agent integration
    """
    
    def __init__(self, opa_url: str = "http://localhost:8181"):
        self.opa_url = opa_url.rstrip('/')
        self.headers = {"Content-Type": "application/json"}
    
    def evaluate_policy(
        self,
        policy_path: str,
        input_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Evaluate input against OPA policy
        
        Args:
            policy_path: OPA policy path (e.g., "dharma/deployment/allow")
            input_data: Input data to evaluate
            
        Returns:
            Policy evaluation result
        """
        try:
            url = f"{self.opa_url}/v1/data/{policy_path}"
            payload = {"input": input_data}
            
            response = requests.post(
                url,
                headers=self.headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            
            result = response.json()
            return result.get("result", {})
            
        except Exception as e:
            logger.error(f"Failed to evaluate policy: {e}")
            raise
    
    def check_deployment_policy(
        self,
        deployment: Dict[str, Any],
        tenant_id: str,
        user_id: str
    ) -> Dict[str, Any]:
        """
        Check if deployment complies with policies
        
        Args:
            deployment: Deployment configuration
            tenant_id: Tenant identifier
            user_id: User identifier
            
        Returns:
            Policy check result with violations
        """
        input_data = {
            "deployment": deployment,
            "tenant_id": tenant_id,
            "user_id": user_id,
            "timestamp": str(datetime.now())
        }
        
        result = self.evaluate_policy("dharma/deployment/validate", input_data)
        
        return {
            "allowed": result.get("allow", False),
            "violations": result.get("violations", []),
            "warnings": result.get("warnings", []),
            "recommendations": result.get("recommendations", [])
        }
    
    def check_cost_policy(
        self,
        estimated_cost: float,
        budget: float,
        tenant_id: str
    ) -> Dict[str, Any]:
        """
        Check if cost complies with budget policies
        
        Args:
            estimated_cost: Estimated deployment cost
            budget: Tenant budget
            tenant_id: Tenant identifier
            
        Returns:
            Cost policy check result
        """
        input_data = {
            "estimated_cost": estimated_cost,
            "budget": budget,
            "tenant_id": tenant_id
        }
        
        result = self.evaluate_policy("dharma/cost/validate", input_data)
        
        return {
            "allowed": result.get("allow", False),
            "message": result.get("message", ""),
            "threshold_exceeded": estimated_cost > budget
        }
    
    def check_security_policy(
        self,
        blueprint: Dict[str, Any],
        tenant_id: str
    ) -> Dict[str, Any]:
        """
        Check blueprint against security policies
        
        Args:
            blueprint: Blueprint configuration
            tenant_id: Tenant identifier
            
        Returns:
            Security policy check result
        """
        input_data = {
            "blueprint": blueprint,
            "tenant_id": tenant_id
        }
        
        result = self.evaluate_policy("dharma/security/validate", input_data)
        
        return {
            "allowed": result.get("allow", False),
            "security_violations": result.get("violations", []),
            "risk_level": result.get("risk_level", "unknown")
        }


def generate_opa_policies() -> Dict[str, str]:
    """
    Generate OPA Rego policies for IAC Dharma
    
    Returns:
        Dictionary of policy files
    """
    
    # Deployment validation policy
    deployment_policy = """
package dharma.deployment

default allow = false

# Allow deployment if all rules pass
allow {
    not has_violations
    within_quota
    has_required_tags
}

# Check for policy violations
has_violations {
    count(violations) > 0
}

violations[msg] {
    # Check environment
    not input.deployment.environment in ["dev", "staging", "production"]
    msg := "Invalid environment specified"
}

violations[msg] {
    # Check provider
    not input.deployment.provider in ["aws", "azure", "gcp"]
    msg := "Unsupported cloud provider"
}

violations[msg] {
    # Check instance types (prevent expensive instances)
    instance_type := input.deployment.resources[_].instance_type
    instance_type in ["p3.16xlarge", "p4d.24xlarge"]
    msg := sprintf("Instance type %s not allowed", [instance_type])
}

# Check quota limits
within_quota {
    tenant_data := data.tenants[input.tenant_id]
    count(input.deployment.resources) <= tenant_data.max_resources
}

# Require specific tags
has_required_tags {
    required_tags := ["environment", "owner", "cost-center"]
    tags := {tag | input.deployment.tags[tag]}
    required_tags[_] == tags[_]
}

# Warnings for best practices
warnings[msg] {
    not input.deployment.backup_enabled
    msg := "Backup not enabled - recommended for production"
}

warnings[msg] {
    not input.deployment.monitoring_enabled
    msg := "Monitoring not enabled - recommended for all environments"
}

# Recommendations
recommendations[msg] {
    input.deployment.environment == "production"
    not input.deployment.multi_az
    msg := "Consider enabling multi-AZ for production deployments"
}
"""
    
    # Cost validation policy
    cost_policy = """
package dharma.cost

default allow = false

# Allow if cost is within budget
allow {
    input.estimated_cost <= input.budget
}

allow {
    # Allow with approval for cost overruns < 20%
    overage := (input.estimated_cost - input.budget) / input.budget
    overage <= 0.2
}

message = msg {
    input.estimated_cost > input.budget
    overage := input.estimated_cost - input.budget
    msg := sprintf("Cost exceeds budget by $%.2f", [overage])
}

message = msg {
    input.estimated_cost <= input.budget
    msg := "Cost within budget"
}
"""
    
    # Security validation policy
    security_policy = """
package dharma.security

default allow = true
default risk_level = "low"

# Security violations
violations[msg] {
    # Check for public access
    resource := input.blueprint.resources[_]
    resource.public_access == true
    msg := sprintf("Resource %s has public access enabled", [resource.name])
}

violations[msg] {
    # Check for encryption
    resource := input.blueprint.resources[_]
    resource.type == "database"
    not resource.encryption_enabled
    msg := sprintf("Database %s does not have encryption enabled", [resource.name])
}

violations[msg] {
    # Check for default passwords
    resource := input.blueprint.resources[_]
    contains(lower(resource.password), "admin")
    msg := "Default or weak password detected"
}

violations[msg] {
    # Check for unrestricted security groups
    sg := input.blueprint.security_groups[_]
    rule := sg.rules[_]
    rule.cidr == "0.0.0.0/0"
    rule.port in [22, 3389]
    msg := sprintf("Security group %s allows unrestricted access to port %d", [sg.name, rule.port])
}

# Determine risk level
risk_level = "critical" {
    count(violations) > 5
}

risk_level = "high" {
    count(violations) > 2
    count(violations) <= 5
}

risk_level = "medium" {
    count(violations) > 0
    count(violations) <= 2
}

risk_level = "low" {
    count(violations) == 0
}

# Allow with warnings for medium risk
allow {
    risk_level in ["low", "medium"]
}
"""
    
    # Compliance policy
    compliance_policy = """
package dharma.compliance

# GDPR Compliance
gdpr_compliant {
    # Data residency check
    input.blueprint.region in ["eu-west-1", "eu-central-1"]
    
    # Encryption required
    all_encrypted
    
    # Audit logging enabled
    input.blueprint.audit_logging == true
}

all_encrypted {
    count([r | r := input.blueprint.resources[_]; not r.encryption_enabled]) == 0
}

# SOC 2 Compliance
soc2_compliant {
    # Access controls
    input.blueprint.rbac_enabled == true
    
    # Monitoring and alerting
    input.blueprint.monitoring_enabled == true
    
    # Backup and recovery
    input.blueprint.backup_enabled == true
    
    # Change management
    input.blueprint.change_approval_required == true
}

# HIPAA Compliance
hipaa_compliant {
    # PHI encryption
    all_encrypted
    
    # Access logging
    input.blueprint.access_logging == true
    
    # Data retention policy
    input.blueprint.retention_period >= 6
}

violations[msg] {
    not gdpr_compliant
    msg := "Blueprint does not meet GDPR requirements"
}

violations[msg] {
    not soc2_compliant
    msg := "Blueprint does not meet SOC 2 requirements"
}
"""
    
    return {
        "deployment.rego": deployment_policy,
        "cost.rego": cost_policy,
        "security.rego": security_policy,
        "compliance.rego": compliance_policy
    }


# Example usage
if __name__ == "__main__":
    from datetime import datetime
    
    # Initialize OPA client
    opa = OPAClient()
    
    # Example deployment check
    deployment = {
        "environment": "production",
        "provider": "aws",
        "resources": [
            {
                "type": "ec2",
                "instance_type": "t3.medium",
                "name": "web-server"
            }
        ],
        "tags": {
            "environment": "production",
            "owner": "devops",
            "cost-center": "engineering"
        },
        "backup_enabled": True,
        "monitoring_enabled": True
    }
    
    result = opa.check_deployment_policy(
        deployment=deployment,
        tenant_id="tenant-123",
        user_id="user-456"
    )
    
    print("Deployment Policy Check:")
    print(f"Allowed: {result['allowed']}")
    print(f"Violations: {result['violations']}")
    print(f"Warnings: {result['warnings']}")
    
    # Generate policy files
    policies = generate_opa_policies()
    for filename, content in policies.items():
        with open(f"/tmp/{filename}", "w") as f:
            f.write(content)
        print(f"Generated policy: {filename}")
