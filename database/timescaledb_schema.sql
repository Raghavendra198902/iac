-- TimescaleDB Schema for IAC Dharma v3.0 AIOps Engine
-- Time-series database for storing metrics, predictions, and events

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- ============================================================================
-- Metrics Tables
-- ============================================================================

-- Infrastructure metrics (CPU, memory, disk, network)
CREATE TABLE IF NOT EXISTS infrastructure_metrics (
    time TIMESTAMPTZ NOT NULL,
    service_name TEXT NOT NULL,
    infrastructure_id TEXT,
    provider TEXT,
    region TEXT,
    
    -- Compute metrics
    cpu_usage DOUBLE PRECISION,
    memory_usage DOUBLE PRECISION,
    disk_io DOUBLE PRECISION,
    network_traffic DOUBLE PRECISION,
    
    -- Application metrics
    request_rate DOUBLE PRECISION,
    response_time DOUBLE PRECISION,
    error_rate DOUBLE PRECISION,
    
    -- Resource counts
    pod_count INTEGER,
    container_count INTEGER,
    replica_count INTEGER,
    
    -- Metadata
    labels JSONB,
    tags TEXT[],
    
    PRIMARY KEY (time, service_name)
);

-- Convert to hypertable (time-series optimized)
SELECT create_hypertable('infrastructure_metrics', 'time', if_not_exists => TRUE);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_infra_metrics_service ON infrastructure_metrics (service_name, time DESC);
CREATE INDEX IF NOT EXISTS idx_infra_metrics_provider ON infrastructure_metrics (provider, time DESC);
CREATE INDEX IF NOT EXISTS idx_infra_metrics_labels ON infrastructure_metrics USING GIN (labels);

-- Continuous aggregates for faster queries
CREATE MATERIALIZED VIEW IF NOT EXISTS infrastructure_metrics_hourly
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 hour', time) AS bucket,
    service_name,
    AVG(cpu_usage) as avg_cpu,
    MAX(cpu_usage) as max_cpu,
    AVG(memory_usage) as avg_memory,
    MAX(memory_usage) as max_memory,
    AVG(request_rate) as avg_request_rate,
    AVG(response_time) as avg_response_time,
    AVG(error_rate) as avg_error_rate
FROM infrastructure_metrics
GROUP BY bucket, service_name;

-- ============================================================================
-- Security Metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_metrics (
    time TIMESTAMPTZ NOT NULL,
    service_name TEXT NOT NULL,
    
    -- Authentication metrics
    failed_auth_count INTEGER DEFAULT 0,
    successful_auth_count INTEGER DEFAULT 0,
    unique_ips INTEGER DEFAULT 0,
    suspicious_ips TEXT[],
    
    -- Attack indicators
    sql_injection_score DOUBLE PRECISION DEFAULT 0,
    xss_score DOUBLE PRECISION DEFAULT 0,
    port_scan_score DOUBLE PRECISION DEFAULT 0,
    privilege_escalation_score DOUBLE PRECISION DEFAULT 0,
    
    -- Traffic patterns
    request_rate DOUBLE PRECISION,
    avg_payload_size DOUBLE PRECISION,
    data_transfer_rate DOUBLE PRECISION,
    
    -- Behavioral metrics
    geographic_entropy DOUBLE PRECISION,
    time_anomaly_score DOUBLE PRECISION,
    file_access_rate DOUBLE PRECISION,
    
    -- Metadata
    source_ips TEXT[],
    user_agents TEXT[],
    labels JSONB,
    
    PRIMARY KEY (time, service_name)
);

SELECT create_hypertable('security_metrics', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_security_metrics_service ON security_metrics (service_name, time DESC);

-- ============================================================================
-- Predictions
-- ============================================================================

CREATE TABLE IF NOT EXISTS failure_predictions (
    time TIMESTAMPTZ NOT NULL,
    prediction_id UUID DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    
    -- Prediction details
    failure_probability DOUBLE PRECISION NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    severity TEXT NOT NULL,
    predicted_failure_time TIMESTAMPTZ NOT NULL,
    time_to_failure_hours INTEGER,
    
    -- Root causes
    root_causes TEXT[],
    affected_components JSONB,
    
    -- Recommendations
    recommended_actions TEXT[],
    
    -- Model info
    model_type TEXT,
    model_version TEXT,
    
    PRIMARY KEY (time, prediction_id)
);

SELECT create_hypertable('failure_predictions', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_failure_pred_service ON failure_predictions (service_name, time DESC);
CREATE INDEX IF NOT EXISTS idx_failure_pred_severity ON failure_predictions (severity, time DESC);


CREATE TABLE IF NOT EXISTS threat_detections (
    time TIMESTAMPTZ NOT NULL,
    detection_id UUID DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    
    -- Threat details
    threat_detected BOOLEAN NOT NULL,
    threat_type TEXT NOT NULL,
    confidence DOUBLE PRECISION NOT NULL,
    severity TEXT NOT NULL,
    
    -- Indicators
    indicators TEXT[],
    probability_scores JSONB,
    
    -- Actions
    recommended_actions TEXT[],
    requires_immediate_action BOOLEAN DEFAULT FALSE,
    
    -- Model info
    model_type TEXT,
    model_version TEXT,
    
    PRIMARY KEY (time, detection_id)
);

SELECT create_hypertable('threat_detections', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_threat_det_service ON threat_detections (service_name, time DESC);
CREATE INDEX IF NOT EXISTS idx_threat_det_type ON threat_detections (threat_type, time DESC);
CREATE INDEX IF NOT EXISTS idx_threat_det_severity ON threat_detections (severity, time DESC);


CREATE TABLE IF NOT EXISTS capacity_forecasts (
    time TIMESTAMPTZ NOT NULL,
    forecast_id UUID DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    
    -- Forecast details
    forecast_period_days INTEGER NOT NULL,
    max_predicted_usage DOUBLE PRECISION NOT NULL,
    avg_predicted_usage DOUBLE PRECISION NOT NULL,
    
    -- Analysis
    capacity_exceeded BOOLEAN DEFAULT FALSE,
    critical_level_reached BOOLEAN DEFAULT FALSE,
    days_to_capacity_threshold INTEGER,
    growth_rate_percent DOUBLE PRECISION,
    
    -- Forecasts (array of daily predictions)
    forecasts JSONB NOT NULL,
    
    -- Recommendations
    scaling_recommendations JSONB,
    requires_scaling BOOLEAN DEFAULT FALSE,
    
    -- Model info
    model_type TEXT,
    model_version TEXT,
    
    PRIMARY KEY (time, forecast_id)
);

SELECT create_hypertable('capacity_forecasts', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_capacity_forecast_service ON capacity_forecasts (service_name, time DESC);

-- ============================================================================
-- Anomalies
-- ============================================================================

CREATE TABLE IF NOT EXISTS anomalies (
    time TIMESTAMPTZ NOT NULL,
    anomaly_id UUID DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    
    -- Anomaly details
    is_anomaly BOOLEAN NOT NULL,
    anomaly_score DOUBLE PRECISION NOT NULL,
    severity TEXT NOT NULL,
    
    -- Metrics at time of anomaly
    metrics JSONB NOT NULL,
    
    -- Analysis
    anomalous_metrics TEXT[],
    baseline_values JSONB,
    deviations JSONB,
    
    -- Actions
    recommended_actions TEXT[],
    auto_remediation_available BOOLEAN DEFAULT FALSE,
    
    PRIMARY KEY (time, anomaly_id)
);

SELECT create_hypertable('anomalies', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_anomalies_service ON anomalies (service_name, time DESC);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies (severity, time DESC);

-- ============================================================================
-- Remediation Actions
-- ============================================================================

CREATE TABLE IF NOT EXISTS remediation_actions (
    time TIMESTAMPTZ NOT NULL,
    action_id UUID DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    
    -- Action details
    action_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    severity TEXT NOT NULL,
    
    -- Execution
    status TEXT NOT NULL DEFAULT 'pending', -- pending, executing, completed, failed
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Results
    success BOOLEAN,
    error_message TEXT,
    rollback_available BOOLEAN DEFAULT TRUE,
    rollback_executed BOOLEAN DEFAULT FALSE,
    
    -- Details
    parameters JSONB,
    affected_resources TEXT[],
    
    -- Metadata
    triggered_by TEXT,
    approval_required BOOLEAN DEFAULT FALSE,
    approved_by TEXT,
    
    PRIMARY KEY (time, action_id)
);

SELECT create_hypertable('remediation_actions', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_remediation_service ON remediation_actions (service_name, time DESC);
CREATE INDEX IF NOT EXISTS idx_remediation_status ON remediation_actions (status, time DESC);

-- ============================================================================
-- Model Training Metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS model_training_runs (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    run_id UUID DEFAULT gen_random_uuid(),
    model_type TEXT NOT NULL,
    model_name TEXT NOT NULL,
    
    -- Training details
    status TEXT NOT NULL DEFAULT 'running', -- running, completed, failed
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Hyperparameters
    hyperparameters JSONB,
    
    -- Metrics
    train_metrics JSONB,
    validation_metrics JSONB,
    test_metrics JSONB,
    
    -- Model info
    model_version TEXT,
    framework TEXT,
    mlflow_run_id TEXT,
    registered BOOLEAN DEFAULT FALSE,
    
    PRIMARY KEY (time, run_id)
);

SELECT create_hypertable('model_training_runs', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_training_runs_model ON model_training_runs (model_type, time DESC);

-- ============================================================================
-- Data Retention Policies
-- ============================================================================

-- Drop raw metrics older than 90 days
SELECT add_retention_policy('infrastructure_metrics', INTERVAL '90 days', if_not_exists => TRUE);
SELECT add_retention_policy('security_metrics', INTERVAL '90 days', if_not_exists => TRUE);

-- Keep aggregated hourly data for 1 year
SELECT add_retention_policy('infrastructure_metrics_hourly', INTERVAL '1 year', if_not_exists => TRUE);

-- Keep predictions for 180 days
SELECT add_retention_policy('failure_predictions', INTERVAL '180 days', if_not_exists => TRUE);
SELECT add_retention_policy('threat_detections', INTERVAL '180 days', if_not_exists => TRUE);
SELECT add_retention_policy('capacity_forecasts', INTERVAL '180 days', if_not_exists => TRUE);

-- Keep anomalies for 1 year
SELECT add_retention_policy('anomalies', INTERVAL '1 year', if_not_exists => TRUE);

-- Keep remediation actions for 2 years (compliance)
SELECT add_retention_policy('remediation_actions', INTERVAL '2 years', if_not_exists => TRUE);

-- Keep training runs for 1 year
SELECT add_retention_policy('model_training_runs', INTERVAL '1 year', if_not_exists => TRUE);

-- ============================================================================
-- Continuous Aggregates for Analytics
-- ============================================================================

-- Daily summary for capacity planning
CREATE MATERIALIZED VIEW IF NOT EXISTS capacity_daily_summary
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', time) AS day,
    service_name,
    AVG(cpu_usage) as avg_cpu,
    MAX(cpu_usage) as max_cpu,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY cpu_usage) as p95_cpu,
    AVG(memory_usage) as avg_memory,
    MAX(memory_usage) as max_memory,
    PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY memory_usage) as p95_memory
FROM infrastructure_metrics
GROUP BY day, service_name;

-- Threat detection summary
CREATE MATERIALIZED VIEW IF NOT EXISTS threat_daily_summary
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', time) AS day,
    service_name,
    COUNT(*) as total_detections,
    COUNT(*) FILTER (WHERE threat_detected = TRUE) as threats_detected,
    COUNT(*) FILTER (WHERE severity = 'critical') as critical_threats,
    COUNT(*) FILTER (WHERE severity = 'high') as high_threats
FROM threat_detections
GROUP BY day, service_name;

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get recent metrics for a service
CREATE OR REPLACE FUNCTION get_recent_metrics(
    p_service_name TEXT,
    p_hours INTEGER DEFAULT 24
)
RETURNS TABLE (
    time TIMESTAMPTZ,
    cpu_usage DOUBLE PRECISION,
    memory_usage DOUBLE PRECISION,
    request_rate DOUBLE PRECISION,
    error_rate DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.time,
        m.cpu_usage,
        m.memory_usage,
        m.request_rate,
        m.error_rate
    FROM infrastructure_metrics m
    WHERE m.service_name = p_service_name
      AND m.time > NOW() - INTERVAL '1 hour' * p_hours
    ORDER BY m.time DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get prediction accuracy
CREATE OR REPLACE FUNCTION get_prediction_accuracy(
    p_service_name TEXT,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_predictions BIGINT,
    failures_occurred BIGINT,
    accuracy_percent DOUBLE PRECISION
) AS $$
BEGIN
    -- This is a placeholder - actual implementation would compare predictions
    -- with actual failures that occurred
    RETURN QUERY
    SELECT 
        COUNT(*) as total_predictions,
        COUNT(*) FILTER (WHERE failure_probability > 0.7) as failures_occurred,
        ROUND(
            (COUNT(*) FILTER (WHERE failure_probability > 0.7)::DOUBLE PRECISION / 
             NULLIF(COUNT(*), 0) * 100),
            2
        ) as accuracy_percent
    FROM failure_predictions
    WHERE service_name = p_service_name
      AND time > NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Sample Data (for testing)
-- ============================================================================

-- Insert sample infrastructure metrics
INSERT INTO infrastructure_metrics (
    time, service_name, infrastructure_id, provider, region,
    cpu_usage, memory_usage, disk_io, network_traffic,
    request_rate, response_time, error_rate
) VALUES
    (NOW() - INTERVAL '1 hour', 'api-gateway', 'infra-001', 'aws', 'us-east-1', 65.5, 72.3, 250.0, 45.2, 1500.0, 85.0, 0.5),
    (NOW() - INTERVAL '2 hours', 'api-gateway', 'infra-001', 'aws', 'us-east-1', 68.2, 74.1, 275.0, 48.5, 1650.0, 92.0, 0.8),
    (NOW() - INTERVAL '3 hours', 'api-gateway', 'infra-001', 'aws', 'us-east-1', 72.1, 76.8, 290.0, 52.3, 1800.0, 110.0, 1.2);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO aiops_user;
GRANT USAGE ON SCHEMA public TO aiops_user;

-- Refresh continuous aggregates
CALL refresh_continuous_aggregate('infrastructure_metrics_hourly', NULL, NULL);
CALL refresh_continuous_aggregate('capacity_daily_summary', NULL, NULL);
CALL refresh_continuous_aggregate('threat_daily_summary', NULL, NULL);

-- Display table info
SELECT 
    hypertable_name,
    num_dimensions,
    num_chunks,
    approximate_row_count
FROM timescaledb_information.hypertables
ORDER BY hypertable_name;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE 'TimescaleDB schema for IAC Dharma v3.0 created successfully!';
    RAISE NOTICE 'Tables: infrastructure_metrics, security_metrics, failure_predictions, threat_detections, capacity_forecasts, anomalies, remediation_actions, model_training_runs';
    RAISE NOTICE 'Continuous aggregates: infrastructure_metrics_hourly, capacity_daily_summary, threat_daily_summary';
END $$;
