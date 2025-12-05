import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

interface SSOLoginButtonProps {
  provider?: 'saml' | 'google' | 'azuread';
  onSuccess?: (token: string, user: any) => void;
  onError?: (error: string) => void;
}

export const SSOLoginButton: React.FC<SSOLoginButtonProps> = ({
  provider = 'saml',
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);

  const handleSSOLogin = async () => {
    setLoading(true);
    try {
      if (provider === 'saml') {
        // Redirect to SAML login
        window.location.href = `${API_URL}/auth/saml/login`;
      } else if (provider === 'google') {
        // Redirect to Google OAuth
        window.location.href = `${API_URL}/auth/oauth2/google/login`;
      } else if (provider === 'azuread') {
        // Redirect to Azure AD OAuth
        window.location.href = `${API_URL}/auth/oauth2/azuread/login`;
      }
    } catch (error) {
      console.error('SSO login failed:', error);
      onError?.(error instanceof Error ? error.message : 'SSO login failed');
      setLoading(false);
    }
  };

  const getProviderInfo = () => {
    switch (provider) {
      case 'google':
        return { name: 'Google', icon: '🔍', color: 'bg-red-500 hover:bg-red-600' };
      case 'azuread':
        return { name: 'Microsoft', icon: '🪟', color: 'bg-blue-600 hover:bg-blue-700' };
      default:
        return { name: 'Enterprise SSO', icon: '🔐', color: 'bg-gray-700 hover:bg-gray-800' };
    }
  };

  const providerInfo = getProviderInfo();

  return (
    <button
      onClick={handleSSOLogin}
      disabled={loading}
      className={`
        w-full flex items-center justify-center space-x-3 px-6 py-3 
        ${providerInfo.color} text-white rounded-lg 
        transition-colors duration-200 font-medium
        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span className="text-xl">{providerInfo.icon}</span>
      <span>
        {loading ? 'Redirecting...' : `Sign in with ${providerInfo.name}`}
      </span>
    </button>
  );
};

interface LocalLoginFormProps {
  onSuccess?: (token: string, user: any) => void;
  onError?: (error: string) => void;
}

export const LocalLoginForm: React.FC<LocalLoginFormProps> = ({
  onSuccess,
  onError
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      // Store token
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onSuccess?.(token, user);
    } catch (error: any) {
      console.error('Login failed:', error);
      onError?.(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="admin@iac-dharma.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full px-6 py-3 bg-blue-500 text-white rounded-lg 
          hover:bg-blue-600 transition-colors duration-200 font-medium
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
};

interface SSOLoginPageProps {
  onSuccess?: (token: string, user: any) => void;
}

export const SSOLoginPage: React.FC<SSOLoginPageProps> = ({ onSuccess }) => {
  const [error, setError] = useState<string>('');
  const [showLocalLogin, setShowLocalLogin] = useState(false);

  const handleSuccess = (token: string, user: any) => {
    console.log('Login successful:', user);
    onSuccess?.(token, user);
    // Redirect to dashboard or home
    window.location.href = '/';
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to IAC Dharma
          </h1>
          <p className="text-gray-600">Sign in to manage your infrastructure</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!showLocalLogin ? (
          <>
            {/* SSO Options */}
            <div className="space-y-3">
              <SSOLoginButton
                provider="saml"
                onSuccess={handleSuccess}
                onError={handleError}
              />
              <SSOLoginButton
                provider="google"
                onSuccess={handleSuccess}
                onError={handleError}
              />
              <SSOLoginButton
                provider="azuread"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            <button
              onClick={() => setShowLocalLogin(true)}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Sign in with Email
            </button>
          </>
        ) : (
          <>
            <LocalLoginForm
              onSuccess={handleSuccess}
              onError={handleError}
            />
            <button
              onClick={() => setShowLocalLogin(false)}
              className="w-full mt-4 text-sm text-blue-500 hover:text-blue-600"
            >
              ← Back to SSO options
            </button>
          </>
        )}

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Protected by enterprise-grade authentication</p>
          <p className="mt-1">SAML 2.0 • OAuth2 • JWT</p>
        </div>
      </div>
    </div>
  );
};
