import api from './api'

export const productService = {
  async getAllProducts() {
    try {
      const response = await api.get('/products/getproduct')
      if (response.data && response.data.success && Array.isArray(response.data.products)) {
        return response.data.products
      } else if (Array.isArray(response.data)) {
        return response.data
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data
      } else {
        console.error('Unexpected response format:', response.data)
        return []
      }
    } catch (error) {
      console.error('Get products error:', error.response?.data || error.message)
      throw error
    }
  },

  async getProductById(id) {
    try {
      const response = await api.get(`/products/getproduct/${id}`)
      return response.data.product || response.data
    } catch (error) {
      console.error('Get product error:', error.response?.data || error.message)
      throw error
    }
  },

  async createProduct(productData) {
    try {
      const response = await api.post('/products/createproduct', productData)
      return response.data
    } catch (error) {
      console.error('Create product error:', error.response?.data || error.message)
      throw error
    }
  },

  async updateProduct(id, productData) {
    try {
      const response = await api.put(`/products/updateproduct/${id}`, productData)
      return response.data
    } catch (error) {
      console.error('Update product error:', error.response?.data || error.message)
      throw error
    }
  },

  async deleteProduct(id) {
    try {
      const response = await api.delete(`/products/deleteproduct/${id}`)
      return response.data
    } catch (error) {
      console.error('Delete product error:', error.response?.data || error.message)
      throw error
    }
  }
}

export default productService
