export interface CostEstimateRequest {
  blueprintId: string;
  targetCloud: 'azure' | 'aws' | 'gcp' | 'on-premise';
  region: string;
  resources: ResourceSpec[];
  duration?: number; // months, default 12
  options?: {
    includeSupport?: boolean;
    includeNetworkEgress?: boolean;
    includeBackup?: boolean;
  };
}

export interface ResourceSpec {
  type: string;
  name: string;
  sku?: string;
  size?: string;
  count?: number;
  tier?: string;
  properties?: Record<string, any>;
}

export interface CostEstimate {
  estimateId: string;
  blueprintId: string;
  targetCloud: string;
  region: string;
  totalCost: CostBreakdown;
  resources: ResourceCost[];
  recommendations: CostRecommendation[];
  createdAt: Date;
  expiresAt: Date;
}

export interface CostBreakdown {
  hourly: number;
  daily: number;
  monthly: number;
  yearly: number;
  currency: string;
  breakdown: {
    compute: number;
    storage: number;
    network: number;
    database: number;
    other: number;
  };
}

export interface ResourceCost {
  resourceName: string;
  resourceType: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  monthlyCost: number;
  yearlyCost: number;
  pricingTier: string;
}

export interface CostRecommendation {
  id: string;
  type: 'right_sizing' | 'reserved_instance' | 'savings_plan' | 'spot_instance' | 'storage_tier' | 'idle_resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  currentCost: number;
  optimizedCost: number;
  savingsAmount: number;
  savingsPercentage: number;
  resourceName: string;
  implementation: string;
  effort: 'low' | 'medium' | 'high';
}

export interface Budget {
  budgetId: string;
  name: string;
  blueprintId?: string;
  environment?: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  currency: string;
  alerts: BudgetAlert[];
  currentSpend: number;
  lastUpdated: Date;
  createdBy: string;
  status: 'active' | 'exceeded' | 'warning' | 'disabled';
}

export interface BudgetAlert {
  threshold: number; // percentage
  recipients: string[];
  notified: boolean;
  lastNotification?: Date;
}

export interface ActualCostRequest {
  deploymentId?: string;
  blueprintId?: string;
  startDate: string;
  endDate: string;
  groupBy?: 'resource' | 'service' | 'region' | 'tag';
}

export interface ActualCost {
  deploymentId?: string;
  blueprintId?: string;
  period: {
    start: Date;
    end: Date;
  };
  totalCost: number;
  currency: string;
  breakdown: CostBreakdown;
  trends: CostTrend[];
  items: ActualCostItem[];
}

export interface ActualCostItem {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  service: string;
  cost: number;
  usage: {
    quantity: number;
    unit: string;
  };
  tags?: Record<string, string>;
}

export interface CostTrend {
  date: string;
  cost: number;
  forecastCost?: number;
}

export interface IdleResource {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  deploymentId: string;
  idleReason: string;
  idleDuration: number; // hours
  monthlyCost: number;
  recommendation: string;
  detectedAt: Date;
  metrics: {
    cpuUtilization?: number;
    memoryUtilization?: number;
    networkIn?: number;
    networkOut?: number;
    iops?: number;
  };
}

export interface CostAlert {
  alertId: string;
  type: 'budget_exceeded' | 'anomaly_detected' | 'idle_resource' | 'cost_spike';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  blueprintId?: string;
  deploymentId?: string;
  amount?: number;
  threshold?: number;
  detectedAt: Date;
  acknowledged: boolean;
}

export interface PricingData {
  cloud: string;
  region: string;
  resourceType: string;
  sku: string;
  tier: string;
  unitPrice: number;
  unit: string;
  currency: string;
  effectiveDate: Date;
  metadata?: Record<string, any>;
}

export interface OptimizationReport {
  reportId: string;
  blueprintId?: string;
  deploymentId?: string;
  generatedAt: Date;
  currentMonthlyCost: number;
  optimizedMonthlyCost: number;
  totalSavings: number;
  savingsPercentage: number;
  recommendations: CostRecommendation[];
  summary: {
    rightSizing: { count: number; savings: number };
    reservedInstances: { count: number; savings: number };
    idleResources: { count: number; savings: number };
    storageTiering: { count: number; savings: number };
  };
}
