import api from './api'

export const contactService = {
  async submitContact(formData) {
    try {
      const response = await api.post('/contact', formData)
      return response.data
    } catch (error) {
      console.error('Submit contact error:', error.response?.data || error.message)
      throw error
    }
  },

  async getAllContacts() {
    const response = await api.get('/contact')
    return response.data
  },

  async getContactById(id) {
    const response = await api.get('/contact/' + id)
    return response.data
  },

  async replyToContact(id, reply) {
    const response = await api.put('/contact/' + id + '/reply', { reply })
    return response.data
  },

  async deleteContact(id) {
    const response = await api.delete('/contact/' + id)
    return response.data
  },

  async getContactStats() {
    const response = await api.get('/contact/stats')
    return response.data
  }
}
