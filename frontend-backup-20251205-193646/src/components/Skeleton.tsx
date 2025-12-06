import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClass = animation === 'pulse' ? 'animate-pulse' : 'animate-shimmer';
  
  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  const style: React.CSSProperties = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%')
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClass} ${className}`}
      style={style}
    />
  );
};

export default Skeleton;

// Preset skeleton components for common use cases
export const CardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton variant="text" width="60%" className="mb-2" />
        <Skeleton variant="text" width="40%" />
      </div>
      <Skeleton variant="circular" width={40} height={40} />
    </div>
    <div className="space-y-3">
      <Skeleton variant="rectangular" height={100} />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" height={32} className="flex-1" />
        <Skeleton variant="rectangular" height={32} className="flex-1" />
      </div>
    </div>
  </div>
);

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <Skeleton variant="text" width="30%" />
    </div>
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      ))}
    </div>
  </div>
);

export const ChartSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="mb-4">
      <Skeleton variant="text" width="40%" className="mb-2" />
      <Skeleton variant="text" width="25%" />
    </div>
    <Skeleton variant="rectangular" height={300} />
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-6">
        <Skeleton variant="text" width="30%" height={32} className="mb-2" />
        <Skeleton variant="text" width="50%" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <Skeleton variant="text" width="60%" className="mb-2" />
            <Skeleton variant="text" width="40%" height={32} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  </div>
);
