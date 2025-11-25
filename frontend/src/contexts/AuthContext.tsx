import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type UserRole = 'EA' | 'SA' | 'TA' | 'PM' | 'SE' | 'Consultant' | 'Admin';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: UserRole[];
  tenantId: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple demo user - using actual UUID from database
const DEMO_USER: User = {
  id: '10000000-0000-0000-0000-000000000001',
  email: 'john.smith@iacdharma.com',
  firstName: 'John',
  lastName: 'Smith',
  roles: ['EA', 'SA', 'Admin'],
  tenantId: 'demo-tenant',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: DEMO_USER, // Auto-login for demo
    token: 'demo-token',
    isAuthenticated: true,
    isLoading: false,
  });

  // Save userId to localStorage on mount
  React.useEffect(() => {
    if (state.user) {
      localStorage.setItem('userId', state.user.id);
    }
  }, [state.user]);

  const login = async (email: string, password: string) => {
    setState({
      user: DEMO_USER,
      token: 'demo-token',
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!state.user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => state.user?.roles.includes(r));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
