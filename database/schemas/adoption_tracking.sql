-- Enterprise Architecture Adoption Tracking
-- Tracks EA framework adoption metrics and value realization

CREATE TABLE IF NOT EXISTS ea_adoption_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE NOT NULL,
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN (
        'adr_adoption', 'template_usage', 'compliance_rate', 
        'review_participation', 'standards_adherence', 'automation_rate'
    )),
    metric_category VARCHAR(50) NOT NULL CHECK (metric_category IN (
        'governance', 'adoption', 'quality', 'efficiency', 'value'
    )),
    
    -- Metric Values
    metric_value DECIMAL(10, 2) NOT NULL,
    target_value DECIMAL(10, 2),
    baseline_value DECIMAL(10, 2),
    
    -- Dimensions
    organization_unit VARCHAR(100),
    team_id UUID,
    project_id UUID,
    
    -- Context
    measurement_method VARCHAR(100),
    data_source VARCHAR(100),
    notes TEXT,
    
    -- Audit
    recorded_by UUID REFERENCES users(id),
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (metric_date, metric_type, organization_unit)
);

CREATE TABLE IF NOT EXISTS ea_value_realization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    value_category VARCHAR(50) NOT NULL CHECK (value_category IN (
        'cost_savings', 'time_savings', 'risk_reduction', 
        'quality_improvement', 'agility_improvement'
    )),
    value_subcategory VARCHAR(100),
    
    -- Value Metrics
    quantified_value DECIMAL(15, 2),
    value_unit VARCHAR(50) CHECK (value_unit IN (
        'USD', 'hours', 'days', 'percentage', 'count'
    )),
    qualitative_value TEXT,
    
    -- Attribution
    source_initiative VARCHAR(200),
    related_adr_id UUID REFERENCES architecture_decisions(id),
    related_project_id UUID,
    related_blueprint_id UUID,
    
    -- Timing
    realization_date DATE NOT NULL,
    projected_date DATE,
    baseline_date DATE,
    
    -- Validation
    validation_status VARCHAR(50) CHECK (validation_status IN (
        'projected', 'estimated', 'measured', 'validated'
    )),
    validation_method TEXT,
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMP,
    
    -- Context
    description TEXT NOT NULL,
    supporting_evidence JSONB,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ea_maturity_assessment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_date DATE NOT NULL,
    assessment_period VARCHAR(20) NOT NULL,
    
    -- Maturity Dimensions (1-5 scale)
    strategy_maturity INTEGER CHECK (strategy_maturity BETWEEN 1 AND 5),
    governance_maturity INTEGER CHECK (governance_maturity BETWEEN 1 AND 5),
    process_maturity INTEGER CHECK (process_maturity BETWEEN 1 AND 5),
    technology_maturity INTEGER CHECK (technology_maturity BETWEEN 1 AND 5),
    people_maturity INTEGER CHECK (people_maturity BETWEEN 1 AND 5),
    
    -- Overall Maturity
    overall_maturity_score DECIMAL(3, 2),
    maturity_level VARCHAR(20) CHECK (maturity_level IN (
        'initial', 'developing', 'defined', 'managed', 'optimizing'
    )),
    
    -- Capability Scores
    capability_scores JSONB NOT NULL,
    
    -- Assessment Details
    assessment_method VARCHAR(100),
    assessor_id UUID REFERENCES users(id),
    assessment_notes TEXT,
    
    -- Improvement Plan
    improvement_priorities JSONB,
    next_assessment_date DATE,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ea_engagement_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_date DATE NOT NULL,
    engagement_type VARCHAR(50) NOT NULL CHECK (engagement_type IN (
        'adr_submission', 'adr_review', 'template_download', 'template_usage',
        'compliance_review', 'training_completion', 'consultation',
        'arb_participation', 'documentation_contribution'
    )),
    
    -- Participants
    user_id UUID NOT NULL REFERENCES users(id),
    team_id UUID,
    organization_unit VARCHAR(100),
    
    -- Engagement Details
    resource_id UUID,
    resource_type VARCHAR(50),
    duration_minutes INTEGER,
    
    -- Quality Indicators
    completion_status VARCHAR(50) CHECK (completion_status IN (
        'started', 'in_progress', 'completed', 'abandoned'
    )),
    satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
    feedback TEXT,
    
    -- Context
    engagement_context JSONB,
    
    -- Audit
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ea_kpi_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_name VARCHAR(100) NOT NULL,
    kpi_category VARCHAR(50) NOT NULL,
    
    -- Target Configuration
    target_value DECIMAL(10, 2) NOT NULL,
    threshold_yellow DECIMAL(10, 2),
    threshold_red DECIMAL(10, 2),
    
    -- Context
    measurement_unit VARCHAR(50),
    measurement_frequency VARCHAR(50) CHECK (measurement_frequency IN (
        'daily', 'weekly', 'monthly', 'quarterly', 'annual'
    )),
    
    -- Status
    active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    
    -- Ownership
    owner_id UUID REFERENCES users(id),
    review_team JSONB,
    
    -- Definition
    definition TEXT NOT NULL,
    calculation_method TEXT,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (kpi_name, effective_from)
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX idx_adoption_metrics_date ON ea_adoption_metrics(metric_date DESC);
CREATE INDEX idx_adoption_metrics_type ON ea_adoption_metrics(metric_type, metric_date DESC);
CREATE INDEX idx_adoption_metrics_category ON ea_adoption_metrics(metric_category);
CREATE INDEX idx_adoption_metrics_org ON ea_adoption_metrics(organization_unit, metric_date DESC);

CREATE INDEX idx_value_realization_date ON ea_value_realization(realization_date DESC);
CREATE INDEX idx_value_realization_category ON ea_value_realization(value_category);
CREATE INDEX idx_value_realization_status ON ea_value_realization(validation_status);
CREATE INDEX idx_value_realization_adr ON ea_value_realization(related_adr_id);

CREATE INDEX idx_maturity_assessment_date ON ea_maturity_assessment(assessment_date DESC);

CREATE INDEX idx_engagement_date ON ea_engagement_tracking(engagement_date DESC);
CREATE INDEX idx_engagement_user ON ea_engagement_tracking(user_id, engagement_date DESC);
CREATE INDEX idx_engagement_type ON ea_engagement_tracking(engagement_type, engagement_date DESC);

CREATE INDEX idx_kpi_targets_active ON ea_kpi_targets(kpi_name, active) WHERE active = true;

-- ============================================================================
-- Views for Reporting
-- ============================================================================

CREATE OR REPLACE VIEW ea_adoption_dashboard AS
SELECT 
    metric_date,
    metric_category,
    COUNT(DISTINCT metric_type) as metrics_tracked,
    AVG(CASE WHEN target_value > 0 THEN (metric_value / target_value * 100) ELSE NULL END) as avg_target_achievement,
    AVG(metric_value) as avg_metric_value
FROM ea_adoption_metrics
WHERE metric_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY metric_date, metric_category
ORDER BY metric_date DESC;

CREATE OR REPLACE VIEW ea_value_summary AS
SELECT 
    value_category,
    value_unit,
    COUNT(*) as value_count,
    SUM(quantified_value) as total_value,
    AVG(quantified_value) as avg_value,
    COUNT(CASE WHEN validation_status = 'validated' THEN 1 END) as validated_count
FROM ea_value_realization
WHERE realization_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY value_category, value_unit
ORDER BY total_value DESC NULLS LAST;

-- ============================================================================
-- Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_ea_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ea_value_updated_at
    BEFORE UPDATE ON ea_value_realization
    FOR EACH ROW
    EXECUTE FUNCTION update_ea_updated_at();

CREATE TRIGGER trg_ea_kpi_targets_updated_at
    BEFORE UPDATE ON ea_kpi_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_ea_updated_at();

-- ============================================================================
-- Sample Data
-- ============================================================================

-- Sample KPI Targets
INSERT INTO ea_kpi_targets (
    kpi_name,
    kpi_category,
    target_value,
    threshold_yellow,
    threshold_red,
    measurement_unit,
    measurement_frequency,
    effective_from,
    definition,
    created_by
) VALUES 
(
    'ADR Adoption Rate',
    'governance',
    90.0,
    75.0,
    60.0,
    'percentage',
    'monthly',
    CURRENT_DATE,
    'Percentage of projects with documented ADRs',
    (SELECT id FROM users LIMIT 1)
),
(
    'Compliance Score',
    'quality',
    95.0,
    85.0,
    75.0,
    'percentage',
    'weekly',
    CURRENT_DATE,
    'Overall architecture compliance score',
    (SELECT id FROM users LIMIT 1)
),
(
    'Template Reuse Rate',
    'efficiency',
    80.0,
    60.0,
    40.0,
    'percentage',
    'monthly',
    CURRENT_DATE,
    'Percentage of projects using approved templates',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (kpi_name, effective_from) DO NOTHING;

-- Sample Adoption Metrics
INSERT INTO ea_adoption_metrics (
    metric_date,
    metric_type,
    metric_category,
    metric_value,
    target_value,
    baseline_value,
    measurement_method,
    data_source,
    recorded_by
) VALUES 
(
    CURRENT_DATE,
    'adr_adoption',
    'adoption',
    85.5,
    90.0,
    45.0,
    'automated_calculation',
    'database_query',
    (SELECT id FROM users LIMIT 1)
),
(
    CURRENT_DATE,
    'template_usage',
    'efficiency',
    72.3,
    80.0,
    30.0,
    'automated_calculation',
    'blueprint_analysis',
    (SELECT id FROM users LIMIT 1)
),
(
    CURRENT_DATE,
    'compliance_rate',
    'quality',
    93.8,
    95.0,
    65.0,
    'opa_policy_evaluation',
    'guardrails_engine',
    (SELECT id FROM users LIMIT 1)
)
ON CONFLICT (metric_date, metric_type, organization_unit) DO NOTHING;

COMMENT ON TABLE ea_adoption_metrics IS 'Tracks EA framework adoption metrics over time';
COMMENT ON TABLE ea_value_realization IS 'Records quantified and qualitative value delivered by EA initiatives';
COMMENT ON TABLE ea_maturity_assessment IS 'Stores periodic EA maturity assessments';
COMMENT ON TABLE ea_engagement_tracking IS 'Tracks user engagement with EA resources and processes';
COMMENT ON TABLE ea_kpi_targets IS 'Defines KPI targets and thresholds for EA metrics';
