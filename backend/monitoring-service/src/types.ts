export interface MonitoringRegistration {
  deploymentId: string;
  blueprintId: string;
  environment: string;
  enabled: boolean;
}

export interface DriftItem {
  resource: string;
  property: string;
  expected: any;
  actual: any;
  severity: 'low' | 'medium' | 'high';
  action: 'auto-fix' | 'notify' | 'manual';
}

export interface DriftReport {
  deploymentId: string;
  driftDetected: boolean;
  driftItems: DriftItem[];
  autoRemediationEnabled: boolean;
  lastCheck: Date;
}

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: HealthCheck[];
  lastCheck: Date;
}

export interface CostStatus {
  current: number;
  budget: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  anomalies: string[];
  lastCheck: Date;
}

export interface RemediationAction {
  deploymentId: string;
  action: 'fix-drift' | 'restart-service' | 'scale-up' | 'scale-down' | 'rollback';
  reason?: string;
}

export interface RemediationResult {
  success: boolean;
  action: string;
  details: string;
  timestamp: Date;
}
