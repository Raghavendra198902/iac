import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib/apiClient'
import { API_ENDPOINTS } from '../config/api'

interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  permissions: string[]
  avatar?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (userData: any) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const response = await api.get(API_ENDPOINTS.AUTH.ME)
          setUser(response.data.user)
        } catch (error: any) {
          // If API is not available (404), check if we have a stored mock user
          if (error.response?.status === 404 || !error.response) {
            const mockUserStr = localStorage.getItem('mockUser')
            if (mockUserStr) {
              setUser(JSON.parse(mockUserStr))
            } else {
              // Clear invalid tokens if no mock user exists
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
            }
          } else {
            throw error
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid tokens
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('mockUser')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      // Backend expects 'email' field, but we receive 'username' from login form
      // Use username as email since they're the same for our demo
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { 
        email: username,  // Map username to email
        password 
      })
      
      // Backend returns 'token' and 'refreshToken', map to expected field names
      const { token, refreshToken, user } = response.data
      
      localStorage.setItem('accessToken', token)  // Store as accessToken for consistency
      localStorage.setItem('refreshToken', refreshToken)
      
      setUser(user)
    } catch (error: any) {
      // If API is not available (404 or network error), use mock authentication
      if (error.response?.status === 404 || !error.response) {
        console.log('API not available, using mock authentication')
        
        // Mock user for standalone mode
        const mockUser: User = {
          id: 'demo-user-123',
          username: username,
          email: username,
          firstName: 'Demo',
          lastName: 'User',
          roles: ['admin', 'user'],
          permissions: ['read', 'write', 'delete', 'admin'],
          avatar: undefined
        }
        
        // Generate a mock token
        const mockToken = 'mock-jwt-token-' + Date.now()
        
        localStorage.setItem('accessToken', mockToken)
        localStorage.setItem('refreshToken', 'mock-refresh-token')
        localStorage.setItem('mockUser', JSON.stringify(mockUser))
        
        setUser(mockUser)
      } else {
        // Re-throw real authentication errors
        throw error
      }
    }
  }

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Logout error:', error)
      // Ignore errors during logout (API might not be available)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('mockUser')
      setUser(null)
    }
  }

  const register = async (userData: any) => {
    const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, userData)
    return response.data
  }

  const updateProfile = async (data: Partial<User>) => {
    const response = await api.put(API_ENDPOINTS.USERS.UPDATE(user?.id || ''), data)
    setUser({ ...user!, ...response.data.user })
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false
  }

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile,
    hasPermission,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
