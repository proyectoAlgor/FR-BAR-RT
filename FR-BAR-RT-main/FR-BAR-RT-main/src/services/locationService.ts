import axios from 'axios'

const API_BASE_URL = '/api/venue'

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

export const locationService = {
  async getLocations() {
    const response = await api.get('/locations')
    return response.data
  },

  async getLocation(id: string) {
    const response = await api.get(`/locations/${id}`)
    return response.data
  },

  async createLocation(data: { code: string; name: string; address: string }) {
    const response = await api.post('/locations', data)
    return response.data
  },

  async getTables(locationId: string) {
    const response = await api.get(`/${locationId}/tables`)
    return response.data
  },

  async getTable(id: string) {
    const response = await api.get(`/tables/${id}`)
    return response.data
  },

  async createTable(data: { location_id: string; code: string; seats: number }) {
    const response = await api.post('/tables', data)
    return response.data
  },

  async updateTableStatus(id: string, status: string) {
    const response = await api.put(`/tables/${id}/status`, { status })
    return response.data
  },

  async updateLocation(id: string, data: { name: string; address: string; phone?: string }) {
    const response = await api.put(`/locations/${id}`, data)
    return response.data
  },

  async deleteLocation(id: string) {
    const response = await api.delete(`/locations/${id}`)
    return response.data
  },

  async updateTable(id: string, data: { code: string; seats: number }) {
    const response = await api.put(`/tables/${id}`, data)
    return response.data
  },

  async deleteTable(id: string) {
    const response = await api.delete(`/tables/${id}`)
    return response.data
  },
}
