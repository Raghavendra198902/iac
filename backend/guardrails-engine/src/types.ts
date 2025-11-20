export interface Policy {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'cost' | 'operational';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  enabled: boolean;
  rule: PolicyRule;
  remediation?: RemediationAction;
  tags?: string[];
}

export interface PolicyRule {
  type: 'resource' | 'configuration' | 'relationship' | 'custom';
  condition: string; // JSONPath or custom expression
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'matches' | 'greaterThan' | 'lessThan';
  value: any;
  scope?: string[]; // Specific resource types
}

export interface RemediationAction {
  type: 'auto' | 'manual' | 'suggest';
  action: string;
  parameters?: Record<string, any>;
}

export interface EvaluationRequest {
  blueprintId?: string;
  iacCode?: string;
  format?: 'terraform' | 'bicep' | 'cloudformation';
  policies?: string[]; // Policy IDs to evaluate
  environment?: 'dev' | 'staging' | 'production';
}

export interface EvaluationResult {
  id: string;
  blueprintId?: string;
  timestamp: Date;
  passed: boolean;
  score: number; // 0-100
  violations: Violation[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  remediations?: RemediationSuggestion[];
}

export interface Violation {
  policyId: string;
  policyName: string;
  severity: string;
  category: string;
  resource?: string;
  location?: string;
  message: string;
  description: string;
  remediation?: string;
  canAutoRemediate: boolean;
}

export interface RemediationSuggestion {
  violationId: string;
  type: 'auto' | 'manual';
  action: string;
  description: string;
  code?: string; // Code changes to apply
}

export interface Blueprint {
  id: string;
  name: string;
  target_cloud: string;
  components: Component[];
}

export interface Component {
  id: string;
  name: string;
  type: string;
  provider: string;
  properties: Record<string, any>;
}
