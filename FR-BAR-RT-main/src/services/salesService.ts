import axios from 'axios'

const API_BASE_URL = '/api/sales'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface OrderItem {
  id?: string
  product_id: string
  quantity: number
  notes?: string
}

export interface Order {
  id: string
  order_number: string
  table_id: string
  location_id: string
  waiter_id?: string
  cashier_id?: string
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled' | 'closed'
  subtotal_cents: number
  tax_cents: number
  discount_cents: number
  total_cents: number
  notes?: string
  created_at: string
  updated_at: string
  closed_at?: string
  items?: OrderItem[]
  payments?: Payment[]
}

export interface Payment {
  id: string
  order_id: string
  cashier_id: string
  amount_cents: number
  payment_method: 'cash' | 'card' | 'transfer' | 'other'
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
  reference_number?: string
  notes?: string
  created_at: string
  completed_at?: string
}

export interface CreateOrderRequest {
  table_id: string
  location_id: string
  waiter_id?: string
  items: OrderItem[]
  notes?: string
}

export interface CreatePaymentRequest {
  order_id: string
  amount_cents: number
  payment_method: 'cash' | 'card' | 'transfer' | 'other'
  reference_number?: string
  notes?: string
}

export interface CloseOrderRequest {
  payments: CreatePaymentRequest[]
  notes?: string
}

export const salesService = {
  // Orders
  async getOrders(params?: {
    location_id?: string
    table_id?: string
    waiter_id?: string
    cashier_id?: string
    status?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = queryParams.toString() ? `/orders?${queryParams}` : '/orders'
    const response = await api.get(url)
    return response.data
  },

  async getOrder(id: string) {
    const response = await api.get(`/orders/${id}`)
    return response.data
  },

  async createOrder(data: CreateOrderRequest) {
    const response = await api.post('/orders', data)
    return response.data
  },

  async updateOrder(id: string, data: {
    status?: string
    items?: OrderItem[]
    discount_cents?: number
    notes?: string
  }) {
    const response = await api.put(`/orders/${id}`, data)
    return response.data
  },

  async closeOrder(id: string, data: CloseOrderRequest) {
    const response = await api.post(`/orders/${id}/close`, data)
    return response.data
  },

  // Payments
  async getPayments(params?: {
    order_id?: string
    cashier_id?: string
    payment_method?: string
    payment_status?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = queryParams.toString() ? `/payments?${queryParams}` : '/payments'
    const response = await api.get(url)
    return response.data
  },

  async getPayment(id: string) {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },

  async createPayment(data: CreatePaymentRequest) {
    const response = await api.post('/payments', data)
    return response.data
  },

  // Cashier specific
  async getCashierOrders() {
    const response = await api.get('/cashier/orders')
    return response.data
  },

  // Sales History
  async getSalesHistory(params?: {
    location_id?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = queryParams.toString() ? `/sales/history?${queryParams}` : '/sales/history'
    const response = await api.get(url)
    return response.data
  },

  async getSalesSummary(params?: {
    location_id?: string
    start_date?: string
    end_date?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const url = queryParams.toString() ? `/sales/summary?${queryParams}` : '/sales/summary'
    const response = await api.get(url)
    return response.data
  },
}

