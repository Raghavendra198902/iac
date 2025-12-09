/**
 * SE Health Monitoring Routes
 * Endpoints for Software Engineers to monitor system health and performance
 */

import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permissions';
import { buildScopeFilter } from '../../services/scopeResolver';
import { query } from '../../utils/database';
import { logger } from '../../utils/logger';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

/**
 * @route GET /api/se/health/services
 * @desc Get health status of all services
 * @access SE (project scope)
 */
router.get(
  '/services',
  requirePermission('health', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { environment, unhealthyOnly } = req.query;

      // Build query with filters
      let queryText = `
        SELECT 
          s.name,
          s.environment_id,
          e.name as environment,
          s.status,
          s.uptime_percentage as uptime,
          s.last_check_at as "lastCheck",
          s.response_time_ms as response_time,
          s.error_rate,
          s.requests_per_second,
          s.cpu_usage,
          s.memory_usage,
          s.project_id
        FROM service_health s
        LEFT JOIN environments e ON s.environment_id = e.id
        WHERE s.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      // Filter by environment
      if (environment) {
        queryText += ` AND e.name = $${paramIndex}`;
        queryParams.push(environment);
        paramIndex++;
      }

      // Filter unhealthy only
      if (unhealthyOnly === 'true') {
        queryText += ` AND s.status != 'healthy'`;
      }

      queryText += ` ORDER BY 
        CASE s.status 
          WHEN 'unhealthy' THEN 1 
          WHEN 'degraded' THEN 2 
          ELSE 3 
        END,
        s.name ASC`;

      const result = await query(queryText, queryParams);

      // Format response with metrics
      const services = result.rows.map(row => ({
        name: row.name,
        environment: row.environment,
        status: row.status,
        uptime: parseFloat(row.uptime) || 0,
        lastCheck: row.lastCheck,
        metrics: {
          responseTime: parseFloat(row.response_time) || 0,
          errorRate: parseFloat(row.error_rate) || 0,
          requestsPerSecond: parseFloat(row.requests_per_second) || 0,
          cpuUsage: parseFloat(row.cpu_usage) || 0,
          memoryUsage: parseFloat(row.memory_usage) || 0,
        },
        projectId: row.project_id,
      }));

      // Calculate summary
      const summary = {
        total: services.length,
        healthy: services.filter(s => s.status === 'healthy').length,
        degraded: services.filter(s => s.status === 'degraded').length,
        unhealthy: services.filter(s => s.status === 'unhealthy').length,
      };

      logger.info(`Fetched ${services.length} service health records`);

      res.json({
        success: true,
        data: services,
        count: services.length,
        summary,
      });
    } catch (error: any) {
      logger.error('Error fetching service health:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service health',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/health/services/:name
 * @desc Get detailed health information for a specific service
 * @access SE (project scope)
 */
router.get(
  '/services/:name',
  requirePermission('health', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { name } = req.params;
      const { timeRange = '1h' } = req.query;

      // Get current service health
      const serviceResult = await query(
        `SELECT 
          s.*,
          e.name as environment
        FROM service_health s
        LEFT JOIN environments e ON s.environment_id = e.id
        WHERE s.name = $1 AND s.tenant_id = $2
        ORDER BY s.last_check_at DESC
        LIMIT 1`,
        [name, req.user!.tenantId]
      );

      if (serviceResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Service not found',
        });
      }

      const service = serviceResult.rows[0];

      // Get historical metrics based on time range
      const timeRangeMap: { [key: string]: string } = {
        '1h': '1 hour',
        '6h': '6 hours',
        '24h': '24 hours',
        '7d': '7 days',
      };
      const interval = timeRangeMap[timeRange as string] || '1 hour';

      const historyResult = await query(
        `SELECT 
          last_check_at as timestamp,
          response_time_ms as "responseTime",
          error_rate as "errorRate",
          requests_per_second as "requestsPerSecond"
        FROM service_health_history
        WHERE service_name = $1 
          AND tenant_id = $2 
          AND last_check_at >= NOW() - INTERVAL '${interval}'
        ORDER BY last_check_at ASC
        LIMIT 100`,
        [name, req.user!.tenantId]
      );

      // Get service dependencies
      const dependenciesResult = await query(
        `SELECT 
          dependency_name as name,
          status,
          response_time_ms as "responseTime"
        FROM service_dependencies
        WHERE service_name = $1 AND tenant_id = $2`,
        [name, req.user!.tenantId]
      );

      // Get health checks
      const healthChecksResult = await query(
        `SELECT 
          check_name as name,
          status,
          last_check_at as "lastCheck"
        FROM service_health_checks
        WHERE service_name = $1 AND tenant_id = $2`,
        [name, req.user!.tenantId]
      );

      const serviceHealth = {
        name: service.name,
        environment: service.environment,
        status: service.status,
        uptime: parseFloat(service.uptime_percentage) || 0,
        version: service.version,
        deployedAt: service.deployed_at,
        lastCheck: service.last_check_at,
        currentMetrics: {
          responseTime: parseFloat(service.response_time_ms) || 0,
          errorRate: parseFloat(service.error_rate) || 0,
          requestsPerSecond: parseFloat(service.requests_per_second) || 0,
          cpuUsage: parseFloat(service.cpu_usage) || 0,
          memoryUsage: parseFloat(service.memory_usage) || 0,
          diskUsage: parseFloat(service.disk_usage) || 0,
          networkIn: parseFloat(service.network_in_mbps) || 0,
          networkOut: parseFloat(service.network_out_mbps) || 0,
        },
        historicalMetrics: {
          timeRange,
          dataPoints: historyResult.rows,
        },
        dependencies: dependenciesResult.rows,
        healthChecks: healthChecksResult.rows,
        tenantId: req.user!.tenantId,
      };

      logger.info(`Fetched detailed health for service ${name}`);

      res.json({
        success: true,
        data: serviceHealth,
      });
    } catch (error: any) {
      logger.error('Error fetching service health details:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch service health details',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/health/infrastructure
 * @desc Get infrastructure health metrics
 * @access SE (project scope)
 */
router.get(
  '/infrastructure',
  requirePermission('health', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { environment } = req.query;

      // Get infrastructure metrics
      let queryText = `
        SELECT *
        FROM infrastructure_health
        WHERE tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];

      if (environment) {
        queryText += ` AND environment = $2`;
        queryParams.push(environment);
      }

      queryText += ` ORDER BY last_updated DESC LIMIT 1`;

      const result = await query(queryText, queryParams);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Infrastructure metrics not found',
        });
      }

      const infra = result.rows[0];

      const infrastructure = {
        environment: infra.environment,
        compute: {
          totalInstances: parseInt(infra.compute_total_instances) || 0,
          healthyInstances: parseInt(infra.compute_healthy_instances) || 0,
          unhealthyInstances: parseInt(infra.compute_unhealthy_instances) || 0,
          averageCpu: parseFloat(infra.compute_avg_cpu) || 0,
          averageMemory: parseFloat(infra.compute_avg_memory) || 0,
          autoScaling: {
            enabled: infra.autoscaling_enabled || false,
            currentCapacity: parseInt(infra.autoscaling_current) || 0,
            desiredCapacity: parseInt(infra.autoscaling_desired) || 0,
            minCapacity: parseInt(infra.autoscaling_min) || 0,
            maxCapacity: parseInt(infra.autoscaling_max) || 0,
          },
        },
        storage: {
          totalVolumes: parseInt(infra.storage_total_volumes) || 0,
          totalCapacity: parseFloat(infra.storage_total_capacity_gb) || 0,
          usedCapacity: parseFloat(infra.storage_used_capacity_gb) || 0,
          utilizationPercent: parseFloat(infra.storage_utilization_percent) || 0,
          iops: {
            average: parseFloat(infra.storage_iops_avg) || 0,
            peak: parseFloat(infra.storage_iops_peak) || 0,
          },
        },
        network: {
          loadBalancers: {
            total: parseInt(infra.network_lb_total) || 0,
            healthy: parseInt(infra.network_lb_healthy) || 0,
            unhealthy: parseInt(infra.network_lb_unhealthy) || 0,
          },
          bandwidth: {
            inbound: parseFloat(infra.network_bandwidth_in_mbps) || 0,
            outbound: parseFloat(infra.network_bandwidth_out_mbps) || 0,
            peak: parseFloat(infra.network_bandwidth_peak_mbps) || 0,
          },
          latency: {
            average: parseFloat(infra.network_latency_avg_ms) || 0,
            p95: parseFloat(infra.network_latency_p95_ms) || 0,
            p99: parseFloat(infra.network_latency_p99_ms) || 0,
          },
        },
        database: {
          instances: parseInt(infra.database_instances) || 0,
          status: infra.database_status || 'unknown',
          replicationLag: parseFloat(infra.database_replication_lag_sec) || 0,
          connections: {
            active: parseInt(infra.database_connections_active) || 0,
            idle: parseInt(infra.database_connections_idle) || 0,
            max: parseInt(infra.database_connections_max) || 0,
          },
          storage: {
            used: parseFloat(infra.database_storage_used_gb) || 0,
            available: parseFloat(infra.database_storage_available_gb) || 0,
            utilizationPercent: parseFloat(infra.database_storage_utilization_percent) || 0,
          },
        },
        lastUpdated: infra.last_updated,
        tenantId: infra.tenant_id,
      };

      logger.info('Fetched infrastructure health metrics');

      res.json({
        success: true,
        data: infrastructure,
      });
    } catch (error: any) {
      logger.error('Error fetching infrastructure health:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch infrastructure health',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/health/alerts
 * @desc Get active health alerts and warnings
 * @access SE (project scope)
 */
router.get(
  '/alerts',
  requirePermission('health', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { severity, acknowledged } = req.query;

      // Build query with filters
      let queryText = `
        SELECT 
          a.id,
          a.severity,
          a.service_name as service,
          a.metric,
          a.message,
          a.threshold,
          a.current_value as "currentValue",
          a.triggered_at as "triggeredAt",
          a.acknowledged,
          a.acknowledged_by as "acknowledgedBy",
          a.acknowledged_at as "acknowledgedAt",
          a.project_id
        FROM health_alerts a
        WHERE a.tenant_id = $1 AND a.resolved_at IS NULL
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      // Filter by severity
      if (severity) {
        queryText += ` AND a.severity = $${paramIndex}`;
        queryParams.push(severity);
        paramIndex++;
      }

      // Filter by acknowledged status
      if (acknowledged !== undefined) {
        queryText += ` AND a.acknowledged = $${paramIndex}`;
        queryParams.push(acknowledged === 'true');
        paramIndex++;
      }

      queryText += ` ORDER BY 
        CASE a.severity 
          WHEN 'critical' THEN 1 
          WHEN 'warning' THEN 2 
          ELSE 3 
        END,
        a.triggered_at DESC`;

      const result = await query(queryText, queryParams);

      // Calculate summary
      const summary = {
        total: result.rows.length,
        critical: result.rows.filter(a => a.severity === 'critical').length,
        warning: result.rows.filter(a => a.severity === 'warning').length,
        acknowledged: result.rows.filter(a => a.acknowledged).length,
      };

      logger.info(`Fetched ${result.rows.length} health alerts`);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
        summary,
      });
    } catch (error: any) {
      logger.error('Error fetching health alerts:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch health alerts',
        details: error.message,
      });
    }
  }
);

export default router;
