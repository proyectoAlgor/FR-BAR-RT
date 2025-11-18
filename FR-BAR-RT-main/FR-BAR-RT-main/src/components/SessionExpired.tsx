import React from 'react'
import { AlertCircle, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface SessionExpiredProps {
  onDismiss?: () => void
}

const SessionExpired: React.FC<SessionExpiredProps> = ({ onDismiss }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleRedirect = () => {
    logout() // Clear the session
    navigate('/login')
    if (onDismiss) onDismiss()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 border border-red-200">
        <div className="p-6">
          {/* Header with icon */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-golden">
                Session Expired
              </h3>
              <p className="text-sm text-gray-600">
                You will be redirected automatically
              </p>
            </div>
          </div>

          {/* Main message */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <p className="text-red-800 font-medium text-center">
                <strong>Session expired. Please log in again.</strong>
              </p>
            </div>
            <p className="text-gray-700 mt-4 leading-relaxed">
              For security reasons, your session has expired after 3 minutes of inactivity. 
              You must log in again to continue using the system.
            </p>
          </div>

          {/* Security information */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              🔒 Security Measures:
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Sessions expire automatically for security</li>
              <li>• All access attempts are logged</li>
              <li>• Accounts are blocked after multiple failed attempts</li>
            </ul>
          </div>

          {/* Main button */}
          <button
            onClick={handleRedirect}
            className="w-full bg-gradient-to-r from-golden-500 to-amber-500 hover:from-golden-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>Go to Login</span>
          </button>

          {/* Additional information */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Keep your session active by performing actions periodically
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionExpired
