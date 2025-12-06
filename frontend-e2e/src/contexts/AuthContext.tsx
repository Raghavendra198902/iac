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
        const response = await api.get(API_ENDPOINTS.AUTH.ME)
        setUser(response.data.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid tokens
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { username, password })
    const { accessToken, refreshToken, user } = response.data
    
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    
    setUser(user)
  }

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
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
