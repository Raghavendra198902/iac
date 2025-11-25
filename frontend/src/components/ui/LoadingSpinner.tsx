import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  variant?: 'spin' | 'pulse' | 'dots' | 'bars' | 'ring';
  color?: 'blue' | 'purple' | 'green';
}

export default function LoadingSpinner({ 
  size = 'md', 
  text,
  variant = 'spin',
  color = 'blue'
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colors = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
  };

  if (variant === 'dots') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex space-x-2">
          <div className={`h-3 w-3 bg-${color}-600 rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
          <div className={`h-3 w-3 bg-${color}-600 rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
          <div className={`h-3 w-3 bg-${color}-600 rounded-full animate-bounce`}></div>
        </div>
        {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    );
  }

  if (variant === 'bars') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="flex space-x-1">
          <div className={`w-1 h-8 bg-${color}-600 animate-pulse [animation-delay:-0.4s]`}></div>
          <div className={`w-1 h-8 bg-${color}-600 animate-pulse [animation-delay:-0.3s]`}></div>
          <div className={`w-1 h-8 bg-${color}-600 animate-pulse [animation-delay:-0.2s]`}></div>
          <div className={`w-1 h-8 bg-${color}-600 animate-pulse [animation-delay:-0.1s]`}></div>
          <div className={`w-1 h-8 bg-${color}-600 animate-pulse`}></div>
        </div>
        {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    );
  }

  if (variant === 'ring') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className={`${sizes[size]} rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-${color}-600 animate-spin`}></div>
        {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <div className={`${sizes[size]} rounded-full bg-${color}-600 animate-ping absolute`}></div>
          <div className={`${sizes[size]} rounded-full bg-${color}-600 relative`}></div>
        </div>
        {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizes[size]} animate-spin ${colors[color]}`} />
      {text && <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>}
    </div>
  );
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 animate-scaleIn">
        <LoadingSpinner size="lg" text={text} variant="spin" color="blue" />
      </div>
    </div>
  );
}
