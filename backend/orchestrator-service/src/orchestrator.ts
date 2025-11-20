import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { logger } from './utils/logger';
import { 
  DeploymentRequest, 
  Deployment, 
  RollbackRequest,
  DeploymentLog 
} from './types';
import { TerraformExecutor } from './executors/terraform';
import { BicepExecutor } from './executors/bicep';
import { CloudFormationExecutor } from './executors/cloudformation';
import { StateManager } from './state-manager';

export class DeploymentOrchestrator {
  private deployments: Map<string, Deployment>;
  private stateManager: StateManager;
  private activeDeployments: Set<string>;

  constructor() {
    this.deployments = new Map();
    this.stateManager = new StateManager();
    this.activeDeployments = new Set();
  }

  async startDeployment(request: DeploymentRequest): Promise<Deployment> {
    const deploymentId = uuidv4();

    const deployment: Deployment = {
      id: deploymentId,
      blueprintId: request.blueprintId,
      generationJobId: request.generationJobId,
      environment: request.environment,
      targetCloud: request.targetCloud,
      format: request.format,
      status: 'pending',
      createdAt: new Date(),
      logs: []
    };

    this.deployments.set(deploymentId, deployment);
    this.activeDeployments.add(deploymentId);

    // Start deployment asynchronously
    this.executeDeployment(deploymentId, request).catch(error => {
      logger.error('Deployment execution failed', { 
        deploymentId, 
        error: error.message 
      });
      this.updateDeploymentStatus(deploymentId, 'failed', error.message);
    });

    return deployment;
  }

  private async executeDeployment(
    deploymentId: string,
    request: DeploymentRequest
  ): Promise<void> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) return;

    try {
      // Update status to planning
      this.updateDeploymentStatus(deploymentId, 'planning');
      this.addLog(deploymentId, 'info', 'Starting deployment planning');

      // Fetch generated IaC code
      const iacCode = await this.fetchGeneratedCode(request.generationJobId);
      this.addLog(deploymentId, 'info', 'Retrieved generated IaC code');

      // Get executor based on format
      const executor = this.getExecutor(request.format);

      // Dry run / plan
      this.addLog(deploymentId, 'info', 'Executing plan phase');
      const plan = await executor.plan(iacCode, request);
      this.addLog(deploymentId, 'info', `Plan completed: ${plan.resourceCount} resources`);

      // Check if auto-approve or requires manual approval
      if (!request.options?.autoApprove && request.environment === 'production') {
        this.addLog(deploymentId, 'info', 'Waiting for manual approval');
        // In production, would wait for approval via workflow
        return;
      }

      // Update status to applying
      this.updateDeploymentStatus(deploymentId, 'applying');
      this.addLog(deploymentId, 'info', 'Starting infrastructure deployment');

      // Execute deployment
      const result = await executor.apply(iacCode, request, plan);

      // Save state
      await this.stateManager.saveState(deploymentId, result.state);
      this.addLog(deploymentId, 'info', 'State saved successfully');

      // Update deployment with outputs
      deployment.outputs = result.outputs;
      deployment.state = result.state;
      deployment.completedAt = new Date();

      this.updateDeploymentStatus(deploymentId, 'completed');
      this.addLog(deploymentId, 'info', 'Deployment completed successfully');

      logger.info('Deployment completed', {
        deploymentId,
        resourceCount: result.state.resources.length,
        duration: deployment.completedAt.getTime() - deployment.createdAt.getTime()
      });

    } catch (error: any) {
      this.addLog(deploymentId, 'error', `Deployment failed: ${error.message}`);
      throw error;
    } finally {
      this.activeDeployments.delete(deploymentId);
    }
  }

  private async fetchGeneratedCode(generationJobId: string): Promise<string> {
    const generatorUrl = process.env.IAC_GENERATOR_URL || 'http://iac-generator:3002';
    
    try {
      const response = await axios.get(
        `${generatorUrl}/api/generate/${generationJobId}/download`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch generated code: ${error.message}`);
    }
  }

  private getExecutor(format: string): any {
    switch (format) {
      case 'terraform':
        return new TerraformExecutor();
      case 'bicep':
        return new BicepExecutor();
      case 'cloudformation':
        return new CloudFormationExecutor();
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private updateDeploymentStatus(
    deploymentId: string, 
    status: Deployment['status'],
    error?: string
  ): void {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) return;

    deployment.status = status;
    if (error) {
      deployment.error = error;
    }

    if (status === 'applying' && !deployment.startedAt) {
      deployment.startedAt = new Date();
    }

    if (status === 'completed' || status === 'failed') {
      deployment.completedAt = new Date();
    }
  }

  private addLog(
    deploymentId: string,
    level: DeploymentLog['level'],
    message: string,
    resource?: string
  ): void {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) return;

    const log: DeploymentLog = {
      timestamp: new Date(),
      level,
      message,
      resource
    };

    deployment.logs = deployment.logs || [];
    deployment.logs.push(log);

    logger.log(level, message, { deploymentId, resource });
  }

  async cancelDeployment(deploymentId: string): Promise<boolean> {
    const deployment = this.deployments.get(deploymentId);
    if (!deployment) return false;

    if (!this.activeDeployments.has(deploymentId)) {
      return false;
    }

    // In production, would signal the executor to stop
    this.activeDeployments.delete(deploymentId);
    this.updateDeploymentStatus(deploymentId, 'failed', 'Cancelled by user');
    this.addLog(deploymentId, 'info', 'Deployment cancelled');

    return true;
  }

  async rollback(request: RollbackRequest): Promise<Deployment> {
    const originalDeployment = this.deployments.get(request.deploymentId);
    if (!originalDeployment) {
      throw new Error('Original deployment not found');
    }

    logger.info('Starting rollback', {
      deploymentId: request.deploymentId,
      reason: request.reason
    });

    // Create new deployment for rollback
    const rollbackDeployment: Deployment = {
      id: uuidv4(),
      blueprintId: originalDeployment.blueprintId,
      generationJobId: originalDeployment.generationJobId,
      environment: originalDeployment.environment,
      targetCloud: originalDeployment.targetCloud,
      format: originalDeployment.format,
      status: 'applying',
      createdAt: new Date(),
      logs: [{
        timestamp: new Date(),
        level: 'info',
        message: `Rollback initiated: ${request.reason}`
      }]
    };

    this.deployments.set(rollbackDeployment.id, rollbackDeployment);

    // Execute rollback (in production, would restore previous state)
    try {
      const previousState = await this.stateManager.getStateVersion(
        request.deploymentId,
        request.targetVersion
      );

      if (previousState) {
        await this.stateManager.saveState(rollbackDeployment.id, previousState);
      }

      rollbackDeployment.status = 'completed';
      rollbackDeployment.completedAt = new Date();

      // Update original deployment status
      originalDeployment.status = 'rolled_back';

      logger.info('Rollback completed', { deploymentId: rollbackDeployment.id });
    } catch (error: any) {
      rollbackDeployment.status = 'failed';
      rollbackDeployment.error = error.message;
      logger.error('Rollback failed', { error: error.message });
    }

    return rollbackDeployment;
  }

  async getDeployment(id: string): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }

  async listDeployments(filters: {
    blueprintId?: string;
    environment?: string;
    status?: string;
    limit: number;
  }): Promise<Deployment[]> {
    let deployments = Array.from(this.deployments.values());

    if (filters.blueprintId) {
      deployments = deployments.filter(d => d.blueprintId === filters.blueprintId);
    }

    if (filters.environment) {
      deployments = deployments.filter(d => d.environment === filters.environment);
    }

    if (filters.status) {
      deployments = deployments.filter(d => d.status === filters.status);
    }

    return deployments
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, filters.limit);
  }

  async getDeploymentLogs(deploymentId: string): Promise<DeploymentLog[] | undefined> {
    const deployment = this.deployments.get(deploymentId);
    return deployment?.logs;
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down orchestrator', {
      activeDeployments: this.activeDeployments.size
    });

    // Wait for active deployments to complete or timeout
    const timeout = 30000; // 30 seconds
    const startTime = Date.now();

    while (this.activeDeployments.size > 0 && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (this.activeDeployments.size > 0) {
      logger.warn('Shutdown with active deployments', {
        count: this.activeDeployments.size
      });
    }
  }
}
