import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import api from '../services/api';
import { uploadService } from '../services/uploadService';

const ProfilePage = () => {
  const { user, token, isAuthenticated, loading: authLoading, updateUser, setUser } = useAuth();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    photo: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const originalPhoto = useRef('');
  const originalData = useRef({ name: '', phone: '', address: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      const initialPhoto = user.photo || '';
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        photo: initialPhoto
      });
      originalPhoto.current = initialPhoto;
      originalData.current = {
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      };
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      error('Image must be less than 10MB');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      error('File must be an image');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      const result = await uploadService.uploadImage(file, 'merogadget/profiles');
      setFormData(prev => ({ ...prev, photo: result.url }));
      if (!isEditing) setIsEditing(true);
      success('Photo uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, photo: '' }));
    if (!isEditing) setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(prev => ({
      ...prev,
      name: originalData.current.name,
      phone: originalData.current.phone,
      address: originalData.current.address,
      photo: originalPhoto.current
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.put('/auth/updateprofile', formData);

      if (response.data?.user) {
        if (typeof updateUser === 'function') {
          updateUser(response.data.user);
        } else {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          if (typeof setUser === 'function') setUser(response.data.user);
        }
      }

      originalPhoto.current = formData.photo;
      originalData.current = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };
      success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update profile');
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
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        success(response.data.message || 'Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowChangePassword(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      error(errorMessage);

      if (err.response?.status === 401) {
        error('Session expired. Please login again.');
        setTimeout(() => { window.location.href = '/login'; }, 2000);
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
      <div className="min-h-screen bg-cream py-16 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="container mx-auto max-w-xl">
          <div className="bg-white rounded-3xl border border-orange-100 shadow-soft p-10 text-center">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
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

  const displayPhoto = formData.photo || '';
  const initial = formData.name?.charAt(0)?.toUpperCase() || 'U';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="min-h-screen bg-cream py-10 px-4 sm:px-6 lg:px-10 xl:px-16">
      <div className="container mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6">
          <p className="eyebrow mb-1">Account</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">My Profile</h1>
          <p className="text-[#7A6A5A] mt-1 text-sm">Manage your personal information and photo</p>
        </div>

        {/* Top Card — Avatar + Identity */}
        <div className="bg-white rounded-3xl shadow-soft border border-orange-100 overflow-hidden mb-5">
          <div className="px-6 md:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-6">

              {/* Avatar */}
              <div className="flex-shrink-0 self-center md:self-auto">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-orange-100 shadow-lg shadow-orange-500/10 bg-gradient-to-br from-orange-500 to-[#C2410C] flex items-center justify-center">
                  {displayPhoto ? (
                    <img
                      src={displayPhoto}
                      alt={formData.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-white text-4xl font-bold">{initial}</span>
                  )}
                </div>
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-[#3D1A00] truncate">
                  {formData.name || 'User'}
                </h2>
                <p className="text-sm text-[#7A6A5A] break-all mt-0.5">{formData.email}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold rounded-full bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-wider">
                    {user?.role || 'user'}
                  </span>
                  <span className="text-xs text-[#A8998A]">Member since {memberSince}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap justify-center md:justify-end gap-2 self-center md:self-auto">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        setShowChangePassword(!showChangePassword);
                        if (isEditing) setIsEditing(false);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-cream border border-orange-200 text-[#3D1A00] rounded-full hover:bg-orange-50 transition-all duration-300 text-sm font-bold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Password
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowChangePassword(false);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all duration-300 text-sm font-bold shadow-lg shadow-orange-500/20"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Profile
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all duration-300 text-sm font-bold shadow-lg shadow-orange-500/20 disabled:opacity-60 disabled:cursor-wait"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          {displayPhoto ? 'Change' : 'Upload'}
                        </>
                      )}
                    </button>

                    {displayPhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 border border-red-100 transition-all duration-300 text-sm font-bold disabled:opacity-60"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Change Password Card */}
        {showChangePassword && !isEditing && (
          <div className="bg-white rounded-3xl shadow-soft border border-orange-100 overflow-hidden mb-5">
            <div className="px-6 md:px-8 py-5 border-b border-orange-100">
              <h3 className="text-base font-bold text-[#3D1A00]">Change Password</h3>
              <p className="text-xs text-[#A8998A] mt-0.5">Update your account password</p>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 md:p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Enter current password"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 sm:flex-initial sm:min-w-[180px] bg-orange-600 text-white py-3 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-50 shadow-lg shadow-orange-500/20"
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 sm:flex-initial sm:min-w-[140px] bg-white border border-orange-200 text-[#3D1A00] py-3 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Details Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-soft border border-orange-100 overflow-hidden">

          <div className="px-6 md:px-8 py-5 border-b border-orange-100">
            <h3 className="text-base font-bold text-[#3D1A00]">Personal Information</h3>
            <p className="text-xs text-[#A8998A] mt-0.5">
              {isEditing ? 'Editing — update the fields below' : 'View your account details'}
            </p>
          </div>

          <div className="divide-y divide-orange-50">

            {/* Full Name */}
            <div className="px-6 md:px-8 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-6 items-start md:items-center">
              <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-[#3D1A00] font-semibold">{formData.name || '—'}</p>
              )}
            </div>

            {/* Email */}
            <div className="px-6 md:px-8 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-6 items-start md:items-center">
              <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest">
                Email
              </label>
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-[#3D1A00] font-semibold break-all">{formData.email}</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full border border-orange-100 uppercase tracking-wider flex-shrink-0">
                  Locked
                </span>
              </div>
            </div>

            {/* Phone */}
            <div className="px-6 md:px-8 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-6 items-start md:items-center">
              <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2.5 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                />
              ) : (
                <p className="text-[#3D1A00] font-semibold">{formData.phone || '—'}</p>
              )}
            </div>

            {/* Address */}
            <div className="px-6 md:px-8 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-6 items-start">
              <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest md:pt-2.5">
                Address
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter your address"
                  className="w-full px-4 py-2.5 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
                />
              ) : (
                <p className="text-[#3D1A00] font-semibold whitespace-pre-wrap">
                  {formData.address || '—'}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div className="px-6 md:px-8 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-6 items-start md:items-center">
              <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest">
                Account Type
              </label>
              <span className="inline-flex items-center w-fit px-3 py-1 text-xs font-bold rounded-full bg-orange-50 text-orange-700 border border-orange-100 uppercase tracking-wider">
                {user?.role || 'user'}
              </span>
            </div>

          </div>

          {/* Actions */}
          {isEditing && (
            <div className="px-6 md:px-8 py-5 border-t border-orange-100 bg-[#FFF4E6]/50 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 sm:flex-initial sm:min-w-[180px] bg-orange-600 text-white py-3 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 sm:flex-initial sm:min-w-[140px] bg-white border border-orange-200 text-[#3D1A00] py-3 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;