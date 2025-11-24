import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Wine } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Login error'
      
      // Traducir mensajes específicos
      if (errorMessage.includes('user account is deactivated')) {
        setError('User account is deactivated. Please contact administrator.')
      } else if (errorMessage.includes('invalid credentials')) {
        setError('Invalid email or password')
      } else if (errorMessage.includes('account temporarily locked')) {
        setError('Account temporarily locked due to multiple failed attempts')
      } else {
        setError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: `url('/images/photo-1597290282695-edc43d0e7129.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay con gradiente más sofisticado */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/50"></div>
      
      <div className="relative z-10 w-full max-w-sm mx-auto sm:max-w-md">
        {/* Logo THE GOLDEN GLASS */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            {/* Círculo dorado de fondo con efecto hover */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full flex items-center justify-center shadow-2xl border-2 border-golden-300 group-hover:scale-110 transition-transform duration-300">
              <Wine className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
            </div>
            {/* Efecto de brillo mejorado */}
            <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-golden-300 to-transparent rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
            {/* Efecto de resplandor exterior */}
            <div className="absolute inset-0 w-24 h-24 sm:w-28 sm:h-28 bg-golden-400 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-golden tracking-wide">
          THE GOLDEN GLASS
        </h2>
        <p className="mt-3 text-center text-sm sm:text-base text-golden-200 font-medium">
          Bar Management System
        </p>
        <p className="mt-2 text-center text-xs sm:text-sm text-gray-300">
          Log in to your account
        </p>
      </div>

      <div className="mt-8 w-full max-w-sm mx-auto sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-lg py-8 px-6 shadow-2xl rounded-2xl border border-white/30 relative overflow-hidden">
          {/* Efecto de brillo sutil en el formulario */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-golden-400 via-amber-400 to-golden-400"></div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-600 px-4 py-3 rounded-r-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-golden-500 transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-golden-500 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-xl text-base font-semibold text-white bg-gradient-to-r from-golden-500 to-amber-500 hover:from-golden-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-golden-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden group"
              >
                {/* Efecto de brillo en el botón */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </div>
                ) : (
                  'Log In'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
