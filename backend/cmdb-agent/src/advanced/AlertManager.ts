/**
 * Advanced Alert Manager
 * Multi-channel alerting with intelligent routing and deduplication
 */

import { EventEmitter } from 'events';
import logger from '../utils/logger';
import axios from 'axios';

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  description: string;
  source: string;
  timestamp: string;
  tags: string[];
  metadata: Record<string, any>;
  fingerprint: string;
  status: 'firing' | 'resolved' | 'acknowledged';
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  cooldown: number; // seconds
  channels: string[];
}

export interface NotificationChannel {
  id: string;
  type: 'webhook' | 'email' | 'slack' | 'pagerduty' | 'teams' | 'discord';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  severityFilter: string[];
}

export class AlertManager extends EventEmitter {
  private alerts: Map<string, Alert> = new Map();
  private rules: Map<string, AlertRule> = new Map();
  private channels: Map<string, NotificationChannel> = new Map();
  private alertHistory: Alert[] = [];
  private cooldowns: Map<string, number> = new Map();
  private dedupWindow: number = 300000; // 5 minutes

  constructor() {
    super();
    this.initializeDefaultChannels();
    this.initializeDefaultRules();
  }

  /**
   * Create alert
   */
  async createAlert(
    severity: 'info' | 'warning' | 'error' | 'critical',
    title: string,
    description: string,
    source: string,
    tags: string[] = [],
    metadata: Record<string, any> = {}
  ): Promise<Alert> {
    const fingerprint = this.generateFingerprint(title, source, tags);

    // Check for duplicate within dedup window
    const existing = Array.from(this.alerts.values()).find(
      a => a.fingerprint === fingerprint && a.status === 'firing'
    );

    if (existing) {
      logger.debug('Duplicate alert suppressed', { fingerprint });
      return existing;
    }

    // Check cooldown
    const lastFired = this.cooldowns.get(fingerprint);
    if (lastFired && Date.now() - lastFired < 60000) {
      logger.debug('Alert in cooldown period', { fingerprint });
      return existing!;
    }

    const alert: Alert = {
      id: this.generateAlertId(),
      severity,
      title,
      description,
      source,
      timestamp: new Date().toISOString(),
      tags,
      metadata,
      fingerprint,
      status: 'firing',
    };

    this.alerts.set(alert.id, alert);
    this.alertHistory.push(alert);
    this.cooldowns.set(fingerprint, Date.now());

    logger.info('Alert created', { 
      id: alert.id, 
      severity, 
      title 
    });

    // Emit alert event
    this.emit('alert_created', alert);

    // Send notifications
    await this.sendNotifications(alert);

    return alert;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

    alert.status = 'resolved';
    this.alerts.delete(alertId);

    logger.info('Alert resolved', { id: alertId, title: alert.title });
    this.emit('alert_resolved', alert);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (!alert) return;

    alert.status = 'acknowledged';
    logger.info('Alert acknowledged', { id: alertId });
    this.emit('alert_acknowledged', alert);
  }

  /**
   * Send notifications through configured channels
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    const eligibleChannels = Array.from(this.channels.values()).filter(
      channel => 
        channel.enabled && 
        channel.severityFilter.includes(alert.severity)
    );

    await Promise.all(
      eligibleChannels.map(channel => this.sendToChannel(alert, channel))
    );
  }

  /**
   * Send to specific channel
   */
  private async sendToChannel(alert: Alert, channel: NotificationChannel): Promise<void> {
    try {
      switch (channel.type) {
        case 'webhook':
          await this.sendWebhook(alert, channel);
          break;
        case 'slack':
          await this.sendSlack(alert, channel);
          break;
        case 'teams':
          await this.sendTeams(alert, channel);
          break;
        case 'discord':
          await this.sendDiscord(alert, channel);
          break;
        case 'pagerduty':
          await this.sendPagerDuty(alert, channel);
          break;
        default:
          logger.warn('Unsupported channel type', { type: channel.type });
      }

      logger.info('Notification sent', { 
        channel: channel.name, 
        alertId: alert.id 
      });
    } catch (error: any) {
      logger.error('Failed to send notification', { 
        channel: channel.name, 
        error: error.message 
      });
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(alert: Alert, channel: NotificationChannel): Promise<void> {
    const { url, headers = {} } = channel.config;

    await axios.post(url, {
      alert,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 5000,
    });
  }

  /**
   * Send Slack notification
   */
  private async sendSlack(alert: Alert, channel: NotificationChannel): Promise<void> {
    const { webhookUrl } = channel.config;

    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    await axios.post(webhookUrl, {
      attachments: [{
        color,
        title: `${emoji} ${alert.title}`,
        text: alert.description,
        fields: [
          { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
          { title: 'Source', value: alert.source, short: true },
          { title: 'Time', value: alert.timestamp, short: false },
        ],
        footer: 'CMDB Pro Agent',
        footer_icon: 'https://example.com/icon.png',
        ts: Math.floor(new Date(alert.timestamp).getTime() / 1000),
      }],
    }, {
      timeout: 5000,
    });
  }

  /**
   * Send Microsoft Teams notification
   */
  private async sendTeams(alert: Alert, channel: NotificationChannel): Promise<void> {
    const { webhookUrl } = channel.config;

    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    await axios.post(webhookUrl, {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: color.replace('#', ''),
      summary: alert.title,
      sections: [{
        activityTitle: `${emoji} ${alert.title}`,
        activitySubtitle: alert.description,
        facts: [
          { name: 'Severity', value: alert.severity.toUpperCase() },
          { name: 'Source', value: alert.source },
          { name: 'Time', value: alert.timestamp },
        ],
      }],
    }, {
      timeout: 5000,
    });
  }

  /**
   * Send Discord notification
   */
  private async sendDiscord(alert: Alert, channel: NotificationChannel): Promise<void> {
    const { webhookUrl } = channel.config;

    const color = parseInt(this.getSeverityColor(alert.severity).replace('#', ''), 16);
    const emoji = this.getSeverityEmoji(alert.severity);

    await axios.post(webhookUrl, {
      embeds: [{
        title: `${emoji} ${alert.title}`,
        description: alert.description,
        color,
        fields: [
          { name: 'Severity', value: alert.severity.toUpperCase(), inline: true },
          { name: 'Source', value: alert.source, inline: true },
        ],
        timestamp: alert.timestamp,
        footer: { text: 'CMDB Pro Agent' },
      }],
    }, {
      timeout: 5000,
    });
  }

  /**
   * Send PagerDuty notification
   */
  private async sendPagerDuty(alert: Alert, channel: NotificationChannel): Promise<void> {
    const { integrationKey } = channel.config;

    await axios.post('https://events.pagerduty.com/v2/enqueue', {
      routing_key: integrationKey,
      event_action: 'trigger',
      dedup_key: alert.fingerprint,
      payload: {
        summary: alert.title,
        severity: alert.severity,
        source: alert.source,
        timestamp: alert.timestamp,
        custom_details: {
          description: alert.description,
          tags: alert.tags,
          metadata: alert.metadata,
        },
      },
    }, {
      timeout: 5000,
    });
  }

  /**
   * Get severity color
   */
  private getSeverityColor(severity: string): string {
    const colors: Record<string, string> = {
      info: '#0099FF',
      warning: '#FFA500',
      error: '#FF6B6B',
      critical: '#DC143C',
    };
    return colors[severity] || '#808080';
  }

  /**
   * Get severity emoji
   */
  private getSeverityEmoji(severity: string): string {
    const emojis: Record<string, string> = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨',
    };
    return emojis[severity] || '📢';
  }

  /**
   * Generate alert fingerprint for deduplication
   */
  private generateFingerprint(title: string, source: string, tags: string[]): string {
    const str = `${title}|${source}|${tags.sort().join(',')}`;
    return Buffer.from(str).toString('base64');
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add notification channel
   */
  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel);
    logger.info('Notification channel added', { id: channel.id, type: channel.type });
  }

  /**
   * Remove notification channel
   */
  removeChannel(channelId: string): void {
    this.channels.delete(channelId);
    logger.info('Notification channel removed', { id: channelId });
  }

  /**
   * Add alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    logger.info('Alert rule added', { id: rule.id, name: rule.name });
  }

  /**
   * Remove alert rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    logger.info('Alert rule removed', { id: ruleId });
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(a => a.status === 'firing');
  }

  /**
   * Get alert statistics
   */
  getStatistics(): any {
    const active = this.getActiveAlerts();
    const bySeverity = {
      critical: active.filter(a => a.severity === 'critical').length,
      error: active.filter(a => a.severity === 'error').length,
      warning: active.filter(a => a.severity === 'warning').length,
      info: active.filter(a => a.severity === 'info').length,
    };

    return {
      total: active.length,
      bySeverity,
      channels: this.channels.size,
      rules: this.rules.size,
      historySize: this.alertHistory.length,
    };
  }

  /**
   * Initialize default channels
   */
  private initializeDefaultChannels(): void {
    // Webhook channel for API integration
    this.addChannel({
      id: 'default-webhook',
      type: 'webhook',
      name: 'API Webhook',
      config: {
        url: process.env.ALERT_WEBHOOK_URL || 'http://localhost:3000/api/alerts/webhook',
      },
      enabled: true,
      severityFilter: ['info', 'warning', 'error', 'critical'],
    });
  }

  /**
   * Initialize default rules
   */
  private initializeDefaultRules(): void {
    this.addRule({
      id: 'high-cpu',
      name: 'High CPU Usage',
      condition: 'cpu > 90',
      severity: 'critical',
      enabled: true,
      cooldown: 300,
      channels: ['default-webhook'],
    });

    this.addRule({
      id: 'high-memory',
      name: 'High Memory Usage',
      condition: 'memory > 90',
      severity: 'critical',
      enabled: true,
      cooldown: 300,
      channels: ['default-webhook'],
    });

    this.addRule({
      id: 'disk-space',
      name: 'Low Disk Space',
      condition: 'disk > 85',
      severity: 'error',
      enabled: true,
      cooldown: 600,
      channels: ['default-webhook'],
    });
  }

  /**
   * Clean up old alerts
   */
  cleanup(maxAge: number = 86400000): void {
    const now = Date.now();
    const oldAlerts: string[] = [];

    this.alerts.forEach((alert, id) => {
      if (now - new Date(alert.timestamp).getTime() > maxAge) {
        oldAlerts.push(id);
      }
    });

    oldAlerts.forEach(id => this.alerts.delete(id));

    // Keep only last 1000 in history
    if (this.alertHistory.length > 1000) {
      this.alertHistory = this.alertHistory.slice(-1000);
    }

    logger.debug(`Cleaned up ${oldAlerts.length} old alerts`);
  }
}
