import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import brandConfig from '../config/brand'

function HomePage() {
  const [stats, setStats] = useState({
    services: 13,
    deployments: 1247,
    uptime: 99.9,
    models: 12
  })

  const [activeService, setActiveService] = useState(null)
  const [currentMetric, setCurrentMetric] = useState(0)

  const metrics = [
    { label: 'Services Running', value: stats.services, icon: '🚀', color: '#3b82f6' },
    { label: 'Total Deployments', value: stats.deployments, icon: '📦', color: '#8b5cf6' },
    { label: 'System Uptime', value: `${stats.uptime}%`, icon: '⚡', color: '#10b981' },
    { label: 'ML Models Trained', value: stats.models, icon: '🤖', color: '#f59e0b' }
  ]

  const services = [
    { 
      name: 'GraphQL API Gateway', 
      status: 'healthy', 
      port: 4000,
      description: 'Unified API layer with real-time subscriptions',
      metrics: { requests: '1.2K/min', latency: '45ms', uptime: '99.9%' }
    },
    { 
      name: 'AI/ML Platform', 
      status: 'healthy', 
      port: 5000,
      description: '12 trained models with 89.4% accuracy',
      metrics: { predictions: '340/min', accuracy: '89.4%', models: '12' }
    },
    { 
      name: 'Monitoring Stack', 
      status: 'healthy', 
      port: 3020,
      description: 'Grafana dashboards with real-time metrics',
      metrics: { dashboards: '8', alerts: '7', metrics: '2.4K' }
    },
    { 
      name: 'AIOps Engine', 
      status: 'healthy', 
      port: 8100,
      description: 'Intelligent anomaly detection and auto-remediation',
      metrics: { incidents: '23', resolved: '21', mttr: '3.2min' }
    },
    { 
      name: 'CMDB Agent', 
      status: 'healthy', 
      port: 8200,
      description: 'Configuration management database',
      metrics: { assets: '847', changes: '156', compliance: '98%' }
    },
    { 
      name: 'Infrastructure', 
      status: 'healthy', 
      port: 7474,
      description: 'PostgreSQL, Neo4j, Redis, Kafka stack',
      metrics: { nodes: '4', storage: '2.3TB', connections: '1.2K' }
    }
  ]

  const capabilities = [
    {
      title: 'AI-Powered Architecture',
      icon: '🧠',
      description: 'Leverage machine learning to optimize infrastructure design with predictive analytics',
      features: ['12 ML Models', '89.4% Accuracy', 'Real-time Predictions', 'Auto-optimization']
    },
    {
      title: 'Real-time Monitoring',
      icon: '📊',
      description: 'Comprehensive monitoring with Grafana, Prometheus, and custom dashboards',
      features: ['8 Dashboards', '7 Alert Rules', '2.4K Metrics', 'Live Updates']
    },
    {
      title: 'Automated Deployments',
      icon: '🚀',
      description: 'Deploy infrastructure changes with confidence using GitOps workflows',
      features: ['1.2K Deployments', '99.9% Success', 'Zero Downtime', 'Rollback Support']
    },
    {
      title: 'Security & Compliance',
      icon: '🛡️',
      description: 'Built-in security scanning, compliance checking, and audit trails',
      features: ['98% Compliance', 'Auto-remediation', 'Audit Logs', 'Policy Enforcement']
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-advanced">
        <div className="hero-content">
          <div className="hero-brand">
            <Logo size="large" variant="icon" />
          </div>
          <div className="hero-badge">{brandConfig.platform.version} Production Ready</div>
          <h1 className="hero-title">
            <span className="gradient-text">{brandConfig.platform.name}</span>
            <span className="hero-title-sub">{brandConfig.platform.subtitle}</span>
          </h1>
          <p className="hero-subtitle">
            {brandConfig.platform.description}
          </p>
          <p className="hero-description">
            {brandConfig.mission}
          </p>
          <p className="hero-founder">
            <strong>Founded by {brandConfig.company.founder}</strong> • {brandConfig.company.established}
          </p>
          
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              <span>View Dashboard</span>
              <span className="btn-icon">→</span>
            </Link>
            <a href="http://localhost:4000/graphql" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
              <span>GraphQL API</span>
              <span className="btn-icon">↗</span>
            </a>
          </div>

          {/* Live Metrics Carousel */}
          <div className="metrics-carousel">
            {metrics.map((metric, index) => (
              <div 
                key={index} 
                className={`metric-card ${currentMetric === index ? 'active' : ''}`}
                style={{ '--metric-color': metric.color }}
              >
                <span className="metric-icon">{metric.icon}</span>
                <div className="metric-content">
                  <div className="metric-value">{metric.value}</div>
                  <div className="metric-label">{metric.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      <section className="capabilities-section">
        <div className="section-header">
          <h2 className="section-title">Platform Capabilities</h2>
          <p className="section-subtitle">
            Enterprise-grade features designed for modern infrastructure management
          </p>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((capability, index) => (
            <div key={index} className="capability-card">
              <div className="capability-icon">{capability.icon}</div>
              <h3 className="capability-title">{capability.title}</h3>
              <p className="capability-description">{capability.description}</p>
              <ul className="capability-features">
                {capability.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Services Overview */}
      <section className="services-overview">
        <div className="section-header">
          <h2 className="section-title">Active Services</h2>
          <p className="section-subtitle">
            All systems operational - Click any service for details
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div 
              key={index} 
              className={`service-card ${activeService === index ? 'expanded' : ''}`}
              onClick={() => setActiveService(activeService === index ? null : index)}
            >
              <div className="service-header">
                <div className="service-info">
                  <h3 className="service-name">{service.name}</h3>
                  <p className="service-description">{service.description}</p>
                </div>
                <div className="service-status">
                  <span className={`status-dot status-${service.status}`}></span>
                  <span className="status-text">{service.status}</span>
                </div>
              </div>

              {activeService === index && (
                <div className="service-details">
                  <div className="service-metrics">
                    {Object.entries(service.metrics).map(([key, value]) => (
                      <div key={key} className="metric-item">
                        <span className="metric-key">{key}</span>
                        <span className="metric-val">{value}</span>
                      </div>
                    ))}
                  </div>
                  <a 
                    href={`http://localhost:${service.port}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="service-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open Service →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="quick-stats">
        <div className="stat-item">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <div className="stat-number">1,247</div>
            <div className="stat-label">Deployments</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">🤖</div>
          <div className="stat-content">
            <div className="stat-number">12</div>
            <div className="stat-label">ML Models</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">2.4K</div>
            <div className="stat-label">Metrics Tracked</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Infrastructure?</h2>
          <p className="cta-text">
            Get started with IAC DHARMA and experience the power of AI-driven infrastructure management
          </p>
          <div className="cta-actions">
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Explore Dashboard
            </Link>
            <a href="http://localhost:3020" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg">
              View Monitoring
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
