import api from './api'

export const otpService = {
  async sendOTP(userData) {
    try {
      const response = await api.post('/otp/send', userData)
      return response.data
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error.message)
      throw error
    }
  },

  async verifyOTP(email, otp) {
    try {
      const response = await api.post('/otp/verify', { email, otp })
      return response.data
    } catch (error) {
      console.error('Verify OTP error:', error.response?.data || error.message)
      throw error
    }
  },

  async resendOTP(email) {
    try {
      const response = await api.post('/otp/resend', { email })
      return response.data
    } catch (error) {
      console.error('Resend OTP error:', error.response?.data || error.message)
      throw error
    }
  }
}
