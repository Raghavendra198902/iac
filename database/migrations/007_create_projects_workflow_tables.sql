-- Migration: Create projects and workflow tracking tables
-- Description: Support project management and workflow tracking for EA->SA->CMDB->PM->SE->Agent flow

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on-hold')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create workflow_steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
    id SERIAL PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    step_id VARCHAR(50) NOT NULL,
    step_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')),
    owner_team VARCHAR(100),
    assignee VARCHAR(100),
    completed_date DATE,
    route VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, step_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_date ON projects(created_date);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_project_id ON workflow_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_status ON workflow_steps(status);
CREATE INDEX IF NOT EXISTS idx_workflow_steps_assignee ON workflow_steps(assignee);

-- Insert sample projects
INSERT INTO projects (id, name, description, created_date, target_date, status, progress, created_by)
VALUES 
    ('PRJ-001', 'Cloud Migration - E-Commerce Platform', 'Migrate legacy e-commerce platform to AWS cloud infrastructure', '2024-11-01', '2025-02-28', 'active', 50, 'admin'),
    ('PRJ-002', 'API Gateway Implementation', 'Design and implement centralized API gateway for microservices', '2024-11-10', '2025-01-31', 'active', 33, 'admin'),
    ('PRJ-003', 'Security Compliance Automation', 'Automate security compliance scanning and reporting for SOC2', '2024-11-20', '2025-03-15', 'active', 17, 'admin')
ON CONFLICT (id) DO NOTHING;

-- Insert workflow steps for PRJ-001
INSERT INTO workflow_steps (project_id, step_id, step_number, title, description, status, owner_team, assignee, completed_date, route)
VALUES
    ('PRJ-001', 'ea-project', 1, 'EA - Create Project & Architecture', 'Define project scope, create HLD and SA', 'completed', 'Enterprise Architecture Team', 'John Architect', '2024-11-05', '/ea/repository?doc=sa'),
    ('PRJ-001', 'sa-lld', 2, 'SA - Create LLD & CI Configuration', 'Create LLD and fetch CI configuration from CMDB', 'completed', 'Solution Architecture Team', 'Sarah Solutions', '2024-11-12', '/ea/repository?doc=lld'),
    ('PRJ-001', 'cmdb-config', 3, 'CMDB - Configuration Items', 'Identify and map infrastructure assets', 'in-progress', 'Infrastructure Team', 'Mike Infra', NULL, '/cmdb'),
    ('PRJ-001', 'pm-budget', 4, 'PM - Budget & Resource Assignment', 'Create project budget and assign team members', 'in-progress', 'Project Management Team', 'Lisa Manager', NULL, '/pm/roadmap'),
    ('PRJ-001', 'se-implementation', 5, 'SE - Implementation Flow & Playbooks', 'Create implementation workflow and playbooks', 'pending', 'Software Engineering Team', 'Not Assigned', NULL, '/se/projects'),
    ('PRJ-001', 'agent-deployment', 6, 'Agent - Execute Playbooks', 'Deploy agents and run automation playbooks', 'pending', 'DevOps Team', 'Not Assigned', NULL, '/agents/downloads')
ON CONFLICT (project_id, step_id) DO NOTHING;

-- Insert workflow steps for PRJ-002
INSERT INTO workflow_steps (project_id, step_id, step_number, title, description, status, owner_team, assignee, completed_date, route)
VALUES
    ('PRJ-002', 'ea-project', 1, 'EA - Create Project & Architecture', 'Define project scope, create HLD and SA', 'completed', 'Enterprise Architecture Team', 'David Enterprise', '2024-11-15', '/ea/repository?doc=sa'),
    ('PRJ-002', 'sa-lld', 2, 'SA - Create LLD & CI Configuration', 'Create LLD and fetch CI configuration from CMDB', 'in-progress', 'Solution Architecture Team', 'Tom Technical', NULL, '/ea/repository?doc=lld'),
    ('PRJ-002', 'cmdb-config', 3, 'CMDB - Configuration Items', 'Identify and map infrastructure assets', 'pending', 'Infrastructure Team', 'Not Assigned', NULL, '/cmdb'),
    ('PRJ-002', 'pm-budget', 4, 'PM - Budget & Resource Assignment', 'Create project budget and assign team members', 'pending', 'Project Management Team', 'Not Assigned', NULL, '/pm/roadmap'),
    ('PRJ-002', 'se-implementation', 5, 'SE - Implementation Flow & Playbooks', 'Create implementation workflow and playbooks', 'pending', 'Software Engineering Team', 'Not Assigned', NULL, '/se/projects'),
    ('PRJ-002', 'agent-deployment', 6, 'Agent - Execute Playbooks', 'Deploy agents and run automation playbooks', 'pending', 'DevOps Team', 'Not Assigned', NULL, '/agents/downloads')
ON CONFLICT (project_id, step_id) DO NOTHING;

-- Insert workflow steps for PRJ-003
INSERT INTO workflow_steps (project_id, step_id, step_number, title, description, status, owner_team, assignee, completed_date, route)
VALUES
    ('PRJ-003', 'ea-project', 1, 'EA - Create Project & Architecture', 'Define project scope, create HLD and SA', 'in-progress', 'Enterprise Architecture Team', 'Emma Enterprise', NULL, '/ea/repository?doc=sa'),
    ('PRJ-003', 'sa-lld', 2, 'SA - Create LLD & CI Configuration', 'Create LLD and fetch CI configuration from CMDB', 'pending', 'Solution Architecture Team', 'Not Assigned', NULL, '/ea/repository?doc=lld'),
    ('PRJ-003', 'cmdb-config', 3, 'CMDB - Configuration Items', 'Identify and map infrastructure assets', 'pending', 'Infrastructure Team', 'Not Assigned', NULL, '/cmdb'),
    ('PRJ-003', 'pm-budget', 4, 'PM - Budget & Resource Assignment', 'Create project budget and assign team members', 'pending', 'Project Management Team', 'Not Assigned', NULL, '/pm/roadmap'),
    ('PRJ-003', 'se-implementation', 5, 'SE - Implementation Flow & Playbooks', 'Create implementation workflow and playbooks', 'pending', 'Software Engineering Team', 'Not Assigned', NULL, '/se/projects'),
    ('PRJ-003', 'agent-deployment', 6, 'Agent - Execute Playbooks', 'Deploy agents and run automation playbooks', 'pending', 'DevOps Team', 'Not Assigned', NULL, '/agents/downloads')
ON CONFLICT (project_id, step_id) DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for project summary
CREATE OR REPLACE VIEW project_summary AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.created_date,
    p.target_date,
    p.status,
    p.progress,
    p.created_by,
    COUNT(ws.id) as total_steps,
    SUM(CASE WHEN ws.status = 'completed' THEN 1 ELSE 0 END) as completed_steps,
    SUM(CASE WHEN ws.status = 'in-progress' THEN 1 ELSE 0 END) as in_progress_steps,
    SUM(CASE WHEN ws.status = 'pending' THEN 1 ELSE 0 END) as pending_steps,
    SUM(CASE WHEN ws.status = 'blocked' THEN 1 ELSE 0 END) as blocked_steps
FROM projects p
LEFT JOIN workflow_steps ws ON p.id = ws.project_id
GROUP BY p.id, p.name, p.description, p.created_date, p.target_date, p.status, p.progress, p.created_by;

COMMENT ON TABLE projects IS 'Main projects table tracking all enterprise projects';
COMMENT ON TABLE workflow_steps IS 'Workflow steps for each project tracking EA->SA->CMDB->PM->SE->Agent flow';
COMMENT ON VIEW project_summary IS 'Summary view showing project statistics and workflow progress';
