import { cn } from '../../lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantStyles = {
  default: 'bg-blue-600 dark:bg-blue-500',
  success: 'bg-green-600 dark:bg-green-500',
  warning: 'bg-yellow-600 dark:bg-yellow-500',
  error: 'bg-red-600 dark:bg-red-500',
};

export default function Progress({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span className="text-gray-700 dark:text-gray-300">{label}</span>}
          {showLabel && (
            <span className="text-gray-500 dark:text-gray-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out rounded-full',
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// Multi-segment progress bar
interface ProgressSegment {
  value: number;
  color: string;
  label?: string;
}

interface SegmentedProgressProps {
  segments: ProgressSegment[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export function SegmentedProgress({
  segments,
  max = 100,
  size = 'md',
  showLabels = false,
  className,
}: SegmentedProgressProps) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  
  return (
    <div className={cn('w-full', className)}>
      {showLabels && (
        <div className="flex justify-between mb-2 text-xs">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-gray-700 dark:text-gray-300">
                {segment.label} ({Math.round((segment.value / max) * 100)}%)
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex',
          sizeStyles[size]
        )}
      >
        {segments.map((segment, i) => (
          <div
            key={i}
            className="h-full transition-all duration-300"
            style={{
              width: `${(segment.value / total) * 100}%`,
              backgroundColor: segment.color,
            }}
          />
        ))}
      </div>
    </div>
  );
}
