import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../../components/layout';
import {
  Target,
  Briefcase,
  FileCheck,
  Package,
  Lightbulb,
  Shield,
  Database,
  GitBranch,
  Cloud,
  Users,
  BookOpen,
  Activity,
  FolderKanban,
  FileText,
  GraduationCap,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

export default function EAResponsibilitiesIndex() {
  const responsibilities = [
    {
      id: 1,
      title: 'Architecture Strategy & Governance',
      description: 'Define enterprise architecture strategy, principles, ARB, and governance frameworks',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      path: '/ea/responsibilities/strategy-governance',
      keyPoints: ['EA Strategy', 'Architecture Principles', 'ARB Process', 'Governance'],
      status: 'active',
    },
    {
      id: 2,
      title: 'Business & IT Alignment',
      description: 'Translate business capabilities into technology roadmaps and value realization',
      icon: Briefcase,
      color: 'from-purple-500 to-pink-500',
      path: '/ea/responsibilities/business-it-alignment',
      keyPoints: ['Capability Maps', 'Value Streams', 'Gap Analysis', 'Investment Planning'],
      status: 'active',
    },
    {
      id: 3,
      title: 'Solution Architecture Oversight',
      description: 'Review and approve HLD/LLD, ensure consistency across all architecture domains',
      icon: FileCheck,
      color: 'from-green-500 to-emerald-500',
      path: '/ea/responsibilities/solution-oversight',
      keyPoints: ['HLD/LLD Review', 'Design Validation', 'Cross-team Dependencies'],
      status: 'active',
    },
    {
      id: 4,
      title: 'Application Portfolio Rationalization',
      description: 'Manage application inventory, identify redundancies, drive consolidation strategies',
      icon: Package,
      color: 'from-orange-500 to-red-500',
      path: '/ea/responsibilities/portfolio-rationalization',
      keyPoints: ['Portfolio Inventory', 'TCO/ROI', 'App Retirement', 'Consolidation'],
      status: 'active',
    },
    {
      id: 5,
      title: 'Innovation & Emerging Technologies',
      description: 'Assess AI/ML, Zero-Trust, Cloud-native, DevSecOps, and conduct POCs',
      icon: Lightbulb,
      color: 'from-yellow-500 to-orange-500',
      path: '/ea/responsibilities/innovation-emerging-tech',
      keyPoints: ['Tech Trends', 'POCs', 'Innovation Backlog', 'Tech Radar'],
      status: 'planning',
    },
    {
      id: 6,
      title: 'Security, Compliance & Risk',
      description: 'Define security frameworks, ensure compliance (GDPR, HIPAA, SOC2, ISO 27001)',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      path: '/ea/responsibilities/security-compliance',
      keyPoints: ['Security Framework', 'Compliance', 'Risk Assessment', 'Threat Models'],
      status: 'active',
    },
    {
      id: 7,
      title: 'Data Architecture & Strategy',
      description: 'Define data models, MDM, data governance, lineage, and data security controls',
      icon: Database,
      color: 'from-cyan-500 to-blue-500',
      path: '/ea/responsibilities/data-architecture',
      keyPoints: ['Data Models', 'MDM', 'Data Governance', 'Data Lakes/Warehouses'],
      status: 'active',
    },
    {
      id: 8,
      title: 'Integration, API & Interoperability',
      description: 'Define API-first strategy, ESB, event-driven architecture, and microservices',
      icon: GitBranch,
      color: 'from-indigo-500 to-purple-500',
      path: '/ea/responsibilities/integration-api',
      keyPoints: ['API Strategy', 'ESB', 'Event-Driven', 'OAuth2/IAM'],
      status: 'active',
    },
    {
      id: 9,
      title: 'Cloud, Infrastructure & Platform',
      description: 'Define cloud strategy, landing zones, HA/DR, observability, and Kubernetes',
      icon: Cloud,
      color: 'from-blue-500 to-indigo-500',
      path: '/ea/responsibilities/cloud-infrastructure',
      keyPoints: ['Cloud Strategy', 'Landing Zones', 'HA/DR', 'K8s/Containers'],
      status: 'active',
    },
    {
      id: 10,
      title: 'Stakeholder Management',
      description: 'Engage with business, product, security, DevOps leaders and conduct workshops',
      icon: Users,
      color: 'from-pink-500 to-rose-500',
      path: '/ea/responsibilities/stakeholder-management',
      keyPoints: ['Stakeholder Engagement', 'Technical Reviews', 'Conflict Resolution'],
      status: 'active',
    },
    {
      id: 11,
      title: 'Standards, Templates & Best Practices',
      description: 'Maintain architecture repository, templates for HLD/LLD, and tech standards',
      icon: BookOpen,
      color: 'from-teal-500 to-cyan-500',
      path: '/ea/responsibilities/standards-templates',
      keyPoints: ['Architecture Repository', 'HLD/LLD Templates', 'Tech Stack Standards'],
      status: 'active',
    },
    {
      id: 12,
      title: 'Lifecycle & Continuous Improvement',
      description: 'Monitor architecture KPIs, technical debt, cost efficiency, and refactoring',
      icon: Activity,
      color: 'from-green-500 to-teal-500',
      path: '/ea/responsibilities/lifecycle-improvement',
      keyPoints: ['Architecture KPIs', 'Technical Debt', 'Cost Optimization', 'Refactoring'],
      status: 'active',
    },
    {
      id: 13,
      title: 'Program, Portfolio & Delivery',
      description: 'Support large programs, provide risk logs, vendor evaluations, and PMO support',
      icon: FolderKanban,
      color: 'from-violet-500 to-purple-500',
      path: '/ea/responsibilities/program-delivery',
      keyPoints: ['Program Support', 'Risk Logs', 'Vendor Evaluation', 'PMO Collaboration'],
      status: 'active',
    },
    {
      id: 14,
      title: 'Documentation & Communication',
      description: 'Create enterprise blueprints, capability maps, ADR logs, and executive presentations',
      icon: FileText,
      color: 'from-amber-500 to-orange-500',
      path: '/ea/responsibilities/documentation-communication',
      keyPoints: ['Blueprints', 'Roadmaps', 'ADR Logs', 'Executive Presentations'],
      status: 'active',
    },
    {
      id: 15,
      title: 'People Leadership & Knowledge',
      description: 'Mentor architects, conduct training, promote innovation and engineering excellence',
      icon: GraduationCap,
      color: 'from-blue-500 to-purple-500',
      path: '/ea/responsibilities/people-leadership',
      keyPoints: ['Mentorship', 'Training', 'Innovation Culture', 'Engineering Excellence'],
      status: 'active',
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-indigo-950/20 dark:to-purple-950/20">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400/20 to-pink-600/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 p-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-white/50 dark:border-gray-700/50 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90"></div>
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"
              style={{ backgroundSize: '200% 200%' }}
            />

            <div className="relative z-10 p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.2 }}
                  transition={{ duration: 0.6 }}
                  className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg"
                >
                  <Sparkles className="w-10 h-10" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">Enterprise Architect Responsibilities</h1>
                  <p className="text-white/90 text-lg">
                    Comprehensive guide to EA roles, duties, and strategic impact areas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/80">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  15 Key Responsibility Areas
                </span>
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Strategic & Tactical Guidance
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Areas', value: '15', icon: Target, color: 'blue' },
              { label: 'Active Initiatives', value: '47', icon: Activity, color: 'green' },
              { label: 'Documentation', value: '243', icon: FileText, color: 'purple' },
              { label: 'Stakeholders', value: '89', icon: Users, color: 'indigo' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {stat.value}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Responsibilities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {responsibilities.map((resp, idx) => (
              <motion.div
                key={resp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group"
              >
                <Link
                  to={resp.path}
                  className="block h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${resp.color} shadow-lg group-hover:scale-110 transition-transform`}>
                      <resp.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                      #{resp.id}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all">
                    {resp.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {resp.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {resp.keyPoints.map((point, pointIdx) => (
                      <span
                        key={pointIdx}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700/50 text-xs text-gray-700 dark:text-gray-300 rounded-lg font-medium"
                      >
                        {point}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-1 ${
                      resp.status === 'active' ? 'text-green-600' : 'text-blue-600'
                    } font-semibold`}>
                      <CheckCircle className="w-4 h-4" />
                      {resp.status === 'active' ? 'Active' : 'Planning'}
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 group-hover:gap-2 transition-all font-semibold">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
