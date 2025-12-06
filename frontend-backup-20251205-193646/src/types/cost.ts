export type CostPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type CostCategory = 
  | 'compute' 
  | 'storage' 
  | 'network' 
  | 'database'
  | 'analytics'
  | 'other';

export type CloudProvider = 'aws' | 'azure' | 'gcp' | 'multi-cloud';

export type OptimizationPriority = 'high' | 'medium' | 'low';

export interface CostData {
  date: string;
  total: number;
  compute: number;
  storage: number;
  network: number;
  database: number;
  analytics: number;
  other: number;
}

export interface CostSummary {
  currentMonth: number;
  lastMonth: number;
  change: number;
  changePercent: number;
  forecast: number;
  budget: number;
  budgetUsed: number;
}

export interface CostBreakdown {
  category: CostCategory;
  amount: number;
  percentage: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface ResourceCost {
  id: string;
  name: string;
  type: string;
  provider: CloudProvider;
  category: CostCategory;
  monthlyCost: number;
  dailyCost: number;
  utilizationRate: number;
  tags: Record<string, string>;
}

export interface OptimizationRecommendation {
  id: string;
  title: string;
  description: string;
  priority: OptimizationPriority;
  potentialSavings: number;
  savingsPercent: number;
  effort: 'low' | 'medium' | 'high';
  category: CostCategory;
  affectedResources: string[];
  implementationSteps: string[];
  estimatedTime: string;
}

export interface CostAlert {
  id: string;
  type: 'budget-exceeded' | 'anomaly-detected' | 'forecast-warning' | 'unused-resource';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  amount: number;
  threshold?: number;
  timestamp: string;
}

export interface BudgetConfig {
  id: string;
  name: string;
  amount: number;
  period: CostPeriod;
  spent: number;
  remaining: number;
  alertThreshold: number;
  categories?: CostCategory[];
}
