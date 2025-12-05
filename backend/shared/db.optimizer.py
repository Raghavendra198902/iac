"""
Database Query Optimization Analyzer for IAC Dharma v2.0
Analyzes and optimizes PostgreSQL query performance
"""

import psycopg2
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class QueryOptimizer:
    """
    Analyzes and optimizes database queries
    """
    
    def __init__(self, db_config: Dict[str, str]):
        self.db_config = db_config
        self.conn = None
    
    def connect(self) -> None:
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(**self.db_config)
            logger.info("Connected to database for optimization analysis")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    def disconnect(self) -> None:
        """Close database connection"""
        if self.conn:
            self.conn.close()
    
    def analyze_slow_queries(
        self,
        min_duration_ms: float = 1000.0,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Find slow queries from pg_stat_statements
        
        Args:
            min_duration_ms: Minimum query duration in milliseconds
            limit: Maximum number of queries to return
            
        Returns:
            List of slow queries with statistics
        """
        query = f"""
        SELECT 
            queryid,
            query,
            calls,
            total_exec_time,
            mean_exec_time,
            max_exec_time,
            stddev_exec_time,
            rows,
            shared_blks_hit,
            shared_blks_read,
            ROUND(100.0 * shared_blks_hit / 
                NULLIF(shared_blks_hit + shared_blks_read, 0), 2) as cache_hit_ratio
        FROM pg_stat_statements
        WHERE mean_exec_time > {min_duration_ms}
        ORDER BY mean_exec_time DESC
        LIMIT {limit};
        """
        
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(query)
                columns = [desc[0] for desc in cursor.description]
                results = []
                
                for row in cursor.fetchall():
                    results.append(dict(zip(columns, row)))
                
                return results
        except Exception as e:
            logger.error(f"Failed to analyze slow queries: {e}")
            return []
    
    def suggest_indexes(self, table_name: str) -> List[Dict[str, str]]:
        """
        Suggest missing indexes based on query patterns
        
        Args:
            table_name: Table to analyze
            
        Returns:
            List of index suggestions
        """
        suggestions = []
        
        # Check for missing indexes on foreign keys
        fk_query = f"""
        SELECT
            kcu.column_name,
            ccu.table_name AS foreign_table_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = '{table_name}'
            AND NOT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE tablename = '{table_name}'
                AND indexdef LIKE '%' || kcu.column_name || '%'
            );
        """
        
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(fk_query)
                
                for row in cursor.fetchall():
                    column_name = row[0]
                    suggestions.append({
                        "type": "missing_fk_index",
                        "table": table_name,
                        "column": column_name,
                        "suggestion": f"CREATE INDEX idx_{table_name}_{column_name} ON {table_name}({column_name});",
                        "reason": f"Foreign key column {column_name} lacks index"
                    })
        except Exception as e:
            logger.error(f"Failed to analyze indexes: {e}")
        
        return suggestions
    
    def analyze_table_bloat(self) -> List[Dict[str, Any]]:
        """
        Detect table and index bloat
        
        Returns:
            List of bloated tables/indexes
        """
        query = """
        SELECT
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
            pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - 
                pg_relation_size(schemaname||'.'||tablename)) AS index_size,
            n_live_tup,
            n_dead_tup,
            ROUND(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_tuple_percent
        FROM pg_stat_user_tables
        WHERE n_dead_tup > 1000
            AND n_dead_tup::float / NULLIF(n_live_tup, 0) > 0.1
        ORDER BY n_dead_tup DESC;
        """
        
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(query)
                columns = [desc[0] for desc in cursor.description]
                results = []
                
                for row in cursor.fetchall():
                    result = dict(zip(columns, row))
                    result['recommendation'] = f"VACUUM ANALYZE {result['schemaname']}.{result['tablename']};"
                    results.append(result)
                
                return results
        except Exception as e:
            logger.error(f"Failed to analyze table bloat: {e}")
            return []
    
    def analyze_connection_pool(self) -> Dict[str, Any]:
        """
        Analyze database connection usage
        
        Returns:
            Connection pool statistics
        """
        queries = {
            "total_connections": "SELECT count(*) FROM pg_stat_activity;",
            "active_connections": "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';",
            "idle_connections": "SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';",
            "max_connections": "SHOW max_connections;",
            "long_running_queries": """
                SELECT count(*) FROM pg_stat_activity 
                WHERE state = 'active' 
                AND now() - query_start > interval '5 minutes';
            """
        }
        
        stats = {}
        
        try:
            with self.conn.cursor() as cursor:
                for key, query in queries.items():
                    cursor.execute(query)
                    result = cursor.fetchone()
                    stats[key] = result[0] if result else 0
            
            # Calculate usage percentage
            stats['usage_percent'] = round(
                100.0 * stats['total_connections'] / stats['max_connections'], 2
            )
            
            # Recommendations
            if stats['usage_percent'] > 80:
                stats['recommendation'] = "Connection pool is near capacity. Consider increasing max_connections or using PgBouncer."
            elif stats['idle_connections'] > stats['active_connections'] * 2:
                stats['recommendation'] = "High number of idle connections. Review connection pooling configuration."
            
            return stats
        except Exception as e:
            logger.error(f"Failed to analyze connections: {e}")
            return {}
    
    def generate_optimization_report(self) -> Dict[str, Any]:
        """
        Generate comprehensive optimization report
        
        Returns:
            Complete optimization report
        """
        report = {
            "timestamp": datetime.now().isoformat(),
            "slow_queries": self.analyze_slow_queries(min_duration_ms=1000, limit=10),
            "index_suggestions": [],
            "table_bloat": self.analyze_table_bloat(),
            "connection_stats": self.analyze_connection_pool(),
            "recommendations": []
        }
        
        # Analyze important tables
        tables = ["blueprints", "projects", "deployments", "users", "tenants"]
        for table in tables:
            suggestions = self.suggest_indexes(table)
            report["index_suggestions"].extend(suggestions)
        
        # Generate recommendations
        if report["slow_queries"]:
            report["recommendations"].append({
                "priority": "high",
                "category": "performance",
                "message": f"Found {len(report['slow_queries'])} slow queries requiring optimization"
            })
        
        if report["index_suggestions"]:
            report["recommendations"].append({
                "priority": "medium",
                "category": "indexing",
                "message": f"Consider adding {len(report['index_suggestions'])} missing indexes"
            })
        
        if report["table_bloat"]:
            report["recommendations"].append({
                "priority": "medium",
                "category": "maintenance",
                "message": f"{len(report['table_bloat'])} tables need VACUUM"
            })
        
        return report


def optimize_common_queries() -> Dict[str, str]:
    """
    Provide optimized versions of common queries
    
    Returns:
        Dictionary of query optimizations
    """
    return {
        "get_user_blueprints": {
            "before": """
                SELECT * FROM blueprints 
                WHERE user_id = %s 
                ORDER BY created_at DESC;
            """,
            "after": """
                SELECT id, name, provider, created_at, updated_at 
                FROM blueprints 
                WHERE user_id = %s 
                ORDER BY created_at DESC 
                LIMIT 100;
            """,
            "improvement": "Select only needed columns, add LIMIT to prevent large result sets"
        },
        "deployment_statistics": {
            "before": """
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful
                FROM deployments 
                WHERE tenant_id = %s;
            """,
            "after": """
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'success') as successful
                FROM deployments 
                WHERE tenant_id = %s 
                AND created_at > NOW() - INTERVAL '30 days';
            """,
            "improvement": "Use FILTER clause, add time constraint for faster queries"
        },
        "join_optimization": {
            "before": """
                SELECT b.*, u.username, p.name as project_name
                FROM blueprints b
                LEFT JOIN users u ON b.user_id = u.id
                LEFT JOIN projects p ON b.project_id = p.id
                WHERE b.tenant_id = %s;
            """,
            "after": """
                SELECT 
                    b.id, b.name, b.provider,
                    u.username,
                    p.name as project_name
                FROM blueprints b
                INNER JOIN users u ON b.user_id = u.id
                LEFT JOIN projects p ON b.project_id = p.id
                WHERE b.tenant_id = %s
                AND b.deleted_at IS NULL;
            """,
            "improvement": "Select specific columns, use INNER JOIN where appropriate, filter soft deletes"
        }
    }


# Example usage
if __name__ == "__main__":
    # Database configuration
    db_config = {
        "host": "localhost",
        "port": 5432,
        "database": "iacdharma",
        "user": "postgres",
        "password": "password"
    }
    
    # Initialize optimizer
    optimizer = QueryOptimizer(db_config)
    optimizer.connect()
    
    try:
        # Generate optimization report
        report = optimizer.generate_optimization_report()
        
        print("=== Database Optimization Report ===")
        print(f"\nSlow Queries: {len(report['slow_queries'])}")
        print(f"Index Suggestions: {len(report['index_suggestions'])}")
        print(f"Tables Needing Vacuum: {len(report['table_bloat'])}")
        print(f"\nConnection Usage: {report['connection_stats'].get('usage_percent', 0)}%")
        
        print("\n=== Recommendations ===")
        for rec in report['recommendations']:
            print(f"[{rec['priority'].upper()}] {rec['category']}: {rec['message']}")
    
    finally:
        optimizer.disconnect()
