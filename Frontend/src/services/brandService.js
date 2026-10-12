import api from './api'

export const brandService = {
  async getAllBrands() {
    try {
      const response = await api.get('/brands')
      return response.data.brands || []
    } catch (error) {
      console.error('Get brands error:', error.response?.data || error.message)
      return []
    }
  },

  async getBrandById(id) {
    try {
      const response = await api.get('/brands/' + id)
      return response.data.brand
    } catch (error) {
      console.error('Get brand error:', error.response?.data || error.message)
      throw error
    }
  },

  async createBrand(brandData) {
    try {
      const response = await api.post('/brands', brandData)
      return response.data
    } catch (error) {
      console.error('Create brand error:', error.response?.data || error.message)
      throw error
    }
  },

  async updateBrand(id, brandData) {
    try {
      const response = await api.put('/brands/' + id, brandData)
      return response.data
    } catch (error) {
      console.error('Update brand error:', error.response?.data || error.message)
      throw error
    }
  },

  async deleteBrand(id) {
    try {
      const response = await api.delete('/brands/' + id)
      return response.data
    } catch (error) {
      console.error('Delete brand error:', error.response?.data || error.message)
      throw error
    }
  }
}

export default brandService