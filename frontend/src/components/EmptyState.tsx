// Enhanced Empty State Component - User-Friendly Onboarding
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, Sparkles, Plus, ArrowRight, 
  PlayCircle, BookOpen, HelpCircle
} from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: any;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  learnMoreHref?: string;
  illustration?: 'blueprints' | 'deployments' | 'projects' | 'generic';
}

const illustrations = {
  blueprints: (
    <svg className=\"w-48 h-48 mx-auto\" viewBox=\"0 0 200 200\" fill=\"none\">
      <circle cx=\"100\" cy=\"100\" r=\"80\" fill=\"currentColor\" className=\"text-blue-100 dark:text-blue-900/20\" />
      <rect x=\"60\" y=\"60\" width=\"80\" height=\"60\" rx=\"8\" fill=\"currentColor\" className=\"text-blue-500 dark:text-blue-400\" opacity=\"0.2\" />
      <rect x=\"70\" y=\"70\" width=\"60\" height=\"40\" rx=\"4\" fill=\"currentColor\" className=\"text-blue-600 dark:text-blue-500\" />
      <circle cx=\"100\" cy=\"90\" r=\"15\" fill=\"currentColor\" className=\"text-white dark:text-gray-900\" />
      <path d=\"M95 85 L97 90 L102 88\" stroke=\"currentColor\" strokeWidth=\"2\" strokeLinecap=\"round\" strokeLinejoin=\"round\" className=\"text-blue-600 dark:text-blue-400\" />
    </svg>
  ),
  deployments: (
    <svg className=\"w-48 h-48 mx-auto\" viewBox=\"0 0 200 200\" fill=\"none\">
      <circle cx=\"100\" cy=\"100\" r=\"80\" fill=\"currentColor\" className=\"text-green-100 dark:text-green-900/20\" />
      <path d=\"M60 120 L100 80 L140 120\" stroke=\"currentColor\" strokeWidth=\"8\" strokeLinecap=\"round\" strokeLinejoin=\"round\" className=\"text-green-500 dark:text-green-400\" />
      <circle cx=\"100\" cy=\"80\" r=\"12\" fill=\"currentColor\" className=\"text-green-600 dark:text-green-500\" />
    </svg>
  ),
  projects: (
    <svg className=\"w-48 h-48 mx-auto\" viewBox=\"0 0 200 200\" fill=\"none\">
      <circle cx=\"100\" cy=\"100\" r=\"80\" fill=\"currentColor\" className=\"text-purple-100 dark:text-purple-900/20\" />
      <rect x=\"70\" y=\"70\" width=\"30\" height=\"60\" rx=\"4\" fill=\"currentColor\" className=\"text-purple-500 dark:text-purple-400\" />
      <rect x=\"110\" y=\"85\" width=\"30\" height=\"45\" rx=\"4\" fill=\"currentColor\" className=\"text-purple-600 dark:text-purple-500\" />
      <rect x=\"80\" y=\"50\" width=\"50\" height=\"15\" rx=\"4\" fill=\"currentColor\" className=\"text-purple-700 dark:text-purple-600\" />
    </svg>
  ),
  generic: (
    <svg className=\"w-48 h-48 mx-auto\" viewBox=\"0 0 200 200\" fill=\"none\">
      <circle cx=\"100\" cy=\"100\" r=\"80\" fill=\"currentColor\" className=\"text-gray-100 dark:text-gray-800\" />
      <path d=\"M100 60 L100 140 M60 100 L140 100\" stroke=\"currentColor\" strokeWidth=\"8\" strokeLinecap=\"round\" className=\"text-gray-400 dark:text-gray-600\" />
    </svg>
  ),
};

export default function EmptyState({
  title,
  description,
  icon: Icon = FileText,
  actionLabel = 'Get Started',
  actionHref = '#',
  secondaryActionLabel,
  secondaryActionHref,
  learnMoreHref,
  illustration = 'generic',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=\"flex flex-col items-center justify-center py-16 px-4 text-center\"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className=\"mb-8\"
      >
        {illustrations[illustration]}
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className=\"w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg\"
      >
        <Icon className=\"w-8 h-8 text-white\" />
      </motion.div>

      {/* Title */}
      <h3 className=\"text-2xl font-bold text-gray-900 dark:text-white mb-3\">
        {title}
      </h3>

      {/* Description */}
      <p className=\"text-base text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed\">
        {description}
      </p>

      {/* Actions */}
      <div className=\"flex flex-col sm:flex-row items-center gap-3 mb-6\">
        <Link
          to={actionHref}
          className=\"group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200\"
        >
          <Plus className=\"w-5 h-5\" />
          <span>{actionLabel}</span>
          <ArrowRight className=\"w-4 h-4 group-hover:translate-x-1 transition-transform\" />
        </Link>

        {secondaryActionLabel && secondaryActionHref && (
          <Link
            to={secondaryActionHref}
            className=\"group flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-xl font-semibold hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-200\"
          >
            <PlayCircle className=\"w-5 h-5\" />
            <span>{secondaryActionLabel}</span>
          </Link>
        )}
      </div>

      {/* Learn More */}
      {learnMoreHref && (
        <div className=\"flex items-center gap-6 text-sm\">
          <Link
            to={learnMoreHref}
            className=\"flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors\"
          >
            <BookOpen className=\"w-4 h-4\" />
            <span>Read Documentation</span>
          </Link>
          <Link
            to=\"/help\"
            className=\"flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors\"
          >
            <HelpCircle className=\"w-4 h-4\" />
            <span>Get Help</span>
          </Link>
        </div>
      )}

      {/* Quick Tips */}
      <div className=\"mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 max-w-lg\">
        <div className=\"flex items-start gap-3\">
          <Sparkles className=\"w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5\" />
          <div className=\"text-left\">
            <p className=\"text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1\">
              Pro Tip: Use AI Designer
            </p>
            <p className=\"text-xs text-blue-700 dark:text-blue-300\">
              Save time by describing your infrastructure needs in plain English. Our AI will generate everything automatically!
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
