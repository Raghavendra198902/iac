import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';

// Mock AppLayout component
const AppLayout = ({ children, sidebar, header, footer }: any) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="app-layout" data-testid="app-layout">
      {header && (
        <header className="app-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            ☰
          </button>
          {header}
        </header>
      )}
      <div className="app-body">
        {sidebar && (
          <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
            {sidebar}
          </aside>
        )}
        <main className="app-content">
          {children}
        </main>
      </div>
      {footer && <footer className="app-footer">{footer}</footer>}
    </div>
  );
};

describe('AppLayout Component', () => {
  it('should render with all sections', () => {
    render(
      <AppLayout
        header={<div>Header Content</div>}
        sidebar={<div>Sidebar Content</div>}
        footer={<div>Footer Content</div>}
      >
        <div>Main Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should toggle sidebar on button click', () => {
    const { container } = render(
      <AppLayout sidebar={<div>Sidebar</div>}>
        <div>Content</div>
      </AppLayout>
    );

    const toggleButton = screen.getByLabelText('Toggle sidebar');
    const sidebar = container.querySelector('.app-sidebar');

    expect(sidebar).toHaveClass('open');

    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('closed');

    fireEvent.click(toggleButton);
    expect(sidebar).toHaveClass('open');
  });

  it('should render without optional sections', () => {
    render(
      <AppLayout>
        <div>Main Content Only</div>
      </AppLayout>
    );

    expect(screen.getByText('Main Content Only')).toBeInTheDocument();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
  });

  it('should have proper structure', () => {
    const { container } = render(
      <AppLayout
        header={<div>Header</div>}
        sidebar={<div>Sidebar</div>}
      >
        <div>Content</div>
      </AppLayout>
    );

    const layout = container.querySelector('.app-layout');
    expect(layout).toBeInTheDocument();
    expect(container.querySelector('.app-header')).toBeInTheDocument();
    expect(container.querySelector('.app-body')).toBeInTheDocument();
    expect(container.querySelector('.app-sidebar')).toBeInTheDocument();
    expect(container.querySelector('.app-content')).toBeInTheDocument();
  });
});

// Mock MainLayout component with routing support
const MainLayout = ({ children, breadcrumbs, showBackButton, onBack }: any) => {
  return (
    <div className="main-layout">
      {(breadcrumbs || showBackButton) && (
        <div className="navigation-bar">
          {showBackButton && (
            <button onClick={onBack} className="back-button">
              ← Back
            </button>
          )}
          {breadcrumbs && (
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb: any, idx: number) => (
                <span key={idx}>
                  {idx > 0 && <span className="separator"> / </span>}
                  {crumb.href ? (
                    <a href={crumb.href}>{crumb.label}</a>
                  ) : (
                    <span className="current">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>
      )}
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

describe('MainLayout Component', () => {
  it('should render children', () => {
    render(
      <MainLayout>
        <div>Page Content</div>
      </MainLayout>
    );

    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('should render breadcrumbs', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Projects', href: '/projects' },
      { label: 'Current Project' },
    ];

    render(<MainLayout breadcrumbs={breadcrumbs}><div>Content</div></MainLayout>);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Current Project')).toBeInTheDocument();
  });

  it('should render back button', () => {
    const onBack = vi.fn();
    render(
      <MainLayout showBackButton onBack={onBack}>
        <div>Content</div>
      </MainLayout>
    );

    const backButton = screen.getByText('← Back');
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalled();
  });

  it('should show breadcrumb separators', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Page' },
    ];

    const { container } = render(<MainLayout breadcrumbs={breadcrumbs}><div>Content</div></MainLayout>);

    const separators = container.querySelectorAll('.separator');
    expect(separators).toHaveLength(1);
  });

  it('should highlight current breadcrumb', () => {
    const breadcrumbs = [
      { label: 'Home', href: '/' },
      { label: 'Current Page' },
    ];

    const { container } = render(<MainLayout breadcrumbs={breadcrumbs}><div>Content</div></MainLayout>);

    const current = container.querySelector('.current');
    expect(current).toHaveTextContent('Current Page');
  });
});

// Mock Footer component
const Footer = ({ links, copyright, socialLinks }: any) => {
  return (
    <footer className="footer">
      {links && (
        <nav className="footer-links">
          {links.map((link: any, idx: number) => (
            <a key={idx} href={link.href} className="footer-link">
              {link.label}
            </a>
          ))}
        </nav>
      )}
      {socialLinks && (
        <div className="social-links">
          {socialLinks.map((social: any, idx: number) => (
            <a key={idx} href={social.url} aria-label={social.name} className="social-link">
              {social.icon}
            </a>
          ))}
        </div>
      )}
      {copyright && (
        <div className="copyright">
          {copyright}
        </div>
      )}
    </footer>
  );
};

describe('Footer Component', () => {
  it('should render footer links', () => {
    const links = [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy', href: '/privacy' },
    ];

    render(<Footer links={links} />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
  });

  it('should render copyright text', () => {
    render(<Footer copyright="© 2025 Company Name" />);
    expect(screen.getByText('© 2025 Company Name')).toBeInTheDocument();
  });

  it('should render social media links', () => {
    const socialLinks = [
      { name: 'Twitter', url: 'https://twitter.com', icon: '𝕏' },
      { name: 'GitHub', url: 'https://github.com', icon: '⚙' },
      { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
    ];

    render(<Footer socialLinks={socialLinks} />);

    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub')).toBeInTheDocument();
    expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
  });

  it('should render all footer sections', () => {
    const links = [{ label: 'About', href: '/about' }];
    const socialLinks = [{ name: 'Twitter', url: 'https://twitter.com', icon: '𝕏' }];

    const { container } = render(
      <Footer
        links={links}
        socialLinks={socialLinks}
        copyright="© 2025 Company"
      />
    );

    expect(container.querySelector('.footer-links')).toBeInTheDocument();
    expect(container.querySelector('.social-links')).toBeInTheDocument();
    expect(container.querySelector('.copyright')).toBeInTheDocument();
  });
});

// Mock PublicLayout component
const PublicLayout = ({ children, showHeader = true, headerContent }: any) => {
  return (
    <div className="public-layout">
      {showHeader && (
        <header className="public-header">
          {headerContent || (
            <div className="default-header">
              <div className="logo">MyApp</div>
              <nav>
                <a href="/login">Login</a>
                <a href="/signup">Sign Up</a>
              </nav>
            </div>
          )}
        </header>
      )}
      <main className="public-content">
        {children}
      </main>
      <Footer copyright="© 2025 MyApp" />
    </div>
  );
};

describe('PublicLayout Component', () => {
  it('should render public layout', () => {
    render(
      <PublicLayout>
        <div>Public Content</div>
      </PublicLayout>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });

  it('should show default header', () => {
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    );

    expect(screen.getByText('MyApp')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should render custom header content', () => {
    render(
      <PublicLayout headerContent={<div>Custom Header</div>}>
        <div>Content</div>
      </PublicLayout>
    );

    expect(screen.getByText('Custom Header')).toBeInTheDocument();
    expect(screen.queryByText('MyApp')).not.toBeInTheDocument();
  });

  it('should hide header when specified', () => {
    const { container } = render(
      <PublicLayout showHeader={false}>
        <div>Content</div>
      </PublicLayout>
    );

    expect(container.querySelector('.public-header')).not.toBeInTheDocument();
  });

  it('should include footer', () => {
    render(
      <PublicLayout>
        <div>Content</div>
      </PublicLayout>
    );

    expect(screen.getByText('© 2025 MyApp')).toBeInTheDocument();
  });
});

// Mock responsive layout behavior
const ResponsiveLayout = ({ children }: any) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`responsive-layout ${isMobile ? 'mobile' : 'desktop'}`}>
      <div className="layout-type">
        {isMobile ? 'Mobile View' : 'Desktop View'}
      </div>
      {children}
    </div>
  );
};

describe('Responsive Layout', () => {
  it('should render layout', () => {
    render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should show desktop view by default', () => {
    // Default window.innerWidth in jsdom is 1024
    render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    expect(screen.getByText('Desktop View')).toBeInTheDocument();
  });

  it('should apply responsive classes', () => {
    const { container } = render(
      <ResponsiveLayout>
        <div>Content</div>
      </ResponsiveLayout>
    );

    const layout = container.querySelector('.responsive-layout');
    expect(layout).toHaveClass('desktop');
  });
});

// Integrated layout test
describe('Complete Layout Integration', () => {
  it('should render complete app with nested layouts', () => {
    render(
      <AppLayout
        header={<div>App Header</div>}
        sidebar={<div>Sidebar</div>}
        footer={<Footer copyright="© 2025" />}
      >
        <MainLayout breadcrumbs={[{ label: 'Home' }]}>
          <div>Page Content</div>
        </MainLayout>
      </AppLayout>
    );

    expect(screen.getByText('App Header')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
    expect(screen.getByText('© 2025')).toBeInTheDocument();
  });

  it('should handle layout switching', () => {
    const { rerender } = render(
      <PublicLayout>
        <div>Public Page</div>
      </PublicLayout>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();

    rerender(
      <AppLayout sidebar={<div>Sidebar</div>}>
        <div>Private Page</div>
      </AppLayout>
    );

    expect(screen.queryByText('Login')).not.toBeInTheDocument();
    expect(screen.getByText('Private Page')).toBeInTheDocument();
  });
});
