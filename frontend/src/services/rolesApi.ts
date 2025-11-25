import apiClient from '../lib/apiClient';
import type {
  SolutionDesign,
  DesignReview,
  SolutionPattern,
  SADashboard,
  TechnicalSpecification,
  TechnologyEvaluation,
  ArchitectureDebt,
  TADashboard,
  ArchitectureProject,
  ArchitectureMilestone,
  ArchitectureDependency,
  PMDashboard,
  ImplementationTask,
  CodeReview,
  ArchitectureQuestion,
  SEDashboard,
  ApiResponse,
  PaginatedResponse,
} from '../types/roles';

// Solution Architect API
export const solutionArchitectApi = {
  // Dashboard
  getDashboard: async (): Promise<SADashboard> => {
    return apiClient.get('/api/sa/dashboard');
  },

  // Designs
  getDesigns: async (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<SolutionDesign>> => {
    return apiClient.get('/api/sa/designs', { params });
  },

  getDesign: async (id: number): Promise<SolutionDesign> => {
    return apiClient.get(`/api/sa/designs/${id}`);
  },

  createDesign: async (data: Omit<SolutionDesign, 'id' | 'design_number' | 'version' | 'created_at' | 'updated_at'>): Promise<SolutionDesign> => {
    return apiClient.post('/api/sa/designs', data);
  },

  updateDesign: async (id: number, data: Partial<SolutionDesign>): Promise<SolutionDesign> => {
    return apiClient.put(`/api/sa/designs/${id}`, data);
  },

  submitForReview: async (id: number): Promise<ApiResponse<SolutionDesign>> => {
    return apiClient.post(`/api/sa/designs/${id}/submit-review`);
  },

  approveDesign: async (id: number, data: { approver_user_id: number }): Promise<ApiResponse<SolutionDesign>> => {
    return apiClient.post(`/api/sa/designs/${id}/approve`, data);
  },

  // Reviews
  getReviews: async (designId: number): Promise<DesignReview[]> => {
    return apiClient.get(`/api/sa/designs/${designId}/reviews`);
  },

  createReview: async (data: Omit<DesignReview, 'id' | 'created_at'>): Promise<DesignReview> => {
    return apiClient.post('/api/sa/reviews', data);
  },

  // Patterns
  getPatterns: async (params?: { category?: string; page?: number; limit?: number }): Promise<PaginatedResponse<SolutionPattern>> => {
    return apiClient.get('/api/sa/patterns', { params });
  },

  getPattern: async (id: number): Promise<SolutionPattern> => {
    return apiClient.get(`/api/sa/patterns/${id}`);
  },

  createPattern: async (data: Omit<SolutionPattern, 'id' | 'usage_count' | 'created_at' | 'updated_at'>): Promise<SolutionPattern> => {
    return apiClient.post('/api/sa/patterns', data);
  },
};

// Technical Architect API
export const technicalArchitectApi = {
  // Dashboard
  getDashboard: async (): Promise<TADashboard> => {
    return apiClient.get('/api/ta/dashboard');
  },

  // Specifications
  getSpecifications: async (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<TechnicalSpecification>> => {
    return apiClient.get('/api/ta/specifications', { params });
  },

  getSpecification: async (id: number): Promise<TechnicalSpecification> => {
    return apiClient.get(`/api/ta/specifications/${id}`);
  },

  createSpecification: async (data: Omit<TechnicalSpecification, 'id' | 'spec_number' | 'version' | 'created_at' | 'updated_at'>): Promise<TechnicalSpecification> => {
    return apiClient.post('/api/ta/specifications', data);
  },

  updateSpecification: async (id: number, data: Partial<TechnicalSpecification>): Promise<TechnicalSpecification> => {
    return apiClient.put(`/api/ta/specifications/${id}`, data);
  },

  // Technology Evaluations
  getEvaluations: async (params?: { category?: string; recommendation?: string; page?: number; limit?: number }): Promise<PaginatedResponse<TechnologyEvaluation>> => {
    return apiClient.get('/api/ta/evaluations', { params });
  },

  getEvaluation: async (id: number): Promise<TechnologyEvaluation> => {
    return apiClient.get(`/api/ta/evaluations/${id}`);
  },

  createEvaluation: async (data: Omit<TechnologyEvaluation, 'id' | 'evaluation_number' | 'created_at' | 'updated_at'>): Promise<TechnologyEvaluation> => {
    return apiClient.post('/api/ta/evaluations', data);
  },

  approveEvaluation: async (id: number, data: { approver_user_id: number }): Promise<ApiResponse<TechnologyEvaluation>> => {
    return apiClient.post(`/api/ta/evaluations/${id}/approve`, data);
  },

  // Architecture Debt
  getDebt: async (params?: { severity?: string; status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<ArchitectureDebt>> => {
    return apiClient.get('/api/ta/debt', { params });
  },

  getDebtItem: async (id: number): Promise<ArchitectureDebt> => {
    return apiClient.get(`/api/ta/debt/${id}`);
  },

  createDebt: async (data: Omit<ArchitectureDebt, 'id' | 'debt_number' | 'created_at' | 'updated_at'>): Promise<ArchitectureDebt> => {
    return apiClient.post('/api/ta/debt', data);
  },

  assignDebt: async (id: number, data: { assigned_to_user_id: number }): Promise<ApiResponse<ArchitectureDebt>> => {
    return apiClient.post(`/api/ta/debt/${id}/assign`, data);
  },

  resolveDebt: async (id: number, data: { resolution_notes: string }): Promise<ApiResponse<ArchitectureDebt>> => {
    return apiClient.post(`/api/ta/debt/${id}/resolve`, data);
  },

  getDebtSummary: async (): Promise<{
    total_items: number;
    by_severity: Record<string, number>;
    by_status: Record<string, number>;
    total_monthly_cost: number;
    total_estimated_effort_days: number;
  }> => {
    return apiClient.get('/api/ta/debt/summary');
  },
};

// Project Manager API
export const projectManagerApi = {
  // Dashboard
  getDashboard: async (): Promise<PMDashboard> => {
    return apiClient.get('/api/pm/dashboard');
  },

  getPortfolioHealth: async (): Promise<{
    total_projects: number;
    health_distribution: Record<string, number>;
    budget_summary: {
      total_budget: number;
      total_spent: number;
      variance_percentage: number;
    };
    timeline_summary: {
      on_track: number;
      at_risk: number;
      delayed: number;
    };
  }> => {
    return apiClient.get('/api/pm/portfolio-health');
  },

  // Projects
  getProjects: async (params?: { status?: string; health_status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<ArchitectureProject>> => {
    return apiClient.get('/api/pm/projects', { params });
  },

  getProject: async (id: number): Promise<ArchitectureProject> => {
    return apiClient.get(`/api/pm/projects/${id}`);
  },

  createProject: async (data: Omit<ArchitectureProject, 'id' | 'project_number' | 'created_at' | 'updated_at'>): Promise<ArchitectureProject> => {
    return apiClient.post('/api/pm/projects', data);
  },

  updateProject: async (id: number, data: Partial<ArchitectureProject>): Promise<ArchitectureProject> => {
    return apiClient.put(`/api/pm/projects/${id}`, data);
  },

  updateProjectStatus: async (id: number, data: { status: string; health_status?: string }): Promise<ApiResponse<ArchitectureProject>> => {
    return apiClient.put(`/api/pm/projects/${id}/status`, data);
  },

  // Milestones
  getMilestones: async (projectId: number): Promise<ArchitectureMilestone[]> => {
    return apiClient.get(`/api/pm/projects/${projectId}/milestones`);
  },

  getUpcomingMilestones: async (days?: number): Promise<ArchitectureMilestone[]> => {
    return apiClient.get('/api/pm/milestones/upcoming', { params: { days } });
  },

  createMilestone: async (data: Omit<ArchitectureMilestone, 'id' | 'created_at' | 'updated_at'>): Promise<ArchitectureMilestone> => {
    return apiClient.post('/api/pm/milestones', data);
  },

  completeMilestone: async (id: number, data: { actual_date: string }): Promise<ApiResponse<ArchitectureMilestone>> => {
    return apiClient.post(`/api/pm/milestones/${id}/complete`, data);
  },

  // Dependencies
  getDependencies: async (projectId: number): Promise<ArchitectureDependency[]> => {
    return apiClient.get(`/api/pm/projects/${projectId}/dependencies`);
  },

  getBlockedDependencies: async (): Promise<ArchitectureDependency[]> => {
    return apiClient.get('/api/pm/dependencies/blocked');
  },

  createDependency: async (data: Omit<ArchitectureDependency, 'id' | 'created_at' | 'updated_at'>): Promise<ArchitectureDependency> => {
    return apiClient.post('/api/pm/dependencies', data);
  },

  fulfillDependency: async (id: number): Promise<ApiResponse<ArchitectureDependency>> => {
    return apiClient.post(`/api/pm/dependencies/${id}/fulfill`);
  },
};

// Software Engineer API
export const softwareEngineerApi = {
  // Dashboard
  getDashboard: async (): Promise<SEDashboard> => {
    return apiClient.get('/api/se/dashboard');
  },

  getMyDashboard: async (): Promise<{
    my_tasks: ImplementationTask[];
    my_reviews: CodeReview[];
    my_questions: ArchitectureQuestion[];
    task_stats: {
      total: number;
      in_progress: number;
      blocked: number;
      completed_this_week: number;
    };
  }> => {
    return apiClient.get('/api/se/my-dashboard');
  },

  // Tasks
  getTasks: async (params?: { status?: string; assigned_to?: number; page?: number; limit?: number }): Promise<PaginatedResponse<ImplementationTask>> => {
    return apiClient.get('/api/se/tasks', { params });
  },

  getTask: async (id: number): Promise<ImplementationTask> => {
    return apiClient.get(`/api/se/tasks/${id}`);
  },

  getMyTasks: async (): Promise<ImplementationTask[]> => {
    return apiClient.get('/api/se/my-tasks');
  },

  createTask: async (data: Omit<ImplementationTask, 'id' | 'task_number' | 'created_at' | 'updated_at'>): Promise<ImplementationTask> => {
    return apiClient.post('/api/se/tasks', data);
  },

  updateTask: async (id: number, data: Partial<ImplementationTask>): Promise<ImplementationTask> => {
    return apiClient.put(`/api/se/tasks/${id}`, data);
  },

  updateTaskStatus: async (id: number, data: { status: TaskStatus; blocked_reason?: string }): Promise<ApiResponse<ImplementationTask>> => {
    return apiClient.put(`/api/se/tasks/${id}/status`, data);
  },

  assignTask: async (id: number, data: { assigned_to_user_id: number }): Promise<ApiResponse<ImplementationTask>> => {
    return apiClient.post(`/api/se/tasks/${id}/assign`, data);
  },

  // Code Reviews
  getReviews: async (params?: { status?: string; page?: number; limit?: number }): Promise<PaginatedResponse<CodeReview>> => {
    return apiClient.get('/api/se/reviews', { params });
  },

  getPendingReviews: async (): Promise<CodeReview[]> => {
    return apiClient.get('/api/se/reviews/pending');
  },

  createReview: async (data: Omit<CodeReview, 'id' | 'created_at'>): Promise<CodeReview> => {
    return apiClient.post('/api/se/reviews', data);
  },

  getReviewStats: async (): Promise<{
    total_reviews: number;
    pending_reviews: number;
    avg_quality_score: number;
    reviews_by_status: Record<string, number>;
  }> => {
    return apiClient.get('/api/se/reviews/stats');
  },

  // Questions
  getQuestions: async (params?: { status?: string; is_blocking?: boolean; page?: number; limit?: number }): Promise<PaginatedResponse<ArchitectureQuestion>> => {
    return apiClient.get('/api/se/questions', { params });
  },

  getQuestion: async (id: number): Promise<ArchitectureQuestion> => {
    return apiClient.get(`/api/se/questions/${id}`);
  },

  createQuestion: async (data: Omit<ArchitectureQuestion, 'id' | 'question_number' | 'views_count' | 'helpful_votes' | 'created_at' | 'updated_at'>): Promise<ArchitectureQuestion> => {
    return apiClient.post('/api/se/questions', data);
  },

  answerQuestion: async (id: number, data: { answer: string; answered_by_user_id: number }): Promise<ApiResponse<ArchitectureQuestion>> => {
    return apiClient.post(`/api/se/questions/${id}/answer`, data);
  },

  markHelpful: async (id: number, data: { is_helpful: boolean }): Promise<ApiResponse<ArchitectureQuestion>> => {
    return apiClient.post(`/api/se/questions/${id}/helpful`, data);
  },
};
