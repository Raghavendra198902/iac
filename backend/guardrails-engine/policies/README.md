# OPA Guardrails Policies for IAC Dharma

This directory contains Open Policy Agent (OPA) policies for enforcing
infrastructure governance and compliance.

## Policy Categories

### 1. Security Policies (`security/`)
- Encryption requirements
- Public access restrictions
- IAM best practices
- Network security rules

### 2. Cost Policies (`cost/`)
- Resource size limits
- Cost threshold enforcement
- Budget compliance

### 3. Compliance Policies (`compliance/`)
- Tagging requirements
- Naming conventions
- Region restrictions
- Data residency

### 4. Operational Policies (`operational/`)
- High availability requirements
- Backup configurations
- Monitoring requirements

## Policy Structure

Each policy file follows this structure:

```rego
package dharma.<category>.<policy_name>

# Policy metadata
metadata := {
    "name": "Policy Name",
    "description": "Policy description",
    "severity": "high|medium|low"
}

# Default deny
default allow = false

# Allow conditions
allow {
    # conditions here
}

# Violation detection
violations[msg] {
    # condition for violation
    msg := "Violation message"
}
```

## Testing Policies

Test policies using OPA CLI:

```bash
# Test a single policy
opa test ./policies -v

# Evaluate a policy against data
opa eval -d ./policies -i blueprint.json "data.dharma.security.encryption.violations"
```

## Adding New Policies

1. Create new `.rego` file in appropriate category directory
2. Follow naming convention: `<category>_<name>.rego`
3. Include metadata and documentation
4. Add unit tests in `*_test.rego` file
5. Update this README with policy description

## Policy Enforcement

Policies are enforced via Guardrails Engine API:

```bash
POST /api/guardrails/validate
{
  "blueprintId": "...",
  "code": "...",
  "cloudProvider": "aws"
}
```

Response includes:
- `passed`: boolean
- `violations`: array of policy violations
- `warnings`: array of policy warnings
