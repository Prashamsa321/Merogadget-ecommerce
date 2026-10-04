import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const otpService = {
  // Send OTP for registration
  async sendOTP(userData) {
    try {
      const response = await axios.post(`${API_URL}/otp/send`, userData);
      return response.data;
    } catch (error) {
      console.error('Send OTP error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await axios.post(`${API_URL}/otp/verify`, { email, otp });
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Resend OTP
  async resendOTP(email) {
    try {
      const response = await axios.post(`${API_URL}/otp/resend`, { email });
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error.response?.data || error.message);
      throw error;
    }
  }
};