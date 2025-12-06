export type SecurityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ThreatCategory = 
  | 'vulnerability' 
  | 'misconfiguration' 
  | 'access-control' 
  | 'data-exposure'
  | 'malware'
  | 'network';

export type ComplianceFramework = 
  | 'SOC2' 
  | 'ISO27001' 
  | 'HIPAA' 
  | 'PCI-DSS' 
  | 'GDPR' 
  | 'CIS';

export type RemediationStatus = 'open' | 'in-progress' | 'resolved' | 'accepted-risk';

export interface SecurityThreat {
  id: string;
  title: string;
  description: string;
  severity: SecurityLevel;
  category: ThreatCategory;
  affectedResources: string[];
  detectedAt: string;
  status: RemediationStatus;
  cveId?: string;
  cvssScore?: number;
  remediation?: string;
  estimatedImpact: string;
}

export interface ComplianceCheck {
  id: string;
  framework: ComplianceFramework;
  controlId: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'not-applicable';
  severity: SecurityLevel;
  lastChecked: string;
  resources: number;
  passed: number;
  failed: number;
}

export interface SecurityMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'good' | 'warning' | 'critical';
  threshold?: number;
}

export interface VulnerabilityScan {
  id: string;
  target: string;
  scanType: 'infrastructure' | 'application' | 'container' | 'network';
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed';
  findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login' | 'access' | 'modification' | 'alert' | 'scan';
  severity: SecurityLevel;
  user?: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  ipAddress?: string;
}

export interface SecurityStats {
  totalThreats: number;
  activeIncidents: number;
  complianceScore: number;
  vulnerabilitiesPatched: number;
  lastScanTime: string;
  securityScore: number;
}
