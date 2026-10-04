import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const contactService = {
  // Submit contact form (public)
  async submitContact(formData) {
    try {
      const response = await axios.post(`${API_URL}/contact`, formData);
      return response.data;
    } catch (error) {
      console.error('Submit contact error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Get all contacts (admin only)
  async getAllContacts() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/contact`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get single contact (admin only)
  async getContactById(id) {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/contact/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Reply to contact (admin only)
  async replyToContact(id, reply) {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/contact/${id}/reply`,
      { reply },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  // Delete contact (admin only)
  async deleteContact(id) {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/contact/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Get contact stats (admin only)
  async getContactStats() {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/contact/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};