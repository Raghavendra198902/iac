-- Migration: Link CMDB assets to workflow projects
-- This allows tracking which infrastructure components belong to which projects

-- Create project_assets junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS project_assets (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL REFERENCES workflow_projects(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL, -- 'server', 'network', 'storage', 'application', 'database'
    asset_id VARCHAR(255) NOT NULL, -- Reference to CMDB asset
    asset_name VARCHAR(255) NOT NULL,
    asset_description TEXT,
    environment VARCHAR(50), -- 'development', 'staging', 'production'
    linked_step_id VARCHAR(50), -- Which workflow step this asset is linked to
    linked_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    linked_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'decommissioned', 'maintenance'
    metadata JSONB, -- Additional asset information
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_asset_type ON project_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_project_assets_asset_id ON project_assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_step_id ON project_assets(linked_step_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_status ON project_assets(status);

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_project_assets_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_assets_timestamp
BEFORE UPDATE ON project_assets
FOR EACH ROW
EXECUTE FUNCTION update_project_assets_timestamp();

-- Create view for asset summary per project
CREATE OR REPLACE VIEW project_asset_summary AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    COUNT(pa.id) as total_assets,
    COUNT(CASE WHEN pa.asset_type = 'server' THEN 1 END) as server_count,
    COUNT(CASE WHEN pa.asset_type = 'network' THEN 1 END) as network_count,
    COUNT(CASE WHEN pa.asset_type = 'storage' THEN 1 END) as storage_count,
    COUNT(CASE WHEN pa.asset_type = 'application' THEN 1 END) as application_count,
    COUNT(CASE WHEN pa.asset_type = 'database' THEN 1 END) as database_count,
    COUNT(CASE WHEN pa.status = 'active' THEN 1 END) as active_assets,
    COUNT(CASE WHEN pa.environment = 'production' THEN 1 END) as production_assets
FROM workflow_projects p
LEFT JOIN project_assets pa ON p.id = pa.project_id
GROUP BY p.id, p.name;

-- Insert sample data for demonstration
INSERT INTO project_assets (project_id, asset_type, asset_id, asset_name, asset_description, environment, linked_step_id, linked_by, status)
VALUES 
    -- Assets for PRJ-001 (Customer Portal Modernization)
    ('PRJ-001', 'server', 'SRV-WEB-001', 'Web Server - Production', 'Primary web application server', 'production', 'cmdb-config', 'Infrastructure Team', 'active'),
    ('PRJ-001', 'server', 'SRV-WEB-002', 'Web Server - Staging', 'Staging web application server', 'staging', 'cmdb-config', 'Infrastructure Team', 'active'),
    ('PRJ-001', 'database', 'DB-POSTGRES-001', 'Customer Database', 'PostgreSQL database for customer data', 'production', 'cmdb-config', 'Database Team', 'active'),
    ('PRJ-001', 'storage', 'S3-BUCKET-PORTAL', 'Portal Assets Bucket', 'S3 bucket for static assets', 'production', 'cmdb-config', 'Cloud Team', 'active'),
    ('PRJ-001', 'network', 'LB-PORTAL-001', 'Portal Load Balancer', 'Application load balancer', 'production', 'cmdb-config', 'Network Team', 'active'),
    ('PRJ-001', 'application', 'APP-PORTAL-WEB', 'Portal Web Application', 'React web application', 'production', 'se-implementation', 'Development Team', 'active'),
    
    -- Assets for PRJ-002 (Multi-Cloud Migration)
    ('PRJ-002', 'server', 'SRV-MIGRATE-001', 'Migration Orchestrator', 'Migration coordination server', 'production', 'cmdb-config', 'Migration Team', 'active'),
    ('PRJ-002', 'storage', 'S3-MIGRATION-DATA', 'Migration Data Store', 'Temporary migration data storage', 'production', 'cmdb-config', 'Cloud Team', 'active'),
    ('PRJ-002', 'network', 'VPN-AZURE-AWS', 'Cross-Cloud VPN', 'VPN tunnel between Azure and AWS', 'production', 'cmdb-config', 'Network Team', 'active'),
    ('PRJ-002', 'database', 'DB-SYNC-REPLICA', 'Database Replication', 'Real-time database sync', 'production', 'cmdb-config', 'Database Team', 'active'),
    
    -- Assets for PRJ-003 (AI/ML Platform Development)
    ('PRJ-003', 'server', 'SRV-ML-GPU-001', 'ML Training Server', 'GPU-enabled training server', 'development', 'se-implementation', 'ML Team', 'active'),
    ('PRJ-003', 'server', 'SRV-ML-GPU-002', 'ML Training Server 2', 'Secondary GPU server', 'development', 'se-implementation', 'ML Team', 'active'),
    ('PRJ-003', 'storage', 'S3-ML-MODELS', 'Model Storage', 'ML model artifact storage', 'production', 'cmdb-config', 'ML Team', 'active'),
    ('PRJ-003', 'storage', 'S3-ML-DATASETS', 'Training Dataset Storage', 'Large dataset storage', 'production', 'cmdb-config', 'ML Team', 'active'),
    ('PRJ-003', 'application', 'APP-ML-API', 'ML Inference API', 'REST API for model inference', 'production', 'se-implementation', 'ML Team', 'active'),
    ('PRJ-003', 'database', 'DB-ML-METADATA', 'ML Metadata Store', 'Model metadata and experiments', 'production', 'cmdb-config', 'ML Team', 'active');

-- Create view for step-specific assets
CREATE OR REPLACE VIEW workflow_step_assets AS
SELECT 
    ws.project_id,
    ws.step_id,
    ws.title as step_title,
    ws.status as step_status,
    pa.asset_type,
    pa.asset_name,
    pa.asset_description,
    pa.environment,
    pa.status as asset_status,
    pa.linked_date
FROM project_workflow_steps ws
LEFT JOIN project_assets pa ON ws.project_id = pa.project_id AND ws.step_id = pa.linked_step_id
ORDER BY ws.project_id, ws.step_number, pa.asset_type;

COMMENT ON TABLE project_assets IS 'Links CMDB infrastructure assets to workflow projects';
COMMENT ON VIEW project_asset_summary IS 'Aggregated asset counts per project';
COMMENT ON VIEW workflow_step_assets IS 'Assets linked to specific workflow steps';
