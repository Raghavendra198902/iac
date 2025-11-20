import axios from 'axios';
import { logger } from './utils/logger';
import { MonitoringRegistration, HealthStatus, HealthCheck } from './types';

export class HealthMonitor {
  private deployments: Map<string, MonitoringRegistration> = new Map();

  async registerDeployment(registration: MonitoringRegistration): Promise<void> {
    this.deployments.set(registration.deploymentId, registration);
    logger.info('Deployment registered for health monitoring', { deploymentId: registration.deploymentId });
  }

  async checkAll(): Promise<void> {
    for (const [deploymentId, registration] of this.deployments) {
      if (registration.enabled) {
        try {
          await this.performHealthCheck(deploymentId);
        } catch (error: any) {
          logger.error('Health check failed', { deploymentId, error: error.message });
        }
      }
    }
  }

  private async performHealthCheck(deploymentId: string): Promise<void> {
    logger.info('Performing health check', { deploymentId });
    
    const endpoints = await this.getEndpoints(deploymentId);
    const checks: HealthCheck[] = [];
    
    for (const endpoint of endpoints) {
      const check = await this.checkEndpoint(endpoint);
      checks.push(check);
      
      if (check.status === 'unhealthy') {
        await this.handleUnhealthyService(deploymentId, endpoint, check);
      }
    }
  }

  private async checkEndpoint(endpoint: any): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(endpoint.url, { timeout: 5000 });
      const responseTime = Date.now() - startTime;
      
      return {
        name: endpoint.name,
        status: response.status === 200 ? 'healthy' : 'degraded',
        responseTime
      };
    } catch (error: any) {
      return {
        name: endpoint.name,
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  private async handleUnhealthyService(
    deploymentId: string,
    endpoint: any,
    check: HealthCheck
  ): Promise<void> {
    logger.warn('Unhealthy service detected', { deploymentId, endpoint: endpoint.name });
    
    // Auto-restart policy
    const policy = await this.getRemediationPolicy(deploymentId);
    
    if (policy.autoRestart) {
      await this.restartService(deploymentId, endpoint.name);
    }
  }

  private async restartService(deploymentId: string, serviceName: string): Promise<void> {
    logger.info('Restarting service', { deploymentId, serviceName });
    
    try {
      await axios.post('http://orchestrator:3005/api/services/restart', {
        deploymentId,
        serviceName
      });
      
      logger.info('Service restart initiated', { deploymentId, serviceName });
    } catch (error: any) {
      logger.error('Service restart failed', { deploymentId, serviceName, error: error.message });
    }
  }

  private async getEndpoints(deploymentId: string): Promise<any[]> {
    const response = await axios.get(`http://orchestrator:3005/api/deployments/${deploymentId}/endpoints`);
    return response.data;
  }

  private async getRemediationPolicy(deploymentId: string): Promise<any> {
    return {
      autoRestart: true,
      maxAttempts: 3
    };
  }

  async getStatus(deploymentId: string): Promise<HealthStatus> {
    return {
      status: 'healthy',
      checks: [],
      lastCheck: new Date()
    };
  }
}
