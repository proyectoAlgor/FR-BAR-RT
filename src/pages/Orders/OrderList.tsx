import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService, { Order } from '../../services/orderService';
import { locationService } from '../../services/locationService';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin } from 'lucide-react';

interface Location {
  id: string;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
}

interface Table {
  id: string;
  location_id: string;
  code: string;
  seats: number;
  status: string;
  is_active: boolean;
}

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadTables(selectedLocation);
    } else {
      setTables([]);
    }
  }, [selectedLocation]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocations();
      
      // Filter locations based on user's assigned venues
      let filteredLocations = data.filter((loc: Location) => loc.is_active);
      
      // If user is not admin, filter by assigned location_ids
      if (user && !user.roles?.includes('admin')) {
        if (user.location_ids && user.location_ids.length > 0) {
          filteredLocations = filteredLocations.filter((loc: Location) => 
            user.location_ids!.includes(loc.id)
          );
        } else {
          // User has no venues assigned
          filteredLocations = [];
        }
      }
      
      setLocations(filteredLocations);
      
      // Auto-select first location if available
      if (filteredLocations.length > 0 && !selectedLocation) {
        setSelectedLocation(filteredLocations[0].id);
      }
      
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error loading locations');
    } finally {
      setLoading(false);
    }
  };

  const loadTables = async (locationId: string) => {
    try {
      const data = await locationService.getTables(locationId);
      const activeTables = data.filter((table: Table) => table.is_active);
      
      // Verify each table's actual status by checking for active orders with items
      const tablesWithStatus = await Promise.all(
        activeTables.map(async (table: Table) => {
          try {
            const activeOrder = await orderService.getActiveOrderByTable(table.id);
            // If table has an active order, check if it has items
            if (activeOrder) {
              try {
                const orderWithItems = await orderService.getOrderById(activeOrder.id);
                // Only mark as occupied if order has items
                if (orderWithItems.items && orderWithItems.items.length > 0) {
                  return { ...table, status: 'occupied' };
                }
                // If order is empty, table is available
              } catch (err: any) {
                // If we can't get order details, assume it's occupied to be safe
                return { ...table, status: 'occupied' };
              }
            }
          } catch (err: any) {
            // 404 means no active order, use DB status
          }
          return table;
        })
      );
      
      setTables(tablesWithStatus);
    } catch (err: any) {
      setError(err.message || 'Error loading tables');
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      // Por ahora, obtener todas las órdenes (en producción filtrar por sede/mesero)
      // Como no hay endpoint para todas las órdenes, usaremos un approach diferente
      setOrders([]);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      pending_payment: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      open: 'Abierta',
      pending_payment: 'Pendiente Pago',
      paid: 'Pagada',
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleTableClick = async (tableId: string, locationId: string) => {
    // Check if table already has an active order
    try {
      const activeOrder = await orderService.getActiveOrderByTable(tableId);
      if (activeOrder) {
        // Redirect to existing order instead of creating a new one
        navigate(`/orders/${activeOrder.id}`);
        return;
      }
    } catch (err: any) {
      // 404 means no active order, which is fine - continue with order creation
      if (err.response?.status !== 404) {
        console.error('Error checking active order:', err);
      }
    }
    
    // No active order found, navigate to create new order
    navigate(`/orders/create?tableId=${tableId}&locationId=${locationId}`);
  };

  const getTableStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      available: 'bg-green-100 text-green-800 border-green-300',
      occupied: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getTableStatusText = (status: string) => {
    const texts: Record<string, string> = {
      available: 'Available',
      occupied: 'Occupied',
    };
    return texts[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Select a venue and table to create a new order
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Message when user has no venues assigned */}
      {user && !user.roles?.includes('admin') && (!user.location_ids || user.location_ids.length === 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
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

      {/* Selector de Sede */}
      {locations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Venue
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select a venue --</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Mesas Disponibles */}
      {selectedLocation && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Available Tables
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tables.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No tables found for this venue
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    table.status === 'available'
                      ? 'hover:shadow-lg hover:border-blue-400 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  } ${getTableStatusColor(table.status)}`}
                  onClick={async () => {
                    if (table.status === 'available') {
                      handleTableClick(table.id, selectedLocation);
                    } else if (table.status === 'occupied') {
                      // If table is occupied, try to find and redirect to active order
                      try {
                        const activeOrder = await orderService.getActiveOrderByTable(table.id);
                        if (activeOrder) {
                          navigate(`/orders/${activeOrder.id}`);
                        }
                      } catch (err: any) {
                        // If no order found, reload tables to refresh status
                        loadTables(selectedLocation);
                      }
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-lg">{table.code}</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white">
                      {getTableStatusText(table.status)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{table.seats} seats</span>
                  </div>
                  {table.status === 'available' && (
                    <div className="mt-3 pt-3 border-t border-current">
                      <p className="text-xs font-medium text-center">
                        Click to create order
                      </p>
                    </div>
                  )}
                  {table.status === 'occupied' && (
                    <div className="mt-3 pt-3 border-t border-current">
                      <p className="text-xs font-medium text-center text-red-600">
                        Click to view active order
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {orders.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Cuenta #{order.id.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-semibold text-gray-900">
                    {orderService.formatPrice(order.total_cents)}
                  </span>
                </div>
                {order.notes && (
                  <p className="text-sm text-gray-600 italic">"{order.notes}"</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

