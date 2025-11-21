-- Database Performance Optimization Migration
-- Add indexes for frequently queried columns

-- Blueprints table indexes
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON blueprints(status);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_at ON blueprints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_target_cloud ON blueprints(target_cloud);
CREATE INDEX IF NOT EXISTS idx_blueprints_user_status ON blueprints(user_id, status);
CREATE INDEX IF NOT EXISTS idx_blueprints_name_gin ON blueprints USING gin(to_tsvector('english', name));

-- Deployments table indexes
CREATE INDEX IF NOT EXISTS idx_deployments_blueprint_id ON deployments(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);

-- Resources table indexes
CREATE INDEX IF NOT EXISTS idx_resources_blueprint_id ON resources(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_name ON resources(name);

-- Configuration Items (CMDB) indexes
CREATE TABLE IF NOT EXISTS ci_items (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  environment VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  ip_address VARCHAR(45),
  hostname VARCHAR(255),
  os VARCHAR(100),
  location VARCHAR(255),
  department VARCHAR(255),
  owner VARCHAR(255),
  tags JSONB,
  metadata JSONB,
  metrics JSONB,
  last_metrics_update TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  discovered_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ci_items_type ON ci_items(type);
CREATE INDEX IF NOT EXISTS idx_ci_items_environment ON ci_items(environment);
CREATE INDEX IF NOT EXISTS idx_ci_items_status ON ci_items(status);
CREATE INDEX IF NOT EXISTS idx_ci_items_discovered_at ON ci_items(discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_ci_items_type_env ON ci_items(type, environment);
CREATE INDEX IF NOT EXISTS idx_ci_items_name_gin ON ci_items USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_ci_items_hostname_gin ON ci_items USING gin(to_tsvector('english', hostname));
CREATE INDEX IF NOT EXISTS idx_ci_items_tags ON ci_items USING gin(tags);

-- Audit logs indexes
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  entity_name VARCHAR(255),
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  changes JSONB,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Agents table indexes
CREATE TABLE IF NOT EXISTS agents (
  agent_id VARCHAR(255) PRIMARY KEY,
  agent_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  last_sync TIMESTAMP,
  ip_address VARCHAR(45),
  hostname VARCHAR(255),
  os VARCHAR(100),
  metrics JSONB,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_last_sync ON agents(last_sync DESC);
CREATE INDEX IF NOT EXISTS idx_agents_hostname ON agents(hostname);

-- Discovery schedules indexes
CREATE TABLE IF NOT EXISTS discovery_schedules (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  frequency VARCHAR(50) NOT NULL,
  time VARCHAR(10),
  day_of_week INTEGER,
  day_of_month INTEGER,
  agent_ids JSONB,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_discovery_schedules_enabled ON discovery_schedules(enabled);
CREATE INDEX IF NOT EXISTS idx_discovery_schedules_next_run ON discovery_schedules(next_run);

-- Enforcement events indexes
CREATE INDEX IF NOT EXISTS idx_enforcement_events_timestamp ON enforcement_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_enforcement_events_severity ON enforcement_events(severity);
CREATE INDEX IF NOT EXISTS idx_enforcement_events_policy_id ON enforcement_events(policy_id);
CREATE INDEX IF NOT EXISTS idx_enforcement_events_resource_id ON enforcement_events(resource_id);

-- Users indexes (if not already present)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Cost estimates indexes
CREATE TABLE IF NOT EXISTS cost_estimates (
  id SERIAL PRIMARY KEY,
  blueprint_id VARCHAR(255) NOT NULL,
  cloud_provider VARCHAR(50) NOT NULL,
  monthly_cost DECIMAL(10, 2),
  annual_cost DECIMAL(10, 2),
  breakdown JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_estimates_blueprint_id ON cost_estimates(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_cost_estimates_created_at ON cost_estimates(created_at DESC);

-- Enable pg_stat_statements for query monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Create function to find missing indexes
CREATE OR REPLACE FUNCTION find_missing_indexes()
RETURNS TABLE (
  table_name TEXT,
  column_name TEXT,
  seq_scans BIGINT,
  index_scans BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename AS table_name,
    NULL::TEXT AS column_name,
    seq_scan,
    idx_scan
  FROM pg_stat_user_tables
  WHERE seq_scan > 1000 AND idx_scan < seq_scan / 10
  ORDER BY seq_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to analyze slow queries
CREATE OR REPLACE FUNCTION analyze_slow_queries(min_duration_ms INTEGER DEFAULT 100)
RETURNS TABLE (
  query TEXT,
  calls BIGINT,
  total_time_ms NUMERIC,
  mean_time_ms NUMERIC,
  max_time_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    LEFT(pss.query, 200) AS query,
    pss.calls,
    ROUND(pss.total_exec_time::numeric, 2) AS total_time_ms,
    ROUND(pss.mean_exec_time::numeric, 2) AS mean_time_ms,
    ROUND(pss.max_exec_time::numeric, 2) AS max_time_ms
  FROM pg_stat_statements pss
  WHERE pss.mean_exec_time > min_duration_ms
  ORDER BY pss.total_exec_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_ci_items_updated_at BEFORE UPDATE ON ci_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovery_schedules_updated_at BEFORE UPDATE ON discovery_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Analyze tables to update statistics
ANALYZE blueprints;
ANALYZE deployments;
ANALYZE resources;
ANALYZE enforcement_events;
ANALYZE users;
ANALYZE ci_items;
ANALYZE agents;
ANALYZE audit_logs;
ANALYZE discovery_schedules;
ANALYZE cost_estimates;

-- Comment on indexes for documentation
COMMENT ON INDEX idx_blueprints_user_status IS 'Composite index for user-specific blueprint queries filtered by status';
COMMENT ON INDEX idx_ci_items_type_env IS 'Composite index for CMDB queries filtered by type and environment';
COMMENT ON INDEX idx_ci_items_name_gin IS 'Full-text search index for CI item names';
COMMENT ON INDEX idx_audit_logs_timestamp IS 'Index for audit log time-based queries';
