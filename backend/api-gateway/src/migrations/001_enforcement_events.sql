-- Migration: Create enforcement_events table
-- Description: Store security enforcement events with full audit trail

CREATE TABLE IF NOT EXISTS enforcement_events (
    id VARCHAR(255) PRIMARY KEY,
    agent_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type VARCHAR(100) NOT NULL,
    policy_id VARCHAR(255) NOT NULL,
    policy_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    event JSONB NOT NULL,
    actions JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_enforcement_agent_name ON enforcement_events(agent_name);
CREATE INDEX IF NOT EXISTS idx_enforcement_timestamp ON enforcement_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_enforcement_severity ON enforcement_events(severity);
CREATE INDEX IF NOT EXISTS idx_enforcement_policy_id ON enforcement_events(policy_id);
CREATE INDEX IF NOT EXISTS idx_enforcement_type ON enforcement_events(type);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_enforcement_agent_timestamp ON enforcement_events(agent_name, timestamp DESC);

-- GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_enforcement_event_gin ON enforcement_events USING GIN (event);
CREATE INDEX IF NOT EXISTS idx_enforcement_metadata_gin ON enforcement_events USING GIN (metadata);

COMMENT ON TABLE enforcement_events IS 'Security enforcement events from agents with full event details';
COMMENT ON COLUMN enforcement_events.id IS 'Unique event identifier';
COMMENT ON COLUMN enforcement_events.agent_name IS 'Name of the agent that detected the event';
COMMENT ON COLUMN enforcement_events.timestamp IS 'When the enforcement action occurred';
COMMENT ON COLUMN enforcement_events.type IS 'Event type (policy_triggered, etc)';
COMMENT ON COLUMN enforcement_events.policy_id IS 'ID of the policy that triggered';
COMMENT ON COLUMN enforcement_events.policy_name IS 'Human-readable policy name';
COMMENT ON COLUMN enforcement_events.severity IS 'Severity level (low, medium, high, critical)';
COMMENT ON COLUMN enforcement_events.event IS 'Full event details as JSON';
COMMENT ON COLUMN enforcement_events.actions IS 'Enforcement actions taken';
COMMENT ON COLUMN enforcement_events.metadata IS 'Additional metadata';
