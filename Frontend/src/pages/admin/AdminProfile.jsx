import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const AdminProfile = () => {
  const { user, token } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        'http://localhost:5000/api/auth/updateprofile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="eyebrow mb-1">Account</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Admin Profile</h1>
        <p className="text-[#7A6A5A] mt-1 text-sm">Manage your profile information</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-soft border border-orange-100 overflow-hidden">

        {/* Card Header */}
        <div className="bg-[#FFF4E6] px-6 py-5 border-b border-orange-100">
          <div className="flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-[#3D1A00]">Profile Information</h2>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all duration-300 text-sm font-bold shadow-lg shadow-orange-500/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-[#3D1A00] mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-3 border rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ${
                  !isEditing
                    ? 'bg-orange-50/50 border-orange-100 text-[#7A6A5A] cursor-not-allowed'
                    : 'bg-cream border-orange-100 hover:border-orange-300'
                }`}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-[#3D1A00] mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-2xl text-[#7A6A5A] cursor-not-allowed"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-[#A8998A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-[#A8998A] mt-1.5">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-[#3D1A00] mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Enter phone number"
                className={`w-full px-4 py-3 border rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ${
                  !isEditing
                    ? 'bg-orange-50/50 border-orange-100 text-[#7A6A5A] cursor-not-allowed'
                    : 'bg-cream border-orange-100 hover:border-orange-300'
                }`}
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-bold text-[#3D1A00] mb-2">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
                placeholder="Enter address"
                className={`w-full px-4 py-3 border rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 resize-none ${
                  !isEditing
                    ? 'bg-orange-50/50 border-orange-100 text-[#7A6A5A] cursor-not-allowed'
                    : 'bg-cream border-orange-100 hover:border-orange-300'
                }`}
              />
            </div>

            {/* Actions */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-orange-100">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-600 text-white py-3.5 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-cream border border-orange-200 text-[#3D1A00] py-3.5 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;