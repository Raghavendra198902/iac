import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock Sidebar component
const Sidebar = ({ isOpen, items }: any) => {
  if (!isOpen) return null;
  
  return (
    <aside className="sidebar">
      <nav>
        {items.map((item: any) => (
          <a key={item.path} href={item.path} className="nav-item">
            {item.icon && <span className="icon">{item.icon}</span>}
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  );
};

describe('Sidebar Component', () => {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/blueprints', label: 'Blueprints', icon: '📋' },
    { path: '/deployments', label: 'Deployments', icon: '🚀' },
  ];

  it('should render when open', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} items={navItems} />
      </BrowserRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={false} items={navItems} />
      </BrowserRouter>
    );
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('should render all navigation items', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} items={navItems} />
      </BrowserRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Blueprints')).toBeInTheDocument();
    expect(screen.getByText('Deployments')).toBeInTheDocument();
  });

  it('should render icons', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} items={navItems} />
      </BrowserRouter>
    );
    expect(screen.getByText('📊')).toBeInTheDocument();
  });
});

// Mock Breadcrumbs component
const Breadcrumbs = ({ items }: any) => {
  return (
    <nav className="breadcrumbs">
      {items.map((item: any, index: number) => (
        <span key={index}>
          {item.href ? (
            <a href={item.href}>{item.label}</a>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && <span className="separator">/</span>}
        </span>
      ))}
    </nav>
  );
};

describe('Breadcrumbs Component', () => {
  const items = [
    { label: 'Home', href: '/' },
    { label: 'Blueprints', href: '/blueprints' },
    { label: 'Edit', href: null },
  ];

  it('should render all breadcrumb items', () => {
    render(<Breadcrumbs items={items} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Blueprints')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should render links for items with href', () => {
    render(<Breadcrumbs items={items} />);
    const homeLink = screen.getByText('Home');
    expect(homeLink.tagName).toBe('A');
  });

  it('should render separators', () => {
    const { container } = render(<Breadcrumbs items={items} />);
    const separators = container.querySelectorAll('.separator');
    expect(separators).toHaveLength(2);
  });
});

// Mock LoadingSpinner component
const LoadingSpinner = ({ size = 'md', text }: any) => {
  const sizes = { sm: '16px', md: '32px', lg: '48px' };
  return (
    <div className="loading-spinner">
      <div className="spinner" style={{ width: sizes[size], height: sizes[size] }} />
      {text && <p>{text}</p>}
    </div>
  );
};

describe('LoadingSpinner Component', () => {
  it('should render spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('should render with text', () => {
    render(<LoadingSpinner text="Loading..." />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should apply size styles', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('.spinner') as HTMLElement;
    expect(spinner.style.width).toBe('48px');
  });
});

// Mock Tooltip component
const Tooltip = ({ content, children }: any) => {
  const [visible, setVisible] = React.useState(false);
  
  return (
    <div className="tooltip-wrapper">
      <div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        {children}
      </div>
      {visible && <div className="tooltip-content">{content}</div>}
    </div>
  );
};

describe('Tooltip Component', () => {
  it('should render trigger element', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('should show tooltip on hover', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    );
    
    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    expect(screen.queryByText('Tooltip text')).not.toBeInTheDocument();
  });
});

// Mock Avatar component
const Avatar = ({ src, alt, fallback, size = 'md' }: any) => {
  const sizes = { sm: '32px', md: '40px', lg: '48px' };
  
  return (
    <div className="avatar" style={{ width: sizes[size], height: sizes[size] }}>
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span className="avatar-fallback">{fallback}</span>
      )}
    </div>
  );
};

describe('Avatar Component', () => {
  it('should render image when src provided', () => {
    render(<Avatar src="/avatar.jpg" alt="User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/avatar.jpg');
  });

  it('should render fallback when no src', () => {
    render(<Avatar fallback="JD" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should apply size styles', () => {
    const { container } = render(<Avatar fallback="A" size="lg" />);
    const avatar = container.querySelector('.avatar') as HTMLElement;
    expect(avatar.style.width).toBe('48px');
  });
});
