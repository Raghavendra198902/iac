/**
 * Update Monitoring Integration
 * 
 * Monitors update events and integrates with enforcement policies
 */

import { EventEmitter } from 'events';
import logger from '../utils/logger';

export interface UpdateEvent {
  timestamp: string;
  eventType: 'check' | 'download' | 'install' | 'success' | 'failure';
  version?: string;
  platform?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export class UpdateMonitor extends EventEmitter {
  private events: UpdateEvent[] = [];
  private maxEvents: number = 1000;

  constructor() {
    super();
    logger.info('Update monitor initialized');
  }

  /**
   * Record update event
   */
  recordEvent(event: UpdateEvent): void {
    this.events.push(event);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Emit event for real-time monitoring
    this.emit('update-event', event);

    // Log based on event type
    switch (event.eventType) {
      case 'check':
        logger.debug('Update check performed', event);
        break;
      case 'download':
        logger.info('Update download started', event);
        break;
      case 'install':
        logger.info('Update installation started', event);
        break;
      case 'success':
        logger.info('Update completed successfully', event);
        break;
      case 'failure':
        logger.error('Update failed', event);
        break;
    }
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit: number = 100): UpdateEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Get events by type
   */
  getEventsByType(eventType: string, limit: number = 100): UpdateEvent[] {
    return this.events
      .filter(e => e.eventType === eventType)
      .slice(-limit);
  }

  /**
   * Get update statistics
   */
  getStatistics(): {
    totalEvents: number;
    successfulUpdates: number;
    failedUpdates: number;
    lastCheckTime?: string;
    lastUpdateTime?: string;
  } {
    const successEvents = this.events.filter(e => e.eventType === 'success');
    const failureEvents = this.events.filter(e => e.eventType === 'failure');
    const checkEvents = this.events.filter(e => e.eventType === 'check');

    return {
      totalEvents: this.events.length,
      successfulUpdates: successEvents.length,
      failedUpdates: failureEvents.length,
      lastCheckTime: checkEvents[checkEvents.length - 1]?.timestamp,
      lastUpdateTime: successEvents[successEvents.length - 1]?.timestamp,
    };
  }

  /**
   * Clear old events
   */
  clearEvents(olderThan?: Date): void {
    if (olderThan) {
      this.events = this.events.filter(e => new Date(e.timestamp) > olderThan);
      logger.info('Cleared old update events', { cutoff: olderThan });
    } else {
      this.events = [];
      logger.info('Cleared all update events');
    }
  }
}

export default UpdateMonitor;
