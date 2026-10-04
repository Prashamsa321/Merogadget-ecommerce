// src/services/authService.js
import api from './api'

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  async logout() {
    try {
      const response = await api.post('/auth/logout')
      localStorage.removeItem('user')
      return response.data
    } catch (error) {
      localStorage.removeItem('user')
      throw error
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    const user = userStr ? JSON.parse(userStr) : null
    return user
  },
}

export const apiLogout = authService.logout
export const apiLogin = authService.login
export const apiRegister = authService.register
export const getCurrentUser = authService.getCurrentUser

export default authService