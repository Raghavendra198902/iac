import React from 'react';
import { cn } from '../../lib/utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'gray' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pill?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  gray: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-0.5',
  lg: 'text-base px-3 py-1',
};

export default function Badge({ 
  children, 
  variant = 'default', 
  size = 'md',
  className,
  pill = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        pill ? 'rounded-full' : 'rounded',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
