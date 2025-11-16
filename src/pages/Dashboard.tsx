import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Package, ShoppingCart, BarChart3 } from 'lucide-react'

const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Sedes Activas',
      value: '2',
      icon: MapPin,
      color: 'bg-gradient-to-br from-golden-400 to-golden-600',
      link: '/locations'
    },
    {
      title: 'Productos',
      value: '15',
      icon: Package,
      color: 'bg-gradient-to-br from-amber-400 to-amber-600',
      link: '/products'
    },
    {
      title: 'Pedidos Hoy',
      value: '8',
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-whiskey-400 to-whiskey-600',
      link: '/orders'
    },
    {
      title: 'Ventas Hoy',
      value: '$1,250',
      icon: BarChart3,
      color: 'bg-gradient-to-br from-golden-500 to-amber-500',
      link: '/reports'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-golden tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 text-lg text-amber-700 font-medium">
          Bienvenido a tu centro de control
        </p>
        <div className="mt-4 h-1 w-20 bg-gradient-to-r from-golden-400 to-amber-400 rounded-full mx-auto sm:mx-0"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              to={stat.link}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-white/20 relative overflow-hidden"
            >
              {/* Efecto de brillo sutil */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-golden-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex items-center">
                <div className={`p-4 rounded-2xl ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <Icon className="h-7 w-7 text-white relative z-10" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 font-golden group-hover:text-golden-600 transition-colors">{stat.value}</p>
                </div>
              </div>
              
              {/* Indicador de interacción */}
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-golden-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-golden-400 via-amber-400 to-golden-400"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-golden">Actividad Reciente</h3>
            <div className="w-3 h-3 bg-golden-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-gradient-to-br from-golden-400 to-golden-600 rounded-full shadow-sm border border-golden-300"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Nueva mesa creada en Sede Centro</p>
                <p className="text-xs text-amber-600 font-medium mt-1">hace 5 min</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full shadow-sm border border-amber-300"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Producto "Cerveza" actualizado</p>
                <p className="text-xs text-amber-600 font-medium mt-1">hace 15 min</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
              <div className="flex-shrink-0">
                <div className="w-4 h-4 bg-gradient-to-br from-whiskey-400 to-whiskey-600 rounded-full shadow-sm border border-whiskey-300"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Nuevo usuario registrado</p>
                <p className="text-xs text-amber-600 font-medium mt-1">hace 1 hora</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-golden-400 to-amber-400"></div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 font-golden">Acciones Rápidas</h3>
            <svg className="w-6 h-6 text-golden-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="space-y-4">
            <Link
              to="/locations"
              className="block w-full text-left p-5 bg-gradient-to-r from-golden-50 to-amber-50 hover:from-golden-100 hover:to-amber-100 rounded-2xl transition-all duration-300 hover:shadow-lg border border-golden-200/50 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-golden-400 to-golden-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-golden-800 group-hover:text-golden-900">Configurar Nueva Sede</p>
                  <p className="text-sm text-amber-700 group-hover:text-amber-800">Agregar ubicación y mesas</p>
                </div>
                <svg className="w-5 h-5 text-golden-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            <Link
              to="/products"
              className="block w-full text-left p-5 bg-gradient-to-r from-amber-50 to-whiskey-50 hover:from-amber-100 hover:to-whiskey-100 rounded-2xl transition-all duration-300 hover:shadow-lg border border-amber-200/50 group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 group-hover:text-amber-900">Agregar Producto</p>
                  <p className="text-sm text-whiskey-700 group-hover:text-whiskey-800">Crear nuevo ítem del menú</p>
                </div>
                <svg className="w-5 h-5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
