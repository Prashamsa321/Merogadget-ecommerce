import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { otpService } from '../services/otpService';

const RegisterPage = () => {
  const { register } = useAuth();
  const { success, error: toastError, info } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toastError('Please enter your name');
      return;
    }
    if (!formData.email.trim()) {
      toastError('Please enter your email');
      return;
    }
    if (!formData.password) {
      toastError('Please enter a password');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toastError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      toastError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await otpService.sendOTP({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });

      if (result.success) {
        success('OTP sent to your email!');
        setOtpEmail(formData.email);
        setStep(2);
        setCountdown(60);
        startCountdown();

        if (result.devOTP) {
          info(`Development OTP: ${result.devOTP}`);
          console.log('Development OTP:', result.devOTP);
        }
      } else {
        toastError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

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

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toastError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await otpService.verifyOTP(otpEmail, otp);

      if (result.success) {
        const registerResult = await register(
          result.userData.name,
          otpEmail,
          result.userData.password
        );

        if (registerResult.success) {
          success('Account created successfully!');
          if (registerResult.user?.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } else {
          toastError(registerResult.error || 'Registration failed');
        }
      } else {
        toastError(result.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const result = await otpService.resendOTP(otpEmail);
      if (result.success) {
        success('OTP resent successfully!');
        setCountdown(60);
        startCountdown();
        if (result.devOTP) {
          info(`Development OTP: ${result.devOTP}`);
        }
      } else {
        toastError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 sm:px-6 lg:px-10 xl:px-16 py-12">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 p-8 md:p-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 overflow-hidden">
              <img
                src="/Logo.png"
                alt="MeroGadget icon"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl font-bold text-[#3D1A00] tracking-tight">
              Mero<span className="text-orange-600">Gadget</span>
            </span>
          </Link>
          <Link to="/" className="text-orange-600 text-sm font-semibold hover:text-orange-700">
            ← Home
          </Link>
        </div>

        {step === 1 ? (
          <>
            <p className="eyebrow mb-2">Join the club</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3D1A00] mb-3">
              Create your account
            </h1>
            <p className="text-[#7A6A5A] mb-8">
              Save your favorites and make every order feel like home.
            </p>

            <form className="space-y-5" onSubmit={handleSendOTP}>
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#3D1A00] mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#3D1A00] mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#3D1A00] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="At least 6 characters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#3D1A00] mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="Repeat your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-orange-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending OTP...
                  </span>
                ) : 'Continue'}
              </button>

              <p className="text-center text-sm text-[#7A6A5A]">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-600 font-semibold hover:text-orange-700">
                  Sign in
                </Link>
              </p>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="eyebrow mb-2">One more step</p>
              <h2 className="text-3xl font-bold text-[#3D1A00] mb-3">Verify your email</h2>
              <p className="text-[#7A6A5A]">
                Enter the 6-digit code sent to<br />
                <span className="text-orange-600 font-semibold">{otpEmail}</span>
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleVerifyOTP}>
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-[#3D1A00] mb-2 text-center">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength="6"
                  className="w-full px-4 py-4 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] text-center text-3xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-orange-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </span>
                ) : 'Verify & Register'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || resendLoading}
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0
                    ? `Resend code in ${countdown}s`
                    : resendLoading ? (
                      <span className="flex items-center justify-center gap-1">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </span>
                    ) : 'Resend code'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;