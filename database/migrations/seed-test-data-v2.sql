-- ============================================================================
-- IAC Dharma Platform - Test Data Seed Script V2
-- ============================================================================
-- Purpose: Populate database with test data matching the actual schema
-- ============================================================================

-- Create test tenant
INSERT INTO tenants (name, slug, data_region, status, settings)
VALUES ('Test Organization', 'test-org', 'us-east-1', 'active', '{"test": true}'::jsonb)
ON CONFLICT (slug) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
RETURNING id;

-- Store tenant_id for reuse
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
    v_exec_123_id UUID;
    v_exec_456_id UUID;
    v_incident_123_id UUID;
    v_policy_123_id UUID;
    v_pattern_123_id UUID;
BEGIN
    -- Get tenant ID
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'test-org';
    
    -- ========================================================================
    -- USERS
    -- ========================================================================
    INSERT INTO users (tenant_id, email, first_name, last_name, status, auth_provider)
    VALUES 
        (v_tenant_id, 'pm@test.com', 'Project', 'Manager', 'active', 'local'),
        (v_tenant_id, 'se@test.com', 'Site', 'Engineer', 'active', 'local'),
        (v_tenant_id, 'ea@test.com', 'Enterprise', 'Architect', 'active', 'local'),
        (v_tenant_id, 'ta@test.com', 'Technical', 'Architect', 'active', 'local'),
        (v_tenant_id, 'sa@test.com', 'Solution', 'Architect', 'active', 'local')
    ON CONFLICT (tenant_id, email) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    SELECT id INTO v_user_pm_id FROM users WHERE tenant_id = v_tenant_id AND email = 'pm@test.com';
    SELECT id INTO v_user_se_id FROM users WHERE tenant_id = v_tenant_id AND email = 'se@test.com';
    SELECT id INTO v_user_ea_id FROM users WHERE tenant_id = v_tenant_id AND email = 'ea@test.com';
    SELECT id INTO v_user_ta_id FROM users WHERE tenant_id = v_tenant_id AND email = 'ta@test.com';
    SELECT id INTO v_user_sa_id FROM users WHERE tenant_id = v_tenant_id AND email = 'sa@test.com';
    
    -- ========================================================================
    -- PROJECTS
    -- ========================================================================
    INSERT INTO projects (tenant_id, code, name, description, owner_id, status, metadata)
    VALUES 
        (v_tenant_id, 'ECOM-001', 'E-Commerce Platform', 'Main e-commerce application', v_user_pm_id, 'active', '{"priority": "high"}'::jsonb),
        (v_tenant_id, 'MSVC-001', 'Microservices API', 'Backend microservices', v_user_pm_id, 'active', '{"priority": "medium"}'::jsonb),
        (v_tenant_id, 'DATA-001', 'Data Pipeline', 'Analytics data pipeline', v_user_pm_id, 'planning', '{"priority": "low"}'::jsonb)
    ON CONFLICT (tenant_id, code) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    SELECT id INTO v_project_id FROM projects WHERE tenant_id = v_tenant_id AND code = 'ECOM-001' LIMIT 1;
    
    -- ========================================================================
    -- BLUEPRINTS
    -- ========================================================================
    INSERT INTO blueprints (project_id, name, description, scope, primary_provider, lifecycle_state, created_by)
    VALUES 
        (v_project_id, 'AWS E-Commerce Blueprint', 'AWS-based e-commerce infrastructure', 'cloud', 'aws', 'active', v_user_sa_id),
        (v_project_id, 'Azure Microservices Blueprint', 'Azure AKS microservices', 'cloud', 'azure', 'active', v_user_sa_id),
        (v_project_id, 'GCP Data Pipeline Blueprint', 'GCP BigQuery pipeline', 'cloud', 'gcp', 'draft', v_user_sa_id)
    ON CONFLICT (project_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    SELECT id INTO v_blueprint_123_id FROM blueprints WHERE project_id = v_project_id AND name = 'AWS E-Commerce Blueprint';
    SELECT id INTO v_blueprint_456_id FROM blueprints WHERE project_id = v_project_id AND name = 'Azure Microservices Blueprint';
    
    -- ========================================================================
    -- BLUEPRINT VERSIONS
    -- ========================================================================
    INSERT INTO blueprint_versions (blueprint_id, version_number, change_summary, created_by, tenant_id)
    VALUES 
        (v_blueprint_123_id, '1.0.0', 'Initial version', v_user_sa_id, v_tenant_id),
        (v_blueprint_456_id, '2.0.0', 'Major update', v_user_sa_id, v_tenant_id),
        (v_blueprint_456_id, '2.1.0', 'Added messaging', v_user_sa_id, v_tenant_id)
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- DEPLOYMENT EXECUTIONS (PM Role)
    -- ========================================================================
    INSERT INTO deployment_executions (tenant_id, blueprint_id, environment, status, started_by, started_at, completed_at)
    VALUES 
        (v_tenant_id, v_blueprint_123_id, 'production', 'completed', v_user_pm_id, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
        (v_tenant_id, v_blueprint_456_id, 'staging', 'completed', v_user_pm_id, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
        (v_tenant_id, v_blueprint_123_id, 'development', 'in_progress', v_user_pm_id, NOW() - INTERVAL '2 days', NULL),
        (v_tenant_id, v_blueprint_456_id, 'production', 'failed', v_user_pm_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_exec_123_id FROM deployment_executions WHERE tenant_id = v_tenant_id AND blueprint_id = v_blueprint_123_id AND environment = 'production';
    SELECT id INTO v_exec_456_id FROM deployment_executions WHERE tenant_id = v_tenant_id AND blueprint_id = v_blueprint_456_id AND environment = 'staging';
    
    -- ========================================================================
    -- DEPLOYMENT APPROVALS (PM Role)
    -- ========================================================================
    INSERT INTO deployment_approvals (tenant_id, deployment_execution_id, requested_by, reviewed_by, status, comments, requested_at, reviewed_at)
    VALUES 
        (v_tenant_id, v_exec_123_id, v_user_pm_id, v_user_pm_id, 'approved', 'Looks good for production', NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'),
        (v_tenant_id, v_exec_456_id, v_user_pm_id, v_user_pm_id, 'approved', 'Approved for staging', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days')
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- DEPLOYMENT LOGS (SE Role)
    -- ========================================================================
    INSERT INTO deployment_logs (tenant_id, deployment_execution_id, level, message, details)
    VALUES 
        (v_tenant_id, v_exec_123_id, 'info', 'Starting deployment process', '{"step": "initialization"}'::jsonb),
        (v_tenant_id, v_exec_123_id, 'info', 'Infrastructure provisioning complete', '{"step": "provisioning", "duration": "5m"}'::jsonb),
        (v_tenant_id, v_exec_123_id, 'info', 'Deployment completed successfully', '{"step": "completion", "total_duration": "12m"}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- BUDGET ALLOCATIONS (PM Role)
    -- ========================================================================
    INSERT INTO budget_allocations (tenant_id, project_id, name, total_budget, spent, remaining, period_start, period_end, allocated_by)
    VALUES 
        (v_tenant_id, v_project_id, 'Q1 2024 Budget', 50000.00, 32500.00, 17500.00, NOW() - INTERVAL '90 days', NOW() + INTERVAL '90 days', v_user_pm_id),
        (v_tenant_id, v_project_id, 'Q2 2024 Budget', 30000.00, 18000.00, 12000.00, NOW() - INTERVAL '60 days', NOW() + INTERVAL '120 days', v_user_pm_id)
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- CLOUD MIGRATIONS (PM Role)
    -- ========================================================================
    INSERT INTO cloud_migrations (tenant_id, project_id, name, migration_type, status, source_environment, target_environment, progress, owner_id)
    VALUES 
        (v_tenant_id, v_project_id, 'E-Commerce to AWS', 'lift-and-shift', 'in_progress', 
         '{"provider": "on-premise"}'::jsonb, '{"provider": "aws"}'::jsonb, 65, v_user_pm_id),
        (v_tenant_id, v_project_id, 'Legacy API Modernization', 'replatform', 'completed', 
         '{"architecture": "monolith"}'::jsonb, '{"architecture": "microservices"}'::jsonb, 100, v_user_pm_id)
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- KPI METRICS & TARGETS (PM Role)
    -- ========================================================================
    INSERT INTO kpi_targets (tenant_id, project_id, name, category, target_value, unit, period_type, threshold_critical, threshold_warning, created_by)
    VALUES 
        (v_tenant_id, v_project_id, 'Response Time', 'performance', 200, 'ms', 'weekly', 500, 300, v_user_pm_id),
        (v_tenant_id, v_project_id, 'Monthly Cost', 'cost', 5000, 'USD', 'monthly', 8000, 6000, v_user_pm_id),
        (v_tenant_id, v_project_id, 'Uptime', 'reliability', 99.9, 'percent', 'monthly', 99.0, 99.5, v_user_pm_id)
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- INCIDENTS (SE Role)
    -- ========================================================================
    INSERT INTO incidents (tenant_id, title, description, severity, status, priority, detected_by, reported_by, affected_services)
    VALUES 
        (v_tenant_id, 'High CPU Usage', 'CPU utilization spiked to 95% during peak hours', 'medium', 'resolved', 'p2', 'monitoring', v_user_se_id, '["web-server"]'::jsonb),
        (v_tenant_id, 'Database Connection Timeout', 'Connection pool exhausted', 'high', 'resolved', 'p1', 'application', v_user_se_id, '["database"]'::jsonb),
        (v_tenant_id, 'Disk Space Low', 'Storage volume at 85% capacity', 'low', 'open', 'p3', 'monitoring', v_user_se_id, '["storage"]'::jsonb)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_incident_123_id FROM incidents WHERE tenant_id = v_tenant_id AND title = 'High CPU Usage';
    
    -- ========================================================================
    -- INCIDENT UPDATES (SE Role)
    -- ========================================================================
    INSERT INTO incident_updates (incident_id, user_id, update_type, content, visibility)
    VALUES 
        (v_incident_123_id, v_user_se_id, 'investigation', 'Identified cause: inefficient query', 'internal'),
        (v_incident_123_id, v_user_se_id, 'resolution', 'Applied fix: query optimization', 'internal')
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- SERVICE HEALTH CHECKS (SE Role)
    -- ========================================================================
    INSERT INTO service_health_checks (tenant_id, service_name, status, health_score, last_check_at, metrics, metadata)
    VALUES 
        (v_tenant_id, 'web-server', 'healthy', 95, NOW(), '{"cpu": 45, "memory": 60, "latency": 120}'::jsonb, '{}'::jsonb),
        (v_tenant_id, 'database', 'healthy', 90, NOW(), '{"cpu": 35, "memory": 70, "connections": 45}'::jsonb, '{}'::jsonb),
        (v_tenant_id, 'api-gateway', 'degraded', 65, NOW(), '{"cpu": 85, "memory": 75, "latency": 450}'::jsonb, '{}'::jsonb)
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- GOVERNANCE POLICIES (EA Role)
    -- ========================================================================
    INSERT INTO governance_policies (tenant_id, name, description, category, severity, policy_rules, enforcement_level, status, created_by, approved_by)
    VALUES 
        (v_tenant_id, 'Encryption at Rest', 'All data must be encrypted at rest', 'security', 'high', 
         '{"encryption": "AES-256", "key_management": "AWS KMS"}'::jsonb, 'mandatory', 'active', v_user_ea_id, v_user_ea_id),
        (v_tenant_id, 'Multi-Region Deployment', 'Critical services must span multiple regions', 'reliability', 'medium',
         '{"regions": 2}'::jsonb, 'recommended', 'active', v_user_ea_id, v_user_ea_id),
        (v_tenant_id, 'Resource Tagging', 'All resources must have required tags', 'compliance', 'medium',
         '{"required_tags": ["Environment", "Owner", "CostCenter"]}'::jsonb, 'mandatory', 'active', v_user_ea_id, v_user_ea_id)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_policy_123_id FROM governance_policies WHERE tenant_id = v_tenant_id AND name = 'Encryption at Rest';
    
    -- ========================================================================
    -- POLICY VIOLATIONS (EA Role)
    -- ========================================================================
    INSERT INTO policy_violations (tenant_id, policy_id, resource_type, resource_id, violation_details, severity, status, detected_at)
    VALUES 
        (v_tenant_id, v_policy_123_id, 'blueprint', v_blueprint_123_id::text, 
         '{"issue": "RDS encryption disabled"}'::jsonb, 'high', 'open', NOW() - INTERVAL '5 days'),
        (v_tenant_id, v_policy_123_id, 'blueprint', v_blueprint_456_id::text, 
         '{"issue": "Missing required tags"}'::jsonb, 'medium', 'resolved', NOW() - INTERVAL '10 days')
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- ARCHITECTURE PATTERNS (EA Role)
    -- ========================================================================
    INSERT INTO architecture_patterns (tenant_id, name, description, category, pattern_definition, best_practices, status, created_by, approved_by)
    VALUES 
        (v_tenant_id, 'Microservices Architecture', 'Distributed services pattern', 'application',
         '{"services": "independent", "communication": "REST/gRPC"}'::jsonb,
         '["Use API Gateway", "Implement Circuit Breaker"]'::jsonb, 'approved', v_user_ea_id, v_user_ea_id),
        (v_tenant_id, 'Event-Driven Architecture', 'Asynchronous event processing', 'integration',
         '{"messaging": "pub-sub", "processing": "async"}'::jsonb,
         '["Use Message Broker", "Implement Idempotency"]'::jsonb, 'approved', v_user_ea_id, v_user_ea_id)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO v_pattern_123_id FROM architecture_patterns WHERE tenant_id = v_tenant_id AND name = 'Microservices Architecture';
    
    -- ========================================================================
    -- COMPLIANCE FRAMEWORKS (EA Role)
    -- ========================================================================
    INSERT INTO compliance_frameworks (tenant_id, name, description, framework_requirements, controls, status)
    VALUES 
        (v_tenant_id, 'SOC 2 Type II', 'Security and availability controls',
         '{"security": "Access controls", "availability": "99.9% uptime"}'::jsonb,
         '["Access Control", "Encryption", "Monitoring"]'::jsonb, 'active'),
        (v_tenant_id, 'GDPR', 'Data protection and privacy',
         '{"data_protection": "Encryption", "privacy": "Right to erasure"}'::jsonb,
         '["Data Mapping", "Consent Management", "Breach Notification"]'::jsonb, 'active')
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- COMPLIANCE ASSESSMENTS (EA Role)
    -- ========================================================================
    INSERT INTO compliance_assessments (tenant_id, name, framework_name, scope, status, findings, assessment_date, assessed_by)
    VALUES 
        (v_tenant_id, 'SOC 2 Q4 2023', 'SOC 2 Type II', 'Full platform', 'passed',
         '{"compliant": true, "issues": [], "score": 95}'::jsonb, NOW() - INTERVAL '30 days', v_user_ea_id),
        (v_tenant_id, 'GDPR Annual Review', 'GDPR', 'Data processing', 'passed',
         '{"compliant": true, "issues": [{"type": "minor", "description": "Documentation update needed"}], "score": 88}'::jsonb, 
         NOW() - INTERVAL '20 days', v_user_ea_id)
    ON CONFLICT DO NOTHING;
    
    -- ========================================================================
    -- COST OPTIMIZATION RECOMMENDATIONS (EA Role)
    -- ========================================================================
    INSERT INTO cost_optimization_recommendations (tenant_id, recommendation_type, potential_savings, status, details, priority)
    VALUES 
        (v_tenant_id, 'rightsizing', 250.00, 'implemented',
         '{"current": "t3.large", "recommended": "t3.medium", "reason": "Low CPU utilization"}'::jsonb, 'medium'),
        (v_tenant_id, 'reserved-instances', 400.00, 'pending',
         '{"instances": 2, "term": "1-year"}'::jsonb, 'high'),
        (v_tenant_id, 'storage-tiering', 150.00, 'implemented',
         '{"storage_type": "S3", "recommendation": "Enable intelligent tiering"}'::jsonb, 'low')
    ON CONFLICT DO NOTHING;
    
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
SELECT 
    'tenants' as table_name, COUNT(*) as record_count 
FROM tenants WHERE slug = 'test-org'
UNION ALL SELECT 'users', COUNT(*) FROM users WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'projects', COUNT(*) FROM projects WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'blueprints', COUNT(*) FROM blueprints WHERE project_id IN (SELECT id FROM projects WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org'))
UNION ALL SELECT 'deployment_executions', COUNT(*) FROM deployment_executions WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'deployment_approvals', COUNT(*) FROM deployment_approvals WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'budget_allocations', COUNT(*) FROM budget_allocations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'cloud_migrations', COUNT(*) FROM cloud_migrations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'incidents', COUNT(*) FROM incidents WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'governance_policies', COUNT(*) FROM governance_policies WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'architecture_patterns', COUNT(*) FROM architecture_patterns WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'compliance_frameworks', COUNT(*) FROM compliance_frameworks WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'compliance_assessments', COUNT(*) FROM compliance_assessments WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
UNION ALL SELECT 'cost_optimization_recommendations', COUNT(*) FROM cost_optimization_recommendations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org')
ORDER BY table_name;
