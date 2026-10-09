import api from './api'

export const categoryService = {
  async getAllCategories() {
    try {
      const response = await api.get('/categories')
      return response.data.categories || []
    } catch (error) {
      console.error('Get categories error:', error.response?.data || error.message)
      return []
    }
  },

  async getCategoryById(id) {
    try {
      const response = await api.get('/categories/' + id)
      return response.data.category
    } catch (error) {
      console.error('Get category error:', error.response?.data || error.message)
      throw error
    }
  },

  async createCategory(categoryData) {
    try {
      const response = await api.post('/categories', categoryData)
      return response.data
    } catch (error) {
      console.error('Create category error:', error.response?.data || error.message)
      throw error
    }
  },

  async updateCategory(id, categoryData) {
    try {
      const response = await api.put('/categories/' + id, categoryData)
      return response.data
    } catch (error) {
      console.error('Update category error:', error.response?.data || error.message)
      throw error
    }
  },

  async deleteCategory(id) {
    try {
      const response = await api.delete('/categories/' + id)
      return response.data
    } catch (error) {
      console.error('Delete category error:', error.response?.data || error.message)
      throw error
    }
  }
}

export default categoryService
