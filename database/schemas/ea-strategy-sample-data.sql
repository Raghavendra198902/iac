-- Comprehensive sample data for EA Strategy

-- First, get the committee IDs (we'll need these for related records)
-- Note: These will be inserted after committees are created

-- Insert more architecture principles
INSERT INTO ea_principles (name, description, category, status, impact, compliance) VALUES
('Zero Trust Security', 'Implement zero trust security model across all systems', 'Security', 'active', 'critical', 88),
('Data Privacy First', 'Ensure data privacy compliance in all solutions', 'Compliance', 'active', 'critical', 95),
('Automation by Default', 'Automate repetitive tasks and processes', 'Technology', 'active', 'high', 78),
('Observability Standard', 'All services must implement comprehensive monitoring', 'Technology', 'active', 'high', 82),
('Cost Optimization', 'Design for cost efficiency and resource optimization', 'Technology', 'active', 'medium', 71),
('Resilience & Reliability', 'Build fault-tolerant and highly available systems', 'Technology', 'active', 'critical', 90),
('Developer Experience', 'Prioritize developer productivity and satisfaction', 'Technology', 'active', 'medium', 75),
('Green Computing', 'Minimize environmental impact of IT operations', 'Compliance', 'draft', 'medium', 45),
('Open Source First', 'Prefer open source solutions when appropriate', 'Technology', 'active', 'medium', 65),
('Mobile First Design', 'Design for mobile experiences as primary interface', 'Technology', 'active', 'high', 80),
('Vendor Neutrality', 'Avoid vendor lock-in through abstraction layers', 'Technology', 'active', 'high', 70);

-- Insert more strategic goals
INSERT INTO ea_strategic_goals (title, description, progress, timeline, initiatives, budget, status) VALUES
('AI/ML Integration', 'Integrate AI and ML capabilities across products', 35, 'Q4 2025 - Q4 2026', 15, '$4.2M', 'on-track'),
('Customer Experience Platform', 'Build unified customer experience platform', 55, 'Q1 2025 - Q2 2026', 10, '$2.8M', 'on-track'),
('Zero Downtime Deployments', 'Achieve zero-downtime deployment capability', 70, 'Q2 2025 - Q4 2025', 5, '$800K', 'ahead'),
('Multi-Region Expansion', 'Expand to 5 new geographic regions', 25, 'Q3 2025 - Q2 2027', 20, '$6.5M', 'at-risk'),
('API Marketplace', 'Launch public API marketplace', 40, 'Q1 2026 - Q3 2026', 7, '$1.5M', 'on-track'),
('Green IT Initiative', 'Reduce carbon footprint by 50%', 30, 'Q1 2025 - Q4 2026', 8, '$900K', 'on-track'),
('Skills Development', 'Upskill 80% of engineering team', 60, 'Q1 2025 - Q4 2025', 12, '$500K', 'ahead'),
('Technical Debt Reduction', 'Reduce technical debt by 40%', 50, 'Q2 2025 - Q4 2026', 18, '$2.1M', 'on-track');

-- Insert more governance committees
INSERT INTO ea_governance_committees (name, description, members, frequency, last_meeting, chair_name) VALUES
('Cloud Governance Committee', 'Oversees cloud strategy and spending', 8, 'Bi-weekly', '5 days ago', 'Robert Taylor'),
('Innovation Council', 'Evaluates and sponsors innovative initiatives', 10, 'Monthly', '2 weeks ago', 'Jennifer Lee'),
('Compliance & Audit Board', 'Ensures regulatory compliance', 7, 'Monthly', '1 week ago', 'David Martinez');

-- Insert committee members for existing committees
-- Architecture Review Board members
DO $$
DECLARE
    arb_id UUID;
    tsc_id UUID;
    sc_id UUID;
    dgb_id UUID;
    cgc_id UUID;
    ic_id UUID;
    cab_id UUID;
BEGIN
    -- Get committee IDs
    SELECT id INTO arb_id FROM ea_governance_committees WHERE name = 'Architecture Review Board';
    SELECT id INTO tsc_id FROM ea_governance_committees WHERE name = 'Technical Standards Committee';
    SELECT id INTO sc_id FROM ea_governance_committees WHERE name = 'Security Council';
    SELECT id INTO dgb_id FROM ea_governance_committees WHERE name = 'Data Governance Board';
    SELECT id INTO cgc_id FROM ea_governance_committees WHERE name = 'Cloud Governance Committee';
    SELECT id INTO ic_id FROM ea_governance_committees WHERE name = 'Innovation Council';
    SELECT id INTO cab_id FROM ea_governance_committees WHERE name = 'Compliance & Audit Board';

    -- Architecture Review Board members
    IF arb_id IS NOT NULL THEN
        INSERT INTO ea_committee_members (committee_id, name, role, status) VALUES
        (arb_id, 'John Smith', 'Chair', 'active'),
        (arb_id, 'Sarah Johnson', 'Member', 'active'),
        (arb_id, 'Michael Chen', 'Member', 'active'),
        (arb_id, 'Emma Williams', 'Member', 'active'),
        (arb_id, 'David Brown', 'Member', 'active'),
        (arb_id, 'Lisa Anderson', 'Member', 'active'),
        (arb_id, 'James Wilson', 'Member', 'active'),
        (arb_id, 'Maria Garcia', 'Member', 'active'),
        (arb_id, 'Robert Taylor', 'Member', 'active'),
        (arb_id, 'Jennifer Lee', 'Member', 'active'),
        (arb_id, 'Thomas Moore', 'Member', 'active'),
        (arb_id, 'Patricia White', 'Secretary', 'active');
    END IF;

    -- Technical Standards Committee members
    IF tsc_id IS NOT NULL THEN
        INSERT INTO ea_committee_members (committee_id, name, role, status) VALUES
        (tsc_id, 'Sarah Johnson', 'Chair', 'active'),
        (tsc_id, 'Michael Chen', 'Vice Chair', 'active'),
        (tsc_id, 'David Brown', 'Member', 'active'),
        (tsc_id, 'James Wilson', 'Member', 'active'),
        (tsc_id, 'Robert Taylor', 'Member', 'active'),
        (tsc_id, 'Thomas Moore', 'Member', 'active'),
        (tsc_id, 'Kevin Martinez', 'Member', 'active'),
        (tsc_id, 'Amanda Clark', 'Secretary', 'active');
    END IF;

    -- Security Council members
    IF sc_id IS NOT NULL THEN
        INSERT INTO ea_committee_members (committee_id, name, role, status) VALUES
        (sc_id, 'Michael Chen', 'Chair', 'active'),
        (sc_id, 'Lisa Anderson', 'Vice Chair', 'active'),
        (sc_id, 'Robert Taylor', 'Member', 'active'),
        (sc_id, 'Kevin Martinez', 'Member', 'active'),
        (sc_id, 'Rachel Adams', 'Member', 'active'),
        (sc_id, 'Steven Harris', 'Secretary', 'active');
    END IF;

    -- Data Governance Board members
    IF dgb_id IS NOT NULL THEN
        INSERT INTO ea_committee_members (committee_id, name, role, status) VALUES
        (dgb_id, 'Emma Williams', 'Chair', 'active'),
        (dgb_id, 'Patricia White', 'Vice Chair', 'active'),
        (dgb_id, 'Maria Garcia', 'Member', 'active'),
        (dgb_id, 'Jennifer Lee', 'Member', 'active'),
        (dgb_id, 'Amanda Clark', 'Member', 'active'),
        (dgb_id, 'Rachel Adams', 'Member', 'active'),
        (dgb_id, 'Daniel Cooper', 'Member', 'active'),
        (dgb_id, 'Michelle Turner', 'Member', 'active'),
        (dgb_id, 'Christopher King', 'Member', 'active'),
        (dgb_id, 'Nancy Parker', 'Secretary', 'active');
    END IF;

    -- Cloud Governance Committee members
    IF cgc_id IS NOT NULL THEN
        INSERT INTO ea_committee_members (committee_id, name, role, status) VALUES
        (cgc_id, 'Robert Taylor', 'Chair', 'active'),
        (cgc_id, 'James Wilson', 'Vice Chair', 'active'),
        (cgc_id, 'Thomas Moore', 'Member', 'active'),
        (cgc_id, 'Kevin Martinez', 'Member', 'active'),
        (cgc_id, 'Steven Harris', 'Member', 'active'),
        (cgc_id, 'Daniel Cooper', 'Member', 'active'),
        (cgc_id, 'Christopher King', 'Member', 'active'),
        (cgc_id, 'George Nelson', 'Secretary', 'active');
    END IF;

    -- Innovation Council members
    IF ic_id IS NOT NULL THEN
        INSERT INTO ea_committee_members (committee_id, name, role, status) VALUES
        (ic_id, 'Jennifer Lee', 'Chair', 'active'),
        (ic_id, 'John Smith', 'Member', 'active'),
        (ic_id, 'Emma Williams', 'Member', 'active'),
        (ic_id, 'Maria Garcia', 'Member', 'active'),
        (ic_id, 'Amanda Clark', 'Member', 'active'),
        (ic_id, 'Michelle Turner', 'Member', 'active'),
        (ic_id, 'Daniel Cooper', 'Member', 'active'),
        (ic_id, 'Nancy Parker', 'Member', 'active'),
        (ic_id, 'George Nelson', 'Member', 'active'),
        (ic_id, 'Barbara Scott', 'Secretary', 'active');
    END IF;

    -- Compliance & Audit Board members
    IF cab_id IS NOT NULL THEN
        INSERT INTO ea_committee_members (committee_id, name, role, status) VALUES
        (cab_id, 'David Martinez', 'Chair', 'active'),
        (cab_id, 'Patricia White', 'Vice Chair', 'active'),
        (cab_id, 'Lisa Anderson', 'Member', 'active'),
        (cab_id, 'Rachel Adams', 'Member', 'active'),
        (cab_id, 'Steven Harris', 'Member', 'active'),
        (cab_id, 'Nancy Parker', 'Member', 'active'),
        (cab_id, 'Barbara Scott', 'Secretary', 'active');
    END IF;

    -- Insert committee decisions
    IF arb_id IS NOT NULL THEN
        INSERT INTO ea_committee_decisions (committee_id, title, description, status, decision_date) VALUES
        (arb_id, 'Cloud Migration Strategy', 'Approved migration plan for core services to AWS with 18-month timeline', 'approved', '2025-11-20'),
        (arb_id, 'Microservices Architecture Standard', 'Adopted microservices as standard for new applications', 'approved', '2025-11-15'),
        (arb_id, 'API Gateway Selection', 'Selected Kong as enterprise API gateway solution', 'approved', '2025-10-28'),
        (arb_id, 'Database Standardization', 'PostgreSQL approved as primary relational database', 'approved', '2025-10-15'),
        (arb_id, 'Container Orchestration', 'Kubernetes selected for container orchestration', 'approved', '2025-09-20');
    END IF;

    IF tsc_id IS NOT NULL THEN
        INSERT INTO ea_committee_decisions (committee_id, title, description, status, decision_date) VALUES
        (tsc_id, 'Code Review Standards', 'Mandatory peer review for all production code', 'approved', '2025-11-18'),
        (tsc_id, 'Testing Requirements', 'Minimum 80% code coverage for critical systems', 'approved', '2025-11-10'),
        (tsc_id, 'Documentation Standard', 'OpenAPI 3.0 for all REST APIs', 'approved', '2025-10-22');
    END IF;

    IF sc_id IS NOT NULL THEN
        INSERT INTO ea_committee_decisions (committee_id, title, description, status, decision_date) VALUES
        (sc_id, 'Security Framework Update', 'Proposed updates to enterprise security framework for 2026', 'under-review', NULL),
        (sc_id, 'Zero Trust Implementation', 'Phased rollout of zero trust architecture', 'approved', '2025-11-22'),
        (sc_id, 'Vulnerability Management', 'Enhanced vulnerability scanning and remediation process', 'approved', '2025-11-05'),
        (sc_id, 'Incident Response Plan', 'Updated incident response procedures', 'approved', '2025-10-18');
    END IF;

    IF dgb_id IS NOT NULL THEN
        INSERT INTO ea_committee_decisions (committee_id, title, description, status, decision_date) VALUES
        (dgb_id, 'Data Catalog Implementation', 'Deploy enterprise data catalog solution', 'approved', '2025-11-12'),
        (dgb_id, 'GDPR Compliance Updates', 'Enhanced data privacy controls for EU operations', 'approved', '2025-10-30'),
        (dgb_id, 'Data Quality Framework', 'Establish data quality metrics and monitoring', 'under-review', NULL);
    END IF;

    IF cgc_id IS NOT NULL THEN
        INSERT INTO ea_committee_decisions (committee_id, title, description, status, decision_date) VALUES
        (cgc_id, 'Multi-Cloud Strategy', 'Adopt multi-cloud approach with AWS and Azure', 'approved', '2025-11-08'),
        (cgc_id, 'Cost Optimization Initiative', 'Implement FinOps practices and tooling', 'approved', '2025-10-25'),
        (cgc_id, 'Cloud Security Posture', 'Deploy CSPM solution across all cloud environments', 'under-review', NULL);
    END IF;

    -- Insert upcoming meetings
    IF arb_id IS NOT NULL THEN
        INSERT INTO ea_committee_meetings (committee_id, title, meeting_date, status) VALUES
        (arb_id, 'Q4 Strategy Review', '2025-12-01 14:00:00', 'scheduled'),
        (arb_id, 'Architecture Standards Update', '2025-12-15 10:00:00', 'scheduled'),
        (arb_id, 'Tech Radar Discussion', '2026-01-05 14:00:00', 'scheduled');
    END IF;

    IF tsc_id IS NOT NULL THEN
        INSERT INTO ea_committee_meetings (committee_id, title, meeting_date, status) VALUES
        (tsc_id, 'Monthly Standards Review', '2025-12-15 10:00:00', 'scheduled'),
        (tsc_id, 'Technology Evaluation Session', '2026-01-12 14:00:00', 'scheduled');
    END IF;

    IF sc_id IS NOT NULL THEN
        INSERT INTO ea_committee_meetings (committee_id, title, meeting_date, status) VALUES
        (sc_id, 'Weekly Security Briefing', '2025-11-25 09:00:00', 'scheduled'),
        (sc_id, 'Weekly Security Briefing', '2025-12-02 09:00:00', 'scheduled'),
        (sc_id, 'Q4 Security Assessment', '2025-12-20 10:00:00', 'scheduled');
    END IF;

    IF dgb_id IS NOT NULL THEN
        INSERT INTO ea_committee_meetings (committee_id, title, meeting_date, status) VALUES
        (dgb_id, 'Monthly Governance Review', '2025-12-15 13:00:00', 'scheduled'),
        (dgb_id, 'Data Quality Workshop', '2026-01-08 10:00:00', 'scheduled');
    END IF;

    IF cgc_id IS NOT NULL THEN
        INSERT INTO ea_committee_meetings (committee_id, title, meeting_date, status) VALUES
        (cgc_id, 'Cloud Cost Review', '2025-11-29 11:00:00', 'scheduled'),
        (cgc_id, 'Multi-Cloud Strategy Discussion', '2025-12-13 14:00:00', 'scheduled');
    END IF;

    IF ic_id IS NOT NULL THEN
        INSERT INTO ea_committee_meetings (committee_id, title, meeting_date, status) VALUES
        (ic_id, 'Innovation Showcase', '2025-12-10 15:00:00', 'scheduled'),
        (ic_id, 'Q1 2026 Planning', '2026-01-15 14:00:00', 'scheduled');
    END IF;

    IF cab_id IS NOT NULL THEN
        INSERT INTO ea_committee_meetings (committee_id, title, meeting_date, status) VALUES
        (cab_id, 'Compliance Review', '2025-12-05 10:00:00', 'scheduled'),
        (cab_id, 'Annual Audit Planning', '2026-01-10 13:00:00', 'scheduled');
    END IF;

END $$;
