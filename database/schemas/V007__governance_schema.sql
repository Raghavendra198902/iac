-- IAC Dharma Governance Schema
-- Version: V007
-- Description: Enterprise architecture governance, policies, and compliance tracking

-- Governance policies table
CREATE TABLE governance_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    policy_type VARCHAR(50) NOT NULL,
    -- PolicyType: security, compliance, cost, architecture, operational
    
    category VARCHAR(50) NOT NULL,
    -- Category: cloud-provider, resource-usage, access-control, data-protection, etc.
    
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- Status: draft, active, deprecated, archived
    
    severity VARCHAR(20) NOT NULL,
    -- Severity: advisory, warning, error, critical
    
    -- Policy definition
    policy_rules JSONB NOT NULL,
    enforcement_level VARCHAR(20) NOT NULL,
    -- EnforcementLevel: advisory, soft-fail, hard-fail
    
    -- Ownership and approval
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Versioning
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    parent_policy_id UUID REFERENCES governance_policies(id),
    
    -- Effective dates
    effective_from DATE NOT NULL,
    effective_until DATE,
    
    -- Exemptions and exceptions
    exemptions_allowed BOOLEAN DEFAULT FALSE,
    exemption_approval_required BOOLEAN DEFAULT TRUE,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
    CONSTRAINT valid_severity CHECK (severity IN ('advisory', 'warning', 'error', 'critical')),
    CONSTRAINT valid_enforcement CHECK (enforcement_level IN ('advisory', 'soft-fail', 'hard-fail'))
);

CREATE INDEX idx_policies_tenant ON governance_policies(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_policies_type ON governance_policies(policy_type);
CREATE INDEX idx_policies_category ON governance_policies(category);
CREATE INDEX idx_policies_status ON governance_policies(status);
CREATE INDEX idx_policies_created_by ON governance_policies(created_by);

-- Policy violations tracking
CREATE TABLE policy_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    policy_id UUID NOT NULL REFERENCES governance_policies(id),
    
    resource_type VARCHAR(50) NOT NULL,
    -- ResourceType: blueprint, deployment, iac-template, guardrail
    
    resource_id UUID NOT NULL,
    resource_name VARCHAR(255),
    
    severity VARCHAR(20) NOT NULL,
    violation_type VARCHAR(50) NOT NULL,
    
    violation_details TEXT NOT NULL,
    violation_data JSONB DEFAULT '{}',
    
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    detected_by VARCHAR(50) NOT NULL,
    -- DetectedBy: automated-scan, manual-review, ci-cd, runtime
    
    -- Resolution
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    -- Status: open, acknowledged, remediated, exempted, false-positive
    
    assigned_to UUID REFERENCES users(id),
    
    remediation_plan TEXT,
    remediated_at TIMESTAMP WITH TIME ZONE,
    remediation_notes TEXT,
    
    -- Exemption
    exemption_requested BOOLEAN DEFAULT FALSE,
    exemption_approved BOOLEAN DEFAULT FALSE,
    exemption_approved_by UUID REFERENCES users(id),
    exemption_reason TEXT,
    exemption_expires_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('open', 'acknowledged', 'remediated', 'exempted', 'false-positive'))
);

CREATE INDEX idx_violations_tenant ON policy_violations(tenant_id);
CREATE INDEX idx_violations_policy ON policy_violations(policy_id);
CREATE INDEX idx_violations_resource ON policy_violations(resource_type, resource_id);
CREATE INDEX idx_violations_severity ON policy_violations(severity);
CREATE INDEX idx_violations_status ON policy_violations(status);
CREATE INDEX idx_violations_detected_at ON policy_violations(detected_at DESC);

-- Architecture patterns
CREATE TABLE architecture_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    pattern_type VARCHAR(50) NOT NULL,
    -- PatternType: reference-architecture, design-pattern, anti-pattern
    
    category VARCHAR(50) NOT NULL,
    -- Category: microservices, serverless, data, security, integration
    
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- Status: draft, approved, deprecated, archived
    
    -- Pattern definition
    pattern_definition JSONB NOT NULL,
    implementation_guide TEXT,
    best_practices TEXT,
    
    -- References and documentation
    documentation_url VARCHAR(500),
    diagram_url VARCHAR(500),
    example_implementations JSONB DEFAULT '[]',
    
    -- Approval workflow
    created_by UUID NOT NULL REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_status CHECK (status IN ('draft', 'approved', 'deprecated', 'archived')),
    CONSTRAINT valid_type CHECK (pattern_type IN ('reference-architecture', 'design-pattern', 'anti-pattern'))
);

CREATE INDEX idx_patterns_tenant ON architecture_patterns(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patterns_type ON architecture_patterns(pattern_type);
CREATE INDEX idx_patterns_category ON architecture_patterns(category);
CREATE INDEX idx_patterns_status ON architecture_patterns(status);

-- Pattern approvals workflow
CREATE TABLE pattern_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_id UUID NOT NULL REFERENCES architecture_patterns(id) ON DELETE CASCADE,
    
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Status: pending, approved, rejected, changes-requested
    
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    
    comments TEXT,
    review_notes TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'changes-requested'))
);

CREATE INDEX idx_pattern_approvals_pattern ON pattern_approvals(pattern_id);
CREATE INDEX idx_pattern_approvals_status ON pattern_approvals(status);

-- Compliance frameworks
CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    name VARCHAR(255) NOT NULL,
    -- Name: SOC2, HIPAA, GDPR, PCI-DSS, ISO-27001, etc.
    
    description TEXT,
    framework_version VARCHAR(50),
    
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- Status: active, inactive
    
    requirements JSONB NOT NULL,
    controls JSONB DEFAULT '[]',
    
    applicable_to JSONB DEFAULT '{}',
    -- ApplicableTo: environments, services, data-types
    
    -- Certification
    certification_required BOOLEAN DEFAULT FALSE,
    certification_date DATE,
    certification_expiry DATE,
    certification_authority VARCHAR(255),
    
    -- Audit
    last_audit_date DATE,
    next_audit_date DATE,
    audit_frequency VARCHAR(20),
    -- AuditFrequency: monthly, quarterly, semi-annual, annual
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive'))
);

CREATE INDEX idx_frameworks_tenant ON compliance_frameworks(tenant_id);
CREATE INDEX idx_frameworks_status ON compliance_frameworks(status);

-- Compliance assessments
CREATE TABLE compliance_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id),
    
    assessment_date DATE NOT NULL,
    assessed_by UUID NOT NULL REFERENCES users(id),
    
    scope TEXT NOT NULL,
    -- Scope: what was assessed
    
    status VARCHAR(20) NOT NULL DEFAULT 'in-progress',
    -- Status: in-progress, completed, failed
    
    -- Results
    total_controls INTEGER NOT NULL,
    compliant_controls INTEGER DEFAULT 0,
    non_compliant_controls INTEGER DEFAULT 0,
    not_applicable_controls INTEGER DEFAULT 0,
    
    compliance_score DECIMAL(5, 2),
    -- Compliance score percentage
    
    findings JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    
    -- Remediation
    remediation_plan TEXT,
    remediation_deadline DATE,
    remediation_status VARCHAR(20),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('in-progress', 'completed', 'failed'))
);

CREATE INDEX idx_assessments_tenant ON compliance_assessments(tenant_id);
CREATE INDEX idx_assessments_framework ON compliance_assessments(framework_id);
CREATE INDEX idx_assessments_date ON compliance_assessments(assessment_date DESC);
CREATE INDEX idx_assessments_status ON compliance_assessments(status);

-- Cost optimization recommendations
CREATE TABLE cost_optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    project_id UUID,
    
    recommendation_type VARCHAR(50) NOT NULL,
    -- RecommendationType: rightsizing, reserved-instances, spot-instances, storage-optimization
    
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    
    current_cost DECIMAL(12, 2) NOT NULL,
    projected_cost DECIMAL(12, 2) NOT NULL,
    potential_savings DECIMAL(12, 2) NOT NULL,
    savings_percentage DECIMAL(5, 2),
    
    priority VARCHAR(20) NOT NULL,
    -- Priority: low, medium, high, critical
    
    recommendation_details TEXT NOT NULL,
    implementation_effort VARCHAR(20),
    -- ImplementationEffort: low, medium, high
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    -- Status: open, in-progress, implemented, dismissed
    
    implemented_by UUID REFERENCES users(id),
    implemented_at TIMESTAMP WITH TIME ZONE,
    
    dismissed_by UUID REFERENCES users(id),
    dismissed_at TIMESTAMP WITH TIME ZONE,
    dismissal_reason TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_status CHECK (status IN ('open', 'in-progress', 'implemented', 'dismissed'))
);

CREATE INDEX idx_cost_reco_tenant ON cost_optimization_recommendations(tenant_id);
CREATE INDEX idx_cost_reco_project ON cost_optimization_recommendations(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_cost_reco_type ON cost_optimization_recommendations(recommendation_type);
CREATE INDEX idx_cost_reco_status ON cost_optimization_recommendations(status);
CREATE INDEX idx_cost_reco_priority ON cost_optimization_recommendations(priority);

-- Update timestamp triggers
CREATE TRIGGER update_governance_policies_updated_at BEFORE UPDATE ON governance_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policy_violations_updated_at BEFORE UPDATE ON policy_violations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_architecture_patterns_updated_at BEFORE UPDATE ON architecture_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pattern_approvals_updated_at BEFORE UPDATE ON pattern_approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_frameworks_updated_at BEFORE UPDATE ON compliance_frameworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_assessments_updated_at BEFORE UPDATE ON compliance_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_optimization_updated_at BEFORE UPDATE ON cost_optimization_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE governance_policies IS 'Enterprise governance policies for cloud infrastructure';
COMMENT ON TABLE policy_violations IS 'Tracks policy violations and remediation status';
COMMENT ON TABLE architecture_patterns IS 'Approved architecture patterns and reference designs';
COMMENT ON TABLE pattern_approvals IS 'Approval workflow for architecture patterns';
COMMENT ON TABLE compliance_frameworks IS 'Regulatory and compliance frameworks';
COMMENT ON TABLE compliance_assessments IS 'Compliance assessment results and findings';
COMMENT ON TABLE cost_optimization_recommendations IS 'AI-generated cost optimization recommendations';
