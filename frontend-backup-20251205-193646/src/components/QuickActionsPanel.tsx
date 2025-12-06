// Enhanced Quick Actions Panel - User-Friendly with Visual Guidance
import { Link } from 'react-router-dom';
import { 
  Sparkles, Code, Monitor, Shield, GitBranch, 
  FileText, Database, Cloud, Zap, TrendingUp,
  ArrowRight, Plus, Play, Settings
} from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  gradient: string;
  badge?: string;
  popular?: boolean;
}

const quickActions: QuickAction[] = [
  {
    id: 'ai-designer',
    title: 'AI Designer',
    description: 'Generate infrastructure with AI in seconds',
    icon: Sparkles,
    href: '/designer',
    color: 'blue',
    gradient: 'from-blue-500 to-indigo-600',
    badge: 'Popular',
    popular: true,
  },
  {
    id: 'create-blueprint',
    title: 'Create Blueprint',
    description: 'Design infrastructure manually',
    icon: FileText,
    href: '/blueprints/new',
    color: 'purple',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'iac-generator',
    title: 'Generate IaC',
    description: 'Convert designs to Terraform/CloudFormation',
    icon: Code,
    href: '/iac',
    color: 'green',
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'deploy',
    title: 'Deploy',
    description: 'Deploy infrastructure to cloud',
    icon: Play,
    href: '/deployments/new',
    color: 'orange',
    gradient: 'from-orange-500 to-red-600',
  },
  {
    id: 'monitor',
    title: 'Monitor',
    description: 'View system health and metrics',
    icon: Monitor,
    href: '/monitoring',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'security-scan',
    title: 'Security Scan',
    description: 'Run compliance and security checks',
    icon: Shield,
    href: '/security/scan',
    color: 'red',
    gradient: 'from-red-500 to-pink-600',
  },
  {
    id: 'cost-analysis',
    title: 'Cost Analysis',
    description: 'Optimize cloud spending',
    icon: TrendingUp,
    href: '/cost/analysis',
    color: 'yellow',
    gradient: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'connect-cloud',
    title: 'Connect Cloud',
    description: 'Add AWS, Azure, or GCP account',
    icon: Cloud,
    href: '/settings/cloud',
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-600',
  },
];

export default function QuickActionsPanel() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">Get started with common tasks</p>
        </div>
        <Link
          to="/help"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          <span>Need help?</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                to={action.href}
                className="group relative block p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Popular badge */}
                {action.popular && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-bold animate-pulse">
                    ⭐ {action.badge}
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {action.description}
                  </p>

                  {/* Arrow indicator */}
                  <div className="flex items-center gap-2 mt-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <span className="text-xs font-medium">Get started</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Help Text */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Pro Tip: Start with the AI Designer for the fastest way to create infrastructure
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
            Simply describe what you need, and our AI will generate a complete architecture in seconds.
          </p>
        </div>
      </div>
    </div>
  );
}
