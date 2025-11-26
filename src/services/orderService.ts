import axios from 'axios';

const API_BASE_URL = '/api/orders';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Order {
  id: string;
  table_id: string;
  location_id: string;
  waiter_id: string;
  status: 'open' | 'pending_payment' | 'paid';
  total_cents: number;
  notes: string;
  payment_method?: 'cash' | 'card' | 'transfer'; // Optional, only present when order is closed
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_cents: number;
  subtotal_cents: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  product_name?: string;
  product_code?: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface CreateOrderRequest {
  table_id: string;
  location_id: string;
  waiter_id: string;
  notes?: string;
}

export interface AddItemRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateItemRequest {
  quantity: number;
}

export interface CloseOrderRequest {
  payment_method: 'cash' | 'card' | 'transfer';
}

export interface CashierSummary {
  total_orders: number;
  total_amount: number;      // Total in cents
  cash_amount: number;       // Cash payments in cents
  card_amount: number;       // Card payments in cents
  transfer_amount: number;   // Transfer payments in cents
}

export interface SalesHistoryFilters {
  location_ids?: string[];
  start_date?: string;       // ISO 8601 format
  end_date?: string;         // ISO 8601 format
  payment_method?: 'cash' | 'card' | 'transfer';
}

export interface ReportFilters {
  location_ids?: string[];
  start_date?: string;       // ISO 8601 format
  end_date?: string;         // ISO 8601 format
}

export interface SalesSummary {
  total_orders: number;
  total_amount: number;      // In cents
  cash_amount: number;       // In cents
  card_amount: number;       // In cents
  transfer_amount: number;   // In cents
  average_order_value: number; // In cents
}

export interface LocationSales {
  location_id: string;
  location_name?: string;
  location_code?: string;
  total_orders: number;
  total_amount: number;      // In cents
}

export interface PaymentMethodData {
  payment_method: string;
  total_orders: number;
  total_amount: number;      // In cents
  percentage: number;
}

export interface DailySales {
  date: string;              // YYYY-MM-DD
  total_orders: number;
  total_amount: number;      // In cents
}

export interface ProductSales {
  product_id: string;
  product_name?: string;
  product_code?: string;
  total_quantity: number;
  total_amount: number;      // In cents
}

export interface SalesReport {
  summary: SalesSummary;
  by_location: LocationSales[];
  by_payment_method: PaymentMethodData[];
  by_day: DailySales[];
  top_products: ProductSales[];
  average_order_value: number; // In cents
}

const orderService = {
  // Order operations
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post('/', data);
    return response.data;
  },

  getOrderById: async (id: string): Promise<OrderWithItems> => {
    const response = await api.get(`/${id}`);
    return response.data;
  },

  getOrdersByLocation: async (locationId: string): Promise<Order[]> => {
    const response = await api.get(`/location/${locationId}`);
    return response.data;
  },

  getOrdersByTable: async (tableId: string): Promise<Order[]> => {
    const response = await api.get(`/table/${tableId}`);
    return response.data;
  },

  getActiveOrderByTable: async (tableId: string): Promise<Order | null> => {
    try {
      const response = await api.get(`/table/${tableId}/active`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Order item operations
  addItemToOrder: async (orderId: string, data: AddItemRequest): Promise<OrderItem> => {
    const response = await api.post(`/${orderId}/items`, data);
    return response.data;
  },

  updateOrderItem: async (itemId: string, data: UpdateItemRequest): Promise<OrderItem> => {
    const response = await api.put(`/items/${itemId}`, data);
    return response.data;
  },

  removeItemFromOrder: async (itemId: string): Promise<void> => {
    await api.delete(`/items/${itemId}`);
  },

  // Payment operations
  closeOrder: async (orderId: string, data: CloseOrderRequest): Promise<void> => {
    await api.post(`/${orderId}/close`, data);
  },

  // Cashier operations
  getPendingOrders: async (): Promise<Order[]> => {
    const response = await api.get('/cashier/pending');
    return response.data;
  },

  getCashierSummary: async (startDate?: string, endDate?: string): Promise<CashierSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const response = await api.get(`/cashier/summary?${params.toString()}`);
    return response.data;
  },

  getSalesHistory: async (filters: SalesHistoryFilters): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters.location_ids && filters.location_ids.length > 0) {
      params.append('location_ids', filters.location_ids.join(','));
    }
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.payment_method) params.append('payment_method', filters.payment_method);
    const response = await api.get(`/cashier/sales-history?${params.toString()}`);
    return response.data;
  },

  // Reporting operations
  getSalesReport: async (filters: ReportFilters): Promise<SalesReport> => {
    const params = new URLSearchParams();
    if (filters.location_ids && filters.location_ids.length > 0) {
      params.append('location_ids', filters.location_ids.join(','));
    }
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    const response = await api.get(`/reports/sales?${params.toString()}`);
    return response.data;
  },

  // Download sales report as CSV
  downloadSalesReportCSV: async (filters: ReportFilters): Promise<void> => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams();
    if (filters.location_ids && filters.location_ids.length > 0) {
      params.append('location_ids', filters.location_ids.join(','));
    }
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    params.append('format', 'csv');

    const url = `${API_BASE_URL}/reports/sales?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download CSV report');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `sales_report_${timestamp}.csv`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  // Helper to format cents to currency
  formatPrice: (cents: number): string => {
    return `$${(cents / 100).toFixed(2)}`;
  },
};

export default orderService;

