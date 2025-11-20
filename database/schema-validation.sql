-- ============================================================================
-- IAC Dharma Database Schema Validation Report
-- ============================================================================
-- Generated: November 16, 2025
-- Purpose: Verify database schema integrity and document actual structure
-- ============================================================================

\echo '╔════════════════════════════════════════════════════════════════════════════╗'
\echo '║              IAC DHARMA - DATABASE SCHEMA VALIDATION REPORT                ║'
\echo '╚════════════════════════════════════════════════════════════════════════════╝'
\echo ''

-- ============================================================================
-- 1. TABLE COUNT VERIFICATION
-- ============================================================================
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 1. TABLE INVENTORY                                                       │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Total Tables' AS metric,
    COUNT(*) AS count
FROM pg_tables 
WHERE schemaname = 'public';

\echo ''
\echo 'Tables by Category:'
SELECT 
    CASE 
        WHEN tablename LIKE 'ai_%' THEN 'SA - AI/Recommendations'
        WHEN tablename LIKE 'guardrail%' OR tablename LIKE 'iac_%' THEN 'TA - Guardrails/IaC'
        WHEN tablename LIKE 'budget%' OR tablename LIKE 'deployment%' OR tablename LIKE 'kpi_%' 
             OR tablename = 'cloud_migrations' THEN 'PM - Project Management'
        WHEN tablename LIKE 'incident%' OR tablename LIKE 'health%' OR tablename = 'service_health_checks' 
             OR tablename = 'infrastructure_metrics' THEN 'SE - Site Engineering'
        WHEN tablename LIKE 'governance%' OR tablename LIKE 'compliance%' OR tablename LIKE 'policy%'
             OR tablename LIKE 'architecture%' OR tablename LIKE 'cost_optimization%' 
             OR tablename LIKE 'pattern%' THEN 'EA - Enterprise Architecture'
        WHEN tablename IN ('blueprints', 'blueprint_versions', 'blueprint_diffs', 'components', 'relations') 
             THEN 'SA - Blueprints'
        WHEN tablename IN ('tenants', 'users', 'user_roles', 'roles', 'projects', 'environments', 'templates', 
                          'approval_history', 'migration_workloads', 'migration_risks') 
             THEN 'Core - Foundation'
        ELSE 'Other'
    END AS category,
    COUNT(*) AS table_count
FROM pg_tables 
WHERE schemaname = 'public'
GROUP BY category
ORDER BY category;

-- ============================================================================
-- 2. INDEX VERIFICATION
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 2. INDEX COVERAGE                                                        │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Total Indexes' AS metric,
    COUNT(*) AS count
FROM pg_indexes 
WHERE schemaname = 'public';

\echo ''
\echo 'Key Index Types:'
SELECT 
    CASE 
        WHEN indexname LIKE 'idx_%_tenant%' OR indexname LIKE '%_tenant_id_%' THEN 'Tenant Isolation'
        WHEN indexname LIKE '%_pkey' THEN 'Primary Keys'
        WHEN indexname LIKE 'idx_%_status%' OR indexname LIKE 'idx_%_state%' THEN 'Status/State'
        WHEN indexname LIKE 'idx_%_created%' OR indexname LIKE 'idx_%_updated%' THEN 'Timestamps'
        WHEN indexname LIKE 'idx_%_type%' OR indexname LIKE 'idx_%_category%' THEN 'Classification'
        ELSE 'Other Indexes'
    END AS index_type,
    COUNT(*) AS index_count
FROM pg_indexes 
WHERE schemaname = 'public'
GROUP BY index_type
ORDER BY index_count DESC;

-- ============================================================================
-- 3. FOREIGN KEY CONSTRAINTS
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 3. FOREIGN KEY CONSTRAINTS                                               │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Total Foreign Keys' AS metric,
    COUNT(*) AS count
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_schema = 'public';

\echo ''
\echo 'Foreign Keys by Referenced Table (Top 10):'
SELECT 
    ccu.table_name AS referenced_table,
    COUNT(*) AS fk_count
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
GROUP BY referenced_table
ORDER BY fk_count DESC
LIMIT 10;

-- ============================================================================
-- 4. CHECK CONSTRAINTS (Data Integrity)
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 4. CHECK CONSTRAINTS (Data Validation)                                   │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Total Check Constraints' AS metric,
    COUNT(*) AS count
FROM information_schema.table_constraints 
WHERE constraint_type = 'CHECK' 
  AND table_schema = 'public';

\echo ''
\echo 'Tables with Most Check Constraints:'
SELECT 
    table_name,
    COUNT(*) AS check_count
FROM information_schema.table_constraints 
WHERE constraint_type = 'CHECK' 
  AND table_schema = 'public'
GROUP BY table_name
ORDER BY check_count DESC
LIMIT 10;

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 5. TRIGGERS (Automation)                                                 │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Total Triggers' AS metric,
    COUNT(*) AS count
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

\echo ''
\echo 'Trigger Functions:'
SELECT DISTINCT
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- ============================================================================
-- 6. COLUMN STATISTICS
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 6. COLUMN STATISTICS                                                     │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Total Columns' AS metric,
    COUNT(*) AS count
FROM information_schema.columns 
WHERE table_schema = 'public';

\echo ''
\echo 'Common Column Patterns:'
SELECT 
    column_name,
    COUNT(*) AS occurrence_count
FROM information_schema.columns 
WHERE table_schema = 'public'
GROUP BY column_name
HAVING COUNT(*) >= 5
ORDER BY occurrence_count DESC
LIMIT 15;

-- ============================================================================
-- 7. DATA TYPE DISTRIBUTION
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 7. DATA TYPE DISTRIBUTION                                                │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    data_type,
    COUNT(*) AS column_count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM information_schema.columns 
WHERE table_schema = 'public'
GROUP BY data_type
ORDER BY column_count DESC;

-- ============================================================================
-- 8. TENANT ISOLATION VERIFICATION
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 8. TENANT ISOLATION (Multi-tenancy)                                      │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Tables with tenant_id' AS metric,
    COUNT(*) AS count
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND column_name = 'tenant_id';

\echo ''
\echo 'Tables WITHOUT tenant_id (should be few):'
SELECT tablename
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename NOT IN (
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND column_name = 'tenant_id'
  )
ORDER BY tablename;

-- ============================================================================
-- 9. TIMESTAMP COLUMNS (Audit Trail)
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 9. AUDIT TRAIL (Timestamp Columns)                                       │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Tables with created_at' AS metric,
    COUNT(DISTINCT table_name) AS count
FROM information_schema.columns 
WHERE table_schema = 'public' AND column_name = 'created_at'
UNION ALL
SELECT 
    'Tables with updated_at' AS metric,
    COUNT(DISTINCT table_name) AS count
FROM information_schema.columns 
WHERE table_schema = 'public' AND column_name = 'updated_at'
UNION ALL
SELECT 
    'Tables with deleted_at' AS metric,
    COUNT(DISTINCT table_name) AS count
FROM information_schema.columns 
WHERE table_schema = 'public' AND column_name = 'deleted_at';

-- ============================================================================
-- 10. JSONB USAGE (Flexible Schema)
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 10. JSONB COLUMNS (Flexible Data)                                        │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Total JSONB Columns' AS metric,
    COUNT(*) AS count
FROM information_schema.columns 
WHERE table_schema = 'public' AND data_type = 'jsonb';

\echo ''
\echo 'Tables with JSONB columns:'
SELECT 
    table_name,
    COUNT(*) AS jsonb_column_count,
    STRING_AGG(column_name, ', ') AS jsonb_columns
FROM information_schema.columns 
WHERE table_schema = 'public' AND data_type = 'jsonb'
GROUP BY table_name
ORDER BY jsonb_column_count DESC;

-- ============================================================================
-- 11. NEW TABLES FROM MIGRATION 004
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 11. MIGRATION 004 VALIDATION (New Tables)                                │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

\echo 'TA Tables (Guardrails & IaC):'
SELECT tablename, 
       CASE WHEN tablename IN (
         'guardrails_rules', 'guardrail_violations', 'guardrail_violation_overrides', 
         'guardrail_audit_log', 'iac_templates', 'iac_generations', 
         'iac_validation_results', 'iac_cost_estimates'
       ) THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'guardrails_rules', 'guardrail_violations', 'guardrail_violation_overrides', 
    'guardrail_audit_log', 'iac_templates', 'iac_generations', 
    'iac_validation_results', 'iac_cost_estimates'
  )
UNION ALL
SELECT 'guardrails_rules', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guardrails_rules')
UNION ALL
SELECT 'guardrail_violations', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guardrail_violations')
UNION ALL
SELECT 'guardrail_violation_overrides', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guardrail_violation_overrides')
UNION ALL
SELECT 'guardrail_audit_log', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'guardrail_audit_log')
UNION ALL
SELECT 'iac_templates', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'iac_templates')
UNION ALL
SELECT 'iac_generations', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'iac_generations')
UNION ALL
SELECT 'iac_validation_results', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'iac_validation_results')
UNION ALL
SELECT 'iac_cost_estimates', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'iac_cost_estimates');

\echo ''
\echo 'SA Tables (AI Recommendations):'
SELECT tablename,
       CASE WHEN tablename IN (
         'ai_analyses', 'ai_optimizations', 'ai_comparisons', 
         'ai_feedback', 'ai_cost_predictions', 'ai_risk_analyses'
       ) THEN '✓ EXISTS' ELSE '✗ MISSING' END AS status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'ai_analyses', 'ai_optimizations', 'ai_comparisons', 
    'ai_feedback', 'ai_cost_predictions', 'ai_risk_analyses'
  )
UNION ALL
SELECT 'ai_analyses', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_analyses')
UNION ALL
SELECT 'ai_optimizations', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_optimizations')
UNION ALL
SELECT 'ai_comparisons', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_comparisons')
UNION ALL
SELECT 'ai_feedback', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_feedback')
UNION ALL
SELECT 'ai_cost_predictions', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_cost_predictions')
UNION ALL
SELECT 'ai_risk_analyses', '✗ MISSING' WHERE NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'ai_risk_analyses');

\echo ''
\echo 'Blueprint Columns Added:'
SELECT 
    column_name,
    data_type,
    CASE WHEN is_nullable = 'YES' THEN 'NULL' ELSE 'NOT NULL' END AS nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'blueprints'
  AND column_name IN ('category', 'provider', 'components', 'status', 'version', 'tags', 'tenant_id')
ORDER BY ordinal_position;

-- ============================================================================
-- 12. SCHEMA HEALTH INDICATORS
-- ============================================================================
\echo ''
\echo '┌──────────────────────────────────────────────────────────────────────────┐'
\echo '│ 12. SCHEMA HEALTH SUMMARY                                                │'
\echo '└──────────────────────────────────────────────────────────────────────────┘'

SELECT 
    'Tables' AS component,
    COUNT(*) AS total,
    'Expected: 53' AS expectation
FROM pg_tables WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Indexes',
    COUNT(*),
    'High coverage'
FROM pg_indexes WHERE schemaname = 'public'
UNION ALL
SELECT 
    'Foreign Keys',
    COUNT(*),
    'Referential integrity'
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
UNION ALL
SELECT 
    'Check Constraints',
    COUNT(*),
    'Data validation'
FROM information_schema.table_constraints 
WHERE constraint_type = 'CHECK' AND table_schema = 'public'
UNION ALL
SELECT 
    'Triggers',
    COUNT(*),
    'Automation'
FROM information_schema.triggers WHERE trigger_schema = 'public';

\echo ''
\echo '════════════════════════════════════════════════════════════════════════════'
\echo 'Schema Validation Complete!'
\echo '════════════════════════════════════════════════════════════════════════════'
