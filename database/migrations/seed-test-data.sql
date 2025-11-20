-- ============================================================================
-- IAC Dharma Platform - Test Data Seed Script
-- ============================================================================
-- Purpose: Populate database with comprehensive test data for integration tests
-- Coverage: All 5 roles (PM, SE, EA, TA, SA) with realistic relationships
-- Note: Uses real database schema discovered from existing tables
-- ============================================================================

-- Clean existing test data (in reverse dependency order)
DELETE FROM incident_updates WHERE incident_id IN (SELECT id FROM incidents WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org'));
DELETE FROM incident_timeline WHERE incident_id IN (SELECT id FROM incidents WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org'));
DELETE FROM incident_reviews WHERE incident_id IN (SELECT id FROM incidents WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org'));
DELETE FROM incidents WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM service_health_checks WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM deployment_logs WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM deployment_approvals WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM deployment_executions WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM cost_optimization_recommendations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM policy_violations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM compliance_assessments WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM compliance_frameworks WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM pattern_approvals WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM architecture_patterns WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM governance_policies WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM cloud_migrations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM kpi_metrics WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM kpi_targets WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM budget_spending WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM budget_alerts WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM budget_allocations WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM blueprint_versions WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM blueprints WHERE project_id IN (SELECT id FROM projects WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org'));
DELETE FROM projects WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org'));
DELETE FROM users WHERE tenant_id = (SELECT id FROM tenants WHERE slug = 'test-org');
DELETE FROM tenants WHERE slug = 'test-org';

-- ============================================================================
-- CORE ENTITIES: Tenants & Users
-- ============================================================================

INSERT INTO tenants (id, name, created_at, updated_at) VALUES
('test-tenant-123', 'Test Organization', NOW(), NOW());

INSERT INTO users (id, email, name, role, tenant_id, created_at, updated_at) VALUES
('test-user-pm-123', 'pm@test.com', 'Test PM User', 'PM', 'test-tenant-123', NOW(), NOW()),
('test-user-se-123', 'se@test.com', 'Test SE User', 'SE', 'test-tenant-123', NOW(), NOW()),
('test-user-ea-123', 'ea@test.com', 'Test EA User', 'EA', 'test-tenant-123', NOW(), NOW()),
('test-user-ta-123', 'ta@test.com', 'Test TA User', 'TA', 'test-tenant-123', NOW(), NOW()),
('test-user-sa-123', 'sa@test.com', 'Test SA User', 'SA', 'test-tenant-123', NOW(), NOW());

-- ============================================================================
-- SA ROLE: Blueprints & AI Recommendations
-- ============================================================================

-- Blueprints
INSERT INTO blueprints (id, name, category, provider, components, status, version, created_by, tenant_id, created_at, updated_at) VALUES
('test-blueprint-123', 'E-Commerce Platform', 'web-app', 'aws', 
 '{"compute": {"type": "ec2", "instances": 2}, "database": {"type": "rds", "engine": "postgres"}, "storage": {"type": "s3", "buckets": 3}}'::jsonb,
 'active', '1.0.0', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '30 days', NOW()),
('test-blueprint-456', 'Microservices API', 'api', 'azure', 
 '{"compute": {"type": "aks", "nodes": 3}, "database": {"type": "cosmosdb"}, "messaging": {"type": "service-bus"}}'::jsonb,
 'active', '2.1.0', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '20 days', NOW()),
('test-blueprint-789', 'Data Pipeline', 'data-pipeline', 'gcp', 
 '{"compute": {"type": "gke", "nodes": 4}, "database": {"type": "bigquery"}, "streaming": {"type": "pub-sub"}}'::jsonb,
 'draft', '1.0.0', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '10 days', NOW());

-- Blueprint Versions
INSERT INTO blueprint_versions (id, blueprint_id, version, components, notes, created_by, tenant_id, created_at) VALUES
('test-version-123', 'test-blueprint-123', '1.0.0', 
 '{"compute": {"type": "ec2", "instances": 2}, "database": {"type": "rds", "engine": "postgres"}}'::jsonb,
 'Initial version', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '30 days'),
('test-version-456', 'test-blueprint-456', '2.0.0', 
 '{"compute": {"type": "aks", "nodes": 2}, "database": {"type": "cosmosdb"}}'::jsonb,
 'Major update', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '15 days'),
('test-version-789', 'test-blueprint-456', '2.1.0', 
 '{"compute": {"type": "aks", "nodes": 3}, "database": {"type": "cosmosdb"}, "messaging": {"type": "service-bus"}}'::jsonb,
 'Added messaging', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '10 days');

-- AI Analyses
INSERT INTO ai_analyses (id, blueprint_id, analysis_type, recommendations, status, created_by, tenant_id, created_at, updated_at) VALUES
('test-rec-123', 'test-blueprint-123', 'architecture', 
 '{"scalability": {"score": 8, "suggestions": ["Add auto-scaling", "Implement load balancer"]}, "security": {"score": 7, "suggestions": ["Enable encryption at rest", "Add WAF"]}}'::jsonb,
 'completed', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '25 days', NOW()),
('test-rec-456', 'test-blueprint-456', 'security', 
 '{"vulnerabilities": [], "compliance": {"score": 9, "frameworks": ["SOC2", "GDPR"]}}'::jsonb,
 'completed', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '18 days', NOW()),
('test-rec-789', 'test-blueprint-123', 'cost', 
 '{"monthly_cost": 1250, "optimization_potential": 250, "recommendations": ["Use reserved instances", "Enable S3 lifecycle policies"]}'::jsonb,
 'completed', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '10 days', NOW());

-- AI Optimizations
INSERT INTO ai_optimizations (id, blueprint_id, goals, current_cost, optimized_cost, savings, recommendations, status, created_by, tenant_id, created_at) VALUES
('test-opt-123', 'test-blueprint-123', '["cost", "performance"]'::jsonb, 1500.00, 1200.00, 300.00,
 '{"compute": "Use spot instances for non-critical workloads", "storage": "Enable S3 intelligent tiering", "database": "Right-size RDS instances"}'::jsonb,
 'completed', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '20 days'),
('test-opt-456', 'test-blueprint-456', '["performance", "reliability"]'::jsonb, 2000.00, 2200.00, -200.00,
 '{"compute": "Add more AKS nodes for redundancy", "database": "Enable multi-region replication"}'::jsonb,
 'completed', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '15 days');

-- AI Comparisons
INSERT INTO ai_comparisons (id, blueprint_ids, comparison_type, results, winner_id, created_by, tenant_id, created_at) VALUES
('test-comp-123', '["test-blueprint-123", "test-blueprint-456"]'::jsonb, 'cost-performance',
 '{"test-blueprint-123": {"cost_score": 8, "performance_score": 7, "total": 15}, "test-blueprint-456": {"cost_score": 6, "performance_score": 9, "total": 15}}'::jsonb,
 'test-blueprint-456', 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '12 days');

-- AI Feedback
INSERT INTO ai_feedback (id, recommendation_id, recommendation_type, rating, feedback, implemented, created_by, tenant_id, created_at) VALUES
('test-feedback-123', 'test-rec-123', 'analysis', 5, 'Very helpful recommendations', true, 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '20 days'),
('test-feedback-456', 'test-opt-123', 'optimization', 4, 'Good cost savings identified', true, 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '18 days');

-- AI Cost Predictions
INSERT INTO ai_cost_predictions (id, blueprint_id, predictions, accuracy, created_by, tenant_id, created_at) VALUES
('test-pred-123', 'test-blueprint-123', 
 '[{"month": 1, "predicted_cost": 1200}, {"month": 2, "predicted_cost": 1250}, {"month": 3, "predicted_cost": 1300}]'::jsonb,
 0.92, 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '15 days');

-- AI Risk Analyses
INSERT INTO ai_risk_analyses (id, blueprint_id, risk_score, risks, mitigations, created_by, tenant_id, created_at) VALUES
('test-risk-123', 'test-blueprint-123', 3.5,
 '{"security": {"level": "medium", "issues": ["Unencrypted data transfer"]}, "availability": {"level": "low", "issues": []}}'::jsonb,
 '{"security": "Enable TLS for all connections", "availability": "Implement multi-AZ deployment"}'::jsonb,
 'test-user-sa-123', 'test-tenant-123', NOW() - INTERVAL '10 days');

-- ============================================================================
-- TA ROLE: Guardrails & IaC Generation
-- ============================================================================

-- Guardrails Rules
INSERT INTO guardrails_rules (id, name, category, severity, rule_type, conditions, actions, status, created_by, tenant_id, created_at, updated_at) VALUES
('test-guardrail-123', 'Encryption Required', 'security', 'high', 'validation',
 '{"check": "encryption_at_rest", "required": true}'::jsonb,
 '{"block": true, "notify": ["security@test.com"]}'::jsonb,
 'active', 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '60 days', NOW()),
('test-guardrail-456', 'Cost Limit', 'cost', 'medium', 'threshold',
 '{"metric": "monthly_cost", "threshold": 5000, "operator": "less_than"}'::jsonb,
 '{"block": false, "notify": ["finance@test.com"]}'::jsonb,
 'active', 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '45 days', NOW()),
('test-guardrail-789', 'Tag Compliance', 'compliance', 'low', 'validation',
 '{"required_tags": ["Environment", "Owner", "CostCenter"]}'::jsonb,
 '{"block": false, "notify": ["ops@test.com"]}'::jsonb,
 'active', 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '30 days', NOW());

-- Guardrail Violations
INSERT INTO guardrail_violations (id, guardrail_id, blueprint_id, violation_details, severity, status, detected_by, tenant_id, created_at, resolved_at) VALUES
('test-violation-123', 'test-guardrail-123', 'test-blueprint-789', 
 '{"issue": "RDS instance has encryption disabled", "resource": "database.rds"}'::jsonb,
 'high', 'open', 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '5 days', NULL),
('test-violation-456', 'test-guardrail-789', 'test-blueprint-456', 
 '{"issue": "Missing CostCenter tag", "resource": "compute.aks"}'::jsonb,
 'low', 'resolved', 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days');

-- Guardrail Violation Overrides
INSERT INTO guardrail_violation_overrides (id, violation_id, reason, approved_by, expires_at, tenant_id, created_at) VALUES
('test-override-123', 'test-violation-123', 'Temporary exception for dev environment', 'test-user-pm-123', NOW() + INTERVAL '30 days', 'test-tenant-123', NOW() - INTERVAL '3 days');

-- Guardrail Audit Log
INSERT INTO guardrail_audit_log (id, guardrail_id, action, performed_by, details, tenant_id, created_at) VALUES
('test-audit-123', 'test-guardrail-123', 'created', 'test-user-ta-123', '{"initial_status": "active"}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '60 days'),
('test-audit-456', 'test-guardrail-456', 'updated', 'test-user-ta-123', '{"field": "threshold", "old": 3000, "new": 5000}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '40 days');

-- IaC Templates
INSERT INTO iac_templates (id, name, provider, template_type, template_code, parameters, description, created_by, tenant_id, created_at, updated_at) VALUES
('test-template-123', 'AWS EC2 Standard', 'aws', 'terraform',
 'resource "aws_instance" "main" { ami = var.ami_id; instance_type = var.instance_type; tags = var.tags }',
 '{"ami_id": {"type": "string", "required": true}, "instance_type": {"type": "string", "default": "t3.medium"}}'::jsonb,
 'Standard EC2 instance template', 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '50 days', NOW()),
('test-template-456', 'Azure AKS Cluster', 'azure', 'terraform',
 'resource "azurerm_kubernetes_cluster" "main" { name = var.cluster_name; node_count = var.node_count }',
 '{"cluster_name": {"type": "string", "required": true}, "node_count": {"type": "number", "default": 3}}'::jsonb,
 'AKS cluster template', 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '40 days', NOW());

-- IaC Generations
INSERT INTO iac_generations (id, blueprint_id, provider, iac_type, status, generated_files, created_by, tenant_id, created_at, completed_at) VALUES
('test-gen-123', 'test-blueprint-123', 'aws', 'terraform', 'completed',
 '{"main.tf": "resource \"aws_instance\" \"web\" {...}", "variables.tf": "variable \"instance_type\" {...}"}'::jsonb,
 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),
('test-gen-456', 'test-blueprint-456', 'azure', 'terraform', 'completed',
 '{"main.tf": "resource \"azurerm_kubernetes_cluster\" \"aks\" {...}", "outputs.tf": "output \"cluster_id\" {...}"}'::jsonb,
 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'),
('test-gen-789', 'test-blueprint-789', 'gcp', 'terraform', 'in_progress',
 '{}'::jsonb,
 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '2 days', NULL);

-- IaC Validation Results
INSERT INTO iac_validation_results (id, generation_id, validation_type, status, issues, created_by, tenant_id, created_at) VALUES
('test-val-123', 'test-gen-123', 'syntax', 'passed', '[]'::jsonb, 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '25 days'),
('test-val-456', 'test-gen-456', 'security', 'passed', '[]'::jsonb, 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '18 days');

-- IaC Cost Estimates
INSERT INTO iac_cost_estimates (id, generation_id, provider, estimated_monthly_cost, cost_breakdown, created_by, tenant_id, created_at) VALUES
('test-cost-123', 'test-gen-123', 'aws', 1250.00,
 '{"compute": 800, "database": 300, "storage": 150}'::jsonb,
 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '25 days'),
('test-cost-456', 'test-gen-456', 'azure', 2000.00,
 '{"compute": 1500, "database": 400, "messaging": 100}'::jsonb,
 'test-user-ta-123', 'test-tenant-123', NOW() - INTERVAL '18 days');

-- ============================================================================
-- PM ROLE: Deployments, Approvals, Budget, Migrations, KPIs
-- ============================================================================

-- Deployments
INSERT INTO deployments (id, blueprint_id, environment, status, deployed_by, tenant_id, created_at, updated_at) VALUES
('test-deploy-123', 'test-blueprint-123', 'production', 'completed', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days'),
('test-deploy-456', 'test-blueprint-456', 'staging', 'completed', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
('test-deploy-789', 'test-blueprint-123', 'development', 'in_progress', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '2 days', NOW()),
('test-deploy-101', 'test-blueprint-456', 'production', 'failed', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days');

-- Deployment Approvals
INSERT INTO deployment_approvals (id, deployment_id, approver_id, status, comments, tenant_id, created_at, updated_at) VALUES
('test-approval-123', 'test-deploy-123', 'test-user-pm-123', 'approved', 'Looks good for production', 'test-tenant-123', NOW() - INTERVAL '21 days', NOW() - INTERVAL '20 days'),
('test-approval-456', 'test-deploy-456', 'test-user-pm-123', 'approved', 'Approved for staging', 'test-tenant-123', NOW() - INTERVAL '16 days', NOW() - INTERVAL '15 days'),
('test-approval-789', 'test-deploy-789', 'test-user-pm-123', 'pending', NULL, 'test-tenant-123', NOW() - INTERVAL '2 days', NOW()),
('test-approval-101', 'test-deploy-101', 'test-user-pm-123', 'rejected', 'Security concerns', 'test-tenant-123', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days');

-- Budget Allocations
INSERT INTO budget_allocations (id, project_name, total_budget, spent, remaining, period_start, period_end, created_by, tenant_id, created_at, updated_at) VALUES
('test-budget-123', 'E-Commerce Platform', 50000.00, 32500.00, 17500.00, NOW() - INTERVAL '90 days', NOW() + INTERVAL '90 days', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '90 days', NOW()),
('test-budget-456', 'Microservices API', 30000.00, 18000.00, 12000.00, NOW() - INTERVAL '60 days', NOW() + INTERVAL '120 days', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '60 days', NOW()),
('test-budget-789', 'Data Pipeline', 40000.00, 5000.00, 35000.00, NOW() - INTERVAL '30 days', NOW() + INTERVAL '150 days', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '30 days', NOW());

-- Project Migrations
INSERT INTO project_migrations (id, project_name, migration_type, status, source_config, target_config, progress, started_by, tenant_id, created_at, updated_at) VALUES
('test-migration-123', 'E-Commerce Platform', 'cloud-migration', 'in_progress',
 '{"provider": "on-premise", "infrastructure": "physical servers"}'::jsonb,
 '{"provider": "aws", "infrastructure": "ec2 + rds"}'::jsonb,
 65, 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '15 days', NOW()),
('test-migration-456', 'Legacy API', 'modernization', 'completed',
 '{"architecture": "monolith", "language": "java-8"}'::jsonb,
 '{"architecture": "microservices", "language": "java-17"}'::jsonb,
 100, 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days');

-- Project KPIs
INSERT INTO project_kpis (id, project_name, kpi_type, metric_name, target_value, current_value, unit, period, created_by, tenant_id, created_at, updated_at) VALUES
('test-kpi-123', 'E-Commerce Platform', 'performance', 'Response Time', 200, 150, 'ms', 'weekly', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '7 days', NOW()),
('test-kpi-456', 'E-Commerce Platform', 'cost', 'Monthly Spend', 5000, 4200, 'USD', 'monthly', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '30 days', NOW()),
('test-kpi-789', 'Microservices API', 'reliability', 'Uptime', 99.9, 99.95, 'percent', 'monthly', 'test-user-pm-123', 'test-tenant-123', NOW() - INTERVAL '30 days', NOW());

-- ============================================================================
-- SE ROLE: Deployment Logs, Incidents, Service Health
-- ============================================================================

-- Deployment Logs
INSERT INTO deployment_logs (id, deployment_id, log_level, message, details, tenant_id, created_at) VALUES
('test-log-123', 'test-deploy-123', 'info', 'Starting deployment process', '{"step": "initialization"}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '20 days'),
('test-log-456', 'test-deploy-123', 'info', 'Infrastructure provisioning complete', '{"step": "provisioning", "duration": "5m"}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '20 days'),
('test-log-789', 'test-deploy-123', 'success', 'Deployment completed successfully', '{"step": "completion", "total_duration": "12m"}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '20 days'),
('test-log-101', 'test-deploy-101', 'error', 'Deployment failed: Security group misconfiguration', '{"step": "networking", "error": "InvalidSecurityGroup"}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '5 days');

-- Incidents
INSERT INTO incidents (id, deployment_id, title, severity, status, description, reported_by, tenant_id, created_at, resolved_at) VALUES
('test-incident-123', 'test-deploy-123', 'High CPU Usage', 'medium', 'resolved', 'CPU utilization spiked to 95% during peak hours', 'test-user-se-123', 'test-tenant-123', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),
('test-incident-456', 'test-deploy-456', 'Database Connection Timeout', 'high', 'resolved', 'Connection pool exhausted', 'test-user-se-123', 'test-tenant-123', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('test-incident-789', 'test-deploy-123', 'Disk Space Low', 'low', 'open', 'Storage volume at 85% capacity', 'test-user-se-123', 'test-tenant-123', NOW() - INTERVAL '3 days', NULL);

-- Incident Updates
INSERT INTO incident_updates (id, incident_id, update_text, updated_by, tenant_id, created_at) VALUES
('test-update-123', 'test-incident-123', 'Identified cause: inefficient query', 'test-user-se-123', 'test-tenant-123', NOW() - INTERVAL '15 days'),
('test-update-456', 'test-incident-123', 'Applied fix: added query optimization', 'test-user-se-123', 'test-tenant-123', NOW() - INTERVAL '14 days'),
('test-update-789', 'test-incident-456', 'Increased connection pool size from 10 to 20', 'test-user-se-123', 'test-tenant-123', NOW() - INTERVAL '10 days');

-- Service Health
INSERT INTO service_health (id, deployment_id, service_name, status, health_score, last_check, metrics, tenant_id, created_at, updated_at) VALUES
('test-health-123', 'test-deploy-123', 'web-server', 'healthy', 95, NOW() - INTERVAL '5 minutes',
 '{"cpu": 45, "memory": 60, "latency": 120}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '20 days', NOW()),
('test-health-456', 'test-deploy-123', 'database', 'healthy', 90, NOW() - INTERVAL '5 minutes',
 '{"cpu": 35, "memory": 70, "connections": 45}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '20 days', NOW()),
('test-health-789', 'test-deploy-456', 'api-gateway', 'degraded', 65, NOW() - INTERVAL '2 minutes',
 '{"cpu": 85, "memory": 75, "latency": 450}'::jsonb, 'test-tenant-123', NOW() - INTERVAL '15 days', NOW());

-- ============================================================================
-- EA ROLE: Governance Policies, Architecture Patterns, Compliance, Cost Optimization
-- ============================================================================

-- Governance Policies
INSERT INTO governance_policies (id, name, category, description, requirements, enforcement_level, status, created_by, tenant_id, created_at, updated_at) VALUES
('test-policy-123', 'Encryption at Rest', 'security', 'All data must be encrypted at rest', 
 '{"encryption": "AES-256", "key_management": "AWS KMS"}'::jsonb, 'mandatory', 'active', 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '90 days', NOW()),
('test-policy-456', 'Multi-Region Deployment', 'reliability', 'Critical services must span multiple regions',
 '{"regions": 2, "providers": ["aws", "azure"]}'::jsonb, 'recommended', 'active', 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '60 days', NOW()),
('test-policy-789', 'Resource Tagging', 'compliance', 'All resources must have required tags',
 '{"required_tags": ["Environment", "Owner", "CostCenter", "Project"]}'::jsonb, 'mandatory', 'active', 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '45 days', NOW());

-- Architecture Patterns
INSERT INTO architecture_patterns (id, name, category, description, components, best_practices, created_by, tenant_id, created_at, updated_at) VALUES
('test-pattern-123', 'Microservices Architecture', 'application', 'Distributed services pattern',
 '{"services": "independent", "communication": "REST/gRPC", "database": "per-service"}'::jsonb,
 '["Use API Gateway", "Implement Circuit Breaker", "Service Discovery"]'::jsonb, 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '120 days', NOW()),
('test-pattern-456', 'Event-Driven Architecture', 'integration', 'Asynchronous event processing',
 '{"messaging": "pub-sub", "processing": "async", "storage": "event-store"}'::jsonb,
 '["Use Message Broker", "Implement Idempotency", "Event Sourcing"]'::jsonb, 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '90 days', NOW());

-- Architecture Pattern Usage
INSERT INTO architecture_pattern_usage (id, pattern_id, blueprint_id, implementation_notes, created_by, tenant_id, created_at) VALUES
('test-usage-123', 'test-pattern-123', 'test-blueprint-456', 'Using AKS for microservices deployment', 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '20 days'),
('test-usage-456', 'test-pattern-456', 'test-blueprint-789', 'Pub/Sub for data pipeline events', 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '10 days');

-- Compliance Frameworks
INSERT INTO compliance_frameworks (id, name, description, requirements, controls, status, created_by, tenant_id, created_at, updated_at) VALUES
('test-compliance-123', 'SOC 2 Type II', 'Security and availability controls',
 '{"security": "Access controls", "availability": "99.9% uptime", "confidentiality": "Data encryption"}'::jsonb,
 '["Access Control", "Encryption", "Monitoring", "Incident Response"]'::jsonb, 'active', 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '180 days', NOW()),
('test-compliance-456', 'GDPR', 'Data protection and privacy',
 '{"data_protection": "Encryption", "privacy": "Right to erasure", "consent": "Explicit opt-in"}'::jsonb,
 '["Data Mapping", "Consent Management", "Data Retention", "Breach Notification"]'::jsonb, 'active', 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '150 days', NOW());

-- Compliance Audits
INSERT INTO compliance_audits (id, framework_id, blueprint_id, audit_date, status, findings, auditor, tenant_id, created_at) VALUES
('test-audit-123', 'test-compliance-123', 'test-blueprint-123', NOW() - INTERVAL '30 days', 'passed',
 '{"compliant": true, "issues": [], "score": 95}'::jsonb, 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '30 days'),
('test-audit-456', 'test-compliance-456', 'test-blueprint-456', NOW() - INTERVAL '20 days', 'passed',
 '{"compliant": true, "issues": [{"type": "minor", "description": "Missing data retention policy"}], "score": 88}'::jsonb, 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '20 days');

-- Cost Optimization Recommendations
INSERT INTO cost_optimization_recommendations (id, blueprint_id, recommendation_type, potential_savings, status, details, created_by, tenant_id, created_at, implemented_at) VALUES
('test-cost-opt-123', 'test-blueprint-123', 'rightsizing', 250.00, 'implemented',
 '{"current": "t3.large", "recommended": "t3.medium", "reason": "Low CPU utilization"}'::jsonb, 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '25 days', NOW() - INTERVAL '20 days'),
('test-cost-opt-456', 'test-blueprint-123', 'reserved-instances', 400.00, 'pending',
 '{"instances": 2, "term": "1-year", "payment": "no-upfront"}'::jsonb, 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '15 days', NULL),
('test-cost-opt-789', 'test-blueprint-456', 'storage-tiering', 150.00, 'implemented',
 '{"storage_type": "S3", "recommendation": "Enable intelligent tiering"}'::jsonb, 'test-user-ea-123', 'test-tenant-123', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days');

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count records per table
SELECT 'tenants' as table_name, COUNT(*) as record_count FROM tenants WHERE id = 'test-tenant-123'
UNION ALL SELECT 'users', COUNT(*) FROM users WHERE tenant_id = 'test-tenant-123'
UNION ALL SELECT 'blueprints', COUNT(*) FROM blueprints WHERE tenant_id = 'test-tenant-123'
UNION ALL SELECT 'deployments', COUNT(*) FROM deployments WHERE tenant_id = 'test-tenant-123'
UNION ALL SELECT 'guardrails_rules', COUNT(*) FROM guardrails_rules WHERE tenant_id = 'test-tenant-123'
UNION ALL SELECT 'iac_generations', COUNT(*) FROM iac_generations WHERE tenant_id = 'test-tenant-123'
UNION ALL SELECT 'governance_policies', COUNT(*) FROM governance_policies WHERE tenant_id = 'test-tenant-123'
UNION ALL SELECT 'incidents', COUNT(*) FROM incidents WHERE tenant_id = 'test-tenant-123'
UNION ALL SELECT 'ai_analyses', COUNT(*) FROM ai_analyses WHERE tenant_id = 'test-tenant-123'
ORDER BY table_name;

-- ============================================================================
-- SEED SCRIPT COMPLETE
-- ============================================================================
