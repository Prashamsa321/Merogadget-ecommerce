import api from './api'

export const dashboardService = {
  async getStats() {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Get dashboard stats error:', error.response?.data || error.message)
      return null
    }
  }
}

export default dashboardService
