-- Seed Test Data for IAC Platform
-- This script creates test users, infrastructure resources, and sample data
-- Matches actual schema structure in iac_v3 database

-- Create test users with bcrypt password hash for 'password123'
-- Password: password123 (hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)

INSERT INTO users (id, username, email, password_hash, role, permissions)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'demo-user', 'demo@iac-platform.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'developer', '{"read": true, "write": true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'developer1', 'dev1@iac-platform.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'developer', '{"read": true, "write": true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'operator1', 'ops1@iac-platform.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'operator', '{"read": true, "write": true, "deploy": true}'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'viewer1', 'view1@iac-platform.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'viewer', '{"read": true}'::jsonb)
ON CONFLICT (username) DO NOTHING;

-- Assign roles to test users in new RBAC system
INSERT INTO user_roles (user_id, role_id, assigned_by)
SELECT '550e8400-e29b-41d4-a716-446655440001'::uuid, id, '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid FROM roles WHERE name = 'developer'
UNION ALL
SELECT '550e8400-e29b-41d4-a716-446655440002'::uuid, id, '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid FROM roles WHERE name = 'developer'
UNION ALL
SELECT '550e8400-e29b-41d4-a716-446655440003'::uuid, id, '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid FROM roles WHERE name = 'operator'
UNION ALL
SELECT '550e8400-e29b-41d4-a716-446655440004'::uuid, id, '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid FROM roles WHERE name = 'viewer'
ON CONFLICT DO NOTHING;

-- Insert sample infrastructure resources (using actual schema: name, provider, region, status, config, tags, created_by)
INSERT INTO infrastructures (name, provider, region, status, config, tags, created_by)
VALUES
  ('prod-web-cluster', 'kubernetes', 'us-east-1', 'running', '{"nodes": 3, "instance_type": "t3.large", "cost": 1250.00}'::jsonb, ARRAY['production', 'web'], '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid),
  ('staging-api-server', 'aws', 'us-west-2', 'running', '{"instance_type": "t3.medium", "storage": "100GB", "cost": 345.50}'::jsonb, ARRAY['staging', 'api'], '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid),
  ('dev-database-cluster', 'aws', 'eu-west-1', 'running', '{"engine": "postgresql", "version": "14.5", "cost": 567.80}'::jsonb, ARRAY['development', 'database'], '550e8400-e29b-41d4-a716-446655440002'::uuid),
  ('prod-redis-cache', 'aws', 'us-east-1', 'running', '{"cache_type": "redis", "nodes": 2, "cost": 123.45}'::jsonb, ARRAY['production', 'cache'], '550e8400-e29b-41d4-a716-446655440002'::uuid),
  ('test-vm-01', 'azure', 'eastus', 'stopped', '{"size": "Standard_B2s", "os": "ubuntu-20.04", "cost": 89.00}'::jsonb, ARRAY['testing'], '550e8400-e29b-41d4-a716-446655440003'::uuid),
  ('prod-storage-bucket', 'aws', 'us-east-1', 'running', '{"type": "s3", "versioning": true, "cost": 234.56}'::jsonb, ARRAY['production', 'storage'], '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid),
  ('dev-container-registry', 'aws', 'us-west-2', 'running', '{"type": "ecr", "scan_on_push": true, "cost": 45.67}'::jsonb, ARRAY['development', 'registry'], '550e8400-e29b-41d4-a716-446655440002'::uuid),
  ('prod-load-balancer', 'aws', 'us-east-1', 'running', '{"type": "alb", "scheme": "internet-facing", "cost": 178.90}'::jsonb, ARRAY['production', 'networking'], '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid)
ON CONFLICT DO NOTHING;

-- Insert sample compute resources (using actual schema: infrastructure_id, instance_type, cpu_cores, memory_gb, disk_gb, status)
INSERT INTO compute_resources (infrastructure_id, instance_type, cpu_cores, memory_gb, disk_gb, status)
SELECT id, 't3.medium', 2, 8, 100, 'running' FROM infrastructures WHERE name = 'staging-api-server'
UNION ALL
SELECT id, 'db.t3.medium', 2, 4, 200, 'running' FROM infrastructures WHERE name = 'dev-database-cluster'
UNION ALL
SELECT id, 'cache.t3.small', 2, 1, 0, 'running' FROM infrastructures WHERE name = 'prod-redis-cache'
UNION ALL
SELECT id, 'Standard_B2s', 2, 4, 30, 'stopped' FROM infrastructures WHERE name = 'test-vm-01'
ON CONFLICT DO NOTHING;

-- Insert sample deployments (using actual schema: infrastructure_id, name, status, image, resources)
INSERT INTO deployments (infrastructure_id, name, namespace, status, image, image_tag, env_vars, resources)
SELECT id, 'web-app', 'production', 'running', 'myregistry/web-app', '1.2.3', '{"NODE_ENV": "production"}'::jsonb, '{"cpu": "2", "memory": "4Gi"}'::jsonb FROM infrastructures WHERE name = 'prod-web-cluster'
UNION ALL
SELECT id, 'api-service', 'staging', 'running', 'myregistry/api-service', '1.1.0', '{"NODE_ENV": "staging"}'::jsonb, '{"cpu": "1", "memory": "2Gi"}'::jsonb FROM infrastructures WHERE name = 'staging-api-server'
UNION ALL
SELECT id, 'test-app', 'testing', 'failed', 'myregistry/test-app', '2.0.1', '{"NODE_ENV": "testing"}'::jsonb, '{"cpu": "1", "memory": "1Gi"}'::jsonb FROM infrastructures WHERE name = 'test-vm-01'
ON CONFLICT DO NOTHING;

-- Insert sample metrics (using actual schema: time, service_id, service_name, metric_name, value, unit, labels)
INSERT INTO metrics (time, service_id, service_name, metric_name, value, unit, labels)
SELECT NOW() - INTERVAL '1 hour', id, name, 'cpu_utilization', 45.5, 'percent', '{"environment": "production"}'::jsonb FROM infrastructures WHERE name = 'prod-web-cluster'
UNION ALL
SELECT NOW() - INTERVAL '1 hour', id, name, 'memory_usage', 62.3, 'percent', '{"environment": "production"}'::jsonb FROM infrastructures WHERE name = 'prod-web-cluster'
UNION ALL
SELECT NOW() - INTERVAL '1 hour', id, name, 'network_in', 1250.67, 'mbps', '{"environment": "production"}'::jsonb FROM infrastructures WHERE name = 'prod-web-cluster'
UNION ALL
SELECT NOW() - INTERVAL '30 minutes', id, name, 'cpu_utilization', 28.7, 'percent', '{"environment": "staging"}'::jsonb FROM infrastructures WHERE name = 'staging-api-server'
UNION ALL
SELECT NOW() - INTERVAL '30 minutes', id, name, 'memory_usage', 41.2, 'percent', '{"environment": "staging"}'::jsonb FROM infrastructures WHERE name = 'staging-api-server'
ON CONFLICT DO NOTHING;

-- Insert sample AI predictions (using actual schema: prediction_type, service_id, service_name, probability, confidence, severity, details)
INSERT INTO predictions (prediction_type, service_id, service_name, probability, confidence, severity, affected_components, recommended_actions, details)
SELECT 'cost', id, name, 0.85, 0.87, 'medium', ARRAY['compute', 'storage'], ARRAY['Optimize instance sizes', 'Enable auto-scaling'], '{"predicted_cost": 1450.00, "current_cost": 1250.00, "increase": "16%"}'::jsonb FROM infrastructures WHERE name = 'prod-web-cluster'
UNION ALL
SELECT 'capacity', id, name, 0.75, 0.92, 'high', ARRAY['cpu', 'memory'], ARRAY['Scale up resources', 'Add more replicas'], '{"current_usage": 75.0, "predicted_usage": 92.0, "timeframe": "7 days"}'::jsonb FROM infrastructures WHERE name = 'staging-api-server'
UNION ALL
SELECT 'failure', id, name, 0.15, 0.78, 'low', ARRAY['disk'], ARRAY['Monitor disk health', 'Schedule maintenance'], '{"risk_score": 0.15, "factors": ["disk age", "write patterns"], "timeframe": "14 days"}'::jsonb FROM infrastructures WHERE name = 'dev-database-cluster'
ON CONFLICT DO NOTHING;

-- Insert audit logs (using actual schema: user_id, action, resource_type, resource_id, details, ip_address, user_agent)
INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
SELECT '7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid, 'create', 'infrastructure', id, '{"status": "created", "provider": "kubernetes", "region": "us-east-1"}'::jsonb, '192.168.1.100', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
FROM infrastructures WHERE name = 'prod-web-cluster'
UNION ALL
SELECT '550e8400-e29b-41d4-a716-446655440002'::uuid, 'update', 'infrastructure', id, '{"config": "updated", "changes": ["added tags", "updated config"]}'::jsonb, '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
FROM infrastructures WHERE name = 'dev-database-cluster'
UNION ALL
SELECT '550e8400-e29b-41d4-a716-446655440003'::uuid, 'stop', 'infrastructure', id, '{"status": "stopped", "reason": "maintenance"}'::jsonb, '192.168.1.102', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
FROM infrastructures WHERE name = 'test-vm-01'
ON CONFLICT DO NOTHING;

-- Display summary
SELECT 'Seed data inserted successfully!' AS status, 
       (SELECT COUNT(*) FROM users WHERE id IN ('550e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid)) AS test_users,
       (SELECT COUNT(*) FROM infrastructures WHERE created_by IN ('7b116ead-4bbc-4bab-a91d-f4d16bfacdf8'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid)) AS infrastructures,
       (SELECT COUNT(*) FROM deployments) AS deployments,
       (SELECT COUNT(*) FROM metrics) AS metrics,
       (SELECT COUNT(*) FROM predictions) AS predictions;

-- Success message
SELECT 'Seed data inserted successfully! Created 4 test users, 8 infrastructure resources, and sample metrics.' AS status;
