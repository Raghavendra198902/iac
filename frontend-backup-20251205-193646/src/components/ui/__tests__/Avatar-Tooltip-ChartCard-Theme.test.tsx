import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock Avatar component
const Avatar = ({ src, alt, size = 'md', status }: any) => {
  const sizes = { sm: 32, md: 40, lg: 56 };
  const dimension = sizes[size];
  
  return (
    <div className={`avatar avatar-${size}`} style={{ width: dimension, height: dimension }}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span className="avatar-initials">{alt?.charAt(0).toUpperCase()}</span>
      )}
      {status && <span className={`avatar-status status-${status}`} />}
    </div>
  );
};

describe('Avatar Component', () => {
  it('should render with image', () => {
    render(<Avatar src="/avatar.jpg" alt="User" />);
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
  });

  it('should render initials when no image', () => {
    const { container } = render(<Avatar alt="John Doe" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('should render different sizes', () => {
    const { container, rerender } = render(<Avatar alt="User" size="sm" />);
    expect(container.querySelector('.avatar-sm')).toBeInTheDocument();
    
    rerender(<Avatar alt="User" size="lg" />);
    expect(container.querySelector('.avatar-lg')).toBeInTheDocument();
  });

  it('should show status indicator', () => {
    const { container } = render(<Avatar alt="User" status="online" />);
    expect(container.querySelector('.status-online')).toBeInTheDocument();
  });
});

// Mock Tooltip component
const Tooltip = ({ content, position = 'top', children }: any) => {
  const [visible, setVisible] = React.useState(false);
  
  return (
    <div className="tooltip-wrapper">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && (
        <div className={`tooltip tooltip-${position}`} role="tooltip">
          {content}
        </div>
      )}
    </div>
  );
};

describe('Tooltip Component', () => {
  it('should show tooltip on hover', async () => {
    render(
      <Tooltip content="Helpful tip">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);
    
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
    });
  });

  it('should hide tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Helpful tip">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    
    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('should position tooltip correctly', () => {
    const { container } = render(
      <Tooltip content="Tip" position="bottom">
        <button>Button</button>
      </Tooltip>
    );
    
    fireEvent.mouseEnter(screen.getByText('Button'));
    expect(container.querySelector('.tooltip-bottom')).toBeInTheDocument();
  });
});

// Mock CommandPalette component
const CommandPalette = ({ isOpen, onClose, commands }: any) => {
  const [query, setQuery] = React.useState('');
  
  if (!isOpen) return null;
  
  const filtered = commands.filter((cmd: any) =>
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );
  
  return (
    <div className="command-palette">
      <input
        type="text"
        placeholder="Type a command..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <div className="command-list">
        {filtered.map((cmd: any) => (
          <div key={cmd.id} className="command-item" onClick={() => cmd.action()}>
            <span className="command-icon">{cmd.icon}</span>
            <span className="command-name">{cmd.name}</span>
            <span className="command-shortcut">{cmd.shortcut}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

describe('CommandPalette Component', () => {
  const commands = [
    { id: '1', name: 'New Blueprint', icon: '📄', shortcut: 'Ctrl+N', action: vi.fn() },
    { id: '2', name: 'Search', icon: '🔍', shortcut: 'Ctrl+K', action: vi.fn() },
    { id: '3', name: 'Settings', icon: '⚙️', shortcut: 'Ctrl+,', action: vi.fn() },
  ];

  it('should not render when closed', () => {
    render(<CommandPalette isOpen={false} commands={commands} />);
    expect(screen.queryByPlaceholderText('Type a command...')).not.toBeInTheDocument();
  });

  it('should render when open', () => {
    render(<CommandPalette isOpen={true} commands={commands} />);
    expect(screen.getByPlaceholderText('Type a command...')).toBeInTheDocument();
  });

  it('should filter commands by search', () => {
    render(<CommandPalette isOpen={true} commands={commands} />);
    
    const input = screen.getByPlaceholderText('Type a command...');
    fireEvent.change(input, { target: { value: 'new' } });
    
    expect(screen.getByText('New Blueprint')).toBeInTheDocument();
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
  });

  it('should execute command on click', () => {
    render(<CommandPalette isOpen={true} commands={commands} />);
    
    fireEvent.click(screen.getByText('New Blueprint'));
    expect(commands[0].action).toHaveBeenCalled();
  });

  it('should close palette', () => {
    const onClose = vi.fn();
    render(<CommandPalette isOpen={true} commands={commands} onClose={onClose} />);
    
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalled();
  });
});

// Mock ChartCard component
const ChartCard = ({ title, data, type = 'line', showLegend = true }: any) => {
  return (
    <div className="chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <button className="export-btn">Export</button>
      </div>
      <div className="chart-body">
        <div className={`chart chart-${type}`}>
          {/* Simplified chart representation */}
          <div className="chart-data">{JSON.stringify(data)}</div>
        </div>
      </div>
      {showLegend && (
        <div className="chart-legend">
          {data.series?.map((s: any, i: number) => (
            <div key={i} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: s.color }} />
              <span className="legend-label">{s.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

describe('ChartCard Component', () => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar'],
    series: [
      { name: 'Revenue', color: '#3b82f6', data: [100, 150, 200] },
      { name: 'Costs', color: '#ef4444', data: [80, 100, 120] },
    ],
  };

  it('should render chart title', () => {
    render(<ChartCard title="Monthly Revenue" data={chartData} />);
    expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
  });

  it('should render export button', () => {
    render(<ChartCard title="Chart" data={chartData} />);
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should render legend', () => {
    render(<ChartCard title="Chart" data={chartData} showLegend={true} />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('Costs')).toBeInTheDocument();
  });

  it('should hide legend when specified', () => {
    render(<ChartCard title="Chart" data={chartData} showLegend={false} />);
    expect(screen.queryByText('Revenue')).not.toBeInTheDocument();
  });

  it('should render different chart types', () => {
    const { container, rerender } = render(<ChartCard title="Chart" data={chartData} type="line" />);
    expect(container.querySelector('.chart-line')).toBeInTheDocument();
    
    rerender(<ChartCard title="Chart" data={chartData} type="bar" />);
    expect(container.querySelector('.chart-bar')).toBeInTheDocument();
  });
});

// Mock ThemeToggle component
const ThemeToggle = ({ theme, onThemeChange }: any) => {
  return (
    <button
      className="theme-toggle"
      onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      <span className="theme-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
};

describe('ThemeToggle Component', () => {
  it('should render light theme icon', () => {
    render(<ThemeToggle theme="light" onThemeChange={() => {}} />);
    expect(screen.getByText('🌙')).toBeInTheDocument();
  });

  it('should render dark theme icon', () => {
    render(<ThemeToggle theme="dark" onThemeChange={() => {}} />);
    expect(screen.getByText('☀️')).toBeInTheDocument();
  });

  it('should toggle theme on click', () => {
    const onThemeChange = vi.fn();
    render(<ThemeToggle theme="light" onThemeChange={onThemeChange} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });

  it('should have accessible label', () => {
    render(<ThemeToggle theme="light" onThemeChange={() => {}} />);
    expect(screen.getByLabelText('Switch to dark theme')).toBeInTheDocument();
  });
});

// Mock PageTransition component
const PageTransition = ({ children, direction = 'fade' }: any) => {
  return (
    <div className={`page-transition page-transition-${direction}`}>
      {children}
    </div>
  );
};

describe('PageTransition Component', () => {
  it('should render children', () => {
    render(
      <PageTransition>
        <div>Page Content</div>
      </PageTransition>
    );
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('should apply transition class', () => {
    const { container } = render(
      <PageTransition direction="slide">
        <div>Content</div>
      </PageTransition>
    );
    expect(container.querySelector('.page-transition-slide')).toBeInTheDocument();
  });

  it('should support different directions', () => {
    const { container, rerender } = render(
      <PageTransition direction="fade">
        <div>Content</div>
      </PageTransition>
    );
    expect(container.querySelector('.page-transition-fade')).toBeInTheDocument();
    
    rerender(
      <PageTransition direction="zoom">
        <div>Content</div>
      </PageTransition>
    );
    expect(container.querySelector('.page-transition-zoom')).toBeInTheDocument();
  });
});
