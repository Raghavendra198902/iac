-- IAC Dharma Approvals Schema
-- Version: V004
-- Description: Deployment approval workflow for Project Managers

-- Deployment approvals table
CREATE TABLE deployment_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    deployment_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Status: pending, approved, rejected, cancelled
    
    -- Request details
    requested_by UUID NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    environment VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    -- Priority: low, medium, high, critical
    
    deployment_window_start TIMESTAMP WITH TIME ZONE,
    deployment_window_end TIMESTAMP WITH TIME ZONE,
    estimated_duration INTEGER, -- minutes
    affected_services JSONB DEFAULT '[]',
    
    -- Approval/Rejection details
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    conditions JSONB DEFAULT '[]',
    reason TEXT,
    feedback TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical'))
);

-- Indexes for performance
CREATE INDEX idx_approvals_tenant ON deployment_approvals(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_status ON deployment_approvals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_approvals_deployment ON deployment_approvals(deployment_id);
CREATE INDEX idx_approvals_requested_by ON deployment_approvals(requested_by);
CREATE INDEX idx_approvals_reviewed_by ON deployment_approvals(reviewed_by) WHERE reviewed_by IS NOT NULL;
CREATE INDEX idx_approvals_environment ON deployment_approvals(environment);
CREATE INDEX idx_approvals_requested_at ON deployment_approvals(requested_at DESC);

-- Approval history audit trail
CREATE TABLE approval_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    approval_id UUID NOT NULL REFERENCES deployment_approvals(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    -- Action: created, approved, rejected, reassigned, updated, cancelled
    
    performed_by UUID NOT NULL REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    previous_state JSONB,
    new_state JSONB,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approval_history_approval ON approval_history(approval_id);
CREATE INDEX idx_approval_history_performed_at ON approval_history(performed_at DESC);

-- Budget allocations table
CREATE TABLE budget_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    project_id UUID NOT NULL,
    
    category VARCHAR(50) NOT NULL,
    -- Category: infrastructure, licenses, services, contingency
    
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    fiscal_year INTEGER NOT NULL,
    
    description TEXT,
    effective_date DATE NOT NULL,
    expiry_date DATE,
    
    allocated_by UUID NOT NULL REFERENCES users(id),
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- Status: active, expired, cancelled
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_amount CHECK (amount > 0),
    CONSTRAINT valid_status CHECK (status IN ('active', 'expired', 'cancelled'))
);

CREATE INDEX idx_budget_tenant ON budget_allocations(tenant_id);
CREATE INDEX idx_budget_project ON budget_allocations(project_id);
CREATE INDEX idx_budget_fiscal_year ON budget_allocations(fiscal_year);
CREATE INDEX idx_budget_category ON budget_allocations(category);
CREATE INDEX idx_budget_status ON budget_allocations(status);

-- Budget spending tracking
CREATE TABLE budget_spending (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allocation_id UUID NOT NULL REFERENCES budget_allocations(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    
    amount DECIMAL(12, 2) NOT NULL,
    description TEXT NOT NULL,
    spending_date DATE NOT NULL,
    
    recorded_by UUID NOT NULL REFERENCES users(id),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_spending_allocation ON budget_spending(allocation_id);
CREATE INDEX idx_spending_tenant ON budget_spending(tenant_id);
CREATE INDEX idx_spending_date ON budget_spending(spending_date DESC);

-- Budget alerts
CREATE TABLE budget_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    project_id UUID NOT NULL,
    
    severity VARCHAR(20) NOT NULL,
    -- Severity: info, warning, critical
    
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    
    current_spend DECIMAL(12, 2) NOT NULL,
    threshold DECIMAL(12, 2) NOT NULL,
    
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by UUID REFERENCES users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'critical'))
);

CREATE INDEX idx_budget_alerts_tenant ON budget_alerts(tenant_id);
CREATE INDEX idx_budget_alerts_project ON budget_alerts(project_id);
CREATE INDEX idx_budget_alerts_severity ON budget_alerts(severity);
CREATE INDEX idx_budget_alerts_unresolved ON budget_alerts(resolved) WHERE resolved = FALSE;

-- Cloud migrations tracking
CREATE TABLE cloud_migrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    project_id UUID NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'planning',
    -- Status: planning, in-progress, paused, completed, cancelled
    
    phase VARCHAR(50) NOT NULL DEFAULT 'assessment',
    -- Phase: assessment, planning, execution, validation, completed
    
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    
    owner_id UUID NOT NULL REFERENCES users(id),
    team_members JSONB DEFAULT '[]',
    
    progress INTEGER DEFAULT 0,
    -- Progress: 0-100
    
    workload_count INTEGER DEFAULT 0,
    migrated_workload_count INTEGER DEFAULT 0,
    
    budget_allocated DECIMAL(12, 2),
    budget_spent DECIMAL(12, 2) DEFAULT 0,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_status CHECK (status IN ('planning', 'in-progress', 'paused', 'completed', 'cancelled')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_progress CHECK (progress >= 0 AND progress <= 100)
);

CREATE INDEX idx_migrations_tenant ON cloud_migrations(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_migrations_project ON cloud_migrations(project_id);
CREATE INDEX idx_migrations_status ON cloud_migrations(status);
CREATE INDEX idx_migrations_owner ON cloud_migrations(owner_id);

-- Migration workloads
CREATE TABLE migration_workloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    migration_id UUID NOT NULL REFERENCES cloud_migrations(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Status: pending, in-progress, completed, failed, skipped
    
    migrated_date DATE,
    expected_date DATE,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'in-progress', 'completed', 'failed', 'skipped'))
);

CREATE INDEX idx_workloads_migration ON migration_workloads(migration_id);
CREATE INDEX idx_workloads_status ON migration_workloads(status);

-- Migration risks
CREATE TABLE migration_risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    migration_id UUID NOT NULL REFERENCES cloud_migrations(id) ON DELETE CASCADE,
    
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    -- Category: technical, business, security, compliance, external
    
    severity VARCHAR(20) NOT NULL,
    probability VARCHAR(20) NOT NULL,
    impact VARCHAR(20) NOT NULL,
    -- Severity/Probability/Impact: low, medium, high, critical
    
    mitigation TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    -- Status: active, mitigated, accepted, resolved
    
    owner_id UUID REFERENCES users(id),
    identified_date DATE NOT NULL,
    
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_probability CHECK (probability IN ('low', 'medium', 'high')),
    CONSTRAINT valid_impact CHECK (impact IN ('low', 'medium', 'high', 'critical')),
    CONSTRAINT valid_status CHECK (status IN ('active', 'mitigated', 'accepted', 'resolved'))
);

CREATE INDEX idx_risks_migration ON migration_risks(migration_id);
CREATE INDEX idx_risks_severity ON migration_risks(severity);
CREATE INDEX idx_risks_status ON migration_risks(status);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_deployment_approvals_updated_at BEFORE UPDATE ON deployment_approvals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_allocations_updated_at BEFORE UPDATE ON budget_allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_alerts_updated_at BEFORE UPDATE ON budget_alerts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cloud_migrations_updated_at BEFORE UPDATE ON cloud_migrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_migration_workloads_updated_at BEFORE UPDATE ON migration_workloads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_migration_risks_updated_at BEFORE UPDATE ON migration_risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE deployment_approvals IS 'Tracks deployment approval requests and decisions for PM oversight';
COMMENT ON TABLE approval_history IS 'Audit trail for all approval-related actions';
COMMENT ON TABLE budget_allocations IS 'Budget allocations by project and category';
COMMENT ON TABLE budget_spending IS 'Tracks actual spending against allocations';
COMMENT ON TABLE budget_alerts IS 'Automated alerts for budget thresholds';
COMMENT ON TABLE cloud_migrations IS 'Cloud migration projects and tracking';
COMMENT ON TABLE migration_workloads IS 'Individual workloads within migration projects';
COMMENT ON TABLE migration_risks IS 'Risk management for migration projects';
