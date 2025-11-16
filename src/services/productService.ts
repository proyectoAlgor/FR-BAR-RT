import axios from 'axios'

const API_BASE_URL = '/api/catalog'

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

export const productService = {
  async getCategories() {
    const response = await api.get('/categories')
    return response.data
  },

  async getCategory(id: string) {
    const response = await api.get(`/categories/${id}`)
    return response.data
  },

  async createCategory(data: { name: string }) {
    const response = await api.post('/categories', data)
    return response.data
  },

  async getProducts(categoryId?: string) {
    const url = categoryId ? `/products?category_id=${categoryId}` : '/products'
    const response = await api.get(url)
    return response.data
  },

  async getProduct(id: string) {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  async createProduct(data: { category_id?: string; code: string; name: string; price_cents: number }) {
    const response = await api.post('/products', data)
    return response.data
  },

  async updateProduct(id: string, data: { category_id?: string; code: string; name: string; price_cents: number }) {
    const response = await api.put(`/products/${id}`, data)
    return response.data
  },

  async deleteProduct(id: string) {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  async updateCategory(id: string, data: { name: string }) {
    const response = await api.put(`/categories/${id}`, data)
    return response.data
  },

  async deleteCategory(id: string) {
    const response = await api.delete(`/categories/${id}`)
    return response.data
  },
}
