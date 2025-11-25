-- Application Architecture Schema
-- Tables for applications, integrations, and portfolios

-- Applications
CREATE TABLE IF NOT EXISTS ea_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Core, Support, Infrastructure, Custom
    status VARCHAR(50) DEFAULT 'active', -- active, deprecated, planned, retired
    criticality VARCHAR(50), -- Critical, High, Medium, Low
    business_capability_id UUID,
    owner VARCHAR(255),
    vendor VARCHAR(255),
    technology_stack TEXT, -- JSON array
    hosting VARCHAR(100), -- Cloud, On-Premise, Hybrid, SaaS
    users INTEGER DEFAULT 0,
    annual_cost DECIMAL(12,2),
    license_type VARCHAR(100),
    version VARCHAR(50),
    deployment_date DATE,
    end_of_life DATE,
    health_score INTEGER DEFAULT 75, -- 0-100
    availability DECIMAL(5,2) DEFAULT 99.0, -- percentage
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Application Dependencies/Integrations
CREATE TABLE IF NOT EXISTS ea_app_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_app_id UUID REFERENCES ea_applications(id),
    target_app_id UUID REFERENCES ea_applications(id),
    integration_type VARCHAR(100), -- API, Database, File, Message Queue, ETL
    protocol VARCHAR(50), -- REST, SOAP, JDBC, FTP, SFTP, Kafka
    frequency VARCHAR(50), -- Real-time, Hourly, Daily, Weekly
    data_volume VARCHAR(100),
    criticality VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data Architecture Schema
CREATE TABLE IF NOT EXISTS ea_data_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Master, Transactional, Reference, Analytical
    domain VARCHAR(100), -- Customer, Product, Financial, Operational
    owner VARCHAR(255),
    sensitivity VARCHAR(50), -- Public, Internal, Confidential, Restricted
    retention_period VARCHAR(100),
    record_count BIGINT,
    data_quality_score INTEGER DEFAULT 80, -- 0-100
    last_assessed DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Data Storage Systems
CREATE TABLE IF NOT EXISTS ea_data_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    store_type VARCHAR(100), -- RDBMS, NoSQL, Data Warehouse, Data Lake, Cache
    technology VARCHAR(100), -- PostgreSQL, MongoDB, Snowflake, S3, Redis
    hosting VARCHAR(100), -- Cloud, On-Premise, Hybrid
    size_gb DECIMAL(12,2),
    owner VARCHAR(255),
    backup_frequency VARCHAR(50),
    encryption_enabled BOOLEAN DEFAULT true,
    compliance_requirements TEXT, -- JSON array
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Technology Architecture Schema
CREATE TABLE IF NOT EXISTS ea_technologies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- Language, Framework, Platform, Tool, Database, Infrastructure
    vendor VARCHAR(255),
    version VARCHAR(50),
    lifecycle_phase VARCHAR(50), -- Emerging, Adopt, Maintain, Sunset, Retired
    usage_level VARCHAR(50), -- Strategic, Tactical, Legacy
    license_type VARCHAR(100), -- Open Source, Commercial, Proprietary
    risk_level VARCHAR(50), -- Low, Medium, High
    support_end_date DATE,
    replacement_technology VARCHAR(255),
    application_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Technology Standards
CREATE TABLE IF NOT EXISTS ea_tech_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    standard_type VARCHAR(100), -- Coding, Architecture, Security, Operations
    category VARCHAR(100),
    technology_id UUID REFERENCES ea_technologies(id),
    compliance_required BOOLEAN DEFAULT false,
    adoption_level INTEGER DEFAULT 50, -- 0-100 percentage
    owner VARCHAR(255),
    effective_date DATE,
    review_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Security Architecture Schema
CREATE TABLE IF NOT EXISTS ea_security_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    control_type VARCHAR(100), -- Preventive, Detective, Corrective, Deterrent
    category VARCHAR(100), -- Access Control, Encryption, Network, Application, Data
    framework VARCHAR(100), -- NIST, ISO 27001, CIS, OWASP
    control_id VARCHAR(50), -- Framework control ID
    implementation_status VARCHAR(50), -- Planned, In Progress, Implemented, Not Applicable
    effectiveness_score INTEGER DEFAULT 75, -- 0-100
    test_frequency VARCHAR(50), -- Continuous, Daily, Weekly, Monthly, Quarterly, Annual
    last_tested DATE,
    owner VARCHAR(255),
    priority VARCHAR(50), -- Critical, High, Medium, Low
    cost_to_implement DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Security Threats
CREATE TABLE IF NOT EXISTS ea_security_threats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    threat_category VARCHAR(100), -- Malware, Phishing, DDoS, Data Breach, Insider Threat
    severity VARCHAR(50), -- Critical, High, Medium, Low
    likelihood VARCHAR(50), -- Very Likely, Likely, Possible, Unlikely, Rare
    impact VARCHAR(50), -- Catastrophic, Major, Moderate, Minor, Minimal
    risk_score INTEGER, -- Calculated from likelihood + impact
    mitigation_controls TEXT, -- JSON array of control IDs
    residual_risk VARCHAR(50),
    owner VARCHAR(255),
    identified_date DATE DEFAULT CURRENT_DATE,
    last_reviewed DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_status ON ea_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_category ON ea_applications(category);
CREATE INDEX IF NOT EXISTS idx_applications_deleted ON ea_applications(deleted_at);
CREATE INDEX IF NOT EXISTS idx_app_integrations_source ON ea_app_integrations(source_app_id);
CREATE INDEX IF NOT EXISTS idx_app_integrations_target ON ea_app_integrations(target_app_id);

CREATE INDEX IF NOT EXISTS idx_data_entities_category ON ea_data_entities(category);
CREATE INDEX IF NOT EXISTS idx_data_entities_domain ON ea_data_entities(domain);
CREATE INDEX IF NOT EXISTS idx_data_entities_deleted ON ea_data_entities(deleted_at);
CREATE INDEX IF NOT EXISTS idx_data_stores_type ON ea_data_stores(store_type);
CREATE INDEX IF NOT EXISTS idx_data_stores_deleted ON ea_data_stores(deleted_at);

CREATE INDEX IF NOT EXISTS idx_technologies_category ON ea_technologies(category);
CREATE INDEX IF NOT EXISTS idx_technologies_lifecycle ON ea_technologies(lifecycle_phase);
CREATE INDEX IF NOT EXISTS idx_technologies_deleted ON ea_technologies(deleted_at);
CREATE INDEX IF NOT EXISTS idx_tech_standards_deleted ON ea_tech_standards(deleted_at);

CREATE INDEX IF NOT EXISTS idx_security_controls_category ON ea_security_controls(category);
CREATE INDEX IF NOT EXISTS idx_security_controls_status ON ea_security_controls(implementation_status);
CREATE INDEX IF NOT EXISTS idx_security_controls_deleted ON ea_security_controls(deleted_at);
CREATE INDEX IF NOT EXISTS idx_security_threats_severity ON ea_security_threats(severity);
CREATE INDEX IF NOT EXISTS idx_security_threats_deleted ON ea_security_threats(deleted_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_ea_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ea_applications_updated_at BEFORE UPDATE ON ea_applications FOR EACH ROW EXECUTE FUNCTION update_ea_updated_at();
CREATE TRIGGER update_ea_data_entities_updated_at BEFORE UPDATE ON ea_data_entities FOR EACH ROW EXECUTE FUNCTION update_ea_updated_at();
CREATE TRIGGER update_ea_data_stores_updated_at BEFORE UPDATE ON ea_data_stores FOR EACH ROW EXECUTE FUNCTION update_ea_updated_at();
CREATE TRIGGER update_ea_technologies_updated_at BEFORE UPDATE ON ea_technologies FOR EACH ROW EXECUTE FUNCTION update_ea_updated_at();
CREATE TRIGGER update_ea_tech_standards_updated_at BEFORE UPDATE ON ea_tech_standards FOR EACH ROW EXECUTE FUNCTION update_ea_updated_at();
CREATE TRIGGER update_ea_security_controls_updated_at BEFORE UPDATE ON ea_security_controls FOR EACH ROW EXECUTE FUNCTION update_ea_updated_at();
CREATE TRIGGER update_ea_security_threats_updated_at BEFORE UPDATE ON ea_security_threats FOR EACH ROW EXECUTE FUNCTION update_ea_updated_at();
