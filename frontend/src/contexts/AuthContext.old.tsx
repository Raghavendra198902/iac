import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Role definitions matching backend
export type UserRole = 'EA' | 'SA' | 'TA' | 'PM' | 'SE' | 'Consultant' | 'Admin';

// Permission structure
export interface Permission {
  resource: string;  // 'blueprint', 'deployment', 'costing', etc.
  action: string;    // 'create', 'read', 'update', 'delete', 'approve'
  scope: string;     // 'own', 'team', 'project', 'tenant'
}

// User profile
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
  tenantId: string;
  permissions: Permission[];
  preferences?: Record<string, any>;
}

// Auth state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Auth context type
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  hasPermission: (resource: string, action: string, scope?: string) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  EA: [
    { resource: 'blueprint', action: 'approve', scope: 'tenant' },
    { resource: 'policy', action: 'create', scope: 'tenant' },
    { resource: 'pattern', action: 'create', scope: 'tenant' },
    { resource: 'project', action: 'create', scope: 'tenant' },
    { resource: 'governance', action: 'manage', scope: 'tenant' },
    { resource: 'compliance', action: 'view', scope: 'tenant' },
  ],
  SA: [
    { resource: 'blueprint', action: 'create', scope: 'project' },
    { resource: 'blueprint', action: 'update', scope: 'own' },
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'costing', action: 'view', scope: 'project' },
    { resource: 'pattern', action: 'use', scope: 'tenant' },
    { resource: 'ai', action: 'generate', scope: 'project' },
  ],
  TA: [
    { resource: 'blueprint', action: 'update', scope: 'project' },
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'iac', action: 'generate', scope: 'project' },
    { resource: 'iac', action: 'validate', scope: 'project' },
    { resource: 'guardrails', action: 'override', scope: 'own' },
    { resource: 'deployment', action: 'plan', scope: 'project' },
  ],
  PM: [
    { resource: 'deployment', action: 'approve', scope: 'project' },
    { resource: 'costing', action: 'view', scope: 'project' },
    { resource: 'costing', action: 'approve', scope: 'project' },
    { resource: 'migration', action: 'schedule', scope: 'project' },
    { resource: 'project', action: 'manage', scope: 'own' },
    { resource: 'kpi', action: 'view', scope: 'project' },
  ],
  SE: [
    { resource: 'deployment', action: 'execute', scope: 'assigned' },
    { resource: 'deployment', action: 'view', scope: 'project' },
    { resource: 'monitoring', action: 'view', scope: 'project' },
    { resource: 'incident', action: 'create', scope: 'project' },
    { resource: 'logs', action: 'view', scope: 'project' },
  ],
  Consultant: [
    { resource: 'blueprint', action: 'create', scope: 'project' },
    { resource: 'blueprint', action: 'read', scope: 'project' },
    { resource: 'costing', action: 'view', scope: 'project' },
    { resource: 'proposal', action: 'generate', scope: 'project' },
  ],
  Admin: [
    { resource: '*', action: '*', scope: 'tenant' },
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr) as User;
          
          // Validate token with backend (optional)
          // const isValid = await validateToken(token);
          // if (!isValid) throw new Error('Invalid token');

          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // Use real API in production, fall back to demo mode if API unavailable
      const useDemoMode = import.meta.env.VITE_USE_DEMO_AUTH === 'true';
      
      if (!useDemoMode) {
        // Real API authentication
        try {
          const { authApi } = await import('../services/api.service');
          const response: any = await authApi.login(email, password);
          
          const { token, user: apiUser } = response;
          
          // Merge permissions from roles
          const permissions: Permission[] = [];
          apiUser.roles?.forEach((role: UserRole) => {
            permissions.push(...(ROLE_PERMISSIONS[role] || []));
          });

          const enrichedUser: User = {
            id: apiUser.id,
            email: apiUser.email,
            firstName: apiUser.firstName,
            lastName: apiUser.lastName,
            roles: apiUser.roles || [],
            tenantId: apiUser.tenantId,
            permissions,
            preferences: apiUser.preferences || {},
          };

          // Save to localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('user', JSON.stringify(enrichedUser));

          setAuthState({
            user: enrichedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Navigate to dashboard
          navigate('/dashboard');
          return;
        } catch (apiError) {
          console.error('API authentication failed, falling back to demo mode:', apiError);
          // Continue to demo mode fallback
        }
      }
      
      // Demo mode fallback
      const demoUsers = [
        { email: 'ea@demo.com', firstName: 'Emma', lastName: 'Anderson', roles: ['EA' as UserRole] },
        { email: 'sa@demo.com', firstName: 'Sam', lastName: 'Taylor', roles: ['SA' as UserRole] },
        { email: 'ta@demo.com', firstName: 'Tom', lastName: 'Harris', roles: ['TA' as UserRole] },
        { email: 'pm@demo.com', firstName: 'Patricia', lastName: 'Martinez', roles: ['PM' as UserRole] },
        { email: 'se@demo.com', firstName: 'Steve', lastName: 'Evans', roles: ['SE' as UserRole] },
        { email: 'consultant@demo.com', firstName: 'Chris', lastName: 'Lee', roles: ['Consultant' as UserRole] },
        { email: 'admin@demo.com', firstName: 'Alice', lastName: 'Brown', roles: ['Admin' as UserRole] },
      ];

      const demoUser = demoUsers.find(u => u.email === email);
      
      if (!demoUser || password !== 'demo123') {
        throw new Error('Invalid email or password');
      }

      const mockToken = btoa(`${email}:${Date.now()}`);
      
      const permissions: Permission[] = [];
      demoUser.roles.forEach((role: UserRole) => {
        permissions.push(...(ROLE_PERMISSIONS[role] || []));
      });

      const enrichedUser: User = {
        id: `user-${demoUser.email.split('@')[0]}`,
        email: demoUser.email,
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        roles: demoUser.roles,
        tenantId: 'demo-tenant-001',
        permissions,
        preferences: {},
      };

      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user', JSON.stringify(enrichedUser));

      setAuthState({
        user: enrichedUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    navigate('/login');
  };

  // Check if user has specific role(s)
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!authState.user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.some((r) => authState.user!.roles.includes(r));
  };

  // Check if user has specific permission
  const hasPermission = (resource: string, action: string, scope?: string): boolean => {
    if (!authState.user) return false;

    // Admin has all permissions
    if (authState.user.roles.includes('Admin')) return true;

    return authState.user.permissions.some((perm) => {
      const resourceMatch = perm.resource === '*' || perm.resource === resource;
      const actionMatch = perm.action === '*' || perm.action === action;
      const scopeMatch = !scope || perm.scope === scope || perm.scope === 'tenant';
      
      return resourceMatch && actionMatch && scopeMatch;
    });
  };

  // Check if user can access a feature based on required roles
  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!authState.user) return false;
    return requiredRoles.some((role) => authState.user!.roles.includes(role));
  };

  // Update user profile
  const updateUser = (updates: Partial<User>) => {
    if (!authState.user) return;

    const updatedUser = { ...authState.user, ...updates };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuthState((prev) => ({ ...prev, user: updatedUser }));
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    hasRole,
    hasPermission,
    canAccess,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper hook for role-based rendering
export const useRoleAccess = () => {
  const { hasRole, hasPermission, canAccess, user } = useAuth();

  return {
    isEA: hasRole('EA'),
    isSA: hasRole('SA'),
    isTA: hasRole('TA'),
    isPM: hasRole('PM'),
    isSE: hasRole('SE'),
    isConsultant: hasRole('Consultant'),
    isAdmin: hasRole('Admin'),
    isArchitect: hasRole(['EA', 'SA', 'TA']),
    hasRole,
    hasPermission,
    canAccess,
    user,
  };
};

export default AuthContext;
