export interface WorkflowParams {
  requirements: string;
  automationLevel: number;
  environment: string;
  userId: string;
  tenantId: string;
}

export interface WorkflowStep {
  name: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface WorkflowStatus {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  steps: WorkflowStep[];
  startedAt: Date;
  completedAt?: Date;
  params: WorkflowParams;
  blueprintId?: string;
  iacJobId?: string;
  deploymentId?: string;
  message?: string;
}

export interface ApprovalDecision {
  approved: boolean;
  reason?: string;
  conditions: {
    guardrailsPassed: boolean;
    securityScore: number;
    costWithinBudget: boolean;
    riskLevel: number;
    complexityScore: number;
  };
}

export interface ValidationResult {
  passed: boolean;
  violations: string[];
  securityScore: number;
  complianceScore: number;
}
