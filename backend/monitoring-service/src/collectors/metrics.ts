import axios from 'axios';
import { logger } from '../utils/logger';

/**
 * Metrics Collector
 * 
 * Collects performance metrics from cloud resources:
 * - CPU utilization
 * - Memory usage
 * - Network I/O
 * - Disk I/O
 * - Request rates
 */

export interface MetricData {
  resourceId: string;
  resourceType: string;
  timestamp: Date;
  metrics: {
    cpuUtilization?: number;
    memoryUtilization?: number;
    networkIn?: number;
    networkOut?: number;
    diskReadOps?: number;
    diskWriteOps?: number;
    requestCount?: number;
    errorRate?: number;
  };
}

export interface CollectionConfig {
  deploymentId: string;
  cloudProvider: 'aws' | 'azure' | 'gcp';
  resources: ResourceConfig[];
  interval: number; // milliseconds
  retention: number; // days
}

export interface ResourceConfig {
  id: string;
  type: string;
  region: string;
  metrics: string[];
}

export class MetricsCollector {
  private intervalIds: Map<string, NodeJS.Timeout> = new Map();
  private metricsCache: Map<string, MetricData[]> = new Map();

  /**
   * Start collecting metrics for a deployment
   */
  async startCollection(config: CollectionConfig): Promise<void> {
    logger.info('Starting metrics collection', { 
      deploymentId: config.deploymentId,
      resourceCount: config.resources.length 
    });

    // Stop existing collection if any
    this.stopCollection(config.deploymentId);

    // Start periodic collection
    const intervalId = setInterval(async () => {
      await this.collectMetrics(config);
    }, config.interval);

    this.intervalIds.set(config.deploymentId, intervalId);

    // Collect immediately
    await this.collectMetrics(config);
  }

  /**
   * Stop collecting metrics for a deployment
   */
  stopCollection(deploymentId: string): void {
    const intervalId = this.intervalIds.get(deploymentId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(deploymentId);
      logger.info('Stopped metrics collection', { deploymentId });
    }
  }

  /**
   * Collect metrics from all resources
   */
  private async collectMetrics(config: CollectionConfig): Promise<void> {
    const metrics: MetricData[] = [];

    for (const resource of config.resources) {
      try {
        const resourceMetrics = await this.collectResourceMetrics(
          config.cloudProvider,
          resource
        );
        metrics.push(...resourceMetrics);
      } catch (error: any) {
        logger.error('Failed to collect metrics', {
          resourceId: resource.id,
          error: error.message
        });
      }
    }

    // Store metrics
    this.storeMetrics(config.deploymentId, metrics);

    // Send to time-series database (Prometheus/Loki)
    await this.exportMetrics(config.deploymentId, metrics);
  }

  /**
   * Collect metrics for a single resource
   */
  private async collectResourceMetrics(
    cloudProvider: string,
    resource: ResourceConfig
  ): Promise<MetricData[]> {
    switch (cloudProvider) {
      case 'aws':
        return this.collectAWSMetrics(resource);
      case 'azure':
        return this.collectAzureMetrics(resource);
      case 'gcp':
        return this.collectGCPMetrics(resource);
      default:
        throw new Error(`Unsupported cloud provider: ${cloudProvider}`);
    }
  }

  /**
   * Collect AWS CloudWatch metrics
   */
  private async collectAWSMetrics(resource: ResourceConfig): Promise<MetricData[]> {
    try {
      const response = await axios.post('http://cloud-provider-service:4003/api/aws/metrics', {
        resourceId: resource.id,
        resourceType: resource.type,
        metrics: resource.metrics,
        period: 300 // 5 minutes
      });

      return response.data.datapoints.map((dp: any) => ({
        resourceId: resource.id,
        resourceType: resource.type,
        timestamp: new Date(dp.timestamp),
        metrics: {
          cpuUtilization: dp.CPUUtilization,
          memoryUtilization: dp.MemoryUtilization,
          networkIn: dp.NetworkIn,
          networkOut: dp.NetworkOut,
          diskReadOps: dp.DiskReadOps,
          diskWriteOps: dp.DiskWriteOps
        }
      }));
    } catch (error: any) {
      logger.error('AWS metrics collection failed', { 
        resourceId: resource.id, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Collect Azure Monitor metrics
   */
  private async collectAzureMetrics(resource: ResourceConfig): Promise<MetricData[]> {
    try {
      const response = await axios.post('http://cloud-provider-service:4003/api/azure/metrics', {
        resourceId: resource.id,
        resourceType: resource.type,
        metrics: resource.metrics,
        interval: 'PT5M' // 5 minutes
      });

      return response.data.value.map((metric: any) => ({
        resourceId: resource.id,
        resourceType: resource.type,
        timestamp: new Date(metric.timeStamp),
        metrics: {
          cpuUtilization: metric.average,
          memoryUtilization: metric.memoryAverage
        }
      }));
    } catch (error: any) {
      logger.error('Azure metrics collection failed', { 
        resourceId: resource.id, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Collect GCP Cloud Monitoring metrics
   */
  private async collectGCPMetrics(resource: ResourceConfig): Promise<MetricData[]> {
    try {
      const response = await axios.post('http://cloud-provider-service:4003/api/gcp/metrics', {
        resourceId: resource.id,
        resourceType: resource.type,
        metrics: resource.metrics,
        interval: '300s' // 5 minutes
      });

      return response.data.timeSeries.map((ts: any) => ({
        resourceId: resource.id,
        resourceType: resource.type,
        timestamp: new Date(ts.points[0].interval.endTime),
        metrics: {
          cpuUtilization: ts.points[0].value.doubleValue
        }
      }));
    } catch (error: any) {
      logger.error('GCP metrics collection failed', { 
        resourceId: resource.id, 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Store metrics in cache
   */
  private storeMetrics(deploymentId: string, metrics: MetricData[]): void {
    const existing = this.metricsCache.get(deploymentId) || [];
    const updated = [...existing, ...metrics];

    // Keep only last 1000 data points
    if (updated.length > 1000) {
      updated.splice(0, updated.length - 1000);
    }

    this.metricsCache.set(deploymentId, updated);
  }

  /**
   * Export metrics to Prometheus/Loki
   */
  private async exportMetrics(deploymentId: string, metrics: MetricData[]): Promise<void> {
    try {
      // Send to Loki for storage
      await axios.post('http://loki:3100/loki/api/v1/push', {
        streams: [{
          stream: {
            job: 'metrics-collector',
            deployment_id: deploymentId
          },
          values: metrics.map(m => [
            String(m.timestamp.getTime() * 1000000), // nanoseconds
            JSON.stringify(m.metrics)
          ])
        }]
      });

      logger.debug('Metrics exported', { 
        deploymentId, 
        count: metrics.length 
      });
    } catch (error: any) {
      logger.error('Failed to export metrics', { 
        deploymentId, 
        error: error.message 
      });
    }
  }

  /**
   * Get latest metrics for a deployment
   */
  getLatestMetrics(deploymentId: string, limit: number = 100): MetricData[] {
    const metrics = this.metricsCache.get(deploymentId) || [];
    return metrics.slice(-limit);
  }

  /**
   * Get metrics for a specific resource
   */
  getResourceMetrics(deploymentId: string, resourceId: string): MetricData[] {
    const metrics = this.metricsCache.get(deploymentId) || [];
    return metrics.filter(m => m.resourceId === resourceId);
  }

  /**
   * Calculate average metrics over time period
   */
  getAverageMetrics(deploymentId: string, minutes: number): Record<string, number> {
    const metrics = this.metricsCache.get(deploymentId) || [];
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recent = metrics.filter(m => m.timestamp >= cutoff);

    if (recent.length === 0) {
      return {};
    }

    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};

    for (const metric of recent) {
      for (const [key, value] of Object.entries(metric.metrics)) {
        if (typeof value === 'number') {
          totals[key] = (totals[key] || 0) + value;
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }

    const averages: Record<string, number> = {};
    for (const key in totals) {
      averages[key] = totals[key] / counts[key];
    }

    return averages;
  }

  /**
   * Detect anomalies in metrics
   */
  detectAnomalies(deploymentId: string): Array<{ metric: string; value: number; threshold: number }> {
    const averages = this.getAverageMetrics(deploymentId, 60); // Last hour
    const anomalies: Array<{ metric: string; value: number; threshold: number }> = [];

    // CPU threshold: 80%
    if (averages.cpuUtilization && averages.cpuUtilization > 80) {
      anomalies.push({
        metric: 'cpuUtilization',
        value: averages.cpuUtilization,
        threshold: 80
      });
    }

    // Memory threshold: 85%
    if (averages.memoryUtilization && averages.memoryUtilization > 85) {
      anomalies.push({
        metric: 'memoryUtilization',
        value: averages.memoryUtilization,
        threshold: 85
      });
    }

    // Error rate threshold: 5%
    if (averages.errorRate && averages.errorRate > 5) {
      anomalies.push({
        metric: 'errorRate',
        value: averages.errorRate,
        threshold: 5
      });
    }

    return anomalies;
  }

  /**
   * Cleanup old metrics
   */
  cleanupOldMetrics(deploymentId: string, retentionDays: number): void {
    const metrics = this.metricsCache.get(deploymentId) || [];
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    
    const filtered = metrics.filter(m => m.timestamp >= cutoff);
    this.metricsCache.set(deploymentId, filtered);

    logger.info('Cleaned up old metrics', { 
      deploymentId, 
      removed: metrics.length - filtered.length 
    });
  }
}

export default MetricsCollector;
