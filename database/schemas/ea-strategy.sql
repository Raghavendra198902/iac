-- Enterprise Architecture Strategy Tables

-- Architecture Principles
CREATE TABLE IF NOT EXISTS ea_principles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    impact VARCHAR(50) NOT NULL,
    compliance INTEGER DEFAULT 0 CHECK (compliance >= 0 AND compliance <= 100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Strategic Goals
CREATE TABLE IF NOT EXISTS ea_strategic_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    timeline VARCHAR(100),
    initiatives INTEGER DEFAULT 0,
    budget VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'planning',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Governance Framework / Committees
CREATE TABLE IF NOT EXISTS ea_governance_committees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    members INTEGER DEFAULT 0,
    frequency VARCHAR(100),
    last_meeting VARCHAR(100),
    chair_name VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Committee Members
CREATE TABLE IF NOT EXISTS ea_committee_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID REFERENCES ea_governance_committees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Member',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Committee Decisions
CREATE TABLE IF NOT EXISTS ea_committee_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID REFERENCES ea_governance_committees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    decision_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Committee Meetings
CREATE TABLE IF NOT EXISTS ea_committee_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    committee_id UUID REFERENCES ea_governance_committees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    meeting_date TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ea_principles_status ON ea_principles(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ea_principles_category ON ea_principles(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ea_strategic_goals_status ON ea_strategic_goals(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ea_governance_committees_name ON ea_governance_committees(name) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ea_committee_members_committee ON ea_committee_members(committee_id);
CREATE INDEX IF NOT EXISTS idx_ea_committee_decisions_committee ON ea_committee_decisions(committee_id);
CREATE INDEX IF NOT EXISTS idx_ea_committee_meetings_committee ON ea_committee_meetings(committee_id);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ea_principles_updated_at BEFORE UPDATE ON ea_principles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ea_strategic_goals_updated_at BEFORE UPDATE ON ea_strategic_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ea_governance_committees_updated_at BEFORE UPDATE ON ea_governance_committees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ea_committee_decisions_updated_at BEFORE UPDATE ON ea_committee_decisions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
