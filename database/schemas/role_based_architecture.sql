-- Role-Based Architecture Management
-- Extends EA framework for Solution Architects, Technical Architects, Project Managers, and Software Engineers

-- ============================================================================
-- Solution Architect (SA) Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS sa_solution_designs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'draft', 'in_review', 'approved', 'implemented', 'deprecated'
    )),
    
    -- Solution Context
    business_problem TEXT NOT NULL,
    stakeholders JSONB NOT NULL,
    success_criteria JSONB NOT NULL,
    constraints JSONB,
    assumptions JSONB,
    
    -- Solution Design
    proposed_solution TEXT NOT NULL,
    architecture_diagram_url VARCHAR(500),
    component_breakdown JSONB NOT NULL,
    integration_points JSONB,
    data_flows JSONB,
    
    -- Technology Stack
    technologies JSONB NOT NULL,
    cloud_services JSONB,
    third_party_services JSONB,
    
    -- Non-Functional Requirements
    performance_requirements JSONB,
    security_requirements JSONB,
    scalability_requirements JSONB,
    availability_requirements JSONB,
    
    -- Cost & Resource
    estimated_cost DECIMAL(12, 2),
    timeline_weeks INTEGER,
    team_size INTEGER,
    resource_requirements JSONB,
    
    -- Risk & Compliance
    risks JSONB,
    mitigation_strategies JSONB,
    compliance_frameworks JSONB,
    
    -- Relationships
    related_adr_ids JSONB,
    related_project_ids JSONB,
    parent_solution_id UUID REFERENCES sa_solution_designs(id),
    
    -- Approval
    reviewed_by JSONB,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sa_design_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_design_id UUID NOT NULL REFERENCES sa_solution_designs(id) ON DELETE CASCADE,
    review_type VARCHAR(50) NOT NULL CHECK (review_type IN (
        'peer_review', 'technical_review', 'security_review', 
        'architecture_review', 'final_review'
    )),
    
    -- Review Details
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewer_role VARCHAR(50),
    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Feedback
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    strengths TEXT,
    concerns TEXT,
    recommendations JSONB,
    questions JSONB,
    
    -- Decision
    decision VARCHAR(50) CHECK (decision IN (
        'approved', 'approved_with_conditions', 'needs_revision', 'rejected'
    )),
    conditions JSONB,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sa_solution_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern_name VARCHAR(200) NOT NULL UNIQUE,
    pattern_category VARCHAR(100) NOT NULL CHECK (pattern_category IN (
        'integration', 'data', 'security', 'performance', 
        'scalability', 'resilience', 'deployment'
    )),
    
    -- Pattern Description
    problem_description TEXT NOT NULL,
    solution_description TEXT NOT NULL,
    when_to_use TEXT NOT NULL,
    when_not_to_use TEXT,
    
    -- Implementation
    implementation_guide TEXT,
    code_examples JSONB,
    diagram_url VARCHAR(500),
    
    -- Characteristics
    complexity_level VARCHAR(20) CHECK (complexity_level IN ('low', 'medium', 'high')),
    maturity_level VARCHAR(20) CHECK (maturity_level IN ('experimental', 'emerging', 'proven', 'industry_standard')),
    
    -- Tradeoffs
    benefits JSONB NOT NULL,
    drawbacks JSONB,
    alternatives JSONB,
    
    -- Related Patterns
    related_patterns JSONB,
    supersedes_pattern_id UUID REFERENCES sa_solution_patterns(id),
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2),
    
    -- Metadata
    tags JSONB,
    technology_specific BOOLEAN DEFAULT false,
    technologies JSONB,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Technical Architect (TA) Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS ta_technical_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_number VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN (
        'draft', 'in_review', 'approved', 'implemented', 'obsolete'
    )),
    
    -- Specification Context
    solution_design_id UUID REFERENCES sa_solution_designs(id),
    component_name VARCHAR(200) NOT NULL,
    component_type VARCHAR(100) NOT NULL,
    
    -- Technical Details
    technology_stack JSONB NOT NULL,
    api_specifications JSONB,
    data_models JSONB,
    interface_definitions JSONB,
    
    -- Implementation Details
    implementation_approach TEXT NOT NULL,
    design_patterns JSONB,
    coding_standards JSONB,
    testing_strategy TEXT,
    
    -- Infrastructure
    infrastructure_requirements JSONB NOT NULL,
    deployment_architecture JSONB,
    scaling_strategy TEXT,
    disaster_recovery TEXT,
    
    -- Performance
    performance_targets JSONB NOT NULL,
    load_characteristics JSONB,
    caching_strategy TEXT,
    optimization_techniques JSONB,
    
    -- Security
    authentication_method VARCHAR(100),
    authorization_model TEXT,
    encryption_requirements JSONB,
    security_controls JSONB,
    
    -- Dependencies
    internal_dependencies JSONB,
    external_dependencies JSONB,
    library_versions JSONB,
    
    -- Monitoring & Operations
    monitoring_requirements JSONB,
    logging_requirements JSONB,
    alerting_rules JSONB,
    sla_requirements JSONB,
    
    -- Documentation
    detailed_documentation TEXT,
    diagram_urls JSONB,
    
    -- Approval
    reviewed_by JSONB,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ta_technology_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_number VARCHAR(20) UNIQUE NOT NULL,
    technology_name VARCHAR(200) NOT NULL,
    technology_category VARCHAR(100) NOT NULL,
    
    -- Evaluation Context
    evaluation_purpose TEXT NOT NULL,
    use_case TEXT NOT NULL,
    evaluation_criteria JSONB NOT NULL,
    
    -- Technology Analysis
    vendor_info JSONB,
    version_evaluated VARCHAR(50),
    license_type VARCHAR(100),
    cost_analysis JSONB,
    
    -- Capabilities Assessment
    functional_capabilities JSONB NOT NULL,
    technical_capabilities JSONB NOT NULL,
    integration_capabilities JSONB,
    scalability_assessment TEXT,
    performance_assessment TEXT,
    
    -- Pros & Cons
    strengths JSONB NOT NULL,
    weaknesses JSONB NOT NULL,
    limitations JSONB,
    
    -- Comparison
    alternatives_considered JSONB,
    comparison_matrix JSONB,
    
    -- Risk Assessment
    technical_risks JSONB,
    vendor_risks JSONB,
    adoption_risks JSONB,
    
    -- Recommendation
    recommendation VARCHAR(50) CHECK (recommendation IN (
        'strongly_recommended', 'recommended', 'conditional', 
        'not_recommended', 'requires_further_evaluation'
    )),
    recommendation_rationale TEXT NOT NULL,
    conditions JSONB,
    
    -- Proof of Concept
    poc_completed BOOLEAN DEFAULT false,
    poc_results TEXT,
    poc_repository_url VARCHAR(500),
    
    -- Decision
    decision VARCHAR(50) CHECK (decision IN ('approved', 'rejected', 'deferred')),
    decision_date DATE,
    decision_by UUID REFERENCES users(id),
    
    -- Audit
    evaluated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ta_architecture_debt (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debt_title VARCHAR(255) NOT NULL,
    debt_type VARCHAR(50) NOT NULL CHECK (debt_type IN (
        'technical_debt', 'architecture_debt', 'design_debt', 
        'test_debt', 'documentation_debt', 'infrastructure_debt'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    
    -- Debt Description
    description TEXT NOT NULL,
    root_cause TEXT NOT NULL,
    affected_components JSONB NOT NULL,
    
    -- Impact Analysis
    business_impact TEXT NOT NULL,
    technical_impact TEXT NOT NULL,
    maintenance_cost_monthly DECIMAL(10, 2),
    performance_impact TEXT,
    security_impact TEXT,
    
    -- Resolution
    proposed_solution TEXT,
    estimated_effort_hours INTEGER,
    estimated_cost DECIMAL(12, 2),
    priority_score INTEGER CHECK (priority_score BETWEEN 1 AND 100),
    
    -- Status Tracking
    status VARCHAR(50) NOT NULL DEFAULT 'identified' CHECK (status IN (
        'identified', 'analyzed', 'planned', 'in_progress', 
        'resolved', 'accepted', 'deferred'
    )),
    acceptance_reason TEXT,
    resolution_date DATE,
    
    -- Project Assignment
    assigned_to UUID REFERENCES users(id),
    project_id UUID,
    sprint_id VARCHAR(50),
    
    -- Relationships
    related_debt_ids JSONB,
    caused_by_adr_id UUID REFERENCES architecture_decisions(id),
    
    -- Audit
    identified_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Project Manager (PM) Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS pm_architecture_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL CHECK (project_type IN (
        'new_development', 'modernization', 'migration', 
        'integration', 'optimization', 'proof_of_concept'
    )),
    
    -- Project Context
    business_objective TEXT NOT NULL,
    success_metrics JSONB NOT NULL,
    stakeholders JSONB NOT NULL,
    
    -- Architecture Artifacts
    solution_design_id UUID REFERENCES sa_solution_designs(id),
    related_adr_ids JSONB,
    technical_spec_ids JSONB,
    
    -- Timeline
    start_date DATE NOT NULL,
    planned_end_date DATE NOT NULL,
    actual_end_date DATE,
    current_phase VARCHAR(100),
    
    -- Budget
    total_budget DECIMAL(15, 2) NOT NULL,
    spent_to_date DECIMAL(15, 2) DEFAULT 0,
    budget_variance DECIMAL(15, 2),
    
    -- Resources
    team_composition JSONB NOT NULL,
    key_personnel JSONB,
    external_resources JSONB,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'planning' CHECK (status IN (
        'planning', 'design', 'development', 'testing', 
        'deployment', 'completed', 'on_hold', 'cancelled'
    )),
    health_status VARCHAR(20) CHECK (health_status IN ('green', 'yellow', 'red')),
    
    -- Risk Management
    active_risks JSONB,
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    
    -- Quality Gates
    architecture_review_status VARCHAR(50),
    security_review_status VARCHAR(50),
    compliance_review_status VARCHAR(50),
    
    -- Deliverables
    planned_deliverables JSONB NOT NULL,
    completed_deliverables JSONB,
    
    -- Metrics
    completion_percentage INTEGER CHECK (completion_percentage BETWEEN 0 AND 100),
    quality_score INTEGER CHECK (quality_score BETWEEN 0 AND 100),
    
    -- Audit
    project_manager_id UUID NOT NULL REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pm_architecture_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES pm_architecture_projects(id) ON DELETE CASCADE,
    milestone_name VARCHAR(200) NOT NULL,
    milestone_type VARCHAR(50) CHECK (milestone_type IN (
        'design_complete', 'review_approved', 'development_complete',
        'testing_complete', 'deployment_ready', 'go_live', 'closure'
    )),
    
    -- Milestone Details
    description TEXT,
    success_criteria JSONB NOT NULL,
    deliverables JSONB NOT NULL,
    
    -- Timeline
    planned_date DATE NOT NULL,
    actual_date DATE,
    variance_days INTEGER,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN (
        'planned', 'in_progress', 'completed', 'delayed', 'at_risk'
    )),
    completion_percentage INTEGER CHECK (completion_percentage BETWEEN 0 AND 100),
    
    -- Approval
    requires_approval BOOLEAN DEFAULT true,
    approved_by JSONB,
    approved_at TIMESTAMP,
    
    -- Dependencies
    dependent_on_milestone_ids JSONB,
    blocking_milestone_ids JSONB,
    
    -- Notes
    notes TEXT,
    lessons_learned TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pm_architecture_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES pm_architecture_projects(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL CHECK (dependency_type IN (
        'internal_team', 'external_team', 'vendor', 'infrastructure',
        'approval', 'resource', 'technical', 'data'
    )),
    
    -- Dependency Details
    description TEXT NOT NULL,
    dependent_on VARCHAR(255) NOT NULL,
    contact_person VARCHAR(200),
    contact_email VARCHAR(255),
    
    -- Timeline
    required_by_date DATE NOT NULL,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'blocked', 'fulfilled', 'cancelled'
    )),
    criticality VARCHAR(20) CHECK (criticality IN ('critical', 'high', 'medium', 'low')),
    
    -- Risk
    risk_level VARCHAR(20),
    mitigation_plan TEXT,
    alternative_plan TEXT,
    
    -- Follow-up
    last_followed_up DATE,
    next_follow_up DATE,
    follow_up_notes TEXT,
    
    -- Resolution
    resolution_notes TEXT,
    
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Software Engineer (SE) Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS se_implementation_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN (
        'feature_development', 'bug_fix', 'refactoring', 
        'performance_optimization', 'security_fix', 'technical_debt'
    )),
    
    -- Task Context
    technical_spec_id UUID REFERENCES ta_technical_specifications(id),
    project_id UUID REFERENCES pm_architecture_projects(id),
    component_name VARCHAR(200),
    
    -- Requirements
    description TEXT NOT NULL,
    acceptance_criteria JSONB NOT NULL,
    technical_requirements JSONB,
    design_reference TEXT,
    
    -- Implementation Details
    implementation_approach TEXT,
    code_changes_summary TEXT,
    affected_files JSONB,
    test_cases JSONB,
    
    -- Effort
    estimated_hours DECIMAL(6, 2),
    actual_hours DECIMAL(6, 2),
    complexity VARCHAR(20) CHECK (complexity IN ('trivial', 'simple', 'moderate', 'complex', 'very_complex')),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'todo' CHECK (status IN (
        'todo', 'in_progress', 'code_review', 'testing', 
        'done', 'blocked', 'cancelled'
    )),
    blocked_reason TEXT,
    
    -- Quality
    code_review_status VARCHAR(50),
    test_coverage_percentage INTEGER CHECK (test_coverage_percentage BETWEEN 0 AND 100),
    quality_gate_passed BOOLEAN DEFAULT false,
    
    -- Code Management
    branch_name VARCHAR(200),
    pull_request_url VARCHAR(500),
    commit_ids JSONB,
    
    -- Dependencies
    depends_on_task_ids JSONB,
    blocks_task_ids JSONB,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    
    -- Dates
    start_date DATE,
    completion_date DATE,
    due_date DATE,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS se_code_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES se_implementation_tasks(id) ON DELETE CASCADE,
    review_number INTEGER NOT NULL,
    
    -- Review Details
    reviewer_id UUID NOT NULL REFERENCES users(id),
    review_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    review_duration_minutes INTEGER,
    
    -- Code Quality Assessment
    code_quality_score INTEGER CHECK (code_quality_score BETWEEN 1 AND 10),
    follows_standards BOOLEAN,
    follows_patterns BOOLEAN,
    
    -- Feedback Categories
    architecture_feedback TEXT,
    design_feedback TEXT,
    implementation_feedback TEXT,
    testing_feedback TEXT,
    documentation_feedback TEXT,
    
    -- Issues Found
    critical_issues JSONB,
    major_issues JSONB,
    minor_issues JSONB,
    suggestions JSONB,
    
    -- Metrics
    lines_of_code_reviewed INTEGER,
    files_reviewed INTEGER,
    issues_count INTEGER,
    
    -- Decision
    decision VARCHAR(50) NOT NULL CHECK (decision IN (
        'approved', 'approved_with_minor_changes', 
        'needs_revision', 'rejected'
    )),
    decision_rationale TEXT,
    
    -- Follow-up
    requires_re_review BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS se_architecture_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_number VARCHAR(50) UNIQUE NOT NULL,
    question_title VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    question_category VARCHAR(100) CHECK (question_category IN (
        'design_decision', 'implementation_approach', 'technology_choice',
        'performance_optimization', 'security_concern', 'best_practice',
        'debugging', 'integration', 'testing'
    )),
    
    -- Context
    project_id UUID REFERENCES pm_architecture_projects(id),
    task_id UUID REFERENCES se_implementation_tasks(id),
    component_name VARCHAR(200),
    
    -- Technical Details
    technologies_involved JSONB,
    code_snippet TEXT,
    error_message TEXT,
    context_information TEXT,
    
    -- Question Details
    what_tried JSONB,
    expected_outcome TEXT,
    actual_outcome TEXT,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN (
        'open', 'answered', 'resolved', 'discussion', 'escalated'
    )),
    priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    is_blocking BOOLEAN DEFAULT false,
    
    -- Answer
    answer_text TEXT,
    answered_by UUID REFERENCES users(id),
    answered_at TIMESTAMP,
    answer_helpful BOOLEAN,
    
    -- Engagement
    views_count INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    
    -- Resolution
    resolution_approach TEXT,
    related_documentation JSONB,
    
    -- Audit
    asked_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Cross-Role Collaboration Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN (
        'design_workshop', 'code_review', 'architecture_review',
        'planning_meeting', 'retrospective', 'technical_discussion'
    )),
    session_title VARCHAR(255) NOT NULL,
    
    -- Participants
    participants JSONB NOT NULL,
    facilitator_id UUID REFERENCES users(id),
    
    -- Session Details
    session_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    location VARCHAR(200),
    meeting_url VARCHAR(500),
    
    -- Agenda & Outcomes
    agenda JSONB,
    discussion_points JSONB,
    decisions_made JSONB,
    action_items JSONB,
    
    -- Artifacts
    related_solution_id UUID REFERENCES sa_solution_designs(id),
    related_spec_id UUID REFERENCES ta_technical_specifications(id),
    related_project_id UUID REFERENCES pm_architecture_projects(id),
    
    -- Documentation
    notes TEXT,
    recording_url VARCHAR(500),
    attachments JSONB,
    
    -- Follow-up
    next_session_date TIMESTAMP,
    
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Solution Architect Indexes
CREATE INDEX idx_sa_designs_status ON sa_solution_designs(status, created_at DESC);
CREATE INDEX idx_sa_designs_creator ON sa_solution_designs(created_by, created_at DESC);
CREATE INDEX idx_sa_designs_approver ON sa_solution_designs(approved_by, approved_at DESC);
CREATE INDEX idx_sa_reviews_solution ON sa_design_reviews(solution_design_id, review_date DESC);
CREATE INDEX idx_sa_patterns_category ON sa_solution_patterns(pattern_category);
CREATE INDEX idx_sa_patterns_usage ON sa_solution_patterns(usage_count DESC);

-- Technical Architect Indexes
CREATE INDEX idx_ta_specs_status ON ta_technical_specifications(status, created_at DESC);
CREATE INDEX idx_ta_specs_solution ON ta_technical_specifications(solution_design_id);
CREATE INDEX idx_ta_evaluations_tech ON ta_technology_evaluations(technology_name);
CREATE INDEX idx_ta_evaluations_recommendation ON ta_technology_evaluations(recommendation);
CREATE INDEX idx_ta_debt_severity ON ta_architecture_debt(severity, status);
CREATE INDEX idx_ta_debt_assigned ON ta_architecture_debt(assigned_to, status);

-- Project Manager Indexes
CREATE INDEX idx_pm_projects_status ON pm_architecture_projects(status, start_date DESC);
CREATE INDEX idx_pm_projects_pm ON pm_architecture_projects(project_manager_id, status);
CREATE INDEX idx_pm_projects_health ON pm_architecture_projects(health_status);
CREATE INDEX idx_pm_milestones_project ON pm_architecture_milestones(project_id, planned_date);
CREATE INDEX idx_pm_milestones_status ON pm_architecture_milestones(status);
CREATE INDEX idx_pm_dependencies_project ON pm_architecture_dependencies(project_id, status);

-- Software Engineer Indexes
CREATE INDEX idx_se_tasks_status ON se_implementation_tasks(status, created_at DESC);
CREATE INDEX idx_se_tasks_assigned ON se_implementation_tasks(assigned_to, status);
CREATE INDEX idx_se_tasks_project ON se_implementation_tasks(project_id);
CREATE INDEX idx_se_reviews_task ON se_code_reviews(task_id, review_date DESC);
CREATE INDEX idx_se_questions_status ON se_architecture_questions(status, priority);
CREATE INDEX idx_se_questions_asker ON se_architecture_questions(asked_by, created_at DESC);

-- Collaboration Indexes
CREATE INDEX idx_collaboration_type ON role_collaboration_sessions(session_type, session_date DESC);
CREATE INDEX idx_collaboration_facilitator ON role_collaboration_sessions(facilitator_id);

-- ============================================================================
-- Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_role_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sa_designs_updated BEFORE UPDATE ON sa_solution_designs FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_sa_patterns_updated BEFORE UPDATE ON sa_solution_patterns FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_ta_specs_updated BEFORE UPDATE ON ta_technical_specifications FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_ta_evaluations_updated BEFORE UPDATE ON ta_technology_evaluations FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_ta_debt_updated BEFORE UPDATE ON ta_architecture_debt FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_pm_projects_updated BEFORE UPDATE ON pm_architecture_projects FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_pm_milestones_updated BEFORE UPDATE ON pm_architecture_milestones FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_pm_dependencies_updated BEFORE UPDATE ON pm_architecture_dependencies FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_se_tasks_updated BEFORE UPDATE ON se_implementation_tasks FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();
CREATE TRIGGER trg_se_questions_updated BEFORE UPDATE ON se_architecture_questions FOR EACH ROW EXECUTE FUNCTION update_role_updated_at();

-- ============================================================================
-- Views for Role-Based Dashboards
-- ============================================================================

CREATE OR REPLACE VIEW sa_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM sa_solution_designs WHERE status = 'draft') as drafts_count,
    (SELECT COUNT(*) FROM sa_solution_designs WHERE status = 'in_review') as in_review_count,
    (SELECT COUNT(*) FROM sa_solution_designs WHERE status = 'approved') as approved_count,
    (SELECT COUNT(*) FROM sa_design_reviews WHERE review_date >= CURRENT_DATE - INTERVAL '30 days') as recent_reviews,
    (SELECT AVG(overall_rating) FROM sa_design_reviews WHERE review_date >= CURRENT_DATE - INTERVAL '90 days') as avg_rating,
    (SELECT COUNT(*) FROM sa_solution_patterns WHERE maturity_level = 'proven') as proven_patterns;

CREATE OR REPLACE VIEW ta_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM ta_technical_specifications WHERE status = 'in_review') as specs_in_review,
    (SELECT COUNT(*) FROM ta_architecture_debt WHERE status IN ('identified', 'analyzed')) as active_debt,
    (SELECT SUM(maintenance_cost_monthly) FROM ta_architecture_debt WHERE status NOT IN ('resolved', 'accepted')) as monthly_debt_cost,
    (SELECT COUNT(*) FROM ta_technology_evaluations WHERE recommendation = 'strongly_recommended') as recommended_tech,
    (SELECT AVG(priority_score) FROM ta_architecture_debt WHERE severity IN ('critical', 'high')) as avg_debt_priority;

CREATE OR REPLACE VIEW pm_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM pm_architecture_projects WHERE status IN ('design', 'development', 'testing')) as active_projects,
    (SELECT COUNT(*) FROM pm_architecture_projects WHERE health_status = 'red') as at_risk_projects,
    (SELECT SUM(total_budget) FROM pm_architecture_projects WHERE status NOT IN ('completed', 'cancelled')) as total_active_budget,
    (SELECT COUNT(*) FROM pm_architecture_milestones WHERE status = 'delayed') as delayed_milestones,
    (SELECT COUNT(*) FROM pm_architecture_dependencies WHERE status = 'blocked') as blocked_dependencies;

CREATE OR REPLACE VIEW se_dashboard AS
SELECT 
    (SELECT COUNT(*) FROM se_implementation_tasks WHERE status = 'in_progress') as tasks_in_progress,
    (SELECT COUNT(*) FROM se_implementation_tasks WHERE status = 'code_review') as tasks_in_review,
    (SELECT COUNT(*) FROM se_implementation_tasks WHERE status = 'blocked') as blocked_tasks,
    (SELECT COUNT(*) FROM se_architecture_questions WHERE status = 'open' AND is_blocking = true) as blocking_questions,
    (SELECT AVG(code_quality_score) FROM se_code_reviews WHERE review_date >= CURRENT_DATE - INTERVAL '30 days') as avg_code_quality;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE sa_solution_designs IS 'Solution Architect: Solution design documents and proposals';
COMMENT ON TABLE sa_design_reviews IS 'Solution Architect: Design review feedback and decisions';
COMMENT ON TABLE sa_solution_patterns IS 'Solution Architect: Reusable solution patterns library';
COMMENT ON TABLE ta_technical_specifications IS 'Technical Architect: Detailed technical specifications';
COMMENT ON TABLE ta_technology_evaluations IS 'Technical Architect: Technology evaluation and recommendations';
COMMENT ON TABLE ta_architecture_debt IS 'Technical Architect: Architecture and technical debt tracking';
COMMENT ON TABLE pm_architecture_projects IS 'Project Manager: Architecture project management';
COMMENT ON TABLE pm_architecture_milestones IS 'Project Manager: Project milestones and gates';
COMMENT ON TABLE pm_architecture_dependencies IS 'Project Manager: Project dependencies tracking';
COMMENT ON TABLE se_implementation_tasks IS 'Software Engineer: Implementation tasks and assignments';
COMMENT ON TABLE se_code_reviews IS 'Software Engineer: Code review feedback and quality';
COMMENT ON TABLE se_architecture_questions IS 'Software Engineer: Architecture questions and answers';
COMMENT ON TABLE role_collaboration_sessions IS 'Cross-role collaboration and meetings';
