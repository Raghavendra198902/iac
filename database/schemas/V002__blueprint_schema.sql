-- IAC Dharma Blueprint Schema
-- Version: V002
-- Description: Blueprint, component, and relationship data

-- Blueprints table
CREATE TABLE blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scope VARCHAR(50) NOT NULL DEFAULT 'cloud',
    primary_provider VARCHAR(50),
    lifecycle_state VARCHAR(50) NOT NULL DEFAULT 'draft',
    current_version_id UUID,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(project_id, name)
);

CREATE INDEX idx_blueprints_project ON blueprints(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_blueprints_created_by ON blueprints(created_by);
CREATE INDEX idx_blueprints_lifecycle ON blueprints(lifecycle_state);

-- Blueprint versions (immutable snapshots)
CREATE TABLE blueprint_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_id UUID NOT NULL REFERENCES blueprints(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    parent_version_id UUID REFERENCES blueprint_versions(id),
    tag VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    graph_json JSONB NOT NULL,
    graph_hash VARCHAR(64) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(blueprint_id, version_number)
);

CREATE INDEX idx_blueprint_versions_blueprint ON blueprint_versions(blueprint_id);
CREATE INDEX idx_blueprint_versions_parent ON blueprint_versions(parent_version_id);
CREATE INDEX idx_blueprint_versions_tag ON blueprint_versions(tag);
CREATE INDEX idx_blueprint_versions_hash ON blueprint_versions(graph_hash);
CREATE INDEX idx_blueprint_versions_graph ON blueprint_versions USING GIN (graph_json);

-- Components (nodes in blueprint graph)
CREATE TABLE components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_version_id UUID NOT NULL REFERENCES blueprint_versions(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    subtype VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    labels JSONB DEFAULT '{}',
    properties JSONB DEFAULT '{}',
    tags JSONB DEFAULT '{}',
    position_x INTEGER,
    position_y INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_components_version ON components(blueprint_version_id);
CREATE INDEX idx_components_type ON components(type);
CREATE INDEX idx_components_name ON components(name);
CREATE INDEX idx_components_properties ON components USING GIN (properties);

-- Relations (edges in blueprint graph)
CREATE TABLE relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blueprint_version_id UUID NOT NULL REFERENCES blueprint_versions(id) ON DELETE CASCADE,
    from_component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    to_component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
    relation_type VARCHAR(50) NOT NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (from_component_id != to_component_id)
);

CREATE INDEX idx_relations_version ON relations(blueprint_version_id);
CREATE INDEX idx_relations_from ON relations(from_component_id);
CREATE INDEX idx_relations_to ON relations(to_component_id);
CREATE INDEX idx_relations_type ON relations(relation_type);

-- Blueprint diffs (comparison results)
CREATE TABLE blueprint_diffs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_version_id UUID NOT NULL REFERENCES blueprint_versions(id),
    to_version_id UUID NOT NULL REFERENCES blueprint_versions(id),
    diff_json JSONB NOT NULL,
    summary JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_version_id, to_version_id)
);

CREATE INDEX idx_blueprint_diffs_from ON blueprint_diffs(from_version_id);
CREATE INDEX idx_blueprint_diffs_to ON blueprint_diffs(to_version_id);

-- Reference architectures / templates
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    provider VARCHAR(50),
    graph_json JSONB NOT NULL,
    tags JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_tenant ON templates(tenant_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_provider ON templates(provider);
CREATE INDEX idx_templates_public ON templates(is_public);

-- Update trigger
CREATE TRIGGER update_blueprints_updated_at BEFORE UPDATE ON blueprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Foreign key for current version
ALTER TABLE blueprints 
    ADD CONSTRAINT fk_blueprints_current_version 
    FOREIGN KEY (current_version_id) 
    REFERENCES blueprint_versions(id);

-- Comments
COMMENT ON TABLE blueprints IS 'Blueprint metadata and versioning';
COMMENT ON TABLE blueprint_versions IS 'Immutable blueprint snapshots';
COMMENT ON TABLE components IS 'Infrastructure components/nodes';
COMMENT ON TABLE relations IS 'Component relationships/edges';
COMMENT ON TABLE blueprint_diffs IS 'Cached blueprint comparison results';
COMMENT ON TABLE templates IS 'Reusable architecture templates';
