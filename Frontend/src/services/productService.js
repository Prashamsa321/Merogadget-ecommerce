import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const getAuthConfig = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}

export const productService = {
  // Get all products
  async getAllProducts() {
    try {
      const response = await axios.get(`${API_URL}/products/getproduct`)
      
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

  // Get single product
  async getProductById(id) {
    try {
      const response = await axios.get(`${API_URL}/products/getproduct/${id}`)
      return response.data.product || response.data
    } catch (error) {
      console.error('Get product error:', error.response?.data || error.message)
      throw error
    }
  },

  // Create new product (Admin only)
  async createProduct(productData) {
    try {
      const response = await axios.post(
        `${API_URL}/products/createproduct`,
        productData,
        getAuthConfig()
      )
      return response.data
    } catch (error) {
      console.error('Create product error:', error.response?.data || error.message)
      throw error
    }
  },

  // Update product (Admin only)
  async updateProduct(id, productData) {
    try {
      const response = await axios.put(
        `${API_URL}/products/updateproduct/${id}`,
        productData,
        getAuthConfig()
      )
      return response.data
    } catch (error) {
      console.error('Update product error:', error.response?.data || error.message)
      throw error
    }
  },

  // Delete product (Admin only)
  async deleteProduct(id) {
    try {
      const response = await axios.delete(
        `${API_URL}/products/deleteproduct/${id}`,
        getAuthConfig()
      )
      return response.data
    } catch (error) {
      console.error('Delete product error:', error.response?.data || error.message)
      throw error
    }
  }
}

export default productService