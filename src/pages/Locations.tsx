import React, { useState, useEffect } from 'react'
import { Plus, MapPin, Users, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { locationService } from '../services/locationService'
import orderService from '../services/orderService'
import { useAuth } from '../contexts/AuthContext'

interface Location {
  id: string
  code: string
  name: string
  address: string
  created_at: string
  updated_at: string
}

interface Table {
  id: string
  location_id: string
  code: string
  seats: number
  status: 'available' | 'occupied'
  created_at: string
  updated_at: string
}

const Locations: React.FC = () => {
  const { user } = useAuth()
  const [locations, setLocations] = useState<Location[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [showLocationForm, setShowLocationForm] = useState(false)
  const [showTableForm, setShowTableForm] = useState(false)
  const [newLocation, setNewLocation] = useState({ code: '', name: '', address: '' })
  const [newTable, setNewTable] = useState({ code: '', seats: 4 })
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [editTable, setEditTable] = useState({ code: '', seats: 4 })

  // Permisos por rol
  const canCreateLocation = user?.roles?.includes('admin')
  const canEditLocation = user?.roles?.includes('admin')
  const canDeleteLocation = user?.roles?.includes('admin')
  const canCreateTable = user?.roles?.includes('admin')
  const canEditTable = user?.roles?.includes('admin') || user?.roles?.includes('cashier')
  const canDeleteTable = user?.roles?.includes('admin')
  const canChangeTableStatus = user?.roles?.includes('admin') || user?.roles?.includes('cashier')

  useEffect(() => {
    loadLocations()
  }, [])

  useEffect(() => {
    if (selectedLocation) {
      loadTables(selectedLocation)
    }
  }, [selectedLocation])

  // Refresh tables periodically to reflect order status changes
  useEffect(() => {
    if (!selectedLocation) return

    const interval = setInterval(() => {
      loadTables(selectedLocation)
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [selectedLocation])

  const loadLocations = async () => {
    try {
      const data = await locationService.getLocations()
      console.log('Locations loaded:', data) // Debug log
      
      // Filter locations based on user's assigned venues
      let filteredLocations = data || []
      
      // If user is not admin, filter by assigned location_ids
      if (user && !user.roles?.includes('admin')) {
        if (user.location_ids && user.location_ids.length > 0) {
          filteredLocations = filteredLocations.filter((loc: Location) => 
            user.location_ids!.includes(loc.id)
          )
        } else {
          // User has no venues assigned
          filteredLocations = []
        }
      }
      
      setLocations(filteredLocations)
      if (filteredLocations.length > 0 && !selectedLocation) {
        setSelectedLocation(filteredLocations[0].id)
      }
    } catch (error) {
      console.error('Error loading locations:', error)
      setLocations([]) // En caso de error, establecer array vacío
    } finally {
      setLoading(false)
    }
  }

  const loadTables = async (locationId: string) => {
    try {
      const data = await locationService.getTables(locationId)
      
      // Verify each table's actual status by checking for active orders with items
      const tablesWithStatus = await Promise.all(
        data.map(async (table: Table) => {
          try {
            const activeOrder = await orderService.getActiveOrderByTable(table.id)
            // If table has an active order, check if it has items
            if (activeOrder) {
              try {
                const orderWithItems = await orderService.getOrderById(activeOrder.id)
                // Only mark as occupied if order has items
                if (orderWithItems.items && orderWithItems.items.length > 0) {
                  return { ...table, status: 'occupied' as const }
                }
                // If order is empty, table is available
              } catch (err: any) {
                // If we can't get order details, assume it's occupied to be safe
                return { ...table, status: 'occupied' as const }
              }
            }
          } catch (err: any) {
            // 404 means no active order, use DB status
          }
          return table
        })
      )
      
      setTables(tablesWithStatus)
    } catch (error) {
      console.error('Error loading tables:', error)
    }
  }

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await locationService.createLocation(newLocation)
      toast.success('Venue created successfully')
      setNewLocation({ code: '', name: '', address: '' })
      setShowLocationForm(false)
      loadLocations()
    } catch (error: any) {
      console.error('Error creating location:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error creating venue'
      const statusCode = error.response?.status
      
      // Detectar error de duplicado por código de estado HTTP 409 (Conflict) o mensaje
      if (statusCode === 409 || errorMessage.includes('already exists')) {
        toast.error(`Venue code "${newLocation.code}" already exists`)
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLocation) return
    
    try {
      await locationService.createTable({
        location_id: selectedLocation,
        ...newTable
      })
      toast.success('Table created successfully')
      setNewTable({ code: '', seats: 4 })
      setShowTableForm(false)
      loadTables(selectedLocation)
    } catch (error: any) {
      console.error('Error creating table:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error creating table'
      const statusCode = error.response?.status
      
      // Detectar error de duplicado por código de estado HTTP 409 (Conflict) o mensaje
      if (statusCode === 409 || errorMessage.includes('already exists')) {
        toast.error(`Table code "${newTable.code}" already exists in this venue`)
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'occupied': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available'
      case 'occupied': return 'Occupied'
      default: return status
    }
  }

  const handleEditTable = (table: Table) => {
    setEditingTable(table)
    setEditTable({
      code: table.code,
      seats: table.seats
    })
  }

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTable) return
    
    try {
      await locationService.updateTable(editingTable.id, editTable)
      toast.success('Table updated successfully')
      setEditingTable(null)
      setEditTable({ code: '', seats: 4 })
      if (selectedLocation) {
        loadTables(selectedLocation)
      }
    } catch (error: any) {
      console.error('Error updating table:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error updating table'
      const statusCode = error.response?.status
      
      // Detectar error de duplicado por código de estado HTTP 409 (Conflict) o mensaje
      if (statusCode === 409 || errorMessage.includes('already exists')) {
        toast.error(`Table code "${editTable.code}" already exists in this venue`)
      } else {
        toast.error(errorMessage)
      }
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return
    
    try {
      await locationService.deleteTable(tableId)
      toast.success('Table deleted successfully')
      if (selectedLocation) {
        loadTables(selectedLocation)
      }
    } catch (error: any) {
      console.error('Error deleting table:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error deleting table'
      toast.error(errorMessage)
    }
  }

  const handleChangeTableStatus = async (tableId: string, newStatus: string) => {
    try {
      await locationService.updateTableStatus(tableId, newStatus)
      toast.success(`Table status changed to ${newStatus}`)
      if (selectedLocation) {
        loadTables(selectedLocation)
      }
    } catch (error: any) {
      console.error('Error updating table status:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Error updating table status'
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Venues & Tables</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage bar locations and tables</p>
        </div>
        {canCreateLocation && (
          <button
            onClick={() => setShowLocationForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm sm:text-base">New Venue</span>
          </button>
        )}
      </div>

      {/* Message when user has no venues assigned */}
      {user && !user.roles?.includes('admin') && (!user.location_ids || user.location_ids.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                No venues assigned
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You don't have any venues assigned to your account. Please contact your administrator to get access to venues.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLocationForm && canCreateLocation && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Create New Venue</h3>
          <form onSubmit={handleCreateLocation} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={newLocation.code}
                  onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Venue
              </button>
              <button
                type="button"
                onClick={() => setShowLocationForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Venues</h3>
          <div className="space-y-3">
            {locations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                {user && !user.roles?.includes('admin') && (!user.location_ids || user.location_ids.length === 0) ? (
                  <>
                    <p className="text-sm font-medium">No venues assigned</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Please contact your administrator to get access to venues
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">No venues registered</p>
                    <p className="text-xs text-gray-400 mt-1">Create the first venue to get started</p>
                  </>
                )}
              </div>
            ) : (
              locations.map((location) => (
                <div
                  key={location.id}
                  onClick={() => setSelectedLocation(location.id)}
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedLocation === location.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{location.name}</p>
                      <p className="text-sm text-gray-600">{location.code}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{location.address}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedLocation && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Tables</h3>
                {canCreateTable && (
                  <button
                    onClick={() => setShowTableForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 w-full sm:w-auto"
                  >
                    <Plus className="h-5 w-5" />
                    <span>New Table</span>
                  </button>
                )}
              </div>

              {showTableForm && canCreateTable && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                  <h4 className="font-semibold mb-3">Create New Table</h4>
                  <form onSubmit={handleCreateTable} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Table code"
                      value={newTable.code}
                      onChange={(e) => setNewTable({ ...newTable, code: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={newTable.seats}
                      onChange={(e) => setNewTable({ ...newTable, seats: parseInt(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTableForm(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}

              {editingTable && canEditTable && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                  <h4 className="font-semibold mb-3">Edit Table: {editingTable.code}</h4>
                  <form onSubmit={handleUpdateTable} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="Table code"
                      value={editTable.code}
                      onChange={(e) => setEditTable({ ...editTable, code: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={editTable.seats}
                      onChange={(e) => setEditTable({ ...editTable, seats: parseInt(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTable(null)
                        setEditTable({ code: '', seats: 4 })
                      }}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {tables.map((table) => (
                  <div key={table.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Table {table.code}</h4>
                      {canChangeTableStatus ? (
                        <button
                          onClick={() => {
                            // Toggle between available and occupied only (no reservations)
                            const nextStatus = table.status === 'available' ? 'occupied' : 'available'
                            handleChangeTableStatus(table.id, nextStatus)
                          }}
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(table.status)}`}
                          title="Click to change status"
                        >
                          {getStatusText(table.status)}
                        </button>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                          {getStatusText(table.status)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>{table.seats} seats</span>
                    </div>
                    {(canEditTable || canDeleteTable) && (
                      <div className="flex space-x-2 mt-3">
                        {canEditTable && (
                          <button 
                            onClick={() => handleEditTable(table)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit table"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        )}
                        {canDeleteTable && (
                          <button 
                            onClick={() => handleDeleteTable(table.id)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete table"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Locations
