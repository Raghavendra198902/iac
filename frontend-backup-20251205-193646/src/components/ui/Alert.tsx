import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, { container: string; icon: string; Icon: typeof Info }> = {
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    Icon: Info,
  },
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    Icon: CheckCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    Icon: AlertCircle,
  },
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    Icon: XCircle,
  },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  icon,
  dismissible = false,
  onDismiss,
  className,
}: AlertProps) {
  const styles = variantStyles[variant];
  const IconComponent = styles.Icon;

  return (
    <div
      className={cn(
        'relative flex gap-3 p-4 rounded-lg border',
        styles.container,
        className
      )}
      role="alert"
    >
      <div className={cn('flex-shrink-0', styles.icon)}>
        {icon || <IconComponent className="w-5 h-5" />}
      </div>
      
      <div className="flex-1">
        {title && (
          <h5 className={cn('font-semibold mb-1', styles.icon)}>
            {title}
          </h5>
        )}
        <div className={cn('text-sm', styles.icon)}>
          {children}
        </div>
      </div>

      {dismissible && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors',
            styles.icon
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
