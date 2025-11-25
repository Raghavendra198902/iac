-- Business Architecture Schema
-- Tables for business capabilities, processes, services, and value streams

-- Business Capabilities
CREATE TABLE IF NOT EXISTS ea_business_capabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Core, Supporting, Strategic
    level INTEGER DEFAULT 1, -- Hierarchy level (1=top, 2=sub, etc.)
    parent_id UUID REFERENCES ea_business_capabilities(id),
    maturity_level VARCHAR(50), -- Initial, Managed, Defined, Quantitatively Managed, Optimizing
    criticality VARCHAR(50), -- Critical, High, Medium, Low
    investment_priority VARCHAR(50), -- High, Medium, Low
    status VARCHAR(50) DEFAULT 'active', -- active, under-review, deprecated
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Business Processes
CREATE TABLE IF NOT EXISTS ea_business_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    capability_id UUID REFERENCES ea_business_capabilities(id),
    process_type VARCHAR(100), -- Core, Support, Management
    owner VARCHAR(255),
    automation_level INTEGER DEFAULT 0, -- 0-100%
    efficiency_score INTEGER DEFAULT 50, -- 0-100
    complexity VARCHAR(50), -- Low, Medium, High
    frequency VARCHAR(100), -- Continuous, Daily, Weekly, Monthly, Quarterly, Annual
    cycle_time VARCHAR(100), -- e.g., "2 hours", "1 day"
    cost_per_execution DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active',
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Business Services
CREATE TABLE IF NOT EXISTS ea_business_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    service_type VARCHAR(100), -- Internal, External, Partner
    capability_id UUID REFERENCES ea_business_capabilities(id),
    owner VARCHAR(255),
    consumers TEXT, -- JSON array of consumer types
    sla_target VARCHAR(100), -- e.g., "99.9% uptime"
    availability VARCHAR(50), -- 24/7, Business Hours, etc.
    usage_volume VARCHAR(100),
    revenue_impact VARCHAR(50), -- High, Medium, Low, None
    status VARCHAR(50) DEFAULT 'active',
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Value Streams
CREATE TABLE IF NOT EXISTS ea_value_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Customer-facing, Internal, Partner
    stages TEXT, -- JSON array of stages
    lead_time VARCHAR(100),
    throughput VARCHAR(100),
    quality_score INTEGER DEFAULT 75, -- 0-100
    customer_satisfaction INTEGER DEFAULT 80, -- 0-100
    annual_value DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'active',
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Business Capability Applications (mapping)
CREATE TABLE IF NOT EXISTS ea_capability_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capability_id UUID REFERENCES ea_business_capabilities(id),
    application_name VARCHAR(255),
    fit_score INTEGER DEFAULT 50, -- How well app supports capability (0-100)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Process Metrics
CREATE TABLE IF NOT EXISTS ea_process_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    process_id UUID REFERENCES ea_business_processes(id),
    metric_name VARCHAR(255),
    metric_value DECIMAL(12,2),
    metric_unit VARCHAR(50),
    measurement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_capabilities_parent ON ea_business_capabilities(parent_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_category ON ea_business_capabilities(category);
CREATE INDEX IF NOT EXISTS idx_capabilities_deleted ON ea_business_capabilities(deleted_at);
CREATE INDEX IF NOT EXISTS idx_processes_capability ON ea_business_processes(capability_id);
CREATE INDEX IF NOT EXISTS idx_processes_deleted ON ea_business_processes(deleted_at);
CREATE INDEX IF NOT EXISTS idx_services_capability ON ea_business_services(capability_id);
CREATE INDEX IF NOT EXISTS idx_services_deleted ON ea_business_services(deleted_at);
CREATE INDEX IF NOT EXISTS idx_value_streams_deleted ON ea_value_streams(deleted_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_ea_business_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ea_business_capabilities_updated_at
    BEFORE UPDATE ON ea_business_capabilities
    FOR EACH ROW EXECUTE FUNCTION update_ea_business_updated_at();

CREATE TRIGGER update_ea_business_processes_updated_at
    BEFORE UPDATE ON ea_business_processes
    FOR EACH ROW EXECUTE FUNCTION update_ea_business_updated_at();

CREATE TRIGGER update_ea_business_services_updated_at
    BEFORE UPDATE ON ea_business_services
    FOR EACH ROW EXECUTE FUNCTION update_ea_business_updated_at();

CREATE TRIGGER update_ea_value_streams_updated_at
    BEFORE UPDATE ON ea_value_streams
    FOR EACH ROW EXECUTE FUNCTION update_ea_business_updated_at();
