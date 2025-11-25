import { useState } from 'react';
import { MainLayout } from '../../components/layout';
import {
  Code2,
  FileCode,
  Monitor,
  Server,
  Layout,
  Smartphone,
  Brain,
  Database,
  Zap,
  FileText,
  Shield,
  TestTube,
  Workflow,
  Activity,
  Gauge,
  Rocket,
  Scale,
  BookOpen,
  GitPullRequest,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: any;
  color: string;
  items: string[];
  expanded: boolean;
}

export default function SoftwareEngineering() {
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Codebase Architecture & Repository Structure',
      icon: FileCode,
      color: 'blue',
      expanded: false,
      items: [
        'Monorepo vs Polyrepo decision',
        'Standard folder structure (services, modules, agents, UI)',
        'Naming conventions for files, directories, and branches',
        'Git workflow strategy (GitFlow / Trunk-based / Hybrid)',
        'Code ownership rules (CODEOWNERS)',
      ],
    },
    {
      id: '2',
      title: 'Coding Standards & Best Practices',
      icon: Code2,
      color: 'indigo',
      expanded: false,
      items: [
        'Language-specific coding guidelines (Python, Go, JS)',
        'Linting, formatting, and style enforcement',
        'Secure coding standards (OWASP, CERT)',
        'Error-handling & exception management guidelines',
        'Interface and abstraction rules',
      ],
    },
    {
      id: '3',
      title: 'Development Environments',
      icon: Monitor,
      color: 'purple',
      expanded: false,
      items: [
        'Local development environments using Docker',
        'Dev containers / VS Code remote containers',
        'Environment variables & secrets handling',
        'Developer onboarding scripts (setup.sh / setup.ps1)',
        'Hot reload and debugging configuration',
      ],
    },
    {
      id: '4',
      title: 'Backend Engineering',
      icon: Server,
      color: 'green',
      expanded: false,
      items: [
        'API development standards (FastAPI/Go/Node)',
        'Domain-driven design (DDD) layering',
        'Repository pattern for DB access',
        'Asynchronous I/O and worker patterns',
        'Logging, tracing, and structured error responses',
        'Middleware pipeline (auth, rate limit, audit logs)',
      ],
    },
    {
      id: '5',
      title: 'Frontend Engineering',
      icon: Layout,
      color: 'cyan',
      expanded: false,
      items: [
        'React component architecture (atomic design)',
        'State management (Redux, Zustand, Recoil)',
        'API integration using RTK Query / Axios',
        'Component reusability rules',
        'Responsive design and accessibility guidelines (WCAG)',
        'Client-side caching and offline support',
      ],
    },
    {
      id: '6',
      title: 'Agent Engineering (Windows, Linux, macOS, Android)',
      icon: Smartphone,
      color: 'orange',
      expanded: false,
      items: [
        'Cross-platform code sharing strategy',
        'Native extension modules for OS-specific capabilities',
        'Secure communication (TLS pinning, cert rotation)',
        'Event queueing & batching logic',
        'Process/thread management for low resource usage',
        'Self-update mechanism (signed updates, rollback)',
      ],
    },
    {
      id: '7',
      title: 'AI/ML Engineering',
      icon: Brain,
      color: 'red',
      expanded: false,
      items: [
        'Model lifecycle (training → serving → monitoring)',
        'Feature extraction pipelines',
        'Model serialization (ONNX/Pickle/SavedModel)',
        'Batch and real-time inference paths',
        'Feedback loop for continuous learning',
        'Drift detection and auto-retraining workflows',
      ],
    },
    {
      id: '8',
      title: 'Database Engineering',
      icon: Database,
      color: 'yellow',
      expanded: false,
      items: [
        'Writing optimized SQL queries',
        'Connection pooling configuration',
        'Handling long-running queries',
        'Database migrations using Alembic/Flyway',
        'Indexing and partition tuning',
        'Backup verification and restore tests',
      ],
    },
    {
      id: '9',
      title: 'Message Queue & Streaming Engineering',
      icon: Zap,
      color: 'pink',
      expanded: false,
      items: [
        'Producer-consumer implementation patterns',
        'Retry, exponential backoff, and DLQ logic',
        'Consumer group balancing',
        'Idempotent message processing',
        'Event schema versioning',
        'High-throughput pipeline tuning',
      ],
    },
    {
      id: '10',
      title: 'File & Evidence Handling Engineering',
      icon: FileText,
      color: 'blue',
      expanded: false,
      items: [
        'Multi-part uploads with integrity checks',
        'Hashing large files in chunks',
        'Secure file streaming to object storage',
        'Evidence re-verification logic',
        'Memory-safe file processing mechanisms',
      ],
    },
    {
      id: '11',
      title: 'Security Engineering',
      icon: Shield,
      color: 'indigo',
      expanded: false,
      items: [
        'JWT & OAuth2 implementations',
        'Encryption routines with KMS/Vault',
        'Secure password and secret handling',
        'Authentication & authorization middleware',
        'Dependency scanning and SBOM generation',
        'Security regression test suite',
      ],
    },
    {
      id: '12',
      title: 'Testing Engineering',
      icon: TestTube,
      color: 'purple',
      expanded: false,
      items: [
        'Test pyramid strategy (Unit → Integration → E2E)',
        'Mocking and stubbing for services',
        'Contract testing for APIs',
        'UI test automation with Playwright/Cypress',
        'Load testing with k6/JMeter',
        'Security testing integration into CI/CD',
      ],
    },
    {
      id: '13',
      title: 'DevOps Engineering',
      icon: Workflow,
      color: 'green',
      expanded: false,
      items: [
        'CI/CD pipeline templates',
        'Automated build, test, and deploy workflows',
        'Containerization standards (Docker best practices)',
        'Infrastructure as Code (Terraform/Ansible)',
        'Secrets injection and rotation automation',
        'Artifact versioning and promotion rules',
      ],
    },
    {
      id: '14',
      title: 'Observability Engineering',
      icon: Activity,
      color: 'cyan',
      expanded: false,
      items: [
        'Centralized logging instrumentation',
        'Metrics collection (Prometheus exporters)',
        'Alerts based on thresholds & anomaly detection',
        'OpenTelemetry tracing integration',
        'Dashboards for backend/agent/UI performance',
      ],
    },
    {
      id: '15',
      title: 'Performance Optimization',
      icon: Gauge,
      color: 'orange',
      expanded: false,
      items: [
        'CPU, memory, and I/O profiling tools',
        'Query optimization and caching strategy',
        'Async processing adoption for long tasks',
        'Reducing bundle size for frontend build',
        'Agent footprint minimization',
      ],
    },
    {
      id: '16',
      title: 'Release Engineering',
      icon: Rocket,
      color: 'red',
      expanded: false,
      items: [
        'Semantic versioning and tagging',
        'Automated release notes generation',
        'Package signing (agents, binaries, docker images)',
        'Blue/green and canary releases',
        'Rollback and fail-safe deployment paths',
      ],
    },
    {
      id: '17',
      title: 'Compliance Engineering',
      icon: Scale,
      color: 'yellow',
      expanded: false,
      items: [
        'Mapping code artifacts to ISO/SOC2 requirements',
        'Logging for compliance evidence',
        'Data protection enforcement in code paths',
        'Access control validation in APIs',
        'Automated compliance test scripts',
      ],
    },
    {
      id: '18',
      title: 'Documentation & Developer Experience',
      icon: BookOpen,
      color: 'pink',
      expanded: false,
      items: [
        'Auto-generated API docs using Swagger/OpenAPI',
        'ADR (Architecture Decision Records) repository',
        'Developer handbook & coding playbook',
        'Tutorials, examples, and reference implementations',
      ],
    },
    {
      id: '19',
      title: 'Code Review & Quality Gates',
      icon: GitPullRequest,
      color: 'blue',
      expanded: false,
      items: [
        'Pull request templates with mandatory checks',
        'Automated lint/security/format checks',
        'Peer review rules & reviewer assignment policies',
        'Definition of "Done" for engineering tasks',
        'Quality score and code health monitoring',
      ],
    },
    {
      id: '20',
      title: 'Software Engineering Governance',
      icon: Settings,
      color: 'indigo',
      expanded: false,
      items: [
        'Review board for critical architectural changes',
        'Enforcing coding standards and best practices',
        'Quarterly engineering maturity assessment',
        'Technical debt roadmap',
        'Engineering KPI tracking (velocity, stability index)',
      ],
    },
  ]);

  const toggleSection = (id: string) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, expanded: !section.expanded } : section
      )
    );
  };

  const expandAll = () => {
    setSections(sections.map((section) => ({ ...section, expanded: true })));
  };

  const collapseAll = () => {
    setSections(sections.map((section) => ({ ...section, expanded: false })));
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        hover: 'hover:bg-blue-100',
      },
      indigo: {
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        icon: 'text-indigo-600',
        hover: 'hover:bg-indigo-100',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: 'text-purple-600',
        hover: 'hover:bg-purple-100',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        hover: 'hover:bg-green-100',
      },
      cyan: {
        bg: 'bg-cyan-50',
        border: 'border-cyan-200',
        icon: 'text-cyan-600',
        hover: 'hover:bg-cyan-100',
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        icon: 'text-orange-600',
        hover: 'hover:bg-orange-100',
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        hover: 'hover:bg-red-100',
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
        hover: 'hover:bg-yellow-100',
      },
      pink: {
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        icon: 'text-pink-600',
        hover: 'hover:bg-pink-100',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Software Engineering Framework
            </h1>
            <p className="text-lg text-gray-600">
              Micro-Level Implementation & Delivery Blueprint - 20 Core Engineering Domains
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={expandAll}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <ChevronUp className="w-4 h-4" />
              Collapse All
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Engineering Domains', value: '20', icon: Code2, color: 'orange' },
            { label: 'Best Practices', value: '120+', icon: TestTube, color: 'green' },
            { label: 'Quality Gates', value: 'Multi', icon: Shield, color: 'purple' },
            { label: 'Tech Stack', value: 'Full', icon: Server, color: 'blue' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* SE Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const colors = getColorClasses(section.color);

            return (
              <div
                key={section.id}
                className={`bg-white rounded-lg border-2 ${colors.border} overflow-hidden transition-all hover:shadow-md`}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className={`w-full p-6 flex items-center justify-between ${colors.hover} transition-colors`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.id}. {section.title}
                      </h3>
                      <p className="text-sm text-gray-500">{section.items.length} practices</p>
                    </div>
                  </div>
                  {section.expanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {/* Section Content */}
                {section.expanded && (
                  <div className={`p-6 pt-0 ${colors.bg} border-t ${colors.border}`}>
                    <ul className="space-y-3">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`mt-1.5 w-2 h-2 rounded-full ${colors.icon.replace('text-', 'bg-')}`} />
                          <span className="text-gray-700 flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Summary */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Code2 className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Software Engineering Excellence
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              <span>Full-stack engineering practices from code to deployment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              <span>Security, testing, and compliance integrated at every layer</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              <span>DevOps and observability engineering standards</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
              <span>Quality gates and governance for engineering excellence</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
