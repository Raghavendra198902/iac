import axios from 'axios';
import { logger } from './utils/logger';
import { MonitoringRegistration, DriftReport, DriftItem } from './types';

export class DriftDetector {
  private deployments: Map<string, MonitoringRegistration> = new Map();

  async registerDeployment(registration: MonitoringRegistration): Promise<void> {
    this.deployments.set(registration.deploymentId, registration);
    logger.info('Deployment registered for drift detection', { deploymentId: registration.deploymentId });
  }

  async scanAll(): Promise<void> {
    for (const [deploymentId, registration] of this.deployments) {
      if (registration.enabled) {
        try {
          await this.detectDrift(deploymentId);
        } catch (error: any) {
          logger.error('Drift detection failed', { deploymentId, error: error.message });
        }
      }
    }
  }

  private async detectDrift(deploymentId: string): Promise<void> {
    logger.info('Detecting drift', { deploymentId });

    // Get current state from cloud provider
    const currentState = await this.getCurrentState(deploymentId);
    
    // Get expected state from blueprint
    const expectedState = await this.getExpectedState(deploymentId);
    
    // Compare states
    const driftItems = this.compareStates(currentState, expectedState);
    
    if (driftItems.length > 0) {
      logger.warn('Drift detected', { deploymentId, driftCount: driftItems.length });
      
      // Auto-remediate if policy allows
      for (const item of driftItems) {
        if (item.action === 'auto-fix') {
          await this.autoRemediateDrift(deploymentId, item);
        }
      }
    }
  }

  private compareStates(current: any, expected: any): DriftItem[] {
    const driftItems: DriftItem[] = [];
    
    // Simplified comparison logic
    for (const resource of expected.resources || []) {
      const currentResource = current.resources?.find((r: any) => r.id === resource.id);
      
      if (!currentResource) {
        driftItems.push({
          resource: resource.id,
          property: 'existence',
          expected: 'exists',
          actual: 'missing',
          severity: 'high',
          action: 'notify'
        });
        continue;
      }
      
      // Check properties
      for (const [key, value] of Object.entries(resource.properties || {})) {
        if (JSON.stringify(currentResource.properties[key]) !== JSON.stringify(value)) {
          driftItems.push({
            resource: resource.id,
            property: key,
            expected: value,
            actual: currentResource.properties[key],
            severity: this.calculateSeverity(key),
            action: this.determineAction(key)
          });
        }
      }
    }
    
    return driftItems;
  }

  private calculateSeverity(property: string): 'low' | 'medium' | 'high' {
    const highSeverityProps = ['security_rules', 'access_policy', 'encryption'];
    const mediumSeverityProps = ['tags', 'address_space', 'dns_servers'];
    
    if (highSeverityProps.some(p => property.includes(p))) return 'high';
    if (mediumSeverityProps.some(p => property.includes(p))) return 'medium';
    return 'low';
  }

  private determineAction(property: string): 'auto-fix' | 'notify' | 'manual' {
    const autoFixProps = ['tags', 'description'];
    const notifyProps = ['address_space', 'dns_servers'];
    
    if (autoFixProps.some(p => property.includes(p))) return 'auto-fix';
    if (notifyProps.some(p => property.includes(p))) return 'notify';
    return 'manual';
  }

  private async autoRemediateDrift(deploymentId: string, driftItem: DriftItem): Promise<void> {
    logger.info('Auto-remediating drift', { deploymentId, resource: driftItem.resource });
    
    try {
      await axios.post('http://orchestrator:3005/api/remediate', {
        deploymentId,
        resource: driftItem.resource,
        property: driftItem.property,
        expectedValue: driftItem.expected
      });
      
      logger.info('Drift remediation successful', { deploymentId, resource: driftItem.resource });
    } catch (error: any) {
      logger.error('Drift remediation failed', { deploymentId, error: error.message });
    }
  }

  private async getCurrentState(deploymentId: string): Promise<any> {
    const response = await axios.get(`http://orchestrator:3005/api/deployments/${deploymentId}/state`);
    return response.data;
  }

  private async getExpectedState(deploymentId: string): Promise<any> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) throw new Error('Deployment not found');
    
    const response = await axios.get(`http://blueprint-service:3001/api/blueprints/${deployment.blueprintId}/state`);
    return response.data;
  }

  async getStatus(deploymentId: string): Promise<any> {
    return {
      detected: false,
      lastCheck: new Date()
    };
  }

  async getDriftReport(deploymentId: string): Promise<DriftReport> {
    const registration = this.deployments.get(deploymentId);
    
    if (!registration) {
      throw new Error('Deployment not registered');
    }
    
    return {
      deploymentId,
      driftDetected: false,
      driftItems: [],
      autoRemediationEnabled: true,
      lastCheck: new Date()
    };
  }
}
