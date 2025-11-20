import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';
import { AutoApprovalEngine } from './auto-approval';
import { WorkflowStatus, WorkflowStep } from './types';

export class AutomationOrchestrator {
  private workflows: Map<string, WorkflowStatus> = new Map();
  private autoApproval: AutoApprovalEngine;

  constructor() {
    this.autoApproval = new AutoApprovalEngine();
  }

  async startWorkflow(params: {
    requirements: string;
    automationLevel: number;
    environment: string;
    userId: string;
    tenantId: string;
  }): Promise<string> {
    const workflowId = uuidv4();
    
    const workflow: WorkflowStatus = {
      id: workflowId,
      status: 'running',
      currentStep: 'design',
      steps: [],
      startedAt: new Date(),
      params
    };

    this.workflows.set(workflowId, workflow);

    // Start async execution
    this.executeWorkflow(workflowId).catch(error => {
      logger.error('Workflow execution failed', { workflowId, error });
      this.updateWorkflowStatus(workflowId, 'failed', error.message);
    });

    return workflowId;
  }

  private async executeWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    try {
      // Step 1: AI-Powered Blueprint Generation
      await this.executeStep(workflowId, 'design', async () => {
        logger.info('Step 1: Generating blueprint from requirements', { workflowId });
        
        const blueprint = await this.generateBlueprint(workflow.params.requirements);
        workflow.blueprintId = blueprint.id;
        
        return { blueprintId: blueprint.id, blueprintVersion: blueprint.version };
      });

      // Step 2: Auto-Validate Guardrails
      await this.executeStep(workflowId, 'validate', async () => {
        logger.info('Step 2: Validating against guardrails', { workflowId });
        
        const validation = await this.validateBlueprint(workflow.blueprintId!);
        
        if (!validation.passed) {
          // Auto-remediate if possible
          if (workflow.params.automationLevel >= 2) {
            await this.remediateViolations(workflow.blueprintId!, validation.violations);
            // Re-validate
            const revalidation = await this.validateBlueprint(workflow.blueprintId!);
            if (!revalidation.passed) {
              throw new Error('Validation failed after remediation');
            }
          } else {
            throw new Error(`Guardrail violations: ${validation.violations.join(', ')}`);
          }
        }
        
        return validation;
      });

      // Step 3: Auto-Approval Check
      await this.executeStep(workflowId, 'approval', async () => {
        logger.info('Step 3: Checking auto-approval eligibility', { workflowId });
        
        const approvalDecision = await this.autoApproval.evaluateApproval({
          blueprintId: workflow.blueprintId!,
          environment: workflow.params.environment,
          automationLevel: workflow.params.automationLevel
        });

        if (!approvalDecision.approved) {
          if (workflow.params.automationLevel < 2) {
            throw new Error('Manual approval required');
          }
          throw new Error(`Auto-approval denied: ${approvalDecision.reason}`);
        }
        
        return approvalDecision;
      });

      // Step 4: Generate IaC
      await this.executeStep(workflowId, 'generate', async () => {
        logger.info('Step 4: Generating Infrastructure-as-Code', { workflowId });
        
        const iacResult = await this.generateIaC(workflow.blueprintId!);
        workflow.iacJobId = iacResult.jobId;
        
        return iacResult;
      });

      // Step 5: Auto-Deploy
      await this.executeStep(workflowId, 'deploy', async () => {
        logger.info('Step 5: Deploying infrastructure', { workflowId });
        
        const deployResult = await this.deployInfrastructure(workflow.iacJobId!);
        workflow.deploymentId = deployResult.deploymentId;
        
        return deployResult;
      });

      // Step 6: Post-Deployment Validation
      await this.executeStep(workflowId, 'verify', async () => {
        logger.info('Step 6: Verifying deployment', { workflowId });
        
        const verification = await this.verifyDeployment(workflow.deploymentId!);
        
        if (!verification.success) {
          // Auto-rollback on failure
          if (workflow.params.automationLevel >= 2) {
            await this.rollbackDeployment(workflow.deploymentId!);
            throw new Error('Deployment verification failed, rolled back');
          }
          throw new Error('Deployment verification failed');
        }
        
        return verification;
      });

      // Workflow completed successfully
      this.updateWorkflowStatus(workflowId, 'completed', 'All steps completed successfully');
      
      logger.info('Workflow completed successfully', { 
        workflowId, 
        duration: Date.now() - workflow.startedAt.getTime() 
      });

    } catch (error: any) {
      logger.error('Workflow step failed', { workflowId, error: error.message });
      this.updateWorkflowStatus(workflowId, 'failed', error.message);
      throw error;
    }
  }

  private async executeStep(
    workflowId: string,
    stepName: string,
    stepFunction: () => Promise<any>
  ): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error('Workflow not found');

    workflow.currentStep = stepName;
    
    const step: WorkflowStep = {
      name: stepName,
      status: 'running',
      startedAt: new Date()
    };
    
    workflow.steps.push(step);

    try {
      const result = await stepFunction();
      step.status = 'completed';
      step.completedAt = new Date();
      step.result = result;
    } catch (error: any) {
      step.status = 'failed';
      step.error = error.message;
      step.completedAt = new Date();
      throw error;
    }
  }

  private async generateBlueprint(requirements: string): Promise<any> {
    const response = await axios.post('http://ai-engine:8000/api/generate-blueprint', {
      requirements,
      enableAutoFix: true
    });
    return response.data;
  }

  private async validateBlueprint(blueprintId: string): Promise<any> {
    const response = await axios.post('http://guardrails-engine:3003/api/validate', {
      blueprintId,
      autoRemediate: true
    });
    return response.data;
  }

  private async remediateViolations(blueprintId: string, violations: string[]): Promise<void> {
    await axios.post('http://guardrails-engine:3003/api/remediate', {
      blueprintId,
      violations
    });
  }

  private async generateIaC(blueprintId: string): Promise<any> {
    const response = await axios.post('http://iac-generator:3002/api/generate', {
      blueprintId
    });
    return response.data;
  }

  private async deployInfrastructure(iacJobId: string): Promise<any> {
    const response = await axios.post('http://orchestrator:3005/api/deploy', {
      iacJobId,
      autoApprove: true
    });
    return response.data;
  }

  private async verifyDeployment(deploymentId: string): Promise<any> {
    const response = await axios.post('http://orchestrator:3005/api/verify', {
      deploymentId
    });
    return response.data;
  }

  private async rollbackDeployment(deploymentId: string): Promise<void> {
    await axios.post('http://orchestrator:3005/api/rollback', {
      deploymentId
    });
  }

  private updateWorkflowStatus(workflowId: string, status: 'running' | 'completed' | 'failed' | 'cancelled', message?: string): void {
    const workflow = this.workflows.get(workflowId);
    if (workflow) {
      workflow.status = status;
      workflow.message = message;
      workflow.completedAt = new Date();
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<WorkflowStatus | null> {
    return this.workflows.get(workflowId) || null;
  }

  async cancelWorkflow(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'cancelled';
      workflow.completedAt = new Date();
    }
  }
}
