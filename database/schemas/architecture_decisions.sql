-- Architecture Decision Records Schema
-- Stores architecture decisions and links them to blueprints

-- ============================================================================
-- Architecture Decision Records (ADRs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS architecture_decisions (
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
    assumptions JSONB,
    
    -- Options Analysis
    considered_options JSONB NOT NULL,
    decision_outcome TEXT NOT NULL,
    decision_rationale TEXT NOT NULL,
    
    -- Consequences
    positive_consequences JSONB,
    negative_consequences JSONB,
    risks JSONB,
    
    -- Metadata
    deciders JSONB NOT NULL,
    stakeholders JSONB,
    related_adrs JSONB,
    implementation_link VARCHAR(500),
    documentation_link VARCHAR(500),
    
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

-- ============================================================================
-- Blueprint Architecture Decision Mappings
-- ============================================================================

CREATE TABLE IF NOT EXISTS blueprint_architecture_decisions (
    blueprint_id UUID NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
    adr_id UUID NOT NULL REFERENCES architecture_decisions(id) ON DELETE CASCADE,
    applies_to_component VARCHAR(255),
    implementation_notes TEXT,
    compliance_status VARCHAR(50) CHECK (compliance_status IN ('compliant', 'non_compliant', 'partial', 'not_applicable')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blueprint_id, adr_id)
);

-- ============================================================================
-- Architecture Review Requests
-- ============================================================================

CREATE TABLE IF NOT EXISTS architecture_review_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id UUID NOT NULL REFERENCES blueprints(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    
    -- Submission details
    submitted_by UUID NOT NULL REFERENCES users(id),
    submission_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    business_justification TEXT NOT NULL,
    
    -- Classification
    architecture_complexity VARCHAR(20) CHECK (architecture_complexity IN ('simple', 'moderate', 'complex')),
    estimated_cost DECIMAL(15, 2),
    cloud_providers JSONB,
    compliance_requirements JSONB,
    
    -- Review stage
    review_stage VARCHAR(50) NOT NULL CHECK (review_stage IN 
        ('draft', 'submitted', 'security_review', 'architecture_review', 'approved', 'rejected', 'conditional_approval')),
    
    -- Data (stores full request as JSONB for flexibility)
    data JSONB NOT NULL,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Architecture Templates
-- ============================================================================

CREATE TABLE IF NOT EXISTS architecture_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id VARCHAR(100) UNIQUE NOT NULL,
    template_version VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Classification
    architecture_domain VARCHAR(50) CHECK (architecture_domain IN 
        ('business', 'application', 'data', 'technology', 'security', 'integration')),
    complexity VARCHAR(20) CHECK (complexity IN ('simple', 'moderate', 'complex')),
    estimated_cost DECIMAL(15, 2),
    
    -- Template content
    metadata JSONB NOT NULL,
    components JSONB NOT NULL,
    security_controls JSONB,
    guardrails JSONB,
    
    -- Governance
    compliance_frameworks JSONB,
    architecture_decisions JSONB,
    approved_by VARCHAR(255),
    approval_date TIMESTAMP,
    review_date TIMESTAMP,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    
    -- Status
    status VARCHAR(50) CHECK (status IN ('draft', 'active', 'deprecated', 'retired')) DEFAULT 'draft',
    
    -- File location
    template_path VARCHAR(500),
    
    -- Audit
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Architecture Assets (CMDB)
-- ============================================================================

CREATE TABLE IF NOT EXISTS architecture_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN 
        ('blueprint', 'template', 'pattern', 'standard', 'adr', 'component', 'service')),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50),
    status VARCHAR(50) CHECK (status IN ('draft', 'approved', 'deprecated', 'retired')) DEFAULT 'draft',
    
    -- Architecture classification
    domain VARCHAR(50) CHECK (domain IN 
        ('business', 'application', 'data', 'technology', 'security', 'integration')),
    layer VARCHAR(50) CHECK (layer IN 
        ('strategy', 'capability', 'logical', 'physical', 'implementation')),
    
    -- Governance
    owner_id UUID REFERENCES users(id),
    steward_id UUID REFERENCES users(id),
    approved_by JSONB,
    approval_date TIMESTAMP,
    review_date TIMESTAMP,
    
    -- Relationships
    depends_on JSONB DEFAULT '[]'::jsonb,
    related_to JSONB DEFAULT '[]'::jsonb,
    implements JSONB DEFAULT '[]'::jsonb,
    used_by JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    tags JSONB,
    documentation_url VARCHAR(500),
    source_repository VARCHAR(500),
    
    -- Metrics
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    health_score DECIMAL(5, 2),
    
    -- Additional data
    asset_data JSONB,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Architecture Compliance Violations
-- ============================================================================

CREATE TABLE IF NOT EXISTS architecture_compliance_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blueprint_id UUID REFERENCES blueprints(id),
    project_id UUID REFERENCES projects(id),
    
    -- Violation details
    rule VARCHAR(255) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    description TEXT NOT NULL,
    remediation TEXT,
    component VARCHAR(255),
    
    -- Status
    status VARCHAR(50) CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted', 'false_positive')) DEFAULT 'open',
    
    -- Resolution
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    
    -- Audit
    detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- ADR indexes
CREATE INDEX idx_adr_status ON architecture_decisions(status);
CREATE INDEX idx_adr_domain ON architecture_decisions(architecture_domain);
CREATE INDEX idx_adr_date ON architecture_decisions(decision_date DESC);
CREATE INDEX idx_adr_number ON architecture_decisions(adr_number);
CREATE INDEX idx_adr_created_by ON architecture_decisions(created_by);

-- Review request indexes
CREATE INDEX idx_review_blueprint ON architecture_review_requests(blueprint_id);
CREATE INDEX idx_review_project ON architecture_review_requests(project_id);
CREATE INDEX idx_review_stage ON architecture_review_requests(review_stage);
CREATE INDEX idx_review_submitted_by ON architecture_review_requests(submitted_by);
CREATE INDEX idx_review_submission_date ON architecture_review_requests(submission_date DESC);

-- Template indexes
CREATE INDEX idx_template_id ON architecture_templates(template_id);
CREATE INDEX idx_template_status ON architecture_templates(status);
CREATE INDEX idx_template_domain ON architecture_templates(architecture_domain);
CREATE INDEX idx_template_complexity ON architecture_templates(complexity);

-- Asset indexes
CREATE INDEX idx_asset_type ON architecture_assets(asset_type);
CREATE INDEX idx_asset_status ON architecture_assets(status);
CREATE INDEX idx_asset_domain ON architecture_assets(domain);
CREATE INDEX idx_asset_layer ON architecture_assets(layer);
CREATE INDEX idx_asset_owner ON architecture_assets(owner_id);
CREATE INDEX idx_asset_name ON architecture_assets(name);

-- Violation indexes
CREATE INDEX idx_violation_blueprint ON architecture_compliance_violations(blueprint_id);
CREATE INDEX idx_violation_project ON architecture_compliance_violations(project_id);
CREATE INDEX idx_violation_status ON architecture_compliance_violations(status);
CREATE INDEX idx_violation_severity ON architecture_compliance_violations(severity);
CREATE INDEX idx_violation_detected ON architecture_compliance_violations(detected_at DESC);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_architecture_decisions_updated_at BEFORE UPDATE ON architecture_decisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_architecture_review_requests_updated_at BEFORE UPDATE ON architecture_review_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_architecture_templates_updated_at BEFORE UPDATE ON architecture_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_architecture_assets_updated_at BEFORE UPDATE ON architecture_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_architecture_compliance_violations_updated_at BEFORE UPDATE ON architecture_compliance_violations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Views
-- ============================================================================

-- Active ADRs view
CREATE OR REPLACE VIEW active_adrs AS
SELECT 
    id,
    adr_number,
    title,
    status,
    decision_date,
    architecture_domain,
    technology_area,
    tags,
    created_at
FROM architecture_decisions
WHERE status = 'accepted'
ORDER BY adr_number DESC;

-- Pending reviews view
CREATE OR REPLACE VIEW pending_reviews AS
SELECT 
    r.id,
    r.blueprint_id,
    r.project_id,
    r.review_stage,
    r.architecture_complexity,
    r.estimated_cost,
    r.submission_date,
    u.name as submitted_by_name,
    u.email as submitted_by_email,
    p.name as project_name
FROM architecture_review_requests r
JOIN users u ON r.submitted_by = u.id
JOIN projects p ON r.project_id = p.id
WHERE r.review_stage IN ('submitted', 'security_review', 'architecture_review')
ORDER BY r.submission_date ASC;

-- Compliance violations summary
CREATE OR REPLACE VIEW compliance_violations_summary AS
SELECT 
    COUNT(*) as total_violations,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_violations,
    COUNT(*) FILTER (WHERE severity = 'high') as high_violations,
    COUNT(*) FILTER (WHERE severity = 'medium') as medium_violations,
    COUNT(*) FILTER (WHERE severity = 'low') as low_violations,
    COUNT(*) FILTER (WHERE status = 'open') as open_violations,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_violations
FROM architecture_compliance_violations;

-- ============================================================================
-- Sample Data (for testing)
-- ============================================================================

-- Sample ADR
INSERT INTO architecture_decisions (
    adr_number, 
    title, 
    status, 
    context, 
    problem_statement,
    decision_drivers,
    considered_options,
    decision_outcome,
    decision_rationale,
    positive_consequences,
    negative_consequences,
    deciders,
    architecture_domain,
    created_by
) VALUES (
    1,
    'Use PostgreSQL as Standard Relational Database',
    'accepted',
    'The organization needs a standard relational database for transactional workloads',
    'Multiple teams are using different databases, leading to operational complexity',
    '["Performance requirements", "Cost considerations", "Team expertise", "Cloud provider support"]'::jsonb,
    '["PostgreSQL", "MySQL", "Microsoft SQL Server", "Oracle"]'::jsonb,
    'Adopt PostgreSQL as the standard relational database',
    'PostgreSQL offers excellent performance, is open source, has strong cloud provider support, and the team has experience with it',
    '["Reduced operational complexity", "Better cost efficiency", "Strong community support", "Advanced features"]'::jsonb,
    '["Migration effort for existing systems", "May not be optimal for all use cases"]'::jsonb,
    '["Chief Architect", "Data Architect", "Lead Engineers"]'::jsonb,
    'data',
    (SELECT id FROM users LIMIT 1)
) ON CONFLICT (adr_number) DO NOTHING;

COMMENT ON TABLE architecture_decisions IS 'Stores Architecture Decision Records (ADRs) documenting key architectural decisions';
COMMENT ON TABLE blueprint_architecture_decisions IS 'Links blueprints to applicable ADRs';
COMMENT ON TABLE architecture_review_requests IS 'Tracks architecture review requests and their status';
COMMENT ON TABLE architecture_templates IS 'Stores approved architecture templates';
COMMENT ON TABLE architecture_assets IS 'CMDB for all architecture assets and their relationships';
COMMENT ON TABLE architecture_compliance_violations IS 'Tracks architecture compliance violations and their resolution';
