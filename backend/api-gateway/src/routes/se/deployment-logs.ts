/**
 * SE Deployment Logs Routes
 * Endpoints for Software Engineers to view and analyze deployment logs
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
 * @route GET /api/se/deployment-logs/:deploymentId
 * @desc Get logs for a specific deployment
 * @access SE (project scope)
 */
router.get(
  '/:deploymentId',
  requirePermission('deployment', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { deploymentId } = req.params;
      const { level, limit = 100, offset = 0, startTime, endTime } = req.query;

      // Build query with filters
      let queryText = `
        SELECT 
          dl.id,
          dl.execution_id as "deploymentId",
          dl.timestamp,
          dl.level,
          dl.message,
          dl.metadata,
          de.status as deployment_status
        FROM deployment_logs dl
        JOIN deployment_executions de ON dl.execution_id = de.id
        WHERE de.id = $1 AND dl.tenant_id = $2
      `;
      const queryParams: any[] = [deploymentId, req.user!.tenantId];
      let paramIndex = 3;

      // Filter by log level
      if (level) {
        queryText += ` AND dl.level = $${paramIndex}`;
        queryParams.push(level);
        paramIndex++;
      }

      // Filter by time range
      if (startTime) {
        queryText += ` AND dl.timestamp >= $${paramIndex}`;
        queryParams.push(startTime);
        paramIndex++;
      }

      if (endTime) {
        queryText += ` AND dl.timestamp <= $${paramIndex}`;
        queryParams.push(endTime);
        paramIndex++;
      }

      // Get total count for pagination
      const countQuery = queryText.replace(
        /SELECT[\s\S]*?FROM/,
        'SELECT COUNT(*) as total FROM'
      );
      const countResult = await query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Add ordering and pagination
      queryText += ` ORDER BY dl.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(Number(limit), Number(offset));

      const result = await query(queryText, queryParams);

      logger.info(`Fetched ${result.rows.length} logs for deployment ${deploymentId}`);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total,
        },
      });
    } catch (error: any) {
      logger.error('Error fetching deployment logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch deployment logs',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/deployment-logs/:deploymentId/stream
 * @desc Stream real-time deployment logs
 * @access SE (project scope)
 */
router.get(
  '/:deploymentId/stream',
  requirePermission('deployment', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { deploymentId } = req.params;

      // Verify deployment exists and user has access
      const deploymentCheck = await query(
        `SELECT id FROM deployment_executions 
         WHERE id = $1 AND tenant_id = $2`,
        [deploymentId, req.user!.tenantId]
      );

      if (deploymentCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Deployment not found',
        });
      }

      // Set headers for SSE (Server-Sent Events)
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // Send initial connection event
      res.write(`data: ${JSON.stringify({ type: 'connected', deploymentId })}\n\n`);

      // Poll for new logs every 2 seconds
      let lastTimestamp = new Date().toISOString();
      
      const pollInterval = setInterval(async () => {
        try {
          const newLogs = await query(
            `SELECT 
              dl.id,
              dl.execution_id as "deploymentId",
              dl.timestamp,
              dl.level,
              dl.message,
              dl.metadata
            FROM deployment_logs dl
            WHERE dl.execution_id = $1 
              AND dl.tenant_id = $2 
              AND dl.timestamp > $3
            ORDER BY dl.timestamp ASC
            LIMIT 50`,
            [deploymentId, req.user!.tenantId, lastTimestamp]
          );

          if (newLogs.rows.length > 0) {
            // Update last timestamp
            lastTimestamp = newLogs.rows[newLogs.rows.length - 1].timestamp;

            // Send each new log as SSE event
            for (const log of newLogs.rows) {
              const logEvent = {
                type: 'log',
                data: log,
              };
              res.write(`data: ${JSON.stringify(logEvent)}\n\n`);
            }
          }
        } catch (error) {
          logger.error('Error streaming logs:', error);
        }
      }, 2000);

      // Cleanup on client disconnect
      req.on('close', () => {
        clearInterval(pollInterval);
        logger.info(`Log stream closed for deployment ${deploymentId}`);
        res.end();
      });
    } catch (error: any) {
      logger.error('Error setting up log stream:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to stream deployment logs',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/deployment-logs/:deploymentId/errors
 * @desc Get error logs for a specific deployment
 * @access SE (project scope)
 */
router.get(
  '/:deploymentId/errors',
  requirePermission('deployment', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { deploymentId } = req.params;

      // Query error and warning level logs
      const result = await query(
        `SELECT 
          dl.id,
          dl.execution_id as "deploymentId",
          dl.timestamp,
          dl.level,
          dl.message,
          dl.metadata,
          de.status as deployment_status
        FROM deployment_logs dl
        JOIN deployment_executions de ON dl.execution_id = de.id
        WHERE de.id = $1 
          AND dl.tenant_id = $2 
          AND dl.level IN ('error', 'warning')
        ORDER BY dl.timestamp DESC
        LIMIT 100`,
        [deploymentId, req.user!.tenantId]
      );

      logger.info(`Fetched ${result.rows.length} error logs for deployment ${deploymentId}`);

      res.json({
        success: true,
        data: result.rows,
        count: result.rows.length,
      });
    } catch (error: any) {
      logger.error('Error fetching deployment errors:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch deployment errors',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/deployment-logs/:deploymentId/summary
 * @desc Get log summary and statistics for a deployment
 * @access SE (project scope)
 */
router.get(
  '/:deploymentId/summary',
  requirePermission('deployment', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { deploymentId } = req.params;

      // Get total log count and level distribution
      const statsResult = await query(
        `SELECT 
          COUNT(*) as total_logs,
          COUNT(CASE WHEN level = 'debug' THEN 1 END) as debug_count,
          COUNT(CASE WHEN level = 'info' THEN 1 END) as info_count,
          COUNT(CASE WHEN level = 'warning' THEN 1 END) as warn_count,
          COUNT(CASE WHEN level = 'error' THEN 1 END) as error_count,
          MIN(timestamp) as first_log,
          MAX(timestamp) as last_log
        FROM deployment_logs
        WHERE execution_id = $1 AND tenant_id = $2`,
        [deploymentId, req.user!.tenantId]
      );

      const stats = statsResult.rows[0];

      // Get top messages
      const topMessagesResult = await query(
        `SELECT 
          message,
          COUNT(*) as count
        FROM deployment_logs
        WHERE execution_id = $1 AND tenant_id = $2
        GROUP BY message
        ORDER BY count DESC
        LIMIT 10`,
        [deploymentId, req.user!.tenantId]
      );

      // Calculate duration and error rate
      const totalLogs = parseInt(stats.total_logs) || 0;
      const errorCount = parseInt(stats.error_count) || 0;
      const errorRate = totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0;

      let duration = 0;
      if (stats.first_log && stats.last_log) {
        const firstTime = new Date(stats.first_log).getTime();
        const lastTime = new Date(stats.last_log).getTime();
        duration = Math.floor((lastTime - firstTime) / 1000); // seconds
      }

      const summary = {
        deploymentId,
        totalLogs,
        byLevel: {
          debug: parseInt(stats.debug_count) || 0,
          info: parseInt(stats.info_count) || 0,
          warn: parseInt(stats.warn_count) || 0,
          error: errorCount,
        },
        timeRange: {
          firstLog: stats.first_log,
          lastLog: stats.last_log,
          duration,
        },
        topMessages: topMessagesResult.rows,
        errorRate: parseFloat(errorRate.toFixed(2)),
        tenantId: req.user!.tenantId,
      };

      logger.info(`Generated log summary for deployment ${deploymentId}`);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      logger.error('Error fetching log summary:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch log summary',
        details: error.message,
      });
    }
  }
);

export default router;
