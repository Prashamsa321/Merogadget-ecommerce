import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        success('Welcome back!');
        if (result.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toastError(result.error || 'Login failed');
      }
    } catch (err) {
      toastError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 sm:px-6 lg:px-10 xl:px-16 py-12">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 grid md:grid-cols-2">

        {/* LEFT — Dark brown panel */}
        <div className="hidden md:flex flex-col justify-between bg-[#3D1A00] text-cream p-10">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 overflow-hidden">
                <img
                  src="/Logo.png"
                  alt="MeroGadget icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Mero<span className="text-orange-400">Gadget</span>
              </span>
            </Link>

            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Welcome back to<br />your gadgets.
            </h1>
          </div>

          <p className="text-[#D4C4B0] text-sm leading-relaxed">
            Sign in to reorder favorites, track deliveries, and discover something new.
          </p>
        </div>

        {/* RIGHT — Form */}
        <div className="p-8 md:p-12">
          <Link
            to="/"
            className="text-orange-600 text-sm font-semibold hover:text-orange-700 mb-8 inline-block"
          >
            ← Back to home
          </Link>

          <p className="eyebrow mb-2">Good to see you</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#3D1A00] mb-3">Sign in</h2>
          <p className="text-[#7A6A5A] mb-8">Continue your MeroGadget journey.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-[#3D1A00] mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-[#3D1A00] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8998A] hover:text-orange-600"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-orange-600 hover:text-orange-700"
              >
                Forgot password?
              </Link>
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
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-[#7A6A5A] mt-8">
            New to MeroGadget?{' '}
            <Link to="/register" className="text-orange-600 font-semibold hover:text-orange-700">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;