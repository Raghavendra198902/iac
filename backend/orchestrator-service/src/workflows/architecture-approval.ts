/**
 * Architecture Review Workflow
 * Implements ARB approval process in IAC DHARMA
 */

export enum ArchitectureReviewStage {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  SECURITY_REVIEW = 'security_review',
  ARCHITECTURE_REVIEW = 'architecture_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CONDITIONAL_APPROVAL = 'conditional_approval'
}

export enum ReviewerRole {
  SECURITY_ARCHITECT = 'security_architect',
  ENTERPRISE_ARCHITECT = 'enterprise_architect',
  DOMAIN_ARCHITECT = 'domain_architect',
  CLOUD_ARCHITECT = 'cloud_architect',
  DATA_ARCHITECT = 'data_architect'
}

export interface ArchitectureReviewRequest {
  id: string;
  blueprintId: string;
  projectId: string;
  submittedBy: string;
  submissionDate: Date;
  businessJustification: string;
  architectureComplexity: 'simple' | 'moderate' | 'complex';
  estimatedCost: number;
  cloudProviders: string[];
  complianceRequirements: string[];
  reviewStage: ArchitectureReviewStage;
  reviewers: ReviewerAssignment[];
  comments: ReviewComment[];
  decisions: ReviewDecision[];
  metadata: Record<string, any>;
}

export interface ReviewerAssignment {
  reviewerId: string;
  reviewerRole: ReviewerRole;
  reviewerName: string;
  reviewerEmail: string;
  assignedDate: Date;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  completedDate?: Date;
}

export interface ReviewComment {
  id: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  commentType: 'question' | 'concern' | 'suggestion' | 'approval';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface ReviewDecision {
  id: string;
  reviewerId: string;
  reviewerRole: ReviewerRole;
  decision: 'approve' | 'reject' | 'conditional';
  rationale: string;
  conditions?: string[];
  decidedAt: Date;
}

export interface ComplianceResult {
  passed: boolean;
  violations: ComplianceViolation[];
  warnings: ComplianceWarning[];
  score: number;
}

export interface ComplianceViolation {
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
  component?: string;
}

export interface ComplianceWarning {
  rule: string;
  description: string;
  recommendation: string;
}

export class ArchitectureApprovalWorkflow {
  private db: any;
  private notificationService: any;
  private guardrailsService: any;
  private blueprintService: any;
  
  constructor(dependencies: {
    db: any;
    notificationService: any;
    guardrailsService: any;
    blueprintService: any;
  }) {
    this.db = dependencies.db;
    this.notificationService = dependencies.notificationService;
    this.guardrailsService = dependencies.guardrailsService;
    this.blueprintService = dependencies.blueprintService;
  }
  
  /**
   * Submit blueprint for architecture review
   */
  async submitForReview(request: {
    blueprintId: string;
    projectId: string;
    submittedBy: string;
    businessJustification: string;
  }): Promise<ArchitectureReviewRequest> {
    const blueprint = await this.blueprintService.getBlueprint(request.blueprintId);
    
    // Analyze complexity
    const complexity = this.analyzeComplexity(blueprint);
    
    // Estimate cost
    const estimatedCost = await this.blueprintService.estimateCost(request.blueprintId);
    
    // Create review request
    const reviewRequest: ArchitectureReviewRequest = {
      id: this.generateId(),
      blueprintId: request.blueprintId,
      projectId: request.projectId,
      submittedBy: request.submittedBy,
      submissionDate: new Date(),
      businessJustification: request.businessJustification,
      architectureComplexity: complexity,
      estimatedCost: estimatedCost.total,
      cloudProviders: blueprint.cloudProviders || [],
      complianceRequirements: blueprint.complianceRequirements || [],
      reviewStage: ArchitectureReviewStage.SUBMITTED,
      reviewers: [],
      comments: [],
      decisions: [],
      metadata: {}
    };
    
    // Save to database
    await this.db.query(
      'INSERT INTO architecture_review_requests (id, data) VALUES ($1, $2)',
      [reviewRequest.id, JSON.stringify(reviewRequest)]
    );
    
    // Route for review
    await this.routeReview(reviewRequest);
    
    return reviewRequest;
  }
  
  /**
   * Auto-route based on complexity and cost
   */
  async routeReview(request: ArchitectureReviewRequest): Promise<void> {
    const { architectureComplexity, estimatedCost, complianceRequirements } = request;
    
    // Run compliance check first
    const complianceCheck = await this.validateCompliance(request);
    
    // Simple, low-cost projects: Auto-approve if compliant
    if (architectureComplexity === 'simple' && estimatedCost < 5000 && complianceRequirements.length === 0) {
      if (complianceCheck.passed) {
        await this.autoApprove(request);
        return;
      }
    }
    
    // Moderate complexity: Security + Domain Architect review
    if (architectureComplexity === 'moderate') {
      await this.assignReviewers(request, [
        ReviewerRole.SECURITY_ARCHITECT,
        ReviewerRole.DOMAIN_ARCHITECT
      ]);
    }
    
    // Complex or high-cost: Full ARB review
    if (architectureComplexity === 'complex' || estimatedCost > 50000) {
      await this.assignReviewers(request, [
        ReviewerRole.SECURITY_ARCHITECT,
        ReviewerRole.ENTERPRISE_ARCHITECT,
        ReviewerRole.DOMAIN_ARCHITECT
      ]);
      await this.scheduleARBMeeting(request);
    }
    
    // High compliance requirements
    if (complianceRequirements.length > 0) {
      await this.assignReviewers(request, [
        ReviewerRole.SECURITY_ARCHITECT,
        ReviewerRole.ENTERPRISE_ARCHITECT
      ]);
    }
    
    // Send notifications
    await this.notifyReviewers(request);
  }
  
  /**
   * Automated compliance validation
   */
  async validateCompliance(request: ArchitectureReviewRequest): Promise<ComplianceResult> {
    const blueprint = await this.getBlueprint(request.blueprintId);
    const guardrails = await this.getApplicableGuardrails(request);
    
    const results = await Promise.all([
      this.checkSecurityCompliance(blueprint, guardrails),
      this.checkCostCompliance(blueprint, request.estimatedCost),
      this.checkTechnologyCompliance(blueprint),
      this.checkDataCompliance(blueprint, request.complianceRequirements)
    ]);
    
    const violations = results.flatMap(r => r.violations);
    const warnings = results.flatMap(r => r.warnings);
    
    const score = this.calculateComplianceScore(violations, warnings);
    
    return {
      passed: violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
      violations,
      warnings,
      score
    };
  }
  
  /**
   * Assign reviewers based on roles
   */
  async assignReviewers(request: ArchitectureReviewRequest, roles: ReviewerRole[]): Promise<void> {
    const uniqueRoles = [...new Set(roles)];
    
    for (const role of uniqueRoles) {
      const reviewer = await this.findAvailableReviewer(role);
      
      if (reviewer) {
        const assignment: ReviewerAssignment = {
          reviewerId: reviewer.id,
          reviewerRole: role,
          reviewerName: reviewer.name,
          reviewerEmail: reviewer.email,
          assignedDate: new Date(),
          dueDate: this.calculateDueDate(request.architectureComplexity),
          status: 'pending'
        };
        
        request.reviewers.push(assignment);
      }
    }
    
    await this.updateReviewRequest(request);
  }
  
  /**
   * Auto-approve compliant simple projects
   */
  async autoApprove(request: ArchitectureReviewRequest): Promise<void> {
    const decision: ReviewDecision = {
      id: this.generateId(),
      reviewerId: 'system',
      reviewerRole: ReviewerRole.ENTERPRISE_ARCHITECT,
      decision: 'approve',
      rationale: 'Auto-approved: All compliance checks passed. Simple, low-cost project with no special requirements.',
      decidedAt: new Date()
    };
    
    request.decisions.push(decision);
    request.reviewStage = ArchitectureReviewStage.APPROVED;
    
    await this.updateReviewRequest(request);
    await this.updateBlueprintStatus(request.blueprintId, 'approved');
    await this.notifySubmitter(request, 'approved');
  }
  
  /**
   * Schedule ARB meeting for complex reviews
   */
  async scheduleARBMeeting(request: ArchitectureReviewRequest): Promise<void> {
    const meeting = {
      title: `Architecture Review: ${request.projectId}`,
      description: request.businessJustification,
      attendees: request.reviewers.map(r => r.reviewerEmail),
      duration: 60,
      scheduledFor: this.getNextARBSlot()
    };
    
    // Integration with calendar service would go here
    await this.notificationService.send({
      to: meeting.attendees,
      subject: `ARB Meeting Scheduled: ${meeting.title}`,
      body: `A meeting has been scheduled to review the architecture for project ${request.projectId}.`
    });
  }
  
  /**
   * Add review comment
   */
  async addComment(requestId: string, comment: {
    reviewerId: string;
    reviewerName: string;
    comment: string;
    commentType: 'question' | 'concern' | 'suggestion' | 'approval';
  }): Promise<void> {
    const request = await this.getReviewRequest(requestId);
    
    const newComment: ReviewComment = {
      id: this.generateId(),
      reviewerId: comment.reviewerId,
      reviewerName: comment.reviewerName,
      comment: comment.comment,
      commentType: comment.commentType,
      createdAt: new Date()
    };
    
    request.comments.push(newComment);
    await this.updateReviewRequest(request);
    
    // Notify submitter of new comment
    await this.notifySubmitter(request, 'new_comment');
  }
  
  /**
   * Submit review decision
   */
  async submitDecision(requestId: string, decision: {
    reviewerId: string;
    reviewerRole: ReviewerRole;
    decision: 'approve' | 'reject' | 'conditional';
    rationale: string;
    conditions?: string[];
  }): Promise<void> {
    const request = await this.getReviewRequest(requestId);
    
    const newDecision: ReviewDecision = {
      id: this.generateId(),
      reviewerId: decision.reviewerId,
      reviewerRole: decision.reviewerRole,
      decision: decision.decision,
      rationale: decision.rationale,
      conditions: decision.conditions,
      decidedAt: new Date()
    };
    
    request.decisions.push(newDecision);
    
    // Update reviewer assignment status
    const reviewer = request.reviewers.find(r => r.reviewerId === decision.reviewerId);
    if (reviewer) {
      reviewer.status = 'completed';
      reviewer.completedDate = new Date();
    }
    
    await this.updateReviewRequest(request);
    
    // Check if all reviewers have decided
    await this.checkReviewComplete(request);
  }
  
  /**
   * Check if review is complete and make final decision
   */
  async checkReviewComplete(request: ArchitectureReviewRequest): Promise<void> {
    const allReviewersCompleted = request.reviewers.every(r => r.status === 'completed');
    
    if (!allReviewersCompleted) {
      return;
    }
    
    // Analyze decisions
    const approvals = request.decisions.filter(d => d.decision === 'approve').length;
    const rejections = request.decisions.filter(d => d.decision === 'reject').length;
    const conditional = request.decisions.filter(d => d.decision === 'conditional').length;
    
    if (rejections > 0) {
      request.reviewStage = ArchitectureReviewStage.REJECTED;
      await this.updateBlueprintStatus(request.blueprintId, 'rejected');
      await this.notifySubmitter(request, 'rejected');
    } else if (conditional > 0) {
      request.reviewStage = ArchitectureReviewStage.CONDITIONAL_APPROVAL;
      await this.updateBlueprintStatus(request.blueprintId, 'conditional_approval');
      await this.notifySubmitter(request, 'conditional_approval');
    } else {
      request.reviewStage = ArchitectureReviewStage.APPROVED;
      await this.updateBlueprintStatus(request.blueprintId, 'approved');
      await this.notifySubmitter(request, 'approved');
    }
    
    await this.updateReviewRequest(request);
  }
  
  // Helper methods
  
  private analyzeComplexity(blueprint: any): 'simple' | 'moderate' | 'complex' {
    const resourceCount = blueprint.resources?.length || 0;
    const hasNetworking = blueprint.resources?.some((r: any) => r.type === 'network');
    const hasDatabase = blueprint.resources?.some((r: any) => r.type === 'database');
    const hasLoadBalancer = blueprint.resources?.some((r: any) => r.type === 'load_balancer');
    
    if (resourceCount > 20 || (hasNetworking && hasDatabase && hasLoadBalancer)) {
      return 'complex';
    }
    
    if (resourceCount > 10 || hasDatabase) {
      return 'moderate';
    }
    
    return 'simple';
  }
  
  private async checkSecurityCompliance(blueprint: any, guardrails: any[]): Promise<any> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    
    // Check encryption at rest
    const storageResources = blueprint.resources?.filter((r: any) => 
      r.type === 'storage' || r.type === 'database'
    ) || [];
    
    for (const resource of storageResources) {
      if (!resource.encryption_enabled) {
        violations.push({
          rule: 'encryption-at-rest',
          severity: 'high',
          description: `Resource ${resource.name} does not have encryption at rest enabled`,
          remediation: 'Enable encryption at rest for all storage and database resources',
          component: resource.name
        });
      }
    }
    
    // Check public access
    const publicResources = blueprint.resources?.filter((r: any) => r.public_access === true) || [];
    
    for (const resource of publicResources) {
      if (resource.type === 'database') {
        violations.push({
          rule: 'no-public-database',
          severity: 'critical',
          description: `Database ${resource.name} has public access enabled`,
          remediation: 'Disable public access and use private endpoints or VPN',
          component: resource.name
        });
      }
    }
    
    return { violations, warnings };
  }
  
  private async checkCostCompliance(blueprint: any, estimatedCost: number): Promise<any> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    
    if (estimatedCost > 10000 && !blueprint.cost_approval_obtained) {
      warnings.push({
        rule: 'cost-approval',
        description: `Estimated cost of $${estimatedCost} exceeds threshold`,
        recommendation: 'Obtain cost approval from finance before proceeding'
      });
    }
    
    return { violations, warnings };
  }
  
  private async checkTechnologyCompliance(blueprint: any): Promise<any> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    
    // Would check against approved technology catalog
    return { violations, warnings };
  }
  
  private async checkDataCompliance(blueprint: any, requirements: string[]): Promise<any> {
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    
    // Check compliance framework requirements
    for (const requirement of requirements) {
      if (requirement === 'HIPAA' || requirement === 'PCI-DSS') {
        // Check for encryption, audit logging, etc.
        if (!blueprint.audit_logging_enabled) {
          violations.push({
            rule: `${requirement}-audit-logging`,
            severity: 'high',
            description: `${requirement} compliance requires audit logging`,
            remediation: 'Enable comprehensive audit logging for all resources'
          });
        }
      }
    }
    
    return { violations, warnings };
  }
  
  private calculateComplianceScore(violations: ComplianceViolation[], warnings: ComplianceWarning[]): number {
    let score = 100;
    
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical': score -= 25; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    }
    
    score -= warnings.length * 2;
    
    return Math.max(0, score);
  }
  
  private async findAvailableReviewer(role: ReviewerRole): Promise<any> {
    // Would query user database for reviewers with this role
    // For now, return mock data
    return {
      id: `reviewer-${role}`,
      name: `${role} Reviewer`,
      email: `${role}@company.com`,
      role
    };
  }
  
  private calculateDueDate(complexity: string): Date {
    const now = new Date();
    const days = complexity === 'simple' ? 2 : complexity === 'moderate' ? 5 : 10;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }
  
  private getNextARBSlot(): Date {
    // Would integrate with calendar to find next available slot
    const now = new Date();
    return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
  
  private async notifyReviewers(request: ArchitectureReviewRequest): Promise<void> {
    for (const reviewer of request.reviewers) {
      await this.notificationService.send({
        to: reviewer.reviewerEmail,
        subject: `Architecture Review Assigned: ${request.projectId}`,
        body: `You have been assigned to review the architecture for project ${request.projectId}. Due date: ${reviewer.dueDate.toLocaleDateString()}`
      });
    }
  }
  
  private async notifySubmitter(request: ArchitectureReviewRequest, event: string): Promise<void> {
    const submitter = await this.getUserById(request.submittedBy);
    
    let subject = '';
    let body = '';
    
    switch (event) {
      case 'approved':
        subject = `Architecture Approved: ${request.projectId}`;
        body = 'Your architecture review has been approved. You can proceed with deployment.';
        break;
      case 'rejected':
        subject = `Architecture Rejected: ${request.projectId}`;
        body = 'Your architecture review has been rejected. Please review the feedback and resubmit.';
        break;
      case 'conditional_approval':
        subject = `Architecture Conditionally Approved: ${request.projectId}`;
        body = 'Your architecture review has been conditionally approved. Please address the conditions before deployment.';
        break;
      case 'new_comment':
        subject = `New Comment on Architecture Review: ${request.projectId}`;
        body = 'A reviewer has added a new comment to your architecture review.';
        break;
    }
    
    await this.notificationService.send({
      to: submitter.email,
      subject,
      body
    });
  }
  
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private async getBlueprint(blueprintId: string): Promise<any> {
    return await this.blueprintService.getBlueprint(blueprintId);
  }
  
  private async getApplicableGuardrails(request: ArchitectureReviewRequest): Promise<any[]> {
    return await this.guardrailsService.getGuardrails({
      cloudProviders: request.cloudProviders,
      complianceRequirements: request.complianceRequirements
    });
  }
  
  private async updateReviewRequest(request: ArchitectureReviewRequest): Promise<void> {
    await this.db.query(
      'UPDATE architecture_review_requests SET data = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(request), request.id]
    );
  }
  
  private async getReviewRequest(requestId: string): Promise<ArchitectureReviewRequest> {
    const result = await this.db.query(
      'SELECT data FROM architecture_review_requests WHERE id = $1',
      [requestId]
    );
    return JSON.parse(result.rows[0].data);
  }
  
  private async updateBlueprintStatus(blueprintId: string, status: string): Promise<void> {
    await this.blueprintService.updateStatus(blueprintId, status);
  }
  
  private async getUserById(userId: string): Promise<any> {
    const result = await this.db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  }
}

export default ArchitectureApprovalWorkflow;
