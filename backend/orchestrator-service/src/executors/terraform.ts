import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { DeploymentRequest, DeploymentState, ResourceState } from '../types';

const execAsync = promisify(exec);

export class TerraformExecutor {
  private workDir: string;

  constructor() {
    this.workDir = process.env.TERRAFORM_WORK_DIR || '/tmp/terraform';
  }

  async plan(code: string, request: DeploymentRequest): Promise<any> {
    const projectDir = await this.setupProject(code, request);

    try {
      // Initialize Terraform
      logger.info('Initializing Terraform', { projectDir });
      await execAsync('terraform init', { cwd: projectDir });

      // Run plan
      logger.info('Running Terraform plan', { projectDir });
      const { stdout } = await execAsync('terraform plan -json', { cwd: projectDir });

      // Parse plan output
      const planLines = stdout.split('\n').filter(line => line.trim());
      let resourceCount = 0;
      
      for (const line of planLines) {
        try {
          const planItem = JSON.parse(line);
          if (planItem.type === 'planned_change') {
            resourceCount++;
          }
        } catch {
          // Skip non-JSON lines
        }
      }

      return {
        resourceCount,
        changes: stdout
      };
    } catch (error: any) {
      logger.error('Terraform plan failed', { error: error.message });
      throw new Error(`Terraform plan failed: ${error.message}`);
    }
  }

  async apply(
    code: string,
    request: DeploymentRequest,
    plan: any
  ): Promise<{ state: DeploymentState; outputs: Record<string, any> }> {
    const projectDir = await this.setupProject(code, request);

    try {
      // Apply infrastructure
      logger.info('Applying Terraform', { projectDir });
      const applyCommand = request.options?.autoApprove 
        ? 'terraform apply -auto-approve -json'
        : 'terraform apply -json';

      await execAsync(applyCommand, { cwd: projectDir });

      // Get state
      const { stdout: stateJson } = await execAsync('terraform show -json', { 
        cwd: projectDir 
      });
      const tfState = JSON.parse(stateJson);

      // Convert to our state format
      const state: DeploymentState = {
        stateId: uuidv4(),
        version: 1,
        resources: this.convertTerraformState(tfState),
        lastModified: new Date(),
        locked: false
      };

      // Get outputs
      const { stdout: outputsJson } = await execAsync('terraform output -json', { 
        cwd: projectDir 
      });
      const outputs = JSON.parse(outputsJson);

      return { state, outputs };
    } catch (error: any) {
      logger.error('Terraform apply failed', { error: error.message });
      throw new Error(`Terraform apply failed: ${error.message}`);
    }
  }

  async destroy(projectDir: string): Promise<void> {
    try {
      logger.info('Destroying Terraform infrastructure', { projectDir });
      await execAsync('terraform destroy -auto-approve', { cwd: projectDir });
    } catch (error: any) {
      logger.error('Terraform destroy failed', { error: error.message });
      throw new Error(`Terraform destroy failed: ${error.message}`);
    }
  }

  private async setupProject(
    code: string,
    request: DeploymentRequest
  ): Promise<string> {
    const projectId = uuidv4();
    const projectDir = path.join(this.workDir, projectId);

    // Create project directory
    await mkdir(projectDir, { recursive: true });

    // Write Terraform code
    await writeFile(path.join(projectDir, 'main.tf'), code);

    // Write backend configuration for state storage
    const backendConfig = this.getBackendConfig(request);
    await writeFile(path.join(projectDir, 'backend.tf'), backendConfig);

    logger.info('Terraform project setup complete', { projectDir });

    return projectDir;
  }

  private getBackendConfig(request: DeploymentRequest): string {
    // In production, configure remote state backend (S3, Azure Storage, etc.)
    return `terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}`;
  }

  private convertTerraformState(tfState: any): ResourceState[] {
    const resources: ResourceState[] = [];

    if (!tfState.values?.root_module?.resources) {
      return resources;
    }

    for (const resource of tfState.values.root_module.resources) {
      resources.push({
        id: resource.address,
        type: resource.type,
        name: resource.name,
        provider: resource.provider_name,
        attributes: resource.values,
        dependencies: resource.depends_on || [],
        status: 'created'
      });
    }

    return resources;
  }
}
