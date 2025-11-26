import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface SessionContextType {
  isWarning: boolean
  timeRemaining: number
  isExpired: boolean
  resetSession: () => void
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

interface SessionProviderProps {
  children: ReactNode
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { user, logout, token } = useAuth()
  const [isWarning, setIsWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(180) // 3 minutos en segundos
  const [isExpired, setIsExpired] = useState(false)

  // Función para obtener el tiempo de expiración del token
  const getTokenExpiration = () => {
    if (!token) return null
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.exp * 1000 // Convertir a milisegundos
    } catch (error) {
      console.error('Error parsing token:', error)
      return null
    }
  }

  // Función para calcular tiempo restante
  const calculateTimeRemaining = () => {
    const expiration = getTokenExpiration()
    if (!expiration) return 180
    
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((expiration - now) / 1000))
    return remaining
  }

  useEffect(() => {
    if (!user || !token) {
      setIsWarning(false)
      setTimeRemaining(180)
      setIsExpired(false)
      return
    }

    // Calcular tiempo inicial basado en el token
    const initialTime = calculateTimeRemaining()
    setTimeRemaining(initialTime)

    // Resetear timer cuando el usuario está activo
    const resetTimer = () => {
      const newTime = calculateTimeRemaining()
      setIsWarning(false)
      setTimeRemaining(newTime)
      setIsExpired(false)
    }

    // Detectar actividad del usuario
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      resetTimer()
    }

    // Agregar listeners de actividad
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    // Timer principal
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1
        
        // Mostrar advertencia a los 30 segundos restantes
        if (newTime === 30) {
          setIsWarning(true)
        }
        
        // Expirar sesión cuando llegue a 0
        if (newTime <= 0) {
          clearInterval(timer)
          setIsExpired(true)
          // Hacer logout automáticamente después de 2 segundos
          setTimeout(() => {
            logout()
          }, 2000)
          return 0
        }
        
        return newTime
      })
    }, 1000)

    // Cleanup
    return () => {
      clearInterval(timer)
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [user, logout, token])

  const resetSession = () => {
    const newTime = calculateTimeRemaining()
    setIsWarning(false)
    setTimeRemaining(newTime)
    setIsExpired(false)
  }

  const value: SessionContextType = {
    isWarning,
    timeRemaining,
    isExpired,
    resetSession
  }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
