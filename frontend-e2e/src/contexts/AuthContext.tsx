import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

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
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await axios.get('/api/auth/me')
        setUser(response.data.user)
      } else {
        // Demo mode: Create a mock user to allow browsing without backend
        const demoUser: User = {
          id: 'demo-user',
          username: 'demo',
          email: 'demo@iac-platform.com',
          firstName: 'Demo',
          lastName: 'User',
          roles: ['admin'],
          permissions: ['*'],
          avatar: ''
        }
        setUser(demoUser)
      }
    } catch (error) {
      // If API fails, use demo mode
      const demoUser: User = {
        id: 'demo-user',
        username: 'demo',
        email: 'demo@iac-platform.com',
        firstName: 'Demo',
        lastName: 'User',
        roles: ['admin'],
        permissions: ['*'],
        avatar: ''
      }
      setUser(demoUser)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    const response = await axios.post('/api/auth/login', { username, password })
    const { accessToken, refreshToken, user } = response.data
    
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    
    setUser(user)
  }

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      delete axios.defaults.headers.common['Authorization']
      setUser(null)
    }
  }

  const register = async (userData: any) => {
    const response = await axios.post('/api/auth/register', userData)
    return response.data
  }

  const updateProfile = async (data: Partial<User>) => {
    const response = await axios.put(`/api/users/${user?.id}`, data)
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
