-- Create agents table for CMDB agent management
-- Migration: 015_create_agents_table.sql
-- Created: 2025-12-03

-- Agents table to store information about registered CMDB agents
CREATE TABLE IF NOT EXISTS agents (
    agent_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name VARCHAR(255) NOT NULL UNIQUE,
    hostname VARCHAR(255),
    ip_address VARCHAR(45), -- Support IPv6
    os VARCHAR(255),
    platform VARCHAR(100),
    version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, offline
    metrics JSONB DEFAULT '{}'::jsonb, -- CPU, memory, disk, network stats
    metadata JSONB DEFAULT '{}'::jsonb, -- MAC address, domain, custom fields
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(agent_name);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_last_sync ON agents(last_sync);
CREATE INDEX IF NOT EXISTS idx_agents_hostname ON agents(hostname);
CREATE INDEX IF NOT EXISTS idx_agents_ip ON agents(ip_address);

-- Create agent events table for tracking agent activities
CREATE TABLE IF NOT EXISTS agent_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(agent_id) ON DELETE CASCADE,
    agent_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- heartbeat, process_start, process_stop, suspicious_process
    event_data JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    severity VARCHAR(50) DEFAULT 'info' -- info, warning, critical
);

-- Index for agent events
CREATE INDEX IF NOT EXISTS idx_agent_events_agent_id ON agent_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_events_agent_name ON agent_events(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_events_type ON agent_events(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_events_timestamp ON agent_events(timestamp);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agents_timestamp
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_agents_updated_at();

-- Table comments
COMMENT ON TABLE agents IS 'Stores registered CMDB agents and their current state';
COMMENT ON TABLE agent_events IS 'Tracks events and activities from CMDB agents';

-- Agents will be automatically registered when they connect to the backend
-- No demo data inserted - waiting for real agents to connect
