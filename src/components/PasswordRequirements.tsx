import React, { useState } from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'

interface PasswordRequirementsProps {
  password: string
  onPasswordChange: (password: string) => void
  className?: string
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ 
  password, 
  onPasswordChange, 
  className = "" 
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)

  const requirements = [
    {
      text: "Mínimo 8 caracteres",
      test: (pwd: string) => pwd.length >= 8,
      icon: Check
    },
    {
      text: "Al menos una mayúscula (A-Z)",
      test: (pwd: string) => /[A-Z]/.test(pwd),
      icon: Check
    },
    {
      text: "Al menos una minúscula (a-z)",
      test: (pwd: string) => /[a-z]/.test(pwd),
      icon: Check
    },
    {
      text: "Al menos un número (0-9)",
      test: (pwd: string) => /[0-9]/.test(pwd),
      icon: Check
    },
    {
      text: "Al menos un carácter especial (!@#$%^&*)",
      test: (pwd: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd),
      icon: Check
    }
  ]

  const allRequirementsMet = requirements.every(req => req.test(password))
  const hasPassword = password.length > 0

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Campo de contraseña */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          onFocus={() => setShowRequirements(true)}
          onBlur={() => setShowRequirements(false)}
          placeholder="Contraseña segura"
          className="block w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
        />
        
        {/* Icono de candado */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <div className="w-5 h-5 text-gray-400">
            🔒
          </div>
        </div>

        {/* Botón mostrar/ocultar */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Indicador de fortaleza */}
      {hasPassword && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">
              Fortaleza de la contraseña:
            </span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  allRequirementsMet 
                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                    : password.length >= 6 
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                      : 'bg-gradient-to-r from-red-400 to-red-600'
                }`}
                style={{ width: `${Math.min((requirements.filter(r => r.test(password)).length / requirements.length) * 100, 100)}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              allRequirementsMet 
                ? 'text-green-600' 
                : password.length >= 6 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
            }`}>
              {allRequirementsMet ? 'Fuerte' : password.length >= 6 ? 'Media' : 'Débil'}
            </span>
          </div>
        </div>
      )}

      {/* Requisitos de contraseña */}
      {showRequirements && hasPassword && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-lg border border-gray-200">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-3">
            📋 Requisitos de contraseña (ISO 27001):
          </h4>
          <div className="space-y-1 sm:space-y-2">
            {requirements.map((req, index) => {
              const Icon = req.test(password) ? Check : X
              const isMet = req.test(password)
              
              return (
                <div key={index} className="flex items-start space-x-2">
                  <Icon className={`h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 ${isMet ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-xs sm:text-sm ${isMet ? 'text-green-700' : 'text-red-700'} leading-relaxed`}>
                    {req.text}
                  </span>
                </div>
              )
            })}
          </div>
          
          {allRequirementsMet && (
            <div className="mt-3 pt-3 border-t border-green-200">
              <div className="flex items-center space-x-2 text-green-600">
                <Check className="h-5 w-5" />
                <span className="text-sm font-medium">
                  ✅ Contraseña cumple con los estándares de seguridad
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Información de seguridad */}
      {hasPassword && (
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-xs text-blue-700">
            🔐 <strong>Seguridad:</strong> Tu contraseña se almacena de forma segura usando hash bcrypt. 
            Nunca se muestra en texto plano.
          </p>
        </div>
      )}
    </div>
  )
}

export default PasswordRequirements
