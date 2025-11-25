-- Seed data for EA Strategy

-- Insert sample architecture principles
INSERT INTO ea_principles (name, description, category, status, impact, compliance) VALUES
('Cloud-First Strategy', 'Prioritize cloud-native solutions for new initiatives', 'Technology', 'active', 'high', 98),
('API-First Design', 'All services must expose well-documented APIs', 'Integration', 'active', 'high', 95),
('Security by Design', 'Security controls integrated from the beginning', 'Security', 'active', 'critical', 92),
('Data Sovereignty', 'Data residency requirements must be met', 'Compliance', 'active', 'high', 100),
('Microservices Architecture', 'Decompose monoliths into independent services', 'Technology', 'active', 'medium', 67);

-- Insert sample strategic goals
INSERT INTO ea_strategic_goals (title, description, progress, timeline, initiatives, budget, status) VALUES
('Digital Transformation', 'Transform core business processes with digital technologies', 75, 'Q1 2025 - Q4 2026', 12, '$2.5M', 'on-track'),
('Cloud Migration', 'Migrate legacy applications to cloud infrastructure', 60, 'Q2 2025 - Q2 2026', 8, '$1.8M', 'on-track'),
('Legacy Modernization', 'Modernize and refactor legacy systems', 45, 'Q3 2025 - Q4 2026', 6, '$3.2M', 'at-risk'),
('Data Platform', 'Build unified data platform for analytics', 85, 'Q1 2025 - Q3 2025', 4, '$1.2M', 'ahead');

-- Insert sample governance committees
INSERT INTO ea_governance_committees (name, description, members, frequency, last_meeting, chair_name) VALUES
('Architecture Review Board', 'Reviews and approves architecture decisions', 12, 'Bi-weekly', '2 days ago', 'John Smith'),
('Technical Standards Committee', 'Defines and maintains technical standards', 8, 'Monthly', '1 week ago', 'Sarah Johnson'),
('Security Council', 'Oversees security policies and compliance', 6, 'Weekly', 'Yesterday', 'Michael Chen'),
('Data Governance Board', 'Manages data policies and quality standards', 10, 'Monthly', '3 days ago', 'Emma Williams');
