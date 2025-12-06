import { Link } from 'react-router-dom'
import brandConfig from '../config/brand'

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-icon">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" stroke={brandConfig.colors.primary} strokeWidth="4" opacity="0.3"/>
            <text x="60" y="75" fontSize="48" fontWeight="bold" fill={brandConfig.colors.primary} textAnchor="middle">404</text>
          </svg>
        </div>
        <h1>Page Not Found</h1>
        <p className="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className="not-found-help">
          Looking for something? Try starting from the home page or check out our services.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            <span>🏠</span> Go Home
          </Link>
          <Link to="/dashboard" className="btn-secondary">
            <span>📊</span> Dashboard
          </Link>
        </div>
        <div className="not-found-footer">
          <p>{brandConfig.company.name} • {brandConfig.platform.name}</p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
