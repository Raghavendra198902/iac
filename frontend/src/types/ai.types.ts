// Project types
export interface AIProject {
  id: string;
  name: string;
  description: string;
  mode: 'oneclick' | 'advanced';
  status: 'draft' | 'processing' | 'completed' | 'failed';
  userId: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// Generation request types
export interface GenerationRequest {
  id: string;
  projectId: string;
  inputData: OneClickInput | AdvancedInput;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedCompletion?: string;
  startedAt?: string;
  completedAt?: string;
}

// One-Click input
export interface OneClickInput {
  businessGoal: string;
  compliance: string[];
  budgetMin: number;
  budgetMax: number;
  timeline: number; // months
  usersPerDay: number;
  concurrentUsers: number;
}

// Advanced input (per step)
export interface AdvancedInput {
  step1?: EnterpriseUnderstanding;
  step2?: DomainCapabilityMapping;
  step3?: SolutionArchitecture;
  step4?: TechnicalArchitecture;
  step5?: ComplianceValidation;
  step6?: ProjectPlanning;
}

export interface EnterpriseUnderstanding {
  businessGoals: string[];
  successCriteria: string[];
  constraints: string[];
  stakeholders: string[];
  compliance: string[];
}

export interface DomainCapabilityMapping {
  domains: Domain[];
  capabilities: Capability[];
}

export interface Domain {
  id: string;
  name: string;
  description: string;
  color: string;
  position: { x: number; y: number };
}

export interface Capability {
  id: string;
  name: string;
  domainId: string;
  type: 'core' | 'supporting' | 'enabling';
  maturityLevel: 1 | 2 | 3 | 4 | 5;
}

export interface SolutionArchitecture {
  components: SAComponent[];
  connections: SAConnection[];
  techStack: TechStack;
}

export interface SAComponent {
  id: string;
  name: string;
  type: 'frontend' | 'backend' | 'database' | 'cache' | 'queue' | 'api' | 'external';
  technology: string;
  position: { x: number; y: number };
}

export interface SAConnection {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'sync' | 'async' | 'data';
  protocol: string;
}

export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  infrastructure: string[];
  devops: string[];
}

export interface TechnicalArchitecture {
  iacCode: string;
  iacType: 'terraform' | 'cloudformation' | 'pulumi';
  cloudProvider: 'aws' | 'azure' | 'gcp' | 'multi';
  schemas: DatabaseSchema[];
  apis: APISpec[];
}

export interface DatabaseSchema {
  name: string;
  type: 'sql' | 'nosql';
  tables: Table[];
}

export interface Table {
  name: string;
  columns: Column[];
  indexes: Index[];
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: string;
}

export interface Index {
  name: string;
  columns: string[];
  unique: boolean;
}

export interface APISpec {
  path: string;
  method: string;
  description: string;
  request: object;
  response: object;
}

export interface ComplianceValidation {
  frameworks: string[];
  results: ComplianceResult[];
}

export interface ComplianceResult {
  framework: string;
  score: number;
  gaps: ComplianceGap[];
  controls: ComplianceControl[];
}

export interface ComplianceGap {
  id: string;
  control: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  autoFixAvailable: boolean;
}

export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partial';
  evidence: string[];
}

export interface ProjectPlanning {
  wbs: WBSItem[];
  gantt: GanttTask[];
  risks: Risk[];
  resources: Resource[];
}

export interface WBSItem {
  id: string;
  name: string;
  parentId?: string;
  duration: number;
  effort: number;
  dependencies: string[];
}

export interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies: string[];
  assignees: string[];
}

export interface Risk {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  mitigation: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string;
  allocation: number;
  cost: number;
}

// Artifact types
export interface Artifact {
  id: string;
  requestId: string;
  type: 'ea' | 'sa' | 'ta' | 'pm' | 'se' | 'compliance';
  name: string;
  content: any;
  format: 'markdown' | 'json' | 'code' | 'diagram' | 'pdf';
  size: number;
  createdAt: string;
}

// AI Agent types
export interface AIAgent {
  id: string;
  name: string;
  type: 'chief' | 'ea' | 'sa' | 'ta' | 'pm' | 'se';
  status: 'idle' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  message?: string;
}

// WebSocket message types
export interface WSMessage {
  type: 'agent_status' | 'progress_update' | 'artifact_ready' | 'generation_complete' | 'error';
  data: any;
  timestamp: string;
}
