import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { DeploymentRequest, DeploymentState, ResourceState } from '../types';

const execAsync = promisify(exec);

export class CloudFormationExecutor {
  private workDir: string;

  constructor() {
    this.workDir = process.env.CFN_WORK_DIR || '/tmp/cloudformation';
  }

  async plan(code: string, request: DeploymentRequest): Promise<any> {
    const projectDir = await this.setupProject(code, request);

    try {
      // Validate template
      logger.info('Validating CloudFormation template', { projectDir });
      await execAsync('aws cloudformation validate-template --template-body file://template.yaml', {
        cwd: projectDir
      });

      // Create change set for preview
      const stackName = this.getStackName(request);
      const changeSetName = `changeset-${uuidv4()}`;

      logger.info('Creating change set', { stackName, changeSetName });
      await execAsync(
        `aws cloudformation create-change-set \\
          --stack-name ${stackName} \\
          --change-set-name ${changeSetName} \\
          --template-body file://template.yaml \\
          --parameters ParameterKey=Environment,ParameterValue=${request.environment} \\
          --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM`,
        { cwd: projectDir }
      );

      // Wait for change set creation
      await execAsync(
        `aws cloudformation wait change-set-create-complete \\
          --stack-name ${stackName} \\
          --change-set-name ${changeSetName}`,
        { cwd: projectDir }
      );

      // Describe changes
      const { stdout } = await execAsync(
        `aws cloudformation describe-change-set \\
          --stack-name ${stackName} \\
          --change-set-name ${changeSetName} \\
          --output json`,
        { cwd: projectDir }
      );

      const changeSet = JSON.parse(stdout);
      const resourceCount = changeSet.Changes?.length || 0;

      return {
        resourceCount,
        changeSetName,
        changes: changeSet
      };
    } catch (error: any) {
      logger.error('CloudFormation validation failed', { error: error.message });
      throw new Error(`CloudFormation validation failed: ${error.message}`);
    }
  }

  async apply(
    code: string,
    request: DeploymentRequest,
    plan: any
  ): Promise<{ state: DeploymentState; outputs: Record<string, any> }> {
    const projectDir = await this.setupProject(code, request);
    const stackName = this.getStackName(request);

    try {
      // Execute change set or create stack
      if (plan.changeSetName) {
        logger.info('Executing change set', { stackName, changeSetName: plan.changeSetName });
        await execAsync(
          `aws cloudformation execute-change-set \\
            --stack-name ${stackName} \\
            --change-set-name ${plan.changeSetName}`,
          { cwd: projectDir }
        );
      } else {
        logger.info('Creating CloudFormation stack', { stackName });
        await execAsync(
          `aws cloudformation create-stack \\
            --stack-name ${stackName} \\
            --template-body file://template.yaml \\
            --parameters ParameterKey=Environment,ParameterValue=${request.environment} \\
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM`,
          { cwd: projectDir }
        );
      }

      // Wait for stack completion
      logger.info('Waiting for stack completion', { stackName });
      await execAsync(
        `aws cloudformation wait stack-create-complete --stack-name ${stackName}`,
        { cwd: projectDir, timeout: 600000 }
      );

      // Get stack details
      const { stdout: stackJson } = await execAsync(
        `aws cloudformation describe-stacks --stack-name ${stackName} --output json`,
        { cwd: projectDir }
      );

      const stackData = JSON.parse(stackJson);
      const stack = stackData.Stacks[0];

      // Convert to our state format
      const state: DeploymentState = {
        stateId: stack.StackId,
        version: 1,
        resources: await this.getStackResources(stackName),
        lastModified: new Date(),
        locked: false
      };

      // Extract outputs
      const outputs: Record<string, any> = {};
      for (const output of stack.Outputs || []) {
        outputs[output.OutputKey] = output.OutputValue;
      }

      return { state, outputs };
    } catch (error: any) {
      logger.error('CloudFormation deployment failed', { error: error.message });
      throw new Error(`CloudFormation deployment failed: ${error.message}`);
    }
  }

  async destroy(stackName: string): Promise<void> {
    try {
      logger.info('Deleting CloudFormation stack', { stackName });
      await execAsync(`aws cloudformation delete-stack --stack-name ${stackName}`);
      await execAsync(`aws cloudformation wait stack-delete-complete --stack-name ${stackName}`);
    } catch (error: any) {
      logger.error('Stack deletion failed', { error: error.message });
      throw new Error(`Stack deletion failed: ${error.message}`);
    }
  }

  private async setupProject(
    code: string,
    request: DeploymentRequest
  ): Promise<string> {
    const projectId = uuidv4();
    const projectDir = path.join(this.workDir, projectId);

    await mkdir(projectDir, { recursive: true });
    await writeFile(path.join(projectDir, 'template.yaml'), code);

    logger.info('CloudFormation project setup complete', { projectDir });

    return projectDir;
  }

  private getStackName(request: DeploymentRequest): string {
    return `dharma-${request.environment}-${request.blueprintId.substring(0, 8)}`;
  }

  private async getStackResources(stackName: string): Promise<ResourceState[]> {
    try {
      const { stdout } = await execAsync(
        `aws cloudformation list-stack-resources --stack-name ${stackName} --output json`
      );

      const data = JSON.parse(stdout);
      const resources: ResourceState[] = [];

      for (const resource of data.StackResourceSummaries || []) {
        resources.push({
          id: resource.PhysicalResourceId,
          type: resource.ResourceType,
          name: resource.LogicalResourceId,
          provider: 'aws',
          attributes: {
            status: resource.ResourceStatus
          },
          dependencies: [],
          status: this.mapResourceStatus(resource.ResourceStatus)
        });
      }

      return resources;
    } catch (error: any) {
      logger.error('Failed to get stack resources', { error: error.message });
      return [];
    }
  }

  private mapResourceStatus(cfnStatus: string): ResourceState['status'] {
    if (cfnStatus.includes('CREATE_COMPLETE')) return 'created';
    if (cfnStatus.includes('UPDATE_COMPLETE')) return 'updated';
    if (cfnStatus.includes('DELETE_COMPLETE')) return 'deleted';
    if (cfnStatus.includes('IN_PROGRESS')) return 'creating';
    return 'failed';
  }
}
