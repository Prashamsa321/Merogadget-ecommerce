import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const AdminSettings = () => {
  const { user, token } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
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

    setLoading(true);
    try {
      await axios.put(
        'http://localhost:5000/api/auth/change-password',
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="eyebrow mb-1">Account</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Security Settings</h1>
        <p className="text-[#7A6A5A] mt-1 text-sm">Change your admin account password</p>
      </div>

      {/* Change Password Card */}
      <div className="bg-white rounded-3xl shadow-soft border border-orange-100 overflow-hidden">

        {/* Card Header */}
        <div className="bg-[#3D1A00] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
              🔒
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Change Password</h2>
              <p className="text-[#D4C4B0] text-xs mt-0.5">Update your password to keep your account secure</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">

          {/* Current Password */}
          <div>
            <label className="block text-sm font-bold text-[#3D1A00] mb-2">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Enter current password"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-bold text-[#3D1A00] mb-2">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-bold text-[#3D1A00] mb-2">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="Confirm new password"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Changing Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* Password Tips */}
      <div className="mt-6 bg-[#FFF4E6] rounded-3xl p-5 border border-orange-100">
        <h3 className="text-sm font-bold text-[#3D1A00] mb-3 flex items-center gap-2">
          <span>💡</span> Password Tips
        </h3>
        <ul className="text-xs text-[#7A6A5A] space-y-2 ml-1">
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            Use at least 6 characters
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            Combine letters, numbers, and special characters
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            Avoid using common words or personal information
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-500 mt-0.5">✓</span>
            Don't reuse passwords across different accounts
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSettings;