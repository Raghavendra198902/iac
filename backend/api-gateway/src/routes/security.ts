import express, { Request, Response, Router } from 'express';
import { logger } from '../utils/logger';

const router: Router = express.Router();

interface SecurityEvent {
  id: string;
  ciId: string;
  eventType: 'clipboard' | 'usb-write' | 'file-access' | 'network-exfiltration';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  eventId: string;
  details: any;
}

// In-memory storage for security events (replace with database in production)
const securityEvents: SecurityEvent[] = [];
const maxEvents = 10000; // Keep last 10k events

/**
 * POST /api/security/events - Receive security event from agent
 */
router.post('/events', (req: Request, res: Response) => {
  try {
    const eventData: SecurityEvent = req.body;

    // Validate required fields
    if (!eventData.ciId || !eventData.eventType || !eventData.eventId) {
      return res.status(400).json({ 
        error: 'Missing required fields: ciId, eventType, eventId' 
      });
    }

    // Add event to storage
    securityEvents.unshift(eventData);

    // Trim to max size
    if (securityEvents.length > maxEvents) {
      securityEvents.length = maxEvents;
    }

    logger.info('Security event received', {
      ciId: eventData.ciId,
      eventType: eventData.eventType,
      severity: eventData.severity,
      eventId: eventData.eventId,
    });

    // Send webhook/alert for high severity events
    if (eventData.severity === 'high') {
      logger.warn('HIGH SEVERITY security event', {
        ciId: eventData.ciId,
        eventType: eventData.eventType,
        eventId: eventData.eventId,
        details: eventData.details,
      });

      // TODO: Send to SIEM/webhook/notification system
    }

    res.status(201).json({
      message: 'Security event recorded',
      eventId: eventData.eventId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to process security event', { error });
    res.status(500).json({ error: 'Failed to process security event' });
  }
});

/**
 * GET /api/security/events - Retrieve security events
 */
router.get('/events', (req: Request, res: Response) => {
  try {
    const { ciId, eventType, severity, limit = 100, offset = 0 } = req.query;

    let filteredEvents = [...securityEvents];

    // Apply filters
    if (ciId) {
      filteredEvents = filteredEvents.filter(e => e.ciId === ciId);
    }

    if (eventType) {
      filteredEvents = filteredEvents.filter(e => e.eventType === eventType);
    }

    if (severity) {
      filteredEvents = filteredEvents.filter(e => e.severity === severity);
    }

    // Pagination
    const start = parseInt(offset as string);
    const end = start + parseInt(limit as string);
    const paginatedEvents = filteredEvents.slice(start, end);

    res.json({
      total: filteredEvents.length,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      events: paginatedEvents,
    });
  } catch (error) {
    logger.error('Failed to retrieve security events', { error });
    res.status(500).json({ error: 'Failed to retrieve security events' });
  }
});

/**
 * GET /api/security/analytics - Security analytics and statistics
 */
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const { ciId, timeRange = '24h' } = req.query;

    // Calculate time threshold
    const now = Date.now();
    const timeRanges: Record<string, number> = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    const threshold = now - (timeRanges[timeRange as string] || timeRanges['24h']);

    let filteredEvents = securityEvents.filter(e => 
      new Date(e.timestamp).getTime() >= threshold
    );

    if (ciId) {
      filteredEvents = filteredEvents.filter(e => e.ciId === ciId);
    }

    // Calculate statistics
    const byType = filteredEvents.reduce((acc, e) => {
      acc[e.eventType] = (acc[e.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = filteredEvents.reduce((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCi = filteredEvents.reduce((acc, e) => {
      acc[e.ciId] = (acc[e.ciId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top threats by CI
    const topThreats = Object.entries(byCi)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ciId, count]) => ({ ciId, count }));

    // Recent high severity events
    const recentHighSeverity = filteredEvents
      .filter(e => e.severity === 'high')
      .slice(0, 20);

    res.json({
      timeRange,
      totalEvents: filteredEvents.length,
      statistics: {
        byType,
        bySeverity,
        topThreats,
      },
      recentHighSeverity: recentHighSeverity.map(e => ({
        eventId: e.eventId,
        ciId: e.ciId,
        eventType: e.eventType,
        timestamp: e.timestamp,
        details: e.details,
      })),
    });
  } catch (error) {
    logger.error('Failed to generate security analytics', { error });
    res.status(500).json({ error: 'Failed to generate security analytics' });
  }
});

/**
 * GET /api/security/events/:eventId - Get specific security event
 */
router.get('/events/:eventId', (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const event = securityEvents.find(e => e.eventId === eventId);

    if (!event) {
      return res.status(404).json({ error: 'Security event not found' });
    }

    res.json(event);
  } catch (error) {
    logger.error('Failed to retrieve security event', { error });
    res.status(500).json({ error: 'Failed to retrieve security event' });
  }
});

/**
 * DELETE /api/security/events/:eventId - Delete security event (admin only)
 */
router.delete('/events/:eventId', (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    const index = securityEvents.findIndex(e => e.eventId === eventId);

    if (index === -1) {
      return res.status(404).json({ error: 'Security event not found' });
    }

    securityEvents.splice(index, 1);

    logger.info('Security event deleted', { eventId });

    res.json({ message: 'Security event deleted', eventId });
  } catch (error) {
    logger.error('Failed to delete security event', { error });
    res.status(500).json({ error: 'Failed to delete security event' });
  }
});

/**
 * GET /api/security/health - Security monitoring health
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'operational',
    totalEvents: securityEvents.length,
    maxEvents,
    lastEventTimestamp: securityEvents[0]?.timestamp || null,
    timestamp: new Date().toISOString(),
  });
});

export default router;
