import { useState } from 'react';
import { 
  Shield, FileText, TrendingUp, Users, Award, CheckCircle, AlertTriangle, 
  Brain, Cloud, Lock, Target, Layers, GitBranch, DollarSign, Activity,
  BookOpen, Settings, Eye, Zap, BarChart3, PieChart, LineChart
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
  height = 80,
  showGrid = true,
}) => {
  const generateECGWaveform = (values: number[]): string => {
    if (!values || values.length === 0) {
      values = Array(8).fill(75);
    }

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
          <pattern id={`ecg-grid-func-${color}`} width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
          </pattern>
          <filter id="glow-func">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      )}
      {showGrid && <rect width={width} height={height} fill={`url(#ecg-grid-func-${color})`} />}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow-func)"
        className="animate-pulse"
      />
    </svg>
  );
};

interface EAFunction {
  id: string;
  name: string;
  category: string;
  description: string;
  responsibilities: string[];
  metrics: {
    label: string;
    value: number;
    color: string;
    trend: number[];
  }[];
  icon: any;
  color: string;
}

const EAFunctions = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const functions: EAFunction[] = [
    {
      id: 'governance',
      name: 'Governance & Compliance',
      category: 'Strategic',
      description: 'Define and enforce governance policies, compliance standards, and regulatory requirements across the enterprise',
      responsibilities: [
        'Create and manage governance policies (security, compliance, operational, financial)',
        'Monitor policy compliance and violations across all projects',
        'Approve policy exceptions and guardrail overrides',
        'Ensure regulatory compliance (SOC2, ISO27001, GDPR, HIPAA, PCI DSS)',
        'Define and enforce security baselines and standards',
        'Review and approve architecture decisions with compliance impact',
      ],
      metrics: [
        { label: 'Policy Compliance', value: 94, color: '#10b981', trend: [90, 91, 92, 93, 93, 94, 94] },
        { label: 'Active Policies', value: 32, color: '#3b82f6', trend: [28, 29, 30, 30, 31, 32, 32] },
        { label: 'Open Violations', value: 12, color: '#f59e0b', trend: [18, 16, 15, 14, 13, 12, 12] },
      ],
      icon: Shield,
      color: 'blue',
    },
    {
      id: 'patterns',
      name: 'Architecture Patterns & Standards',
      category: 'Technical',
      description: 'Define, approve, and promote reusable architecture patterns and technical standards across the organization',
      responsibilities: [
        'Create and maintain architecture pattern library (microservices, event-driven, serverless)',
        'Define best practices and implementation guidelines',
        'Review and approve new architecture patterns from solution architects',
        'Monitor pattern adoption and usage across projects',
        'Ensure patterns align with enterprise architecture vision',
        'Promote pattern reuse and standardization',
      ],
      metrics: [
        { label: 'Pattern Adoption', value: 78, color: '#8b5cf6', trend: [68, 70, 72, 74, 76, 77, 78] },
        { label: 'Active Patterns', value: 24, color: '#3b82f6', trend: [20, 21, 22, 22, 23, 24, 24] },
        { label: 'Pattern Reuse', value: 85, color: '#10b981', trend: [75, 78, 80, 82, 83, 84, 85] },
      ],
      icon: Layers,
      color: 'purple',
    },
    {
      id: 'blueprint-review',
      name: 'Blueprint Review & Approval',
      category: 'Operational',
      description: 'Review and approve infrastructure blueprints, ensuring alignment with enterprise standards and governance',
      responsibilities: [
        'Review and approve high-complexity blueprints from Solution Architects',
        'Ensure blueprints comply with governance policies and security standards',
        'Validate architecture decisions and technology choices',
        'Assess technical and business risks',
        'Provide feedback and recommendations for improvement',
        'Track approval workflow and SLA compliance',
      ],
      metrics: [
        { label: 'Pending Reviews', value: 8, color: '#f59e0b', trend: [12, 11, 10, 9, 8, 8, 8] },
        { label: 'Approved (30d)', value: 45, color: '#10b981', trend: [38, 40, 42, 43, 44, 45, 45] },
        { label: 'Avg Review Time', value: 4, color: '#3b82f6', trend: [6, 5.5, 5, 4.5, 4.2, 4, 4] },
      ],
      icon: Eye,
      color: 'orange',
    },
    {
      id: 'cost-optimization',
      name: 'Cost Optimization & FinOps',
      category: 'Financial',
      description: 'Monitor cloud spending, optimize costs, and ensure financial governance across infrastructure projects',
      responsibilities: [
        'Review and approve cost-intensive infrastructure designs',
        'Identify cost optimization opportunities using AI/ML recommendations',
        'Define cost governance policies and spending limits',
        'Monitor multi-cloud spending trends and anomalies',
        'Ensure cost allocation and chargeback accuracy',
        'Promote cost-efficient architecture patterns',
      ],
      metrics: [
        { label: 'Cost Savings (MTD)', value: 18, color: '#10b981', trend: [12, 13, 14, 15, 16, 17, 18] },
        { label: 'Budget Compliance', value: 92, color: '#3b82f6', trend: [88, 89, 90, 91, 91, 92, 92] },
        { label: 'Optimization Score', value: 87, color: '#8b5cf6', trend: [80, 82, 84, 85, 86, 87, 87] },
      ],
      icon: DollarSign,
      color: 'green',
    },
    {
      id: 'ai-governance',
      name: 'AI/ML Governance',
      category: 'Strategic',
      description: 'Govern AI/ML initiatives, ensure ethical AI practices, and leverage AI for architecture optimization',
      responsibilities: [
        'Define AI governance policies and ethical guidelines',
        'Review AI/ML architecture decisions and model deployments',
        'Monitor AI-powered recommendations and insights',
        'Ensure AI model transparency and explainability',
        'Oversee anomaly detection and predictive analytics',
        'Validate AI-driven cost optimization and capacity planning',
      ],
      metrics: [
        { label: 'AI Governance Score', value: 92, color: '#8b5cf6', trend: [85, 87, 88, 90, 91, 92, 92] },
        { label: 'AI Models Active', value: 7, color: '#3b82f6', trend: [5, 5, 6, 6, 6, 7, 7] },
        { label: 'AI Recommendations', value: 156, color: '#10b981', trend: [120, 130, 135, 142, 148, 152, 156] },
      ],
      icon: Brain,
      color: 'indigo',
    },
    {
      id: 'multi-cloud',
      name: 'Multi-Cloud Strategy',
      category: 'Strategic',
      description: 'Define and oversee multi-cloud and hybrid cloud strategies, ensuring optimal cloud provider selection',
      responsibilities: [
        'Define multi-cloud and hybrid cloud strategy',
        'Evaluate and approve cloud provider selection',
        'Ensure cloud-agnostic architecture where appropriate',
        'Monitor multi-cloud compliance and governance',
        'Optimize workload placement across cloud providers',
        'Manage cloud vendor relationships and contracts',
      ],
      metrics: [
        { label: 'Multi-Cloud Score', value: 89, color: '#3b82f6', trend: [82, 84, 85, 86, 87, 88, 89] },
        { label: 'Cloud Providers', value: 3, color: '#10b981', trend: [2, 2, 3, 3, 3, 3, 3] },
        { label: 'Workload Balance', value: 78, color: '#8b5cf6', trend: [70, 72, 74, 75, 76, 77, 78] },
      ],
      icon: Cloud,
      color: 'sky',
    },
    {
      id: 'security-arch',
      name: 'Security Architecture',
      category: 'Technical',
      description: 'Define security architecture standards, review security designs, and ensure zero-trust implementation',
      responsibilities: [
        'Define enterprise security architecture framework',
        'Establish zero-trust architecture principles',
        'Review and approve security-critical designs',
        'Ensure IAM, encryption, and access control standards',
        'Monitor security posture and vulnerabilities',
        'Coordinate with CISO on security initiatives',
      ],
      metrics: [
        { label: 'Security Posture', value: 91, color: '#ef4444', trend: [85, 87, 88, 89, 90, 91, 91] },
        { label: 'Zero Trust Score', value: 87, color: '#10b981', trend: [78, 80, 82, 84, 85, 86, 87] },
        { label: 'Vulnerabilities', value: 3, color: '#f59e0b', trend: [12, 10, 8, 6, 5, 4, 3] },
      ],
      icon: Lock,
      color: 'red',
    },
    {
      id: 'tech-roadmap',
      name: 'Technology Roadmap',
      category: 'Strategic',
      description: 'Define technology vision, strategy, and roadmap aligned with business objectives',
      responsibilities: [
        'Define enterprise architecture vision and strategy',
        'Create and maintain technology roadmap',
        'Evaluate emerging technologies and innovation opportunities',
        'Align technology strategy with business goals',
        'Prioritize architecture initiatives and investments',
        'Communicate architecture vision to stakeholders',
      ],
      metrics: [
        { label: 'Roadmap Progress', value: 76, color: '#10b981', trend: [65, 68, 70, 72, 74, 75, 76] },
        { label: 'Tech Initiatives', value: 12, color: '#3b82f6', trend: [8, 9, 10, 10, 11, 12, 12] },
        { label: 'Stakeholder Buy-in', value: 94, color: '#8b5cf6', trend: [88, 89, 90, 91, 92, 93, 94] },
      ],
      icon: Target,
      color: 'teal',
    },
    {
      id: 'team-enablement',
      name: 'Team Enablement & Training',
      category: 'Operational',
      description: 'Enable and train architecture teams, promote knowledge sharing, and build architecture capability',
      responsibilities: [
        'Mentor Solution Architects and Technical Architects',
        'Conduct architecture training and workshops',
        'Build architecture community of practice',
        'Share best practices and lessons learned',
        'Develop architecture capability maturity model',
        'Promote architecture awareness across organization',
      ],
      metrics: [
        { label: 'Active Architects', value: 24, color: '#8b5cf6', trend: [20, 21, 22, 22, 23, 24, 24] },
        { label: 'Training Sessions', value: 8, color: '#3b82f6', trend: [5, 6, 6, 7, 7, 8, 8] },
        { label: 'Knowledge Articles', value: 156, color: '#10b981', trend: [120, 130, 138, 144, 150, 153, 156] },
      ],
      icon: Users,
      color: 'violet',
    },
    {
      id: 'arch-decisions',
      name: 'Architecture Decision Records',
      category: 'Technical',
      description: 'Document and manage architecture decisions, ensuring transparency and traceability',
      responsibilities: [
        'Review and approve Architecture Decision Records (ADRs)',
        'Ensure ADRs follow enterprise standards',
        'Track decision implementation and outcomes',
        'Maintain ADR repository and documentation',
        'Promote ADR best practices',
        'Link ADRs to policies and patterns',
      ],
      metrics: [
        { label: 'Active ADRs', value: 67, color: '#3b82f6', trend: [55, 58, 60, 62, 64, 66, 67] },
        { label: 'Pending Review', value: 5, color: '#f59e0b', trend: [8, 7, 6, 6, 5, 5, 5] },
        { label: 'ADR Quality Score', value: 88, color: '#10b981', trend: [80, 82, 84, 85, 86, 87, 88] },
      ],
      icon: GitBranch,
      color: 'amber',
    },
    {
      id: 'metrics-reporting',
      name: 'Metrics & Reporting',
      category: 'Operational',
      description: 'Track architecture metrics, KPIs, and provide executive reporting on architecture health',
      responsibilities: [
        'Define and track architecture KPIs and metrics',
        'Generate executive dashboards and reports',
        'Monitor architecture health and maturity',
        'Track compliance and governance metrics',
        'Measure pattern adoption and standardization',
        'Report on ROI and business value delivered',
      ],
      metrics: [
        { label: 'Dashboard Health', value: 96, color: '#10b981', trend: [92, 93, 94, 95, 95, 96, 96] },
        { label: 'Metrics Tracked', value: 45, color: '#3b82f6', trend: [38, 40, 42, 43, 44, 45, 45] },
        { label: 'Report Frequency', value: 100, color: '#8b5cf6', trend: [100, 100, 100, 100, 100, 100, 100] },
      ],
      icon: BarChart3,
      color: 'cyan',
    },
    {
      id: 'vendor-management',
      name: 'Vendor & Technology Evaluation',
      category: 'Strategic',
      description: 'Evaluate and select technology vendors, tools, and platforms for enterprise adoption',
      responsibilities: [
        'Evaluate technology vendors and products',
        'Define technology selection criteria',
        'Conduct vendor assessments and POCs',
        'Negotiate technology contracts and licensing',
        'Manage vendor relationships and governance',
        'Monitor vendor performance and SLAs',
      ],
      metrics: [
        { label: 'Active Vendors', value: 18, color: '#3b82f6', trend: [15, 16, 16, 17, 17, 18, 18] },
        { label: 'Vendor Compliance', value: 94, color: '#10b981', trend: [88, 90, 91, 92, 93, 94, 94] },
        { label: 'Cost Optimization', value: 22, color: '#8b5cf6', trend: [15, 17, 18, 19, 20, 21, 22] },
      ],
      icon: Award,
      color: 'lime',
    },
  ];

  const overallMetrics = [
    {
      label: 'Governance Health',
      value: 93,
      color: '#10b981',
      icon: Shield,
      trend: [88, 89, 90, 91, 92, 93, 93],
    },
    {
      label: 'Architecture Maturity',
      value: 87,
      color: '#3b82f6',
      icon: Layers,
      trend: [78, 80, 82, 84, 85, 86, 87],
    },
    {
      label: 'Cost Efficiency',
      value: 89,
      color: '#8b5cf6',
      icon: DollarSign,
      trend: [82, 84, 85, 86, 87, 88, 89],
    },
    {
      label: 'Security Posture',
      value: 91,
      color: '#ef4444',
      icon: Lock,
      trend: [85, 87, 88, 89, 90, 91, 91],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            Enterprise Architect Functions & Responsibilities
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive overview of EA roles, responsibilities, and performance metrics
          </p>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overallMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8" style={{ color: metric.color }} />
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                {metric.label}
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {metric.value}%
              </div>
              <ECGMonitor
                data={metric.trend}
                color={metric.color}
                width={200}
                height={60}
                showGrid={true}
              />
            </div>
          );
        })}
      </div>

      {/* Functions Grid */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">All Functions</TabsTrigger>
          <TabsTrigger value="strategic">Strategic</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="operational">Operational</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {functions.map((func) => {
              const Icon = func.icon;
              return (
                <div
                  key={func.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-lg bg-${func.color}-100 dark:bg-${func.color}-900`}>
                      <Icon className={`h-8 w-8 text-${func.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {func.name}
                        </h3>
                        <Badge color={func.color === 'blue' ? 'blue' : func.color === 'purple' ? 'purple' : 'gray'}>
                          {func.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {func.description}
                      </p>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Key Responsibilities
                    </h4>
                    <ul className="space-y-2">
                      {func.responsibilities.slice(0, 4).map((resp, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    {func.metrics.map((metric, idx) => (
                      <div key={idx} className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {metric.label}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {metric.value}{metric.label.includes('%') || metric.label.includes('Score') || metric.label.includes('Compliance') ? '%' : ''}
                        </div>
                        <ECGMonitor
                          data={metric.trend}
                          color={metric.color}
                          width={100}
                          height={40}
                          showGrid={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Category-specific tabs */}
        {['strategic', 'technical', 'operational', 'financial'].map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {functions
                .filter((f) => f.category.toLowerCase() === category)
                .map((func) => {
                  const Icon = func.icon;
                  return (
                    <div
                      key={func.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`p-3 rounded-lg bg-${func.color}-100`}>
                          <Icon className={`h-8 w-8 text-${func.color}-600`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {func.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {func.description}
                          </p>
                        </div>
                      </div>

                      {/* Full Responsibilities List */}
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Responsibilities
                        </h4>
                        <ul className="space-y-2">
                          {func.responsibilities.map((resp, idx) => (
                            <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Metrics with ECG */}
                      <div className="grid grid-cols-3 gap-4">
                        {func.metrics.map((metric, idx) => (
                          <div key={idx} className="text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                              {metric.label}
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                              {metric.value}{metric.label.includes('%') || metric.label.includes('Score') || metric.label.includes('Compliance') ? '%' : ''}
                            </div>
                            <ECGMonitor
                              data={metric.trend}
                              color={metric.color}
                              width={100}
                              height={40}
                              showGrid={false}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default EAFunctions;
