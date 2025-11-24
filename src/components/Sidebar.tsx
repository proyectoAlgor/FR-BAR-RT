import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  MapPin, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  BarChart3,
  LogOut,
  X,
  Wine,
  Users,
  Receipt
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation()
  const { logout, user } = useAuth()

  // SPRINT 1 + SPRINT 2: Menu options
  const menuItems = [
    { path: '/locations', icon: MapPin, label: 'Venues & Tables' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/orders', icon: Receipt, label: 'Orders / Accounts' },
  ]

  // Only show admin options if user is admin (Sprint 1)
  const adminMenuItems = [
    { path: '/users', icon: Users, label: 'User Management' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleLinkClick = () => {
    // Cerrar sidebar en móviles al hacer click en un link
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-gradient-to-b from-gray-300 to-gray-400 shadow-xl
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Header con botón de cerrar para móviles */}
        <div className="flex items-center justify-between p-6 lg:border-b-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-golden-400 to-golden-600 rounded-lg flex items-center justify-center shadow-md border border-gray-400">
              <Wine className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 font-golden">THE GOLDEN GLASS</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-golden-600 hover:bg-golden-50 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 mt-6 overflow-y-auto">
          <div className="px-3 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-golden-100 to-amber-100 text-golden-800 shadow-md border-l-4 border-gray-500'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-golden-50 hover:to-amber-50 hover:text-golden-700'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item.path) ? 'text-golden-600' : 'text-gray-500 group-hover:text-golden-600'
                  }`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
            
            {/* Separador para sección de administración */}
            {console.log('User roles in sidebar:', user?.roles)} {/* Debug log */}
            {user?.roles?.includes('admin') && (
              <>
                <div className="mt-6 mb-3">
                  <div className="flex items-center px-3">
                    <div className="flex-1 border-t border-gray-400"></div>
                    <span className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Administration
                    </span>
                    <div className="flex-1 border-t border-gray-400"></div>
                  </div>
                </div>
                
                {adminMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                        isActive(item.path)
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 shadow-md border-l-4 border-red-500'
                          : 'text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700'
                      }`}
                    >
                      <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive(item.path) ? 'text-red-600' : 'text-gray-500 group-hover:text-red-600'
                      }`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </>
            )}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 hover:text-red-700 rounded-lg transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-gray-500 group-hover:text-red-600" />
            <span className="truncate">Log Out</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar
