import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  document_number: string
  document_type: string
  venue_id?: string
  is_active: boolean
  roles?: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      try {
        // Extraer roles del token JWT guardado
        const tokenPayload = JSON.parse(atob(savedToken.split('.')[1]))
        console.log('Token payload:', tokenPayload); // Debug log
        const userWithRoles = {
          id: tokenPayload.user_id,
          email: tokenPayload.email,
          first_name: '',
          last_name: '',
          document_number: '',
          document_type: '',
          venue_id: '',
          is_active: true,
          roles: tokenPayload.roles || []
        }
        console.log('User with roles:', userWithRoles); // Debug log
        setUser(userWithRoles)
      } catch (error) {
        console.error('Error parsing token:', error)
        localStorage.removeItem('token')
        setToken(null)
      }
      // Verificar token y obtener perfil del usuario
      authService.getProfile(savedToken)
        .then((userData) => {
          const userWithRoles = {
            ...userData.user,
            roles: JSON.parse(atob(savedToken.split('.')[1])).roles || []
          }
          setUser(userWithRoles)
        })
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      setToken(response.token)
      // Extraer roles del token JWT
      const tokenPayload = JSON.parse(atob(response.token.split('.')[1]))
      console.log('Login token payload:', tokenPayload); // Debug log
      const userWithRoles = {
        ...response.user,
        roles: tokenPayload.roles || []
      }
      console.log('Login user with roles:', userWithRoles); // Debug log
      setUser(userWithRoles)
      localStorage.setItem('token', response.token)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const value = {
    user,
    token,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
