import { useState } from 'react'
import { Link } from 'react-router-dom'
import brandConfig from '../config/brand'

function MonitoringPage() {
  const [activeDashboard, setActiveDashboard] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Use the same host as the current page to avoid CORS issues
  const grafanaHost = window.location.hostname
  const grafanaPort = '3020'
  const grafanaUrl = `http://${grafanaHost}:${grafanaPort}`

  const dashboards = [
    {
      id: 'overview',
      name: 'Platform Overview',
      icon: '📊',
      url: `${grafanaUrl}/d/iac-dharma-overview?orgId=1&kiosk`,
      description: 'Services health, request rates, CPU & memory',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 'api-gateway',
      name: 'API Gateway',
      icon: '🚀',
      url: `${grafanaUrl}/d/iac-api-gateway?orgId=1&kiosk`,
      description: 'Request metrics, response times, status codes',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 'aiops-ml',
      name: 'AIOps & ML',
      icon: '🤖',
      url: `${grafanaUrl}/d/iac-aiops-ml?orgId=1&kiosk`,
      description: 'Predictions, anomalies, model accuracy',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      id: 'infrastructure',
      name: 'Infrastructure',
      icon: '🖥️',
      url: `${grafanaUrl}/d/iac-infrastructure?orgId=1&kiosk`,
      description: 'Container resources, network & disk I/O',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    },
  ]

  const currentDashboard = dashboards.find(d => d.id === activeDashboard)

  return (
    <div className="monitoring-page">
      {/* Sidebar */}
      <aside className={`monitoring-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">📊</span>
            {!sidebarCollapsed && (
              <div className="brand-text">
                <h3>Monitoring</h3>
                <span className="version-badge">Live</span>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        {/* Dashboard List */}
        <nav className="dashboard-nav">
          {dashboards.map(dashboard => (
            <button
              key={dashboard.id}
              className={`dashboard-nav-item ${activeDashboard === dashboard.id ? 'active' : ''}`}
              onClick={() => setActiveDashboard(dashboard.id)}
            >
              <div 
                className="nav-item-icon" 
                style={{ background: dashboard.color }}
              >
                {dashboard.icon}
              </div>
              {!sidebarCollapsed && (
                <div className="nav-item-content">
                  <h4>{dashboard.name}</h4>
                  <p>{dashboard.description}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Actions */}
        {!sidebarCollapsed && (
          <div className="sidebar-actions">
            <a 
              href={grafanaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-link"
            >
              <span>🔗</span>
              Open in Grafana
            </a>
            <Link to="/dashboard" className="action-link">
              <span>🏠</span>
              Back to Dashboard
            </Link>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="monitoring-content">
        {/* Header */}
        <header className="monitoring-header">
          <div className="header-left">
            <div 
              className="dashboard-icon-large" 
              style={{ background: currentDashboard.color }}
            >
              {currentDashboard.icon}
            </div>
            <div className="header-info">
              <h1>{currentDashboard.name}</h1>
              <p>{currentDashboard.description}</p>
            </div>
          </div>
          <div className="header-right">
            <div className="status-indicator">
              <span className="status-dot"></span>
              <span>Live Updates</span>
            </div>
            <a 
              href={currentDashboard.url.replace('&kiosk', '')} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-open-grafana"
            >
              Open Full Screen
            </a>
          </div>
        </header>

        {/* Iframe Container */}
        <div className="iframe-container">
          <iframe
            src={currentDashboard.url}
            title={currentDashboard.name}
            className="grafana-iframe"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      </main>

      <style>{`
        .monitoring-page {
          display: flex;
          height: 100vh;
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        }

        .monitoring-sidebar {
          width: 320px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-right: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          transition: width 0.3s ease;
        }

        .monitoring-sidebar.collapsed {
          width: 80px;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand-icon {
          font-size: 2rem;
        }

        .brand-text h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .version-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
          border-radius: 8px;
          font-weight: 600;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #64748b;
          transition: color 0.2s;
        }

        .sidebar-toggle:hover {
          color: #1e293b;
        }

        .dashboard-nav {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
        }

        .dashboard-nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border: none;
          background: transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 0.5rem;
          text-align: left;
        }

        .dashboard-nav-item:hover {
          background: rgba(102, 126, 234, 0.08);
        }

        .dashboard-nav-item.active {
          background: rgba(102, 126, 234, 0.15);
        }

        .nav-item-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          font-size: 1.5rem;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-item-content h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
        }

        .nav-item-content p {
          margin: 0;
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.4;
        }

        .sidebar-actions {
          padding: 1rem;
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .action-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          text-decoration: none;
          color: #64748b;
          border-radius: 8px;
          transition: all 0.2s;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .action-link:hover {
          background: rgba(102, 126, 234, 0.08);
          color: #667eea;
        }

        .action-link span {
          font-size: 1.25rem;
        }

        .monitoring-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .monitoring-header {
          padding: 2rem;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .dashboard-icon-large {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          font-size: 2rem;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .header-info h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e293b;
        }

        .header-info p {
          margin: 0;
          color: #64748b;
          font-size: 0.95rem;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(34, 197, 94, 0.1);
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #22c55e;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .btn-open-grafana {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
        }

        .btn-open-grafana:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
        }

        .iframe-container {
          flex: 1;
          padding: 1.5rem;
          overflow: hidden;
        }

        .grafana-iframe {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          background: white;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
        }

        @media (max-width: 768px) {
          .monitoring-sidebar {
            width: 80px;
          }

          .monitoring-sidebar:not(.collapsed) {
            width: 100%;
            position: fixed;
            z-index: 1000;
          }

          .header-info h1 {
            font-size: 1.25rem;
          }

          .header-right {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default MonitoringPage
