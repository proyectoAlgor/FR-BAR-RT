import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Table, MapPin, Loader2 } from 'lucide-react'
import { reportService, VenueSpecificReport } from '../services/reportService'
import { locationService } from '../services/locationService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface Location {
  id: string
  code: string
  name: string
}

const Reports: React.FC = () => {
  const { user } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string>('')
  const [report, setReport] = useState<VenueSpecificReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingReport, setLoadingReport] = useState(false)

  useEffect(() => {
    loadLocations()
  }, [])

  useEffect(() => {
    if (selectedLocationId) {
      loadReport(selectedLocationId)
    }
  }, [selectedLocationId])

  const loadLocations = async () => {
    try {
      const data = await locationService.getLocations()
      let filteredLocations = data || []
      
      // Si es cajero, solo mostrar su sede asignada
      if (user?.roles?.includes('cashier') && user?.venue_id) {
        filteredLocations = filteredLocations.filter(loc => loc.id === user.venue_id)
      }
      
      setLocations(filteredLocations)
      if (filteredLocations.length > 0 && !selectedLocationId) {
        setSelectedLocationId(filteredLocations[0].id)
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      toast.error('Error al cargar las sedes')
    } finally {
      setLoading(false)
    }
  }

  const loadReport = async (locationId: string) => {
    setLoadingReport(true)
    try {
      const data = await reportService.getVenueSpecificReport(locationId)
      setReport(data)
    } catch (error: any) {
      console.error('Error loading report:', error)
      toast.error(error.response?.data?.error || 'Error al cargar el reporte')
    } finally {
      setLoadingReport(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-golden-600" />
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hay sedes disponibles para generar reportes</p>
      </div>
    )
  }

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId)

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 font-golden tracking-tight">
          Reportes por Sede
        </h1>
        <p className="mt-2 text-lg text-amber-700 font-medium">
          Información detallada de la sede seleccionada
        </p>
        <div className="mt-4 h-1 w-20 bg-gradient-to-r from-golden-400 to-amber-400 rounded-full mx-auto sm:mx-0"></div>
      </div>

      {/* Selector de sede */}
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Sede
        </label>
        <select
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} ({location.code})
            </option>
          ))}
        </select>
      </div>

      {loadingReport ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-golden-600" />
        </div>
      ) : report ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información General */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center mb-4">
              <MapPin className="h-6 w-6 text-golden-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Información de la Sede</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="text-lg font-semibold text-gray-900">{report.location_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Código</p>
                <p className="text-lg font-semibold text-gray-900">{report.location_code}</p>
              </div>
            </div>
          </div>

          {/* Estadísticas de Mesas */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20">
            <div className="flex items-center mb-4">
              <Table className="h-6 w-6 text-golden-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Estadísticas de Mesas</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total de Mesas</span>
                <span className="text-2xl font-bold text-golden-600">{report.total_tables}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Mesas Disponibles</span>
                <span className="text-xl font-semibold text-green-600">
                  {report.tables_status.status === 'available' ? report.tables_status.count : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Usuarios Asignados */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 lg:col-span-2">
            <div className="flex items-center mb-4">
              <Users className="h-6 w-6 text-golden-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">
                Usuarios Asignados ({report.assigned_users})
              </h2>
            </div>
            {report.user_details.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.user_details.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs font-medium bg-golden-100 text-golden-800 rounded"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              user.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.is_active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay usuarios asignados a esta sede</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No se pudo cargar el reporte</p>
        </div>
      )}
    </div>
  )
}

export default Reports

