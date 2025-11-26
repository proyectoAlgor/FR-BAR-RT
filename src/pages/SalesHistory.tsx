import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService, { Order, SalesHistoryFilters } from '../services/orderService';
import { locationService } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Calendar, Download, Eye } from 'lucide-react';

interface Location {
  id: string;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
}

export default function SalesHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filters
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | ''>('');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    // Auto-load sales when filters change (with debounce)
    const timer = setTimeout(() => {
      loadSalesHistory();
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedLocations, startDate, endDate, paymentMethod]);

  const loadLocations = async () => {
    try {
      const data = await locationService.getLocations();
      let filteredLocations = data.filter((loc: Location) => loc.is_active);
      
      if (user && !user.roles?.includes('admin')) {
        if (user.location_ids && user.location_ids.length > 0) {
          filteredLocations = filteredLocations.filter((loc: Location) => 
            user.location_ids!.includes(loc.id)
          );
        } else {
          filteredLocations = [];
        }
      }
      
      setLocations(filteredLocations);
      
      // Auto-select all user locations
      if (filteredLocations.length > 0) {
        if (user?.roles?.includes('admin')) {
          setSelectedLocations(filteredLocations.map(loc => loc.id));
        } else if (user?.location_ids) {
          setSelectedLocations(user.location_ids);
        } else {
          setSelectedLocations([filteredLocations[0].id]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading locations');
    }
  };

  const loadSalesHistory = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: SalesHistoryFilters = {};
      
      if (selectedLocations.length > 0) {
        filters.location_ids = selectedLocations;
      }
      
      if (startDate) {
        filters.start_date = startDate;
      }
      
      if (endDate) {
        filters.end_date = endDate;
      }
      
      if (paymentMethod) {
        filters.payment_method = paymentMethod as 'cash' | 'card' | 'transfer';
      }

      const salesData = await orderService.getSalesHistory(filters);
      setOrders(salesData);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied: You do not have permission to view sales history');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Error loading sales history');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationToggle = (locationId: string) => {
    setSelectedLocations(prev => {
      if (prev.includes(locationId)) {
        return prev.filter(id => id !== locationId);
      } else {
        return [...prev, locationId];
      }
    });
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setPaymentMethod('');
    if (locations.length > 0) {
      if (user?.roles?.includes('admin')) {
        setSelectedLocations(locations.map(loc => loc.id));
      } else if (user?.location_ids) {
        setSelectedLocations(user.location_ids);
      } else {
        setSelectedLocations([locations[0].id]);
      }
    }
  };

  const getPaymentMethodBadge = (method?: string) => {
    if (!method) return 'bg-gray-100 text-gray-800';
    const badges: Record<string, string> = {
      cash: 'bg-green-100 text-green-800',
      card: 'bg-blue-100 text-blue-800',
      transfer: 'bg-purple-100 text-purple-800',
    };
    return badges[method] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodText = (method?: string) => {
    if (!method) return 'Unknown';
    const texts: Record<string, string> = {
      cash: 'Cash',
      card: 'Card',
      transfer: 'Transfer',
    };
    return texts[method] || method;
  };

  const calculateTotal = () => {
    return orders.reduce((sum, order) => sum + order.total_cents, 0);
  };

  const calculateByPaymentMethod = (method: string) => {
    return orders
      .filter(order => order.payment_method === method)
      .reduce((sum, order) => sum + order.total_cents, 0);
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sales History</h1>
        <p className="text-sm sm:text-base text-gray-600">
          View and analyze sales history with filters
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        {showFilters && (
          <div className="space-y-4">
            {/* Location Filter */}
            {locations.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venues
                </label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => handleLocationToggle(location.id)}
                      className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors touch-manipulation ${
                        selectedLocations.includes(location.id)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {location.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <button
              onClick={clearFilters}
              className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors touch-manipulation"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">{orders.length}</p>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Total Sales</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {orderService.formatPrice(calculateTotal())}
            </p>
          </div>
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Cash</p>
            <p className="text-xl sm:text-2xl font-bold text-yellow-600">
              {orderService.formatPrice(calculateByPaymentMethod('cash'))}
            </p>
          </div>
          <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-600">Card</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {orderService.formatPrice(calculateByPaymentMethod('card'))}
            </p>
          </div>
        </div>
      )}

      {/* Sales List */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Sales Records ({orders.length})
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No sales found for the selected filters</p>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      #{order.id.substring(0, 8)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodBadge(
                        order.payment_method || undefined
                      )}`}
                    >
                      {getPaymentMethodText(order.payment_method || undefined)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {order.closed_at
                      ? new Date(order.closed_at).toLocaleString()
                      : new Date(order.created_at).toLocaleString()}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-lg font-bold text-gray-900">
                      {orderService.formatPrice(order.total_cents)}
                    </span>
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium touch-manipulation"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              ))}
              {/* Mobile Total */}
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {orderService.formatPrice(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.closed_at
                          ? new Date(order.closed_at).toLocaleString()
                          : new Date(order.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodBadge(
                            order.payment_method || undefined
                          )}`}
                        >
                          {getPaymentMethodText(order.payment_method || undefined)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {orderService.formatPrice(order.total_cents)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => navigate(`/orders/${order.id}`)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {orders.length > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                        Total:
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                        {orderService.formatPrice(calculateTotal())}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

