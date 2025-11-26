import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Bell, Menu, LogOut, Settings, Shield } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    setShowUserMenu(false)
    logout()
  }

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      cashier: 'Cajero',
      waiter: 'Mesero',
      barman: 'Barman',
    }
    return labels[role] || role
  }

  return (
    <header className="bg-gray-300/90 backdrop-blur-sm shadow-lg sticky top-0 z-20">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Menu button (mobile) + Welcome message */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-golden-600 hover:bg-golden-50 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900 truncate font-golden">
                Welcome, {user?.first_name || user?.full_name || 'Usuario'}
              </h2>
              <p className="text-xs sm:text-sm text-amber-700 truncate hidden sm:block font-medium">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Right: Notifications + User avatar */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              className="p-2 text-gray-400 hover:text-golden-600 hover:bg-golden-50 rounded-lg transition-colors relative"
              title="Notificaciones"
            >
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              {/* Indicador de notificaciones (opcional) */}
              {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
            </button>
            
            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  console.log('Botón de usuario clickeado, estado actual:', showUserMenu)
                  setShowUserMenu(!showUserMenu)
                }}
                className="flex items-center space-x-2 sm:space-x-3 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:ring-offset-2 rounded-full"
                type="button"
                aria-label="Menú de usuario"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-golden-100 to-amber-100 rounded-full flex items-center justify-center shadow-md border border-gray-400 hover:shadow-lg transition-shadow cursor-pointer">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-golden-600" />
                </div>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                    {user?.roles && user.roles.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {user.roles.map((role: string) => (
                          <span
                            key={role}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-golden-100 text-golden-800"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            {getRoleLabel(role)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Menu options */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        // Aquí puedes agregar navegación a perfil si lo implementas
                        console.log('Ver perfil')
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User className="h-4 w-4 mr-3 text-gray-400" />
                      Ver Perfil
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        // Aquí puedes agregar navegación a configuración si lo implementas
                        console.log('Configuración')
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-400" />
                      Configuración
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
