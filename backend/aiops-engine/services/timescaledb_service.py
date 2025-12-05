"""
TimescaleDB Service

Handles all database interactions for time-series metrics, predictions, and events.
"""

import asyncpg
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)


class TimescaleDBService:
    """
    Service for interacting with TimescaleDB.
    
    Provides methods for:
    - Storing metrics, predictions, and events
    - Querying time-series data
    - Running analytics queries
    - Managing data lifecycle
    """
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 5433,
        database: str = "aiops",
        user: str = "aiops_user",
        password: str = "aiops_password"
    ):
        """
        Initialize TimescaleDB service.
        
        Args:
            host: Database host
            port: Database port
            database: Database name
            user: Database user
            password: Database password
        """
        self.host = host
        self.port = port
        self.database = database
        self.user = user
        self.password = password
        self.pool: Optional[asyncpg.Pool] = None
        
        logger.info(f"✅ TimescaleDB service initialized ({host}:{port}/{database})")
    
    async def connect(self):
        """Create connection pool."""
        try:
            self.pool = await asyncpg.create_pool(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            logger.info("✅ TimescaleDB connection pool created")
        except Exception as e:
            logger.error(f"❌ Failed to connect to TimescaleDB: {str(e)}")
            raise
    
    async def disconnect(self):
        """Close connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("✅ TimescaleDB connection pool closed")
    
    @asynccontextmanager
    async def get_connection(self):
        """Get database connection from pool."""
        if not self.pool:
            await self.connect()
        
        async with self.pool.acquire() as conn:
            yield conn
    
    # ========================================================================
    # Infrastructure Metrics
    # ========================================================================
    
    async def store_infrastructure_metrics(
        self,
        service_name: str,
        metrics: Dict[str, Any],
        infrastructure_id: Optional[str] = None,
        provider: Optional[str] = None,
        region: Optional[str] = None,
        labels: Optional[Dict[str, Any]] = None
    ):
        """Store infrastructure metrics."""
        query = """
            INSERT INTO infrastructure_metrics (
                time, service_name, infrastructure_id, provider, region,
                cpu_usage, memory_usage, disk_io, network_traffic,
                request_rate, response_time, error_rate,
                labels
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        """
        
        async with self.get_connection() as conn:
            await conn.execute(
                query,
                datetime.now(),
                service_name,
                infrastructure_id,
                provider,
                region,
                metrics.get('cpu_usage'),
                metrics.get('memory_usage'),
                metrics.get('disk_io'),
                metrics.get('network_traffic'),
                metrics.get('request_rate'),
                metrics.get('response_time'),
                metrics.get('error_rate'),
                json.dumps(labels) if labels else None
            )
    
    async def get_infrastructure_metrics(
        self,
        service_name: str,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Get recent infrastructure metrics for a service."""
        query = """
            SELECT 
                time, service_name, cpu_usage, memory_usage,
                disk_io, network_traffic, request_rate,
                response_time, error_rate
            FROM infrastructure_metrics
            WHERE service_name = $1
              AND time > NOW() - INTERVAL '1 hour' * $2
            ORDER BY time DESC
        """
        
        async with self.get_connection() as conn:
            rows = await conn.fetch(query, service_name, hours)
            return [dict(row) for row in rows]
    
    async def get_metrics_time_series(
        self,
        service_name: str,
        metric_name: str,
        hours: int = 24
    ) -> List[Dict[str, Any]]:
        """Get time series for a specific metric."""
        query = f"""
            SELECT 
                time,
                {metric_name} as value
            FROM infrastructure_metrics
            WHERE service_name = $1
              AND time > NOW() - INTERVAL '1 hour' * $2
              AND {metric_name} IS NOT NULL
            ORDER BY time ASC
        """
        
        async with self.get_connection() as conn:
            rows = await conn.fetch(query, service_name, hours)
            return [{"time": row['time'], "value": row['value']} for row in rows]
    
    # ========================================================================
    # Security Metrics
    # ========================================================================
    
    async def store_security_metrics(
        self,
        service_name: str,
        metrics: Dict[str, Any]
    ):
        """Store security metrics."""
        query = """
            INSERT INTO security_metrics (
                time, service_name,
                failed_auth_count, successful_auth_count, unique_ips,
                sql_injection_score, xss_score, port_scan_score,
                privilege_escalation_score, request_rate,
                avg_payload_size, data_transfer_rate,
                geographic_entropy, time_anomaly_score, file_access_rate
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        """
        
        async with self.get_connection() as conn:
            await conn.execute(
                query,
                datetime.now(),
                service_name,
                metrics.get('failed_auth_count', 0),
                metrics.get('successful_auth_count', 0),
                metrics.get('unique_ips', 0),
                metrics.get('sql_injection_score', 0),
                metrics.get('xss_score', 0),
                metrics.get('port_scan_score', 0),
                metrics.get('privilege_escalation_score', 0),
                metrics.get('request_rate', 0),
                metrics.get('avg_payload_size', 0),
                metrics.get('data_transfer_rate', 0),
                metrics.get('geographic_entropy', 0),
                metrics.get('time_anomaly_score', 0),
                metrics.get('file_access_rate', 0)
            )
    
    # ========================================================================
    # Predictions
    # ========================================================================
    
    async def store_failure_prediction(self, prediction: Dict[str, Any]):
        """Store failure prediction."""
        query = """
            INSERT INTO failure_predictions (
                time, service_name, failure_probability, confidence,
                severity, predicted_failure_time, time_to_failure_hours,
                root_causes, affected_components, recommended_actions,
                model_type, model_version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING prediction_id
        """
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(
                query,
                datetime.now(),
                prediction['service_name'],
                prediction['probability'],
                prediction['confidence'],
                prediction['severity'],
                datetime.fromisoformat(prediction['predicted_time'].replace('Z', '+00:00')),
                prediction.get('time_to_failure_hours'),
                prediction.get('root_causes', []),
                json.dumps(prediction.get('affected_components', [])),
                prediction.get('recommended_actions', []),
                prediction.get('model_type'),
                prediction.get('model_version')
            )
            return str(row['prediction_id'])
    
    async def store_threat_detection(self, detection: Dict[str, Any]):
        """Store threat detection."""
        query = """
            INSERT INTO threat_detections (
                time, service_name, threat_detected, threat_type,
                confidence, severity, indicators, probability_scores,
                recommended_actions, requires_immediate_action,
                model_type, model_version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING detection_id
        """
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(
                query,
                datetime.now(),
                detection['service_name'],
                detection['threat_detected'],
                detection['threat_type'],
                detection['confidence'],
                detection['severity'],
                detection.get('indicators', []),
                json.dumps(detection.get('probability_scores', {})),
                detection.get('recommended_actions', []),
                detection.get('requires_immediate_action', False),
                detection.get('model_type'),
                detection.get('model_version')
            )
            return str(row['detection_id'])
    
    async def store_capacity_forecast(self, forecast: Dict[str, Any]):
        """Store capacity forecast."""
        query = """
            INSERT INTO capacity_forecasts (
                time, service_name, forecast_period_days,
                max_predicted_usage, avg_predicted_usage,
                capacity_exceeded, critical_level_reached,
                days_to_capacity_threshold, growth_rate_percent,
                forecasts, scaling_recommendations, requires_scaling,
                model_type, model_version
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING forecast_id
        """
        
        analysis = forecast.get('analysis', {})
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(
                query,
                datetime.now(),
                forecast['service_name'],
                forecast['forecast_period_days'],
                analysis.get('max_predicted_usage'),
                analysis.get('avg_predicted_usage'),
                analysis.get('capacity_exceeded', False),
                analysis.get('critical_level_reached', False),
                analysis.get('days_to_capacity_threshold'),
                analysis.get('growth_rate_percent'),
                json.dumps(forecast.get('forecasts', [])),
                json.dumps(forecast.get('scaling_recommendations', [])),
                forecast.get('requires_scaling', False),
                forecast.get('model_type'),
                forecast.get('model_version')
            )
            return str(row['forecast_id'])
    
    # ========================================================================
    # Anomalies
    # ========================================================================
    
    async def store_anomaly(self, anomaly: Dict[str, Any]):
        """Store anomaly detection result."""
        query = """
            INSERT INTO anomalies (
                time, service_name, is_anomaly, anomaly_score,
                severity, metrics, anomalous_metrics,
                recommended_actions
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING anomaly_id
        """
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(
                query,
                datetime.now(),
                anomaly['service_name'],
                anomaly['is_anomaly'],
                anomaly['anomaly_score'],
                anomaly['severity'],
                json.dumps(anomaly.get('metrics', {})),
                anomaly.get('anomalous_metrics', []),
                anomaly.get('recommended_actions', [])
            )
            return str(row['anomaly_id'])
    
    # ========================================================================
    # Remediation Actions
    # ========================================================================
    
    async def store_remediation_action(self, action: Dict[str, Any]) -> str:
        """Store remediation action."""
        query = """
            INSERT INTO remediation_actions (
                time, service_name, action_type, reason, severity,
                status, parameters, affected_resources
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING action_id
        """
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(
                query,
                datetime.now(),
                action['service_name'],
                action['action_type'],
                action['reason'],
                action['severity'],
                'pending',
                json.dumps(action.get('parameters', {})),
                action.get('affected_resources', [])
            )
            return str(row['action_id'])
    
    async def update_remediation_status(
        self,
        action_id: str,
        status: str,
        success: Optional[bool] = None,
        error_message: Optional[str] = None
    ):
        """Update remediation action status."""
        query = """
            UPDATE remediation_actions
            SET status = $2,
                success = $3,
                error_message = $4,
                completed_at = CASE WHEN $2 IN ('completed', 'failed') THEN NOW() ELSE completed_at END
            WHERE action_id = $1
        """
        
        async with self.get_connection() as conn:
            await conn.execute(query, action_id, status, success, error_message)
    
    # ========================================================================
    # Analytics Queries
    # ========================================================================
    
    async def get_service_health_summary(
        self,
        service_name: str
    ) -> Dict[str, Any]:
        """Get comprehensive health summary for a service."""
        query = """
            WITH recent_metrics AS (
                SELECT 
                    AVG(cpu_usage) as avg_cpu,
                    MAX(cpu_usage) as max_cpu,
                    AVG(memory_usage) as avg_memory,
                    MAX(memory_usage) as max_memory,
                    AVG(error_rate) as avg_error_rate
                FROM infrastructure_metrics
                WHERE service_name = $1
                  AND time > NOW() - INTERVAL '1 hour'
            ),
            recent_predictions AS (
                SELECT COUNT(*) FILTER (WHERE severity IN ('critical', 'high')) as critical_predictions
                FROM failure_predictions
                WHERE service_name = $1
                  AND time > NOW() - INTERVAL '24 hours'
            ),
            recent_threats AS (
                SELECT COUNT(*) FILTER (WHERE threat_detected = TRUE) as threats_detected
                FROM threat_detections
                WHERE service_name = $1
                  AND time > NOW() - INTERVAL '24 hours'
            )
            SELECT 
                m.*,
                p.critical_predictions,
                t.threats_detected
            FROM recent_metrics m
            CROSS JOIN recent_predictions p
            CROSS JOIN recent_threats t
        """
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, service_name)
            return dict(row) if row else {}
    
    async def get_prediction_accuracy(
        self,
        model_type: str,
        days: int = 30
    ) -> Dict[str, Any]:
        """Calculate prediction accuracy for a model."""
        # This is a simplified version - real implementation would
        # compare predictions with actual outcomes
        query = """
            SELECT 
                COUNT(*) as total_predictions,
                AVG(confidence) as avg_confidence,
                COUNT(*) FILTER (WHERE severity = 'critical') as critical_predictions,
                COUNT(*) FILTER (WHERE severity = 'high') as high_predictions
            FROM failure_predictions
            WHERE model_type = $1
              AND time > NOW() - INTERVAL '1 day' * $2
        """
        
        async with self.get_connection() as conn:
            row = await conn.fetchrow(query, model_type, days)
            return dict(row) if row else {}


# Singleton instance
_timescale_service: Optional[TimescaleDBService] = None


def get_timescale_service() -> TimescaleDBService:
    """Get singleton TimescaleDB service instance."""
    global _timescale_service
    if _timescale_service is None:
        _timescale_service = TimescaleDBService()
    return _timescale_service
