import axios from 'axios';
import { logger } from './utils/logger';
import { RemediationAction, RemediationResult } from './types';

export class RemediationEngine {
  async executeRemediation(action: RemediationAction): Promise<RemediationResult> {
    logger.info('Executing remediation', action);
    
    try {
      switch (action.action) {
        case 'fix-drift':
          return await this.fixDrift(action.deploymentId);
        case 'restart-service':
          return await this.restartService(action.deploymentId);
        case 'scale-up':
          return await this.scaleUp(action.deploymentId);
        case 'scale-down':
          return await this.scaleDown(action.deploymentId);
        case 'rollback':
          return await this.rollback(action.deploymentId);
        default:
          throw new Error(`Unknown action: ${action.action}`);
      }
    } catch (error: any) {
      logger.error('Remediation failed', { action, error: error.message });
      return {
        success: false,
        action: action.action,
        details: error.message,
        timestamp: new Date()
      };
    }
  }

  private async fixDrift(deploymentId: string): Promise<RemediationResult> {
    await axios.post('http://orchestrator:3005/api/remediate/drift', { deploymentId });
    
    return {
      success: true,
      action: 'fix-drift',
      details: 'Configuration drift corrected',
      timestamp: new Date()
    };
  }

  private async restartService(deploymentId: string): Promise<RemediationResult> {
    await axios.post('http://orchestrator:3005/api/services/restart', { deploymentId });
    
    return {
      success: true,
      action: 'restart-service',
      details: 'Service restarted successfully',
      timestamp: new Date()
    };
  }

  private async scaleUp(deploymentId: string): Promise<RemediationResult> {
    await axios.post('http://orchestrator:3005/api/scale', {
      deploymentId,
      direction: 'up'
    });
    
    return {
      success: true,
      action: 'scale-up',
      details: 'Resources scaled up',
      timestamp: new Date()
    };
  }

  private async scaleDown(deploymentId: string): Promise<RemediationResult> {
    await axios.post('http://orchestrator:3005/api/scale', {
      deploymentId,
      direction: 'down'
    });
    
    return {
      success: true,
      action: 'scale-down',
      details: 'Resources scaled down',
      timestamp: new Date()
    };
  }

  private async rollback(deploymentId: string): Promise<RemediationResult> {
    await axios.post('http://orchestrator:3005/api/rollback', { deploymentId });
    
    return {
      success: true,
      action: 'rollback',
      details: 'Deployment rolled back to previous version',
      timestamp: new Date()
    };
  }
}
