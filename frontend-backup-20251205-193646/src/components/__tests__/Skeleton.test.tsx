import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Skeleton component
const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  className = '',
  variant = 'text',
  animation = 'pulse'
}: {
  width?: string;
  height?: string;
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | false;
}) => {
  return (
    <div
      className={`skeleton skeleton-${variant} ${animation ? `skeleton-${animation}` : ''} ${className}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

describe('Skeleton Component', () => {
  it('should render skeleton with default props', () => {
    render(<Skeleton />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Loading...');
  });

  it('should apply custom width', () => {
    render(<Skeleton width="200px" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('should apply custom height', () => {
    render(<Skeleton height="50px" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ height: '50px' });
  });

  it('should render text variant', () => {
    render(<Skeleton variant="text" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('skeleton-text');
  });

  it('should render circular variant', () => {
    render(<Skeleton variant="circular" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('skeleton-circular');
  });

  it('should render rectangular variant', () => {
    render(<Skeleton variant="rectangular" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('skeleton-rectangular');
  });

  it('should apply pulse animation', () => {
    render(<Skeleton animation="pulse" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('skeleton-pulse');
  });

  it('should apply wave animation', () => {
    render(<Skeleton animation="wave" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('skeleton-wave');
  });

  it('should render without animation', () => {
    render(<Skeleton animation={false} />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).not.toHaveClass('skeleton-pulse');
    expect(skeleton).not.toHaveClass('skeleton-wave');
  });

  it('should apply custom className', () => {
    render(<Skeleton className="custom-skeleton" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('should include screen reader text', () => {
    render(<Skeleton />);
    
    expect(screen.getByText('Loading...')).toHaveClass('sr-only');
  });

  it('should render multiple skeletons', () => {
    render(
      <>
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </>
    );
    
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  });

  it('should render skeleton for card', () => {
    render(
      <div className="card">
        <Skeleton variant="rectangular" height="200px" />
        <Skeleton width="60%" />
        <Skeleton width="80%" />
      </div>
    );
    
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(3);
  });

  it('should render skeleton for list', () => {
    render(
      <div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="list-item">
            <Skeleton variant="circular" width="40px" height="40px" />
            <Skeleton width="100%" />
          </div>
        ))}
      </div>
    );
    
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(10); // 5 items x 2 skeletons each
  });

  it('should render skeleton for table', () => {
    render(
      <table>
        <tbody>
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              <td><Skeleton width="100px" /></td>
              <td><Skeleton width="150px" /></td>
              <td><Skeleton width="200px" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
    
    const skeletons = screen.getAllByRole('status');
    expect(skeletons).toHaveLength(9); // 3 rows x 3 columns
  });

  it('should handle percentage-based dimensions', () => {
    render(<Skeleton width="50%" height="100%" />);
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ width: '50%', height: '100%' });
  });

  it('should combine all props correctly', () => {
    render(
      <Skeleton
        width="300px"
        height="100px"
        variant="rectangular"
        animation="wave"
        className="custom-class"
      />
    );
    
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveStyle({ width: '300px', height: '100px' });
    expect(skeleton).toHaveClass('skeleton-rectangular');
    expect(skeleton).toHaveClass('skeleton-wave');
    expect(skeleton).toHaveClass('custom-class');
  });
});
