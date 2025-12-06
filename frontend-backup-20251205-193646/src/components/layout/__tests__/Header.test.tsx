import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock Header component structure
const MockHeader = ({ user, onToggleSidebar }: any) => {
  return (
    <header className="header">
      <button onClick={onToggleSidebar}>Toggle Sidebar</button>
      <div className="user-info">
        <span>{user?.name || 'Guest'}</span>
        <span>{user?.email}</span>
        <span>{user?.role}</span>
      </div>
      <div className="notifications">
        <button>Notifications</button>
      </div>
      <div className="search">
        <input type="search" placeholder="Search..." />
      </div>
    </header>
  );
};

describe('Header Component', () => {
  const defaultUser = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    tenantName: 'Acme Corp',
  };

  it('should render user name', () => {
    render(
      <BrowserRouter>
        <MockHeader user={defaultUser} />
      </BrowserRouter>
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render user email', () => {
    render(
      <BrowserRouter>
        <MockHeader user={defaultUser} />
      </BrowserRouter>
    );
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('should render user role', () => {
    render(
      <BrowserRouter>
        <MockHeader user={defaultUser} />
      </BrowserRouter>
    );
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('should render Guest when no user', () => {
    render(
      <BrowserRouter>
        <MockHeader />
      </BrowserRouter>
    );
    expect(screen.getByText('Guest')).toBeInTheDocument();
  });

  it('should call onToggleSidebar when button clicked', () => {
    const onToggleSidebar = vi.fn();
    render(
      <BrowserRouter>
        <MockHeader user={defaultUser} onToggleSidebar={onToggleSidebar} />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText('Toggle Sidebar'));
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('should render notifications button', () => {
    render(
      <BrowserRouter>
        <MockHeader user={defaultUser} />
      </BrowserRouter>
    );
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should render search input', () => {
    render(
      <BrowserRouter>
        <MockHeader user={defaultUser} />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });
});

// Mock notification structure
const MockNotification = ({ notification, onRead, onDismiss }: any) => {
  return (
    <div className={`notification notification-${notification.type}`}>
      <h4>{notification.title}</h4>
      <p>{notification.message}</p>
      <span>{notification.timestamp}</span>
      {!notification.read && <button onClick={() => onRead(notification.id)}>Mark Read</button>}
      <button onClick={() => onDismiss(notification.id)}>Dismiss</button>
    </div>
  );
};

describe('Notification Component', () => {
  const notification = {
    id: '1',
    type: 'warning',
    title: 'Policy Violation',
    message: 'Blueprint has guardrail violations',
    timestamp: '5 min ago',
    read: false,
  };

  it('should render notification title', () => {
    render(<MockNotification notification={notification} />);
    expect(screen.getByText('Policy Violation')).toBeInTheDocument();
  });

  it('should render notification message', () => {
    render(<MockNotification notification={notification} />);
    expect(screen.getByText('Blueprint has guardrail violations')).toBeInTheDocument();
  });

  it('should render timestamp', () => {
    render(<MockNotification notification={notification} />);
    expect(screen.getByText('5 min ago')).toBeInTheDocument();
  });

  it('should render mark read button for unread notifications', () => {
    render(<MockNotification notification={notification} />);
    expect(screen.getByText('Mark Read')).toBeInTheDocument();
  });

  it('should not render mark read button for read notifications', () => {
    const readNotification = { ...notification, read: true };
    render(<MockNotification notification={readNotification} />);
    expect(screen.queryByText('Mark Read')).not.toBeInTheDocument();
  });

  it('should call onRead when mark read clicked', () => {
    const onRead = vi.fn();
    render(<MockNotification notification={notification} onRead={onRead} />);

    fireEvent.click(screen.getByText('Mark Read'));
    expect(onRead).toHaveBeenCalledWith('1');
  });

  it('should call onDismiss when dismiss clicked', () => {
    const onDismiss = vi.fn();
    render(<MockNotification notification={notification} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByText('Dismiss'));
    expect(onDismiss).toHaveBeenCalledWith('1');
  });

  it('should apply correct type class', () => {
    const { container } = render(<MockNotification notification={notification} />);
    expect(container.querySelector('.notification-warning')).toBeInTheDocument();
  });

  it('should handle different notification types', () => {
    const types = ['info', 'warning', 'error', 'success'];

    types.forEach((type) => {
      const notif = { ...notification, type };
      const { container, unmount } = render(<MockNotification notification={notif} />);
      expect(container.querySelector(`.notification-${type}`)).toBeInTheDocument();
      unmount();
    });
  });
});

// Mock system status indicator
const MockSystemStatus = ({ status }: { status: 'online' | 'degraded' | 'offline' }) => {
  const statusColors = {
    online: 'green',
    degraded: 'yellow',
    offline: 'red',
  };

  const statusLabels = {
    online: 'All Systems Operational',
    degraded: 'Degraded Performance',
    offline: 'System Offline',
  };

  return (
    <div className={`system-status status-${status}`}>
      <span className={`indicator ${statusColors[status]}`} />
      <span>{statusLabels[status]}</span>
    </div>
  );
};

describe('System Status Component', () => {
  it('should render online status', () => {
    render(<MockSystemStatus status="online" />);
    expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
  });

  it('should render degraded status', () => {
    render(<MockSystemStatus status="degraded" />);
    expect(screen.getByText('Degraded Performance')).toBeInTheDocument();
  });

  it('should render offline status', () => {
    render(<MockSystemStatus status="offline" />);
    expect(screen.getByText('System Offline')).toBeInTheDocument();
  });

  it('should apply correct status class', () => {
    const { container } = render(<MockSystemStatus status="online" />);
    expect(container.querySelector('.status-online')).toBeInTheDocument();
  });

  it('should show green indicator for online', () => {
    const { container } = render(<MockSystemStatus status="online" />);
    expect(container.querySelector('.indicator.green')).toBeInTheDocument();
  });

  it('should show yellow indicator for degraded', () => {
    const { container } = render(<MockSystemStatus status="degraded" />);
    expect(container.querySelector('.indicator.yellow')).toBeInTheDocument();
  });

  it('should show red indicator for offline', () => {
    const { container } = render(<MockSystemStatus status="offline" />);
    expect(container.querySelector('.indicator.red')).toBeInTheDocument();
  });
});
