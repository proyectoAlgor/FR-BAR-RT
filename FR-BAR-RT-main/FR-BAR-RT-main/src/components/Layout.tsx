import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SessionProvider, useSession } from '../contexts/SessionContext'
import Sidebar from './Sidebar'
import Header from './Header'
import SessionWarning from './SessionWarning'
import SessionExpired from './SessionExpired'

// Componente interno que usa el contexto de sesión
const SessionComponents: React.FC = () => {
  const { isExpired } = useSession()
  
  return (
    <>
      <SessionWarning />
      {isExpired && <SessionExpired />}
    </>
  )
}

const Layout: React.FC = () => {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-golden-50 to-whiskey-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-golden-500"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <SessionProvider>
      <div className="w-full h-screen bg-gradient-to-br from-amber-50 via-golden-50 to-whiskey-50">
        <div className="flex h-full w-full overflow-hidden">
          {/* Sidebar para desktop y mobile */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          
          {/* Overlay para mobile cuando el sidebar está abierto */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}
          
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-amber-50/30 via-golden-50/30 to-whiskey-50/30 p-3 sm:p-4 lg:p-6 w-full">
              <Outlet />
            </main>
          </div>
        </div>
        
        {/* Componentes de gestión de sesión */}
        <SessionComponents />
      </div>
    </SessionProvider>
  )
}

export default Layout
