import axios from 'axios'

const API_BASE_URL = '/api/auth'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post('/login', { email, password })
    return response.data
  },

  async register(token: string, userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    document_number: string;
    document_type: string;
    venue_id?: string;
  }) {
    const response = await api.post('/register', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getProfile(token: string) {
    const response = await api.get('/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getAllUsers(token: string) {
    const response = await api.get('/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getUser(token: string, userId: string) {
    const response = await api.get(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async updateUser(token: string, userId: string, userData: { full_name: string; is_active: boolean }) {
    const response = await api.put(`/users/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async deleteUser(token: string, userId: string) {
    const response = await api.delete(`/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async getAllRoles(token: string) {
    const response = await api.get('/roles', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async assignRole(token: string, userId: string, roleId: number) {
    const response = await api.post(`/users/${userId}/roles`, { role_id: roleId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async removeRole(token: string, userId: string, roleId: number) {
    const response = await api.delete(`/users/${userId}/roles/${roleId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  // Location assignment methods
  async getUserLocations(token: string, userId: string) {
    const response = await api.get(`/users/${userId}/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async assignLocation(token: string, userId: string, locationId: string) {
    const response = await api.post(`/users/${userId}/locations`, { location_id: locationId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  async removeLocation(token: string, userId: string, locationId: string) {
    const response = await api.delete(`/users/${userId}/locations/${locationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}
