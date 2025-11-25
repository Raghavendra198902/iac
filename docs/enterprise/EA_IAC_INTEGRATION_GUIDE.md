                                                                                                            # Integrating Enterprise Architecture with IAC DHARMA Platform

## Practical Implementation Guide

**Document Version**: 1.0  
**Last Updated**: November 23, 2025  
**Purpose**: Bridge Universal EA Framework with IAC DHARMA Platform Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [EA Framework Mapping to IAC DHARMA](#ea-framework-mapping-to-iac-dharma)
3. [Architecture Practice Setup](#architecture-practice-setup)
4. [Governance Integration](#governance-integration)
5. [Technical Implementation](#technical-implementation)
6. [Architecture Repository Integration](#architecture-repository-integration)
7. [Automated Compliance & Governance](#automated-compliance--governance)
8. [Workflow Integration](#workflow-integration)
9. [Metrics and Reporting](#metrics-and-reporting)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

### Purpose of Integration

The IAC DHARMA platform serves as the **technical enabler** for Enterprise Architecture governance and execution. This integration ensures:

- Architecture decisions are **enforced through automation**
- Compliance is **validated before deployment**
- Architecture artifacts are **version-controlled and traceable**
- EA governance is **embedded in development workflow**
- Architecture standards are **codified as templates**
- Portfolio management is **data-driven and real-time**

### Integration Model

```
┌─────────────────────────────────────────────────────────────┐
│            EA Governance Layer (People & Process)           │
│  - Architecture Review Board                                │
│  - Technology Standards Committee                           │
│  - Security Architecture Reviews                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│          IAC DHARMA Platform (Technical Enabler)            │
│  - Blueprint Templates = Architecture Patterns              │
│  - Guardrails Engine = Policy Enforcement                   │
│  - CMDB = Architecture Repository                           │
│  - Cost Analytics = Financial Governance                    │
│  - AI Recommendations = Best Practices                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Infrastructure Deployment Layer                │
│  - Terraform/Bicep/CloudFormation Generation               │
│  - Automated Compliance Validation                          │
│  - Multi-Cloud Deployment                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## EA Framework Mapping to IAC DHARMA

### How EA Roles Use IAC DHARMA

| EA Role | IAC DHARMA Usage | Primary Features |
|---------|------------------|------------------|
| **Chief Enterprise Architect** | Strategic oversight dashboard | Portfolio analytics, compliance metrics, cost trends, technology radar |
| **Solution Architect (Infrastructure)** | Design infrastructure blueprints | Blueprint designer, IaC templates, cloud provider configs, network design |
| **Solution Architect (Application)** | Define application hosting patterns | Container orchestration, compute sizing, load balancer configs |
| **Data Architect** | Design data infrastructure | Database provisioning, data lake setup, backup/DR configuration |
| **Security Architect** | Define security guardrails | Security policies, compliance rules, encryption standards, IAM templates |
| **Integration Architect** | Configure connectivity patterns | VPC peering, API gateway setup, service mesh configs |
| **Cloud Architect** | Multi-cloud strategy execution | Cloud provider selection, region design, cost optimization |
| **DevOps Lead** | CI/CD and deployment automation | Orchestration workflows, deployment pipelines, monitoring setup |
| **Development Teams** | Self-service infrastructure provisioning | Project creation, blueprint selection, code generation |
| **FinOps/CFO** | Cost governance and optimization | Cost forecasting, budget tracking, optimization recommendations |

---

## Architecture Practice Setup

### Step 1: Configure Architecture Governance in IAC DHARMA

#### 1.1 Define Architecture Approval Workflow

**File**: `backend/orchestrator-service/src/workflows/architecture-approval.ts`

```typescript
/**
 * Architecture Review Workflow
 * Implements ARB approval process in IAC DHARMA
 */

export enum ArchitectureReviewStage {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  SECURITY_REVIEW = 'security_review',
  ARCHITECTURE_REVIEW = 'architecture_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONDITIONAL_APPROVAL = 'conditional_approval'
}

export interface ArchitectureReviewRequest {
  blueprintId: string;
  projectId: string;
  submittedBy: string;
  submissionDate: Date;
  businessJustification: string;
  architectureComplexity: 'simple' | 'moderate' | 'complex';
  estimatedCost: number;
  cloudProviders: string[];
  complianceRequirements: string[];
  reviewStage: ArchitectureReviewStage;
  reviewers: ReviewerAssignment[];
  comments: ReviewComment[];
  decisions: ReviewDecision[];
}

export interface ReviewerAssignment {
  reviewerId: string;
  reviewerRole: 'security_architect' | 'enterprise_architect' | 'domain_architect';
  assignedDate: Date;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export class ArchitectureApprovalWorkflow {
  
  // Auto-route based on complexity and cost
  async routeReview(request: ArchitectureReviewRequest): Promise<void> {
    const { architectureComplexity, estimatedCost } = request;
    
    // Simple, low-cost projects: Auto-approve if compliant
    if (architectureComplexity === 'simple' && estimatedCost < 5000) {
      const complianceCheck = await this.validateCompliance(request);
      if (complianceCheck.passed) {
        await this.autoApprove(request);
        return;
      }
    }
    
    // Moderate complexity: Security + Domain Architect review
    if (architectureComplexity === 'moderate') {
      await this.assignReviewers(request, [
        'security_architect',
        'domain_architect'
      ]);
    }
    
    // Complex or high-cost: Full ARB review
    if (architectureComplexity === 'complex' || estimatedCost > 50000) {
      await this.assignReviewers(request, [
        'security_architect',
        'enterprise_architect',
        'domain_architect'
      ]);
      await this.scheduleARBMeeting(request);
    }
  }
  
  // Automated compliance validation
  async validateCompliance(request: ArchitectureReviewRequest): Promise<ComplianceResult> {
    const blueprint = await this.getBlueprint(request.blueprintId);
    const guardrails = await this.getApplicableGuardrails(request);
    
    const results = await Promise.all([
      this.checkSecurityCompliance(blueprint, guardrails),
      this.checkCostCompliance(blueprint, request.estimatedCost),
      this.checkTechnologyCompliance(blueprint),
      this.checkDataCompliance(blueprint, request.complianceRequirements)
    ]);
    
    return {
      passed: results.every(r => r.passed),
      violations: results.flatMap(r => r.violations),
      warnings: results.flatMap(r => r.warnings)
    };
  }
}
```

#### 1.2 Implement Architecture Decision Records (ADR) in IAC DHARMA

**Database Schema**: `database/schemas/architecture_decisions.sql`

```sql
-- Architecture Decision Records
CREATE TABLE architecture_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adr_number INTEGER UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('proposed', 'accepted', 'deprecated', 'superseded')),
    decision_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    supersedes_adr_id UUID REFERENCES architecture_decisions(id),
    
    -- Context
    context TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    decision_drivers JSONB NOT NULL,
    constraints JSONB,
    
    -- Options Analysis
    considered_options JSONB NOT NULL,
    decision_outcome TEXT NOT NULL,
    decision_rationale TEXT NOT NULL,
    
    -- Consequences
    positive_consequences JSONB,
    negative_consequences JSONB,
    
    -- Metadata
    deciders JSONB NOT NULL,
    stakeholders JSONB,
    related_adrs JSONB,
    implementation_link VARCHAR(500),
    
    -- Categorization
    architecture_domain VARCHAR(50) CHECK (architecture_domain IN 
        ('business', 'application', 'data', 'technology', 'security', 'integration')),
    technology_area VARCHAR(100),
    tags JSONB,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Link ADRs to Blueprints
CREATE TABLE blueprint_architecture_decisions (
    blueprint_id UUID NOT NULL REFERENCES blueprints(id),
    adr_id UUID NOT NULL REFERENCES architecture_decisions(id),
    applies_to_component VARCHAR(255),
    PRIMARY KEY (blueprint_id, adr_id)
);

-- Indexes
CREATE INDEX idx_adr_status ON architecture_decisions(status);
CREATE INDEX idx_adr_domain ON architecture_decisions(architecture_domain);
CREATE INDEX idx_adr_date ON architecture_decisions(decision_date DESC);
```

**API Endpoint**: `backend/api-gateway/src/routes/architecture-decisions.ts`

```typescript
/**
 * Architecture Decision Records API
 */

router.post('/api/adr', authenticate, authorize(['architect', 'lead']), async (req, res) => {
  const adr = await createADR({
    title: req.body.title,
    context: req.body.context,
    problem_statement: req.body.problem_statement,
    decision_drivers: req.body.decision_drivers,
    considered_options: req.body.considered_options,
    decision_outcome: req.body.decision_outcome,
    decision_rationale: req.body.decision_rationale,
    positive_consequences: req.body.positive_consequences,
    negative_consequences: req.body.negative_consequences,
    deciders: req.body.deciders,
    architecture_domain: req.body.architecture_domain,
    created_by: req.user.id
  });
  
  res.status(201).json(adr);
});

router.get('/api/adr', authenticate, async (req, res) => {
  const { status, domain, search } = req.query;
  const adrs = await searchADRs({ status, domain, search });
  res.json(adrs);
});

router.get('/api/adr/:id', authenticate, async (req, res) => {
  const adr = await getADR(req.params.id);
  res.json(adr);
});

// Link ADR to blueprint
router.post('/api/blueprints/:blueprintId/adr/:adrId', 
  authenticate, 
  authorize(['architect']), 
  async (req, res) => {
    await linkADRToBlueprint(req.params.blueprintId, req.params.adrId);
    res.status(200).json({ message: 'ADR linked to blueprint' });
});
```

---

### Step 2: Create Architecture Template Library

#### 2.1 Standard Blueprint Templates

**Directory Structure**:
```
iac-templates/
├── enterprise-patterns/
│   ├── three-tier-web-app/
│   │   ├── terraform/
│   │   ├── bicep/
│   │   └── metadata.json
│   ├── microservices-k8s/
│   ├── data-lake-analytics/
│   ├── serverless-api/
│   └── hybrid-connectivity/
├── security-baselines/
│   ├── zero-trust-network/
│   ├── pci-dss-compliant/
│   ├── hipaa-compliant/
│   └── encrypted-data-tier/
└── cost-optimized/
    ├── dev-test-environment/
    ├── auto-scaling-web/
    └── spot-instance-batch/
```

**Template Metadata**: `iac-templates/enterprise-patterns/three-tier-web-app/metadata.json`

```json
{
  "template_id": "enterprise-three-tier-web",
  "template_version": "1.0.0",
  "name": "Enterprise Three-Tier Web Application",
  "description": "Standard three-tier architecture with web, app, and data tiers",
  "architecture_domain": "application",
  "complexity": "moderate",
  "
_cost": 2500,
  
  "architecture_decisions": [
    "ADR-001: Use Application Gateway for L7 routing",
    "ADR-015: PostgreSQL for relational data",
    "ADR-023: Separate subnets per tier"
  ],
  
  "compliance_frameworks": ["SOC2", "ISO27001"],
  
  "components": {
    "web_tier": {
      "type": "vm_scale_set",
      "min_instances": 2,
      "max_instances": 10,
      "instance_type": "Standard_D2s_v3"
    },
    "app_tier": {
      "type": "kubernetes_cluster",
      "node_count": 3,
      "node_type": "Standard_D4s_v3"
    },
    "data_tier": {
      "type": "postgresql_database",
      "tier": "GeneralPurpose",
      "backup_retention_days": 30,
      "geo_redundant_backup": true
    }
  },
  
  "security_controls": {
    "network_segmentation": true,
    "waf_enabled": true,
    "encryption_at_rest": true,
    "encryption_in_transit": true,
    "mfa_required": true,
    "audit_logging": true
  },
  
  "guardrails": {
    "required": [
      "no-public-database-access",
      "enforce-https",
      "require-tags",
      "backup-enabled"
    ],
    "optional": [
      "auto-scaling-enabled",
      "multi-region-dr"
    ]
  },
  
  "estimated_monthly_cost": {
    "minimum": 2500,
    "typical": 4000,
    "maximum": 8000
  },
  
  "approved_by": "enterprise-architecture-board",
  "approval_date": "2025-01-15",
  "review_date": "2025-07-15"
}
```

#### 2.2 Blueprint Template Service

**File**: `backend/blueprint-service/src/services/template-service.ts`

```typescript
/**
 * Template Service
 * Manages architecture-approved blueprint templates
 */

export class TemplateService {
  
  // Load enterprise-approved templates
  async getEnterpriseTemplates(filters?: {
    domain?: string;
    complexity?: string;
    compliance?: string[];
  }): Promise<BlueprintTemplate[]> {
    const templates = await this.loadTemplatesFromRepository();
    
    return templates.filter(t => {
      if (filters?.domain && t.architecture_domain !== filters.domain) return false;
      if (filters?.complexity && t.complexity !== filters.complexity) return false;
      if (filters?.compliance) {
        const hasCompliance = filters.compliance.every(c => 
          t.compliance_frameworks.includes(c)
        );
        if (!hasCompliance) return false;
      }
      return true;
    });
  }
  
  // Create blueprint from approved template
  async instantiateTemplate(
    templateId: string, 
    customization: BlueprintCustomization
  ): Promise<Blueprint> {
    const template = await this.getTemplate(templateId);
    
    // Validate customization doesn't violate template guardrails
    await this.validateCustomization(template, customization);
    
    // Generate blueprint with template defaults + customizations
    const blueprint = {
      ...template.components,
      ...customization,
      template_id: templateId,
      template_version: template.template_version,
      inherits_adrs: template.architecture_decisions,
      compliance_frameworks: template.compliance_frameworks,
      security_controls: template.security_controls
    };
    
    return await this.createBlueprint(blueprint);
  }
  
  // Validate against architecture standards
  async validateAgainstStandards(blueprint: Blueprint): Promise<ValidationResult> {
    const violations: string[] = [];
    const warnings: string[] = [];
    
    // Check technology stack compliance
    const techStack = this.extractTechnologyStack(blueprint);
    const approvedTech = await this.getApprovedTechnologies();
    
    for (const tech of techStack) {
      if (!approvedTech.includes(tech)) {
        violations.push(`Technology ${tech} is not in approved catalog`);
      }
    }
    
    // Check security baseline
    if (!blueprint.security_controls?.encryption_at_rest) {
      violations.push('Encryption at rest is required by security architecture');
    }
    
    if (!blueprint.security_controls?.encryption_in_transit) {
      violations.push('Encryption in transit is required by security architecture');
    }
    
    // Check naming conventions
    const namingCompliant = this.validateNamingConventions(blueprint);
    if (!namingCompliant.valid) {
      warnings.push(...namingCompliant.violations);
    }
    
    // Check tagging requirements
    const requiredTags = ['environment', 'cost_center', 'owner', 'project'];
    const missingTags = requiredTags.filter(tag => !blueprint.tags?.[tag]);
    if (missingTags.length > 0) {
      violations.push(`Missing required tags: ${missingTags.join(', ')}`);
    }
    
    return {
      valid: violations.length === 0,
      violations,
      warnings
    };
  }
}
```

---

## Governance Integration

### Step 3: Implement Guardrails Engine

#### 3.1 Architecture Policy as Code

**File**: `backend/guardrails-engine/policies/architecture-standards.rego`

```rego
# Architecture Standards Policy (Open Policy Agent)
package architecture.standards

# Approved technologies catalog
approved_databases = ["postgresql", "mysql", "mongodb", "redis", "cosmosdb"]
approved_compute = ["vm", "kubernetes", "container_instances", "app_service"]
approved_storage = ["blob_storage", "file_storage", "managed_disk"]

# Deny unapproved database technologies
deny[msg] {
    database := input.resources[_]
    database.type == "database"
    not database.engine in approved_databases
    msg := sprintf("Database engine '%s' is not approved. Use: %v", 
        [database.engine, approved_databases])
}

# Require encryption for data at rest
deny[msg] {
    storage := input.resources[_]
    storage.type in ["database", "storage_account"]
    not storage.encryption_enabled == true
    msg := sprintf("Resource '%s' must have encryption at rest enabled", [storage.name])
}

# Require HTTPS/TLS for all external endpoints
deny[msg] {
    endpoint := input.resources[_]
    endpoint.type in ["load_balancer", "application_gateway", "api_gateway"]
    endpoint.public_facing == true
    not endpoint.https_only == true
    msg := sprintf("Public endpoint '%s' must enforce HTTPS only", [endpoint.name])
}

# Enforce network segmentation
deny[msg] {
    resource := input.resources[_]
    not resource.subnet
    msg := sprintf("Resource '%s' must be deployed to a specific subnet", [resource.name])
}

# Require tags for governance
required_tags = ["environment", "cost_center", "owner", "project", "compliance"]

deny[msg] {
    resource := input.resources[_]
    missing := [tag | tag := required_tags[_]; not resource.tags[tag]]
    count(missing) > 0
    msg := sprintf("Resource '%s' missing required tags: %v", [resource.name, missing])
}

# Cost governance: Require approval for expensive resources
warn[msg] {
    resource := input.resources[_]
    estimated_cost := resource.estimated_monthly_cost
    estimated_cost > 5000
    not resource.architecture_review_approved
    msg := sprintf("Resource '%s' costs $%d/month and requires architecture review", 
        [resource.name, estimated_cost])
}

# Security: No public database access
deny[msg] {
    database := input.resources[_]
    database.type == "database"
    database.public_access_enabled == true
    msg := sprintf("Database '%s' cannot have public access enabled", [database.name])
}

# Compliance: HIPAA workloads must use approved regions
deny[msg] {
    input.compliance_requirements[_] == "HIPAA"
    resource := input.resources[_]
    not resource.region in ["us-east-1", "us-west-2", "eu-west-1"]
    msg := sprintf("HIPAA workloads must use approved regions. Resource '%s' in '%s' is not allowed",
        [resource.name, resource.region])
}

# High availability: Production systems must be multi-AZ
warn[msg] {
    input.environment == "production"
    resource := input.resources[_]
    resource.type in approved_compute
    not resource.high_availability_enabled
    msg := sprintf("Production resource '%s' should enable high availability", [resource.name])
}
```

#### 3.2 Guardrails Enforcement Service

**File**: `backend/guardrails-engine/src/enforcement-service.ts`

```typescript
/**
 * Guardrails Enforcement Service
 * Validates blueprints against architecture policies
 */

import { OpenPolicyAgent } from '@open-policy-agent/opa-wasm';

export class GuardrailsEnforcementService {
  private opa: OpenPolicyAgent;
  
  async evaluateBlueprint(blueprint: Blueprint): Promise<EvaluationResult> {
    // Load applicable policies
    const policies = await this.loadPolicies([
      'architecture-standards',
      'security-baseline',
      'compliance-requirements',
      'cost-governance'
    ]);
    
    // Prepare input for OPA
    const input = {
      resources: blueprint.resources,
      environment: blueprint.environment,
      compliance_requirements: blueprint.compliance_requirements,
      estimated_cost: blueprint.estimated_cost,
      tags: blueprint.tags
    };
    
    // Evaluate against policies
    const result = await this.opa.evaluate(input, policies);
    
    return {
      allowed: result.deny.length === 0,
      violations: result.deny.map(d => ({
        severity: 'error',
        message: d,
        policy: 'architecture-standards'
      })),
      warnings: result.warn.map(w => ({
        severity: 'warning',
        message: w,
        policy: 'architecture-standards'
      })),
      evaluated_at: new Date()
    };
  }
  
  // Pre-deployment validation
  async validateBeforeDeployment(blueprintId: string): Promise<boolean> {
    const blueprint = await this.getBlueprint(blueprintId);
    const evaluation = await this.evaluateBlueprint(blueprint);
    
    if (!evaluation.allowed) {
      // Block deployment
      await this.updateBlueprintStatus(blueprintId, 'blocked', evaluation.violations);
      await this.notifyArchitectureTeam(blueprintId, evaluation);
      return false;
    }
    
    if (evaluation.warnings.length > 0) {
      // Allow but log warnings
      await this.logWarnings(blueprintId, evaluation.warnings);
    }
    
    return true;
  }
}
```

---

## Architecture Repository Integration

### Step 4: CMDB as Architecture Repository

#### 4.1 Architecture Asset Management

**File**: `backend/cmdb-agent/src/architecture-assets.ts`

```typescript
/**
 * Architecture Asset Management
 * CMDB stores architecture artifacts and relationships
 */

export interface ArchitectureAsset {
  id: string;
  asset_type: 'blueprint' | 'template' | 'pattern' | 'standard' | 'adr' | 'component';
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'approved' | 'deprecated' | 'retired';
  
  // Architecture classification
  domain: 'business' | 'application' | 'data' | 'technology' | 'security' | 'integration';
  layer: 'strategy' | 'capability' | 'logical' | 'physical' | 'implementation';
  
  // Governance
  owner: string;
  steward: string;
  approved_by: string[];
  approval_date: Date;
  review_date: Date;
  
  // Relationships
  depends_on: string[];
  related_to: string[];
  implements: string[];  // Which ADRs or standards
  used_by: string[];     // Which projects or blueprints
  
  // Metadata
  tags: Record<string, string>;
  documentation_url: string;
  source_repository: string;
  
  // Metrics
  usage_count: number;
  last_used: Date;
  health_score: number;
}

export class ArchitectureRepository {
  
  // Register new architecture asset
  async registerAsset(asset: ArchitectureAsset): Promise<void> {
    await this.cmdb.insert('architecture_assets', asset);
    await this.updateDependencyGraph(asset);
    await this.indexForSearch(asset);
  }
  
  // Query architecture repository
  async findAssets(criteria: {
    domain?: string;
    layer?: string;
    status?: string;
    tags?: Record<string, string>;
  }): Promise<ArchitectureAsset[]> {
    return await this.cmdb.query('architecture_assets', criteria);
  }
  
  // Get dependency graph
  async getDependencyGraph(assetId: string): Promise<DependencyGraph> {
    const asset = await this.getAsset(assetId);
    const dependencies = await this.resolveDependencies(asset.depends_on);
    const dependents = await this.findDependents(assetId);
    
    return {
      root: asset,
      dependencies,
      dependents,
      depth: this.calculateGraphDepth(dependencies)
    };
  }
  
  // Impact analysis
  async analyzeImpact(assetId: string, changeType: string): Promise<ImpactAnalysis> {
    const graph = await this.getDependencyGraph(assetId);
    const affected = graph.dependents;
    
    return {
      directly_affected: affected.filter(a => a.used_by.includes(assetId)),
      indirectly_affected: affected.filter(a => !a.used_by.includes(assetId)),
      risk_level: this.calculateRisk(affected.length, changeType),
      recommended_actions: this.generateRecommendations(affected, changeType)
    };
  }
  
  // Portfolio health monitoring
  async assessPortfolioHealth(): Promise<PortfolioHealth> {
    const assets = await this.getAllAssets();
    
    return {
      total_assets: assets.length,
      by_status: this.groupBy(assets, 'status'),
      by_domain: this.groupBy(assets, 'domain'),
      deprecated_count: assets.filter(a => a.status === 'deprecated').length,
      avg_health_score: this.average(assets.map(a => a.health_score)),
      underutilized: assets.filter(a => a.usage_count < 5 && a.status === 'approved'),
      needs_review: assets.filter(a => a.review_date < new Date())
    };
  }
}
```

---

## Automated Compliance & Governance

### Step 5: Continuous Compliance Monitoring

#### 5.1 Real-Time Compliance Dashboard

**Frontend Component**: `frontend/src/pages/Architecture/ComplianceDashboard.tsx`

```typescript
/**
 * Architecture Compliance Dashboard
 * Real-time view of architecture governance and compliance
 */

export const ComplianceDashboard: React.FC = () => {
  const { data: compliance } = useQuery('compliance-metrics', fetchComplianceMetrics);
  const { data: violations } = useQuery('active-violations', fetchActiveViolations);
  const { data: portfolio } = useQuery('portfolio-health', fetchPortfolioHealth);
  
  return (
    <DashboardLayout>
      {/* Overall Compliance Score */}
      <Card>
        <h2>Architecture Compliance Score</h2>
        <ComplianceGauge score={compliance.overall_score} target={90} />
        <MetricGrid>
          <Metric 
            label="Standards Compliance" 
            value={`${compliance.standards_compliance}%`}
            trend="up"
          />
          <Metric 
            label="Security Baseline" 
            value={`${compliance.security_compliance}%`}
            trend="stable"
          />
          <Metric 
            label="Cost Governance" 
            value={`${compliance.cost_governance}%`}
            trend="up"
          />
        </MetricGrid>
      </Card>
      
      {/* Active Violations */}
      <Card>
        <h2>Active Policy Violations</h2>
        <ViolationsList>
          {violations.map(v => (
            <ViolationItem key={v.id} severity={v.severity}>
              <Icon name={v.severity === 'critical' ? 'alert-circle' : 'alert-triangle'} />
              <div>
                <h4>{v.policy_name}</h4>
                <p>{v.description}</p>
                <small>Project: {v.project_name} | Detected: {v.detected_at}</small>
              </div>
              <Button onClick={() => remediateViolation(v.id)}>Remediate</Button>
            </ViolationItem>
          ))}
        </ViolationsList>
      </Card>
      
      {/* Portfolio Health */}
      <Card>
        <h2>Architecture Portfolio Health</h2>
        <PortfolioMetrics>
          <Metric label="Total Assets" value={portfolio.total_assets} />
          <Metric label="Approved Templates" value={portfolio.approved_templates} />
          <Metric label="Active Projects" value={portfolio.active_projects} />
          <Metric label="Deprecated Assets" value={portfolio.deprecated_count} />
        </PortfolioMetrics>
        
        <Chart type="donut" data={portfolio.by_domain} title="Assets by Domain" />
        <Chart type="bar" data={portfolio.by_status} title="Assets by Status" />
      </Card>
      
      {/* Architecture Reviews */}
      <Card>
        <h2>Pending Architecture Reviews</h2>
        <ReviewQueue reviews={compliance.pending_reviews} />
      </Card>
    </DashboardLayout>
  );
};
```

---

## Workflow Integration

### Step 6: Development Workflow Integration

#### 6.1 Architecture-First Development Process

```
Developer Workflow with EA Integration:

1. PROJECT INITIATION
   ├─> Developer creates project in IAC DHARMA
   ├─> Selects architecture-approved template
   └─> System applies enterprise standards automatically

2. BLUEPRINT DESIGN
   ├─> Developer customizes blueprint
   ├─> Real-time validation against guardrails
   ├─> Inline suggestions from AI based on architecture patterns
   └─> Automatic ADR linking for technology choices

3. ARCHITECTURE REVIEW (if required)
   ├─> System routes to appropriate reviewers
   ├─> Automated compliance check runs
   ├─> Reviewers notified via email/Slack
   ├─> Review feedback captured in platform
   └─> Approval/rejection with rationale

4. CODE GENERATION
   ├─> Generate IaC code (Terraform/Bicep/CloudFormation)
   ├─> Code includes compliance annotations
   ├─> Standards-compliant naming and tagging
   └─> Security controls embedded

5. DEPLOYMENT
   ├─> Pre-deployment compliance check
   ├─> Automated policy evaluation (OPA)
   ├─> Block if violations found
   └─> Deploy if compliant

6. OPERATIONAL MONITORING
   ├─> Continuous compliance monitoring
   ├─> Drift detection from approved architecture
   ├─> Cost tracking against estimates
   └─> Security posture monitoring

7. PORTFOLIO GOVERNANCE
   ├─> Asset registered in CMDB
   ├─> Relationship mapping
   ├─> Usage tracking
   └─> Health monitoring
```

#### 6.2 Approval Automation

**File**: `backend/orchestrator-service/src/automation/approval-bot.ts`

```typescript
/**
 * Architecture Approval Automation
 * Intelligent routing and auto-approval for compliant blueprints
 */

export class ApprovalAutomation {
  
  async processNewBlueprint(blueprintId: string): Promise<ApprovalDecision> {
    const blueprint = await this.getBlueprint(blueprintId);
    
    // Run automated checks
    const checks = await Promise.all([
      this.checkCompliance(blueprint),
      this.checkSecurity(blueprint),
      this.checkCost(blueprint),
      this.checkTechnologyStack(blueprint)
    ]);
    
    const allPassed = checks.every(c => c.passed);
    
    // Auto-approve if all checks pass and low risk
    if (allPassed && this.isLowRisk(blueprint)) {
      return {
        decision: 'auto_approved',
        rationale: 'All automated checks passed. Low risk assessment.',
        checks_passed: checks,
        approved_by: 'system',
        approved_at: new Date()
      };
    }
    
    // Route to human reviewers if high risk or failures
    if (!allPassed || this.isHighRisk(blueprint)) {
      await this.routeToReviewers(blueprint, checks);
      return {
        decision: 'pending_review',
        rationale: 'Requires human review due to complexity or check failures',
        checks_passed: checks.filter(c => c.passed),
        checks_failed: checks.filter(c => !c.passed),
        routed_to: this.getReviewers(blueprint)
      };
    }
    
    return {
      decision: 'conditional_approval',
      rationale: 'Approved with conditions',
      conditions: this.generateConditions(checks)
    };
  }
  
  // Risk assessment
  private isLowRisk(blueprint: Blueprint): boolean {
    return (
      blueprint.estimated_cost < 5000 &&
      blueprint.complexity === 'simple' &&
      blueprint.uses_approved_template &&
      !blueprint.compliance_requirements.includes('HIPAA') &&
      !blueprint.compliance_requirements.includes('PCI-DSS')
    );
  }
  
  private isHighRisk(blueprint: Blueprint): boolean {
    return (
      blueprint.estimated_cost > 50000 ||
      blueprint.complexity === 'complex' ||
      blueprint.public_facing === true ||
      blueprint.handles_sensitive_data === true ||
      blueprint.compliance_requirements.length > 0
    );
  }
}
```

---

## Metrics and Reporting

### Step 7: Architecture Metrics Integration

#### 7.1 EA Dashboard Metrics API

**File**: `backend/api-gateway/src/routes/architecture-metrics.ts`

```typescript
/**
 * Architecture Metrics API
 * Provides metrics for EA dashboard and reporting
 */

router.get('/api/architecture/metrics/overview', authenticate, async (req, res) => {
  const metrics = {
    governance: {
      compliance_score: await getComplianceScore(),
      active_violations: await getActiveViolationsCount(),
      pending_reviews: await getPendingReviewsCount(),
      review_turnaround_days: await getAvgReviewTurnaroundDays()
    },
    
    portfolio: {
      total_projects: await getTotalProjects(),
      total_blueprints: await getTotalBlueprints(),
      approved_templates: await getApprovedTemplatesCount(),
      technology_stack_compliance: await getTechStackCompliance()
    },
    
    quality: {
      architecture_debt_ratio: await getArchitectureDebtRatio(),
      deprecated_assets_count: await getDeprecatedAssetsCount(),
      avg_reuse_rate: await getAvgReuseRate(),
      standards_adoption_rate: await getStandardsAdoptionRate()
    },
    
    cost: {
      total_monthly_spend: await getTotalMonthlySpend(),
      cost_optimization_opportunities: await getCostOptimizationOpportunities(),
      budget_adherence: await getBudgetAdherence(),
      cost_per_project_avg: await getAvgCostPerProject()
    },
    
    security: {
      security_score: await getSecurityScore(),
      critical_vulnerabilities: await getCriticalVulnerabilitiesCount(),
      encryption_coverage: await getEncryptionCoverage(),
      compliance_certifications: await getComplianceCertifications()
    },
    
    efficiency: {
      time_to_deploy_avg_days: await getAvgTimeToDeployDays(),
      approval_auto_rate: await getAutoApprovalRate(),
      template_usage_rate: await getTemplateUsageRate(),
      developer_satisfaction_score: await getDeveloperSatisfactionScore()
    }
  };
  
  res.json(metrics);
});

// Architecture Decision Records metrics
router.get('/api/architecture/metrics/adrs', authenticate, async (req, res) => {
  const adrs = {
    total_decisions: await getTotalADRs(),
    by_status: await getADRsByStatus(),
    by_domain: await getADRsByDomain(),
    recent_decisions: await getRecentADRs(10),
    most_referenced: await getMostReferencedADRs(5)
  };
  
  res.json(adrs);
});

// Technology portfolio
router.get('/api/architecture/metrics/technology', authenticate, async (req, res) => {
  const tech = {
    approved_technologies: await getApprovedTechnologies(),
    technology_usage: await getTechnologyUsageStats(),
    emerging_technologies: await getEmergingTechnologies(),
    deprecated_technologies: await getDeprecatedTechnologies(),
    technology_debt: await getTechnologyDebt()
  };
  
  res.json(tech);
});
```

---

## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)

**Objectives**: Set up basic EA governance in IAC DHARMA

**Activities**:
1. Configure architecture approval workflow
2. Implement ADR management
3. Create initial template library (5-10 templates)
4. Set up basic guardrails (security, compliance)
5. Integrate CMDB for architecture assets

**Deliverables**:
- Architecture approval workflow operational
- ADR system implemented
- 10 approved architecture templates
- Basic policy enforcement active
- CMDB architecture repository configured

**Success Criteria**:
- All new projects use approval workflow
- 100% of projects use approved templates or get exception
- 80% compliance with basic guardrails

---

### Phase 2: Automation (Months 3-4)

**Objectives**: Automate compliance and governance

**Activities**:
1. Implement automated compliance validation
2. Set up auto-approval for low-risk projects
3. Create architecture compliance dashboard
4. Implement drift detection
5. Set up continuous compliance monitoring

**Deliverables**:
- OPA policy engine integrated
- Auto-approval rules configured
- Real-time compliance dashboard
- Drift detection operational
- Automated compliance reports

**Success Criteria**:
- 50% of simple projects auto-approved
- < 2 days average review turnaround
- 90% compliance score
- Zero critical violations in production

---

### Phase 3: Optimization (Months 5-6)

**Objectives**: Enhance developer experience and architecture insights

**Activities**:
1. Implement AI-powered architecture recommendations
2. Create self-service architecture portal
3. Build architecture analytics and insights
4. Implement portfolio optimization recommendations
5. Set up architecture health monitoring

**Deliverables**:
- AI recommendation engine operational
- Self-service portal with guided workflows
- Architecture analytics dashboard
- Portfolio optimization reports
- Health monitoring automated

**Success Criteria**:
- 70% auto-approval rate
- < 1 day average review turnaround
- 95% compliance score
- 30% increase in template reuse
- Developer satisfaction score > 4/5

---

### Phase 4: Maturity (Months 7-12)

**Objectives**: Achieve architecture excellence and continuous improvement

**Activities**:
1. Implement predictive analytics for architecture risks
2. Create architecture capability assessment framework
3. Set up automated architecture documentation
4. Implement cross-portfolio optimization
5. Establish architecture community of practice

**Deliverables**:
- Predictive risk analytics operational
- Maturity assessment framework active
- Auto-generated architecture documentation
- Cross-portfolio insights and recommendations
- Active architecture community

**Success Criteria**:
- 80% auto-approval rate
- Same-day review turnaround
- 98% compliance score
- 50% increase in reuse
- Architecture maturity level 4+

---

## Quick Start Guide

### For Architects

**1. Set up your first architecture template:**
```bash
# Navigate to templates directory
cd iac-templates/enterprise-patterns

# Create new template
mkdir my-pattern
cd my-pattern

# Create metadata
cat > metadata.json << EOF
{
  "template_id": "my-pattern",
  "name": "My Architecture Pattern",
  "architecture_domain": "application",
  "complexity": "moderate",
  "architecture_decisions": ["ADR-XXX"],
  "guardrails": {
    "required": ["encrypt-at-rest", "network-segmentation"]
  }
}
EOF

# Add Terraform code
mkdir terraform
# ... add your IaC code ...

# Submit for approval
./submit-template.sh my-pattern
```

**2. Create an Architecture Decision Record:**
```bash
# Using IAC DHARMA UI or API
curl -X POST https://iac-dharma.com/api/adr \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Use PostgreSQL for relational data",
    "context": "Need standardized database for transactional workloads",
    "decision_outcome": "PostgreSQL as default relational database",
    "decision_rationale": "Industry standard, good performance, managed service available",
    "architecture_domain": "data",
    "deciders": ["john.doe", "jane.smith"]
  }'
```

**3. Review pending blueprints:**
```bash
# Access IAC DHARMA dashboard
# Navigate to: Architecture > Pending Reviews
# Filter by: Assigned to Me
# Review each blueprint and provide feedback
```

### For Developers

**1. Create a new project with approved template:**
```bash
# Login to IAC DHARMA
# Navigate to: Projects > New Project
# Select approved template: "Three-Tier Web Application"
# Customize as needed (validates against guardrails in real-time)
# Submit for review (or auto-approved if compliant)
```

**2. Check compliance before deployment:**
```bash
# Using CLI
iac-dharma validate blueprint-123

# Output shows:
# ✓ Security compliance: PASSED
# ✓ Cost governance: PASSED
# ✓ Technology standards: PASSED
# ✗ Tagging requirements: FAILED - Missing 'cost_center' tag
```

**3. Generate compliant IaC code:**
```bash
# Generate Terraform
iac-dharma generate blueprint-123 --format terraform

# Code is generated with:
# - Architecture-approved configurations
# - Security controls embedded
# - Compliance annotations
# - Standard naming and tagging
```

---

## Success Metrics

Track these metrics to measure EA integration success:

| Metric | Baseline | Target (6 months) | Target (12 months) |
|--------|----------|-------------------|-------------------|
| Compliance Score | 65% | 90% | 98% |
| Auto-Approval Rate | 0% | 50% | 80% |
| Review Turnaround | 7 days | 2 days | < 1 day |
| Template Usage Rate | 20% | 70% | 90% |
| Standards Violations | 50/month | 10/month | < 5/month |
| Time to Deploy | 14 days | 7 days | 3 days |
| Developer Satisfaction | 3.0/5 | 4.0/5 | 4.5/5 |
| Cost Optimization | - | 10% savings | 20% savings |
| Architecture Reuse | 15% | 40% | 60% |

---

## Conclusion

This integration transforms IAC DHARMA from a simple infrastructure-as-code tool into a **comprehensive Enterprise Architecture governance platform**. By embedding architecture standards, policies, and best practices directly into the development workflow, organizations can achieve:

- **Faster delivery** through approved templates and automation
- **Better compliance** through continuous validation
- **Lower costs** through standardization and optimization
- **Reduced risk** through guardrails and reviews
- **Improved quality** through architecture patterns
- **Greater visibility** through centralized governance

The platform becomes the **single source of truth** for infrastructure architecture, enabling architects to govern at scale while empowering developers to move fast safely.

---

**Document Owner**: Chief Enterprise Architect  
**Last Updated**: November 23, 2025  
**Next Review**: February 23, 2026
