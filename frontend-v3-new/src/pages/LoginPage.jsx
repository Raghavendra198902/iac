import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import brandConfig from '../config/brand'
import Logo from '../components/Logo'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
    mfaEnabled: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Advanced validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Rate limiting simulation
    if (loginAttempts >= 3) {
      setError('Too many login attempts. Please try again in 5 minutes.')
      setLoading(false)
      return
    }

    // Simulate API call with enterprise features
    setTimeout(() => {
      if (formData.password.length < 6) {
        setError('Invalid credentials. Please check your email and password.')
        setLoginAttempts(prev => prev + 1)
        setLoading(false)
        return
      }

      // Simulate MFA check
      if (formData.mfaEnabled) {
        setSuccess('MFA code sent to your device. Please check your authenticator app.')
        setLoading(false)
        // In production, would redirect to MFA verification page
        setTimeout(() => {
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('userEmail', formData.email)
          localStorage.setItem('mfaVerified', 'true')
          navigate('/dashboard')
        }, 2000)
      } else {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('userEmail', formData.email)
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => navigate('/dashboard'), 1000)
      }
    }, 1500)
  }

  const handleSSOLogin = (provider) => {
    setLoading(true)
    setSuccess(`Authenticating with ${provider}...`)
    // Simulate SSO redirect
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('ssoProvider', provider)
      navigate('/dashboard')
    }, 2000)
  }

  const fillDemoUser = (userType) => {
    if (userType === 'admin') {
      setFormData({
        email: 'admin@rrdtech.io',
        password: 'Admin@123456',
        remember: true,
        mfaEnabled: false
      })
    } else if (userType === 'user') {
      setFormData({
        email: 'user@company.com',
        password: 'User@123456',
        remember: false,
        mfaEnabled: false
      })
    } else if (userType === 'enterprise') {
      setFormData({
        email: 'enterprise@acmecorp.com',
        password: 'Enterprise@123456',
        remember: true,
        mfaEnabled: true
      })
    }
    setSuccess('Demo credentials loaded! Click Sign In to continue.')
  }

  return (
    <div className="auth-page">
      <div className="auth-animated-bg"></div>
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-branding">
            <Logo size="large" variant="full" showCompany={true} />
            <h1>{brandConfig.platform.name}</h1>
            <p className="auth-tagline">{brandConfig.company.tagline}</p>
            <p className="auth-description">{brandConfig.platform.description}</p>
            
            <div className="auth-features">
              <div className="auth-feature">
                <span className="feature-icon">🤖</span>
                <span>AI-Powered Automation</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">🔐</span>
                <span>Enterprise-Grade Security</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">📊</span>
                <span>Real-time Analytics</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">⚡</span>
                <span>99.9% Uptime SLA</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">🛡️</span>
                <span>SOC 2 Compliant</span>
              </div>
              <div className="auth-feature">
                <span className="feature-icon">🌐</span>
                <span>Multi-Region Support</span>
              </div>
            </div>
            
            <div className="trust-badges">
              <div className="badge">ISO 27001</div>
              <div className="badge">GDPR</div>
              <div className="badge">SOC 2</div>
              <div className="badge">HIPAA</div>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your infrastructure dashboard</p>
            </div>

            {error && (
              <div className="auth-error">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {success && (
              <div className="auth-success">
                <span className="success-icon">✓</span>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">📧</span>
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    required
                    autoComplete="email"
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="input-with-icon"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <span>Remember me for 30 days</span>
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <div className="form-group-checkbox">
                <label className="checkbox-label advanced-checkbox">
                  <input
                    type="checkbox"
                    name="mfaEnabled"
                    checked={formData.mfaEnabled}
                    onChange={handleChange}
                  />
                  <span>
                    <strong>🔐 Enable Multi-Factor Authentication</strong>
                    <small>Additional security layer recommended for enterprise accounts</small>
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-primary btn-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <span>🔓</span>
                    Sign In Securely
                  </>
                )}
              </button>
            </form>

            <div className="demo-users">
              <p className="demo-title">🚀 Quick Demo Access:</p>
              <div className="demo-buttons">
                <button className="demo-btn demo-admin" onClick={() => fillDemoUser('admin')}>
                  <span className="demo-icon">👨‍💼</span>
                  <span className="demo-info">
                    <strong>Admin</strong>
                    <small>Full access</small>
                  </span>
                </button>
                <button className="demo-btn demo-user" onClick={() => fillDemoUser('user')}>
                  <span className="demo-icon">👤</span>
                  <span className="demo-info">
                    <strong>User</strong>
                    <small>Standard access</small>
                  </span>
                </button>
                <button className="demo-btn demo-enterprise" onClick={() => fillDemoUser('enterprise')}>
                  <span className="demo-icon">🏢</span>
                  <span className="demo-info">
                    <strong>Enterprise</strong>
                    <small>With MFA</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="auth-divider">
              <span>Enterprise SSO Options</span>
            </div>

            <div className="sso-login">
              <button className="sso-btn" onClick={() => handleSSOLogin('Azure AD')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0078D4">
                  <path d="M11.5 2L1 6v4.5c0 6.37 4.41 12.33 10.5 13.75 6.09-1.42 10.5-7.38 10.5-13.75V6l-10.5-4z"/>
                </svg>
                Microsoft Azure AD
              </button>
              <button className="sso-btn" onClick={() => handleSSOLogin('Okta')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#007DC1">
                  <circle cx="12" cy="12" r="11"/>
                </svg>
                Okta
              </button>
              <button className="sso-btn" onClick={() => handleSSOLogin('Google Workspace')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                </svg>
                Google Workspace
              </button>
              <button className="sso-btn" onClick={() => handleSSOLogin('SAML 2.0')}>
                <span style={{fontSize: '1.25rem'}}>🔐</span>
                SAML 2.0
              </button>
            </div>

            <div className="auth-divider">
              <span>or use social login</span>
            </div>

            <div className="social-login">
              <button className="social-btn github-btn" onClick={() => handleSSOLogin('GitHub')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
              <button className="social-btn google-btn" onClick={() => handleSSOLogin('Google')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
            </div>

            <p className="auth-footer">
              Don't have an account? <Link to="/register" className="auth-link">Sign up</Link>
            </p>

            <p className="auth-back">
              <Link to="/" className="back-link">← Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
