import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService, { Order, CashierSummary } from '../services/orderService';
import { locationService } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, DollarSign, TrendingUp, Calendar, Filter } from 'lucide-react';

interface Location {
  id: string;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
}

export default function Cashier() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [summary, setSummary] = useState<CashierSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryStartDate, setSummaryStartDate] = useState('');
  const [summaryEndDate, setSummaryEndDate] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadLocations();
    loadPendingOrders();
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      loadPendingOrders();
    }
  }, [selectedLocation]);

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
      if (filteredLocations.length > 0 && !selectedLocation) {
        setSelectedLocation(filteredLocations[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading locations');
    }
  };

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const orders = await orderService.getPendingOrders();
      
      // Filter by selected location if not admin or if location is selected
      let filteredOrders = orders;
      if (selectedLocation) {
        filteredOrders = orders.filter(order => order.location_id === selectedLocation);
      }
      
      setPendingOrders(filteredOrders);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied: You do not have permission to view pending orders');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Error loading pending orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayment = async (orderId: string, paymentMethod: 'cash' | 'card' | 'transfer') => {
    try {
      setProcessingPayment(orderId);
      await orderService.closeOrder(orderId, { payment_method: paymentMethod });
      await loadPendingOrders();
      if (showSummary) {
        await loadSummary();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error processing payment');
    } finally {
      setProcessingPayment(null);
    }
  };

  const loadSummary = async () => {
    try {
      setError('');
      const summaryData = await orderService.getCashierSummary(
        summaryStartDate || undefined,
        summaryEndDate || undefined
      );
      setSummary(summaryData);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied: You do not have permission to view cashier summary');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Error loading summary');
      }
    }
  };

  const handleShowSummary = () => {
    setShowSummary(true);
    loadSummary();
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
      open: 'Open',
      pending_payment: 'Pending Payment',
      paid: 'Paid',
    };
    return texts[status] || status;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-500 hover:bg-green-600',
      card: 'bg-blue-500 hover:bg-blue-600',
      transfer: 'bg-purple-500 hover:bg-purple-600',
    };
    return colors[method] || 'bg-gray-500 hover:bg-gray-600';
  };

  if (loading && pendingOrders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Payment Management</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Process payments and manage cashier closing
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Location Filter */}
      {locations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Venue
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Venues</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.code})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Summary Button */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleShowSummary}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <TrendingUp className="h-5 w-5" />
          View Cashier Summary
        </button>
      </div>

      {/* Cashier Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Cashier Summary</h3>
              <button
                onClick={() => setShowSummary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={summaryStartDate}
                  onChange={(e) => setSummaryStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={summaryEndDate}
                  onChange={(e) => setSummaryEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <button
                onClick={loadSummary}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Update Summary
              </button>
            </div>

            {summary && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{summary.total_orders}</p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Total Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {orderService.formatPrice(summary.total_amount)}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Cash</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {orderService.formatPrice(summary.cash_amount)}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Card</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {orderService.formatPrice(summary.card_amount)}
                  </p>
                </div>
                <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg col-span-2 sm:col-span-1">
                  <p className="text-xs sm:text-sm text-gray-600">Transfer</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                    {orderService.formatPrice(summary.transfer_amount)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pending Orders */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Pending Payments ({pendingOrders.length})
        </h2>

        {pendingOrders.length === 0 ? (
          <p className="text-center text-gray-600 py-8">No pending orders</p>
        ) : (
          <div className="space-y-4">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                        Order #{order.id.substring(0, 8)}
                      </h3>
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                      Created: {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                      {orderService.formatPrice(order.total_cents)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="grid grid-cols-3 sm:flex gap-2">
                      <button
                        onClick={() => handleProcessPayment(order.id, 'cash')}
                        disabled={processingPayment === order.id}
                        className={`${getPaymentMethodColor('cash')} text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm touch-manipulation`}
                      >
                        {processingPayment === order.id ? '...' : 'Cash'}
                      </button>
                      <button
                        onClick={() => handleProcessPayment(order.id, 'card')}
                        disabled={processingPayment === order.id}
                        className={`${getPaymentMethodColor('card')} text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm touch-manipulation`}
                      >
                        {processingPayment === order.id ? '...' : 'Card'}
                      </button>
                      <button
                        onClick={() => handleProcessPayment(order.id, 'transfer')}
                        disabled={processingPayment === order.id}
                        className={`${getPaymentMethodColor('transfer')} text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm touch-manipulation`}
                      >
                        {processingPayment === order.id ? '...' : 'Transfer'}
                      </button>
                    </div>
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors text-xs sm:text-sm touch-manipulation w-full sm:w-auto"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

