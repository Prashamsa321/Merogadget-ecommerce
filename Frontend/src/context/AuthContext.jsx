import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

export const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage directly
  useEffect(() => {
    const loadUser = () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          setToken(storedToken)
          axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
        } catch (error) {
          console.error('Error parsing user data:', error)
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      })
      
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      setUser(user)
      setIsAuthenticated(true)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      return { success: true, user }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password
      })
      
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      setUser(user)
      setIsAuthenticated(true)
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      return { success: true, user }
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      }
    }
  }

  // Logout function - FIXED (removed API call)
  const logout = () => {
    // Clear local storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    // Clear state
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
    
    // Remove axios default header
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}