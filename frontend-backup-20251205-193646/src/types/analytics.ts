export type MetricCategory = 
  | 'infrastructure' 
  | 'cost' 
  | 'performance' 
  | 'security' 
  | 'compliance'
  | 'deployment';

export type TimeRange = '1h' | '24h' | '7d' | '30d' | '90d' | 'custom';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'donut';

export interface Metric {
  id: string;
  name: string;
  category: MetricCategory;
  value: number;
  unit: string;
  change: number;
  changeType: 'increase' | 'decrease';
  trend: 'up' | 'down' | 'stable';
  target?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
}

export interface ChartData {
  id: string;
  title: string;
  type: ChartType;
  category: MetricCategory;
  data: DataPoint[];
  legend?: string[];
  colors?: string[];
}

export interface DataPoint {
  label: string;
  value: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface TimeSeriesData {
  timestamp: string;
  [key: string]: number | string;
}

export interface AnalyticsFilter {
  timeRange: TimeRange;
  category?: MetricCategory;
  customStartDate?: string;
  customEndDate?: string;
}

export interface AnalyticsStats {
  totalResources: number;
  totalCost: number;
  avgPerformance: number;
  securityScore: number;
  complianceRate: number;
  deploymentSuccess: number;
}

export interface Insight {
  id: string;
  type: 'recommendation' | 'warning' | 'alert' | 'info';
  category: MetricCategory;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  potentialSavings?: number;
  actionable: boolean;
  timestamp: string;
}
