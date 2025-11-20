-- ============================================================================
-- IAC Dharma Platform - Minimal Test Data Seed Script
-- ============================================================================
-- Purpose: Minimal viable test data using only verified schema columns
-- Strategy: Insert only essential data for integration tests
-- ============================================================================

BEGIN;

-- ============================================================================
-- CLEANUP: Remove existing test data
-- ============================================================================
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'test-org';
    
    IF v_tenant_id IS NOT NULL THEN
        -- Delete parent tables only (CASCADE DELETE handles children)
        DELETE FROM ai_risk_analyses WHERE tenant_id = v_tenant_id;
        DELETE FROM ai_cost_predictions WHERE tenant_id = v_tenant_id;
        DELETE FROM ai_feedback WHERE tenant_id = v_tenant_id;
        DELETE FROM ai_comparisons WHERE tenant_id = v_tenant_id;
        DELETE FROM ai_optimizations WHERE tenant_id = v_tenant_id;
        DELETE FROM ai_analyses WHERE tenant_id = v_tenant_id;
        DELETE FROM iac_cost_estimates WHERE tenant_id = v_tenant_id;
        DELETE FROM iac_validation_results WHERE tenant_id = v_tenant_id;
        DELETE FROM iac_generations WHERE tenant_id = v_tenant_id;
        DELETE FROM iac_templates WHERE tenant_id = v_tenant_id;
        DELETE FROM guardrail_audit_log WHERE tenant_id = v_tenant_id;
        DELETE FROM guardrail_violation_overrides WHERE tenant_id = v_tenant_id;
        DELETE FROM guardrail_violations WHERE tenant_id = v_tenant_id;
        DELETE FROM guardrails_rules WHERE tenant_id = v_tenant_id;
        DELETE FROM incidents WHERE tenant_id = v_tenant_id;
        DELETE FROM service_health_checks WHERE tenant_id = v_tenant_id;
        DELETE FROM deployment_approvals WHERE tenant_id = v_tenant_id;
        DELETE FROM deployment_executions WHERE tenant_id = v_tenant_id;
        DELETE FROM kpi_targets WHERE tenant_id = v_tenant_id;
        DELETE FROM budget_allocations WHERE tenant_id = v_tenant_id;
        DELETE FROM cloud_migrations WHERE tenant_id = v_tenant_id;
        DELETE FROM cost_optimization_recommendations WHERE tenant_id = v_tenant_id;
        DELETE FROM compliance_assessments WHERE tenant_id = v_tenant_id;
        DELETE FROM policy_violations WHERE tenant_id = v_tenant_id;
        DELETE FROM architecture_patterns WHERE tenant_id = v_tenant_id;
        DELETE FROM governance_policies WHERE tenant_id = v_tenant_id;
        DELETE FROM compliance_frameworks WHERE tenant_id = v_tenant_id;
        DELETE FROM blueprints WHERE tenant_id = v_tenant_id;
        DELETE FROM projects WHERE tenant_id = v_tenant_id;
        DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE tenant_id = v_tenant_id);
        DELETE FROM users WHERE tenant_id = v_tenant_id;
        DELETE FROM tenants WHERE id = v_tenant_id;
    END IF;
END $$;

-- ============================================================================
-- CORE DATA
-- ============================================================================

-- Tenant
INSERT INTO tenants (name, slug, data_region, status, settings)
VALUES ('Test Organization', 'test-org', 'us-east-1', 'active', '{"test": true}'::jsonb);

-- Users (5 roles)
DO $$
DECLARE
    v_tenant_id UUID;
    v_project_id UUID;
    v_user_pm_id UUID;
    v_blueprint_id UUID;
BEGIN
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'test-org';
    
    -- Insert users
    INSERT INTO users (tenant_id, email, first_name, last_name, status, auth_provider)
    VALUES 
        (v_tenant_id, 'pm@test.com', 'Project', 'Manager', 'active', 'local'),
        (v_tenant_id, 'se@test.com', 'Site', 'Engineer', 'active', 'local'),
        (v_tenant_id, 'ea@test.com', 'Enterprise', 'Architect', 'active', 'local'),
        (v_tenant_id, 'ta@test.com', 'Technical', 'Architect', 'active', 'local'),
        (v_tenant_id, 'sa@test.com', 'Solution', 'Architect', 'active', 'local');
    
    SELECT id INTO v_user_pm_id FROM users WHERE tenant_id = v_tenant_id AND email = 'pm@test.com';
    
    -- Project
    INSERT INTO projects (tenant_id, code, name, description, owner_id, status, metadata)
    VALUES (v_tenant_id, 'TEST-001', 'Test Project', 'Test project for integration tests', v_user_pm_id, 'active', '{}'::jsonb);
    
    SELECT id INTO v_project_id FROM projects WHERE tenant_id = v_tenant_id AND code = 'TEST-001';
    
    -- Blueprint (minimum required fields)
    INSERT INTO blueprints (tenant_id, project_id, name, description, primary_provider, lifecycle_state, created_by, category, provider, status, version)
    VALUES (v_tenant_id, v_project_id, 'Test Blueprint', 'Test blueprint', 'aws', 'draft', v_user_pm_id, 'web-app', 'aws', 'draft', '1.0.0');
    
    SELECT id INTO v_blueprint_id FROM blueprints WHERE tenant_id = v_tenant_id AND name = 'Test Blueprint';
    
    -- SA: AI Analysis
    INSERT INTO ai_analyses (tenant_id, blueprint_id, analysis_type, status, created_by)
    VALUES (v_tenant_id, v_blueprint_id, 'architecture', 'completed', v_user_pm_id);
    
    -- TA: Guardrail Rule
    INSERT INTO guardrails_rules (tenant_id, name, category, rule_type, severity, status, conditions, actions, created_by)
    VALUES (v_tenant_id, 'Test Guardrail', 'security', 'validation', 'high', 'active', '{}'::jsonb, '{}'::jsonb, v_user_pm_id);
    
    -- PM: Budget Allocation
    INSERT INTO budget_allocations (tenant_id, project_id, category, amount, currency, fiscal_year, effective_date, allocated_by)
    VALUES (v_tenant_id, v_project_id, 'infrastructure', 10000.00, 'USD', 2024, NOW(), v_user_pm_id);
    
    -- SE: Incident
    INSERT INTO incidents (tenant_id, title, severity, status, priority, detected_by, reported_by)
    VALUES (v_tenant_id, 'Test Incident', 'medium', 'open', 'p2', 'monitoring', v_user_pm_id);
    
    -- EA: Governance Policy
    INSERT INTO governance_policies (tenant_id, name, policy_type, category, status, severity, policy_rules, enforcement_level, effective_from, created_by)
    VALUES (v_tenant_id, 'Test Policy', 'security', 'compliance', 'active', 'warning', '{}'::jsonb, 'advisory', NOW(), v_user_pm_id);
    
END $$;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 'Data loaded successfully' AS status;

SELECT 'tenants' AS table_name, COUNT(*) AS record_count FROM tenants WHERE slug = 'test-org'
UNION ALL
SELECT 'users', COUNT(*) FROM users WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL
SELECT 'projects', COUNT(*) FROM projects WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL
SELECT 'blueprints', COUNT(*) FROM blueprints WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL
SELECT 'ai_analyses', COUNT(*) FROM ai_analyses WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL
SELECT 'guardrails_rules', COUNT(*) FROM guardrails_rules WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL
SELECT 'budget_allocations', COUNT(*) FROM budget_allocations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL
SELECT 'incidents', COUNT(*) FROM incidents WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL
SELECT 'governance_policies', COUNT(*) FROM governance_policies WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
