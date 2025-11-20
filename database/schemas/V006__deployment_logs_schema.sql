-- IAC Dharma Deployment Logs Schema
-- Version: V006
-- Description: Deployment execution tracking and logging for Software Engineers

-- Deployment executions table
CREATE TABLE deployment_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    deployment_id UUID NOT NULL,
    approval_id UUID REFERENCES deployment_approvals(id),
    
    environment VARCHAR(50) NOT NULL,
    -- Environment: development, staging, production
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Status: pending, in-progress, completed, failed, rolled-back, cancelled
    
    deployment_type VARCHAR(50) NOT NULL,
    -- DeploymentType: full, incremental, rollback, hotfix
    
    -- Execution details
    started_by UUID NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    estimated_duration INTEGER,
    -- Estimated duration in minutes
    
    actual_duration INTEGER,
    -- Actual duration in minutes
    
    current_step VARCHAR(100),
    progress INTEGER DEFAULT 0,
    -- Progress: 0-100
    
    -- Version information
    source_version VARCHAR(50),
    target_version VARCHAR(50) NOT NULL,
    
    -- Pre-checks
    pre_checks_passed BOOLEAN DEFAULT FALSE,
    pre_check_results JSONB DEFAULT '{}',
    
    -- Post-deployment verification
    post_checks_passed BOOLEAN,
    post_check_results JSONB DEFAULT '{}',
    
    -- Rollback information
    rollback_possible BOOLEAN DEFAULT TRUE,
    rollback_version VARCHAR(50),
    rollback_executed BOOLEAN DEFAULT FALSE,
    rollback_reason TEXT,
    
    -- Metrics
    services_deployed INTEGER DEFAULT 0,
    total_services INTEGER DEFAULT 0,
    health_checks_passed INTEGER DEFAULT 0,
    health_checks_failed INTEGER DEFAULT 0,
    
    error_count INTEGER DEFAULT 0,
    warning_count INTEGER DEFAULT 0,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'rolled-back', 'cancelled')),
    CONSTRAINT valid_type CHECK (deployment_type IN ('full', 'incremental', 'rollback', 'hotfix')),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

-- Indexes for performance
CREATE INDEX idx_executions_tenant ON deployment_executions(tenant_id);
CREATE INDEX idx_executions_deployment ON deployment_executions(deployment_id);
CREATE INDEX idx_executions_approval ON deployment_executions(approval_id) WHERE approval_id IS NOT NULL;
CREATE INDEX idx_executions_environment ON deployment_executions(environment);
CREATE INDEX idx_executions_status ON deployment_executions(status);
CREATE INDEX idx_executions_started_by ON deployment_executions(started_by);
CREATE INDEX idx_executions_started_at ON deployment_executions(started_at DESC);

-- Deployment execution steps
CREATE TABLE deployment_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES deployment_executions(id) ON DELETE CASCADE,
    
    step_name VARCHAR(100) NOT NULL,
    step_order INTEGER NOT NULL,
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Status: pending, in-progress, completed, failed, skipped
    
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    -- Duration in seconds
    
    progress INTEGER DEFAULT 0,
    
    output TEXT,
    error_message TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'skipped')),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_steps_execution ON deployment_steps(execution_id);
CREATE INDEX idx_steps_order ON deployment_steps(execution_id, step_order);
CREATE INDEX idx_steps_status ON deployment_steps(status);

-- Deployment logs
CREATE TABLE deployment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID NOT NULL REFERENCES deployment_executions(id) ON DELETE CASCADE,
    step_id UUID REFERENCES deployment_steps(id) ON DELETE CASCADE,
    
    log_level VARCHAR(20) NOT NULL,
    -- LogLevel: debug, info, warn, error, fatal
    
    service VARCHAR(100),
    -- Service: orchestrator, infrastructure, application, health-check, etc.
    
    message TEXT NOT NULL,
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Structured logging
    context JSONB DEFAULT '{}',
    error_details JSONB,
    stack_trace TEXT,
    
    -- Log metadata
    host VARCHAR(255),
    pid INTEGER,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_level CHECK (log_level IN ('debug', 'info', 'warn', 'error', 'fatal'))
);

-- Indexes for log querying
CREATE INDEX idx_logs_execution ON deployment_logs(execution_id);
CREATE INDEX idx_logs_step ON deployment_logs(step_id) WHERE step_id IS NOT NULL;
CREATE INDEX idx_logs_level ON deployment_logs(log_level);
CREATE INDEX idx_logs_service ON deployment_logs(service) WHERE service IS NOT NULL;
CREATE INDEX idx_logs_timestamp ON deployment_logs(timestamp DESC);
CREATE INDEX idx_logs_execution_timestamp ON deployment_logs(execution_id, timestamp DESC);

-- Partition deployment_logs by month for performance
-- Note: Uncomment and adjust based on retention policy
-- CREATE TABLE deployment_logs_y2025m11 PARTITION OF deployment_logs
--     FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

-- Service health checks
CREATE TABLE service_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    service_name VARCHAR(100) NOT NULL,
    environment VARCHAR(50) NOT NULL,
    
    status VARCHAR(20) NOT NULL,
    -- Status: healthy, degraded, unhealthy, unknown
    
    check_type VARCHAR(50) NOT NULL,
    -- CheckType: liveness, readiness, startup, custom
    
    -- Health metrics
    response_time INTEGER,
    -- Response time in milliseconds
    
    error_rate DECIMAL(5, 2),
    -- Error rate percentage
    
    requests_per_second INTEGER,
    cpu_usage DECIMAL(5, 2),
    memory_usage DECIMAL(5, 2),
    disk_usage DECIMAL(5, 2),
    
    -- Service information
    version VARCHAR(50),
    uptime DECIMAL(5, 2),
    -- Uptime percentage
    
    last_deployment TIMESTAMP WITH TIME ZONE,
    
    -- Check details
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    check_duration INTEGER,
    -- Check duration in milliseconds
    
    issues JSONB DEFAULT '[]',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('healthy', 'degraded', 'unhealthy', 'unknown')),
    CONSTRAINT valid_check_type CHECK (check_type IN ('liveness', 'readiness', 'startup', 'custom'))
);

CREATE INDEX idx_health_tenant ON service_health_checks(tenant_id);
CREATE INDEX idx_health_service ON service_health_checks(service_name);
CREATE INDEX idx_health_environment ON service_health_checks(environment);
CREATE INDEX idx_health_status ON service_health_checks(status);
CREATE INDEX idx_health_checked_at ON service_health_checks(checked_at DESC);
CREATE INDEX idx_health_service_env ON service_health_checks(service_name, environment, checked_at DESC);

-- Infrastructure metrics
CREATE TABLE infrastructure_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    environment VARCHAR(50) NOT NULL,
    metric_category VARCHAR(50) NOT NULL,
    -- Category: compute, storage, network, database
    
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(12, 2) NOT NULL,
    metric_unit VARCHAR(20),
    
    resource_id VARCHAR(255),
    resource_type VARCHAR(50),
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_infra_tenant ON infrastructure_metrics(tenant_id);
CREATE INDEX idx_infra_environment ON infrastructure_metrics(environment);
CREATE INDEX idx_infra_category ON infrastructure_metrics(metric_category);
CREATE INDEX idx_infra_timestamp ON infrastructure_metrics(timestamp DESC);
CREATE INDEX idx_infra_resource ON infrastructure_metrics(resource_id) WHERE resource_id IS NOT NULL;

-- Health alerts
CREATE TABLE health_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    severity VARCHAR(20) NOT NULL,
    -- Severity: info, warning, critical
    
    service VARCHAR(100),
    metric VARCHAR(100) NOT NULL,
    
    message TEXT NOT NULL,
    
    threshold DECIMAL(12, 2),
    current_value DECIMAL(12, 2),
    
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'critical'))
);

CREATE INDEX idx_health_alerts_tenant ON health_alerts(tenant_id);
CREATE INDEX idx_health_alerts_service ON health_alerts(service) WHERE service IS NOT NULL;
CREATE INDEX idx_health_alerts_severity ON health_alerts(severity);
CREATE INDEX idx_health_alerts_unresolved ON health_alerts(resolved) WHERE resolved = FALSE;
CREATE INDEX idx_health_alerts_triggered_at ON health_alerts(triggered_at DESC);

-- Update timestamp triggers
CREATE TRIGGER update_deployment_executions_updated_at BEFORE UPDATE ON deployment_executions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployment_steps_updated_at BEFORE UPDATE ON deployment_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_alerts_updated_at BEFORE UPDATE ON health_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE deployment_executions IS 'Tracks deployment execution lifecycle and status';
COMMENT ON TABLE deployment_steps IS 'Individual steps within a deployment execution';
COMMENT ON TABLE deployment_logs IS 'Structured logs from deployment processes';
COMMENT ON TABLE service_health_checks IS 'Health check results for deployed services';
COMMENT ON TABLE infrastructure_metrics IS 'Infrastructure resource metrics and utilization';
COMMENT ON TABLE health_alerts IS 'Automated alerts for health and performance issues';
