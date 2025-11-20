import axios from 'axios';
import { logger } from './utils/logger';
import { MonitoringRegistration, CostStatus } from './types';

export class CostMonitor {
  private deployments: Map<string, MonitoringRegistration> = new Map();

  async registerDeployment(registration: MonitoringRegistration): Promise<void> {
    this.deployments.set(registration.deploymentId, registration);
    logger.info('Deployment registered for cost monitoring', { deploymentId: registration.deploymentId });
  }

  async analyzeAll(): Promise<void> {
    for (const [deploymentId, registration] of this.deployments) {
      if (registration.enabled) {
        try {
          await this.analyzeCost(deploymentId);
        } catch (error: any) {
          logger.error('Cost analysis failed', { deploymentId, error: error.message });
        }
      }
    }
  }

  private async analyzeCost(deploymentId: string): Promise<void> {
    logger.info('Analyzing cost', { deploymentId });
    
    const currentCost = await this.getCurrentCost(deploymentId);
    const budget = await this.getBudget(deploymentId);
    const trend = await this.calculateTrend(deploymentId);
    
    if (currentCost > budget * 0.9) {
      logger.warn('Cost approaching budget limit', { deploymentId, currentCost, budget });
      await this.triggerCostAlert(deploymentId, currentCost, budget);
    }
    
    const idleResources = await this.detectIdleResources(deploymentId);
    if (idleResources.length > 0) {
      logger.info('Idle resources detected', { deploymentId, count: idleResources.length });
      await this.optimizeIdleResources(deploymentId, idleResources);
    }
  }

  private async getCurrentCost(deploymentId: string): Promise<number> {
    const response = await axios.get(`http://costing-service:3004/api/deployments/${deploymentId}/cost`);
    return response.data.currentCost;
  }

  private async getBudget(deploymentId: string): Promise<number> {
    const response = await axios.get(`http://costing-service:3004/api/deployments/${deploymentId}/budget`);
    return response.data.budget;
  }

  private async calculateTrend(deploymentId: string): Promise<'increasing' | 'stable' | 'decreasing'> {
    const response = await axios.get(`http://costing-service:3004/api/deployments/${deploymentId}/trend`);
    return response.data.trend;
  }

  private async detectIdleResources(deploymentId: string): Promise<any[]> {
    const response = await axios.get(`http://costing-service:3004/api/deployments/${deploymentId}/idle`);
    return response.data.idleResources;
  }

  private async optimizeIdleResources(deploymentId: string, resources: any[]): Promise<void> {
    logger.info('Optimizing idle resources', { deploymentId, count: resources.length });
    
    for (const resource of resources) {
      if (resource.recommendation === 'stop') {
        await this.stopResource(deploymentId, resource.id);
      }
    }
  }

  private async stopResource(deploymentId: string, resourceId: string): Promise<void> {
    await axios.post('http://orchestrator:3005/api/resources/stop', {
      deploymentId,
      resourceId
    });
    
    logger.info('Resource stopped', { deploymentId, resourceId });
  }

  private async triggerCostAlert(deploymentId: string, currentCost: number, budget: number): Promise<void> {
    await axios.post('http://api-gateway:3000/api/alerts', {
      type: 'cost',
      severity: 'warning',
      deploymentId,
      message: `Cost ${currentCost} approaching budget ${budget}`,
      timestamp: new Date()
    });
  }

  async getStatus(deploymentId: string): Promise<CostStatus> {
    return {
      current: 0,
      budget: 0,
      trend: 'stable',
      anomalies: [],
      lastCheck: new Date()
    };
  }
}
