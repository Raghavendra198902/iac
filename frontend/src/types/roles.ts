// Role-Based Architecture Types

export type DesignStatus = 'draft' | 'in_review' | 'approved' | 'implemented' | 'deprecated';
export type ReviewType = 'peer_review' | 'technical_review' | 'security_review' | 'architecture_review' | 'final_review';
export type PatternCategory = 'integration' | 'data' | 'security' | 'performance' | 'scalability' | 'resilience' | 'deployment';
export type TechnologyRecommendation = 'strongly_recommended' | 'recommended' | 'conditional' | 'not_recommended';
export type DebtSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ProjectHealthStatus = 'green' | 'yellow' | 'red';
export type ProjectType = 'new_development' | 'modernization' | 'migration' | 'integration' | 'optimization' | 'poc';
export type MilestoneStatus = 'planned' | 'in_progress' | 'completed' | 'delayed' | 'at_risk';
export type DependencyCriticality = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'completed' | 'cancelled';
export type TaskComplexity = 'trivial' | 'simple' | 'moderate' | 'complex' | 'very_complex';

// Solution Architect Types
export interface SolutionDesign {
  id: number;
  design_number: string;
  title: string;
  description: string;
  business_context: string;
  technical_approach: string;
  architecture_diagram_url?: string;
  technology_stack: string[];
  estimated_cost?: number;
  estimated_timeline_weeks?: number;
  status: DesignStatus;
  version: number;
  parent_design_id?: number;
  submitted_for_review_at?: string;
  approved_at?: string;
  approved_by_user_id?: number;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface DesignReview {
  id: number;
  design_id: number;
  review_type: ReviewType;
  reviewer_user_id: number;
  comments: string;
  recommendations?: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewed_at?: string;
  created_at: string;
}

export interface SolutionPattern {
  id: number;
  pattern_name: string;
  category: PatternCategory;
  description: string;
  use_cases: string[];
  implementation_details: string;
  benefits: string[];
  trade_offs?: string[];
  code_example?: string;
  diagram_url?: string;
  usage_count: number;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface SADashboard {
  total_designs: number;
  designs_by_status: {
    draft: number;
    in_review: number;
    approved: number;
    implemented: number;
  };
  pending_reviews: number;
  patterns_library_count: number;
  avg_review_time_days: number;
  recent_designs: SolutionDesign[];
  pending_review_list: DesignReview[];
  popular_patterns: SolutionPattern[];
}

// Technical Architect Types
export interface TechnicalSpecification {
  id: number;
  spec_number: string;
  title: string;
  description: string;
  solution_design_id?: number;
  technology_stack: string[];
  architecture_details: string;
  integration_points?: string[];
  security_requirements?: string;
  performance_requirements?: string;
  scalability_considerations?: string;
  monitoring_strategy?: string;
  deployment_strategy?: string;
  version: number;
  status: 'draft' | 'under_review' | 'approved' | 'implemented';
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TechnologyEvaluation {
  id: number;
  evaluation_number: string;
  technology_name: string;
  version: string;
  category: string;
  evaluation_purpose: string;
  evaluation_criteria: string[];
  pros: string[];
  cons: string[];
  recommendation: TechnologyRecommendation;
  cost_implications?: string;
  poc_required: boolean;
  poc_completed: boolean;
  poc_results?: string;
  poc_repository_url?: string;
  approved_at?: string;
  approved_by_user_id?: number;
  evaluated_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ArchitectureDebt {
  id: number;
  debt_number: string;
  title: string;
  description: string;
  affected_systems: string[];
  severity: DebtSeverity;
  impact_description: string;
  proposed_resolution: string;
  estimated_effort_days?: number;
  maintenance_cost_monthly?: number;
  priority_score: number;
  status: 'identified' | 'assigned' | 'in_progress' | 'resolved' | 'accepted';
  assigned_to_user_id?: number;
  resolved_at?: string;
  resolution_notes?: string;
  identified_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TADashboard {
  total_specifications: number;
  specifications_by_status: {
    draft: number;
    under_review: number;
    approved: number;
    implemented: number;
  };
  total_evaluations: number;
  evaluations_pending_approval: number;
  architecture_debt: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  debt_monthly_cost: number;
  recent_specifications: TechnicalSpecification[];
  pending_evaluations: TechnologyEvaluation[];
  critical_debt: ArchitectureDebt[];
}

// Project Manager Types
export interface ArchitectureProject {
  id: number;
  project_number: string;
  name: string;
  description: string;
  project_type: ProjectType;
  solution_design_id?: number;
  start_date: string;
  planned_end_date: string;
  actual_end_date?: string;
  total_budget?: number;
  spent_to_date?: number;
  health_status: ProjectHealthStatus;
  status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
  stakeholders: string[];
  project_manager_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ArchitectureMilestone {
  id: number;
  project_id: number;
  milestone_name: string;
  description: string;
  planned_date: string;
  actual_date?: string;
  status: MilestoneStatus;
  deliverables: string[];
  dependencies?: string[];
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface ArchitectureDependency {
  id: number;
  project_id: number;
  dependency_type: 'internal' | 'external' | 'technology' | 'team' | 'vendor';
  description: string;
  dependent_on: string;
  criticality: DependencyCriticality;
  status: 'pending' | 'fulfilled' | 'blocked' | 'at_risk';
  required_by_date?: string;
  fulfilled_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PMDashboard {
  total_projects: number;
  projects_by_status: {
    planning: number;
    in_progress: number;
    on_hold: number;
    completed: number;
  };
  projects_by_health: {
    green: number;
    yellow: number;
    red: number;
  };
  upcoming_milestones: number;
  blocked_dependencies: number;
  total_budget: number;
  spent_to_date: number;
  budget_variance_percentage: number;
  recent_projects: ArchitectureProject[];
  at_risk_milestones: ArchitectureMilestone[];
  critical_dependencies: ArchitectureDependency[];
}

// Software Engineer Types
export interface ImplementationTask {
  id: number;
  task_number: string;
  title: string;
  description: string;
  technical_spec_id?: number;
  project_id?: number;
  task_type: 'feature' | 'bug_fix' | 'refactor' | 'documentation' | 'testing' | 'deployment';
  complexity: TaskComplexity;
  estimated_hours?: number;
  actual_hours?: number;
  status: TaskStatus;
  priority: number;
  assigned_to_user_id?: number;
  branch_name?: string;
  pull_request_url?: string;
  commit_ids?: string[];
  blocked_reason?: string;
  completed_at?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface CodeReview {
  id: number;
  task_id: number;
  pull_request_url: string;
  reviewer_user_id: number;
  review_status: 'pending' | 'approved' | 'changes_requested' | 'commented';
  code_quality_score?: number;
  comments: string;
  critical_issues: string[];
  major_issues: string[];
  minor_issues: string[];
  reviewed_at?: string;
  created_at: string;
}

export interface ArchitectureQuestion {
  id: number;
  question_number: string;
  title: string;
  question_details: string;
  context: string;
  related_component?: string;
  is_blocking: boolean;
  asked_by_user_id: number;
  answered_by_user_id?: number;
  answer?: string;
  answer_date?: string;
  is_helpful?: boolean;
  views_count: number;
  helpful_votes: number;
  status: 'open' | 'answered' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface SEDashboard {
  total_tasks: number;
  my_tasks: number;
  tasks_by_status: {
    todo: number;
    in_progress: number;
    in_review: number;
    blocked: number;
    completed: number;
  };
  pending_code_reviews: number;
  avg_code_quality_score: number;
  open_questions: number;
  blocking_questions: number;
  recent_tasks: ImplementationTask[];
  pending_reviews: CodeReview[];
  recent_questions: ArchitectureQuestion[];
}

// Common API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
