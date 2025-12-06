import { useState } from 'react'
import { Link } from 'react-router-dom'
import brandConfig from '../config/brand'

function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-header">
        <div>
          <h1>About {brandConfig.platform.name}</h1>
          <p className="page-subtitle">Learn more about our platform and mission</p>
        </div>
        <div className="page-brand-badge">
          <span>{brandConfig.company.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h2>Empowering Enterprise Architecture</h2>
          <p className="lead">{brandConfig.mission}</p>
        </div>
      </section>

      {/* Company Info */}
      <section className="about-section">
        <div className="about-grid">
          <div className="about-card">
            <div className="about-card-icon">🏢</div>
            <h3>Our Company</h3>
            <p><strong>{brandConfig.company.fullName}</strong></p>
            <p>{brandConfig.company.tagline}</p>
            <p className="text-muted">Established {brandConfig.company.established}</p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">👤</div>
            <h3>Founder</h3>
            <p><strong>{brandConfig.company.founder}</strong></p>
            <p>Visionary leader in enterprise architecture and AI-driven infrastructure automation</p>
          </div>

          <div className="about-card">
            <div className="about-card-icon">🚀</div>
            <h3>Our Platform</h3>
            <p><strong>{brandConfig.platform.name} {brandConfig.platform.version}</strong></p>
            <p>{brandConfig.platform.description}</p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section">
        <h2 className="section-title">Our Core Values</h2>
        <div className="values-grid">
          {brandConfig.values.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon">✓</div>
              <h4>{value}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Features */}
      <section className="about-section">
        <h2 className="section-title">Platform Capabilities</h2>
        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <div>
              <h4>AI-Powered Orchestration</h4>
              <p>Intelligent automation and decision-making powered by machine learning</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <div>
              <h4>Real-time Monitoring</h4>
              <p>Comprehensive observability with Grafana, Prometheus, and custom dashboards</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔌</span>
            <div>
              <h4>GraphQL API Gateway</h4>
              <p>Modern, efficient API layer with real-time subscriptions</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🗄️</span>
            <div>
              <h4>Configuration Management</h4>
              <p>Centralized CMDB with automated discovery and compliance tracking</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔧</span>
            <div>
              <h4>AIOps Engine</h4>
              <p>Predictive analytics, anomaly detection, and automated remediation</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <div>
              <h4>ML Model Training</h4>
              <p>Continuous learning with MLflow tracking and model versioning</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="about-cta">
        <h2>Ready to Transform Your Infrastructure?</h2>
        <p>Get in touch to learn how {brandConfig.platform.name} can help your organization</p>
        <div className="cta-actions">
          <a href={`mailto:${brandConfig.contact.email}`} className="btn-primary">
            <span>📧</span> Contact Us
          </a>
          <Link to="/dashboard" className="btn-secondary">
            <span>📊</span> View Dashboard
          </Link>
        </div>
      </section>

      {/* Contact Info */}
      <section className="about-contact">
        <div className="contact-grid">
          <div className="contact-item">
            <strong>Email:</strong>
            <a href={`mailto:${brandConfig.contact.email}`}>{brandConfig.contact.email}</a>
          </div>
          <div className="contact-item">
            <strong>Website:</strong>
            <a href={brandConfig.contact.website} target="_blank" rel="noopener noreferrer">
              {brandConfig.contact.website}
            </a>
          </div>
          <div className="contact-item">
            <strong>GitHub:</strong>
            <a href={brandConfig.contact.github} target="_blank" rel="noopener noreferrer">
              View Repository
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
