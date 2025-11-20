-- IAC Dharma Incidents Schema
-- Version: V005
-- Description: Incident management and response tracking for Software Engineers

-- Incidents table
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    severity VARCHAR(20) NOT NULL,
    -- Severity: low, medium, high, critical
    
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    -- Status: open, acknowledged, investigating, resolving, resolved, closed
    
    priority VARCHAR(10) NOT NULL,
    -- Priority: p1 (critical), p2 (high), p3 (medium), p4 (low)
    
    affected_services JSONB DEFAULT '[]',
    
    -- Detection and reporting
    detected_by VARCHAR(50) NOT NULL,
    -- DetectedBy: automated, manual, user-report, monitoring
    
    reported_by UUID NOT NULL REFERENCES users(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Assignment and response
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    response_time INTEGER,
    -- Response time in minutes
    
    -- Resolution
    resolution TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Impact metrics
    affected_users INTEGER,
    affected_requests INTEGER,
    error_rate DECIMAL(5, 2),
    
    -- Related incidents
    related_incident_ids JSONB DEFAULT '[]',
    root_cause_id UUID REFERENCES incidents(id),
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_status CHECK (status IN ('open', 'acknowledged', 'investigating', 'resolving', 'resolved', 'closed')),
    CONSTRAINT valid_priority CHECK (priority IN ('p1', 'p2', 'p3', 'p4'))
);

-- Indexes for performance
CREATE INDEX idx_incidents_tenant ON incidents(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_incidents_priority ON incidents(priority);
CREATE INDEX idx_incidents_reported_by ON incidents(reported_by);
CREATE INDEX idx_incidents_assigned_to ON incidents(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_incidents_reported_at ON incidents(reported_at DESC);
CREATE INDEX idx_incidents_affected_services ON incidents USING GIN (affected_services);

-- Incident timeline events
CREATE TABLE incident_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    
    event_type VARCHAR(50) NOT NULL,
    -- EventType: created, acknowledged, assigned, updated, resolved, closed, comment
    
    user_id UUID NOT NULL REFERENCES users(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    details TEXT,
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_timeline_incident ON incident_timeline(incident_id);
CREATE INDEX idx_timeline_timestamp ON incident_timeline(timestamp DESC);

-- Incident updates and comments
CREATE TABLE incident_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    
    update_type VARCHAR(50) NOT NULL,
    -- UpdateType: status_change, comment, metric_update, assignment
    
    user_id UUID NOT NULL REFERENCES users(id),
    
    previous_value TEXT,
    new_value TEXT,
    comment TEXT,
    
    visibility VARCHAR(20) DEFAULT 'internal',
    -- Visibility: internal, external, public
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_visibility CHECK (visibility IN ('internal', 'external', 'public'))
);

CREATE INDEX idx_updates_incident ON incident_updates(incident_id);
CREATE INDEX idx_updates_created_at ON incident_updates(created_at DESC);

-- Post-incident reviews
CREATE TABLE incident_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    
    conducted_by UUID NOT NULL REFERENCES users(id),
    conducted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    root_cause TEXT NOT NULL,
    contributing_factors TEXT,
    
    timeline_accuracy VARCHAR(20),
    -- TimelineAccuracy: accurate, partially-accurate, inaccurate
    
    lessons_learned TEXT,
    action_items JSONB DEFAULT '[]',
    
    prevention_measures TEXT,
    monitoring_improvements TEXT,
    
    status VARCHAR(20) DEFAULT 'draft',
    -- Status: draft, published, archived
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

CREATE INDEX idx_reviews_incident ON incident_reviews(incident_id);
CREATE INDEX idx_reviews_status ON incident_reviews(status);

-- KPI metrics tracking
CREATE TABLE kpi_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    project_id UUID,
    
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL,
    -- Category: deployment, budget, migration, quality, team, infrastructure
    
    metric_value DECIMAL(12, 2) NOT NULL,
    metric_unit VARCHAR(20),
    
    time_period VARCHAR(20) NOT NULL,
    -- TimePeriod: hourly, daily, weekly, monthly, quarterly, yearly
    
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_kpi_tenant ON kpi_metrics(tenant_id);
CREATE INDEX idx_kpi_project ON kpi_metrics(project_id) WHERE project_id IS NOT NULL;
CREATE INDEX idx_kpi_category ON kpi_metrics(metric_category);
CREATE INDEX idx_kpi_name ON kpi_metrics(metric_name);
CREATE INDEX idx_kpi_period ON kpi_metrics(period_start, period_end);

-- KPI targets and thresholds
CREATE TABLE kpi_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    project_id UUID,
    
    metric_name VARCHAR(100) NOT NULL,
    metric_category VARCHAR(50) NOT NULL,
    
    target_value DECIMAL(12, 2) NOT NULL,
    threshold_warning DECIMAL(12, 2),
    threshold_critical DECIMAL(12, 2),
    
    comparison_operator VARCHAR(10) NOT NULL,
    -- ComparisonOperator: gt (greater than), lt (less than), eq (equal), gte, lte
    
    fiscal_year INTEGER,
    effective_from DATE NOT NULL,
    effective_until DATE,
    
    status VARCHAR(20) DEFAULT 'active',
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_operator CHECK (comparison_operator IN ('gt', 'lt', 'eq', 'gte', 'lte')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'inactive', 'archived'))
);

CREATE INDEX idx_kpi_targets_tenant ON kpi_targets(tenant_id);
CREATE INDEX idx_kpi_targets_metric ON kpi_targets(metric_name);
CREATE INDEX idx_kpi_targets_status ON kpi_targets(status);

-- Update timestamp triggers
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_reviews_updated_at BEFORE UPDATE ON incident_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_targets_updated_at BEFORE UPDATE ON kpi_targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE incidents IS 'Tracks production incidents and their lifecycle';
COMMENT ON TABLE incident_timeline IS 'Timeline of all events during an incident';
COMMENT ON TABLE incident_updates IS 'Updates, comments, and changes to incidents';
COMMENT ON TABLE incident_reviews IS 'Post-incident review documentation';
COMMENT ON TABLE kpi_metrics IS 'Time-series KPI metrics for projects and tenants';
COMMENT ON TABLE kpi_targets IS 'Target values and thresholds for KPI metrics';
