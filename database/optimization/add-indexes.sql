-- Database Query Optimization Script
-- Purpose: Identify and add missing indexes, optimize slow queries
-- Run: psql -h localhost -p 5432 -U postgres -d iac_db -f database/optimization/add-indexes.sql

\timing on
\echo '🔍 Starting Database Optimization...'
\echo ''

-- =====================================================
-- PART 1: CREATE MISSING INDEXES
-- =====================================================

\echo '📊 Creating Performance Indexes...'

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status) WHERE status = 'active';

-- Blueprints table indexes
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_provider ON blueprints(provider);
CREATE INDEX IF NOT EXISTS idx_blueprints_status ON blueprints(status);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_at ON blueprints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_user_status ON blueprints(user_id, status);
CREATE INDEX IF NOT EXISTS idx_blueprints_name_search ON blueprints USING gin(to_tsvector('english', name));

-- Infrastructure table indexes
CREATE INDEX IF NOT EXISTS idx_infrastructure_blueprint_id ON infrastructure(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_infrastructure_provider ON infrastructure(provider);
CREATE INDEX IF NOT EXISTS idx_infrastructure_status ON infrastructure(status);
CREATE INDEX IF NOT EXISTS idx_infrastructure_created_at ON infrastructure(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_infrastructure_blueprint_status ON infrastructure(blueprint_id, status);

-- Deployments table indexes
CREATE INDEX IF NOT EXISTS idx_deployments_infrastructure_id ON deployments(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_deployments_user_id ON deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_created_at ON deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_started_at ON deployments(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_user_status ON deployments(user_id, status);

-- Resources table indexes
CREATE INDEX IF NOT EXISTS idx_resources_infrastructure_id ON resources(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_infra_type ON resources(infrastructure_id, type);

-- Cost analysis table indexes
CREATE INDEX IF NOT EXISTS idx_cost_analysis_infrastructure_id ON cost_analysis(infrastructure_id);
CREATE INDEX IF NOT EXISTS idx_cost_analysis_period ON cost_analysis(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_cost_analysis_created_at ON cost_analysis(created_at DESC);

-- Audit logs table indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- Sessions table indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at) WHERE expires_at > NOW();

-- API Keys table indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status) WHERE status = 'active';

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

\echo '✅ Performance indexes created'
\echo ''

-- =====================================================
-- PART 2: CREATE COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

\echo '📊 Creating Composite Indexes...'

-- Common query: Get user's blueprints with filters
CREATE INDEX IF NOT EXISTS idx_blueprints_user_status_created 
ON blueprints(user_id, status, created_at DESC);

-- Common query: Get infrastructure with deployments
CREATE INDEX IF NOT EXISTS idx_deployments_infra_status_started 
ON deployments(infrastructure_id, status, started_at DESC);

-- Common query: Get resources by infrastructure and type
CREATE INDEX IF NOT EXISTS idx_resources_infra_type_status 
ON resources(infrastructure_id, type, status);

-- Common query: Audit trail for specific resource
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_timestamp 
ON audit_logs(resource_type, resource_id, timestamp DESC);

-- Common query: Active sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_active 
ON sessions(user_id, expires_at DESC) WHERE expires_at > NOW();

\echo '✅ Composite indexes created'
\echo ''

-- =====================================================
-- PART 3: CREATE PARTIAL INDEXES FOR OPTIMIZATION
-- =====================================================

\echo '📊 Creating Partial Indexes...'

-- Only index active blueprints
CREATE INDEX IF NOT EXISTS idx_blueprints_active 
ON blueprints(user_id, created_at DESC) WHERE status = 'active';

-- Only index running deployments
CREATE INDEX IF NOT EXISTS idx_deployments_running 
ON deployments(infrastructure_id, started_at DESC) WHERE status = 'running';

-- Only index failed deployments for monitoring
CREATE INDEX IF NOT EXISTS idx_deployments_failed 
ON deployments(infrastructure_id, started_at DESC) WHERE status = 'failed';

-- Only index unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, created_at DESC) WHERE read = false;

\echo '✅ Partial indexes created'
\echo ''

-- =====================================================
-- PART 4: ANALYZE TABLES FOR QUERY PLANNER
-- =====================================================

\echo '📊 Analyzing Tables...'

ANALYZE users;
ANALYZE blueprints;
ANALYZE infrastructure;
ANALYZE deployments;
ANALYZE resources;
ANALYZE cost_analysis;
ANALYZE audit_logs;
ANALYZE sessions;
ANALYZE api_keys;
ANALYZE notifications;

\echo '✅ Table statistics updated'
\echo ''

-- =====================================================
-- PART 5: SHOW INDEX USAGE STATISTICS
-- =====================================================

\echo '📊 Index Usage Statistics:'
\echo ''

SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as "Index Scans",
    idx_tup_read as "Tuples Read",
    idx_tup_fetch as "Tuples Fetched"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC
LIMIT 20;

\echo ''
\echo '✅ Database Optimization Complete!'
\echo ''
\echo '💡 Next Steps:'
\echo '   1. Run EXPLAIN ANALYZE on slow queries'
\echo '   2. Monitor index usage with pg_stat_user_indexes'
\echo '   3. Check for unused indexes periodically'
\echo '   4. Run VACUUM ANALYZE after bulk operations'
\echo ''
