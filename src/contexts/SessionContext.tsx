import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
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

// Constantes de configuración
const INACTIVITY_TIMEOUT = 180 // 3 minutos en segundos
const WARNING_THRESHOLD = 30   // Mostrar advertencia a los 30 segundos

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const [isWarning, setIsWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(INACTIVITY_TIMEOUT)
  const [isExpired, setIsExpired] = useState(false)
  
  // Referencias para el timer y última actividad
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityRef = useRef<number>(Date.now())
  const isActiveRef = useRef<boolean>(false)

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = () => {
    if (!user) return

    // Actualizar última actividad
    lastActivityRef.current = Date.now()
    isActiveRef.current = true

    // Resetear estados si estaba mostrando advertencia
    if (isWarning) {
      console.log('✅ User activity detected - resetting session timer')
      setIsWarning(false)
      setTimeRemaining(INACTIVITY_TIMEOUT)
      setIsExpired(false)
    }
  }

  useEffect(() => {
    if (!user) {
      // Limpiar todo si no hay usuario
      setIsWarning(false)
      setTimeRemaining(INACTIVITY_TIMEOUT)
      setIsExpired(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    console.log('🕒 Starting inactivity session timer...')

    // Inicializar
    lastActivityRef.current = Date.now()
    setTimeRemaining(INACTIVITY_TIMEOUT)
    setIsWarning(false)
    setIsExpired(false)

    // Detectar actividad del usuario
    const activityEvents = [
      'mousedown', 
      'mousemove', 
      'keypress', 
      'keydown',
      'scroll', 
      'touchstart', 
      'click',
      'focus'
    ]
    
    let activityDebounceTimer: NodeJS.Timeout | null = null

    const handleActivity = () => {
      // Debounce para evitar resetear el timer en cada pequeño movimiento
      if (activityDebounceTimer) {
        clearTimeout(activityDebounceTimer)
      }

      activityDebounceTimer = setTimeout(() => {
        resetInactivityTimer()
      }, 1000) // Esperar 1 segundo de actividad antes de resetear
    }

    // Agregar listeners de actividad
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true, capture: true })
    })

    // Timer principal - Cuenta regresiva cada segundo
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1
        
        // Mostrar advertencia cuando queden WARNING_THRESHOLD segundos
        if (newTime === WARNING_THRESHOLD && !isWarning) {
          console.log('⚠️ Session warning - ' + WARNING_THRESHOLD + ' seconds remaining')
          setIsWarning(true)
        }
        
        // Expirar sesión cuando llegue a 0
        if (newTime <= 0) {
          console.log('❌ Session expired due to inactivity')
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          setIsExpired(true)
          
          // Logout automático después de 2 segundos
          setTimeout(() => {
            logout()
            window.location.href = '/login'
          }, 2000)
          
          return 0
        }
        
        return newTime
      })
    }, 1000)

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up session timer')
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      
      if (activityDebounceTimer) {
        clearTimeout(activityDebounceTimer)
      }
      
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, { capture: true } as any)
      })
    }
  }, [user, logout, isWarning])

  // Función pública para resetear la sesión (cuando el usuario hace clic en "Continue")
  const resetSession = () => {
    console.log('🔄 Session manually reset by user')
    setIsWarning(false)
    setTimeRemaining(INACTIVITY_TIMEOUT)
    setIsExpired(false)
    lastActivityRef.current = Date.now()
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
