// Enhanced Onboarding Checklist - Guide Users Through Setup
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Circle, ChevronDown, ChevronRight, X, 
  Sparkles, Cloud, Shield, Code, PlayCircle, Trophy, ArrowRight
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  href?: string;
  completed: boolean;
  estimatedTime?: string;
}

export default function OnboardingChecklist() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 'connect-cloud',
      title: 'Connect Your Cloud Account',
      description: 'Link your AWS, Azure, or GCP account to start managing infrastructure',
      icon: Cloud,
      href: '/settings/cloud',
      completed: false,
      estimatedTime: '2 min',
    },
    {
      id: 'create-blueprint',
      title: 'Create Your First Blueprint',
      description: 'Use AI Designer or manual editor to design infrastructure',
      icon: Sparkles,
      href: '/designer',
      completed: false,
      estimatedTime: '5 min',
    },
    {
      id: 'setup-policies',
      title: 'Configure Security Policies',
      description: 'Set up guardrails and compliance rules for your infrastructure',
      icon: Shield,
      href: '/security/policies',
      completed: false,
      estimatedTime: '3 min',
    },
    {
      id: 'generate-iac',
      title: 'Generate IaC Code',
      description: 'Convert your blueprint to Terraform or CloudFormation',
      icon: Code,
      href: '/iac',
      completed: false,
      estimatedTime: '1 min',
    },
    {
      id: 'first-deployment',
      title: 'Deploy Your First Infrastructure',
      description: 'Deploy and monitor your infrastructure in real-time',
      icon: PlayCircle,
      href: '/deployments/new',
      completed: false,
      estimatedTime: '10 min',
    },
  ]);

  // Load completion status from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('onboardingChecklist');
    if (saved) {
      try {
        const savedItems = JSON.parse(saved);
        setItems(savedItems);
      } catch (e) {
        console.error('Failed to load checklist:', e);
      }
    }

    const dismissed = localStorage.getItem('onboardingChecklistDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  // Save completion status
  useEffect(() => {
    localStorage.setItem('onboardingChecklist', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;
  const isComplete = completedCount === items.length;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('onboardingChecklistDismissed', 'true');
  };

  if (isDismissed || isComplete) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 border-2 border-blue-200 dark:border-gray-700 shadow-lg"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}></div>
        </div>

        {/* Header */}
        <div className="relative z-10 p-5 border-b border-blue-200 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  🚀 Get Started with IAC Dharma
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Complete these steps to unlock the full power of the platform
                </p>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {completedCount} of {items.length} completed
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Checklist Items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <div className="p-5 space-y-3">
                {items.map((item, index) => {
                  const Icon = item.icon;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 ${
                        item.completed
                          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                          : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
                      }`}>
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleItem(item.id)}
                          className="flex-shrink-0 mt-0.5 hover:scale-110 transition-transform"
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          )}
                        </button>

                        {/* Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          item.completed
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            item.completed
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold mb-1 ${
                            item.completed
                              ? 'text-gray-500 dark:text-gray-400 line-through'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {item.description}
                          </p>
                          {item.estimatedTime && !item.completed && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                              ⏱️ {item.estimatedTime}
                            </span>
                          )}
                        </div>

                        {/* Action button */}
                        {!item.completed && item.href && (
                          <a
                            href={item.href}
                            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <span>Start</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-blue-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Complete all tasks</span> to unlock advanced features and best practices guide!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
