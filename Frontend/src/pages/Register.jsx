import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { otpService } from '../services/otpService';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User, ShieldCheck, Loader2 } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-12">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 grid md:grid-cols-2">

        {/* ─── LEFT — Brand panel ─── */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#3D1A00] to-[#2B0F00] text-cream p-10 relative overflow-hidden">

          <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 overflow-hidden">
                <img src="/Logo.png" alt="MeroGadget" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Mero<span className="text-orange-400">Gadget</span>
              </span>
            </Link>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Join the<br />MeroGadget club.
            </h1>

            <p className="text-[#D4C4B0] text-sm leading-relaxed max-w-xs">
              Create an account and unlock a smarter way to shop for technology.
            </p>
          </div>

          <div className="relative z-10 space-y-3 pt-8 border-t border-white/10">
            {[
              'Save your favorite products',
              'Faster checkout every time',
              'Exclusive member-only discounts',
              'Order tracking & history'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[#D4C4B0] text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ─── RIGHT — Form ─── */}
        <div className="p-8 md:p-10 flex flex-col justify-center">

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[#7A6A5A] hover:text-orange-600 text-sm font-semibold mb-6 self-start transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {step === 1 ? (
            <>
              <div className="mb-6">
                <p className="eyebrow mb-2">Join the club</p>
                <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00] mb-2">
                  Create your account
                </h1>
                <p className="text-[#7A6A5A] text-sm">
                  Save your favorites and make every order feel like home.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSendOTP}>

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8998A] pointer-events-none" />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8998A] pointer-events-none" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8998A] pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-11 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#A8998A] hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8998A] pointer-events-none" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-11 pr-11 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                      placeholder="Repeat your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#A8998A] hover:text-orange-600 hover:bg-orange-50 transition-colors"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-orange-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Continue'
                  )}
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
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <ShieldCheck className="w-8 h-8 text-white" strokeWidth={2.2} />
                </div>
                <p className="eyebrow mb-2">One more step</p>
                <h2 className="text-2xl md:text-3xl font-bold text-[#3D1A00] mb-2">Verify your email</h2>
                <p className="text-[#7A6A5A] text-sm">
                  Enter the 6-digit code sent to<br />
                  <span className="text-orange-600 font-semibold">{otpEmail}</span>
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleVerifyOTP}>
                <div>
                  <label htmlFor="otp" className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2 text-center">
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
                    className="w-full px-4 py-4 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] text-center text-3xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-bold"
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-orange-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Register'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || resendLoading}
                    className="text-orange-600 hover:text-orange-700 font-semibold transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                  >
                    {countdown > 0
                      ? `Resend code in ${countdown}s`
                      : resendLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : 'Resend code'}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setCountdown(0);
                    }}
                    className="text-[#A8998A] hover:text-orange-600 text-xs font-semibold transition-colors"
                  >
                    ← Change email
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;