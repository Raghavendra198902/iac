import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { DeploymentRequest, DeploymentState, ResourceState } from '../types';

const execAsync = promisify(exec);

export class BicepExecutor {
  private workDir: string;

  constructor() {
    this.workDir = process.env.BICEP_WORK_DIR || '/tmp/bicep';
  }

  async plan(code: string, request: DeploymentRequest): Promise<any> {
    const projectDir = await this.setupProject(code, request);

    try {
      // Build Bicep to ARM template
      logger.info('Building Bicep template', { projectDir });
      await execAsync('az bicep build --file main.bicep', { cwd: projectDir });

      // Validate deployment
      logger.info('Validating Azure deployment', { projectDir });
      const { stdout } = await execAsync(
        `az deployment group validate \\
          --resource-group ${request.options?.resourceGroup || 'dharma-rg'} \\
          --template-file main.json \\
          --parameters environment=${request.environment}`,
        { cwd: projectDir }
      );

      const validation = JSON.parse(stdout);
      const resourceCount = validation.properties?.validatedResources?.length || 0;

      return {
        resourceCount,
        validation
      };
    } catch (error: any) {
      logger.error('Bicep validation failed', { error: error.message });
      throw new Error(`Bicep validation failed: ${error.message}`);
    }
  }

  async apply(
    code: string,
    request: DeploymentRequest,
    plan: any
  ): Promise<{ state: DeploymentState; outputs: Record<string, any> }> {
    const projectDir = await this.setupProject(code, request);

    try {
      // Deploy to Azure
      logger.info('Deploying to Azure', { projectDir });
      const deploymentName = `deployment-${uuidv4()}`;
      
      const { stdout } = await execAsync(
        `az deployment group create \\
          --name ${deploymentName} \\
          --resource-group ${request.options?.resourceGroup || 'dharma-rg'} \\
          --template-file main.bicep \\
          --parameters environment=${request.environment} \\
          --output json`,
        { cwd: projectDir }
      );

      const deployment = JSON.parse(stdout);

      // Convert to our state format
      const state: DeploymentState = {
        stateId: deploymentName,
        version: 1,
        resources: this.convertAzureState(deployment),
        lastModified: new Date(),
        locked: false
      };

      const outputs = deployment.properties?.outputs || {};

      return { state, outputs };
    } catch (error: any) {
      logger.error('Bicep deployment failed', { error: error.message });
      throw new Error(`Bicep deployment failed: ${error.message}`);
    }
  }

  async destroy(resourceGroup: string): Promise<void> {
    try {
      logger.info('Deleting Azure resource group', { resourceGroup });
      await execAsync(`az group delete --name ${resourceGroup} --yes --no-wait`);
    } catch (error: any) {
      logger.error('Resource group deletion failed', { error: error.message });
      throw new Error(`Resource group deletion failed: ${error.message}`);
    }
  }

  private async setupProject(
    code: string,
    request: DeploymentRequest
  ): Promise<string> {
    const projectId = uuidv4();
    const projectDir = path.join(this.workDir, projectId);

    await mkdir(projectDir, { recursive: true });
    await writeFile(path.join(projectDir, 'main.bicep'), code);

    logger.info('Bicep project setup complete', { projectDir });

    return projectDir;
  }

  private convertAzureState(deployment: any): ResourceState[] {
    const resources: ResourceState[] = [];

    if (!deployment.properties?.outputResources) {
      return resources;
    }

    for (const resource of deployment.properties.outputResources) {
      resources.push({
        id: resource.id,
        type: resource.type || 'Unknown',
        name: resource.id.split('/').pop() || 'unknown',
        provider: 'azurerm',
        attributes: {},
        dependencies: [],
        status: 'created'
      });
    }

    return resources;
  }
}
