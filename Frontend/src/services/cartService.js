import api from './api'

export const cartService = {
  async getCart() {
    try {
      const response = await api.get('/cart')
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
      const response = await api.post('/cart/addtocart', { productId, quantity })
      console.log('Add to cart response:', response.data)
      return {
        success: response.data.success,
        alreadyInCart: response.data.alreadyInCart || false,
        message: response.data.message,
        items: response.data?.items || [],
        totalAmount: response.data?.totalAmount || 0
      }
    } catch (error) {
      throw error
    }
  },

  async updateCartItem(productId, quantity) {
    try {
      const response = await api.put('/cart/update', { productId, quantity })
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
      const response = await api.delete('/cart/remove/' + productId)
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
      const response = await api.delete('/cart/clear')
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
