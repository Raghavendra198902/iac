# IAC Dharma - Automated End-to-End Solution

## 🤖 Fully Automated Infrastructure Pipeline

This document describes the complete automated workflow with auto-approval capabilities.

## Overview

The automated pipeline transforms natural language requirements into deployed, validated infrastructure **without human intervention** (when policies allow).

## End-to-End Flow

```
Requirements → AI Design → Auto-Validate → Auto-Approve → IaC Generate → Auto-Deploy → Monitor → Self-Heal
```

## Automation Levels

### Level 1: Semi-Automated (Default)
- AI generates blueprints
- Human approves design
- Auto-validates policies
- Human approves deployment
- Auto-executes deployment

### Level 2: Auto-Approved (Policy-Based)
- AI generates blueprints
- **Auto-approves if policies pass**
- Auto-validates policies
- **Auto-approves deployment if risk < threshold**
- Auto-executes deployment

### Level 3: Fully Autonomous (Production-Ready)
- AI generates blueprints
- Auto-approves designs
- Auto-validates and remediates
- Auto-approves deployments
- Auto-executes with rollback
- **Auto-heals drift and issues**

## Auto-Approval Rules

### Design Auto-Approval
```yaml
auto_approve_design:
  enabled: true
  conditions:
    - all_guardrails_pass: true
    - security_score: >= 85
    - cost_within_budget: true
    - complexity_level: <= medium
    - environment: [dev, test]
```

### Deployment Auto-Approval
```yaml
auto_approve_deployment:
  enabled: true
  conditions:
    - risk_score: < 30
    - impact_level: low
    - change_window: within_hours
    - rollback_plan: exists
    - environment: [dev, test]
```

### Production Safeguards
```yaml
production_rules:
  auto_approve: false  # Requires explicit override
  require_approvers: 2
  require_change_ticket: true
  deployment_window: scheduled
  rollback_tested: true
```

## Implementation

See the following services:
- `backend/automation-engine/` - Orchestration
- `backend/auto-approval-service/` - Approval logic
- `backend/monitoring-service/` - Drift detection & healing

## Quick Start

Enable full automation:
```bash
# Configure automation level
export AUTOMATION_LEVEL=2  # Auto-approve

# Start automated pipeline
npm run automation:start
```
