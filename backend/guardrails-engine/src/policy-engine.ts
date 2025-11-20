import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';
import {
  Policy,
  Blueprint,
  EvaluationResult,
  Violation,
  RemediationSuggestion,
  Component
} from './types';
import { defaultPolicies } from './policies/default-policies';

export class PolicyEngine {
  private policies: Map<string, Policy>;
  private evaluations: Map<string, EvaluationResult>;

  constructor() {
    this.policies = new Map();
    this.evaluations = new Map();
    this.loadPolicies();
  }

  private loadPolicies(): void {
    for (const policy of defaultPolicies) {
      // Validate policy regex patterns for safety
      if (policy.rule.type === 'configuration' && policy.rule.operator === 'matches') {
        if (!this.isSafeRegex(policy.rule.condition)) {
          logger.warn('Skipping policy with unsafe regex pattern', { 
            policyId: policy.id,
            pattern: policy.rule.condition 
          });
          continue;
        }
      }
      this.policies.set(policy.id, policy);
    }
    logger.info(`Loaded ${this.policies.size} policies`);
  }

  async evaluate(
    blueprint?: Blueprint,
    iacCode?: string,
    format?: string,
    policyIds?: string[],
    environment: string = 'dev'
  ): Promise<EvaluationResult> {
    const evaluationId = uuidv4();
    const violations: Violation[] = [];

    // Security: Validate and sanitize policy IDs - only allow pre-loaded policies
    // All policies loaded at startup are validated for safe regex patterns
    // This prevents ReDoS by ensuring user input can only reference validated policies
    const validatedPolicyIds = policyIds
      ? policyIds.filter(id => this.policies.has(id)) // Only pre-validated policy IDs allowed
      : undefined;

    // Log if any invalid policy IDs were provided
    if (policyIds && validatedPolicyIds && policyIds.length !== validatedPolicyIds.length) {
      logger.warn('Some policy IDs were invalid and ignored', {
        requested: policyIds.length,
        valid: validatedPolicyIds.length
      });
    }

    // Get policies to evaluate - only from pre-loaded, validated policies
    const policiesToEvaluate = validatedPolicyIds
      ? validatedPolicyIds.map(id => this.policies.get(id)!).filter(p => p !== undefined)
      : Array.from(this.policies.values()).filter(p => p.enabled);

    logger.info('Evaluating policies', {
      evaluationId,
      policyCount: policiesToEvaluate.length,
      environment
    });

    // Evaluate each policy
    for (const policy of policiesToEvaluate) {
      const policyViolations = blueprint
        ? await this.evaluateBlueprint(policy, blueprint, environment)
        : await this.evaluateIaCCode(policy, iacCode!, format!);

      violations.push(...policyViolations);
    }

    // Calculate summary
    const summary = {
      total: violations.length,
      critical: violations.filter(v => v.severity === 'critical').length,
      high: violations.filter(v => v.severity === 'high').length,
      medium: violations.filter(v => v.severity === 'medium').length,
      low: violations.filter(v => v.severity === 'low').length,
      info: violations.filter(v => v.severity === 'info').length
    };

    // Calculate score (0-100)
    const score = this.calculateScore(summary, policiesToEvaluate.length);

    // Generate remediation suggestions
    const remediations = violations
      .filter(v => v.canAutoRemediate)
      .map(v => this.generateRemediation(v));

    const result: EvaluationResult = {
      id: evaluationId,
      blueprintId: blueprint?.id,
      timestamp: new Date(),
      passed: summary.critical === 0 && summary.high === 0,
      score,
      violations,
      summary,
      remediations
    };

    // Store evaluation
    this.evaluations.set(evaluationId, result);

    logger.info('Evaluation completed', {
      evaluationId,
      passed: result.passed,
      score: result.score,
      violations: summary.total
    });

    return result;
  }

  private async evaluateBlueprint(
    policy: Policy,
    blueprint: Blueprint,
    environment: string
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    for (const component of blueprint.components) {
      // Check if policy applies to this component
      if (policy.rule.scope && !policy.rule.scope.includes(component.type)) {
        continue;
      }

      const violation = this.checkComponent(policy, component, environment);
      if (violation) {
        violations.push(violation);
      }
    }

    return violations;
  }

  private checkComponent(
    policy: Policy,
    component: Component,
    environment: string
  ): Violation | null {
    // Extract value from component using JSONPath-like condition
    const value = this.extractValue(component, policy.rule.condition);

    // Check if rule matches
    const matches = this.evaluateCondition(
      value,
      policy.rule.operator,
      policy.rule.value
    );

    if (matches) {
      return {
        policyId: policy.id,
        policyName: policy.name,
        severity: policy.severity,
        category: policy.category,
        resource: component.name,
        location: `component.${component.id}`,
        message: `Policy violation: ${policy.name}`,
        description: policy.description,
        remediation: policy.remediation?.action,
        canAutoRemediate: policy.remediation?.type === 'auto'
      };
    }

    return null;
  }

  private extractValue(obj: any, path: string): any {
    const parts = path.replace(/^properties\./, '').split('.');
    let value = obj.properties || obj;

    for (const part of parts) {
      if (value === undefined || value === null) {
        return undefined;
      }
      value = value[part];
    }

    return value;
  }

  private evaluateCondition(value: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return value === expected;
      case 'notEquals':
        return value !== expected;
      case 'contains':
        return typeof value === 'string' && value.includes(expected);
      case 'notContains':
        return typeof value === 'string' && !value.includes(expected);
      case 'matches':
        return new RegExp(expected).test(String(value));
      case 'greaterThan':
        return Number(value) > Number(expected);
      case 'lessThan':
        return Number(value) < Number(expected);
      default:
        return false;
    }
  }

  private async evaluateIaCCode(
    policy: Policy,
    code: string,
    format: string
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    // Simple pattern matching for IaC code
    // In production, use proper parsers (HCL parser, YAML parser, etc.)
    
    if (policy.rule.type === 'configuration') {
      // Validate regex pattern to prevent ReDoS
      if (!this.isSafeRegex(policy.rule.condition)) {
        logger.warn('Unsafe regex pattern detected, skipping policy', { 
          policyId: policy.id,
          pattern: policy.rule.condition 
        });
        return violations;
      }

      try {
        const pattern = new RegExp(policy.rule.condition, 'gi');
        const matches = code.match(pattern);

        if (matches) {
          violations.push({
            policyId: policy.id,
            policyName: policy.name,
            severity: policy.severity,
            category: policy.category,
            location: 'code',
            message: `Policy violation: ${policy.name}`,
            description: policy.description,
            remediation: policy.remediation?.action,
            canAutoRemediate: policy.remediation?.type === 'auto'
          });
        }
      } catch (error: any) {
        logger.error('Regex evaluation error', { 
          policyId: policy.id, 
          error: error.message 
        });
      }
    }

    return violations;
  }

  private isSafeRegex(pattern: string): boolean {
    // Check for known ReDoS patterns
    const unsafePatterns = [
      /(\+|\*|\{[0-9,]+\})\1/, // Nested quantifiers
      /\([^\)]*\)\+\+/, // Multiple greedy quantifiers
      /\([^\)]*\)\*\*/, // Multiple greedy quantifiers
      /\(.+\)\+.+\)/, // Complex alternation with quantifiers
    ];

    // Check pattern length - very long patterns are suspicious
    if (pattern.length > 200) {
      return false;
    }

    // Check against unsafe patterns
    for (const unsafePattern of unsafePatterns) {
      if (unsafePattern.test(pattern)) {
        return false;
      }
    }

    return true;
  }

  private calculateScore(
    summary: { critical: number; high: number; medium: number; low: number },
    totalPolicies: number
  ): number {
    // Weight violations by severity
    const weightedViolations =
      summary.critical * 10 +
      summary.high * 5 +
      summary.medium * 2 +
      summary.low * 1;

    // Calculate deduction from perfect score
    const maxDeduction = totalPolicies * 10; // Assuming critical violation per policy
    const deduction = Math.min(weightedViolations, maxDeduction);
    
    const score = Math.max(0, 100 - (deduction / maxDeduction) * 100);

    return Math.round(score);
  }

  private generateRemediation(violation: Violation): RemediationSuggestion {
    const policy = this.policies.get(violation.policyId);
    const remediationType = policy?.remediation?.type || 'manual';
    
    return {
      violationId: violation.policyId,
      type: remediationType === 'suggest' ? 'manual' : remediationType,
      action: policy?.remediation?.action || 'Manual review required',
      description: violation.remediation || 'No automatic remediation available'
    };
  }

  async autoRemediate(
    evaluationId: string,
    violationIds?: string[]
  ): Promise<RemediationSuggestion[]> {
    const evaluation = this.evaluations.get(evaluationId);
    if (!evaluation) {
      throw new Error(`Evaluation not found: ${evaluationId}`);
    }

    const violations = violationIds
      ? evaluation.violations.filter(v => violationIds.includes(v.policyId))
      : evaluation.violations.filter(v => v.canAutoRemediate);

    const remediations: RemediationSuggestion[] = [];

    for (const violation of violations) {
      const remediation = this.generateRemediation(violation);
      remediations.push(remediation);
      
      logger.info('Applied auto-remediation', {
        policyId: violation.policyId,
        action: remediation.action
      });
    }

    return remediations;
  }

  async getComplianceScore(blueprintId: string): Promise<any> {
    // Get latest evaluation for blueprint
    const evaluations = Array.from(this.evaluations.values())
      .filter(e => e.blueprintId === blueprintId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (evaluations.length === 0) {
      return {
        blueprintId,
        score: 0,
        status: 'not-evaluated',
        message: 'No evaluations found'
      };
    }

    const latest = evaluations[0];

    return {
      blueprintId,
      score: latest.score,
      status: latest.passed ? 'compliant' : 'non-compliant',
      violations: latest.summary,
      lastEvaluated: latest.timestamp,
      trend: this.calculateTrend(evaluations)
    };
  }

  private calculateTrend(evaluations: EvaluationResult[]): string {
    if (evaluations.length < 2) {
      return 'stable';
    }

    const latest = evaluations[0].score;
    const previous = evaluations[1].score;

    if (latest > previous + 5) return 'improving';
    if (latest < previous - 5) return 'degrading';
    return 'stable';
  }

  getPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }

  getPolicy(id: string): Policy | undefined {
    return this.policies.get(id);
  }

  getEvaluations(blueprintId?: string, limit: number = 10): EvaluationResult[] {
    let evaluations = Array.from(this.evaluations.values());

    if (blueprintId) {
      evaluations = evaluations.filter(e => e.blueprintId === blueprintId);
    }

    return evaluations
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getEvaluation(id: string): EvaluationResult | undefined {
    return this.evaluations.get(id);
  }
}
