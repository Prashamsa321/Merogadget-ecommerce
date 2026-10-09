import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';


const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { success, error: toastError, info } = useToast();

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      toastError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/password/forgot`, { email });
      if (response.data.success) {
        success('OTP sent to your email!');
        setStep(2);
        setCountdown(60);
        startCountdown();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toastError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/password/verify-otp`, { email, otp });
      if (response.data.success) {
        success('OTP verified!');
        setStep(3);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toastError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/password/reset`, {
        email,
        otp,
        newPassword,
        confirmPassword
      });
      if (response.data.success) {
        success('Password reset successfully! Please login with your new password.');
        window.location.href = '/login';
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/password/forgot`, { email });
      if (response.data.success) {
        success('OTP resent successfully!');
        setCountdown(60);
        startCountdown();
        if (response.data.devOTP) {
          info(`Development OTP: ${response.data.devOTP}`);
        }
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 sm:px-6 lg:px-10 xl:px-16 py-12">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-full bg-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/30">
              🛒
            </div>
            <span className="text-2xl font-bold text-[#3D1A00]">MeroGadget</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-soft p-8 md:p-10">

          {/* Step indicator */}
          <div className="flex justify-center items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-50 text-[#A8998A] border border-orange-100'
                }`}>
                  {s}
                </div>
                {s < 3 && (
                  <div className={`w-8 h-0.5 rounded-full transition-all ${
                    step > s ? 'bg-orange-600' : 'bg-orange-100'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <p className="eyebrow mb-2">
              {step === 1 && 'Reset password'}
              {step === 2 && 'Verify code'}
              {step === 3 && 'New password'}
            </p>
            <h2 className="text-3xl font-bold text-[#3D1A00] mb-2">
              {step === 1 && 'Forgot password?'}
              {step === 2 && 'Check your email'}
              {step === 3 && 'Reset password'}
            </h2>
            <p className="text-[#7A6A5A] text-sm">
              {step === 1 && 'Enter your email to receive a reset code'}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && 'Create your new password'}
            </p>
          </div>

          {/* Step 1 — Email */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleSendOTP}>
              <div>
                <label className="block text-sm font-semibold text-[#3D1A00] mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-orange-600 hover:text-orange-700 text-sm font-semibold">
                  ← Back to login
                </Link>
              </div>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form className="space-y-5" onSubmit={handleVerifyOTP}>
              <div>
                <label className="block text-sm font-semibold text-[#3D1A00] mb-2">
                  Verification code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-4 py-4 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] text-center text-3xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="000000"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0}
                  className="text-orange-600 hover:text-orange-700 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3 — New Password */}
          {step === 3 && (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              <div>
                <label className="block text-sm font-semibold text-[#3D1A00] mb-2">
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="At least 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#3D1A00] mb-2">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="Repeat your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
          )}
        </div>

        {/* Footer help */}
        <p className="text-center text-xs text-[#A8998A] mt-6">
          Need help? <a href="/contact" className="text-orange-600 hover:text-orange-700 font-semibold">Contact support</a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;