import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Bell, Menu } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth()

  return (
    <header className="bg-gray-300/90 backdrop-blur-sm shadow-lg sticky top-0 z-10">
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
                Welcome, {user?.full_name}
              </h2>
              <p className="text-xs sm:text-sm text-amber-700 truncate hidden sm:block font-medium">
                {user?.email}
              </p>
            </div>
          </div>
          
          {/* Right: Notifications + User avatar */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="p-2 text-gray-400 hover:text-golden-600 hover:bg-golden-50 rounded-lg transition-colors">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-golden-100 to-amber-100 rounded-full flex items-center justify-center shadow-md border border-gray-400">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-golden-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
