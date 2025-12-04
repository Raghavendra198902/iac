// Enhanced Contextual Help System - Smart Tooltips and Inline Guidance
import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, Lightbulb, BookOpen, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: string;
  title?: string;
  learnMoreUrl?: string;
  type?: 'info' | 'tip' | 'warning' | 'help';
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
}

export function ContextualTooltip({
  content,
  title,
  learnMoreUrl,
  type = 'info',
  position = 'top',
  children,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const icons = {
    info: Info,
    tip: Lightbulb,
    warning: HelpCircle,
    help: BookOpen,
  };

  const colors = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-600 dark:text-blue-400',
      title: 'text-blue-900 dark:text-blue-100',
    },
    tip: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-600 dark:text-yellow-400',
      title: 'text-yellow-900 dark:text-yellow-100',
    },
    warning: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'text-orange-600 dark:text-orange-400',
      title: 'text-orange-900 dark:text-orange-100',
    },
    help: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'text-purple-600 dark:text-purple-400',
      title: 'text-purple-900 dark:text-purple-100',
    },
  };

  const Icon = icons[type];
  const colorClasses = colors[type];

  return (
    <div
      ref={triggerRef}
      className=\"relative inline-block\"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: position === 'top' ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${
              position === 'top' ? 'bottom-full mb-2' :
              position === 'bottom' ? 'top-full mt-2' :
              position === 'left' ? 'right-full mr-2' :
              'left-full ml-2'
            } ${position === 'left' || position === 'right' ? 'top-1/2 -translate-y-1/2' : 'left-1/2 -translate-x-1/2'}`}
          >
            <div className={`w-80 p-4 rounded-xl shadow-xl border-2 ${colorClasses.bg} ${colorClasses.border}`}>
              <div className=\"flex items-start gap-3\">
                <Icon className={`w-5 h-5 ${colorClasses.icon} flex-shrink-0 mt-0.5`} />
                <div className=\"flex-1 min-w-0\">
                  {title && (
                    <h4 className={`text-sm font-semibold ${colorClasses.title} mb-1`}>
                      {title}
                    </h4>
                  )}
                  <p className=\"text-sm text-gray-700 dark:text-gray-300 leading-relaxed\">
                    {content}
                  </p>
                  {learnMoreUrl && (
                    <a
                      href={learnMoreUrl}
                      target=\"_blank\"
                      rel=\"noopener noreferrer\"
                      className=\"inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors\"
                    >
                      <span>Learn more</span>
                      <ExternalLink className=\"w-3 h-3\" />
                    </a>
                  )}
                </div>
              </div>
              
              {/* Arrow */}
              <div className={`absolute ${
                position === 'top' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
                position === 'bottom' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                position === 'left' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2' :
                'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'
              } w-3 h-3 rotate-45 ${colorClasses.bg} ${colorClasses.border} ${
                position === 'top' ? 'border-t-0 border-l-0' :
                position === 'bottom' ? 'border-b-0 border-r-0' :
                position === 'left' ? 'border-l-0 border-b-0' :
                'border-r-0 border-t-0'
              }`}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline help button component
interface HelpButtonProps {
  helpText: string;
  helpTitle?: string;
  learnMoreUrl?: string;
  type?: 'info' | 'tip' | 'warning' | 'help';
}

export function InlineHelpButton({ helpText, helpTitle, learnMoreUrl, type = 'info' }: HelpButtonProps) {
  return (
    <ContextualTooltip
      content={helpText}
      title={helpTitle}
      learnMoreUrl={learnMoreUrl}
      type={type}
      position=\"top\"
    >
      <button className=\"inline-flex items-center justify-center w-5 h-5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors\">
        <HelpCircle className=\"w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors\" />
      </button>
    </ContextualTooltip>
  );
}

// Feature highlight callout
interface FeatureCalloutProps {
  title: string;
  description: string;
  learnMoreUrl?: string;
  onDismiss?: () => void;
  variant?: 'info' | 'success' | 'warning';
}

export function FeatureCallout({
  title,
  description,
  learnMoreUrl,
  onDismiss,
  variant = 'info',
}: FeatureCalloutProps) {
  const variants = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-900 dark:text-blue-100',
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: Lightbulb,
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-900 dark:text-green-100',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: HelpCircle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-yellow-900 dark:text-yellow-100',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`relative p-4 rounded-xl border-2 ${config.bg} ${config.border}`}
    >
      <div className=\"flex items-start gap-3\">
        <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className=\"flex-1 min-w-0\">
          <h4 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
            {title}
          </h4>
          <p className=\"text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2\">
            {description}
          </p>
          {learnMoreUrl && (
            <a
              href={learnMoreUrl}
              target=\"_blank\"
              rel=\"noopener noreferrer\"
              className=\"inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors\"
            >
              <span>Learn more</span>
              <ExternalLink className=\"w-3 h-3\" />
            </a>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className=\"p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors\"
          >
            <X className=\"w-4 h-4 text-gray-500 dark:text-gray-400\" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

// Keyboard shortcut hint
interface KeyboardHintProps {
  keys: string[];
  description: string;
}

export function KeyboardHint({ keys, description }: KeyboardHintProps) {
  return (
    <div className=\"flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400\">
      <span>{description}:</span>
      <div className=\"flex items-center gap-1\">
        {keys.map((key, index) => (
          <span key={index}>
            <kbd className=\"px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-mono text-xs\">
              {key}
            </kbd>
            {index < keys.length - 1 && <span className=\"mx-1\">+</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
