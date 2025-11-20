import axios from 'axios';
import { logger } from './utils/logger';
import { ApprovalDecision } from './types';

interface ApprovalParams {
  blueprintId: string;
  environment: string;
  automationLevel: number;
}

export class AutoApprovalEngine {
  private readonly APPROVAL_THRESHOLDS = {
    design: {
      minSecurityScore: 85,
      maxRiskLevel: 30,
      maxComplexityScore: 70
    },
    deployment: {
      dev: {
        minSecurityScore: 70,
        maxRiskLevel: 50
      },
      staging: {
        minSecurityScore: 80,
        maxRiskLevel: 30
      },
      prod: {
        minSecurityScore: 90,
        maxRiskLevel: 20
      }
    }
  };

  async evaluateApproval(params: ApprovalParams): Promise<ApprovalDecision> {
    logger.info('Evaluating auto-approval eligibility', params);

    try {
      // Get blueprint analysis
      const analysis = await this.getBlueprintAnalysis(params.blueprintId);
      
      // Get cost estimate
      const costEstimate = await this.getCostEstimate(params.blueprintId);
      
      // Get risk assessment
      const riskAssessment = await this.getRiskAssessment(params.blueprintId, params.environment);

      // Evaluate conditions
      const conditions = {
        guardrailsPassed: analysis.guardrailsPassed,
        securityScore: analysis.securityScore,
        costWithinBudget: costEstimate.withinBudget,
        riskLevel: riskAssessment.riskLevel,
        complexityScore: analysis.complexityScore
      };

      // Check if automation level allows auto-approval
      if (params.automationLevel < 2) {
        return {
          approved: false,
          reason: 'Automation level requires manual approval',
          conditions
        };
      }

      // Apply design-time checks
      if (!conditions.guardrailsPassed) {
        return {
          approved: false,
          reason: 'Guardrails validation failed',
          conditions
        };
      }

      if (conditions.securityScore < this.APPROVAL_THRESHOLDS.design.minSecurityScore) {
        return {
          approved: false,
          reason: `Security score ${conditions.securityScore} below threshold ${this.APPROVAL_THRESHOLDS.design.minSecurityScore}`,
          conditions
        };
      }

      if (conditions.complexityScore > this.APPROVAL_THRESHOLDS.design.maxComplexityScore) {
        return {
          approved: false,
          reason: `Complexity score ${conditions.complexityScore} exceeds threshold ${this.APPROVAL_THRESHOLDS.design.maxComplexityScore}`,
          conditions
        };
      }

      if (!conditions.costWithinBudget) {
        return {
          approved: false,
          reason: 'Estimated cost exceeds budget',
          conditions
        };
      }

      // Apply deployment-time checks
      const envThreshold = this.APPROVAL_THRESHOLDS.deployment[params.environment as keyof typeof this.APPROVAL_THRESHOLDS.deployment];
      
      if (envThreshold) {
        if (conditions.securityScore < envThreshold.minSecurityScore) {
          return {
            approved: false,
            reason: `Security score ${conditions.securityScore} below ${params.environment} threshold ${envThreshold.minSecurityScore}`,
            conditions
          };
        }

        if (conditions.riskLevel > envThreshold.maxRiskLevel) {
          return {
            approved: false,
            reason: `Risk level ${conditions.riskLevel} exceeds ${params.environment} threshold ${envThreshold.maxRiskLevel}`,
            conditions
          };
        }
      }

      // Additional checks for production
      if (params.environment === 'prod') {
        if (params.automationLevel < 3) {
          return {
            approved: false,
            reason: 'Production deployments require automation level 3',
            conditions
          };
        }

        // Check if similar deployment succeeded in staging
        const stagingValidation = await this.validateStagingDeployment(params.blueprintId);
        if (!stagingValidation.success) {
          return {
            approved: false,
            reason: 'No successful staging deployment found',
            conditions
          };
        }
      }

      // All checks passed
      logger.info('Auto-approval granted', { blueprintId: params.blueprintId, conditions });
      
      return {
        approved: true,
        conditions
      };

    } catch (error: any) {
      logger.error('Auto-approval evaluation failed', { error: error.message });
      return {
        approved: false,
        reason: `Evaluation error: ${error.message}`,
        conditions: {
          guardrailsPassed: false,
          securityScore: 0,
          costWithinBudget: false,
          riskLevel: 100,
          complexityScore: 100
        }
      };
    }
  }

  private async getBlueprintAnalysis(blueprintId: string): Promise<any> {
    const response = await axios.get(`http://blueprint-service:3001/api/blueprints/${blueprintId}/analysis`);
    return response.data;
  }

  private async getCostEstimate(blueprintId: string): Promise<any> {
    const response = await axios.get(`http://costing-service:3004/api/estimate/${blueprintId}`);
    return response.data;
  }

  private async getRiskAssessment(blueprintId: string, environment: string): Promise<any> {
    const response = await axios.post('http://ai-engine:8000/api/risk-assessment', {
      blueprintId,
      environment
    });
    return response.data;
  }

  private async validateStagingDeployment(blueprintId: string): Promise<any> {
    const response = await axios.get(`http://orchestrator:3005/api/deployments/staging/${blueprintId}`);
    return response.data;
  }
}
