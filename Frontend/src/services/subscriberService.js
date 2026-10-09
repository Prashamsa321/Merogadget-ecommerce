import api from './api'

export const subscriberService = {
  async subscribe(email) {
    const response = await api.post('/subscribers', { email })
    return response.data
  },

  async getAllSubscribers() {
    try {
      const response = await api.get('/subscribers')
      return response.data.subscribers || []
    } catch (error) {
      console.error('Get subscribers error:', error.response?.data || error.message)
      return []
    }
  },

  async getSubscriberStats() {
    try {
      const response = await api.get('/subscribers/stats')
      return response.data
    } catch (error) {
      console.error('Get subscriber stats error:', error.response?.data || error.message)
      return { total: 0, last7Days: 0, daily: [] }
    }
  }
}

export default subscriberService
