-- ============================================================================
-- IAC Dharma Platform - Test Data Seed Script V3 (Schema Aligned)
-- ============================================================================
-- Purpose: Populate database with test data using aligned schema
-- Note: Works with migration 004_schema_alignment.sql
-- ============================================================================

-- Start transaction
BEGIN;

-- ============================================================================
-- CLEANUP: Remove existing test data
-- ============================================================================
DO $$
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get tenant ID if exists
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'test-org';
    
    IF v_tenant_id IS NOT NULL THEN
        -- Delete in reverse dependency order
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
        DELETE FROM incident_updates WHERE incident_id IN (SELECT id FROM incidents WHERE tenant_id = v_tenant_id);
        DELETE FROM incidents WHERE tenant_id = v_tenant_id;
        DELETE FROM service_health_checks WHERE tenant_id = v_tenant_id;
        -- deployment_logs uses execution_id, not tenant_id - delete via foreign key cascade
        DELETE FROM deployment_approvals WHERE tenant_id = v_tenant_id;
        DELETE FROM deployment_executions WHERE tenant_id = v_tenant_id;
        DELETE FROM kpi_metrics WHERE tenant_id = v_tenant_id;
        DELETE FROM kpi_targets WHERE tenant_id = v_tenant_id;
        DELETE FROM budget_spending WHERE tenant_id = v_tenant_id;
        DELETE FROM budget_alerts WHERE tenant_id = v_tenant_id;
        DELETE FROM budget_allocations WHERE tenant_id = v_tenant_id;
        DELETE FROM cloud_migrations WHERE tenant_id = v_tenant_id;
        DELETE FROM cost_optimization_recommendations WHERE tenant_id = v_tenant_id;
        DELETE FROM compliance_assessments WHERE tenant_id = v_tenant_id;
        DELETE FROM policy_violations WHERE tenant_id = v_tenant_id;
        DELETE FROM architecture_patterns WHERE tenant_id = v_tenant_id;
        DELETE FROM governance_policies WHERE tenant_id = v_tenant_id;
        DELETE FROM compliance_frameworks WHERE tenant_id = v_tenant_id;
        -- blueprint_versions uses blueprint_id, not tenant_id - delete via foreign key cascade from blueprints
        DELETE FROM blueprints WHERE tenant_id = v_tenant_id;
        DELETE FROM projects WHERE tenant_id = v_tenant_id;
        DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE tenant_id = v_tenant_id);
        DELETE FROM users WHERE tenant_id = v_tenant_id;
        DELETE FROM tenants WHERE id = v_tenant_id;
    END IF;
END $$;

-- ============================================================================
-- CORE DATA: Tenant and Users
-- ============================================================================

-- Insert test tenant
INSERT INTO tenants (name, slug, data_region, status, settings)
VALUES ('Test Organization', 'test-org', 'us-east-1', 'active', '{"test": true}'::jsonb)
RETURNING id;

-- Store variables for later use
DO $$
DECLARE
    v_tenant_id UUID;
    v_user_pm_id UUID;
    v_user_se_id UUID;
    v_user_ea_id UUID;
    v_user_ta_id UUID;
    v_user_sa_id UUID;
    v_project_id UUID;
    v_blueprint_123_id UUID;
    v_blueprint_456_id UUID;
    v_blueprint_789_id UUID;
    v_approval_123_id UUID;
    v_approval_456_id UUID;
    v_exec_123_id UUID;
    v_exec_456_id UUID;
    v_incident_123_id UUID;
    v_policy_123_id UUID;
    v_guardrail_123_id UUID;
    v_template_123_id UUID;
    v_generation_123_id UUID;
    v_analysis_123_id UUID;
BEGIN
    -- Get tenant ID
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
    SELECT id INTO v_user_se_id FROM users WHERE tenant_id = v_tenant_id AND email = 'se@test.com';
    SELECT id INTO v_user_ea_id FROM users WHERE tenant_id = v_tenant_id AND email = 'ea@test.com';
    SELECT id INTO v_user_ta_id FROM users WHERE tenant_id = v_tenant_id AND email = 'ta@test.com';
    SELECT id INTO v_user_sa_id FROM users WHERE tenant_id = v_tenant_id AND email = 'sa@test.com';
    
    -- Insert project
    INSERT INTO projects (tenant_id, code, name, description, owner_id, status, metadata)
    VALUES (v_tenant_id, 'ECOM-001', 'E-Commerce Platform', 'Test e-commerce application', v_user_pm_id, 'active', '{"priority": "high"}'::jsonb);
    
    SELECT id INTO v_project_id FROM projects WHERE tenant_id = v_tenant_id AND code = 'ECOM-001';
    
    -- ========================================================================
    -- SA ROLE: Blueprints
    -- ========================================================================
    INSERT INTO blueprints (
        project_id, tenant_id, name, description, category, provider, 
        components, status, version, tags, created_by
    ) VALUES 
        (v_project_id, v_tenant_id, 'AWS E-Commerce', 'AWS-based e-commerce', 'web-app', 'aws',
         '{"compute": {"type": "ec2", "count": 2}, "database": {"type": "rds"}}'::jsonb,
         'active', '1.0.0', '["production", "aws"]'::jsonb, v_user_sa_id),
        (v_project_id, v_tenant_id, 'Azure Microservices', 'Azure AKS microservices', 'api', 'azure',
         '{"compute": {"type": "aks", "nodes": 3}, "database": {"type": "cosmosdb"}}'::jsonb,
         'active', '2.1.0', '["staging", "azure"]'::jsonb, v_user_sa_id),
        (v_project_id, v_tenant_id, 'GCP Data Pipeline', 'GCP BigQuery pipeline', 'data-pipeline', 'gcp',
         '{"compute": {"type": "gke", "nodes": 4}, "database": {"type": "bigquery"}}'::jsonb,
         'draft', '1.0.0', '["development", "gcp"]'::jsonb, v_user_sa_id);
    
    SELECT id INTO v_blueprint_123_id FROM blueprints WHERE tenant_id = v_tenant_id AND name = 'AWS E-Commerce';
    SELECT id INTO v_blueprint_456_id FROM blueprints WHERE tenant_id = v_tenant_id AND name = 'Azure Microservices';
    SELECT id INTO v_blueprint_789_id FROM blueprints WHERE tenant_id = v_tenant_id AND name = 'GCP Data Pipeline';
    
    -- AI Analyses
    INSERT INTO ai_analyses (tenant_id, blueprint_id, analysis_type, recommendations, status, created_by)
    VALUES 
        (v_tenant_id, v_blueprint_123_id, 'architecture',
         '{"scalability": {"score": 8, "suggestions": ["Add auto-scaling", "Implement load balancer"]}}'::jsonb,
         'completed', v_user_sa_id),
        (v_tenant_id, v_blueprint_456_id, 'security',
         '{"compliance": {"score": 9, "frameworks": ["SOC2", "GDPR"]}}'::jsonb,
         'completed', v_user_sa_id);
    
    SELECT id INTO v_analysis_123_id FROM ai_analyses WHERE tenant_id = v_tenant_id LIMIT 1;
    
    -- AI Optimizations
    INSERT INTO ai_optimizations (tenant_id, blueprint_id, optimization_type, goals, current_cost, optimized_cost, savings, recommendations, status, created_by)
    VALUES 
        (v_tenant_id, v_blueprint_123_id, 'cost', '["cost", "performance"]'::jsonb, 1500.00, 1200.00, 300.00,
         '{"compute": "Use spot instances", "storage": "Enable S3 intelligent tiering"}'::jsonb,
         'completed', v_user_sa_id);
    
    -- AI Comparisons
    INSERT INTO ai_comparisons (tenant_id, blueprint_ids, comparison_type, results, winner_id, created_by)
    VALUES 
        (v_tenant_id, jsonb_build_array(v_blueprint_123_id::text, v_blueprint_456_id::text), 'cost-performance',
         '{"scores": {"aws": 15, "azure": 15}}'::jsonb, v_blueprint_456_id, v_user_sa_id);
    
    -- AI Feedback
    INSERT INTO ai_feedback (tenant_id, recommendation_id, recommendation_type, rating, feedback, implemented, created_by)
    VALUES 
        (v_tenant_id, v_analysis_123_id, 'analysis', 5, 'Very helpful recommendations', true, v_user_sa_id);
    
    -- AI Cost Predictions
    INSERT INTO ai_cost_predictions (tenant_id, blueprint_id, prediction_horizon, predictions, accuracy, created_by)
    VALUES 
        (v_tenant_id, v_blueprint_123_id, '3-month',
         '[{"month": 1, "predicted_cost": 1200}, {"month": 2, "predicted_cost": 1250}]'::jsonb,
         0.92, v_user_sa_id);
    
    -- AI Risk Analyses
    INSERT INTO ai_risk_analyses (tenant_id, blueprint_id, risk_score, risk_level, risks, mitigations, created_by)
    VALUES 
        (v_tenant_id, v_blueprint_123_id, 3.5, 'medium',
         '{"security": {"level": "medium", "issues": ["Unencrypted data transfer"]}}'::jsonb,
         '{"security": "Enable TLS for all connections"}'::jsonb, v_user_sa_id);
    
    -- ========================================================================
    -- TA ROLE: Guardrails and IaC
    -- ========================================================================
    
    -- Guardrails Rules
    INSERT INTO guardrails_rules (tenant_id, name, description, category, severity, rule_type, conditions, actions, status, created_by)
    VALUES 
        (v_tenant_id, 'Encryption Required', 'All data must be encrypted at rest', 'security', 'high', 'validation',
         '{"check": "encryption_at_rest", "required": true}'::jsonb,
         '{"block": true, "notify": ["security@test.com"]}'::jsonb, 'active', v_user_ta_id),
        (v_tenant_id, 'Cost Limit', 'Monthly cost must be under threshold', 'cost', 'medium', 'threshold',
         '{"metric": "monthly_cost", "threshold": 5000}'::jsonb,
         '{"block": false, "notify": ["finance@test.com"]}'::jsonb, 'active', v_user_ta_id);
    
    SELECT id INTO v_guardrail_123_id FROM guardrails_rules WHERE tenant_id = v_tenant_id AND name = 'Encryption Required';
    
    -- Guardrail Violations
    INSERT INTO guardrail_violations (tenant_id, guardrail_id, blueprint_id, resource_type, violation_details, severity, status)
    VALUES 
        (v_tenant_id, v_guardrail_123_id, v_blueprint_789_id, 'database',
         '{"issue": "RDS encryption disabled", "resource": "database.rds"}'::jsonb, 'high', 'open');
    
    -- IaC Templates
    INSERT INTO iac_templates (tenant_id, name, description, provider, template_type, template_code, parameters, status, created_by)
    VALUES 
        (v_tenant_id, 'AWS EC2 Standard', 'Standard EC2 instance template', 'aws', 'terraform',
         'resource "aws_instance" "main" { ami = var.ami_id; instance_type = var.instance_type; }',
         '{"ami_id": {"type": "string", "required": true}}'::jsonb, 'active', v_user_ta_id),
        (v_tenant_id, 'Azure AKS Cluster', 'AKS cluster template', 'azure', 'terraform',
         'resource "azurerm_kubernetes_cluster" "main" { name = var.cluster_name; }',
         '{"cluster_name": {"type": "string", "required": true}}'::jsonb, 'active', v_user_ta_id);
    
    SELECT id INTO v_template_123_id FROM iac_templates WHERE tenant_id = v_tenant_id AND name = 'AWS EC2 Standard';
    
    -- IaC Generations
    INSERT INTO iac_generations (tenant_id, blueprint_id, template_id, provider, iac_type, status, generated_files, created_by)
    VALUES 
        (v_tenant_id, v_blueprint_123_id, v_template_123_id, 'aws', 'terraform', 'completed',
         '{"main.tf": "resource \"aws_instance\" \"web\" {...}"}'::jsonb, v_user_ta_id),
        (v_tenant_id, v_blueprint_456_id, NULL, 'azure', 'terraform', 'completed',
         '{"main.tf": "resource \"azurerm_kubernetes_cluster\" {...}"}'::jsonb, v_user_ta_id);
    
    SELECT id INTO v_generation_123_id FROM iac_generations WHERE tenant_id = v_tenant_id AND blueprint_id = v_blueprint_123_id;
    
    -- IaC Validation Results
    INSERT INTO iac_validation_results (tenant_id, generation_id, validation_type, status, issues, created_by)
    VALUES 
        (v_tenant_id, v_generation_123_id, 'syntax', 'passed', '[]'::jsonb, v_user_ta_id),
        (v_tenant_id, v_generation_123_id, 'security', 'passed', '[]'::jsonb, v_user_ta_id);
    
    -- IaC Cost Estimates
    INSERT INTO iac_cost_estimates (tenant_id, generation_id, provider, estimated_monthly_cost, cost_breakdown, created_by)
    VALUES 
        (v_tenant_id, v_generation_123_id, 'aws', 1250.00,
         '{"compute": 800, "database": 300, "storage": 150}'::jsonb, v_user_ta_id);
    
    -- ========================================================================
    -- PM ROLE: Deployments, Budget, Migrations, KPIs
    -- ========================================================================
    
    -- Deployment Approvals (must be created first, as deployment_executions.deployment_id references these)
    INSERT INTO deployment_approvals (tenant_id, deployment_id, environment, status, requested_by, reviewed_by, comments, requested_at, reviewed_at)
    VALUES 
        (v_tenant_id, v_blueprint_123_id, 'production', 'approved', v_user_pm_id, v_user_pm_id, 'Looks good for production', NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'),
        (v_tenant_id, v_blueprint_456_id, 'staging', 'approved', v_user_pm_id, v_user_pm_id, 'Approved for staging', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days');
    
    SELECT id INTO v_approval_123_id FROM deployment_approvals WHERE tenant_id = v_tenant_id AND environment = 'production';
    SELECT id INTO v_approval_456_id FROM deployment_approvals WHERE tenant_id = v_tenant_id AND environment = 'staging';
    
    -- Deployment Executions (deployment_id references deployment_approvals.id)
    INSERT INTO deployment_executions (tenant_id, deployment_id, environment, status, deployment_type, started_by, started_at, completed_at, target_version)
    VALUES 
        (v_tenant_id, v_approval_123_id, 'production', 'completed', 'full', v_user_pm_id, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', '1.0.0'),
        (v_tenant_id, v_approval_456_id, 'staging', 'completed', 'full', v_user_pm_id, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', '1.0.0'),
        (v_tenant_id, v_approval_123_id, 'development', 'in-progress', 'incremental', v_user_pm_id, NOW() - INTERVAL '2 days', NULL, '1.1.0');
    
    SELECT id INTO v_exec_123_id FROM deployment_executions WHERE tenant_id = v_tenant_id AND environment = 'production';
    SELECT id INTO v_exec_456_id FROM deployment_executions WHERE tenant_id = v_tenant_id AND environment = 'staging';
    
    -- Deployment Logs
    INSERT INTO deployment_logs (execution_id, log_level, message, context)
    VALUES 
        (v_exec_123_id, 'info', 'Starting deployment', '{"step": "initialization"}'::jsonb),
        (v_exec_123_id, 'info', 'Deployment completed', '{"step": "completion"}'::jsonb);
    
    -- Budget Allocations
    INSERT INTO budget_allocations (tenant_id, project_id, category, amount, currency, fiscal_year, description, effective_date, allocated_by)
    VALUES 
        (v_tenant_id, v_project_id, 'infrastructure', 50000.00, 'USD', 2024, 'Q1 2024 Infrastructure Budget', NOW() - INTERVAL '90 days', v_user_pm_id);
    
    -- Cloud Migrations
    INSERT INTO cloud_migrations (tenant_id, project_id, name, description, status, phase, priority, progress, owner_id)
    VALUES 
        (v_tenant_id, v_project_id, 'E-Commerce to AWS', 'Migrating e-commerce platform to AWS', 'in-progress', 'execution', 'high', 65, v_user_pm_id);
    
    -- KPI Targets
    INSERT INTO kpi_targets (tenant_id, project_id, name, category, target_value, unit, period_type, threshold_critical, threshold_warning, created_by)
    VALUES 
        (v_tenant_id, v_project_id, 'Response Time', 'performance', 200, 'ms', 'weekly', 500, 300, v_user_pm_id),
        (v_tenant_id, v_project_id, 'Monthly Cost', 'cost', 5000, 'USD', 'monthly', 8000, 6000, v_user_pm_id);
    
    -- ========================================================================
    -- SE ROLE: Incidents, Health Checks
    -- ========================================================================
    
    -- Incidents
    INSERT INTO incidents (tenant_id, title, description, severity, status, priority, detected_by, reported_by, affected_services)
    VALUES 
        (v_tenant_id, 'High CPU Usage', 'CPU spiked to 95%', 'medium', 'resolved', 'p2', 'monitoring', v_user_se_id, '["web-server"]'::jsonb),
        (v_tenant_id, 'Database Timeout', 'Connection pool exhausted', 'high', 'resolved', 'p1', 'application', v_user_se_id, '["database"]'::jsonb),
        (v_tenant_id, 'Disk Space Low', 'Storage at 85%', 'low', 'open', 'p3', 'monitoring', v_user_se_id, '["storage"]'::jsonb);
    
    SELECT id INTO v_incident_123_id FROM incidents WHERE tenant_id = v_tenant_id AND title = 'High CPU Usage';
    
    -- Incident Updates
    INSERT INTO incident_updates (incident_id, user_id, update_type, content, visibility)
    VALUES 
        (v_incident_123_id, v_user_se_id, 'investigation', 'Identified cause: inefficient query', 'internal'),
        (v_incident_123_id, v_user_se_id, 'resolution', 'Applied fix: query optimization', 'internal');
    
    -- Service Health Checks
    INSERT INTO service_health_checks (tenant_id, service_name, status, health_score, last_check_at, metrics, metadata)
    VALUES 
        (v_tenant_id, 'web-server', 'healthy', 95, NOW(), '{"cpu": 45, "memory": 60}'::jsonb, '{}'::jsonb),
        (v_tenant_id, 'database', 'healthy', 90, NOW(), '{"cpu": 35, "memory": 70}'::jsonb, '{}'::jsonb),
        (v_tenant_id, 'api-gateway', 'degraded', 65, NOW(), '{"cpu": 85, "memory": 75}'::jsonb, '{}'::jsonb);
    
    -- ========================================================================
    -- EA ROLE: Policies, Patterns, Compliance
    -- ========================================================================
    
    -- Governance Policies
    INSERT INTO governance_policies (tenant_id, name, description, category, severity, policy_rules, enforcement_level, status, created_by, approved_by)
    VALUES 
        (v_tenant_id, 'Encryption at Rest', 'All data encrypted', 'security', 'high',
         '{"encryption": "AES-256"}'::jsonb, 'mandatory', 'active', v_user_ea_id, v_user_ea_id),
        (v_tenant_id, 'Resource Tagging', 'Required tags', 'compliance', 'medium',
         '{"required_tags": ["Environment", "Owner"]}'::jsonb, 'mandatory', 'active', v_user_ea_id, v_user_ea_id);
    
    SELECT id INTO v_policy_123_id FROM governance_policies WHERE tenant_id = v_tenant_id AND name = 'Encryption at Rest';
    
    -- Architecture Patterns
    INSERT INTO architecture_patterns (tenant_id, name, description, category, pattern_definition, best_practices, status, created_by, approved_by)
    VALUES 
        (v_tenant_id, 'Microservices Architecture', 'Distributed services', 'application',
         '{"services": "independent"}'::jsonb, '["Use API Gateway", "Circuit Breaker"]'::jsonb,
         'approved', v_user_ea_id, v_user_ea_id);
    
    -- Compliance Frameworks
    INSERT INTO compliance_frameworks (tenant_id, name, description, framework_requirements, controls, status)
    VALUES 
        (v_tenant_id, 'SOC 2 Type II', 'Security controls', '{"security": "Access controls"}'::jsonb,
         '["Access Control", "Encryption"]'::jsonb, 'active'),
        (v_tenant_id, 'GDPR', 'Data protection', '{"data_protection": "Encryption"}'::jsonb,
         '["Data Mapping", "Consent Management"]'::jsonb, 'active');
    
    -- Compliance Assessments
    INSERT INTO compliance_assessments (tenant_id, name, framework_name, scope, status, findings, assessment_date, assessed_by)
    VALUES 
        (v_tenant_id, 'SOC 2 Q4 2023', 'SOC 2 Type II', 'Full platform', 'passed',
         '{"compliant": true, "score": 95}'::jsonb, NOW() - INTERVAL '30 days', v_user_ea_id);
    
    -- Cost Optimization Recommendations
    INSERT INTO cost_optimization_recommendations (tenant_id, recommendation_type, potential_savings, status, details, priority)
    VALUES 
        (v_tenant_id, 'rightsizing', 250.00, 'implemented',
         '{"current": "t3.large", "recommended": "t3.medium"}'::jsonb, 'medium'),
        (v_tenant_id, 'reserved-instances', 400.00, 'pending',
         '{"instances": 2, "term": "1-year"}'::jsonb, 'high');
    
    RAISE NOTICE 'Seed data created successfully for tenant: %', v_tenant_id;
END $$;

-- Commit transaction
COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT 
    'tenants' as table_name, COUNT(*) as record_count 
FROM tenants WHERE slug = 'test-org'
UNION ALL SELECT 'users', COUNT(*) FROM users WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'projects', COUNT(*) FROM projects WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'blueprints', COUNT(*) FROM blueprints WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'ai_analyses', COUNT(*) FROM ai_analyses WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'ai_optimizations', COUNT(*) FROM ai_optimizations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'ai_comparisons', COUNT(*) FROM ai_comparisons WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'ai_feedback', COUNT(*) FROM ai_feedback WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'ai_cost_predictions', COUNT(*) FROM ai_cost_predictions WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'ai_risk_analyses', COUNT(*) FROM ai_risk_analyses WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'guardrails_rules', COUNT(*) FROM guardrails_rules WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'guardrail_violations', COUNT(*) FROM guardrail_violations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'iac_templates', COUNT(*) FROM iac_templates WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'iac_generations', COUNT(*) FROM iac_generations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'iac_validation_results', COUNT(*) FROM iac_validation_results WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'iac_cost_estimates', COUNT(*) FROM iac_cost_estimates WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'deployment_executions', COUNT(*) FROM deployment_executions WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'deployment_approvals', COUNT(*) FROM deployment_approvals WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'budget_allocations', COUNT(*) FROM budget_allocations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'cloud_migrations', COUNT(*) FROM cloud_migrations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'kpi_targets', COUNT(*) FROM kpi_targets WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'incidents', COUNT(*) FROM incidents WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'governance_policies', COUNT(*) FROM governance_policies WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'architecture_patterns', COUNT(*) FROM architecture_patterns WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'compliance_frameworks', COUNT(*) FROM compliance_frameworks WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'compliance_assessments', COUNT(*) FROM compliance_assessments WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'cost_optimization_recommendations', COUNT(*) FROM cost_optimization_recommendations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
ORDER BY table_name;
