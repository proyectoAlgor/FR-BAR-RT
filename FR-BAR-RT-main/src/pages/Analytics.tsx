import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Package, MapPin, Activity, Loader2 } from 'lucide-react'
import { reportService, AnalyticsReport } from '../services/reportService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Analytics: React.FC = () => {
  const { token } = useAuth()
  const [report, setReport] = useState<AnalyticsReport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await reportService.getAnalyticsReport()
      setReport(data)
    } catch (error: any) {
      console.error('Error loading analytics:', error)
      toast.error(error.response?.data?.error || 'Error al cargar los analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-golden-600" />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No se pudo cargar el reporte de analytics</p>
      </div>
    )
  }

  const { user_report, product_report, venue_report, activity_report } = report

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-golden tracking-tight">
          Analytics y Reportes
        </h1>
        <p className="mt-2 text-lg text-amber-700 font-medium">
          Vista completa del sistema - Generado: {new Date(report.generated_at).toLocaleString()}
        </p>
        <div className="mt-4 h-1 w-20 bg-gradient-to-r from-golden-400 to-amber-400 rounded-full mx-auto sm:mx-0"></div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900">{user_report.total_users}</p>
              <p className="text-xs text-green-600 mt-1">
                {user_report.active_users} activos
              </p>
            </div>
            <Users className="h-12 w-12 text-golden-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-3xl font-bold text-gray-900">{product_report.total_products}</p>
              <p className="text-xs text-green-600 mt-1">
                {product_report.active_products} activos
              </p>
            </div>
            <Package className="h-12 w-12 text-amber-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sedes</p>
              <p className="text-3xl font-bold text-gray-900">{venue_report.total_locations}</p>
              <p className="text-xs text-green-600 mt-1">
                {venue_report.active_locations} activas
              </p>
            </div>
            <MapPin className="h-12 w-12 text-whiskey-600 opacity-50" />
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Mesas</p>
              <p className="text-3xl font-bold text-gray-900">{venue_report.total_tables}</p>
              <p className="text-xs text-blue-600 mt-1">
                {venue_report.tables_by_status.find(s => s.status === 'available')?.count || 0} disponibles
              </p>
            </div>
            <Activity className="h-12 w-12 text-blue-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Reporte de Usuarios */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center mb-6">
          <Users className="h-6 w-6 text-golden-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Reporte de Usuarios</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Usuarios por Rol</h3>
            <div className="space-y-2">
              {user_report.users_by_role.map((role, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{role.role_name}</span>
                  <span className="text-lg font-bold text-golden-600">{role.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Usuarios por Sede</h3>
            <div className="space-y-2">
              {user_report.users_by_location.slice(0, 5).map((location, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{location.location_name}</span>
                  <span className="text-lg font-bold text-golden-600">{location.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Logins recientes (7 días)</span>
            <span className="text-lg font-bold text-green-600">{user_report.recent_logins}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-gray-600">Intentos fallidos (7 días)</span>
            <span className="text-lg font-bold text-red-600">{user_report.failed_logins}</span>
          </div>
        </div>
      </div>

      {/* Reporte de Productos */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center mb-6">
          <Package className="h-6 w-6 text-amber-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Reporte de Productos</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Productos por Categoría</h3>
            <div className="space-y-2">
              {product_report.products_by_category.map((category, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{category.category_name}</span>
                  <span className="text-lg font-bold text-amber-600">{category.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Información de Precios</h3>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Precio Promedio</p>
                <p className="text-2xl font-bold text-amber-600">
                  ${product_report.average_price.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Rango de Precios</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${product_report.price_range.min.toFixed(2)} - ${product_report.price_range.max.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reporte de Sedes */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center mb-6">
          <MapPin className="h-6 w-6 text-whiskey-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Reporte de Sedes</h2>
        </div>
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Estado de Mesas</h3>
          <div className="grid grid-cols-3 gap-4">
            {venue_report.tables_by_status.map((status, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 capitalize">{status.status}</p>
                <p className="text-2xl font-bold text-whiskey-600">{status.count}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Detalles por Sede</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sede</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Mesas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponibles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocupadas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservadas</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {venue_report.location_details.map((location) => (
                  <tr key={location.location_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {location.location_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {location.total_tables}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                      {location.available_tables}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 font-semibold">
                      {location.occupied_tables}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                      {location.reserved_tables}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reporte de Actividad */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center mb-6">
          <Activity className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-bold text-gray-900">Reporte de Actividad (30 días)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Estadísticas de Login</h3>
            <div className="space-y-3">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Logins Exitosos</span>
                  <span className="text-2xl font-bold text-green-600">
                    {activity_report.successful_logins}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Logins Fallidos</span>
                  <span className="text-2xl font-bold text-red-600">
                    {activity_report.failed_logins}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Total Intentos</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {activity_report.total_login_attempts}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Reseteos de Contraseña</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Total Reseteos (30 días)</span>
                <span className="text-2xl font-bold text-blue-600">
                  {activity_report.password_resets}
                </span>
              </div>
            </div>
            {activity_report.recent_failed_logins.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-600 mb-2">Intentos Fallidos Recientes</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activity_report.recent_failed_logins.slice(0, 5).map((attempt, idx) => (
                    <div key={idx} className="p-2 bg-red-50 rounded text-xs">
                      <p className="font-medium text-gray-900">{attempt.email}</p>
                      <p className="text-gray-600">{attempt.ip_address}</p>
                      <p className="text-gray-500">
                        {new Date(attempt.attempted_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics

