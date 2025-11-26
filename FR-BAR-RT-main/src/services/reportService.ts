import axios from 'axios'

const API_BASE_URL = '/api/reports'

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

export interface UserReport {
  total_users: number
  active_users: number
  inactive_users: number
  users_by_role: Array<{
    role_code: string
    role_name: string
    count: number
  }>
  users_by_location: Array<{
    location_id: string
    location_name: string
    count: number
  }>
  recent_logins: number
  failed_logins: number
}

export interface ProductReport {
  total_products: number
  active_products: number
  inactive_products: number
  products_by_category: Array<{
    category_id: string
    category_name: string
    count: number
  }>
  average_price: number
  price_range: {
    min: number
    max: number
  }
}

export interface VenueReport {
  total_locations: number
  active_locations: number
  total_tables: number
  tables_by_status: Array<{
    status: string
    count: number
  }>
  location_details: Array<{
    location_id: string
    location_name: string
    code: string
    total_tables: number
    available_tables: number
    occupied_tables: number
    reserved_tables: number
  }>
}

export interface ActivityReport {
  total_login_attempts: number
  successful_logins: number
  failed_logins: number
  login_attempts_by_day: Array<{
    date: string
    count: number
  }>
  recent_failed_logins: Array<{
    email: string
    ip_address: string
    attempted_at: string
  }>
  password_resets: number
  password_resets_by_day: Array<{
    date: string
    count: number
  }>
}

export interface VenueSpecificReport {
  location_id: string
  location_name: string
  location_code: string
  total_tables: number
  tables_status: {
    status: string
    count: number
  }
  assigned_users: number
  user_details: Array<{
    user_id: string
    email: string
    first_name: string
    last_name: string
    roles: string[]
    is_active: boolean
  }>
}

export interface AnalyticsReport {
  generated_at: string
  user_report: UserReport
  product_report: ProductReport
  venue_report: VenueReport
  activity_report: ActivityReport
}

export const reportService = {
  async getAnalyticsReport(): Promise<AnalyticsReport> {
    const response = await api.get('/analytics')
    return response.data
  },

  async getUserReport(): Promise<UserReport> {
    const response = await api.get('/users')
    return response.data
  },

  async getProductReport(): Promise<ProductReport> {
    const response = await api.get('/products')
    return response.data
  },

  async getVenueReport(): Promise<VenueReport> {
    const response = await api.get('/venues')
    return response.data
  },

  async getActivityReport(days?: number): Promise<ActivityReport> {
    const params = days ? { days } : {}
    const response = await api.get('/activity', { params })
    return response.data
  },

  async getVenueSpecificReport(locationId: string): Promise<VenueSpecificReport> {
    const response = await api.get(`/venue/${locationId}`)
    return response.data
  },
}

