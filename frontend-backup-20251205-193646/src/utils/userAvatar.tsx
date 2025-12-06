/**
 * Generate user initials from full name or email
 */
export const getUserInitials = (name: string | undefined | null): string => {
  if (!name) return '?';
  
  const trimmed = name.trim();
  
  // If it's an email, use first letter of username
  if (trimmed.includes('@')) {
    return trimmed.charAt(0).toUpperCase();
  }
  
  // Split name into parts
  const parts = trimmed.split(/\s+/);
  
  if (parts.length === 1) {
    // Single name - use first 2 characters
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple names - use first letter of first and last name
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate a consistent color for a user based on their name
 */
export const getUserColor = (name: string | undefined | null): string => {
  if (!name) return 'bg-gray-500';
  
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
  ];
  
  // Generate a hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use hash to pick a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

interface UserAvatarProps {
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * User avatar component that displays initials with a colored background
 */
export function UserAvatar({ name, size = 'md', className = '' }: UserAvatarProps) {
  const initials = getUserInitials(name);
  const colorClass = getUserColor(name);
  
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };
  
  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-bold ${className}`}
      title={name || 'Unknown User'}
    >
      {initials}
    </div>
  );
}
