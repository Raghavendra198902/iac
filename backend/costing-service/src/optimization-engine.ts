import { v4 as uuidv4 } from 'uuid';
import logger from './utils/logger';
import { PricingEngine } from './pricing-engine';
import {
  OptimizationReport,
  CostRecommendation,
  ResourceCost
} from './types';

export class OptimizationEngine {
  private reports: Map<string, OptimizationReport> = new Map();

  constructor(private pricingEngine: PricingEngine) {}

  async generateReport(
    blueprintId?: string,
    deploymentId?: string
  ): Promise<OptimizationReport> {
    logger.info('Generating optimization report', { blueprintId, deploymentId });

    const reportId = uuidv4();
    
    // Fetch current costs and resources
    const resources = await this.fetchResources(blueprintId, deploymentId);
    
    // Generate recommendations
    const recommendations = await this.analyzeAndRecommend(resources);

    // Calculate savings by type
    const summary = {
      rightSizing: this.summarizeByType(recommendations, 'right_sizing'),
      reservedInstances: this.summarizeByType(recommendations, 'reserved_instance'),
      idleResources: this.summarizeByType(recommendations, 'idle_resource'),
      storageTiering: this.summarizeByType(recommendations, 'storage_tier')
    };

    const currentMonthlyCost = resources.reduce((sum, r) => sum + (r.monthlyCost || 0), 0);
    const totalSavings = recommendations.reduce((sum, r) => sum + r.savingsAmount, 0);
    const optimizedMonthlyCost = currentMonthlyCost - totalSavings;

    const report: OptimizationReport = {
      reportId,
      blueprintId,
      deploymentId,
      generatedAt: new Date(),
      currentMonthlyCost,
      optimizedMonthlyCost,
      totalSavings,
      savingsPercentage: (totalSavings / currentMonthlyCost) * 100,
      recommendations,
      summary
    };

    this.reports.set(reportId, report);

    logger.info('Optimization report generated', {
      reportId,
      currentMonthlyCost,
      totalSavings,
      savingsPercentage: report.savingsPercentage.toFixed(2),
      recommendationCount: recommendations.length
    });

    return report;
  }

  async getRecommendations(filters?: {
    blueprintId?: string;
    deploymentId?: string;
    type?: CostRecommendation['type'];
    minSavings?: number;
  }): Promise<CostRecommendation[]> {
    // Generate fresh recommendations
    const report = await this.generateReport(filters?.blueprintId, filters?.deploymentId);
    
    let recommendations = report.recommendations;

    if (filters?.type) {
      recommendations = recommendations.filter(r => r.type === filters.type);
    }

    if (filters?.minSavings) {
      recommendations = recommendations.filter(r => r.savingsAmount >= filters.minSavings);
    }

    // Sort by savings amount (highest first)
    return recommendations.sort((a, b) => b.savingsAmount - a.savingsAmount);
  }

  private async fetchResources(
    blueprintId?: string,
    deploymentId?: string
  ): Promise<ResourceCost[]> {
    // Mock implementation - in production, fetch from deployment state
    // or cloud provider resource APIs

    return [
      {
        resourceName: 'web-vm-01',
        resourceType: 'azurerm_virtual_machine',
        sku: 'Standard_D4s_v3',
        quantity: 1,
        unitPrice: 0.192,
        monthlyCost: 140.16,
        yearlyCost: 1681.92,
        pricingTier: 'Standard'
      },
      {
        resourceName: 'db-vm-01',
        resourceType: 'azurerm_virtual_machine',
        sku: 'Standard_E8s_v3',
        quantity: 1,
        unitPrice: 0.504,
        monthlyCost: 367.92,
        yearlyCost: 4415.04,
        pricingTier: 'Standard'
      },
      {
        resourceName: 'storage-account-01',
        resourceType: 'azurerm_storage_account',
        sku: 'Standard_LRS',
        quantity: 1000, // GB
        unitPrice: 0.02,
        monthlyCost: 20.00,
        yearlyCost: 240.00,
        pricingTier: 'Standard'
      }
    ];
  }

  private async analyzeAndRecommend(resources: ResourceCost[]): Promise<CostRecommendation[]> {
    const recommendations: CostRecommendation[] = [];

    for (const resource of resources) {
      // Right-sizing analysis
      if (this.isOversizedVM(resource)) {
        recommendations.push(this.createRightSizingRecommendation(resource));
      }

      // Reserved instance analysis
      if (this.shouldUseReservedInstance(resource)) {
        recommendations.push(this.createReservedInstanceRecommendation(resource));
      }

      // Savings plan analysis (for AWS/Azure)
      if (this.shouldUseSavingsPlan(resource)) {
        recommendations.push(this.createSavingsPlanRecommendation(resource));
      }

      // Storage tiering analysis
      if (this.shouldOptimizeStorage(resource)) {
        recommendations.push(this.createStorageTieringRecommendation(resource));
      }

      // Spot/preemptible instance analysis
      if (this.canUseSpotInstance(resource)) {
        recommendations.push(this.createSpotInstanceRecommendation(resource));
      }
    }

    return recommendations;
  }

  private isOversizedVM(resource: ResourceCost): boolean {
    // Check if VM is likely oversized based on SKU and typical utilization patterns
    const type = resource.resourceType.toLowerCase();
    
    if (!type.includes('vm') && !type.includes('instance')) {
      return false;
    }

    // Mock logic - in production, analyze actual CPU/memory metrics
    const isLargeVM = resource.sku.includes('D4') || resource.sku.includes('D8') || 
                      resource.sku.includes('E8') || resource.sku.includes('E16');

    return isLargeVM && resource.monthlyCost > 100;
  }

  private shouldUseReservedInstance(resource: ResourceCost): boolean {
    const type = resource.resourceType.toLowerCase();
    
    // RIs are good for long-running VMs with predictable usage
    return (type.includes('vm') || type.includes('instance')) && resource.monthlyCost > 50;
  }

  private shouldUseSavingsPlan(resource: ResourceCost): boolean {
    // Savings plans offer flexibility across instance families
    return resource.monthlyCost > 200;
  }

  private shouldOptimizeStorage(resource: ResourceCost): boolean {
    const type = resource.resourceType.toLowerCase();
    return type.includes('storage') || type.includes('disk') || type.includes('blob');
  }

  private canUseSpotInstance(resource: ResourceCost): boolean {
    const type = resource.resourceType.toLowerCase();
    
    // Spot instances good for fault-tolerant, flexible workloads
    // Mock logic - check resource tags or naming conventions
    const name = resource.resourceName.toLowerCase();
    const isBatchOrDev = name.includes('batch') || name.includes('dev') || name.includes('test');

    return (type.includes('vm') || type.includes('instance')) && isBatchOrDev;
  }

  private createRightSizingRecommendation(resource: ResourceCost): CostRecommendation {
    // Recommend one tier down
    const optimizedCost = resource.monthlyCost * 0.65; // 35% savings typical
    const savings = resource.monthlyCost - optimizedCost;

    return {
      id: uuidv4(),
      type: 'right_sizing',
      severity: savings > 100 ? 'high' : 'medium',
      title: `Right-size ${resource.resourceName}`,
      description: `Resource appears oversized. Consider downsizing from ${resource.sku} to a smaller SKU based on actual utilization metrics.`,
      currentCost: resource.monthlyCost,
      optimizedCost,
      savingsAmount: savings,
      savingsPercentage: 35,
      resourceName: resource.resourceName,
      implementation: 'Analyze CPU, memory, and disk metrics over 30 days. If average utilization < 40%, downsize to next smaller SKU.',
      effort: 'low'
    };
  }

  private createReservedInstanceRecommendation(resource: ResourceCost): CostRecommendation {
    const optimizedCost = resource.monthlyCost * 0.6; // 40% savings with 1-year RI
    const savings = resource.monthlyCost - optimizedCost;
    const yearlySavings = savings * 12;

    return {
      id: uuidv4(),
      type: 'reserved_instance',
      severity: yearlySavings > 1000 ? 'critical' : 'high',
      title: `Purchase Reserved Instance for ${resource.resourceName}`,
      description: `Save up to 40% with 1-year Reserved Instance or 60% with 3-year commitment for predictable workloads.`,
      currentCost: resource.monthlyCost,
      optimizedCost,
      savingsAmount: savings,
      savingsPercentage: 40,
      resourceName: resource.resourceName,
      implementation: 'Purchase 1-year or 3-year Reserved Instance commitment. Best for always-on production workloads.',
      effort: 'low'
    };
  }

  private createSavingsPlanRecommendation(resource: ResourceCost): CostRecommendation {
    const optimizedCost = resource.monthlyCost * 0.65; // 35% savings
    const savings = resource.monthlyCost - optimizedCost;

    return {
      id: uuidv4(),
      type: 'savings_plan',
      severity: 'high',
      title: `Enroll in Savings Plan for ${resource.resourceName}`,
      description: `Flexible savings plan provides 35% discount with ability to change instance types and regions.`,
      currentCost: resource.monthlyCost,
      optimizedCost,
      savingsAmount: savings,
      savingsPercentage: 35,
      resourceName: resource.resourceName,
      implementation: 'Purchase Compute Savings Plan with 1-year or 3-year commitment. More flexible than Reserved Instances.',
      effort: 'low'
    };
  }

  private createStorageTieringRecommendation(resource: ResourceCost): CostRecommendation {
    const optimizedCost = resource.monthlyCost * 0.7; // 30% savings
    const savings = resource.monthlyCost - optimizedCost;

    return {
      id: uuidv4(),
      type: 'storage_tier',
      severity: 'medium',
      title: `Optimize storage tier for ${resource.resourceName}`,
      description: `Move infrequently accessed data to cool or archive tier. Lifecycle policies can automate tiering.`,
      currentCost: resource.monthlyCost,
      optimizedCost,
      savingsAmount: savings,
      savingsPercentage: 30,
      resourceName: resource.resourceName,
      implementation: 'Configure lifecycle management to move data to cool tier after 30 days, archive after 90 days.',
      effort: 'medium'
    };
  }

  private createSpotInstanceRecommendation(resource: ResourceCost): CostRecommendation {
    const optimizedCost = resource.monthlyCost * 0.3; // 70% savings
    const savings = resource.monthlyCost - optimizedCost;

    return {
      id: uuidv4(),
      type: 'spot_instance',
      severity: 'high',
      title: `Use Spot/Preemptible Instance for ${resource.resourceName}`,
      description: `Save up to 70% with spot instances for fault-tolerant workloads. Can be interrupted with short notice.`,
      currentCost: resource.monthlyCost,
      optimizedCost,
      savingsAmount: savings,
      savingsPercentage: 70,
      resourceName: resource.resourceName,
      implementation: 'Convert to spot instance. Implement checkpointing and graceful interruption handling.',
      effort: 'high'
    };
  }

  private summarizeByType(
    recommendations: CostRecommendation[],
    type: CostRecommendation['type']
  ): { count: number; savings: number } {
    const filtered = recommendations.filter(r => r.type === type);
    
    return {
      count: filtered.length,
      savings: filtered.reduce((sum, r) => sum + r.savingsAmount, 0)
    };
  }
}
