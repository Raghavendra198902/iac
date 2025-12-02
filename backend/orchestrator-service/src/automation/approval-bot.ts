/**
 * Architecture Approval Automation
 * Intelligent routing and auto-approval for compliant blueprints
 */

import { ArchitectureReviewRequest, ReviewerRole } from '../workflows/architecture-approval';
// import { GuardrailsEnforcementService } from '../../guardrails-engine/src/enforcement-service';

export interface ApprovalDecision {
  decision: 'auto_approved' | 'pending_review' | 'conditional_approval' | 'rejected';
  rationale: string;
  checks_passed?: any[];
  checks_failed?: any[];
  conditions?: string[];
  approved_by?: string;
  approved_at?: Date;
  routed_to?: any[];
}

export class ApprovalAutomation {
  private db: any;
  // private guardrailsService: GuardrailsEnforcementService;
  private guardrailsService: any;
  private notificationService: any;
  
  constructor(dependencies: {
    db: any;
    guardrailsService: any; // GuardrailsEnforcementService;
    notificationService: any;
  }) {
    this.db = dependencies.db;
    this.guardrailsService = dependencies.guardrailsService;
    this.notificationService = dependencies.notificationService;
  }
  
  /**
   * Process new blueprint submission
   */
  async processNewBlueprint(blueprintId: string): Promise<ApprovalDecision> {
    const blueprint = await this.getBlueprint(blueprintId);
    
    // Run automated checks
    const checks = await Promise.all([
      this.checkCompliance(blueprint),
      this.checkSecurity(blueprint),
      this.checkCost(blueprint),
      this.checkTechnologyStack(blueprint),
      this.checkArchitecturePatterns(blueprint)
    ]);
    
    const passedChecks = checks.filter(c => c.passed);
    const failedChecks = checks.filter(c => !c.passed);
    
    const allPassed = failedChecks.length === 0;
    
    // Auto-approve if all checks pass and low risk
    if (allPassed && this.isLowRisk(blueprint)) {
      return await this.autoApprove(blueprint, passedChecks);
    }
    
    // Reject if critical failures
    const criticalFailures = failedChecks.filter(c => c.severity === 'critical');
    if (criticalFailures.length > 0) {
      return await this.autoReject(blueprint, criticalFailures);
    }
    
    // Route to human reviewers if high risk or non-critical failures
    if (!allPassed || this.isHighRisk(blueprint)) {
      return await this.routeToReviewers(blueprint, checks);
    }
    
    // Conditional approval for minor issues
    return await this.conditionalApproval(blueprint, failedChecks);
  }
  
  /**
   * Auto-approve low-risk compliant blueprints
   */
  private async autoApprove(blueprint: any, checks: any[]): Promise<ApprovalDecision> {
    const decision: ApprovalDecision = {
      decision: 'auto_approved',
      rationale: this.generateApprovalRationale(blueprint, checks),
      checks_passed: checks,
      approved_by: 'system',
      approved_at: new Date()
    };
    
    // Update blueprint status
    await this.db.query(
      `UPDATE blueprints SET status = 'approved', approved_by = 'system', approved_at = NOW() 
       WHERE id = $1`,
      [blueprint.id]
    );
    
    // Log approval
    await this.logApproval(blueprint.id, decision);
    
    // Notify owner
    await this.notifyBlueprintOwner(blueprint, 'auto_approved');
    
    return decision;
  }
  
  /**
   * Auto-reject blueprints with critical violations
   */
  private async autoReject(blueprint: any, criticalFailures: any[]): Promise<ApprovalDecision> {
    const decision: ApprovalDecision = {
      decision: 'rejected',
      rationale: 'Blueprint has critical policy violations that must be resolved before approval.',
      checks_failed: criticalFailures
    };
    
    // Update blueprint status
    await this.db.query(
      `UPDATE blueprints SET status = 'rejected' WHERE id = $1`,
      [blueprint.id]
    );
    
    // Log rejection
    await this.logRejection(blueprint.id, decision);
    
    // Notify owner with remediation steps
    await this.notifyBlueprintOwner(blueprint, 'rejected', criticalFailures);
    
    return decision;
  }
  
  /**
   * Conditional approval with requirements
   */
  private async conditionalApproval(blueprint: any, issues: any[]): Promise<ApprovalDecision> {
    const conditions = issues.map(issue => issue.message);
    
    const decision: ApprovalDecision = {
      decision: 'conditional_approval',
      rationale: 'Blueprint approved with conditions that must be addressed before deployment.',
      checks_failed: issues,
      conditions,
      approved_by: 'system',
      approved_at: new Date()
    };
    
    // Update blueprint status
    await this.db.query(
      `UPDATE blueprints SET status = 'conditional_approval' WHERE id = $1`,
      [blueprint.id]
    );
    
    // Log conditional approval
    await this.logConditionalApproval(blueprint.id, decision);
    
    // Notify owner
    await this.notifyBlueprintOwner(blueprint, 'conditional_approval', issues);
    
    return decision;
  }
  
  /**
   * Route to human reviewers
   */
  private async routeToReviewers(blueprint: any, checks: any[]): Promise<ApprovalDecision> {
    const reviewers = await this.determineReviewers(blueprint);
    
    const decision: ApprovalDecision = {
      decision: 'pending_review',
      rationale: 'Requires human review due to complexity, risk level, or check failures',
      checks_passed: checks.filter(c => c.passed),
      checks_failed: checks.filter(c => !c.passed),
      routed_to: reviewers
    };
    
    // Create review request
    await this.createReviewRequest(blueprint, reviewers, checks);
    
    // Notify reviewers
    await this.notifyReviewers(reviewers, blueprint);
    
    return decision;
  }
  
  /**
   * Run automated checks
   */
  private async checkCompliance(blueprint: any): Promise<any> {
    try {
      const result = await this.guardrailsService.evaluateBlueprint(blueprint);
      
      return {
        name: 'Compliance Check',
        passed: result.allowed,
        severity: result.violations.length > 0 ? 'high' : 'low',
        details: {
          score: result.score,
          violations: result.violations,
          warnings: result.warnings
        }
      };
    } catch (error) {
      return {
        name: 'Compliance Check',
        passed: false,
        severity: 'medium',
        message: 'Compliance check failed to execute'
      };
    }
  }
  
  private async checkSecurity(blueprint: any): Promise<any> {
    const issues: string[] = [];
    
    // Check encryption
    const resources = blueprint.resources || [];
    for (const resource of resources) {
      if (['database', 'storage'].includes(resource.type) && !resource.encryption_enabled) {
        issues.push(`Resource ${resource.name} lacks encryption`);
      }
      
      if (resource.public_access_enabled) {
        issues.push(`Resource ${resource.name} has public access enabled`);
      }
    }
    
    // Check network security
    if (!blueprint.networking?.network_security_groups) {
      issues.push('Network security groups not configured');
    }
    
    return {
      name: 'Security Check',
      passed: issues.length === 0,
      severity: issues.length > 0 ? 'high' : 'low',
      message: issues.join('; '),
      details: { issues }
    };
  }
  
  private async checkCost(blueprint: any): Promise<any> {
    const estimatedCost = blueprint.estimated_cost || 0;
    const threshold = 10000;
    
    if (estimatedCost > threshold) {
      return {
        name: 'Cost Check',
        passed: false,
        severity: 'medium',
        message: `Estimated cost ($${estimatedCost}) exceeds auto-approval threshold ($${threshold})`,
        details: { estimatedCost, threshold }
      };
    }
    
    return {
      name: 'Cost Check',
      passed: true,
      severity: 'low',
      message: 'Cost within acceptable range',
      details: { estimatedCost }
    };
  }
  
  private async checkTechnologyStack(blueprint: any): Promise<any> {
    const approvedTech = await this.getApprovedTechnologies();
    const usedTech = this.extractTechnologies(blueprint);
    const unapproved = usedTech.filter(tech => !approvedTech.includes(tech));
    
    if (unapproved.length > 0) {
      return {
        name: 'Technology Stack Check',
        passed: false,
        severity: 'medium',
        message: `Unapproved technologies: ${unapproved.join(', ')}`,
        details: { unapproved }
      };
    }
    
    return {
      name: 'Technology Stack Check',
      passed: true,
      severity: 'low',
      message: 'All technologies approved'
    };
  }
  
  private async checkArchitecturePatterns(blueprint: any): Promise<any> {
    // Check if using approved templates
    if (blueprint.template_id) {
      const template = await this.getTemplate(blueprint.template_id);
      if (template && template.status === 'active') {
        return {
          name: 'Architecture Pattern Check',
          passed: true,
          severity: 'low',
          message: `Using approved template: ${template.name}`
        };
      }
    }
    
    // Check for anti-patterns
    const antiPatterns = await this.detectAntiPatterns(blueprint);
    
    if (antiPatterns.length > 0) {
      return {
        name: 'Architecture Pattern Check',
        passed: false,
        severity: 'medium',
        message: `Anti-patterns detected: ${antiPatterns.join(', ')}`,
        details: { antiPatterns }
      };
    }
    
    return {
      name: 'Architecture Pattern Check',
      passed: true,
      severity: 'low',
      message: 'No anti-patterns detected'
    };
  }
  
  /**
   * Risk assessment
   */
  private isLowRisk(blueprint: any): boolean {
    return (
      blueprint.estimated_cost < 5000 &&
      blueprint.complexity === 'simple' &&
      blueprint.environment !== 'production' &&
      !blueprint.handles_sensitive_data &&
      blueprint.compliance_requirements?.length === 0
    );
  }
  
  private isHighRisk(blueprint: any): boolean {
    return (
      blueprint.estimated_cost > 50000 ||
      blueprint.complexity === 'complex' ||
      blueprint.environment === 'production' ||
      blueprint.handles_sensitive_data === true ||
      blueprint.public_facing === true ||
      blueprint.compliance_requirements?.length > 0
    );
  }
  
  /**
   * Determine reviewers based on blueprint characteristics
   */
  private async determineReviewers(blueprint: any): Promise<any[]> {
    const reviewers: ReviewerRole[] = [];
    
    // Always require security review for sensitive data
    if (blueprint.handles_sensitive_data || blueprint.compliance_requirements?.length > 0) {
      reviewers.push(ReviewerRole.SECURITY_ARCHITECT);
    }
    
    // Enterprise architect for high cost or complex projects
    if (blueprint.estimated_cost > 20000 || blueprint.complexity === 'complex') {
      reviewers.push(ReviewerRole.ENTERPRISE_ARCHITECT);
    }
    
    // Domain architect for domain-specific expertise
    if (blueprint.domain) {
      reviewers.push(ReviewerRole.DOMAIN_ARCHITECT);
    }
    
    // Cloud architect for multi-cloud or complex networking
    if (blueprint.cloud_providers?.length > 1 || blueprint.networking?.complex) {
      reviewers.push(ReviewerRole.CLOUD_ARCHITECT);
    }
    
    // Data architect for data-intensive workloads
    if (blueprint.resources?.some((r: any) => r.type === 'database' || r.type === 'data_lake')) {
      reviewers.push(ReviewerRole.DATA_ARCHITECT);
    }
    
    return reviewers;
  }
  
  // Helper methods
  
  private generateApprovalRationale(blueprint: any, checks: any[]): string {
    return `Auto-approved: All ${checks.length} automated checks passed successfully. ` +
           `Blueprint is low-risk (cost: $${blueprint.estimated_cost}, complexity: ${blueprint.complexity}). ` +
           `Using approved architecture patterns and compliant with all policies.`;
  }
  
  private async getBlueprint(blueprintId: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM blueprints WHERE id = $1', [blueprintId]);
    return result.rows[0];
  }
  
  private async getTemplate(templateId: string): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM architecture_templates WHERE template_id = $1',
      [templateId]
    );
    return result.rows[0];
  }
  
  private async getApprovedTechnologies(): Promise<string[]> {
    return ['postgresql', 'mysql', 'mongodb', 'redis', 'kubernetes', 'docker', 'terraform'];
  }
  
  private extractTechnologies(blueprint: any): string[] {
    const tech: string[] = [];
    const resources = blueprint.resources || [];
    
    for (const resource of resources) {
      if (resource.type === 'database' && resource.engine) {
        tech.push(resource.engine.toLowerCase());
      }
    }
    
    return [...new Set(tech)];
  }
  
  private async detectAntiPatterns(blueprint: any): Promise<string[]> {
    const antiPatterns: string[] = [];
    
    // Check for common anti-patterns
    if (blueprint.resources?.some((r: any) => r.type === 'database' && r.public_access)) {
      antiPatterns.push('publicly_accessible_database');
    }
    
    if (!blueprint.monitoring_enabled && blueprint.environment === 'production') {
      antiPatterns.push('no_monitoring_in_production');
    }
    
    return antiPatterns;
  }
  
  private async logApproval(blueprintId: string, decision: ApprovalDecision): Promise<void> {
    await this.db.query(
      `INSERT INTO approval_log (blueprint_id, decision, rationale, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [blueprintId, decision.decision, decision.rationale]
    );
  }
  
  private async logRejection(blueprintId: string, decision: ApprovalDecision): Promise<void> {
    await this.logApproval(blueprintId, decision);
  }
  
  private async logConditionalApproval(blueprintId: string, decision: ApprovalDecision): Promise<void> {
    await this.logApproval(blueprintId, decision);
  }
  
  private async createReviewRequest(blueprint: any, reviewers: any[], checks: any[]): Promise<void> {
    // Implementation would create architecture_review_request record
    console.log(`Creating review request for blueprint ${blueprint.id}`);
  }
  
  private async notifyBlueprintOwner(blueprint: any, event: string, details?: any[]): Promise<void> {
    console.log(`Notifying owner of blueprint ${blueprint.id}: ${event}`);
  }
  
  private async notifyReviewers(reviewers: any[], blueprint: any): Promise<void> {
    console.log(`Notifying reviewers for blueprint ${blueprint.id}`);
  }
}

export default ApprovalAutomation;
