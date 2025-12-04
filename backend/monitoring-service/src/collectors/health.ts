import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Health Check Aggregator
 * 
 * Aggregates health status from all microservices and resources
 * Provides unified health dashboard
 */

export interface HealthStatus {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  responseTime: number;
  timestamp: Date;
  details?: {
    uptime?: number;
    memory?: { used: number; total: number };
    cpu?: number;
    connections?: number;
    errors?: string[];
  };
}

export interface AggregatedHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: HealthStatus[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
  timestamp: Date;
}

export class HealthCheckAggregator {
  private services: string[] = [
    'api-gateway',
    'iac-generator',
    'blueprint-service',
    'cloud-provider-service',
    'costing-service',
    'monitoring-service',
    'guardrails-engine',
    'ai-recommendations-service',
    'automation-engine',
    'orchestrator-service',
    'sso-service'
  ];

  private serviceUrls: Record<string, string> = {
    'api-gateway': 'http://api-gateway:3000/health',
    'iac-generator': 'http://iac-generator:4001/health',
    'blueprint-service': 'http://blueprint-service:4002/health',
    'cloud-provider-service': 'http://cloud-provider-service:4003/health',
    'costing-service': 'http://costing-service:4004/health',
    'monitoring-service': 'http://localhost:4005/health',
    'guardrails-engine': 'http://guardrails-engine:4006/health',
    'ai-recommendations-service': 'http://ai-recommendations-service:4007/health',
    'automation-engine': 'http://automation-engine:4008/health',
    'orchestrator-service': 'http://orchestrator-service:4009/health',
    'sso-service': 'http://sso-service:4010/health'
  };

  private healthCache: Map<string, HealthStatus> = new Map();
  private intervalId?: NodeJS.Timeout;

  /**
   * Start periodic health checks
   */
  startMonitoring(intervalSeconds: number = 30): void {
    logger.info('Starting health monitoring', { intervalSeconds });

    // Stop existing monitoring
    this.stopMonitoring();

    // Start periodic checks
    this.intervalId = setInterval(async () => {
      await this.checkAllServices();
    }, intervalSeconds * 1000);

    // Check immediately
    this.checkAllServices();
  }

  /**
   * Stop periodic health checks
   */
  stopMonitoring(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('Stopped health monitoring');
    }
  }

  /**
   * Check health of all services
   */
  async checkAllServices(): Promise<AggregatedHealth> {
    const checks = this.services.map(service => this.checkService(service));
    const results = await Promise.allSettled(checks);

    const healthStatuses: HealthStatus[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          service: this.services[index],
          status: 'unhealthy' as const,
          responseTime: 0,
          timestamp: new Date(),
          details: {
            errors: [result.reason?.message || 'Unknown error']
          }
        };
      }
    });

    // Update cache
    for (const status of healthStatuses) {
      this.healthCache.set(status.service, status);
    }

    return this.aggregateHealth(healthStatuses);
  }

  /**
   * Check health of a single service
   */
  async checkService(service: string): Promise<HealthStatus> {
    const url = this.serviceUrls[service];
    if (!url) {
      throw new Error(`Unknown service: ${service}`);
    }

    const startTime = Date.now();

    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true // Don't throw on non-2xx
      });

      const responseTime = Date.now() - startTime;

      let status: HealthStatus['status'] = 'healthy';
      if (response.status >= 500) {
        status = 'unhealthy';
      } else if (response.status >= 400 || responseTime > 1000) {
        status = 'degraded';
      }

      const healthStatus: HealthStatus = {
        service,
        status,
        responseTime,
        timestamp: new Date(),
        details: response.data
      };

      logger.debug('Health check completed', {
        service,
        status,
        responseTime
      });

      return healthStatus;
    } catch (error: any) {
      logger.error('Health check failed', {
        service,
        error: error.message
      });

      return {
        service,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        details: {
          errors: [error.message]
        }
      };
    }
  }

  /**
   * Aggregate health statuses
   */
  private aggregateHealth(statuses: HealthStatus[]): AggregatedHealth {
    const summary = {
      total: statuses.length,
      healthy: statuses.filter(s => s.status === 'healthy').length,
      degraded: statuses.filter(s => s.status === 'degraded').length,
      unhealthy: statuses.filter(s => s.status === 'unhealthy').length
    };

    let overall: AggregatedHealth['overall'] = 'healthy';
    if (summary.unhealthy > 0) {
      overall = 'unhealthy';
    } else if (summary.degraded > 0) {
      overall = 'degraded';
    }

    return {
      overall,
      services: statuses,
      summary,
      timestamp: new Date()
    };
  }

  /**
   * Get cached health status
   */
  getCachedHealth(): AggregatedHealth {
    const statuses = Array.from(this.healthCache.values());
    if (statuses.length === 0) {
      return {
        overall: 'unknown',
        services: [],
        summary: { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
        timestamp: new Date()
      };
    }
    return this.aggregateHealth(statuses);
  }

  /**
   * Get health status for specific service
   */
  getServiceHealth(service: string): HealthStatus | undefined {
    return this.healthCache.get(service);
  }

  /**
   * Get unhealthy services
   */
  getUnhealthyServices(): HealthStatus[] {
    return Array.from(this.healthCache.values())
      .filter(s => s.status === 'unhealthy');
  }

  /**
   * Get degraded services
   */
  getDegradedServices(): HealthStatus[] {
    return Array.from(this.healthCache.values())
      .filter(s => s.status === 'degraded');
  }

  /**
   * Check if critical services are healthy
   */
  areCriticalServicesHealthy(): boolean {
    const criticalServices = [
      'api-gateway',
      'sso-service',
      'orchestrator-service'
    ];

    return criticalServices.every(service => {
      const health = this.healthCache.get(service);
      return health?.status === 'healthy';
    });
  }

  /**
   * Get health check history (last N checks)
   */
  getHealthHistory(service: string, limit: number = 10): HealthStatus[] {
    // This would require storing history - simplified for now
    const current = this.healthCache.get(service);
    return current ? [current] : [];
  }

  /**
   * Calculate service uptime percentage
   */
  getServiceUptime(service: string): number {
    // This would require historical data - simplified for now
    const health = this.healthCache.get(service);
    return health?.status === 'healthy' ? 100 : 0;
  }

  /**
   * Trigger alerts for unhealthy services
   */
  async triggerAlertsIfNeeded(): Promise<void> {
    const unhealthy = this.getUnhealthyServices();
    const degraded = this.getDegradedServices();

    if (unhealthy.length > 0) {
      await this.sendAlert('critical', unhealthy);
    }

    if (degraded.length > 0) {
      await this.sendAlert('warning', degraded);
    }
  }

  /**
   * Send alert notification
   */
  private async sendAlert(severity: string, services: HealthStatus[]): Promise<void> {
    try {
      await axios.post('http://api-gateway:3000/api/alerts', {
        type: 'health',
        severity,
        services: services.map(s => s.service),
        message: `${services.length} service(s) ${severity === 'critical' ? 'unhealthy' : 'degraded'}`,
        timestamp: new Date()
      });

      logger.info('Health alert sent', { severity, count: services.length });
    } catch (error: any) {
      logger.error('Failed to send alert', { error: error.message });
    }
  }
}

export default HealthCheckAggregator;
