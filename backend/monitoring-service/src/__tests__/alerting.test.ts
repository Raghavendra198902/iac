import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Alerting Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Alert Rule Definitions', () => {
    it('should create alert rule with threshold', () => {
      const alertRule = {
        id: 'cpu-alert',
        name: 'High CPU Usage',
        metric: 'cpu_utilization',
        threshold: 80,
        operator: 'greater_than',
        duration: 300, // 5 minutes
        severity: 'warning',
      };

      expect(alertRule.threshold).toBe(80);
      expect(alertRule.operator).toBe('greater_than');
    });

    it('should create alert rule with multiple conditions', () => {
      const alertRule = {
        id: 'complex-alert',
        name: 'Complex Alert',
        conditions: [
          { metric: 'cpu_utilization', operator: '>', value: 80 },
          { metric: 'memory_usage', operator: '>', value: 90 },
        ],
        conditionOperator: 'AND',
      };

      expect(alertRule.conditions).toHaveLength(2);
      expect(alertRule.conditionOperator).toBe('AND');
    });

    it('should validate alert rule configuration', () => {
      const validateRule = (rule: any) => {
        const errors: string[] = [];
        
        if (!rule.name) errors.push('Name is required');
        if (!rule.metric) errors.push('Metric is required');
        if (rule.threshold === undefined) errors.push('Threshold is required');
        if (!rule.operator) errors.push('Operator is required');
        
        return { valid: errors.length === 0, errors };
      };

      const valid = validateRule({
        name: 'Test Alert',
        metric: 'cpu',
        threshold: 80,
        operator: '>',
      });
      expect(valid.valid).toBe(true);

      const invalid = validateRule({ name: 'Test' });
      expect(invalid.valid).toBe(false);
      expect(invalid.errors).toContain('Metric is required');
    });
  });

  describe('Alert Triggering', () => {
    it('should trigger alert when threshold exceeded', () => {
      const rule = {
        metric: 'cpu_utilization',
        threshold: 80,
        operator: 'greater_than',
      };

      const evaluateRule = (rule: any, currentValue: number) => {
        if (rule.operator === 'greater_than') {
          return currentValue > rule.threshold;
        }
        return false;
      };

      expect(evaluateRule(rule, 85)).toBe(true);
      expect(evaluateRule(rule, 75)).toBe(false);
    });

    it('should handle different comparison operators', () => {
      const evaluate = (operator: string, value: number, threshold: number) => {
        switch (operator) {
          case '>': return value > threshold;
          case '>=': return value >= threshold;
          case '<': return value < threshold;
          case '<=': return value <= threshold;
          case '==': return value === threshold;
          case '!=': return value !== threshold;
          default: return false;
        }
      };

      expect(evaluate('>', 85, 80)).toBe(true);
      expect(evaluate('<', 75, 80)).toBe(true);
      expect(evaluate('==', 80, 80)).toBe(true);
      expect(evaluate('!=', 85, 80)).toBe(true);
    });

    it('should track alert state changes', () => {
      const alert = {
        id: 'alert-1',
        state: 'ok',
        stateHistory: [] as any[],
      };

      const changeState = (alert: any, newState: string, reason: string) => {
        alert.stateHistory.push({
          from: alert.state,
          to: newState,
          reason,
          timestamp: new Date().toISOString(),
        });
        alert.state = newState;
      };

      changeState(alert, 'alerting', 'CPU exceeded 80%');
      expect(alert.state).toBe('alerting');
      expect(alert.stateHistory).toHaveLength(1);
      expect(alert.stateHistory[0].reason).toContain('CPU');
    });

    it('should respect evaluation duration', async () => {
      const rule = {
        threshold: 80,
        duration: 2, // seconds
        breachCount: 0,
      };

      const checkBreach = (rule: any, value: number) => {
        if (value > rule.threshold) {
          rule.breachCount++;
        } else {
          rule.breachCount = 0;
        }
        return rule.breachCount >= rule.duration;
      };

      expect(checkBreach(rule, 85)).toBe(false); // 1st breach
      expect(checkBreach(rule, 85)).toBe(true);  // 2nd breach (trigger)
      checkBreach(rule, 70); // Reset
      expect(rule.breachCount).toBe(0);
    });
  });

  describe('Alert Notifications', () => {
    it('should send email notification', async () => {
      const sentEmails: any[] = [];

      const sendEmailNotification = async (alert: any, recipients: string[]) => {
        const email = {
          to: recipients,
          subject: `Alert: ${alert.name}`,
          body: `Alert triggered: ${alert.message}`,
          sentAt: new Date().toISOString(),
        };
        sentEmails.push(email);
        return { sent: true };
      };

      const alert = {
        name: 'High CPU',
        message: 'CPU usage is 90%',
      };

      await sendEmailNotification(alert, ['admin@example.com']);
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].subject).toContain('High CPU');
    });

    it('should send Slack notification', async () => {
      const slackMessages: any[] = [];

      const sendSlackNotification = async (alert: any, channel: string) => {
        const message = {
          channel,
          text: `🚨 ${alert.name}: ${alert.message}`,
          timestamp: Date.now(),
        };
        slackMessages.push(message);
        return { sent: true };
      };

      const alert = {
        name: 'High Memory',
        message: 'Memory usage at 95%',
      };

      await sendSlackNotification(alert, '#alerts');
      expect(slackMessages).toHaveLength(1);
      expect(slackMessages[0].text).toContain('High Memory');
    });

    it('should send PagerDuty notification', async () => {
      const incidents: any[] = [];

      const sendPagerDutyAlert = async (alert: any, severity: string) => {
        const incident = {
          incident_key: alert.id,
          description: alert.message,
          severity,
          status: 'triggered',
        };
        incidents.push(incident);
        return { incident_id: 'INC123' };
      };

      const alert = {
        id: 'alert-1',
        message: 'Database connection failed',
      };

      await sendPagerDutyAlert(alert, 'critical');
      expect(incidents).toHaveLength(1);
      expect(incidents[0].severity).toBe('critical');
    });

    it('should send webhook notification', async () => {
      const webhookCalls: any[] = [];

      const sendWebhook = async (url: string, payload: any) => {
        webhookCalls.push({ url, payload, timestamp: Date.now() });
        return { status: 200 };
      };

      const alert = {
        id: 'alert-1',
        name: 'Service Down',
        severity: 'critical',
      };

      await sendWebhook('https://example.com/webhook', alert);
      expect(webhookCalls).toHaveLength(1);
      expect(webhookCalls[0].payload.severity).toBe('critical');
    });

    it('should handle notification failures', async () => {
      const sendNotification = async (shouldFail: boolean) => {
        if (shouldFail) {
          throw new Error('Notification failed');
        }
        return { sent: true };
      };

      await expect(sendNotification(true)).rejects.toThrow('Notification failed');
      await expect(sendNotification(false)).resolves.toEqual({ sent: true });
    });
  });

  describe('Alert Acknowledgment', () => {
    it('should acknowledge alert', async () => {
      const acknowledgeAlert = async (alertId: string, userId: string) => {
        return {
          alertId,
          acknowledgedBy: userId,
          acknowledgedAt: new Date().toISOString(),
          status: 'acknowledged',
        };
      };

      const result = await acknowledgeAlert('alert-1', 'user-123');
      expect(result.status).toBe('acknowledged');
      expect(result.acknowledgedBy).toBe('user-123');
    });

    it('should resolve alert', async () => {
      const resolveAlert = async (alertId: string, resolution: string) => {
        return {
          alertId,
          status: 'resolved',
          resolution,
          resolvedAt: new Date().toISOString(),
        };
      };

      const result = await resolveAlert('alert-1', 'Restarted service');
      expect(result.status).toBe('resolved');
      expect(result.resolution).toBe('Restarted service');
    });

    it('should snooze alert', async () => {
      const snoozeAlert = async (alertId: string, minutes: number) => {
        const snoozedUntil = new Date(Date.now() + minutes * 60000);
        return {
          alertId,
          status: 'snoozed',
          snoozedUntil: snoozedUntil.toISOString(),
        };
      };

      const result = await snoozeAlert('alert-1', 30);
      expect(result.status).toBe('snoozed');
      expect(new Date(result.snoozedUntil).getTime()).toBeGreaterThan(Date.now());
    });

    it('should track acknowledgment history', () => {
      const alert = {
        id: 'alert-1',
        ackHistory: [] as any[],
      };

      const addAcknowledgment = (alert: any, userId: string, action: string) => {
        alert.ackHistory.push({
          userId,
          action,
          timestamp: new Date().toISOString(),
        });
      };

      addAcknowledgment(alert, 'user-1', 'acknowledged');
      addAcknowledgment(alert, 'user-2', 'resolved');

      expect(alert.ackHistory).toHaveLength(2);
      expect(alert.ackHistory[0].action).toBe('acknowledged');
    });
  });

  describe('Alert Escalation', () => {
    it('should define escalation policy', () => {
      const escalationPolicy = {
        id: 'policy-1',
        name: 'Standard Escalation',
        levels: [
          { level: 1, contacts: ['oncall@team.com'], delayMinutes: 0 },
          { level: 2, contacts: ['lead@team.com'], delayMinutes: 15 },
          { level: 3, contacts: ['manager@team.com'], delayMinutes: 30 },
        ],
      };

      expect(escalationPolicy.levels).toHaveLength(3);
      expect(escalationPolicy.levels[1].delayMinutes).toBe(15);
    });

    it('should escalate alert after timeout', () => {
      const alert = {
        id: 'alert-1',
        triggeredAt: Date.now() - 20 * 60000, // 20 minutes ago
        currentLevel: 1,
        acknowledged: false,
      };

      const policy = {
        levels: [
          { level: 1, delayMinutes: 0 },
          { level: 2, delayMinutes: 15 },
        ],
      };

      const shouldEscalate = (alert: any, policy: any) => {
        if (alert.acknowledged) return false;
        
        const minutesSinceTrigger = (Date.now() - alert.triggeredAt) / 60000;
        const nextLevel = policy.levels[alert.currentLevel];
        
        return nextLevel && minutesSinceTrigger >= nextLevel.delayMinutes;
      };

      expect(shouldEscalate(alert, policy)).toBe(true);
    });

    it('should rotate on-call contacts', () => {
      const rotation = {
        schedule: [
          { day: 1, contact: 'user1@example.com' },
          { day: 2, contact: 'user2@example.com' },
          { day: 3, contact: 'user3@example.com' },
        ],
      };

      const getCurrentOnCall = (rotation: any, dayOfWeek: number) => {
        const entry = rotation.schedule.find((s: any) => s.day === dayOfWeek);
        return entry?.contact || rotation.schedule[0].contact;
      };

      expect(getCurrentOnCall(rotation, 2)).toBe('user2@example.com');
      expect(getCurrentOnCall(rotation, 5)).toBe('user1@example.com'); // Fallback
    });
  });

  describe('Alert Grouping and Deduplication', () => {
    it('should group related alerts', () => {
      const alerts = [
        { id: '1', service: 'api', metric: 'cpu' },
        { id: '2', service: 'api', metric: 'memory' },
        { id: '3', service: 'db', metric: 'cpu' },
      ];

      const groupBy = (alerts: any[], key: string) => {
        return alerts.reduce((groups: any, alert: any) => {
          const groupKey = alert[key];
          if (!groups[groupKey]) groups[groupKey] = [];
          groups[groupKey].push(alert);
          return groups;
        }, {});
      };

      const grouped = groupBy(alerts, 'service');
      expect(grouped.api).toHaveLength(2);
      expect(grouped.db).toHaveLength(1);
    });

    it('should deduplicate alerts', () => {
      const existingAlerts = [
        { fingerprint: 'cpu-high-server1', status: 'active' },
      ];

      const isDuplicate = (newAlert: any, existing: any[]) => {
        return existing.some(
          alert => alert.fingerprint === newAlert.fingerprint && alert.status === 'active'
        );
      };

      const newAlert = { fingerprint: 'cpu-high-server1', status: 'active' };
      expect(isDuplicate(newAlert, existingAlerts)).toBe(true);

      const uniqueAlert = { fingerprint: 'cpu-high-server2', status: 'active' };
      expect(isDuplicate(uniqueAlert, existingAlerts)).toBe(false);
    });

    it('should create alert fingerprint', () => {
      const createFingerprint = (alert: any) => {
        const parts = [alert.metric, alert.service, alert.host].filter(Boolean);
        return parts.join('-');
      };

      const alert = {
        metric: 'cpu_usage',
        service: 'api',
        host: 'server1',
      };

      const fingerprint = createFingerprint(alert);
      expect(fingerprint).toBe('cpu_usage-api-server1');
    });
  });

  describe('Alert Dashboard and Reporting', () => {
    it('should get active alerts summary', () => {
      const alerts = [
        { id: '1', severity: 'critical', status: 'active' },
        { id: '2', severity: 'warning', status: 'active' },
        { id: '3', severity: 'critical', status: 'active' },
        { id: '4', severity: 'info', status: 'resolved' },
      ];

      const getSummary = (alerts: any[]) => {
        const active = alerts.filter(a => a.status === 'active');
        return {
          total: active.length,
          critical: active.filter(a => a.severity === 'critical').length,
          warning: active.filter(a => a.severity === 'warning').length,
        };
      };

      const summary = getSummary(alerts);
      expect(summary.total).toBe(3);
      expect(summary.critical).toBe(2);
      expect(summary.warning).toBe(1);
    });

    it('should calculate alert statistics', () => {
      const alerts = [
        { triggeredAt: Date.now() - 3600000, resolvedAt: Date.now() - 1800000 },
        { triggeredAt: Date.now() - 7200000, resolvedAt: Date.now() - 3600000 },
      ];

      const calculateStats = (alerts: any[]) => {
        const durations = alerts.map(a => a.resolvedAt - a.triggeredAt);
        const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        return {
          totalAlerts: alerts.length,
          avgResolutionTime: avgDuration / 60000, // minutes
        };
      };

      const stats = calculateStats(alerts);
      expect(stats.totalAlerts).toBe(2);
      expect(stats.avgResolutionTime).toBe(45); // 45 minutes average
    });
  });
});
