# IAC Dharma Database Architecture

## Overview

The IAC Dharma platform uses PostgreSQL 15+ as its primary relational database for storing blueprints, deployments, policies, and metadata.

## Database Design Principles

1. **Multi-tenancy**: All tables include `tenant_id` for logical isolation
2. **Audit Trail**: Immutable audit logs with WORM-like characteristics
3. **Versioning**: Blueprint and deployment version management
4. **Graph Support**: JSONB columns for blueprint graph structures
5. **Soft Deletes**: Logical deletion with `deleted_at` timestamps

## Schema Organization

```
iac_dharma/
├── core/           # Core entities (tenants, users, projects)
├── blueprints/     # Blueprint and component data
├── iac/            # IaC generation and deployment
├── policies/       # Guardrails and compliance
├── costing/        # Cost and effort models
├── knowledge/      # Knowledge graph and patterns
└── audit/          # Audit and event logs
```

## Key Tables

### Core Schema
- `tenants` - Organization/tenant data
- `users` - User accounts and profiles
- `roles` - RBAC roles (EA, SA, TA, PM, SE)
- `user_roles` - User-role assignments
- `projects` - Project containers
- `environments` - Environment definitions (Dev/Test/Prod)

### Blueprint Schema
- `blueprints` - Blueprint metadata
- `blueprint_versions` - Immutable snapshots
- `components` - Infrastructure components/nodes
- `relations` - Component relationships/edges
- `component_properties` - Extended properties (JSONB)

### IaC Schema
- `iac_artifacts` - Generated IaC files
- `deployment_plans` - Planned infrastructure changes
- `deployment_runs` - Execution history
- `drift_events` - Configuration drift tracking

### Policy Schema
- `policies` - Guardrail rules
- `policy_evaluations` - Evaluation results
- `compliance_controls` - Framework controls (CIS, NIST)
- `policy_violations` - Recorded violations

### Costing Schema
- `cost_models` - Pricing models
- `cost_estimates` - Blueprint cost calculations
- `effort_estimates` - People effort calculations
- `tco_analyses` - Total cost of ownership

### Knowledge Schema
- `patterns` - Reusable architecture patterns
- `pattern_usages` - Pattern application tracking
- `incidents` - Linked incident data
- `recommendations` - AI-generated suggestions

### Audit Schema
- `audit_events` - Immutable event log
- `change_requests` - ITSM integration
- `approvals` - Approval workflows

## Migration Strategy

- Use Flyway or Liquibase for version-controlled migrations
- Separate migrations for schema and reference data
- Support for zero-downtime deployments

## Performance Optimizations

- Indexes on tenant_id, project_id, created_at
- Partitioning for large audit tables
- JSONB GIN indexes for blueprint graphs
- Connection pooling (PgBouncer)

## Backup & Recovery

- Daily full backups
- Hourly incremental backups
- Point-in-time recovery (PITR) enabled
- Cross-region replication for DR
