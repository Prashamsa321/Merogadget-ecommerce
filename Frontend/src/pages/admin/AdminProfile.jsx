import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { uploadService } from '../../services/uploadService';

const AdminProfile = () => {
  const { user, setUser, updateUser } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    photo: user?.photo || ''
  });
  const originalPhoto = useRef(user?.photo || '');
  const originalData = useRef({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      photo: originalPhoto.current,
      name: originalData.current.name,
      phone: originalData.current.phone,
      address: originalData.current.address
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

  const displayPhoto = formData.photo || '';
  const initial = formData.name?.charAt(0)?.toUpperCase() || 'A';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Recently';

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <p className="eyebrow mb-1">Account</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Admin Profile</h1>
        <p className="text-[#7A6A5A] mt-1 text-sm">Manage your profile information and photo</p>
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
                {formData.name || 'Admin'}
              </h2>
              <p className="text-sm text-[#7A6A5A] break-all mt-0.5">{formData.email}</p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                  {user?.role || 'admin'}
                </span>
                <span className="text-xs text-[#A8998A]">Member since {memberSince}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center md:justify-end gap-2 self-center md:self-auto">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all duration-300 text-sm font-bold shadow-lg shadow-orange-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
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
                placeholder="Enter address"
                className="w-full px-4 py-2.5 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
              />
            ) : (
              <p className="text-[#3D1A00] font-semibold whitespace-pre-wrap">
                {formData.address || '—'}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="px-6 md:px-8 py-5 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-3 md:gap-6 items-start md:items-center">
            <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest">
              Role
            </label>
            <span className="inline-flex items-center w-fit px-3 py-1 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
              {user?.role || 'admin'}
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
  );
};

export default AdminProfile;