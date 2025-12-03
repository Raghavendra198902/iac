-- Drop existing tables if they exist
DROP TABLE IF EXISTS collaboration_message_reactions CASCADE;
DROP TABLE IF EXISTS collaboration_message_attachments CASCADE;
DROP TABLE IF EXISTS collaboration_messages CASCADE;
DROP TABLE IF EXISTS collaboration_channel_members CASCADE;
DROP TABLE IF EXISTS collaboration_channels CASCADE;
DROP TABLE IF EXISTS user_status CASCADE;

-- User status tracking
CREATE TABLE user_status (
    user_id VARCHAR(100) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'away', 'busy', 'offline')),
    status_message TEXT,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration channels
CREATE TABLE collaboration_channels (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('team', 'project', 'announcement', 'direct')),
    description TEXT,
    created_by VARCHAR(100) NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Channel members
CREATE TABLE collaboration_channel_members (
    channel_id VARCHAR(50) REFERENCES collaboration_channels(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMP,
    PRIMARY KEY (channel_id, user_id)
);

-- Messages
CREATE TABLE collaboration_messages (
    id VARCHAR(50) PRIMARY KEY,
    channel_id VARCHAR(50) REFERENCES collaboration_channels(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'code', 'system', 'file')),
    content TEXT NOT NULL,
    reply_to VARCHAR(50),
    mentions TEXT[], -- Array of user IDs
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message attachments
CREATE TABLE collaboration_message_attachments (
    id VARCHAR(50) PRIMARY KEY,
    message_id VARCHAR(50) REFERENCES collaboration_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Message reactions
CREATE TABLE collaboration_message_reactions (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(50) REFERENCES collaboration_messages(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id, emoji)
);

-- Indexes
CREATE INDEX idx_channels_type ON collaboration_channels(type);
CREATE INDEX idx_channels_created_at ON collaboration_channels(created_at);
CREATE INDEX idx_messages_channel ON collaboration_messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_user ON collaboration_messages(user_id);
CREATE INDEX idx_reactions_message ON collaboration_message_reactions(message_id);
CREATE INDEX idx_user_status_status ON user_status(status);

-- Insert demo data
INSERT INTO user_status (user_id, user_name, user_email, status, status_message) VALUES
('user1', 'Sarah Johnson', 'sarah@example.com', 'online', 'Working on AWS deployment'),
('user2', 'Mike Chen', 'mike@example.com', 'online', NULL),
('user3', 'Emily Davis', 'emily@example.com', 'away', 'In a meeting'),
('user4', 'David Park', 'david@example.com', 'busy', 'Do not disturb'),
('user5', 'Lisa Anderson', 'lisa@example.com', 'online', NULL),
('user6', 'James Wilson', 'james@example.com', 'offline', NULL);

INSERT INTO collaboration_channels (id, name, type, description, created_by, is_pinned) VALUES
('ch-general', 'general', 'team', 'General team discussions', 'admin', TRUE),
('ch-aws-infra', 'aws-infrastructure', 'project', 'AWS infrastructure discussions', 'user1', FALSE),
('ch-security', 'security-alerts', 'announcement', 'Security alerts and updates', 'admin', TRUE),
('ch-devops', 'devops-team', 'team', 'DevOps team collaboration', 'user3', FALSE),
('ch-cost', 'cost-optimization', 'project', 'Cost optimization strategies', 'user6', FALSE);

INSERT INTO collaboration_channel_members (channel_id, user_id, user_name) VALUES
('ch-general', 'user1', 'Sarah Johnson'),
('ch-general', 'user2', 'Mike Chen'),
('ch-general', 'user3', 'Emily Davis'),
('ch-aws-infra', 'user1', 'Sarah Johnson'),
('ch-aws-infra', 'user2', 'Mike Chen'),
('ch-aws-infra', 'user4', 'David Park'),
('ch-security', 'user1', 'Sarah Johnson'),
('ch-security', 'user2', 'Mike Chen'),
('ch-security', 'user3', 'Emily Davis'),
('ch-security', 'user4', 'David Park'),
('ch-devops', 'user1', 'Sarah Johnson'),
('ch-devops', 'user3', 'Emily Davis'),
('ch-devops', 'user5', 'Lisa Anderson'),
('ch-cost', 'user1', 'Sarah Johnson'),
('ch-cost', 'user2', 'Mike Chen'),
('ch-cost', 'user6', 'James Wilson');

INSERT INTO collaboration_messages (id, channel_id, user_id, user_name, type, content, created_at) VALUES
('msg-1', 'ch-general', 'user1', 'Sarah Johnson', 'text', 'Good morning team! Ready to tackle the AWS migration today.', NOW() - INTERVAL '2 hours'),
('msg-2', 'ch-general', 'user2', 'Mike Chen', 'text', 'Morning! I''ve prepared the terraform scripts for review.', NOW() - INTERVAL '1 hour 55 minutes'),
('msg-3', 'ch-general', 'user1', 'Sarah Johnson', 'code', 'resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
  
  tags = {
    Name = "WebServer"
    Environment = "production"
  }
}', NOW() - INTERVAL '1 hour 45 minutes'),
('msg-4', 'ch-general', 'user3', 'Emily Davis', 'text', '@Sarah Johnson Looks good! Should we add monitoring to this instance?', NOW() - INTERVAL '1 hour 40 minutes'),
('msg-5', 'ch-general', 'user1', 'Sarah Johnson', 'text', 'Yes, great idea! I''ll add CloudWatch alarms.', NOW() - INTERVAL '1 hour 35 minutes'),
('msg-6', 'ch-general', 'user4', 'David Park', 'text', 'Just reviewed the security group rules. All looks secure! 🔒', NOW() - INTERVAL '1 hour'),
('msg-7', 'ch-general', 'user2', 'Mike Chen', 'text', 'Deployment is progressing smoothly. ETA: 30 minutes', NOW() - INTERVAL '30 minutes'),
('msg-8', 'ch-general', 'user1', 'Sarah Johnson', 'text', 'Great work on the infrastructure deployment! Everything is running perfectly.', NOW() - INTERVAL '15 minutes'),
('msg-9', 'ch-aws-infra', 'user2', 'Mike Chen', 'text', 'Just deployed the new EKS cluster', NOW() - INTERVAL '10 minutes'),
('msg-10', 'ch-aws-infra', 'user1', 'Sarah Johnson', 'text', 'Excellent! I''ll start configuring the node groups.', NOW() - INTERVAL '5 minutes'),
('msg-11', 'ch-security', 'system', 'System', 'system', 'New security patch available for production', NOW() - INTERVAL '4 hours'),
('msg-12', 'ch-devops', 'user5', 'Emily Davis', 'text', 'CI/CD pipeline is running smoothly', NOW() - INTERVAL '3 hours'),
('msg-13', 'ch-cost', 'user6', 'James Wilson', 'text', 'Found opportunities to save $5k/month', NOW() - INTERVAL '2 hours');

-- Set mentions for message 4
UPDATE collaboration_messages SET mentions = ARRAY['user1'] WHERE id = 'msg-4';

-- Set reply_to for message 5
UPDATE collaboration_messages SET reply_to = 'msg-4' WHERE id = 'msg-5';

INSERT INTO collaboration_message_reactions (message_id, user_id, emoji) VALUES
('msg-2', 'user1', '👍'),
('msg-2', 'user3', '👍'),
('msg-6', 'user1', '✅'),
('msg-6', 'user2', '✅'),
('msg-6', 'user3', '✅'),
('msg-6', 'user1', '🔒');

-- Triggers
CREATE OR REPLACE FUNCTION update_collaboration_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_channels_timestamp BEFORE UPDATE ON collaboration_channels
    FOR EACH ROW EXECUTE FUNCTION update_collaboration_timestamp();

CREATE TRIGGER update_messages_timestamp BEFORE UPDATE ON collaboration_messages
    FOR EACH ROW EXECUTE FUNCTION update_collaboration_timestamp();

CREATE TRIGGER update_user_status_timestamp BEFORE UPDATE ON user_status
    FOR EACH ROW EXECUTE FUNCTION update_collaboration_timestamp();

-- Comments
COMMENT ON TABLE collaboration_channels IS 'Team collaboration channels for chat and messaging';
COMMENT ON TABLE collaboration_messages IS 'Messages sent in collaboration channels';
COMMENT ON TABLE user_status IS 'Online status and presence information for users';
