import { motion } from 'framer-motion';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export default function Skeleton({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  rounded = 'md' 
}: SkeletonProps) {
  const roundedClasses = {
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  };

  return (
    <motion.div
      className={`bg-gray-200 ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton width="48px" height="48px" rounded="lg" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height="20px" />
          <Skeleton width="40%" height="16px" />
        </div>
      </div>
      <Skeleton width="100%" height="100px" />
      <div className="flex gap-2">
        <Skeleton width="80px" height="32px" rounded="full" />
        <Skeleton width="80px" height="32px" rounded="full" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
          <Skeleton width="48px" height="48px" rounded="lg" />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height="18px" />
            <Skeleton width="50%" height="14px" />
          </div>
          <Skeleton width="80px" height="28px" rounded="full" />
        </div>
      ))}
    </div>
  );
}
