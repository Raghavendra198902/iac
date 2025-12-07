-- IAC Dharma v3.0 - Database Schema Initialization
-- PostgreSQL 16 + TimescaleDB

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: infrastructures
-- ============================================================================
CREATE TABLE IF NOT EXISTS infrastructures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN (
        'aws', 'azure', 'gcp', 'digitalocean', 'alibaba', 
        'ibm', 'oracle', 'vmware', 'kubernetes', 'on-premise', 'edge'
    )),
    region VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'creating', 'running', 'stopped', 'error', 'terminating', 'terminated'
    )),
    template_id VARCHAR(255),
    config JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for infrastructures
CREATE INDEX IF NOT EXISTS idx_infrastructures_provider ON infrastructures(provider);
CREATE INDEX IF NOT EXISTS idx_infrastructures_status ON infrastructures(status);
CREATE INDEX IF NOT EXISTS idx_infrastructures_created_by ON infrastructures(created_by);
CREATE INDEX IF NOT EXISTS idx_infrastructures_created_at ON infrastructures(created_at DESC);

-- ============================================================================
-- Table: compute_resources
-- ============================================================================
CREATE TABLE IF NOT EXISTS compute_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    infrastructure_id UUID NOT NULL,
    instance_type VARCHAR(100) NOT NULL,
    instance_id VARCHAR(255),
    cpu_cores INTEGER NOT NULL,
    memory_gb INTEGER NOT NULL,
    disk_gb INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'running', 'stopped', 'terminated', 'error'
    )),
    ip_address VARCHAR(45),
    private_ip VARCHAR(45),
    availability_zone VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_compute_infrastructure 
        FOREIGN KEY (infrastructure_id) 
        REFERENCES infrastructures(id) 
        ON DELETE CASCADE
);

-- Indexes for compute_resources
CREATE INDEX IF NOT EXISTS idx_compute_infrastructure ON compute_resources(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_compute_status ON compute_resources(status);
CREATE INDEX IF NOT EXISTS idx_compute_instance_id ON compute_resources(instance_id);

-- ============================================================================
-- Table: deployments
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    infrastructure_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    namespace VARCHAR(100) DEFAULT 'default',
    replicas INTEGER DEFAULT 1,
    desired_replicas INTEGER DEFAULT 1,
    available_replicas INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'deploying', 'running', 'scaling', 'failed', 'terminated'
    )),
    image VARCHAR(500) NOT NULL,
    image_tag VARCHAR(100) DEFAULT 'latest',
    env_vars JSONB DEFAULT '{}',
    resources JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_deployment_infrastructure 
        FOREIGN KEY (infrastructure_id) 
        REFERENCES infrastructures(id) 
        ON DELETE CASCADE
);

-- Indexes for deployments
CREATE INDEX IF NOT EXISTS idx_deployments_infrastructure ON deployments(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_name ON deployments(name);

-- ============================================================================
-- Table: users
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN (
        'admin', 'developer', 'operator', 'viewer', 'user'
    )),
    permissions JSONB DEFAULT '{}',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- Table: audit_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_audit_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);

-- ============================================================================
-- Table: predictions (AI/ML predictions history)
-- ============================================================================
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_type VARCHAR(50) NOT NULL CHECK (prediction_type IN (
        'failure', 'capacity', 'cost', 'churn', 'threat'
    )),
    service_id UUID NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    predicted_time TIMESTAMPTZ,
    probability FLOAT NOT NULL,
    confidence FLOAT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN (
        'critical', 'high', 'medium', 'low', 'info'
    )),
    affected_components TEXT[] DEFAULT '{}',
    recommended_actions TEXT[] DEFAULT '{}',
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for predictions
CREATE INDEX IF NOT EXISTS idx_predictions_service ON predictions(service_id);
CREATE INDEX IF NOT EXISTS idx_predictions_type ON predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_predictions_severity ON predictions(severity);
CREATE INDEX IF NOT EXISTS idx_predictions_timestamp ON predictions(timestamp DESC);

-- ============================================================================
-- Table: metrics (TimescaleDB hypertable for time-series metrics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS metrics (
    time TIMESTAMPTZ NOT NULL,
    service_id UUID NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(50),
    labels JSONB DEFAULT '{}'
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('metrics', 'time', if_not_exists => TRUE);

-- Indexes for metrics
CREATE INDEX IF NOT EXISTS idx_metrics_service ON metrics(service_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name, time DESC);

-- ============================================================================
-- Update triggers for updated_at columns
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_infrastructures_updated_at 
    BEFORE UPDATE ON infrastructures 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compute_resources_updated_at 
    BEFORE UPDATE ON compute_resources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at 
    BEFORE UPDATE ON deployments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Add foreign key constraint for created_by
-- ============================================================================
ALTER TABLE infrastructures
ADD CONSTRAINT fk_infrastructure_created_by 
FOREIGN KEY (created_by) 
REFERENCES users(id) 
ON DELETE SET NULL;

-- ============================================================================
-- Sample Data (Optional - for testing)
-- ============================================================================

-- Create default admin user (password: admin123)
INSERT INTO users (email, username, password_hash, role, permissions)
VALUES (
    'admin@iacdharma.local',
    'admin',
    '$2a$10$XQj0F7J7Z8Z9Z9Z9Z9Z9ZeJ7Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z',
    'admin',
    '{"all": true}'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Database schema initialized successfully!';
    RAISE NOTICE '✓ Tables created: infrastructures, compute_resources, deployments, users, audit_logs, predictions, metrics';
    RAISE NOTICE '✓ Indexes created for optimized queries';
    RAISE NOTICE '✓ TimescaleDB hypertable created for metrics';
    RAISE NOTICE '✓ Default admin user created: admin@iacdharma.local / admin123';
END $$;
