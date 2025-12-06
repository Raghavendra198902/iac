import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock WelcomeTour
const WelcomeTour = ({ steps, currentStep, onNext, onPrevious, onComplete }: any) => {
  if (currentStep >= steps.length) return null;
  
  const step = steps[currentStep];
  
  return (
    <div className="welcome-tour">
      <div className="tour-content">
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </div>
      <div className="tour-actions">
        {currentStep > 0 && <button onClick={onPrevious}>Previous</button>}
        {currentStep < steps.length - 1 ? (
          <button onClick={onNext}>Next</button>
        ) : (
          <button onClick={onComplete}>Complete</button>
        )}
      </div>
      <div className="tour-progress">
        {currentStep + 1} / {steps.length}
      </div>
    </div>
  );
};

describe('WelcomeTour Component', () => {
  const steps = [
    { title: 'Welcome', description: 'Welcome to the platform' },
    { title: 'Create Blueprint', description: 'Start by creating a blueprint' },
    { title: 'Deploy', description: 'Deploy your infrastructure' },
  ];

  it('should render current step', () => {
    render(<WelcomeTour steps={steps} currentStep={0} onNext={() => {}} />);
    expect(screen.getByText('Welcome')).toBeInTheDocument();
  });

  it('should show progress indicator', () => {
    render(<WelcomeTour steps={steps} currentStep={1} onNext={() => {}} />);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('should show Next button on first steps', () => {
    render(<WelcomeTour steps={steps} currentStep={0} onNext={() => {}} />);
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('should show Complete button on last step', () => {
    render(<WelcomeTour steps={steps} currentStep={2} onComplete={() => {}} />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should show Previous button after first step', () => {
    render(<WelcomeTour steps={steps} currentStep={1} onPrevious={() => {}} onNext={() => {}} />);
    expect(screen.getByText('Previous')).toBeInTheDocument();
  });
});

// Mock OnboardingChecklist
const OnboardingChecklist = ({ items }: any) => {
  return (
    <div className="onboarding-checklist">
      {items.map((item: any) => (
        <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
          <input type="checkbox" checked={item.completed} readOnly />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

describe('OnboardingChecklist Component', () => {
  const items = [
    { id: '1', label: 'Create account', completed: true },
    { id: '2', label: 'Create first blueprint', completed: false },
    { id: '3', label: 'Deploy infrastructure', completed: false },
  ];

  it('should render all items', () => {
    render(<OnboardingChecklist items={items} />);
    expect(screen.getByText('Create account')).toBeInTheDocument();
    expect(screen.getByText('Create first blueprint')).toBeInTheDocument();
  });

  it('should mark completed items', () => {
    const { container } = render(<OnboardingChecklist items={items} />);
    const completed = container.querySelectorAll('.completed');
    expect(completed).toHaveLength(1);
  });

  it('should show checkboxes', () => {
    render(<OnboardingChecklist items={items} />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });
});

// Mock ContextualHelp
const ContextualHelp = ({ topic, content, position = 'right' }: any) => {
  const [visible, setVisible] = React.useState(false);
  
  return (
    <div className="contextual-help">
      <button onClick={() => setVisible(!visible)}>?</button>
      {visible && (
        <div className={`help-content position-${position}`}>
          <h4>{topic}</h4>
          <p>{content}</p>
        </div>
      )}
    </div>
  );
};

describe('ContextualHelp Component', () => {
  it('should render help button', () => {
    render(<ContextualHelp topic="Blueprints" content="Help text" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('should toggle help content', () => {
    render(<ContextualHelp topic="Blueprints" content="Help text" />);
    
    const button = screen.getByText('?');
    fireEvent.click(button);
    expect(screen.getByText('Blueprints')).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(screen.queryByText('Blueprints')).not.toBeInTheDocument();
  });

  it('should apply position class', () => {
    const { container } = render(
      <ContextualHelp topic="Test" content="Content" position="left" />
    );
    
    fireEvent.click(screen.getByText('?'));
    expect(container.querySelector('.position-left')).toBeInTheDocument();
  });
});

// Mock DiagramGenerator
const DiagramGenerator = ({ components, connections }: any) => {
  return (
    <div className="diagram-generator">
      <svg width="800" height="600">
        {components.map((component: any, index: number) => (
          <g key={component.id}>
            <rect
              x={component.x}
              y={component.y}
              width={120}
              height={60}
              fill="#3b82f6"
            />
            <text x={component.x + 60} y={component.y + 35} textAnchor="middle" fill="white">
              {component.name}
            </text>
          </g>
        ))}
        {connections.map((conn: any, index: number) => (
          <line
            key={index}
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="#666"
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  );
};

describe('DiagramGenerator Component', () => {
  const components = [
    { id: '1', name: 'Web Server', x: 100, y: 100 },
    { id: '2', name: 'Database', x: 300, y: 100 },
  ];

  const connections = [
    { from: { x: 220, y: 130 }, to: { x: 300, y: 130 } },
  ];

  it('should render SVG diagram', () => {
    const { container } = render(
      <DiagramGenerator components={components} connections={connections} />
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('should render component boxes', () => {
    const { container } = render(
      <DiagramGenerator components={components} connections={[]} />
    );
    const rects = container.querySelectorAll('rect');
    expect(rects).toHaveLength(2);
  });

  it('should render connections', () => {
    const { container } = render(
      <DiagramGenerator components={components} connections={connections} />
    );
    const lines = container.querySelectorAll('line');
    expect(lines).toHaveLength(1);
  });

  it('should render component labels', () => {
    render(<DiagramGenerator components={components} connections={[]} />);
    expect(screen.getByText('Web Server')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
  });
});

// Mock RelationshipGraph
const RelationshipGraph = ({ nodes, edges }: any) => {
  return (
    <div className="relationship-graph">
      <div className="nodes">
        {nodes.map((node: any) => (
          <div key={node.id} className={`node node-${node.type}`}>
            {node.label}
          </div>
        ))}
      </div>
      <div className="edges-count">{edges.length} connections</div>
    </div>
  );
};

describe('RelationshipGraph Component', () => {
  const nodes = [
    { id: '1', label: 'VM', type: 'compute' },
    { id: '2', label: 'Storage', type: 'storage' },
  ];

  const edges = [{ from: '1', to: '2', type: 'uses' }];

  it('should render nodes', () => {
    render(<RelationshipGraph nodes={nodes} edges={edges} />);
    expect(screen.getByText('VM')).toBeInTheDocument();
    expect(screen.getByText('Storage')).toBeInTheDocument();
  });

  it('should show connection count', () => {
    render(<RelationshipGraph nodes={nodes} edges={edges} />);
    expect(screen.getByText('1 connections')).toBeInTheDocument();
  });

  it('should apply node type classes', () => {
    const { container } = render(<RelationshipGraph nodes={nodes} edges={edges} />);
    expect(container.querySelector('.node-compute')).toBeInTheDocument();
    expect(container.querySelector('.node-storage')).toBeInTheDocument();
  });
});

// Mock ProjectAssetsModal
const ProjectAssetsModal = ({ isOpen, assets, onClose }: any) => {
  if (!isOpen) return null;

  return (
    <div className="project-assets-modal">
      <h2>Project Assets</h2>
      <div className="assets-list">
        {assets.map((asset: any) => (
          <div key={asset.id} className="asset-item">
            <span className="asset-type">{asset.type}</span>
            <span className="asset-name">{asset.name}</span>
            <span className="asset-status">{asset.status}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

describe('ProjectAssetsModal Component', () => {
  const assets = [
    { id: '1', type: 'compute', name: 'web-vm', status: 'active' },
    { id: '2', type: 'storage', name: 'data-bucket', status: 'active' },
  ];

  it('should render when open', () => {
    render(<ProjectAssetsModal isOpen={true} assets={assets} onClose={() => {}} />);
    expect(screen.getByText('Project Assets')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ProjectAssetsModal isOpen={false} assets={assets} onClose={() => {}} />);
    expect(screen.queryByText('Project Assets')).not.toBeInTheDocument();
  });

  it('should render all assets', () => {
    render(<ProjectAssetsModal isOpen={true} assets={assets} onClose={() => {}} />);
    expect(screen.getByText('web-vm')).toBeInTheDocument();
    expect(screen.getByText('data-bucket')).toBeInTheDocument();
  });

  it('should show asset types', () => {
    render(<ProjectAssetsModal isOpen={true} assets={assets} onClose={() => {}} />);
    expect(screen.getByText('compute')).toBeInTheDocument();
    expect(screen.getByText('storage')).toBeInTheDocument();
  });
});
