-- ============================================================================
-- Migration 004: Schema Alignment
-- ============================================================================
-- Purpose: Align database schema with endpoint code expectations
-- Adds missing tables for TA (guardrails, IaC) and SA (AI) roles
-- Alters existing tables to add expected columns
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TA ROLE: GUARDRAILS TABLES
-- ============================================================================

-- Guardrails Rules
CREATE TABLE IF NOT EXISTS guardrails_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- security, cost, compliance, performance
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    rule_type VARCHAR(50) NOT NULL, -- validation, threshold, pattern
    conditions JSONB NOT NULL DEFAULT '{}',
    actions JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, inactive, archived
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_guardrail_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_guardrail_status CHECK (status IN ('active', 'inactive', 'archived'))
);

CREATE INDEX idx_guardrails_tenant ON guardrails_rules(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_guardrails_category ON guardrails_rules(category);
CREATE INDEX idx_guardrails_severity ON guardrails_rules(severity);
CREATE INDEX idx_guardrails_status ON guardrails_rules(status);

-- Guardrail Violations
CREATE TABLE IF NOT EXISTS guardrail_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    guardrail_id UUID NOT NULL REFERENCES guardrails_rules(id),
    blueprint_id UUID REFERENCES blueprints(id),
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    violation_details JSONB NOT NULL DEFAULT '{}',
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open', -- open, resolved, ignored, overridden
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    detected_by VARCHAR(100),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_violation_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_violation_status CHECK (status IN ('open', 'resolved', 'ignored', 'overridden'))
);

CREATE INDEX idx_violations_tenant ON guardrail_violations(tenant_id);
CREATE INDEX idx_violations_guardrail ON guardrail_violations(guardrail_id);
CREATE INDEX idx_violations_blueprint ON guardrail_violations(blueprint_id);
CREATE INDEX idx_violations_status ON guardrail_violations(status);
CREATE INDEX idx_violations_severity ON guardrail_violations(severity);

-- Guardrail Violation Overrides
CREATE TABLE IF NOT EXISTS guardrail_violation_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    violation_id UUID NOT NULL REFERENCES guardrail_violations(id),
    reason TEXT NOT NULL,
    approved_by UUID NOT NULL REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_overrides_tenant ON guardrail_violation_overrides(tenant_id);
CREATE INDEX idx_overrides_violation ON guardrail_violation_overrides(violation_id);

-- Guardrail Audit Log
CREATE TABLE IF NOT EXISTS guardrail_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    guardrail_id UUID REFERENCES guardrails_rules(id),
    action VARCHAR(50) NOT NULL, -- created, updated, deleted, activated, deactivated
    performed_by UUID NOT NULL REFERENCES users(id),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_tenant ON guardrail_audit_log(tenant_id);
CREATE INDEX idx_audit_guardrail ON guardrail_audit_log(guardrail_id);
CREATE INDEX idx_audit_timestamp ON guardrail_audit_log(created_at DESC);

-- ============================================================================
-- TA ROLE: IAC TABLES
-- ============================================================================

-- IaC Templates
CREATE TABLE IF NOT EXISTS iac_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(50) NOT NULL, -- aws, azure, gcp, kubernetes
    template_type VARCHAR(50) NOT NULL, -- terraform, cloudformation, arm, helm
    template_code TEXT NOT NULL,
    parameters JSONB DEFAULT '{}',
    outputs JSONB DEFAULT '{}',
    version VARCHAR(20) DEFAULT '1.0.0',
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, deprecated, archived
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_template_status CHECK (status IN ('active', 'deprecated', 'archived'))
);

CREATE INDEX idx_templates_tenant ON iac_templates(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_templates_provider ON iac_templates(provider);
CREATE INDEX idx_templates_type ON iac_templates(template_type);

-- IaC Generations
CREATE TABLE IF NOT EXISTS iac_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    blueprint_id UUID NOT NULL REFERENCES blueprints(id),
    template_id UUID REFERENCES iac_templates(id),
    provider VARCHAR(50) NOT NULL,
    iac_type VARCHAR(50) NOT NULL, -- terraform, cloudformation, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, failed
    generated_files JSONB DEFAULT '{}',
    generation_logs TEXT,
    error_details TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_generation_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed'))
);

CREATE INDEX idx_generations_tenant ON iac_generations(tenant_id);
CREATE INDEX idx_generations_blueprint ON iac_generations(blueprint_id);
CREATE INDEX idx_generations_status ON iac_generations(status);
CREATE INDEX idx_generations_created ON iac_generations(created_at DESC);

-- IaC Validation Results
CREATE TABLE IF NOT EXISTS iac_validation_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    generation_id UUID NOT NULL REFERENCES iac_generations(id),
    validation_type VARCHAR(50) NOT NULL, -- syntax, security, compliance, cost
    status VARCHAR(20) NOT NULL, -- passed, failed, warning
    issues JSONB DEFAULT '[]',
    score INTEGER,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_validation_status CHECK (status IN ('passed', 'failed', 'warning'))
);

CREATE INDEX idx_validations_tenant ON iac_validation_results(tenant_id);
CREATE INDEX idx_validations_generation ON iac_validation_results(generation_id);
CREATE INDEX idx_validations_type ON iac_validation_results(validation_type);

-- IaC Cost Estimates
CREATE TABLE IF NOT EXISTS iac_cost_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    generation_id UUID NOT NULL REFERENCES iac_generations(id),
    provider VARCHAR(50) NOT NULL,
    estimated_monthly_cost DECIMAL(10, 2) NOT NULL,
    estimated_annual_cost DECIMAL(10, 2),
    cost_breakdown JSONB DEFAULT '{}',
    confidence_level VARCHAR(20), -- low, medium, high
    estimated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cost_estimates_tenant ON iac_cost_estimates(tenant_id);
CREATE INDEX idx_cost_estimates_generation ON iac_cost_estimates(generation_id);

-- ============================================================================
-- SA ROLE: AI TABLES
-- ============================================================================

-- AI Analyses
CREATE TABLE IF NOT EXISTS ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    blueprint_id UUID NOT NULL REFERENCES blueprints(id),
    analysis_type VARCHAR(50) NOT NULL, -- architecture, security, performance, cost
    recommendations JSONB NOT NULL DEFAULT '{}',
    insights JSONB DEFAULT '{}',
    risk_score DECIMAL(3, 2),
    confidence_score DECIMAL(3, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'completed', -- pending, in_progress, completed, failed
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_analysis_status CHECK (status IN ('pending', 'in_progress', 'completed', 'failed'))
);

CREATE INDEX idx_analyses_tenant ON ai_analyses(tenant_id);
CREATE INDEX idx_analyses_blueprint ON ai_analyses(blueprint_id);
CREATE INDEX idx_analyses_type ON ai_analyses(analysis_type);
CREATE INDEX idx_analyses_created ON ai_analyses(created_at DESC);

-- AI Optimizations
CREATE TABLE IF NOT EXISTS ai_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    blueprint_id UUID NOT NULL REFERENCES blueprints(id),
    optimization_type VARCHAR(50) NOT NULL, -- cost, performance, reliability, security
    goals JSONB NOT NULL DEFAULT '[]',
    current_metrics JSONB DEFAULT '{}',
    optimized_metrics JSONB DEFAULT '{}',
    current_cost DECIMAL(10, 2),
    optimized_cost DECIMAL(10, 2),
    savings DECIMAL(10, 2),
    recommendations JSONB NOT NULL DEFAULT '{}',
    implementation_effort VARCHAR(20), -- low, medium, high
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, rejected
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_optimization_status CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected'))
);

CREATE INDEX idx_optimizations_tenant ON ai_optimizations(tenant_id);
CREATE INDEX idx_optimizations_blueprint ON ai_optimizations(blueprint_id);
CREATE INDEX idx_optimizations_type ON ai_optimizations(optimization_type);
CREATE INDEX idx_optimizations_savings ON ai_optimizations(savings DESC);

-- AI Comparisons
CREATE TABLE IF NOT EXISTS ai_comparisons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    blueprint_ids JSONB NOT NULL, -- Array of blueprint IDs being compared
    comparison_type VARCHAR(50) NOT NULL, -- cost, performance, security, architecture
    comparison_criteria JSONB DEFAULT '{}',
    results JSONB NOT NULL DEFAULT '{}',
    winner_id UUID, -- ID of recommended blueprint
    recommendation_reason TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comparisons_tenant ON ai_comparisons(tenant_id);
CREATE INDEX idx_comparisons_type ON ai_comparisons(comparison_type);
CREATE INDEX idx_comparisons_created ON ai_comparisons(created_at DESC);

-- AI Feedback
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    recommendation_id UUID NOT NULL, -- Can reference analyses, optimizations, or comparisons
    recommendation_type VARCHAR(50) NOT NULL, -- analysis, optimization, comparison
    rating INTEGER NOT NULL, -- 1-5 stars
    feedback TEXT,
    implemented BOOLEAN DEFAULT false,
    implementation_notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_rating CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_feedback_tenant ON ai_feedback(tenant_id);
CREATE INDEX idx_feedback_recommendation ON ai_feedback(recommendation_id);
CREATE INDEX idx_feedback_type ON ai_feedback(recommendation_type);
CREATE INDEX idx_feedback_implemented ON ai_feedback(implemented);

-- AI Cost Predictions
CREATE TABLE IF NOT EXISTS ai_cost_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    blueprint_id UUID NOT NULL REFERENCES blueprints(id),
    prediction_horizon VARCHAR(20) NOT NULL, -- 1-month, 3-month, 6-month, 12-month
    predictions JSONB NOT NULL DEFAULT '[]', -- Array of {month, predicted_cost, confidence}
    baseline_cost DECIMAL(10, 2),
    prediction_method VARCHAR(50),
    accuracy DECIMAL(3, 2), -- Accuracy of past predictions (0-1)
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_tenant ON ai_cost_predictions(tenant_id);
CREATE INDEX idx_predictions_blueprint ON ai_cost_predictions(blueprint_id);
CREATE INDEX idx_predictions_created ON ai_cost_predictions(created_at DESC);

-- AI Risk Analyses
CREATE TABLE IF NOT EXISTS ai_risk_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    blueprint_id UUID NOT NULL REFERENCES blueprints(id),
    risk_score DECIMAL(3, 1) NOT NULL, -- 0-10 scale
    risk_level VARCHAR(20) NOT NULL, -- low, medium, high, critical
    risks JSONB NOT NULL DEFAULT '{}', -- Categorized risks
    mitigations JSONB DEFAULT '{}', -- Recommended mitigations
    impact_assessment JSONB DEFAULT '{}',
    likelihood_assessment JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_risk_level CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_risk_analyses_tenant ON ai_risk_analyses(tenant_id);
CREATE INDEX idx_risk_analyses_blueprint ON ai_risk_analyses(blueprint_id);
CREATE INDEX idx_risk_analyses_risk_level ON ai_risk_analyses(risk_level);
CREATE INDEX idx_risk_analyses_created ON ai_risk_analyses(created_at DESC);

-- ============================================================================
-- ALTER EXISTING TABLES: Add expected columns
-- ============================================================================

-- Blueprints: Add columns expected by endpoints
DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blueprints' AND column_name='category') THEN
        ALTER TABLE blueprints ADD COLUMN category VARCHAR(50);
        COMMENT ON COLUMN blueprints.category IS 'Blueprint category (web-app, api, data-pipeline, etc.)';
    END IF;
    
    -- Add provider column if it doesn't exist (different from primary_provider)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blueprints' AND column_name='provider') THEN
        ALTER TABLE blueprints ADD COLUMN provider VARCHAR(50);
        COMMENT ON COLUMN blueprints.provider IS 'Alias for primary_provider for backward compatibility';
    END IF;
    
    -- Add components column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blueprints' AND column_name='components') THEN
        ALTER TABLE blueprints ADD COLUMN components JSONB DEFAULT '{}';
        COMMENT ON COLUMN blueprints.components IS 'Blueprint components configuration';
    END IF;
    
    -- Add status column if it doesn't exist (different from lifecycle_state)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blueprints' AND column_name='status') THEN
        ALTER TABLE blueprints ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
        COMMENT ON COLUMN blueprints.status IS 'Alias for lifecycle_state for backward compatibility';
    END IF;
    
    -- Add version column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blueprints' AND column_name='version') THEN
        ALTER TABLE blueprints ADD COLUMN version VARCHAR(20) DEFAULT '1.0.0';
        COMMENT ON COLUMN blueprints.version IS 'Current version of the blueprint';
    END IF;
    
    -- Add tags column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blueprints' AND column_name='tags') THEN
        ALTER TABLE blueprints ADD COLUMN tags JSONB DEFAULT '[]';
        COMMENT ON COLUMN blueprints.tags IS 'Blueprint tags for categorization';
    END IF;
    
    -- Add tenant_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='blueprints' AND column_name='tenant_id') THEN
        ALTER TABLE blueprints ADD COLUMN tenant_id UUID;
        COMMENT ON COLUMN blueprints.tenant_id IS 'Tenant ID for multi-tenancy';
    END IF;
END $$;

-- Create indexes for new blueprint columns
CREATE INDEX IF NOT EXISTS idx_blueprints_category ON blueprints(category);
CREATE INDEX IF NOT EXISTS idx_blueprints_provider ON blueprints(provider);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON blueprints(status);
CREATE INDEX IF NOT EXISTS idx_blueprints_tenant ON blueprints(tenant_id) WHERE deleted_at IS NULL;

-- Update trigger for blueprints
CREATE OR REPLACE FUNCTION update_blueprints_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    -- Sync provider with primary_provider if changed
    IF NEW.primary_provider IS DISTINCT FROM OLD.primary_provider THEN
        NEW.provider = NEW.primary_provider;
    END IF;
    -- Sync status with lifecycle_state if changed
    IF NEW.lifecycle_state IS DISTINCT FROM OLD.lifecycle_state THEN
        NEW.status = NEW.lifecycle_state;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blueprints_updated_at ON blueprints;
CREATE TRIGGER update_blueprints_updated_at
    BEFORE UPDATE ON blueprints
    FOR EACH ROW
    EXECUTE FUNCTION update_blueprints_updated_at();

-- ============================================================================
-- UPDATE TRIGGERS for all new tables
-- ============================================================================

-- Guardrails Rules
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_guardrails_rules_updated_at BEFORE UPDATE ON guardrails_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guardrail_violations_updated_at BEFORE UPDATE ON guardrail_violations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_iac_templates_updated_at BEFORE UPDATE ON iac_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analyses_updated_at BEFORE UPDATE ON ai_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_optimizations_updated_at BEFORE UPDATE ON ai_optimizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to dharma_admin (assuming this is the main user)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dharma_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dharma_admin;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Count new tables
SELECT 
    'New TA tables' as category,
    COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('guardrails_rules', 'guardrail_violations', 'guardrail_violation_overrides', 
                     'guardrail_audit_log', 'iac_templates', 'iac_generations', 
                     'iac_validation_results', 'iac_cost_estimates')

UNION ALL

SELECT 
    'New SA tables',
    COUNT(*)
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('ai_analyses', 'ai_optimizations', 'ai_comparisons', 'ai_feedback',
                     'ai_cost_predictions', 'ai_risk_analyses')

UNION ALL

SELECT 
    'New blueprint columns',
    COUNT(*)
FROM information_schema.columns
WHERE table_name = 'blueprints'
  AND column_name IN ('category', 'provider', 'components', 'status', 'version', 'tags', 'tenant_id');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
