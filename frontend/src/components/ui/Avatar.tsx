import { cn } from '../../lib/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

export default function Avatar({ 
  src, 
  alt = 'Avatar', 
  fallback,
  size = 'md',
  className 
}: AvatarProps) {
  const initials = fallback?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-gradient-to-br from-blue-500 to-purple-600',
        'text-white font-semibold',
        sizeStyles[size],
        className
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User className="w-1/2 h-1/2" />
      )}
    </div>
  );
}
