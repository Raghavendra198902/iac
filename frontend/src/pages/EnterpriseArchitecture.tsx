import { useState } from 'react';
import { 
  Shield, Target, Layers, Database, Cloud, Lock, Users, GitBranch,
  FileText, CheckCircle, AlertTriangle, TrendingUp, Brain, Network,
  Server, Code, Box, Workflow, BarChart3, Eye, Settings, Zap
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';

// ECG Monitor Component
interface ECGMonitorProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  showGrid?: boolean;
}

const ECGMonitor: React.FC<ECGMonitorProps> = ({
  data,
  color = '#3b82f6',
  width = 200,
  height = 60,
  showGrid = true,
}) => {
  const generateECGWaveform = (values: number[]): string => {
    if (!values || values.length === 0) values = Array(8).fill(75);
    const points: string[] = [];
    const samplesPerBeat = 20;
    const totalBeats = 8;
    
    for (let beat = 0; beat < totalBeats; beat++) {
      const beatValue = values[beat % values.length] || 75;
      const amplitude = beatValue / 100;
      const baseX = (beat / totalBeats) * width;
      
      for (let i = 0; i < samplesPerBeat; i++) {
        const progress = i / samplesPerBeat;
        const x = baseX + (progress * width / totalBeats);
        let y = height / 2;
        
        if (progress < 0.15) {
          const pProgress = progress / 0.15;
          y -= Math.sin(pProgress * Math.PI) * (height * 0.08 * amplitude);
        } else if (progress >= 0.25 && progress < 0.40) {
          const qrsProgress = (progress - 0.25) / 0.15;
          if (qrsProgress < 0.3) {
            y += Math.sin(qrsProgress / 0.3 * Math.PI) * (height * 0.1 * amplitude);
          } else if (qrsProgress < 0.6) {
            const rProgress = (qrsProgress - 0.3) / 0.3;
            y -= Math.sin(rProgress * Math.PI) * (height * 0.4 * amplitude);
          } else {
            const sProgress = (qrsProgress - 0.6) / 0.4;
            y += Math.sin(sProgress * Math.PI) * (height * 0.12 * amplitude);
          }
        } else if (progress >= 0.50 && progress < 0.75) {
          const tProgress = (progress - 0.50) / 0.25;
          y -= Math.sin(tProgress * Math.PI) * (height * 0.12 * amplitude);
        }
        
        points.push(`${x},${y}`);
      }
    }
    
    return `M ${points.join(' L ')}`;
  };

  const pathData = generateECGWaveform(data);

  return (
    <svg width={width} height={height} className="ecg-monitor">
      {showGrid && (
        <defs>
          <pattern id={`ecg-grid-ea-${color}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
          </pattern>
        </defs>
      )}
      {showGrid && <rect width={width} height={height} fill={`url(#ecg-grid-ea-${color})`} />}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pulse"
      />
    </svg>
  );
};

interface Activity {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  completion: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  icon: any;
}

const EnterpriseArchitecture = () => {
  const [activeTab, setActiveTab] = useState('ea');

  // EA - Enterprise Architecture Activities
  const eaActivities: Activity[] = [
    {
      id: 'enterprise-understanding',
      name: 'Enterprise Understanding',
      description: 'Define business goals, pain points, and stakeholder requirements',
      tasks: [
        'Identify business goals and strategic objectives',
        'Document current pain points and challenges',
        'Assess security and compliance gaps',
        'Define user personas (Admin, Analyst, SOC Team, Manager, API Consumer)',
        'Establish success criteria and KPIs',
      ],
      completion: 95,
      priority: 'critical',
      owner: 'Chief Enterprise Architect',
      icon: Target,
    },
    {
      id: 'domain-mapping',
      name: 'Enterprise Domain Mapping',
      description: 'Map all enterprise domains and their relationships',
      tasks: [
        'Identity Domain - User authentication, RBAC, SSO',
        'Endpoint Domain - Agent deployment, device management',
        'Network Domain - Traffic analysis, firewall integration',
        'Forensics Domain - Evidence collection, chain of custody',
        'SOC/Monitoring Domain - SIEM integration, alerting',
        'Automation/AI Domain - ML models, automated response',
        'Cloud Domain - Multi-cloud integration, hybrid deployment',
      ],
      completion: 88,
      priority: 'critical',
      owner: 'Domain Architects',
      icon: Network,
    },
    {
      id: 'capability-mapping',
      name: 'Capability Mapping (50-200 capabilities)',
      description: 'Document all enterprise capabilities and their maturity',
      tasks: [
        'User Authentication & Authorization',
        'Agent Monitoring & Health Checks',
        'USB Device Control & Policy Enforcement',
        'Event Collection & Aggregation',
        'Threat Detection & Response',
        'File Recovery & Forensics',
        'Case Management & Workflow',
        'Cloud Sync & Multi-Region Support',
        'API Gateway & Rate Limiting',
        'Reporting & Analytics',
      ],
      completion: 82,
      priority: 'high',
      owner: 'Capability Lead',
      icon: Layers,
    },
    {
      id: 'data-architecture',
      name: 'Enterprise Data Architecture',
      description: 'Define data strategy, classification, and governance',
      tasks: [
        'Identify enterprise data sources (AD, SIEM, agents, cloud)',
        'Define data targets (databases, data lakes, archives)',
        'Data classification: Public/Internal/Sensitive/Restricted',
        'Data retention policies and compliance rules',
        'Encryption policies (at-rest and in-transit)',
        'Data lineage and impact analysis',
      ],
      completion: 90,
      priority: 'critical',
      owner: 'Data Architect',
      icon: Database,
    },
    {
      id: 'architecture-blueprint',
      name: 'Enterprise Architecture Blueprint',
      description: 'High-level logical architecture and system federation',
      tasks: [
        'Define high-level logical architecture',
        'Module federation and microservices strategy',
        'Enterprise interoperability framework',
        'Integration with AD, SIEM, Firewalls, Cloud providers',
        'API-first architecture design',
        'Event-driven architecture patterns',
      ],
      completion: 85,
      priority: 'critical',
      owner: 'Chief Enterprise Architect',
      icon: GitBranch,
    },
    {
      id: 'constraints',
      name: 'Enterprise Constraints & Governance',
      description: 'Define boundaries, limitations, and governance rules',
      tasks: [
        'Budget allocation and cost constraints',
        'Timeline and delivery milestones',
        'Compliance requirements (SOC2, ISO27001, GDPR, HIPAA)',
        'Hardware and infrastructure limitations',
        'Platform support matrix (Windows, Linux, macOS, Cloud)',
        'Risk management and mitigation strategies',
      ],
      completion: 92,
      priority: 'high',
      owner: 'Enterprise Governance Board',
      icon: Shield,
    },
  ];

  // SA - Solution Architecture Activities
  const saActivities: Activity[] = [
    {
      id: 'system-context',
      name: 'System Context Definition',
      description: 'Define system boundaries and external integrations',
      tasks: [
        'Identify external systems (AD, SIEM, Cloud, Firewalls)',
        'Define primary and secondary users',
        'Establish system boundaries and interfaces',
        'Document integration points and protocols',
        'Define data exchange formats',
      ],
      completion: 94,
      priority: 'critical',
      owner: 'Solution Architect',
      icon: Box,
    },
    {
      id: 'subsystems',
      name: 'Define Major Subsystems',
      description: 'Break down solution into key subsystems and services',
      tasks: [
        'Auth Service - OAuth2, JWT, SSO',
        'Dashboard UI - React, real-time updates',
        'Agents - Windows, Linux, macOS, Android',
        'Event Processing Pipeline - Kafka, stream processing',
        'Forensics Engine - Evidence collection, analysis',
        'File Recovery Engine - Data restoration',
        'Reporting Service - Analytics, exports',
        'API Gateway - Kong, rate limiting, authentication',
      ],
      completion: 88,
      priority: 'critical',
      owner: 'Solution Architect - Application',
      icon: Server,
    },
    {
      id: 'data-flow',
      name: 'Data Flow Definition',
      description: 'Map all data flows between components',
      tasks: [
        'Agent → Event Hub (WebSocket, gRPC)',
        'Event Hub → Processing Engine (Kafka streams)',
        'Processing Engine → Database (PostgreSQL, MongoDB)',
        'Database → Analytics Engine (ML pipelines)',
        'Analytics Engine → Dashboard (REST API)',
        'Define batch vs real-time processing',
      ],
      completion: 86,
      priority: 'high',
      owner: 'Data Flow Architect',
      icon: Workflow,
    },
    {
      id: 'integration',
      name: 'Integration Architecture',
      description: 'Design all external system integrations',
      tasks: [
        'Active Directory / LDAP integration',
        'SMTP server for notifications',
        'Cloud providers (AWS, Azure, GCP)',
        'SIEM integration (Splunk, ELK)',
        'Antivirus/EDR integration',
        'Ticketing systems (Jira, ServiceNow)',
      ],
      completion: 80,
      priority: 'high',
      owner: 'Integration Architect',
      icon: Zap,
    },
    {
      id: 'deployment',
      name: 'Deployment Topology',
      description: 'Define deployment models and infrastructure',
      tasks: [
        'On-premise deployment architecture',
        'Hybrid cloud deployment',
        'Cloud-native architecture (Kubernetes)',
        'Air-gapped environment support',
        'Multi-region failover strategy',
        'Disaster recovery and backup',
      ],
      completion: 90,
      priority: 'critical',
      owner: 'Solution Architect - Infrastructure',
      icon: Cloud,
    },
    {
      id: 'security',
      name: 'High-Level Security Architecture',
      description: 'Define security controls and architecture',
      tasks: [
        'User IAM and identity federation',
        'Role-based access control (RBAC)',
        'Token-based authentication (JWT)',
        'Zero Trust architecture principles',
        'API security (OAuth2, rate limiting)',
        'Data encryption (AES-256, TLS 1.3)',
      ],
      completion: 93,
      priority: 'critical',
      owner: 'Security Architect',
      icon: Lock,
    },
  ];

  // TA - Technical Architecture Activities
  const taActivities: Activity[] = [
    {
      id: 'api-design',
      name: 'API Design & Specification',
      description: 'Define all API endpoints and contracts',
      tasks: [
        'Document every endpoint (GET/POST/PUT/DELETE)',
        'Define request/response schemas (OpenAPI)',
        'Authentication requirements per endpoint',
        'Data validation rules and constraints',
        'Error handling and status codes',
        'API versioning strategy',
      ],
      completion: 91,
      priority: 'critical',
      owner: 'Technical Architect - API',
      icon: Code,
    },
    {
      id: 'database-design',
      name: 'Database Design & Schema',
      description: 'Detailed database architecture and optimization',
      tasks: [
        'ER Diagram with all entities and relationships',
        'Tables, columns, datatypes, constraints',
        'Index strategy for query optimization',
        'Partitioning strategy for large tables',
        'Connection pooling configuration',
        'Replication and sharding strategy',
        'Migration scripts and versioning',
      ],
      completion: 87,
      priority: 'critical',
      owner: 'Technical Architect - Data',
      icon: Database,
    },
    {
      id: 'component-architecture',
      name: 'Component-Level Architecture',
      description: 'Internal service components and modules',
      tasks: [
        'Controllers → Services → Repositories pattern',
        'Shared libraries and utilities',
        'Cross-platform agent modules',
        'Dependency injection setup',
        'Error handling middleware',
        'Logging and monitoring integration',
      ],
      completion: 85,
      priority: 'high',
      owner: 'Technical Lead',
      icon: Layers,
    },
    {
      id: 'sequence-diagrams',
      name: 'Sequence Diagrams (Micro-details)',
      description: 'Detailed interaction flows for critical operations',
      tasks: [
        'User login flow with MFA',
        'Agent registration and heartbeat',
        'Event processing pipeline',
        'Threat detection workflow',
        'File recovery operation',
        'Report generation flow',
      ],
      completion: 82,
      priority: 'high',
      owner: 'Technical Architect',
      icon: Workflow,
    },
    {
      id: 'performance',
      name: 'Performance Engineering',
      description: 'Performance optimization and scalability',
      tasks: [
        'Load testing strategy and benchmarks',
        'Caching strategy (Redis, CDN)',
        'Database query optimization',
        'API response time targets',
        'Concurrent user capacity planning',
        'Auto-scaling configuration',
      ],
      completion: 88,
      priority: 'high',
      owner: 'Performance Engineer',
      icon: TrendingUp,
    },
    {
      id: 'monitoring',
      name: 'Observability & Monitoring',
      description: 'Logging, metrics, tracing, and alerting',
      tasks: [
        'Centralized logging (ELK stack)',
        'Metrics collection (Prometheus)',
        'Distributed tracing (Jaeger)',
        'Alert rules and thresholds',
        'Dashboard design (Grafana)',
        'SLA/SLO definition',
      ],
      completion: 90,
      priority: 'critical',
      owner: 'DevOps Architect',
      icon: Eye,
    },
  ];

  const architectureLevels = [
    {
      id: 'ea',
      name: 'Enterprise Architecture (EA)',
      subtitle: 'Macro-Level Strategy with Micro Steps',
      description: 'Define WHY the project exists and HOW it fits into the organization',
      activities: eaActivities,
      color: 'blue',
      icon: Target,
      completion: 89,
    },
    {
      id: 'sa',
      name: 'Solution Architecture (SA)',
      subtitle: 'Convert Strategy into Real Solution',
      description: 'Translate EA\'s "big blueprint" into a real system design',
      activities: saActivities,
      color: 'purple',
      icon: Server,
      completion: 88,
    },
    {
      id: 'ta',
      name: 'Technical Architecture (TA)',
      subtitle: 'Engineering Blueprint',
      description: 'Deepest technical layer before coding begins',
      activities: taActivities,
      color: 'green',
      icon: Code,
      completion: 87,
    },
  ];

  const currentLevel = architectureLevels.find(l => l.id === activeTab);
  const activities = currentLevel?.activities || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-blue-600" />
            Enterprise Architecture Framework
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            EA → SA → TA: Complete architecture lifecycle management
          </p>
        </div>
      </div>

      {/* Architecture Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {architectureLevels.map((level) => {
          const Icon = level.icon;
          return (
            <div
              key={level.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 ${
                activeTab === level.id ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'
              } cursor-pointer hover:shadow-xl transition-all`}
              onClick={() => setActiveTab(level.id)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg bg-${level.color}-100 dark:bg-${level.color}-900`}>
                  <Icon className={`h-8 w-8 text-${level.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{level.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{level.subtitle}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {level.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completion</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{level.completion}%</span>
                </div>
                <ECGMonitor
                  data={[level.completion]}
                  color={level.color === 'blue' ? '#3b82f6' : level.color === 'purple' ? '#8b5cf6' : '#10b981'}
                  width={250}
                  height={50}
                  showGrid={true}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Activities Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {currentLevel?.name} - Micro Activities
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {currentLevel?.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <div
                key={activity.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {activity.name}
                      </h3>
                      <Badge color={
                        activity.priority === 'critical' ? 'red' :
                        activity.priority === 'high' ? 'orange' :
                        activity.priority === 'medium' ? 'yellow' : 'gray'
                      }>
                        {activity.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Users className="h-3 w-3" />
                      <span>{activity.owner}</span>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Key Tasks
                  </h4>
                  <ul className="space-y-2">
                    {activity.tasks.map((task, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Completion</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {activity.completion}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        activity.completion >= 90 ? 'bg-green-500' :
                        activity.completion >= 70 ? 'bg-blue-500' :
                        activity.completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${activity.completion}%` }}
                    />
                  </div>
                  <ECGMonitor
                    data={[activity.completion]}
                    color={
                      activity.completion >= 90 ? '#10b981' :
                      activity.completion >= 70 ? '#3b82f6' :
                      activity.completion >= 50 ? '#f59e0b' : '#ef4444'
                    }
                    width={300}
                    height={40}
                    showGrid={false}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Activities</div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-300">
            {eaActivities.length + saActivities.length + taActivities.length}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 mb-1">Completed</div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-300">
            {[...eaActivities, ...saActivities, ...taActivities].filter(a => a.completion >= 90).length}
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
            {[...eaActivities, ...saActivities, ...taActivities].filter(a => a.completion >= 70 && a.completion < 90).length}
          </div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Overall Progress</div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-300">
            {Math.round((eaActivities.reduce((acc, a) => acc + a.completion, 0) +
              saActivities.reduce((acc, a) => acc + a.completion, 0) +
              taActivities.reduce((acc, a) => acc + a.completion, 0)) /
              (eaActivities.length + saActivities.length + taActivities.length))}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseArchitecture;
