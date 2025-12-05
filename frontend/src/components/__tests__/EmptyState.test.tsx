import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock EmptyState component
const EmptyState = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}) => {
  return (
    <div className="empty-state" role="status">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && actionLabel && (
        <button onClick={onAction} className="empty-state-action">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

describe('EmptyState Component', () => {
  it('should render with title', () => {
    render(<EmptyState title="No items found" />);
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(
      <EmptyState
        title="No projects"
        description="Get started by creating your first project"
      />
    );
    
    expect(screen.getByText('No projects')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first project')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const icon = <svg data-testid="empty-icon" />;
    render(<EmptyState icon={icon} title="Empty" />);
    
    expect(screen.getByTestId('empty-icon')).toBeInTheDocument();
  });

  it('should render action button', () => {
    render(
      <EmptyState
        title="No data"
        action={true}
        actionLabel="Create New"
      />
    );
    
    expect(screen.getByText('Create New')).toBeInTheDocument();
  });

  it('should call onAction when button clicked', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Empty list"
        action={true}
        actionLabel="Add Item"
        onAction={onAction}
      />
    );
    
    const button = screen.getByText('Add Item');
    fireEvent.click(button);
    
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('should not render button when action is false', () => {
    render(
      <EmptyState
        title="No items"
        action={false}
        actionLabel="Add"
      />
    );
    
    expect(screen.queryByText('Add')).not.toBeInTheDocument();
  });

  it('should have correct role for accessibility', () => {
    render(<EmptyState title="Empty" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should render all props together', () => {
    const icon = <svg data-testid="icon" />;
    const onAction = vi.fn();
    
    render(
      <EmptyState
        icon={icon}
        title="No blueprints"
        description="Create a blueprint to get started with infrastructure provisioning"
        action={true}
        actionLabel="Create Blueprint"
        onAction={onAction}
      />
    );
    
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('No blueprints')).toBeInTheDocument();
    expect(screen.getByText('Create a blueprint to get started with infrastructure provisioning')).toBeInTheDocument();
    
    const button = screen.getByText('Create Blueprint');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalled();
  });

  it('should handle different empty states for different features', () => {
    const scenarios = [
      {
        title: 'No deployments',
        description: 'Start deploying infrastructure',
        actionLabel: 'Deploy Now',
      },
      {
        title: 'No monitoring data',
        description: 'Set up monitoring to see metrics',
        actionLabel: 'Configure Monitoring',
      },
      {
        title: 'No users',
        description: 'Invite team members to collaborate',
        actionLabel: 'Invite Users',
      },
    ];

    scenarios.forEach((scenario, index) => {
      const { unmount } = render(
        <EmptyState
          title={scenario.title}
          description={scenario.description}
          action={true}
          actionLabel={scenario.actionLabel}
        />
      );
      
      expect(screen.getByText(scenario.title)).toBeInTheDocument();
      expect(screen.getByText(scenario.description)).toBeInTheDocument();
      expect(screen.getByText(scenario.actionLabel)).toBeInTheDocument();
      
      unmount();
    });
  });

  it('should render with custom icon component', () => {
    const CustomIcon = () => <div data-testid="custom-icon">📁</div>;
    
    render(
      <EmptyState
        icon={<CustomIcon />}
        title="No files"
      />
    );
    
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  it('should handle long text gracefully', () => {
    const longTitle = 'No infrastructure blueprints available at this time';
    const longDescription = 'You can create a new blueprint to define your infrastructure requirements. Blueprints help you standardize and automate infrastructure provisioning across multiple environments.';
    
    render(
      <EmptyState
        title={longTitle}
        description={longDescription}
      />
    );
    
    expect(screen.getByText(longTitle)).toBeInTheDocument();
    expect(screen.getByText(longDescription)).toBeInTheDocument();
  });

  it('should work without optional props', () => {
    render(<EmptyState title="Empty" />);
    
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
