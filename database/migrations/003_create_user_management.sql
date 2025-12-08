-- Advanced Enterprise User Management Schema
-- Created: December 6, 2025

-- Users table with comprehensive fields
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    department VARCHAR(100),
    job_title VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    failed_login_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    must_change_password BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Roles table for RBAC
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Role mapping (many-to-many)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Role-Permission mapping (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Sessions table for tracking active sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_type VARCHAR(50),
    location VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for user activities
CREATE TABLE IF NOT EXISTS user_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    resource_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) CHECK (status IN ('success', 'failure', 'warning')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password history for security policies
CREATE TABLE IF NOT EXISTS password_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User groups for organizational structure
CREATE TABLE IF NOT EXISTS user_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_group_id UUID REFERENCES user_groups(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User-Group mapping
CREATE TABLE IF NOT EXISTS user_group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES user_groups(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, group_id)
);

-- API Keys for service accounts
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    permissions JSONB,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_audit_log_user_id ON user_audit_log(user_id);
CREATE INDEX idx_audit_log_action ON user_audit_log(action);
CREATE INDEX idx_audit_log_created_at ON user_audit_log(created_at);

-- Insert default system roles
INSERT INTO roles (name, display_name, description, is_system_role, priority) VALUES
    ('super_admin', 'Super Administrator', 'Full system access with all permissions', TRUE, 1000),
    ('admin', 'Administrator', 'Administrative access to manage users and resources', TRUE, 900),
    ('operator', 'Operator', 'Operational access to manage infrastructure', TRUE, 700),
    ('developer', 'Developer', 'Development access to manage applications', TRUE, 600),
    ('auditor', 'Auditor', 'Read-only access for compliance and auditing', TRUE, 500),
    ('viewer', 'Viewer', 'Read-only access to view dashboards and reports', TRUE, 300)
ON CONFLICT (name) DO NOTHING;

-- Insert comprehensive permissions
INSERT INTO permissions (name, display_name, resource, action, description) VALUES
    -- User Management
    ('users.view', 'View Users', 'users', 'read', 'View user list and details'),
    ('users.create', 'Create Users', 'users', 'create', 'Create new user accounts'),
    ('users.update', 'Update Users', 'users', 'update', 'Update user information'),
    ('users.delete', 'Delete Users', 'users', 'delete', 'Delete user accounts'),
    ('users.manage_roles', 'Manage User Roles', 'users', 'manage', 'Assign and remove user roles'),
    
    -- Role Management
    ('roles.view', 'View Roles', 'roles', 'read', 'View role list and details'),
    ('roles.create', 'Create Roles', 'roles', 'create', 'Create new roles'),
    ('roles.update', 'Update Roles', 'roles', 'update', 'Update role information'),
    ('roles.delete', 'Delete Roles', 'roles', 'delete', 'Delete roles'),
    
    -- Infrastructure
    ('infrastructure.view', 'View Infrastructure', 'infrastructure', 'read', 'View infrastructure resources'),
    ('infrastructure.manage', 'Manage Infrastructure', 'infrastructure', 'manage', 'Create and modify infrastructure'),
    ('infrastructure.deploy', 'Deploy Infrastructure', 'infrastructure', 'deploy', 'Deploy infrastructure changes'),
    ('infrastructure.destroy', 'Destroy Infrastructure', 'infrastructure', 'delete', 'Destroy infrastructure resources'),
    
    -- Services
    ('services.view', 'View Services', 'services', 'read', 'View service status and details'),
    ('services.manage', 'Manage Services', 'services', 'manage', 'Start, stop, and configure services'),
    ('services.logs', 'View Service Logs', 'services', 'read', 'View service logs and metrics'),
    
    -- Monitoring
    ('monitoring.view', 'View Monitoring', 'monitoring', 'read', 'View monitoring dashboards'),
    ('monitoring.configure', 'Configure Monitoring', 'monitoring', 'update', 'Configure alerts and thresholds'),
    
    -- Audit
    ('audit.view', 'View Audit Logs', 'audit', 'read', 'View audit logs and compliance reports'),
    ('audit.export', 'Export Audit Logs', 'audit', 'export', 'Export audit data'),
    
    -- API Access
    ('api.keys.view', 'View API Keys', 'api_keys', 'read', 'View API keys'),
    ('api.keys.create', 'Create API Keys', 'api_keys', 'create', 'Create new API keys'),
    ('api.keys.revoke', 'Revoke API Keys', 'api_keys', 'delete', 'Revoke API keys')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'admin' AND p.name NOT IN ('roles.delete', 'users.delete')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'operator' AND p.resource IN ('infrastructure', 'services', 'monitoring')
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p 
WHERE r.name = 'viewer' AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_groups_updated_at BEFORE UPDATE ON user_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action VARCHAR,
    p_resource VARCHAR,
    p_resource_id UUID,
    p_details JSONB,
    p_ip_address VARCHAR,
    p_status VARCHAR
)
RETURNS void AS $$
BEGIN
    INSERT INTO user_audit_log (user_id, action, resource, resource_id, details, ip_address, status)
    VALUES (p_user_id, p_action, p_resource, p_resource_id, p_details, p_ip_address, p_status);
END;
$$ LANGUAGE plpgsql;

-- View for user details with roles
CREATE OR REPLACE VIEW user_details_view AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.first_name,
    u.last_name,
    u.phone,
    u.avatar_url,
    u.department,
    u.job_title,
    u.status,
    u.email_verified,
    u.two_factor_enabled,
    u.last_login_at,
    u.created_at,
    u.updated_at,
    ARRAY_AGG(DISTINCT r.name) as roles,
    ARRAY_AGG(DISTINCT p.name) as permissions
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
GROUP BY u.id;

COMMENT ON TABLE users IS 'Core user accounts with authentication and profile information';
COMMENT ON TABLE roles IS 'Role-based access control roles';
COMMENT ON TABLE permissions IS 'Granular permissions for resource access';
COMMENT ON TABLE user_audit_log IS 'Comprehensive audit trail of user activities';
