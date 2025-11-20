import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import logger from './utils/logger';
import { IdleResource } from './types';

interface ResourceMetrics {
  cpuUtilization?: number;
  memoryUtilization?: number;
  networkIn?: number;
  networkOut?: number;
  iops?: number;
  diskUtilization?: number;
}

interface IdleThresholds {
  cpuThreshold?: number; // percentage
  memoryThreshold?: number; // percentage
  networkThreshold?: number; // bytes/sec
  iopsThreshold?: number;
  minIdleDuration?: number; // hours
}

export class IdleResourceDetector {
  private idleResources: Map<string, IdleResource> = new Map();
  private defaultThresholds: IdleThresholds = {
    cpuThreshold: 5, // 5% CPU
    memoryThreshold: 10, // 10% memory
    networkThreshold: 1000, // 1KB/sec
    iopsThreshold: 10,
    minIdleDuration: 24 // 24 hours
  };

  constructor() {
    // Start idle resource detection job (runs every 6 hours)
    this.startIdleDetection();
  }

  async detectIdleResources(
    deploymentId?: string,
    blueprintId?: string,
    thresholds?: IdleThresholds
  ): Promise<IdleResource[]> {
    logger.info('Detecting idle resources', { deploymentId, blueprintId });

    const effectiveThresholds = { ...this.defaultThresholds, ...thresholds };
    
    // Fetch resources and their metrics
    const resources = await this.fetchResourcesWithMetrics(deploymentId, blueprintId);
    
    const idleResources: IdleResource[] = [];

    for (const resource of resources) {
      const idleReason = this.analyzeIdleness(resource.metrics, effectiveThresholds);
      
      if (idleReason) {
        const idleResource: IdleResource = {
          resourceId: resource.id,
          resourceName: resource.name,
          resourceType: resource.type,
          deploymentId: deploymentId || 'unknown',
          idleReason,
          idleDuration: resource.idleDuration || 48, // hours
          monthlyCost: resource.monthlyCost,
          recommendation: this.generateRecommendation(resource.type, idleReason),
          detectedAt: new Date(),
          metrics: resource.metrics
        };

        idleResources.push(idleResource);
        this.idleResources.set(resource.id, idleResource);
      }
    }

    logger.info('Idle resource detection complete', {
      totalChecked: resources.length,
      idleFound: idleResources.length,
      potentialSavings: idleResources.reduce((sum, r) => sum + r.monthlyCost, 0)
    });

    return idleResources;
  }

  async getIdleResources(filters?: {
    deploymentId?: string;
    blueprintId?: string;
    minCost?: number;
  }): Promise<IdleResource[]> {
    let resources = Array.from(this.idleResources.values());

    if (filters?.deploymentId) {
      resources = resources.filter(r => r.deploymentId === filters.deploymentId);
    }

    if (filters?.blueprintId) {
      // Would filter by blueprintId if available in resource
      // For now, skip this filter
    }

    if (filters?.minCost) {
      resources = resources.filter(r => r.monthlyCost >= filters.minCost);
    }

    // Sort by monthly cost (highest first)
    return resources.sort((a, b) => b.monthlyCost - a.monthlyCost);
  }

  private analyzeIdleness(metrics: ResourceMetrics, thresholds: IdleThresholds): string | null {
    const reasons: string[] = [];

    if (metrics.cpuUtilization !== undefined && metrics.cpuUtilization < thresholds.cpuThreshold!) {
      reasons.push(`CPU utilization below ${thresholds.cpuThreshold}%`);
    }

    if (metrics.memoryUtilization !== undefined && metrics.memoryUtilization < thresholds.memoryThreshold!) {
      reasons.push(`Memory utilization below ${thresholds.memoryThreshold}%`);
    }

    if (metrics.networkIn !== undefined && metrics.networkOut !== undefined) {
      const totalNetwork = metrics.networkIn + metrics.networkOut;
      if (totalNetwork < thresholds.networkThreshold!) {
        reasons.push(`Network traffic below ${thresholds.networkThreshold} bytes/sec`);
      }
    }

    if (metrics.iops !== undefined && metrics.iops < thresholds.iopsThreshold!) {
      reasons.push(`Disk IOPS below ${thresholds.iopsThreshold}`);
    }

    // Resource is idle if it meets multiple low-usage criteria
    if (reasons.length >= 2) {
      return reasons.join('; ');
    }

    return null;
  }

  private generateRecommendation(resourceType: string, idleReason: string): string {
    const type = resourceType.toLowerCase();

    if (type.includes('vm') || type.includes('instance')) {
      return 'Stop or delete this VM if not needed. Consider scaling down or using auto-scaling if needed intermittently.';
    }

    if (type.includes('database') || type.includes('sql')) {
      return 'Consider pausing the database if not actively used. Review if a smaller tier is sufficient.';
    }

    if (type.includes('storage') || type.includes('disk')) {
      return 'Review if storage is needed. Consider archiving data or moving to cheaper storage tier.';
    }

    if (type.includes('load') || type.includes('gateway')) {
      return 'Remove load balancer if no active backends. Consolidate with other services if possible.';
    }

    return 'Review resource necessity. Consider deletion if no longer required or downgrade to lower tier.';
  }

  private async fetchResourcesWithMetrics(
    deploymentId?: string,
    blueprintId?: string
  ): Promise<any[]> {
    // Mock implementation - in production, fetch from:
    // - Azure Monitor
    // - CloudWatch
    // - GCP Monitoring
    
    logger.info('Fetching resources with metrics (mock)', { deploymentId, blueprintId });

    return [
      {
        id: 'vm-idle-01',
        name: 'dev-test-vm',
        type: 'azurerm_virtual_machine',
        monthlyCost: 140.16,
        idleDuration: 72,
        metrics: {
          cpuUtilization: 2.5,
          memoryUtilization: 8.0,
          networkIn: 500,
          networkOut: 300,
          iops: 5
        }
      },
      {
        id: 'vm-active-01',
        name: 'prod-web-vm',
        type: 'azurerm_virtual_machine',
        monthlyCost: 367.92,
        idleDuration: 0,
        metrics: {
          cpuUtilization: 65.0,
          memoryUtilization: 78.0,
          networkIn: 50000,
          networkOut: 120000,
          iops: 500
        }
      },
      {
        id: 'disk-idle-01',
        name: 'unused-disk',
        type: 'azurerm_managed_disk',
        monthlyCost: 10.00,
        idleDuration: 168,
        metrics: {
          iops: 0,
          diskUtilization: 0
        }
      }
    ];
  }

  private startIdleDetection(): void {
    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      logger.info('Running scheduled idle resource detection');
      
      try {
        // Detect idle resources across all deployments
        await this.detectIdleResources();
      } catch (error: any) {
        logger.error('Error in scheduled idle detection:', error);
      }
    });

    logger.info('Idle resource detection cron job started (every 6 hours)');
  }

  clearIdleResources(deploymentId?: string): void {
    if (deploymentId) {
      // Clear idle resources for specific deployment
      for (const [key, resource] of this.idleResources.entries()) {
        if (resource.deploymentId === deploymentId) {
          this.idleResources.delete(key);
        }
      }
      logger.info('Cleared idle resources for deployment', { deploymentId });
    } else {
      // Clear all
      this.idleResources.clear();
      logger.info('Cleared all idle resources');
    }
  }

  getIdleResourceStats(): {
    totalCount: number;
    totalMonthlyCost: number;
    byType: Record<string, number>;
  } {
    const resources = Array.from(this.idleResources.values());
    const byType: Record<string, number> = {};

    for (const resource of resources) {
      byType[resource.resourceType] = (byType[resource.resourceType] || 0) + 1;
    }

    return {
      totalCount: resources.length,
      totalMonthlyCost: resources.reduce((sum, r) => sum + r.monthlyCost, 0),
      byType
    };
  }
}
