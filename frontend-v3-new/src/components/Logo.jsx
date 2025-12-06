import React from 'react';
import brandConfig from '../config/brand';

const Logo = ({ size = 'medium', variant = 'full', showCompany = false }) => {
  const sizes = {
    small: { width: 32, height: 32, fontSize: '14px' },
    medium: { width: 48, height: 48, fontSize: '20px' },
    large: { width: 64, height: 64, fontSize: '28px' },
  };

  const { width, height, fontSize } = sizes[size];

  if (variant === 'icon') {
    return (
      <div className="logo-icon" style={{ width, height }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={brandConfig.colors.primary} />
              <stop offset="100%" stopColor={brandConfig.colors.secondary} />
            </linearGradient>
          </defs>
          {/* RRD Letters */}
          <text x="50" y="55" fontSize="36" fontWeight="bold" fill="url(#logoGradient)" 
                textAnchor="middle" fontFamily="Arial, sans-serif">RRD</text>
          
          {/* Dharma Wheel */}
          <circle cx="50" cy="50" r="40" stroke="url(#logoGradient)" strokeWidth="3" fill="none" opacity="0.3"/>
          <circle cx="50" cy="50" r="4" fill="url(#logoGradient)"/>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line 
              key={i}
              x1="50" 
              y1="50" 
              x2={50 + 35 * Math.cos((angle - 90) * Math.PI / 180)} 
              y2={50 + 35 * Math.sin((angle - 90) * Math.PI / 180)}
              stroke="url(#logoGradient)" 
              strokeWidth="2"
              opacity="0.4"
            />
          ))}
          
          {/* Infrastructure nodes at corners */}
          <circle cx="20" cy="85" r="3" fill={brandConfig.colors.accent} opacity="0.8"/>
          <circle cx="50" cy="85" r="3" fill={brandConfig.colors.accent} opacity="0.8"/>
          <circle cx="80" cy="85" r="3" fill={brandConfig.colors.accent} opacity="0.8"/>
          <line x1="20" y1="85" x2="50" y2="85" stroke={brandConfig.colors.accent} strokeWidth="1.5" opacity="0.6"/>
          <line x1="50" y1="85" x2="80" y2="85" stroke={brandConfig.colors.accent} strokeWidth="1.5" opacity="0.6"/>
        </svg>
      </div>
    );
  }

  return (
    <div className="logo-full" style={{ fontSize }}>
      <div className="logo-icon" style={{ width, height }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={brandConfig.colors.primary} />
              <stop offset="100%" stopColor={brandConfig.colors.secondary} />
            </linearGradient>
          </defs>
          <text x="50" y="55" fontSize="36" fontWeight="bold" fill="url(#logoGradient)" 
                textAnchor="middle" fontFamily="Arial, sans-serif">RRD</text>
          <circle cx="50" cy="50" r="40" stroke="url(#logoGradient)" strokeWidth="3" fill="none" opacity="0.3"/>
          <circle cx="50" cy="50" r="4" fill="url(#logoGradient)"/>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line 
              key={i}
              x1="50" 
              y1="50" 
              x2={50 + 35 * Math.cos((angle - 90) * Math.PI / 180)} 
              y2={50 + 35 * Math.sin((angle - 90) * Math.PI / 180)}
              stroke="url(#logoGradient)" 
              strokeWidth="2"
              opacity="0.4"
            />
          ))}
          <circle cx="20" cy="85" r="3" fill={brandConfig.colors.accent} opacity="0.8"/>
          <circle cx="50" cy="85" r="3" fill={brandConfig.colors.accent} opacity="0.8"/>
          <circle cx="80" cy="85" r="3" fill={brandConfig.colors.accent} opacity="0.8"/>
          <line x1="20" y1="85" x2="50" y2="85" stroke={brandConfig.colors.accent} strokeWidth="1.5" opacity="0.6"/>
          <line x1="50" y1="85" x2="80" y2="85" stroke={brandConfig.colors.accent} strokeWidth="1.5" opacity="0.6"/>
        </svg>
      </div>
      <div className="logo-text">
        {showCompany ? (
          <>
            <span className="logo-company">{brandConfig.company.name}</span>
            <span className="logo-tagline">{brandConfig.company.tagline}</span>
          </>
        ) : (
          <>
            <span className="logo-brand">{brandConfig.platform.name}</span>
            <span className="logo-tagline">{brandConfig.platform.subtitle}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Logo;
