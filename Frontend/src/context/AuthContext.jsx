import React, { createContext, useState, useContext, useEffect } from 'react'
import api from '../services/api'

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

  // Load user from localStorage + refresh from server
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          setToken(storedToken)
          api.defaults.headers.common['Authorization'] = 'Bearer ' + storedToken

          // Fetch fresh user data from backend to ensure nothing is stale
          try {
            const res = await api.get('/auth/me')
            if (res.data?.user) {
              setUser(res.data.user)
              localStorage.setItem('user', JSON.stringify(res.data.user))
            }
          } catch (err) {
            console.warn('Failed to refresh user data:', err.message)
            // If token expired, log out
            if (err.response?.status === 401) {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              setUser(null)
              setIsAuthenticated(false)
              setToken(null)
              delete api.defaults.headers.common['Authorization']
            }
          }
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
      const response = await api.post('/auth/login', { email, password })

      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      setUser(user)
      setIsAuthenticated(true)

      api.defaults.headers.common['Authorization'] = 'Bearer ' + token

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
      const response = await api.post('/auth/register', { name, email, password })

      const { token, user } = response.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setToken(token)
      setUser(user)
      setIsAuthenticated(true)

      api.defaults.headers.common['Authorization'] = 'Bearer ' + token

      return { success: true, user }
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // Update user (persists to localStorage + updates state)
  const updateUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    setToken(null)
    setUser(null)
    setIsAuthenticated(false)

    delete api.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    setUser,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}