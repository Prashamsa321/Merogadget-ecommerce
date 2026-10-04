import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import axios from 'axios';

const ProfilePage = () => {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  console.log('ProfilePage - authLoading:', authLoading);
  console.log('ProfilePage - isAuthenticated:', isAuthenticated);
  console.log('ProfilePage - user:', user);
  console.log('ProfilePage - token:', token);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
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

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!token) {
      error('Please login again to change password');
      return;
    }

    if (!passwordData.currentPassword) {
      error('Please enter your current password');
      return;
    }
    if (!passwordData.newPassword) {
      error('Please enter a new password');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      error('New password must be at least 6 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await axios.put(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        success(response.data.message || 'Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowChangePassword(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      error(errorMessage);

      if (err.response?.status === 401) {
        error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#7A6A5A]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-cream py-16">
        <div className="container mx-auto max-w-xl">
          <div className="bg-white rounded-3xl border border-orange-100 shadow-soft p-10 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
              🔒
            </div>
            <h2 className="text-2xl font-bold text-[#3D1A00] mb-2">Not logged in</h2>
            <p className="text-[#7A6A5A] mb-6">Please login to view your profile</p>
            <a
              href="/login"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-all"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-10">
          <p className="eyebrow mb-2">My account</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3D1A00] mb-3">Profile</h1>
          <p className="text-[#7A6A5A]">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-soft overflow-hidden">

          {/* Card Header */}
          <div className="bg-gradient-to-r from-[#3D1A00] to-[#5C3317] px-6 py-5">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Profile information</h2>
              </div>
              <div className="flex gap-3">
                {!isEditing && (
                  <button
                    onClick={() => setShowChangePassword(!showChangePassword)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-full hover:bg-orange-600 transition-all duration-300 text-sm font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </button>
                )}
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all duration-300 text-sm font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          {showChangePassword && !isEditing && (
            <div className="p-6 md:p-8 border-b border-orange-100 bg-orange-50/40">
              <h3 className="text-lg font-bold text-[#3D1A00] mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Change password
              </h3>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Current password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-white border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#3D1A00] mb-2">New password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-white border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="At least 6 characters"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Confirm new password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-3 bg-white border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      placeholder="Repeat new password"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-full font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Changing...
                      </>
                    ) : 'Update password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePassword(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                    className="flex-1 bg-cream border border-orange-200 text-[#3D1A00] py-3 rounded-full font-semibold hover:bg-orange-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Full name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full px-4 py-3 border rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                    !isEditing
                      ? 'bg-orange-50/50 border-orange-100 cursor-not-allowed'
                      : 'bg-cream border-orange-100 hover:border-orange-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Email address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-orange-50/50 border border-orange-100 rounded-2xl text-[#7A6A5A] cursor-not-allowed"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-[#A8998A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-[#A8998A] mt-1.5">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Phone number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter phone number"
                  className={`w-full px-4 py-3 border rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all ${
                    !isEditing
                      ? 'bg-orange-50/50 border-orange-100 cursor-not-allowed'
                      : 'bg-cream border-orange-100 hover:border-orange-300'
                  }`}
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  placeholder="Enter your address"
                  className={`w-full px-4 py-3 border rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none ${
                    !isEditing
                      ? 'bg-orange-50/50 border-orange-100 cursor-not-allowed'
                      : 'bg-cream border-orange-100 hover:border-orange-300'
                  }`}
                />
              </div>

              {/* Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-6 border-t border-orange-100">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-full font-semibold hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Save changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-cream border border-orange-200 text-[#3D1A00] py-3 rounded-full font-semibold hover:bg-orange-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Account Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Account type</p>
                <p className="text-[#3D1A00] font-bold capitalize">{user?.role || 'User'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Member since</p>
                <p className="text-[#3D1A00] font-bold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Orders</p>
                <p className="text-[#3D1A00] font-bold">View History</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;