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

export const cartService = {
  async getCart() {
    try {
      const response = await axios.get(`${API_URL}/cart`, getAuthConfig())
      return {
        items: response.data?.items || [],
        totalAmount: response.data?.totalAmount || 0
      }
    } catch (error) {
      console.error('Get cart error:', error.response?.data || error.message)
      throw error
    }
  },

  async addToCart(productId, quantity = 1) {
    try {
      const response = await axios.post(
        `${API_URL}/cart/addtocart`,
        { productId, quantity },
        getAuthConfig()
      );
      console.log('Add to cart response:', response.data);
      return {
        success: response.data.success,
        alreadyInCart: response.data.alreadyInCart || false,
        message: response.data.message,
        items: response.data?.items || [],
        totalAmount: response.data?.totalAmount || 0
      };
    } catch (error) {
      throw error;
    }
  },

  async updateCartItem(productId, quantity) {
    try {
      const response = await axios.put(
        `${API_URL}/cart/update`,
        { productId, quantity },
        getAuthConfig()
      )
      return {
        items: response.data?.items || [],
        totalAmount: response.data?.totalAmount || 0
      }
    } catch (error) {
      console.error('Update cart error:', error.response?.data || error.message)
      throw error
    }
  },

  async removeFromCart(productId) {
    try {
      const response = await axios.delete(
        `${API_URL}/cart/remove/${productId}`,
        getAuthConfig()
      )
      return {
        items: response.data?.items || [],
        totalAmount: response.data?.totalAmount || 0
      }
    } catch (error) {
      console.error('Remove from cart error:', error.response?.data || error.message)
      throw error
    }
  },

  async clearCart() {
    try {
      const response = await axios.delete(`${API_URL}/cart/clear`, getAuthConfig())
      return {
        items: response.data?.items || [],
        totalAmount: response.data?.totalAmount || 0
      }
    } catch (error) {
      console.error('Clear cart error:', error.response?.data || error.message)
      throw error
    }
  }
}

export default cartService