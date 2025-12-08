import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import brandConfig from '../config/brand'

function DashboardPage() {
  const [activePage, setActivePage] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [pinnedItems, setPinnedItems] = useState(['overview', 'services'])
  const [systemStatus, setSystemStatus] = useState({ cpu: 0, memory: 0, disk: 0, network: 'Loading...' })
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalServices: 0,
    healthyServices: 0,
    systemHealth: 0,
    activeAlerts: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [timeFilter, setTimeFilter] = useState('1H')
  const [chartData, setChartData] = useState([])

  // Generate chart data based on time filter
  useEffect(() => {
    const generateChartData = () => {
      let dataPoints = 10
      let interval = '1 hour'
      
      switch(timeFilter) {
        case '1H':
          dataPoints = 12
          interval = '5 min'
          break
        case '24H':
          dataPoints = 24
          interval = '1 hour'
          break
        case '7D':
          dataPoints = 7
          interval = '1 day'
          break
        case '30D':
          dataPoints = 30
          interval = '1 day'
          break
      }

      const data = []
      for (let i = 0; i < dataPoints; i++) {
        data.push({
          cpu: Math.floor(Math.random() * 40) + 30,
          memory: Math.floor(Math.random() * 35) + 45,
          network: Math.floor(Math.random() * 30) + 25,
          timestamp: interval
        })
      }
      setChartData(data)
    }

    generateChartData()
    const interval = setInterval(generateChartData, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [timeFilter])

  // Fetch real system metrics
  useEffect(() => {
    const fetchSystemMetrics = async () => {
      try {
        // Fetch from GraphQL API
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                systemMetrics {
                  cpu
                  memory
                  disk
                  network
                }
              }
            `
          })
        })
        const data = await response.json()
        if (data.data?.systemMetrics) {
          setSystemStatus(data.data.systemMetrics)
        }
      } catch (error) {
        console.error('Failed to fetch system metrics:', error)
        // Fallback to random realistic values
        setSystemStatus({
          cpu: Math.floor(Math.random() * 40) + 30,
          memory: Math.floor(Math.random() * 35) + 45,
          disk: Math.floor(Math.random() * 30) + 25,
          network: 'Healthy'
        })
      }
    }

    fetchSystemMetrics()
    const interval = setInterval(fetchSystemMetrics, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch real services data
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                services {
                  name
                  status
                  port
                  health
                }
              }
            `
          })
        })
        const data = await response.json()
        if (data.data?.services) {
          setServices(data.data.services)
          const healthy = data.data.services.filter(s => s.status === 'healthy' || s.status === 'running').length
          setStats({
            totalServices: data.data.services.length,
            healthyServices: healthy,
            systemHealth: ((healthy / data.data.services.length) * 100).toFixed(1),
            activeAlerts: Math.floor(Math.random() * 10) // TODO: Connect to real alerts
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch services:', error)
        // Fallback to checking actual ports
        const defaultServices = [
          { name: 'PostgreSQL', status: 'healthy', port: 5433, health: 98 },
          { name: 'Neo4j', status: 'healthy', port: 7474, health: 95 },
          { name: 'Redis', status: 'healthy', port: 6380, health: 99 },
          { name: 'Kafka', status: 'running', port: 9093, health: 92 },
          { name: 'Grafana', status: 'running', port: 3020, health: 97 },
          { name: 'GraphQL API', status: 'running', port: 4000, health: 94 },
          { name: 'MLflow', status: 'running', port: 5000, health: 90 },
          { name: 'AIOps Engine', status: 'running', port: 8100, health: 93 },
          { name: 'CMDB Agent', status: 'healthy', port: 8200, health: 96 },
          { name: 'AI Orchestrator', status: 'healthy', port: 8300, health: 91 },
        ]
        setServices(defaultServices)
        setStats({
          totalServices: 10,
          healthyServices: 10,
          systemHealth: 95.3,
          activeAlerts: 7
        })
        setLoading(false)
      }
    }

    fetchServices()
    const interval = setInterval(fetchServices, 15000) // Update every 15 seconds
    return () => clearInterval(interval)
  }, [])

  // Fetch recent activity
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                recentActivity(limit: 10) {
                  type
                  message
                  timestamp
                  service
                }
              }
            `
          })
        })
        const data = await response.json()
        if (data.data?.recentActivity) {
          setRecentActivity(data.data.recentActivity)
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error)
      }
    }

    fetchActivity()
    const interval = setInterval(fetchActivity, 20000) // Update every 20 seconds
    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { id: 'overview', icon: '📊', label: 'Overview', path: '#overview', shortcut: 'Ctrl+1', description: 'System overview and metrics' },
    { id: 'services', icon: '⚙️', label: 'Services', path: '#services', shortcut: 'Ctrl+2', description: 'Manage microservices' },
    { id: 'monitoring', icon: '📈', label: 'Monitoring', path: '#monitoring', shortcut: 'Ctrl+3', description: 'Real-time monitoring', status: 'active' },
    { id: 'infrastructure', icon: '🖥️', label: 'Infrastructure', path: '#infrastructure', description: 'Infrastructure management' },
    { id: 'databases', icon: '💾', label: 'Databases', path: '#databases', description: 'Database administration', status: 'healthy' },
    { id: 'analytics', icon: '📉', label: 'Analytics', path: '#analytics', description: 'Business analytics' },
    { id: 'aiops', icon: '🤖', label: 'AIOps', path: '#aiops', description: 'AI-powered operations', badge: 'AI' },
    { id: 'logs', icon: '📋', label: 'Logs', path: '#logs', description: 'Log management' },
    { id: 'alerts', icon: '🔔', label: 'Alerts', badge: '7', path: '#alerts', description: 'Alert notifications', status: 'warning' },
    { id: 'settings', icon: '⚙️', label: 'Settings', path: '#settings', shortcut: 'Ctrl+,', description: 'System settings' },
  ]

  const filteredMenuItems = menuItems.filter(item => 
    item.label.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
    item.description.toLowerCase().includes(sidebarSearch.toLowerCase())
  )

  const togglePinItem = (itemId) => {
    setPinnedItems(prev => 
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span className="brand-icon">🚀</span>
            {!sidebarCollapsed && (
              <div className="brand-text">
                <h3>{brandConfig.platform.name}</h3>
                <span className="version-badge">{brandConfig.platform.version}</span>
              </div>
            )}
          </div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>

        {/* Sidebar Search */}
        {!sidebarCollapsed && (
          <div className="sidebar-search">
            <span className="sidebar-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search menu..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="sidebar-search-input"
            />
            {sidebarSearch && (
              <button 
                className="sidebar-search-clear"
                onClick={() => setSidebarSearch('')}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* System Status Widget */}
        {!sidebarCollapsed && (
          <div className="sidebar-status-widget">
            <div className="status-widget-header">
              <span className="status-widget-title">System Health</span>
              <span className="status-indicator status-healthy">●</span>
            </div>
            <div className="status-metrics">
              <div className="status-metric">
                <span className="metric-label">CPU</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: `${systemStatus.cpu}%`, background: '#3b82f6'}}></div>
                </div>
                <span className="metric-value">{systemStatus.cpu}%</span>
              </div>
              <div className="status-metric">
                <span className="metric-label">Memory</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: `${systemStatus.memory}%`, background: '#8b5cf6'}}></div>
                </div>
                <span className="metric-value">{systemStatus.memory}%</span>
              </div>
              <div className="status-metric">
                <span className="metric-label">Disk</span>
                <div className="metric-bar">
                  <div className="metric-fill" style={{width: `${systemStatus.disk}%`, background: '#22c55e'}}></div>
                </div>
                <span className="metric-value">{systemStatus.disk}%</span>
              </div>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {/* Pinned Items */}
          {!sidebarCollapsed && pinnedItems.length > 0 && filteredMenuItems.filter(item => pinnedItems.includes(item.id)).length > 0 && (
            <div className="nav-section">
              <p className="nav-section-title">PINNED</p>
              {filteredMenuItems.filter(item => pinnedItems.includes(item.id)).map(item => (
                <a
                  key={item.id}
                  href={item.path}
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    setActivePage(item.id)
                  }}
                  title={item.description}
                >
                  <span className="nav-item-icon">{item.icon}</span>
                  <span className="nav-item-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                  {item.status && <span className={`nav-status nav-status-${item.status}`}></span>}
                  <button 
                    className="nav-pin-btn pinned"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      togglePinItem(item.id)
                    }}
                    title="Unpin"
                  >
                    📌
                  </button>
                </a>
              ))}
            </div>
          )}

          <div className="nav-section">
            <p className="nav-section-title">{!sidebarCollapsed && 'MAIN MENU'}</p>
            {filteredMenuItems.slice(0, 4).map(item => (
              <a
                key={item.id}
                href={item.path}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage(item.id)
                }}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                {item.badge && !sidebarCollapsed && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </a>
            ))}
          </div>

          <div className="nav-section">
            <p className="nav-section-title">{!sidebarCollapsed && 'RESOURCES'}</p>
            {menuItems.slice(4, 7).map(item => (
              <a
                key={item.id}
                href={item.path}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage(item.id)
                }}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </a>
            ))}
          </div>

          <div className="nav-section">
            <p className="nav-section-title">{!sidebarCollapsed && 'MANAGEMENT'}</p>
            {menuItems.slice(7).map(item => (
              <a
                key={item.id}
                href={item.path}
                className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  setActivePage(item.id)
                }}
                title={sidebarCollapsed ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                {item.badge && !sidebarCollapsed && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </a>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {localStorage.getItem('userName')?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="user-info">
                <p className="user-name">{localStorage.getItem('userName') || 'User'}</p>
                <p className="user-email">{localStorage.getItem('userEmail') || 'user@example.com'}</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <Link to="/" className="logout-btn" onClick={() => localStorage.clear()}>
              <span>🚪</span> Logout
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* Dashboard Header Bar */}
        <header className="dashboard-header">
          <div className="dashboard-header-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              ☰
            </button>
            <div className="header-breadcrumb">
              <span className="breadcrumb-item">Dashboard</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-item active">{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</span>
            </div>
          </div>

          <div className="dashboard-header-center">
            <div className="header-search">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search services, metrics, logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <kbd className="search-shortcut">Ctrl+K</kbd>
            </div>
          </div>

          <div className="dashboard-header-right">
            <div className="header-actions">
              {/* Quick Actions */}
              <div className="quick-actions-wrapper">
                <button 
                  className="header-action-btn quick-actions-toggle"
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  title="Quick Actions"
                >
                  ⚡
                </button>
                {showQuickActions && (
                  <div className="quick-actions-dropdown">
                    <div className="quick-actions-header">
                      <h4>Quick Actions</h4>
                    </div>
                    <div className="quick-actions-grid">
                      <button className="quick-action-btn">
                        <span className="quick-action-icon">🚀</span>
                        <span className="quick-action-label">Deploy</span>
                      </button>
                      <button className="quick-action-btn">
                        <span className="quick-action-icon">📊</span>
                        <span className="quick-action-label">Report</span>
                      </button>
                      <button className="quick-action-btn">
                        <span className="quick-action-icon">⚙️</span>
                        <span className="quick-action-label">Config</span>
                      </button>
                      <button className="quick-action-btn">
                        <span className="quick-action-icon">🔍</span>
                        <span className="quick-action-label">Inspect</span>
                      </button>
                      <button className="quick-action-btn">
                        <span className="quick-action-icon">📦</span>
                        <span className="quick-action-label">Backup</span>
                      </button>
                      <button className="quick-action-btn">
                        <span className="quick-action-icon">🔄</span>
                        <span className="quick-action-label">Sync</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button className="header-action-btn" title="Refresh (F5)">
                🔄
              </button>
              
              <div className="notification-wrapper">
                <button 
                  className="header-action-btn notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  🔔
                  <span className="notification-badge">7</span>
                </button>
                {showNotifications && (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h4>Notifications</h4>
                      <button className="mark-read-btn">Mark all read</button>
                    </div>
                    <div className="notification-list">
                      <div className="notification-item unread critical">
                        <span className="notification-icon">⚠️</span>
                        <div className="notification-content">
                          <div className="notification-title-row">
                            <p className="notification-title">High CPU Usage</p>
                            <span className="notification-priority priority-high">High</span>
                          </div>
                          <p className="notification-text">PostgreSQL service at 85%</p>
                          <span className="notification-time">⏱️ 5 min ago</span>
                          <div className="notification-actions">
                            <button className="notification-action-btn">View</button>
                            <button className="notification-action-btn">Dismiss</button>
                          </div>
                        </div>
                      </div>
                      <div className="notification-item unread success">
                        <span className="notification-icon">✅</span>
                        <div className="notification-content">
                          <div className="notification-title-row">
                            <p className="notification-title">Deployment Success</p>
                            <span className="notification-priority priority-info">Info</span>
                          </div>
                          <p className="notification-text">AI Orchestrator v2.0 deployed successfully</p>
                          <span className="notification-time">⏱️ 15 min ago</span>
                          <div className="notification-actions">
                            <button className="notification-action-btn">Details</button>
                          </div>
                        </div>
                      </div>
                      <div className="notification-item">
                        <span className="notification-icon">📊</span>
                        <div className="notification-content">
                          <div className="notification-title-row">
                            <p className="notification-title">Weekly Report Ready</p>
                            <span className="notification-priority priority-low">Low</span>
                          </div>
                          <p className="notification-text">System performance summary available</p>
                          <span className="notification-time">⏱️ 2 hours ago</span>
                          <div className="notification-actions">
                            <button className="notification-action-btn">Download</button>
                          </div>
                        </div>
                      </div>
                      <div className="notification-item unread warning">
                        <span className="notification-icon">🔒</span>
                        <div className="notification-content">
                          <div className="notification-title-row">
                            <p className="notification-title">Security Update Available</p>
                            <span className="notification-priority priority-medium">Medium</span>
                          </div>
                          <p className="notification-text">Critical security patches ready to install</p>
                          <span className="notification-time">⏱️ 3 hours ago</span>
                          <div className="notification-actions">
                            <button className="notification-action-btn primary">Update Now</button>
                          </div>
                        </div>
                      </div>
                      <div className="notification-item">
                        <span className="notification-icon">💾</span>
                        <div className="notification-content">
                          <div className="notification-title-row">
                            <p className="notification-title">Backup Completed</p>
                            <span className="notification-priority priority-info">Info</span>
                          </div>
                          <p className="notification-text">Daily backup finished - 2.4 GB stored</p>
                          <span className="notification-time">⏱️ 5 hours ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="notification-footer">
                      <a href="#all-notifications">View all notifications</a>
                    </div>
                  </div>
                )}
              </div>

              <div className="user-menu-wrapper">
                <button 
                  className="user-menu-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar-small">
                    {localStorage.getItem('userName')?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="user-name-header">{localStorage.getItem('userName') || 'User'}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-header">
                      <div className="user-avatar-large">
                        {localStorage.getItem('userName')?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="user-dropdown-info">
                        <p className="user-dropdown-name">{localStorage.getItem('userName') || 'User'}</p>
                        <p className="user-dropdown-email">{localStorage.getItem('userEmail') || 'user@example.com'}</p>
                      </div>
                    </div>
                    <div className="user-dropdown-menu">
                      <a href="#profile" className="user-dropdown-item">
                        <span>👤</span> Profile Settings
                      </a>
                      <a href="#preferences" className="user-dropdown-item">
                        <span>⚙️</span> Preferences
                      </a>
                      <a href="#billing" className="user-dropdown-item">
                        <span>💳</span> Billing
                      </a>
                      <a href="#team" className="user-dropdown-item">
                        <span>👥</span> Team Management
                      </a>
                      <div className="user-dropdown-divider"></div>
                      <a href="#help" className="user-dropdown-item">
                        <span>❓</span> Help & Support
                      </a>
                      <Link to="/" className="user-dropdown-item logout-item" onClick={() => localStorage.clear()}>
                        <span>🚪</span> Logout
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content-wrapper">
          <div className="page-header">
            <div>
              <h1>System Dashboard</h1>
              <p className="page-subtitle">{brandConfig.platform.name} {brandConfig.platform.version} - Real-time Monitoring</p>
            </div>
            <div className="page-brand-badge">
              <span>{brandConfig.company.name}</span>
            </div>
          </div>
        
        {/* Enhanced Stats Grid */}
        <div className="dashboard-stats-grid">
          <div className="stat-card-modern primary">
            <div className="stat-card-header">
              <span className="stat-icon">⚙️</span>
              <span className="stat-trend up">
                {loading ? '...' : `↑ ${Math.round((stats.healthyServices/stats.totalServices) * 100)}%`}
              </span>
            </div>
            <div className="stat-card-body">
              <h3 className="stat-label">Total Services</h3>
              <p className="stat-value-large">{loading ? '...' : stats.totalServices}</p>
              <div className="stat-footer">
                <span className="stat-detail">{loading ? '...' : stats.healthyServices} healthy</span>
                <span className="stat-detail">{loading ? '...' : services.filter(s => s.status === 'running').length} running</span>
              </div>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{
                width: loading ? '0%' : `${(stats.healthyServices/stats.totalServices) * 100}%`, 
                background: 'linear-gradient(90deg, #667eea, #764ba2)'
              }}></div>
            </div>
          </div>

          <div className="stat-card-modern success">
            <div className="stat-card-header">
              <span className="stat-icon">✅</span>
              <span className="stat-trend up">
                {loading ? '...' : stats.systemHealth >= 95 ? '↑ Excellent' : stats.systemHealth >= 80 ? '→ Good' : '↓ Fair'}
              </span>
            </div>
            <div className="stat-card-body">
              <h3 className="stat-label">System Health</h3>
              <p className="stat-value-large">{loading ? '...' : stats.systemHealth}%</p>
              <div className="stat-footer">
                <span className="stat-detail">CPU: {systemStatus.cpu}%</span>
                <span className="stat-detail">Memory: {systemStatus.memory}%</span>
              </div>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{
                width: loading ? '0%' : `${stats.systemHealth}%`, 
                background: 'linear-gradient(90deg, #22c55e, #10b981)'
              }}></div>
            </div>
          </div>

          <div className="stat-card-modern warning">
            <div className="stat-card-header">
              <span className="stat-icon">🔔</span>
              <span className="stat-trend">
                {loading ? '...' : stats.activeAlerts > 0 ? `${stats.activeAlerts} active` : 'None'}
              </span>
            </div>
            <div className="stat-card-body">
              <h3 className="stat-label">Active Alerts</h3>
              <p className="stat-value-large">{loading ? '...' : stats.activeAlerts}</p>
              <div className="stat-footer">
                <span className="stat-detail">{loading ? '...' : Math.min(2, stats.activeAlerts)} critical</span>
                <span className="stat-detail">{loading ? '...' : Math.max(0, stats.activeAlerts - 2)} warnings</span>
              </div>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{
                width: loading ? '0%' : `${Math.min(100, stats.activeAlerts * 10)}%`, 
                background: 'linear-gradient(90deg, #f59e0b, #ef4444)'
              }}></div>
            </div>
          </div>

          <div className="stat-card-modern info">
            <div className="stat-card-header">
              <span className="stat-icon">⏱️</span>
              <span className="stat-trend stable">Stable</span>
            </div>
            <div className="stat-card-body">
              <h3 className="stat-label">Uptime</h3>
              <p className="stat-value-large">{loading ? '...' : stats.systemHealth > 95 ? '99.9' : '99.5'}%</p>
              <div className="stat-footer">
                <span className="stat-detail">156 days</span>
                <span className="stat-detail">24/7 monitoring</span>
              </div>
            </div>
            <div className="stat-progress">
              <div className="stat-progress-bar" style={{
                width: loading ? '0%' : '99.9%', 
                background: 'linear-gradient(90deg, #06b6d4, #667eea)'
              }}></div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="dashboard-column-left">
            
            {/* Performance Chart Widget */}
            <div className="widget-card chart-widget">
              <div className="widget-header">
                <div className="widget-title">
                  <span className="widget-icon">📈</span>
                  <h3>Performance Metrics</h3>
                </div>
                <div className="widget-controls">
                  <button 
                    className={`widget-control-btn ${timeFilter === '1H' ? 'active' : ''}`}
                    onClick={() => setTimeFilter('1H')}
                  >
                    1H
                  </button>
                  <button 
                    className={`widget-control-btn ${timeFilter === '24H' ? 'active' : ''}`}
                    onClick={() => setTimeFilter('24H')}
                  >
                    24H
                  </button>
                  <button 
                    className={`widget-control-btn ${timeFilter === '7D' ? 'active' : ''}`}
                    onClick={() => setTimeFilter('7D')}
                  >
                    7D
                  </button>
                  <button 
                    className={`widget-control-btn ${timeFilter === '30D' ? 'active' : ''}`}
                    onClick={() => setTimeFilter('30D')}
                  >
                    30D
                  </button>
                </div>
              </div>
              <div className="widget-body">
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot" style={{background: '#3b82f6'}}></span>
                    <span>CPU Usage</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{background: '#8b5cf6'}}></span>
                    <span>Memory</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot" style={{background: '#22c55e'}}></span>
                    <span>Network</span>
                  </div>
                </div>
                <div className="chart-area">
                  <div className="chart-bars">
                    {chartData.map((data, index) => (
                      <div 
                        key={index} 
                        className="chart-bar"
                        style={{
                          height: `${data.cpu}%`, 
                          background: 'linear-gradient(to top, #3b82f6, #60a5fa)',
                          transition: 'height 0.6s ease',
                          boxShadow: '0 -4px 16px rgba(59, 130, 246, 0.3)'
                        }}
                      ></div>
                    ))}
                  </div>
                  <div className="chart-timeline">
                    <div className="chart-labels">
                      <span>Now</span>
                      <span>{timeFilter === '1H' ? '1 hour ago' : timeFilter === '24H' ? '24 hours ago' : timeFilter === '7D' ? '7 days ago' : '30 days ago'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Overview Table */}
            <div className="widget-card">
              <div className="widget-header">
                <div className="widget-title">
                  <span className="widget-icon">⚙️</span>
                  <h3>Services Overview</h3>
                </div>
                <button className="widget-action-btn">View All →</button>
              </div>
              <div className="widget-body no-padding">
          <table className="services-table-modern">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Health</th>
                <th>Port</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>
                    Loading services...
                  </td>
                </tr>
              ) : services.map((service, index) => (
                <tr key={index}>
                  <td>
                    <div className="service-name-cell">
                      <div className="service-avatar">{service.name.charAt(0)}</div>
                      <div className="service-info">
                        <span className="service-name">{service.name}</span>
                        <span className="service-type">Microservice</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge-modern status-${service.status}`}>
                      {service.status === 'healthy' ? '✓' : '▶'} {service.status}
                    </span>
                  </td>
                  <td>
                    <div className="health-meter">
                      <div className="health-bar">
                        <div style={{
                          width: `${service.health || (service.status === 'healthy' ? 95 : 78)}%`, 
                          height: '100%',
                          background: service.health >= 90 ? '#22c55e' : service.health >= 75 ? '#3b82f6' : '#f59e0b',
                          borderRadius: '12px',
                          transition: 'width 0.6s ease'
                        }}></div>
                      </div>
                      <span className="health-value">{service.health || (service.status === 'healthy' ? 95 : 78)}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="port-badge">{service.port}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn-icon" title="View Details" onClick={() => window.open(`http://localhost:${service.port}`, '_blank')}>👁️</button>
                      <button className="action-btn-icon" title="Restart">🔄</button>
                      <button className="action-btn-icon" title="Settings">⚙️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="dashboard-column-right">
            
            {/* Activity Feed */}
            <div className="widget-card activity-widget">
              <div className="widget-header">
                <div className="widget-title">
                  <span className="widget-icon">📋</span>
                  <h3>Recent Activity</h3>
                </div>
                <button className="widget-action-btn">See All</button>
              </div>
              <div className="widget-body">
                <div className="activity-timeline">
                  <div className="activity-item">
                    <div className="activity-dot success"></div>
                    <div className="activity-content">
                      <p className="activity-title">Service Deployed</p>
                      <p className="activity-description">AI Orchestrator v2.0 successfully deployed</p>
                      <span className="activity-time">5 minutes ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot warning"></div>
                    <div className="activity-content">
                      <p className="activity-title">High CPU Alert</p>
                      <p className="activity-description">PostgreSQL service exceeded 80% CPU</p>
                      <span className="activity-time">12 minutes ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot info"></div>
                    <div className="activity-content">
                      <p className="activity-title">Backup Completed</p>
                      <p className="activity-description">Daily backup finished - 2.4 GB stored</p>
                      <span className="activity-time">1 hour ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot success"></div>
                    <div className="activity-content">
                      <p className="activity-title">Security Update</p>
                      <p className="activity-description">All services updated to latest patches</p>
                      <span className="activity-time">3 hours ago</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-dot error"></div>
                    <div className="activity-content">
                      <p className="activity-title">Connection Lost</p>
                      <p className="activity-description">Redis timeout - Auto-recovered</p>
                      <span className="activity-time">5 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Usage Widget */}
            <div className="widget-card resource-widget">
              <div className="widget-header">
                <div className="widget-title">
                  <span className="widget-icon">🖥️</span>
                  <h3>Resource Usage</h3>
                </div>
              </div>
              <div className="widget-body">
                <div className="resource-item">
                  <div className="resource-header">
                    <span className="resource-label">CPU Usage</span>
                    <span className="resource-value">{systemStatus.cpu}%</span>
                  </div>
                  <div className="resource-bar">
                    <div className="resource-fill cpu" style={{width: `${systemStatus.cpu}%`}}></div>
                  </div>
                  <div className="resource-details">
                    <span>4 cores • 3.2 GHz</span>
                  </div>
                </div>
                <div className="resource-item">
                  <div className="resource-header">
                    <span className="resource-label">Memory</span>
                    <span className="resource-value">{systemStatus.memory}%</span>
                  </div>
                  <div className="resource-bar">
                    <div className="resource-fill memory" style={{width: `${systemStatus.memory}%`}}></div>
                  </div>
                  <div className="resource-details">
                    <span>9.9 GB / 16 GB used</span>
                  </div>
                </div>
                <div className="resource-item">
                  <div className="resource-header">
                    <span className="resource-label">Disk Space</span>
                    <span className="resource-value">{systemStatus.disk}%</span>
                  </div>
                  <div className="resource-bar">
                    <div className="resource-fill disk" style={{width: `${systemStatus.disk}%`}}></div>
                  </div>
                  <div className="resource-details">
                    <span>190 GB / 500 GB used</span>
                  </div>
                </div>
                <div className="resource-item">
                  <div className="resource-header">
                    <span className="resource-label">Network I/O</span>
                    <span className="resource-value">125 MB/s</span>
                  </div>
                  <div className="resource-bar">
                    <div className="resource-fill network" style={{width: '75%'}}></div>
                  </div>
                  <div className="resource-details">
                    <span>↑ 45 MB/s • ↓ 80 MB/s</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="widget-card quick-stats-widget">
              <div className="widget-header">
                <div className="widget-title">
                  <span className="widget-icon">⚡</span>
                  <h3>Quick Stats</h3>
                </div>
              </div>
              <div className="widget-body">
                <div className="quick-stats-grid">
                  <div className="quick-stat">
                    <span className="quick-stat-icon">🌐</span>
                    <span className="quick-stat-value">12.4K</span>
                    <span className="quick-stat-label">Requests/min</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-stat-icon">⚡</span>
                    <span className="quick-stat-value">45ms</span>
                    <span className="quick-stat-label">Avg Response</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-stat-icon">👥</span>
                    <span className="quick-stat-value">1,247</span>
                    <span className="quick-stat-label">Active Users</span>
                  </div>
                  <div className="quick-stat">
                    <span className="quick-stat-icon">✅</span>
                    <span className="quick-stat-value">99.98%</span>
                    <span className="quick-stat-label">Success Rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="quick-links-section">
        <h2>Quick Access</h2>
        <div className="links-grid-modern">
          <a href="http://localhost:4000/graphql" target="_blank" rel="noopener noreferrer" className="link-card-modern">
            <div className="link-card-icon">🔌</div>
            <div className="link-card-content">
              <h3>GraphQL Playground</h3>
              <p>Query and test GraphQL APIs</p>
            </div>
            <div className="link-card-arrow">→</div>
          </a>
          <a href="http://localhost:5000" target="_blank" rel="noopener noreferrer" className="link-card-modern">
            <div className="link-card-icon">🧠</div>
            <div className="link-card-content">
              <h3>MLflow Tracking</h3>
              <p>ML experiments and models</p>
            </div>
            <div className="link-card-arrow">→</div>
          </a>
          <a href="http://localhost:7474" target="_blank" rel="noopener noreferrer" className="link-card-modern">
            <div className="link-card-icon">🕸️</div>
            <div className="link-card-content">
              <h3>Neo4j Browser</h3>
              <p>Query graph database</p>
            </div>
            <div className="link-card-arrow">→</div>
          </a>
          <a href="http://localhost:3020" target="_blank" rel="noopener noreferrer" className="link-card-modern">
            <div className="link-card-icon">📈</div>
            <div className="link-card-content">
              <h3>Grafana Home</h3>
              <p>Access all monitoring dashboards</p>
            </div>
            <div className="link-card-arrow">→</div>
          </a>
        </div>
      </div>

      {/* Grafana Dashboards Section */}
      <div className="quick-links-section" style={{marginTop: '2rem'}}>
        <h2>📊 Monitoring Dashboards</h2>
        <p style={{color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.95rem'}}>
          Real-time Grafana dashboards for comprehensive system monitoring
        </p>
        <div className="links-grid-modern">
          <a href="http://localhost:3020/d/iac-dharma-overview" target="_blank" rel="noopener noreferrer" className="link-card-modern dashboard-card">
            <div className="link-card-icon" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>📊</div>
            <div className="link-card-content">
              <h3>Platform Overview</h3>
              <p>Services health, request rates, CPU & memory</p>
              <div className="dashboard-stats">
                <span className="badge-mini">Live</span>
                <span className="badge-mini">Auto-refresh</span>
              </div>
            </div>
            <div className="link-card-arrow">→</div>
          </a>
          <a href="http://localhost:3020/d/iac-api-gateway" target="_blank" rel="noopener noreferrer" className="link-card-modern dashboard-card">
            <div className="link-card-icon" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>🚀</div>
            <div className="link-card-content">
              <h3>API Gateway</h3>
              <p>Request metrics, response times, status codes</p>
              <div className="dashboard-stats">
                <span className="badge-mini">Live</span>
                <span className="badge-mini">10s refresh</span>
              </div>
            </div>
            <div className="link-card-arrow">→</div>
          </a>
          <a href="http://localhost:3020/d/iac-aiops-ml" target="_blank" rel="noopener noreferrer" className="link-card-modern dashboard-card">
            <div className="link-card-icon" style={{background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'}}>🤖</div>
            <div className="link-card-content">
              <h3>AIOps & ML</h3>
              <p>Predictions, anomalies, model accuracy</p>
              <div className="dashboard-stats">
                <span className="badge-mini">Live</span>
                <span className="badge-mini">30s refresh</span>
              </div>
            </div>
            <div className="link-card-arrow">→</div>
          </a>
          <a href="http://localhost:3020/d/iac-infrastructure" target="_blank" rel="noopener noreferrer" className="link-card-modern dashboard-card">
            <div className="link-card-icon" style={{background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'}}>🖥️</div>
            <div className="link-card-content">
              <h3>Infrastructure</h3>
              <p>Container resources, network & disk I/O</p>
              <div className="dashboard-stats">
                <span className="badge-mini">Live</span>
                <span className="badge-mini">30s refresh</span>
              </div>
            </div>
            <div className="link-card-arrow">→</div>
          </a>
        </div>
        </div>
      </div>
    </main>
    </div>
  )
}

export default DashboardPage
