-- Insert default system roles
-- Version: V002
-- Description: Create default roles (EA, SA, TA, PM, SE)

-- Insert EA (Enterprise Architect) role
INSERT INTO roles (id, tenant_id, name, code, description, permissions, is_system, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    NULL,
    'Enterprise Architect',
    'EA',
    'Enterprise Architect - Defines overall enterprise architecture strategy, standards, and governance',
    '["create", "read", "update", "delete", "deploy", "manage_users", "manage_roles", "system_config", "audit_logs", "reports", "architecture_design", "enterprise_strategy"]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (tenant_id, code) DO NOTHING;

-- Insert SA (Solution Architect) role
INSERT INTO roles (id, tenant_id, name, code, description, permissions, is_system, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    NULL,
    'Solution Architect',
    'SA',
    'Solution Architect - Designs technical solutions aligned with business requirements',
    '["create", "read", "update", "delete", "deploy", "architecture_design", "solution_design", "technical_specs", "reports"]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (tenant_id, code) DO NOTHING;

-- Insert TA (Technical Architect) role
INSERT INTO roles (id, tenant_id, name, code, description, permissions, is_system, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    NULL,
    'Technical Architect',
    'TA',
    'Technical Architect - Focuses on technology stack, infrastructure, and technical implementation details',
    '["create", "read", "update", "delete", "deploy", "technical_specs", "infrastructure_design", "technology_evaluation", "code_review"]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (tenant_id, code) DO NOTHING;

-- Insert PM (Project Manager) role
INSERT INTO roles (id, tenant_id, name, code, description, permissions, is_system, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000004',
    NULL,
    'Project Manager',
    'PM',
    'Project Manager - Manages architecture projects, timelines, resources, and stakeholder communication',
    '["read", "create", "update", "project_management", "resource_allocation", "reports", "audit_logs"]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (tenant_id, code) DO NOTHING;

-- Insert SE (Software Engineer) role
INSERT INTO roles (id, tenant_id, name, code, description, permissions, is_system, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000005',
    NULL,
    'Software Engineer',
    'SE',
    'Software Engineer - Implements architecture designs, develops code, and maintains systems',
    '["read", "create", "update", "delete", "deploy", "code_development", "code_review", "testing"]'::jsonb,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT (tenant_id, code) DO NOTHING;

-- Create index on role code for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_code_system ON roles(code) WHERE is_system = true;

-- Verify insertion
DO $$
BEGIN
    RAISE NOTICE 'Default roles created successfully:';
    RAISE NOTICE '  - EA: Enterprise Architect';
    RAISE NOTICE '  - SA: Solution Architect';
    RAISE NOTICE '  - TA: Technical Architect';
    RAISE NOTICE '  - PM: Project Manager';
    RAISE NOTICE '  - SE: Software Engineer';
END $$;
