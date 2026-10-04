import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to get auth config
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

export const categoryService = {
  // Get all categories (public - no token needed)
  async getAllCategories() {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      return response.data.categories || [];
    } catch (error) {
      console.error('Get categories error:', error.response?.data || error.message);
      return [];
    }
  },

  // Get single category
  async getCategoryById(id) {
    try {
      const response = await axios.get(`${API_URL}/categories/${id}`);
      return response.data.category;
    } catch (error) {
      console.error('Get category error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Create category (admin only)
  async createCategory(categoryData) {
    try {
      const response = await axios.post(
        `${API_URL}/categories`,
        categoryData,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Create category error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Update category (admin only) - PUT method
  async updateCategory(id, categoryData) {
    try {
      const response = await axios.put(
        `${API_URL}/categories/${id}`,
        categoryData,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Update category error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Delete category (admin only)
  async deleteCategory(id) {
    try {
      const response = await axios.delete(
        `${API_URL}/categories/${id}`,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Delete category error:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default categoryService;