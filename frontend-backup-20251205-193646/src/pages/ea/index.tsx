import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Layers, 
  GitBranch, 
  Shield, 
  Target, 
  Network, 
  FileText,
  BarChart3,
  Users,
  Building,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  Briefcase
} from 'lucide-react';
import { MainLayout } from '../../components/layout';

export default function EnterpriseArchitectureIndex() {
  const [activeProjects, setActiveProjects] = useState(0);
  const [applications, setApplications] = useState(0);
  const [decisions, setDecisions] = useState(0);
  const [compliance, setCompliance] = useState(0);

  useEffect(() => {
    // Animate numbers on load
    const animateValue = (setter: (v: number) => void, end: number, duration: number) => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setter(end);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateValue(setActiveProjects, 24, 1000);
    animateValue(setApplications, 186, 1200);
    animateValue(setDecisions, 47, 800);
    animateValue(setCompliance, 94, 1500);
  }, []);

  const eaModules = [
    {
      title: 'Architecture Strategy',
      description: 'Define and manage enterprise architecture strategy, principles, and governance',
      icon: Target,
      color: 'blue',
      path: '/ea/strategy',
      features: ['Strategic Planning', 'Architecture Principles', 'Governance Framework'],
      status: 'active',
      count: 12
    },
    {
      title: 'Business Architecture',
      description: 'Model business capabilities, processes, and organizational structure',
      icon: Building,
      color: 'purple',
      path: '/ea/business',
      features: ['Capability Mapping', 'Process Models', 'Value Streams'],
      status: 'planning',
      count: 8
    },
    {
      title: 'Application Architecture',
      description: 'Manage application portfolio, integrations, and technology stack',
      icon: Layers,
      color: 'green',
      path: '/ea/application',
      features: ['Portfolio Management', 'Application Catalog', 'Integration Patterns'],
      status: 'active',
      count: 186
    },
    {
      title: 'Data Architecture',
      description: 'Design data models, governance, and information flows',
      icon: Network,
      color: 'cyan',
      path: '/ea/data',
      features: ['Data Models', 'Data Governance', 'Information Architecture'],
      status: 'active',
      count: 34
    },
    {
      title: 'Technology Architecture',
      description: 'Define infrastructure, platforms, and technical standards',
      icon: GitBranch,
      color: 'orange',
      path: '/ea/technology',
      features: ['Infrastructure Design', 'Platform Strategy', 'Tech Standards'],
      status: 'active',
      count: 52
    },
    {
      title: 'Security Architecture',
      description: 'Establish security controls, compliance, and risk management',
      icon: Shield,
      color: 'red',
      path: '/ea/security',
      features: ['Security Controls', 'Compliance', 'Risk Assessment'],
      status: 'review',
      count: 28
    },
    {
      title: 'Architecture Roadmap',
      description: 'Plan transformation initiatives and track architecture evolution',
      icon: TrendingUp,
      color: 'indigo',
      path: '/ea/roadmap',
      features: ['Transformation Planning', 'Migration Strategy', 'Timeline'],
      status: 'active',
      count: 15
    },
    {
      title: 'Architecture Repository',
      description: 'Central repository for architecture artifacts, SA/TA/LLD documents, and diagrams',
      icon: FileText,
      color: 'gray',
      path: '/ea/repository',
      features: ['SA/TA/LLD Editors', 'Diagram Generator', 'AI Document Creation'],
      status: 'active',
      count: 243
    },
    {
      title: 'Stakeholder Management',
      description: 'Manage stakeholders, committees, and architecture decisions',
      icon: Users,
      color: 'pink',
      path: '/ea/stakeholders',
      features: ['Stakeholder Registry', 'Decision Log', 'Committee Tracking'],
      status: 'active',
      count: 67
    },
    {
      title: 'Architecture Analytics',
      description: 'Analyze architecture metrics, KPIs, and portfolio insights',
      icon: BarChart3,
      color: 'yellow',
      path: '/ea/analytics',
      features: ['Architecture Metrics', 'Portfolio Analytics', 'Compliance Reports'],
      status: 'active',
      count: 94
    },
    {
      title: 'EA Responsibilities',
      description: 'Comprehensive guide to all 15 Enterprise Architect responsibility areas',
      icon: Briefcase,
      color: 'emerald',
      path: '/ea/responsibilities',
      features: ['15 Responsibility Areas', 'Best Practices', 'Strategic Impact'],
      status: 'active',
      count: 15
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; icon: string; hover: string }> = {
      blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', icon: 'text-blue-600 dark:text-blue-400', hover: 'hover:border-blue-400' },
      purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', icon: 'text-purple-600 dark:text-purple-400', hover: 'hover:border-purple-400' },
      green: { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: 'text-green-600 dark:text-green-400', hover: 'hover:border-green-400' },
      cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-800', icon: 'text-cyan-600 dark:text-cyan-400', hover: 'hover:border-cyan-400' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', icon: 'text-orange-600 dark:text-orange-400', hover: 'hover:border-orange-400' },
      red: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: 'text-red-600 dark:text-red-400', hover: 'hover:border-red-400' },
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800', icon: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:border-indigo-400' },
      gray: { bg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700', icon: 'text-gray-600 dark:text-gray-400', hover: 'hover:border-gray-400' },
      pink: { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-800', icon: 'text-pink-600 dark:text-pink-400', hover: 'hover:border-pink-400' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: 'text-yellow-600 dark:text-yellow-400', hover: 'hover:border-yellow-400' }
    };
    return colors[color] || colors.blue;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; icon: any; classes: string }> = {
      active: { label: 'Active', icon: CheckCircle2, classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      planning: { label: 'Planning', icon: Clock, classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      review: { label: 'In Review', icon: AlertCircle, classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' }
    };
    return statusConfig[status] || statusConfig.active;
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Enterprise Architecture
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive framework for managing and evolving your enterprise architecture
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Active Projects', value: activeProjects, change: '+12%', icon: Target, color: 'blue' },
            { label: 'Applications', value: applications, change: '+8%', icon: Layers, color: 'green' },
            { label: 'Architecture Decisions', value: decisions, change: '+5', icon: FileText, color: 'purple' },
            { label: 'Compliance Score', value: `${compliance}%`, change: '+3%', icon: Shield, color: 'red' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
                <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {typeof stat.value === 'number' && stat.value === 0 ? '...' : stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* EA Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eaModules.map((module) => {
            const Icon = module.icon;
            const colors = getColorClasses(module.color);
            const statusBadge = getStatusBadge(module.status);
            const StatusIcon = statusBadge.icon;
            
            return (
              <Link
                key={module.path}
                to={module.path}
                className={`block p-6 rounded-xl border-2 ${colors.border} ${colors.bg} ${colors.hover} transition-all hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden`}
              >
                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent to-${module.color}-100/50 dark:to-${module.color}-900/10 opacity-0 group-hover:opacity-100 transition-opacity`} />
                
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border} group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.classes}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {module.count} items
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-2">
                      {module.title}
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {module.description}
                    </p>
                    <div className="space-y-1.5">
                      {module.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                          <div className={`w-1.5 h-1.5 rounded-full ${colors.icon.replace('text-', 'bg-')}`} />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400">Streamline your workflow</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              New Decision
            </button>
            <button className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reports
            </button>
            <button className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Roadmap
            </button>
            <button className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <ArrowRight className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: 'Architecture Decision', detail: 'Approved migration to microservices', time: '2 hours ago', status: 'approved' },
              { action: 'Security Review', detail: 'Updated security architecture principles', time: '5 hours ago', status: 'completed' },
              { action: 'Application Update', detail: 'Added 3 new applications to portfolio', time: '1 day ago', status: 'active' },
              { action: 'Compliance Audit', detail: 'Quarterly compliance review completed', time: '2 days ago', status: 'completed' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'approved' ? 'bg-green-500' :
                  activity.status === 'completed' ? 'bg-blue-500' :
                  'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{activity.action}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
