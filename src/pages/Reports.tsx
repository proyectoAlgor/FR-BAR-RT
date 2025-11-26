import { useState, useEffect } from 'react';
import orderService, { SalesReport, ReportFilters } from '../services/orderService';
import { locationService } from '../services/locationService';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, TrendingUp, DollarSign, CreditCard, Calendar, Filter, Download, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

interface Location {
  id: string;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
}

export default function Reports() {
  const [report, setReport] = useState<SalesReport | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Filters
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    loadLocations();
  }, []);

  useEffect(() => {
    // Auto-load report when filters change (with debounce)
    const timer = setTimeout(() => {
      if (selectedLocations.length > 0 || (user?.roles?.includes('admin') && locations.length > 0)) {
        loadReport();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedLocations, startDate, endDate]);

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
      
      // Auto-select all locations for admin, or user's locations for cashier
      if (filteredLocations.length > 0) {
        if (user?.roles?.includes('admin')) {
          setSelectedLocations(filteredLocations.map(loc => loc.id));
        } else if (user?.location_ids) {
          setSelectedLocations(user.location_ids);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error loading locations');
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');

      const filters: ReportFilters = {};
      
      if (selectedLocations.length > 0) {
        filters.location_ids = selectedLocations;
      }
      
      if (startDate) {
        filters.start_date = startDate;
      }
      
      if (endDate) {
        filters.end_date = endDate;
      }

      const reportData = await orderService.getSalesReport(filters);
      setReport(reportData);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Access denied: You do not have permission to view reports');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError(err.message || 'Error loading report');
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
    if (locations.length > 0) {
      if (user?.roles?.includes('admin')) {
        setSelectedLocations(locations.map(loc => loc.id));
      } else if (user?.location_ids) {
        setSelectedLocations(user.location_ids);
      }
    }
  };

  const getLocationName = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? `${location.name} (${location.code})` : locationId.substring(0, 8);
  };

  const handleDownloadCSV = async () => {
    try {
      const filters: ReportFilters = {};
      
      if (selectedLocations.length > 0) {
        filters.location_ids = selectedLocations;
      }
      
      if (startDate) {
        filters.start_date = startDate;
      }
      
      if (endDate) {
        filters.end_date = endDate;
      }

      await orderService.downloadSalesReportCSV(filters);
      toast.success('CSV report downloaded successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to download CSV report');
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sales Reports & Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Comprehensive sales analysis and reporting
            </p>
          </div>
          {report && (
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors touch-manipulation"
            >
              <Download className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Export CSV</span>
            </button>
          )}
        </div>
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={loadReport}
                disabled={loading}
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors touch-manipulation"
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
              <button
                onClick={clearFilters}
                className="flex-1 sm:flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors touch-manipulation"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{report.summary.total_orders}</p>
            </div>
            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Total Sales</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {orderService.formatPrice(report.summary.total_amount)}
              </p>
            </div>
            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Cash</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                {orderService.formatPrice(report.summary.cash_amount)}
              </p>
            </div>
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Card</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">
                {orderService.formatPrice(report.summary.card_amount)}
              </p>
            </div>
            <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Transfer</p>
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                {orderService.formatPrice(report.summary.transfer_amount)}
              </p>
            </div>
            <div className="bg-pink-50 p-3 sm:p-4 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">Avg Order</p>
              <p className="text-xl sm:text-2xl font-bold text-pink-600">
                {orderService.formatPrice(Math.round(report.summary.average_order_value))}
              </p>
            </div>
          </div>

          {/* Sales by Location */}
          {report.by_location.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Sales by Venue
              </h2>
              <div className="overflow-x-auto">
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-2">
                  {report.by_location.map((location) => (
                    <div key={location.location_id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {getLocationName(location.location_id)}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {orderService.formatPrice(location.total_amount)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{location.total_orders} orders</p>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.by_location.map((location) => (
                        <tr key={location.location_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {getLocationName(location.location_id)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{location.total_orders}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {orderService.formatPrice(location.total_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sales by Payment Method */}
          {report.by_payment_method.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Sales by Payment Method
              </h2>
              <div className="space-y-3">
                {report.by_payment_method.map((method) => (
                  <div key={method.payment_method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 capitalize">{method.payment_method}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {orderService.formatPrice(method.total_amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600 w-12 text-right">{method.percentage.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{method.total_orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sales by Day */}
          {report.by_day.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Sales Trend
              </h2>
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  {/* Mobile Card View */}
                  <div className="block sm:hidden space-y-2">
                    {report.by_day.map((day) => (
                      <div key={day.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-xs text-gray-600">{day.total_orders} orders</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {orderService.formatPrice(day.total_amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {report.by_day.map((day) => (
                          <tr key={day.date} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{day.total_orders}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                              {orderService.formatPrice(day.total_amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Products */}
          {report.top_products.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Products
              </h2>
              <div className="overflow-x-auto">
                {/* Mobile Card View */}
                <div className="block sm:hidden space-y-2">
                  {report.top_products.map((product, index) => (
                    <div key={product.product_id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {product.product_name || product.product_code || `Product ${index + 1}`}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {orderService.formatPrice(product.total_amount)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">Quantity: {product.total_quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden sm:block">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {report.top_products.map((product, index) => (
                        <tr key={product.product_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {product.product_name || product.product_code || `Product ${index + 1}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.total_quantity}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {orderService.formatPrice(product.total_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {report.summary.total_orders === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-gray-700">No sales data found for the selected filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Select filters and generate a report to view analytics</p>
        </div>
      )}
    </div>
  );
}

