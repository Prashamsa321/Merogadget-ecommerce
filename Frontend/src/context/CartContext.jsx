import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { cartService } from '../services/cartService'
import { useAuth } from './AuthContext'

export const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user, isAuthenticated } = useAuth()

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setCartItems([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await cartService.getCart()
      setCartItems(data.items || [])
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      setError(error.response?.data?.message || 'Failed to fetch cart')
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated || !user) {
      // Return specific error for toast display
      return { 
        success: false, 
        error: 'Please login to add items to cart',
        notAuthenticated: true 
      };
    }

    if (!productId) {
      return { success: false, error: 'Invalid product' };
    }

    try {
      setLoading(true);
      setError(null);
      const data = await cartService.addToCart(productId, quantity);
      
      if (data.alreadyInCart) {
        return { 
          success: false, 
          alreadyInCart: true, 
          message: data.message,
          error: data.message
        };
      }
      
      setCartItems(data.items || []);
      return { success: true };
    } catch (error) {
      if (error.response?.data?.alreadyInCart) {
        return { 
          success: false, 
          alreadyInCart: true, 
          message: error.response.data.message,
          error: error.response.data.message
        };
      }
      
      const errorMessage = error.response?.data?.message || 'Failed to add to cart';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (!isAuthenticated || !user) return

    try {
      setLoading(true)
      setError(null)
      const data = await cartService.updateCartItem(productId, quantity)
      setCartItems(data.items || [])
    } catch (error) {
      console.error('Failed to update quantity:', error)
      setError(error.response?.data?.message || 'Failed to update quantity')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const removeFromCart = useCallback(async (productId) => {
    if (!isAuthenticated || !user) return

    try {
      setLoading(true)
      setError(null)
      const data = await cartService.removeFromCart(productId)
      setCartItems(data.items || [])
    } catch (error) {
      console.error('Failed to remove from cart:', error)
      setError(error.response?.data?.message || 'Failed to remove from cart')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const clearCart = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      setLoading(true)
      setError(null)
      const data = await cartService.clearCart()
      setCartItems(data.items || [])
    } catch (error) {
      console.error('Failed to clear cart:', error)
      setError(error.response?.data?.message || 'Failed to clear cart')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const getCartCount = useCallback(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.length;
  }, [cartItems])

  const getCartTotal = useCallback(() => {
    if (!Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + ((item.price || 0) * (item.quantity || 0)), 0)
  }, [cartItems])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchCart()
    } else {
      setCartItems([])
    }
  }, [isAuthenticated, user, fetchCart])

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    getCartCount,
    getCartTotal
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}