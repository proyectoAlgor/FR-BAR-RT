import React from 'react'
import { AlertTriangle, Clock } from 'lucide-react'
import { useSession } from '../contexts/SessionContext'

const SessionWarning: React.FC = () => {
  const { isWarning, timeRemaining, resetSession } = useSession()

  if (!isWarning) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 border border-golden-200">
        <div className="p-6">
          {/* Header con icono */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 font-golden">
                Session Expiring
              </h3>
              <p className="text-sm text-gray-600">
                Your session is about to expire
              </p>
            </div>
          </div>

          {/* Contador regresivo */}
          <div className="bg-gradient-to-r from-amber-50 to-golden-50 rounded-xl p-4 mb-4 border border-amber-200">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold text-amber-700">
                {timeRemaining}s
              </span>
            </div>
            <p className="text-center text-sm text-amber-700 mt-2 font-medium">
              Your session will expire in {timeRemaining} seconds due to inactivity
            </p>
          </div>

          {/* Mensaje principal */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              <strong>Your session will expire in 30 seconds due to inactivity.</strong>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Click "Continue" to keep your session active, or you will be redirected to login automatically.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={resetSession}
              className="flex-1 bg-gradient-to-r from-golden-500 to-amber-500 hover:from-golden-600 hover:to-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Continue
            </button>
            <button
              onClick={() => {
                // Opcional: permitir cerrar sesión manualmente
                window.location.href = '/login'
              }}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 rounded-xl hover:bg-gray-100"
            >
              Log Out
            </button>
          </div>

          {/* Información adicional */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              💡 Tip: Keep your session active by performing any action on the page
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionWarning
