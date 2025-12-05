import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Card component
const Card = ({
  children,
  className = '',
  padding = 'md',
  shadow = true,
}: {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: boolean;
}) => {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-lg ${shadow ? 'shadow-md' : ''} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

describe('Card Component', () => {
  it('should render children', () => {
    render(
      <Card>
        <div>Card Content</div>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should apply default padding', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('.p-6');
    expect(card).toBeInTheDocument();
  });

  it('should apply small padding', () => {
    const { container } = render(<Card padding="sm">Content</Card>);
    const card = container.querySelector('.p-3');
    expect(card).toBeInTheDocument();
  });

  it('should apply large padding', () => {
    const { container } = render(<Card padding="lg">Content</Card>);
    const card = container.querySelector('.p-8');
    expect(card).toBeInTheDocument();
  });

  it('should have shadow by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('.shadow-md');
    expect(card).toBeInTheDocument();
  });

  it('should not have shadow when disabled', () => {
    const { container } = render(<Card shadow={false}>Content</Card>);
    const card = container.querySelector('.shadow-md');
    expect(card).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-card">Content</Card>);
    const card = container.querySelector('.custom-card');
    expect(card).toBeInTheDocument();
  });

  it('should have rounded corners', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('.rounded-lg');
    expect(card).toBeInTheDocument();
  });

  it('should have white background', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector('.bg-white');
    expect(card).toBeInTheDocument();
  });
});

// Mock Badge component
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

describe('Badge Component', () => {
  it('should render text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should render default variant', () => {
    const { container } = render(<Badge variant="default">Default</Badge>);
    const badge = container.querySelector('.bg-gray-100');
    expect(badge).toBeInTheDocument();
  });

  it('should render success variant', () => {
    const { container } = render(<Badge variant="success">Success</Badge>);
    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });

  it('should render warning variant', () => {
    const { container } = render(<Badge variant="warning">Warning</Badge>);
    const badge = container.querySelector('.bg-yellow-100');
    expect(badge).toBeInTheDocument();
  });

  it('should render danger variant', () => {
    const { container } = render(<Badge variant="danger">Danger</Badge>);
    const badge = container.querySelector('.bg-red-100');
    expect(badge).toBeInTheDocument();
  });

  it('should render info variant', () => {
    const { container } = render(<Badge variant="info">Info</Badge>);
    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
  });

  it('should render small size', () => {
    const { container } = render(<Badge size="sm">Small</Badge>);
    const badge = container.querySelector('.text-xs');
    expect(badge).toBeInTheDocument();
  });

  it('should render medium size', () => {
    const { container } = render(<Badge size="md">Medium</Badge>);
    const badge = container.querySelector('.text-sm');
    expect(badge).toBeInTheDocument();
  });

  it('should render large size', () => {
    const { container } = render(<Badge size="lg">Large</Badge>);
    const badge = container.querySelector('.text-base');
    expect(badge).toBeInTheDocument();
  });

  it('should have rounded shape', () => {
    const { container } = render(<Badge>Badge</Badge>);
    const badge = container.querySelector('.rounded-full');
    expect(badge).toBeInTheDocument();
  });

  it('should render as span', () => {
    render(<Badge>Span</Badge>);
    const badge = screen.getByText('Span');
    expect(badge.tagName).toBe('SPAN');
  });
});

// Mock Progress component
const Progress = ({
  value,
  max = 100,
  color = 'blue',
  showLabel = false,
}: {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  showLabel?: boolean;
}) => {
  const percentage = (value / max) * 100;
  
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
  };

  return (
    <div className="w-full">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${colors[color]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
      {showLabel && <span className="text-sm text-gray-600 mt-1">{percentage.toFixed(0)}%</span>}
    </div>
  );
};

describe('Progress Component', () => {
  it('should render with value', () => {
    const { container } = render(<Progress value={50} />);
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toBeInTheDocument();
  });

  it('should set correct width percentage', () => {
    const { container } = render(<Progress value={75} />);
    const progress = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(progress?.style.width).toBe('75%');
  });

  it('should handle custom max value', () => {
    const { container } = render(<Progress value={50} max={200} />);
    const progress = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(progress?.style.width).toBe('25%');
  });

  it('should apply blue color', () => {
    const { container } = render(<Progress value={50} color="blue" />);
    const progress = container.querySelector('.bg-blue-600');
    expect(progress).toBeInTheDocument();
  });

  it('should apply green color', () => {
    const { container } = render(<Progress value={50} color="green" />);
    const progress = container.querySelector('.bg-green-600');
    expect(progress).toBeInTheDocument();
  });

  it('should show label when enabled', () => {
    render(<Progress value={75} showLabel={true} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should not show label by default', () => {
    render(<Progress value={75} />);
    expect(screen.queryByText('75%')).not.toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    const { container } = render(<Progress value={60} max={100} />);
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toHaveAttribute('aria-valuenow', '60');
    expect(progress).toHaveAttribute('aria-valuemin', '0');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });
});
