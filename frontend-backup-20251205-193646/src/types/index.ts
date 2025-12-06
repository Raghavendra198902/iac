// Common Types
export type CloudProvider = 'azure' | 'aws' | 'gcp' | 'on-premise';
export type Environment = 'development' | 'staging' | 'production';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type DeploymentStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';

// Blueprint Types
export interface Blueprint {
  id: string;
  name: string;
  description: string;
  version: string;
  targetCloud: CloudProvider;
  environment: Environment;
  resources: Resource[];
  metadata: Record<string, any>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id?: string;
  type: string;
  name: string;
  sku?: string;
  quantity?: number;
  properties: Record<string, any>;
  reasoning?: string;
  confidence?: number;
  estimatedCost?: number;
}

export interface CreateBlueprintRequest {
  name: string;
  description: string;
  targetCloud: CloudProvider;
  environment: Environment;
  resources: Omit<Resource, 'id'>[];
}

// NLP Blueprint Generation
export interface NLPBlueprintRequest {
  userInput: string;
  targetCloud?: CloudProvider;
  environment?: Environment;
  constraints?: {
    budget?: number;
    region?: string;
    [key: string]: any;
  };
  userId?: string;
}

export interface BlueprintFromNLP {
  blueprintId: string;
  name: string;
  description: string;
  targetCloud: CloudProvider;
  environment: Environment;
  resources: Resource[];
  confidence: number;
  metadata: Record<string, any>;
  createdAt: string;
}

// Risk Assessment
export interface RiskFactor {
  factorId: string;
  category: 'security' | 'availability' | 'cost' | 'performance' | 'operational';
  severity: RiskLevel;
  title: string;
  description: string;
  impact: string;
  probability: number;
  mitigation: string;
  resourcesAffected: string[];
}

export interface RiskAssessment {
  assessmentId: string;
  blueprintId?: string;
  overallRisk: RiskLevel;
  riskScore: number;
  riskFactors: RiskFactor[];
  recommendations: string[];
  assessedAt: string;
  metadata?: Record<string, any>;
}

export interface RiskAssessmentRequest {
  blueprintId?: string;
  resources?: Resource[];
  historicalContext?: {
    deploymentFailures?: number;
    avgDowntime?: number;
    [key: string]: any;
  };
}

// Recommendations
export interface MLRecommendation {
  recommendationId: string;
  type: 'performance' | 'cost' | 'security' | 'reliability';
  category: string;
  title: string;
  description: string;
  impact: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementationSteps: string[];
  estimatedSavings?: number;
  resourcesAffected: string[];
}

export interface RecommendationsResponse {
  recommendations: MLRecommendation[];
  totalCount: number;
  generatedAt: string;
}

// Cost Estimation
export interface CostEstimate {
  id: string;
  blueprintId: string;
  totalCost: number;
  breakdown: CostBreakdown[];
  currency: string;
  estimatedAt: string;
}

export interface CostBreakdown {
  resourceType: string;
  resourceName: string;
  monthlyCost: number;
  annualCost: number;
  details: Record<string, any>;
}

export interface BudgetAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  currentSpend: number;
  budgetLimit: number;
  percentageUsed: number;
}

// Deployment
export interface Deployment {
  id: string;
  blueprintId: string;
  status: DeploymentStatus;
  targetCloud: CloudProvider;
  environment: Environment;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  logs: DeploymentLog[];
  resources: DeployedResource[];
}

export interface DeploymentLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: Record<string, any>;
}

export interface DeployedResource {
  resourceId: string;
  resourceType: string;
  resourceName: string;
  status: 'pending' | 'creating' | 'created' | 'failed';
  cloudResourceId?: string;
  errorMessage?: string;
}

// Monitoring
export interface DriftDetection {
  id: string;
  blueprintId: string;
  deploymentId: string;
  hasDrift: boolean;
  driftDetails: DriftDetail[];
  detectedAt: string;
}

export interface DriftDetail {
  resourceName: string;
  resourceType: string;
  driftType: 'added' | 'removed' | 'modified';
  expectedState: Record<string, any>;
  actualState: Record<string, any>;
  differences: string[];
}

// Patterns
export interface Pattern {
  patternId: string;
  patternType: 'architecture' | 'resource' | 'deployment' | 'failure';
  name: string;
  description: string;
  frequency: number;
  confidence: number;
  examples: Array<{
    blueprintId?: string;
    resources?: string[];
    [key: string]: any;
  }>;
  insights: string[];
}

// Intent Analysis
export interface Intent {
  intentType: 'create_infrastructure' | 'modify_infrastructure' | 'scale_infrastructure' | 'optimize_cost' | 'improve_security' | 'troubleshoot';
  confidence: number;
  entities: Record<string, any>;
}

export interface IntentAnalysis {
  primaryIntent: Intent;
  secondaryIntents: Intent[];
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number;
  extractedRequirements: {
    environment?: string;
    resourceType?: string;
    autoScaling?: boolean;
    highAvailability?: boolean;
    encryption?: boolean;
    backup?: boolean;
    performanceFocus?: boolean;
    compliance?: string[];
    [key: string]: any;
  };
}

// User & Auth
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  organizationId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
