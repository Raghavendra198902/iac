import { useState } from 'react';
import { MainLayout } from '../../components/layout';
import {
  Briefcase,
  Target,
  FileText,
  Users,
  Calendar,
  AlertTriangle,
  Bug,
  MessageSquare,
  UserCheck,
  Handshake,
  Shield,
  BookOpen,
  GitBranch,
  Link2,
  Rocket,
  BarChart3,
  DollarSign,
  Award,
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

export default function ProjectManagement() {
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Project Initiation & Charter',
      icon: Target,
      color: 'blue',
      expanded: false,
      items: [
        'Define project purpose, scope, and objectives',
        'Identify stakeholders and sponsors',
        'Document business case and expected ROI',
        'Create project charter with authority and boundaries',
        'Approve initial budget and high-level timelines',
      ],
    },
    {
      id: '2',
      title: 'Project Scope Definition',
      icon: FileText,
      color: 'indigo',
      expanded: false,
      items: [
        'Break down functional and non-functional requirements',
        'Define in-scope vs out-of-scope items',
        'Create scope decomposition (features → modules → tasks)',
        'Establish acceptance criteria for each deliverable',
        'Identify scope risks and dependencies',
      ],
    },
    {
      id: '3',
      title: 'Work Breakdown Structure (WBS)',
      icon: GitBranch,
      color: 'purple',
      expanded: false,
      items: [
        'Multi-level breakdown: Project → Modules → Features → Tasks',
        'Assign owners for each task',
        'Link tasks to timelines and dependencies',
        'Create traceability from requirements to tasks',
      ],
    },
    {
      id: '4',
      title: 'Project Scheduling & Timeline Planning',
      icon: Calendar,
      color: 'green',
      expanded: false,
      items: [
        'Create Gantt chart or roadmap',
        'Critical path analysis (CPA)',
        'Identify milestones and release checkpoints',
        'Parallel execution lanes (Backend, Agents, UI, DevOps)',
        'Add buffer and contingency for high-risk items',
      ],
    },
    {
      id: '5',
      title: 'Resource & Team Planning',
      icon: Users,
      color: 'cyan',
      expanded: false,
      items: [
        'Define team composition (Backend, Frontend, Agent Dev, DevOps, QA, Infra)',
        'Assign roles and responsibilities (R&R)',
        'Calculate required engineering capacity per sprint',
        'Contractor/vendor identification (if required)',
        'Resource risk management (resignations, overload)',
      ],
    },
    {
      id: '6',
      title: 'RACI Matrix (Responsibility Assignment)',
      icon: UserCheck,
      color: 'orange',
      expanded: false,
      items: [
        'Define who is Responsible, Accountable, Consulted, Informed',
        'Apply to architecture, development, QA, deployment, governance',
        'Establish escalation hierarchy',
      ],
    },
    {
      id: '7',
      title: 'Agile Execution Model',
      icon: Rocket,
      color: 'red',
      expanded: false,
      items: [
        'Sprint planning every 1–2 weeks',
        'Daily standups with blockers reporting',
        'Sprint board (To Do → Doing → Review → Done)',
        'Backlog grooming bi-weekly',
        'Sprint review and retrospectives',
      ],
    },
    {
      id: '8',
      title: 'Risk Management Framework',
      icon: AlertTriangle,
      color: 'yellow',
      expanded: false,
      items: [
        'Identify and categorize risks',
        'Maintain risk register with severity scoring',
        'Mitigation and contingency plans',
        'Risk triggers for proactive alerts',
        'Weekly/bi-weekly risk review meetings',
      ],
    },
    {
      id: '9',
      title: 'Issue & Bug Tracking',
      icon: Bug,
      color: 'pink',
      expanded: false,
      items: [
        'Central issue tracker (Jira/Azure DevOps)',
        'Priority levels: Critical, High, Medium, Low',
        'SLA for bug resolution',
        'Root cause analysis (RCA) for critical bugs',
        'Regression testing requirements',
      ],
    },
    {
      id: '10',
      title: 'Communication Plan',
      icon: MessageSquare,
      color: 'blue',
      expanded: false,
      items: [
        'Daily communication cadence for engineers',
        'Weekly progress sync with leadership',
        'Monthly steering committee updates',
        'Communication channels: Teams/Slack/Email',
        'Templates for status reports & dashboards',
      ],
    },
    {
      id: '11',
      title: 'Stakeholder Management',
      icon: Users,
      color: 'indigo',
      expanded: false,
      items: [
        'Identify internal/external stakeholders',
        'Map stakeholders to influence/interest',
        'Create engagement strategy per stakeholder',
        'Conduct periodic alignment meetings',
        'Maintain stakeholder satisfaction index',
      ],
    },
    {
      id: '12',
      title: 'Vendor & Partner Coordination',
      icon: Handshake,
      color: 'purple',
      expanded: false,
      items: [
        'Onboard external vendors or tech partners',
        'Contract and SLA management',
        'Integration timelines and dependency mapping',
        'Technical documentation and sandbox access',
        'Periodic vendor performance reviews',
      ],
    },
    {
      id: '13',
      title: 'Quality Assurance Strategy',
      icon: Shield,
      color: 'green',
      expanded: false,
      items: [
        'Define quality metrics: defect density, test coverage, stability index',
        'Create QA workflow (test plan → execute → report)',
        'Automated testing pipeline (unit, integration, E2E)',
        'Manual testing for UX, workflows, and edge cases',
        'Performance testing every major release',
      ],
    },
    {
      id: '14',
      title: 'Documentation Management',
      icon: BookOpen,
      color: 'cyan',
      expanded: false,
      items: [
        'Maintain project repository (Confluence/Notion)',
        'Version control for documents',
        'Create onboarding guide for new team members',
        'Checklist for documentation completeness',
        'Templates: BRD, FRD, Tech Specs, Release Notes',
      ],
    },
    {
      id: '15',
      title: 'Change Control Management',
      icon: GitBranch,
      color: 'orange',
      expanded: false,
      items: [
        'Define change request (CR) workflow',
        'Impact analysis for each change',
        'Review board approval',
        'Update scope, budget, and timeline',
        'Maintain change logs',
      ],
    },
    {
      id: '16',
      title: 'Dependency & Integration Management',
      icon: Link2,
      color: 'red',
      expanded: false,
      items: [
        'Identify all upstream/downstream dependencies',
        'Maintain integration calendar',
        'API contract versioning guidelines',
        'SLA with internal/external teams',
        'Integration risk mitigation plan',
      ],
    },
    {
      id: '17',
      title: 'Release Management',
      icon: Rocket,
      color: 'yellow',
      expanded: false,
      items: [
        'Define release types (major, minor, patch)',
        'Pre-release QA checklist',
        'Release freeze period and approval gates',
        'Coordinated release calendar',
        'Post-release validation and smoke testing',
      ],
    },
    {
      id: '18',
      title: 'Performance Monitoring & KPIs',
      icon: BarChart3,
      color: 'pink',
      expanded: false,
      items: [
        'Engineering productivity KPIs',
        'Velocity per sprint',
        'Defect leakage rate',
        'MTTR for resolving production issues',
        'Release success rate',
        'Dashboard for real-time KPIs',
      ],
    },
    {
      id: '19',
      title: 'Budget Management',
      icon: DollarSign,
      color: 'blue',
      expanded: false,
      items: [
        'Cost tracking for tools, infrastructure, manpower',
        'Forecast monthly/quarterly expenses',
        'Create burn-down and burn-up charts',
        'ROI tracking and effectiveness analysis',
        'Variance and corrective action planning',
      ],
    },
    {
      id: '20',
      title: 'Post-Project Review & Lessons Learned',
      icon: Award,
      color: 'indigo',
      expanded: false,
      items: [
        'Conduct structured retrospective with all teams',
        'Document successes and failures',
        'Update architecture & PM processes based on learnings',
        'Celebrate milestone achievements',
        'Transition to support/maintenance phase',
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
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/20',
      },
      indigo: {
        bg: 'bg-indigo-50 dark:bg-indigo-900/10',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: 'text-indigo-600 dark:text-indigo-400',
        hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/20',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/10',
        border: 'border-purple-200 dark:border-purple-800',
        icon: 'text-purple-600 dark:text-purple-400',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/20',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/10',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/20',
      },
      cyan: {
        bg: 'bg-cyan-50 dark:bg-cyan-900/10',
        border: 'border-cyan-200 dark:border-cyan-800',
        icon: 'text-cyan-600 dark:text-cyan-400',
        hover: 'hover:bg-cyan-100 dark:hover:bg-cyan-900/20',
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        border: 'border-orange-200 dark:border-orange-800',
        icon: 'text-orange-600 dark:text-orange-400',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/20',
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/10',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        hover: 'hover:bg-red-100 dark:hover:bg-red-900/20',
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/10',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400',
        hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/20',
      },
      pink: {
        bg: 'bg-pink-50 dark:bg-pink-900/10',
        border: 'border-pink-200 dark:border-pink-800',
        icon: 'text-pink-600 dark:text-pink-400',
        hover: 'hover:bg-pink-100 dark:hover:bg-pink-900/20',
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Project Management Framework
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Micro-Level Enterprise Delivery Blueprint - 20 Core Components
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={expandAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
            { label: 'Total Sections', value: '20', icon: Briefcase, color: 'blue' },
            { label: 'Core Activities', value: '100+', icon: Target, color: 'green' },
            { label: 'Stakeholders', value: 'Multi', icon: Users, color: 'purple' },
            { label: 'Delivery Model', value: 'Agile', icon: Rocket, color: 'orange' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* PM Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const colors = getColorClasses(section.color);

            return (
              <div
                key={section.id}
                className={`bg-white dark:bg-gray-800 rounded-lg border-2 ${colors.border} overflow-hidden transition-all hover:shadow-md`}
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
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {section.id}. {section.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{section.items.length} activities</p>
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
                          <span className="text-gray-700 dark:text-gray-300 flex-1">{item}</span>
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Project Management Best Practices
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Comprehensive 20-section framework for enterprise delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Agile execution with sprint-based delivery model</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Risk management and quality assurance integrated</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              <span>Stakeholder and vendor management included</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
