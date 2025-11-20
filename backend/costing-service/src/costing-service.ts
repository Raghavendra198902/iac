import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import logger from './utils/logger';
import { PricingEngine } from './pricing-engine';
import {
  CostEstimateRequest,
  CostEstimate,
  ActualCostRequest,
  ActualCost,
  CostAlert,
  CostBreakdown,
  ResourceCost,
  CostRecommendation
} from './types';

export class CostingService {
  private estimates: Map<string, CostEstimate> = new Map();
  private alerts: Map<string, CostAlert> = new Map();

  constructor(private pricingEngine: PricingEngine) {}

  async estimateCost(request: CostEstimateRequest): Promise<CostEstimate> {
    logger.info('Estimating cost for blueprint', { blueprintId: request.blueprintId });

    const estimateId = uuidv4();
    const duration = request.duration || 12; // default 12 months
    
    // Calculate costs for each resource
    const resourceCosts: ResourceCost[] = [];
    let totalMonthly = 0;

    for (const resource of request.resources) {
      const pricing = await this.pricingEngine.getPricing(
        request.targetCloud,
        request.region,
        resource.type,
        resource.sku
      );

      if (!pricing) {
        logger.warn('No pricing found for resource', { type: resource.type, sku: resource.sku });
        continue;
      }

      const quantity = resource.count || 1;
      const hoursPerMonth = 730; // average hours in a month
      const monthlyCost = pricing.unitPrice * quantity * hoursPerMonth;

      resourceCosts.push({
        resourceName: resource.name,
        resourceType: resource.type,
        sku: pricing.sku,
        quantity,
        unitPrice: pricing.unitPrice,
        monthlyCost,
        yearlyCost: monthlyCost * 12,
        pricingTier: pricing.tier
      });

      totalMonthly += monthlyCost;
    }

    // Add additional costs if requested
    if (request.options?.includeSupport) {
      // Add 10% for support
      totalMonthly *= 1.10;
    }

    if (request.options?.includeNetworkEgress) {
      // Add estimated network egress (5% of total)
      totalMonthly *= 1.05;
    }

    if (request.options?.includeBackup) {
      // Add backup costs (estimated 15% of storage)
      const storageCosts = resourceCosts
        .filter(r => r.resourceType.includes('storage') || r.resourceType.includes('disk'))
        .reduce((sum, r) => sum + r.monthlyCost, 0);
      totalMonthly += storageCosts * 0.15;
    }

    // Calculate breakdown by category
    const breakdown = this.calculateCostBreakdown(resourceCosts);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(request, resourceCosts);

    const estimate: CostEstimate = {
      estimateId,
      blueprintId: request.blueprintId,
      targetCloud: request.targetCloud,
      region: request.region,
      totalCost: {
        hourly: totalMonthly / 730,
        daily: totalMonthly / 30,
        monthly: totalMonthly,
        yearly: totalMonthly * 12,
        currency: 'USD',
        breakdown
      },
      resources: resourceCosts,
      recommendations,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.estimates.set(estimateId, estimate);
    
    logger.info('Cost estimate created', {
      estimateId,
      totalMonthly,
      resourceCount: resourceCosts.length,
      recommendationCount: recommendations.length
    });

    return estimate;
  }

  async getEstimate(estimateId: string): Promise<CostEstimate | undefined> {
    return this.estimates.get(estimateId);
  }

  async getActualCosts(request: ActualCostRequest): Promise<ActualCost> {
    logger.info('Retrieving actual costs', request);

    // Fetch actual costs from cloud provider APIs
    const costs = await this.fetchCloudCosts(request);

    return costs;
  }

  async compareCosts(
    estimateId: string,
    deploymentId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const estimate = this.estimates.get(estimateId);
    if (!estimate) {
      throw new Error('Estimate not found');
    }

    const actual = await this.getActualCosts({
      deploymentId,
      startDate,
      endDate
    });

    const daysInPeriod = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );

    const estimatedCostForPeriod = estimate.totalCost.daily * daysInPeriod;
    const variance = actual.totalCost - estimatedCostForPeriod;
    const variancePercentage = (variance / estimatedCostForPeriod) * 100;

    return {
      estimateId,
      deploymentId,
      period: { start: startDate, end: endDate },
      estimatedCost: estimatedCostForPeriod,
      actualCost: actual.totalCost,
      variance,
      variancePercentage,
      accuracy: 100 - Math.abs(variancePercentage),
      breakdown: {
        estimated: estimate.totalCost.breakdown,
        actual: actual.breakdown
      }
    };
  }

  async getAlerts(filters: any): Promise<CostAlert[]> {
    let alerts = Array.from(this.alerts.values());

    if (filters.blueprintId) {
      alerts = alerts.filter(a => a.blueprintId === filters.blueprintId);
    }

    if (filters.deploymentId) {
      alerts = alerts.filter(a => a.deploymentId === filters.deploymentId);
    }

    if (filters.type) {
      alerts = alerts.filter(a => a.type === filters.type);
    }

    if (filters.severity) {
      alerts = alerts.filter(a => a.severity === filters.severity);
    }

    if (filters.acknowledged !== undefined) {
      alerts = alerts.filter(a => a.acknowledged === filters.acknowledged);
    }

    return alerts.sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime());
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      throw new Error('Alert not found');
    }

    alert.acknowledged = true;
    this.alerts.set(alertId, alert);

    logger.info('Alert acknowledged', { alertId });
  }

  createAlert(alert: Omit<CostAlert, 'alertId' | 'detectedAt' | 'acknowledged'>): CostAlert {
    const newAlert: CostAlert = {
      ...alert,
      alertId: uuidv4(),
      detectedAt: new Date(),
      acknowledged: false
    };

    this.alerts.set(newAlert.alertId, newAlert);
    
    logger.warn('Cost alert created', {
      alertId: newAlert.alertId,
      type: newAlert.type,
      severity: newAlert.severity
    });

    return newAlert;
  }

  private calculateCostBreakdown(resourceCosts: ResourceCost[]): any {
    const breakdown = {
      compute: 0,
      storage: 0,
      network: 0,
      database: 0,
      other: 0
    };

    for (const resource of resourceCosts) {
      const type = resource.resourceType.toLowerCase();
      
      if (type.includes('vm') || type.includes('instance') || type.includes('compute') || type.includes('function')) {
        breakdown.compute += resource.monthlyCost;
      } else if (type.includes('storage') || type.includes('disk') || type.includes('blob') || type.includes('s3')) {
        breakdown.storage += resource.monthlyCost;
      } else if (type.includes('network') || type.includes('load') || type.includes('gateway') || type.includes('vpn')) {
        breakdown.network += resource.monthlyCost;
      } else if (type.includes('database') || type.includes('sql') || type.includes('cosmos') || type.includes('dynamo')) {
        breakdown.database += resource.monthlyCost;
      } else {
        breakdown.other += resource.monthlyCost;
      }
    }

    return breakdown;
  }

  private async generateRecommendations(
    request: CostEstimateRequest,
    resourceCosts: ResourceCost[]
  ): Promise<CostRecommendation[]> {
    const recommendations: CostRecommendation[] = [];

    // Right-sizing recommendations
    for (const resource of resourceCosts) {
      if (resource.monthlyCost > 500 && resource.resourceType.includes('vm')) {
        recommendations.push({
          id: uuidv4(),
          type: 'right_sizing',
          severity: 'medium',
          title: 'Consider right-sizing VM',
          description: `${resource.resourceName} may be over-provisioned. Analyze actual usage to determine optimal size.`,
          currentCost: resource.monthlyCost,
          optimizedCost: resource.monthlyCost * 0.7,
          savingsAmount: resource.monthlyCost * 0.3,
          savingsPercentage: 30,
          resourceName: resource.resourceName,
          implementation: 'Review VM metrics and resize to appropriate SKU',
          effort: 'low'
        });
      }
    }

    // Reserved instance recommendations for production
    if (request.targetCloud !== 'gcp') {
      const computeCosts = resourceCosts.filter(r => 
        r.resourceType.includes('vm') || r.resourceType.includes('instance')
      );

      for (const resource of computeCosts) {
        if (resource.monthlyCost > 100) {
          const riSavings = resource.monthlyCost * 0.4; // 40% savings with RI
          recommendations.push({
            id: uuidv4(),
            type: 'reserved_instance',
            severity: 'high',
            title: 'Purchase Reserved Instances',
            description: `Save up to 40% on ${resource.resourceName} with 1-year or 3-year commitment`,
            currentCost: resource.yearlyCost,
            optimizedCost: resource.yearlyCost - (riSavings * 12),
            savingsAmount: riSavings * 12,
            savingsPercentage: 40,
            resourceName: resource.resourceName,
            implementation: 'Purchase Reserved Instance for predictable workloads',
            effort: 'low'
          });
        }
      }
    }

    return recommendations;
  }

  private async fetchCloudCosts(request: ActualCostRequest): Promise<ActualCost> {
    // Mock implementation - in production, this would call Azure Cost Management,
    // AWS Cost Explorer, or GCP Billing APIs
    
    logger.info('Fetching cloud costs (mock)', request);

    return {
      deploymentId: request.deploymentId,
      blueprintId: request.blueprintId,
      period: {
        start: new Date(request.startDate),
        end: new Date(request.endDate)
      },
      totalCost: 1250.50,
      currency: 'USD',
      breakdown: {
        hourly: 1.71,
        daily: 41.68,
        monthly: 1250.50,
        yearly: 15006.00,
        currency: 'USD',
        breakdown: {
          compute: 600.25,
          storage: 200.15,
          network: 150.10,
          database: 250.00,
          other: 50.00
        }
      },
      trends: [],
      items: []
    };
  }
}
