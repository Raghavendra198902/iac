/**
 * SE Incident Routes
 * Endpoints for Software Engineers to manage and respond to incidents
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
 * @route POST /api/se/incidents
 * @desc Create a new incident
 * @access SE (project scope)
 */
router.post(
  '/',
  requirePermission('incident', 'create', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { title, description, severity, affectedServices, detectedBy, projectId } = req.body;

      if (!title || !severity) {
        return res.status(400).json({
          success: false,
          error: 'Title and severity are required',
        });
      }

      // Validate severity level
      const validSeverities = ['critical', 'high', 'medium', 'low'];
      if (!validSeverities.includes(severity)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid severity level',
        });
      }

      // Determine priority based on severity
      const priorityMap: { [key: string]: string } = {
        critical: 'p1',
        high: 'p2',
        medium: 'p3',
        low: 'p4',
      };

      // Create incident
      const incidentResult = await query(
        `INSERT INTO incidents 
          (title, description, severity, status, priority, affected_services, detected_by, 
           reported_by, reported_at, tenant_id, project_id)
        VALUES ($1, $2, $3, 'open', $4, $5, $6, $7, NOW(), $8, $9)
        RETURNING *`,
        [
          title,
          description || '',
          severity,
          priorityMap[severity],
          JSON.stringify(affectedServices || []),
          detectedBy || 'manual',
          req.user!.email,
          req.user!.tenantId,
          projectId || null,
        ]
      );

      const incident = incidentResult.rows[0];

      // Create timeline entry
      await query(
        `INSERT INTO incident_timeline 
          (incident_id, event, user_email, details, timestamp, tenant_id)
        VALUES ($1, 'created', $2, $3, NOW(), $4)`,
        [
          incident.id,
          req.user!.email,
          'Incident created',
          req.user!.tenantId,
        ]
      );

      logger.info(`Incident ${incident.id} created by ${req.user!.email}`);

      res.status(201).json({
        success: true,
        message: 'Incident created successfully',
        data: incident,
      });
    } catch (error: any) {
      logger.error('Error creating incident:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to create incident',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/incidents
 * @desc Get list of incidents in scope
 * @access SE (project scope)
 */
router.get(
  '/',
  requirePermission('incident', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { status, severity, assignedTo, limit = 50, offset = 0 } = req.query;

      // Build query with filters
      let queryText = `
        SELECT 
          i.*,
          p.name as project_name,
          EXTRACT(EPOCH FROM (i.acknowledged_at - i.reported_at))/60 as response_time_minutes
        FROM incidents i
        LEFT JOIN projects p ON i.project_id = p.id
        WHERE i.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      // Filter by status
      if (status) {
        queryText += ` AND i.status = $${paramIndex}`;
        queryParams.push(status);
        paramIndex++;
      }

      // Filter by severity
      if (severity) {
        queryText += ` AND i.severity = $${paramIndex}`;
        queryParams.push(severity);
        paramIndex++;
      }

      // Filter by assigned user
      if (assignedTo) {
        queryText += ` AND i.assigned_to = $${paramIndex}`;
        queryParams.push(assignedTo);
        paramIndex++;
      }

      // Get total count
      const countQuery = queryText.replace(
        /SELECT[\s\S]*?FROM/,
        'SELECT COUNT(*) as total FROM'
      );
      const countResult = await query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Add ordering and pagination
      queryText += ` ORDER BY 
        CASE i.severity 
          WHEN 'critical' THEN 1 
          WHEN 'high' THEN 2 
          WHEN 'medium' THEN 3 
          ELSE 4 
        END,
        i.reported_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      queryParams.push(Number(limit), Number(offset));

      const result = await query(queryText, queryParams);

      logger.info(`Fetched ${result.rows.length} incidents`);

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
      logger.error('Error fetching incidents:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incidents',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/se/incidents/:id
 * @desc Get detailed incident information
 * @access SE (project scope)
 */
router.get(
  '/:id',
  requirePermission('incident', 'read', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Get incident details
      const incidentResult = await query(
        `SELECT 
          i.*,
          p.name as project_name,
          EXTRACT(EPOCH FROM (i.acknowledged_at - i.reported_at))/60 as response_time_minutes
        FROM incidents i
        LEFT JOIN projects p ON i.project_id = p.id
        WHERE i.id = $1 AND i.tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (incidentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found',
        });
      }

      const incident = incidentResult.rows[0];

      // Get timeline
      const timelineResult = await query(
        `SELECT 
          event,
          user_email as user,
          details,
          timestamp
        FROM incident_timeline
        WHERE incident_id = $1 AND tenant_id = $2
        ORDER BY timestamp ASC`,
        [id, req.user!.tenantId]
      );

      // Get related incidents (same affected services)
      const relatedResult = await query(
        `SELECT id, title, severity, status
        FROM incidents
        WHERE tenant_id = $1 
          AND id != $2
          AND affected_services::jsonb ?| $3::text[]
        ORDER BY reported_at DESC
        LIMIT 5`,
        [
          req.user!.tenantId,
          id,
          incident.affected_services || [],
        ]
      );

      const fullIncident = {
        ...incident,
        timeline: timelineResult.rows,
        relatedIncidents: relatedResult.rows,
      };

      logger.info(`Fetched incident ${id} details`);

      res.json({
        success: true,
        data: fullIncident,
      });
    } catch (error: any) {
      logger.error('Error fetching incident details:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incident details',
        details: error.message,
      });
    }
  }
);

/**
 * @route PATCH /api/se/incidents/:id
 * @desc Update incident status or details
 * @access SE (project scope)
 */
router.patch(
  '/:id',
  requirePermission('incident', 'update', 'project'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, assignedTo, resolution, notes } = req.body;

      // Get current incident
      const currentResult = await query(
        `SELECT * FROM incidents 
         WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (currentResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found',
        });
      }

      const current = currentResult.rows[0];

      // Validate status transition
      const validStatuses = ['open', 'acknowledged', 'investigating', 'resolved', 'closed'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status',
        });
      }

      // Build update query dynamically
      const updates: string[] = [];
      const updateParams: any[] = [];
      let paramIndex = 1;

      if (status) {
        updates.push(`status = $${paramIndex}`);
        updateParams.push(status);
        paramIndex++;

        // Set acknowledged_at on first acknowledgment
        if (status === 'acknowledged' && !current.acknowledged_at) {
          updates.push(`acknowledged_at = NOW()`);
        }

        // Set resolved_at when resolved
        if (status === 'resolved' || status === 'closed') {
          updates.push(`resolved_at = NOW()`);
        }
      }

      if (assignedTo !== undefined) {
        updates.push(`assigned_to = $${paramIndex}`);
        updateParams.push(assignedTo);
        paramIndex++;
      }

      if (resolution) {
        updates.push(`resolution = $${paramIndex}`);
        updateParams.push(resolution);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No updates provided',
        });
      }

      // Add tenant_id and id to params
      updateParams.push(req.user!.tenantId, id);

      // Update incident
      const updateQuery = `
        UPDATE incidents 
        SET ${updates.join(', ')}
        WHERE tenant_id = $${paramIndex} AND id = $${paramIndex + 1}
        RETURNING *
      `;

      const updateResult = await query(updateQuery, updateParams);
      const updated = updateResult.rows[0];

      // Add timeline entry
      const timelineDetails = [];
      if (status) timelineDetails.push(`Status changed to ${status}`);
      if (assignedTo) timelineDetails.push(`Assigned to ${assignedTo}`);
      if (resolution) timelineDetails.push(`Resolution: ${resolution}`);
      if (notes) timelineDetails.push(`Notes: ${notes}`);

      await query(
        `INSERT INTO incident_timeline 
          (incident_id, event, user_email, details, timestamp, tenant_id)
        VALUES ($1, 'updated', $2, $3, NOW(), $4)`,
        [
          id,
          req.user!.email,
          timelineDetails.join('; '),
          req.user!.tenantId,
        ]
      );

      logger.info(`Incident ${id} updated by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Incident updated successfully',
        data: updated,
      });
    } catch (error: any) {
      logger.error('Error updating incident:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to update incident',
        details: error.message,
      });
    }
  }
);

export default router;
