import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import brandConfig from '../config/brand'
import Logo from '../components/Logo'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    jobTitle: '',
    teamSize: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    subscribeNewsletter: true
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' })

  const calculatePasswordStrength = (password) => {
    let score = 0
    if (!password) return { score: 0, text: '', color: '' }
    
    // Length
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    
    // Complexity
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    
    const levels = [
      { score: 0, text: '', color: '' },
      { score: 1, text: 'Very Weak', color: '#ef4444' },
      { score: 2, text: 'Weak', color: '#f59e0b' },
      { score: 3, text: 'Fair', color: '#eab308' },
      { score: 4, text: 'Good', color: '#84cc16' },
      { score: 5, text: 'Strong', color: '#22c55e' },
      { score: 6, text: 'Very Strong', color: '#10b981' }
    ]
    
    return levels[Math.min(score, 6)]
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Calculate password strength on password change
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Advanced validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    // Name validation
    if (formData.fullName.length < 2) {
      setError('Please enter your full name')
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Password strength validation
    if (passwordStrength.score < 3) {
      setError('Password is too weak. Please use at least 8 characters with uppercase, lowercase, numbers, and symbols.')
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      setLoading(false)
      return
    }

    // Simulate API call with validation
    setTimeout(() => {
      setSuccess('Account created successfully! Setting up your workspace...')
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('userEmail', formData.email)
      localStorage.setItem('userName', formData.fullName)
      localStorage.setItem('userCompany', formData.company)
      
      setTimeout(() => navigate('/dashboard'), 1500)
    }, 2000)
  }

  const handleSSOSignup = (provider) => {
    setLoading(true)
    setSuccess(`Creating account with ${provider}...`)
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('ssoProvider', provider)
      navigate('/dashboard')
    }, 2000)
  }

  const fillDemoRegistration = () => {
    setFormData({
      fullName: 'John Demo User',
      email: 'demo@company.com',
      company: 'Demo Corporation',
      jobTitle: 'DevOps Engineer',
      teamSize: '51-200',
      password: 'Demo@123456',
      confirmPassword: 'Demo@123456',
      agreeToTerms: true,
      subscribeNewsletter: true
    })
    setPasswordStrength(calculatePasswordStrength('Demo@123456'))
    setSuccess('Demo registration data loaded! Review and click Create Account.')
  }

  return (
    <div className="auth-page">
      <div className="auth-animated-bg"></div>
      <div className="auth-container auth-register">
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

            <div className="auth-stats">
              <div className="stat">
                <strong>99.9%</strong>
                <span>Uptime SLA</span>
              </div>
              <div className="stat">
                <strong>1,247</strong>
                <span>Deployments</span>
              </div>
              <div className="stat">
                <strong>2.4K</strong>
                <span>Metrics</span>
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
              <h2>Create Enterprise Account</h2>
              <p>Join {brandConfig.company.name} and transform your infrastructure</p>
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">
                    <span className="label-icon">👤</span>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                    className="input-with-icon"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <span className="label-icon">📧</span>
                    Work Email *
                  </label>
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company">
                    <span className="label-icon">🏢</span>
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Company"
                    autoComplete="organization"
                    className="input-with-icon"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="jobTitle">
                    <span className="label-icon">💼</span>
                    Job Title
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="DevOps Engineer"
                    autoComplete="organization-title"
                    className="input-with-icon"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="teamSize">
                  <span className="label-icon">👥</span>
                  Team Size
                </label>
                <select
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleChange}
                  className="input-with-icon"
                >
                  <option value="">Select team size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501+">501+ employees</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Password *
                </label>
                <div className="input-wrapper password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    required
                    autoComplete="new-password"
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
                {passwordStrength.score > 0 && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className="strength-fill"
                        style={{
                          width: `${(passwordStrength.score / 6) * 100}%`,
                          background: passwordStrength.color
                        }}
                      ></div>
                    </div>
                    <small style={{ color: passwordStrength.color, fontWeight: 600 }}>
                      {passwordStrength.text}
                    </small>
                  </div>
                )}
                <small className="form-hint">
                  Use 8+ characters with uppercase, lowercase, numbers & symbols
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <span className="label-icon">🔐</span>
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  required
                  autoComplete="new-password"
                  className="input-with-icon"
                />
              </div>

              <div className="form-group-checkbox">
                <label className="checkbox-label advanced-checkbox">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                  />
                  <span>
                    I agree to the <a href={brandConfig.contact.terms} target="_blank" rel="noopener noreferrer">Terms of Service</a>, <a href={brandConfig.contact.privacy} target="_blank" rel="noopener noreferrer">Privacy Policy</a> and <a href={brandConfig.contact.security} target="_blank" rel="noopener noreferrer">Security Policy</a>
                  </span>
                </label>
              </div>

              <div className="form-group-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="subscribeNewsletter"
                    checked={formData.subscribeNewsletter}
                    onChange={handleChange}
                  />
                  <span>
                    Send me product updates, best practices, and enterprise insights
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
                    Creating Account...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Create Enterprise Account
                  </>
                )}
              </button>
            </form>

            <div className="demo-users">
              <p className="demo-title">⚡ Quick Demo Registration:</p>
              <div className="demo-buttons demo-single">
                <button className="demo-btn demo-fill" onClick={fillDemoRegistration}>
                  <span className="demo-icon">📝</span>
                  <span className="demo-info">
                    <strong>Auto-Fill Demo Data</strong>
                    <small>Complete form with sample information</small>
                  </span>
                </button>
              </div>
            </div>

            <div className="auth-divider">
              <span>Enterprise SSO Sign Up</span>
            </div>

            <div className="sso-login">
              <button className="sso-btn" onClick={() => handleSSOSignup('Azure AD')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0078D4">
                  <path d="M11.5 2L1 6v4.5c0 6.37 4.41 12.33 10.5 13.75 6.09-1.42 10.5-7.38 10.5-13.75V6l-10.5-4z"/>
                </svg>
                Microsoft Azure AD
              </button>
              <button className="sso-btn" onClick={() => handleSSOSignup('Okta')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#007DC1">
                  <circle cx="12" cy="12" r="11"/>
                </svg>
                Okta
              </button>
              <button className="sso-btn" onClick={() => handleSSOSignup('Google Workspace')}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                </svg>
                Google Workspace
              </button>
              <button className="sso-btn" onClick={() => handleSSOSignup('SAML 2.0')}>
                <span style={{fontSize: '1.25rem'}}>🔐</span>
                SAML 2.0
              </button>
            </div>

            <div className="auth-divider">
              <span>or use social sign up</span>
            </div>

            <div className="social-login">
              <button className="social-btn github-btn" onClick={() => handleSSOSignup('GitHub')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub
              </button>
              <button className="social-btn google-btn" onClick={() => handleSSOSignup('Google')}>
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
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
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

export default RegisterPage
