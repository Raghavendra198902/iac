import { Link } from 'react-router-dom'
import brandConfig from '../config/brand'

function ServicesPage() {
  const services = [
    {
      name: 'GraphQL API Gateway',
      icon: '🔌',
      port: 4000,
      description: 'Unified API layer providing a single endpoint for all backend services with real-time subscriptions and efficient data fetching.',
      features: ['Real-time Subscriptions', 'Query Optimization', 'Authentication & Authorization', 'Schema Stitching'],
      status: 'Production Ready'
    },
    {
      name: 'AI/ML Engine',
      icon: '🤖',
      port: 5000,
      description: 'Advanced machine learning capabilities with MLflow integration for model training, versioning, and deployment.',
      features: ['12 Trained Models', '89.4% Accuracy', 'Auto-scaling', 'Model Versioning'],
      status: 'Production Ready'
    },
    {
      name: 'Monitoring & Observability',
      icon: '📈',
      port: 3020,
      description: 'Comprehensive monitoring solution with Grafana dashboards, Prometheus metrics, and custom alerting.',
      features: ['8 Dashboards', '2.4K Metrics', '7 Alert Rules', 'Real-time Alerts'],
      status: 'Active'
    },
    {
      name: 'AIOps Engine',
      icon: '🔧',
      port: 8010,
      description: 'Intelligent operations with predictive analytics, anomaly detection, and automated incident remediation.',
      features: ['Anomaly Detection', 'Auto-remediation', 'Predictive Analytics', 'MTTR 3.2min'],
      status: 'Active'
    },
    {
      name: 'CMDB Agent',
      icon: '🗄️',
      port: 8020,
      description: 'Configuration Management Database with automated discovery, compliance tracking, and asset management.',
      features: ['847 Assets', '98% Compliance', 'Auto-discovery', 'Relationship Mapping'],
      status: 'Active'
    },
    {
      name: 'AI Recommendations',
      icon: '💡',
      port: 5001,
      description: 'Intelligent recommendation engine providing optimization suggestions and best practices.',
      features: ['Resource Optimization', 'Cost Analysis', 'Performance Tuning', 'Security Recommendations'],
      status: 'Active'
    },
    {
      name: 'Infrastructure Management',
      icon: '🏗️',
      port: 8030,
      description: 'Complete infrastructure lifecycle management with automated provisioning and scaling.',
      features: ['4 Active Nodes', '2.3TB Storage', 'Auto-scaling', 'Load Balancing'],
      status: 'Active'
    },
    {
      name: 'PostgreSQL Database',
      icon: '🐘',
      port: 5433,
      description: 'Primary relational database for structured data storage and complex queries.',
      features: ['High Availability', 'Automated Backups', 'Connection Pooling', 'Query Optimization'],
      status: 'Healthy'
    },
    {
      name: 'Neo4j Graph Database',
      icon: '🕸️',
      port: 7474,
      description: 'Graph database for relationship mapping and complex network analysis.',
      features: ['Graph Analytics', 'Relationship Queries', 'Visual Browser', 'Cypher Query Language'],
      status: 'Healthy'
    },
    {
      name: 'Redis Cache',
      icon: '⚡',
      port: 6380,
      description: 'In-memory data store for caching and real-time data processing.',
      features: ['Sub-ms Latency', 'Pub/Sub', 'Session Store', 'Rate Limiting'],
      status: 'Healthy'
    },
    {
      name: 'Apache Kafka',
      icon: '📨',
      port: 9093,
      description: 'Distributed event streaming platform for real-time data pipelines.',
      features: ['Event Streaming', 'Message Queue', 'High Throughput', 'Fault Tolerance'],
      status: 'Running'
    },
    {
      name: 'Blueprint Service',
      icon: '📋',
      port: 8040,
      description: 'Infrastructure templates and architecture blueprints management.',
      features: ['Template Library', 'Version Control', 'Validation', 'Deployment Automation'],
      status: 'Active'
    },
    {
      name: 'Workflow Engine',
      icon: '🔄',
      port: 8050,
      description: 'Orchestrate complex workflows and automated processes.',
      features: ['Visual Designer', 'Conditional Logic', 'Error Handling', 'Audit Trail'],
      status: 'Active'
    }
  ]

  return (
    <div className="services-page">
      <div className="page-header">
        <div>
          <h1>Platform Services</h1>
          <p className="page-subtitle">Complete overview of {brandConfig.platform.name} microservices architecture</p>
        </div>
        <div className="page-brand-badge">
          <span>{services.length} Services</span>
        </div>
      </div>

      <div className="services-intro">
        <p className="lead">
          {brandConfig.platform.name} is built on a modern microservices architecture, 
          providing scalable, resilient, and maintainable enterprise infrastructure management.
        </p>
      </div>

      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-detail-card">
            <div className="service-detail-header">
              <span className="service-detail-icon">{service.icon}</span>
              <div>
                <h3>{service.name}</h3>
                <span className={`service-status-badge status-${service.status.toLowerCase().replace(' ', '-')}`}>
                  {service.status}
                </span>
              </div>
            </div>
            
            <p className="service-description">{service.description}</p>
            
            <div className="service-features">
              <h4>Key Features:</h4>
              <ul>
                {service.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="service-detail-footer">
              <span className="service-port">Port: {service.port}</span>
              <a 
                href={`http://localhost:${service.port}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="service-link"
              >
                Open Service →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="services-cta">
        <h2>Want to see it in action?</h2>
        <p>Explore the live dashboard to monitor all services in real-time</p>
        <Link to="/dashboard" className="btn-primary">
          <span>📊</span> View Dashboard
        </Link>
      </div>
    </div>
  )
}

export default ServicesPage
