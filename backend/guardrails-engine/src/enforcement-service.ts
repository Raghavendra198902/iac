/**
 * Guardrails Enforcement Service
 * Validates blueprints against architecture policies using Open Policy Agent
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { createLogger } from '../../../packages/logger/src/index';

const logger = createLogger({ serviceName: 'guardrails-engine' });

export interface EvaluationResult {
  allowed: boolean;
  violations: PolicyViolation[];
  warnings: PolicyWarning[];
  score: number;
  evaluated_at: Date;
  policies_evaluated: string[];
}

export interface PolicyViolation {
  severity: 'error';
  message: string;
  policy: string;
  resource?: string;
}

export interface PolicyWarning {
  severity: 'warning';
  message: string;
  policy: string;
  resource?: string;
}

export class GuardrailsEnforcementService {
  private opaUrl: string;
  private policiesPath: string;
  
  constructor(config: { opaUrl?: string; policiesPath?: string } = {}) {
    this.opaUrl = config.opaUrl || process.env.OPA_URL || 'http://localhost:8181';
    this.policiesPath = config.policiesPath || join(__dirname, '../policies');
  }
  
  /**
   * Evaluate blueprint against all applicable policies
   */
  async evaluateBlueprint(blueprint: any): Promise<EvaluationResult> {
    // Load applicable policies
    const policies = await this.loadPolicies([
      'architecture-standards',
      'security-baseline',
      'compliance-requirements',
      'cost-governance'
    ]);
    
    // Prepare input for OPA
    const input = this.preparePolicyInput(blueprint);
    
    // Evaluate against policies
    const result = await this.evaluateWithOPA(input, policies);
    
    // Process results
    const violations: PolicyViolation[] = (result.deny || []).map((msg: string) => ({
      severity: 'error' as const,
      message: msg,
      policy: 'architecture-standards'
    }));
    
    const warnings: PolicyWarning[] = (result.warn || []).map((msg: string) => ({
      severity: 'warning' as const,
      message: msg,
      policy: 'architecture-standards'
    }));
    
    const score = result.compliance_score || this.calculateScore(violations, warnings);
    
    return {
      allowed: violations.length === 0,
      violations,
      warnings,
      score,
      evaluated_at: new Date(),
      policies_evaluated: policies
    };
  }
  
  /**
   * Pre-deployment validation
   */
  async validateBeforeDeployment(blueprintId: string): Promise<boolean> {
    const blueprint = await this.getBlueprint(blueprintId);
    const evaluation = await this.evaluateBlueprint(blueprint);
    
    if (!evaluation.allowed) {
      // Block deployment
      await this.updateBlueprintStatus(blueprintId, 'blocked', evaluation.violations);
      await this.notifyArchitectureTeam(blueprintId, evaluation);
      
      logger.error(`Blueprint ${blueprintId} blocked due to policy violations:`, evaluation.violations);
      return false;
    }
    
    if (evaluation.warnings.length > 0) {
      // Allow but log warnings
      await this.logWarnings(blueprintId, evaluation.warnings);
      logger.warn(`Blueprint ${blueprintId} has warnings:`, evaluation.warnings);
    }
    
    return true;
  }
  
  /**
   * Continuous compliance monitoring
   */
  async monitorCompliance(projectId: string): Promise<EvaluationResult> {
    const project = await this.getProject(projectId);
    const blueprints = await this.getProjectBlueprints(projectId);
    
    const evaluations = await Promise.all(
      blueprints.map(bp => this.evaluateBlueprint(bp))
    );
    
    // Aggregate results
    const allViolations = evaluations.flatMap(e => e.violations);
    const allWarnings = evaluations.flatMap(e => e.warnings);
    const avgScore = evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length;
    
    const result: EvaluationResult = {
      allowed: allViolations.length === 0,
      violations: allViolations,
      warnings: allWarnings,
      score: avgScore,
      evaluated_at: new Date(),
      policies_evaluated: ['architecture-standards']
    };
    
    // Store compliance report
    await this.storeComplianceReport(projectId, result);
    
    return result;
  }
  
  /**
   * Evaluate specific policy
   */
  async evaluatePolicy(input: any, policyName: string): Promise<any> {
    const policy = await this.loadPolicy(policyName);
    return await this.evaluateWithOPA(input, [policy]);
  }
  
  /**
   * Get compliance report for project
   */
  async getComplianceReport(projectId: string): Promise<any> {
    // Implementation would fetch from database
    return {
      projectId,
      lastEvaluated: new Date(),
      complianceScore: 95,
      violations: [],
      warnings: []
    };
  }
  
  // Private helper methods
  
  private preparePolicyInput(blueprint: any): any {
    return {
      resources: blueprint.resources || [],
      environment: blueprint.environment || 'dev',
      compliance_requirements: blueprint.complianceRequirements || [],
      estimated_cost: blueprint.estimatedCost || 0,
      tags: blueprint.tags || {},
      networking: blueprint.networking || {},
      kubernetes_cluster: blueprint.components?.kubernetes_cluster,
      monitoring_enabled: blueprint.monitoring?.enabled || false,
      audit_logging_enabled: blueprint.security?.audit_logging || false
    };
  }
  
  private async evaluateWithOPA(input: any, policies: string[]): Promise<any> {
    try {
      // Call OPA API
      const response = await axios.post(`${this.opaUrl}/v1/data/architecture/standards`, {
        input
      });
      
      return response.data.result || { deny: [], warn: [] };
    } catch (error) {
      logger.error('Error evaluating with OPA:', error);
      
      // Fallback to basic validation if OPA is not available
      return this.fallbackValidation(input);
    }
  }
  
  private fallbackValidation(input: any): any {
    const deny: string[] = [];
    const warn: string[] = [];
    
    // Basic validation rules
    for (const resource of input.resources || []) {
      // Check encryption
      if (resource.type === 'database' && !resource.encryption_enabled) {
        deny.push(`Database ${resource.name} must have encryption enabled`);
      }
      
      // Check public access
      if (resource.type === 'database' && resource.public_access_enabled) {
        deny.push(`Database ${resource.name} cannot have public access enabled`);
      }
      
      // Check required tags
      const requiredTags = ['environment', 'cost_center', 'owner', 'project'];
      const missingTags = requiredTags.filter(tag => !resource.tags?.[tag]);
      if (missingTags.length > 0) {
        deny.push(`Resource ${resource.name} missing required tags: ${missingTags.join(', ')}`);
      }
      
      // Check HTTPS
      if (resource.public_facing && !resource.https_only) {
        deny.push(`Public resource ${resource.name} must enforce HTTPS`);
      }
    }
    
    // Production checks
    if (input.environment === 'production') {
      if (!input.monitoring_enabled) {
        warn.push('Production environment should have monitoring enabled');
      }
      
      if (!input.audit_logging_enabled) {
        deny.push('Production environment must have audit logging enabled');
      }
    }
    
    return { deny, warn };
  }
  
  private async loadPolicies(policyNames: string[]): Promise<string[]> {
    return policyNames;
  }
  
  private async loadPolicy(policyName: string): Promise<string> {
    try {
      const policyPath = join(this.policiesPath, `${policyName}.rego`);
      return readFileSync(policyPath, 'utf-8');
    } catch (error) {
      logger.error(`Error loading policy ${policyName}:`, error);
      return '';
    }
  }
  
  private calculateScore(violations: PolicyViolation[], warnings: PolicyWarning[]): number {
    let score = 100;
    score -= violations.length * 10;
    score -= warnings.length * 2;
    return Math.max(0, score);
  }
  
  private async getBlueprint(blueprintId: string): Promise<any> {
    // Implementation would fetch from database
    return {
      id: blueprintId,
      resources: [],
      environment: 'dev',
      tags: {}
    };
  }
  
  private async getProject(projectId: string): Promise<any> {
    return { id: projectId };
  }
  
  private async getProjectBlueprints(projectId: string): Promise<any[]> {
    return [];
  }
  
  private async updateBlueprintStatus(
    blueprintId: string,
    status: string,
    violations: PolicyViolation[]
  ): Promise<void> {
    logger.info(`Updating blueprint ${blueprintId} status to ${status}`);
  }
  
  private async notifyArchitectureTeam(
    blueprintId: string,
    evaluation: EvaluationResult
  ): Promise<void> {
    logger.info(`Notifying architecture team about blueprint ${blueprintId} violations`);
  }
  
  private async logWarnings(blueprintId: string, warnings: PolicyWarning[]): Promise<void> {
    logger.warn(`Blueprint ${blueprintId} warnings:`, warnings);
  }
  
  private async storeComplianceReport(projectId: string, result: EvaluationResult): Promise<void> {
    logger.info(`Storing compliance report for project ${projectId}`, result);
  }
}

export default GuardrailsEnforcementService;
