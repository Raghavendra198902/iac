-- Migration: Fix token column length issue
-- Date: 2025-12-08
-- Issue: JWT tokens with many roles/permissions exceed VARCHAR(500) limit
-- Solution: Change token columns from VARCHAR(500) to TEXT

-- Drop constraints temporarily
ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS user_sessions_token_key;
ALTER TABLE user_sessions DROP CONSTRAINT IF EXISTS user_sessions_refresh_token_key;

-- Modify token columns to TEXT
ALTER TABLE user_sessions 
    ALTER COLUMN token TYPE TEXT,
    ALTER COLUMN refresh_token TYPE TEXT;

-- Recreate unique constraints
ALTER TABLE user_sessions 
    ADD CONSTRAINT user_sessions_token_key UNIQUE (token),
    ADD CONSTRAINT user_sessions_refresh_token_key UNIQUE (refresh_token);

-- Add index for better performance on token lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_refresh_token ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_active ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Clean up expired sessions (older than 7 days)
DELETE FROM user_sessions WHERE expires_at < NOW() - INTERVAL '7 days';

COMMENT ON COLUMN user_sessions.token IS 'JWT access token - TEXT type to support large payloads with roles/permissions';
COMMENT ON COLUMN user_sessions.refresh_token IS 'JWT refresh token - TEXT type for consistency';
