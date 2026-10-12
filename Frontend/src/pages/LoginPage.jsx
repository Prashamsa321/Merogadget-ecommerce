import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

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
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 sm:px-6 lg:px-10 xl:px-16 py-8 sm:py-12">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100 grid md:grid-cols-2">

        {/* ─── LEFT — Brand panel ─── */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#3D1A00] to-[#2B0F00] text-cream p-10 relative overflow-hidden">

          {/* Decorative blobs */}
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
              Welcome back<br />to your gadgets.
            </h1>

            <p className="text-[#D4C4B0] text-sm leading-relaxed max-w-xs">
              Sign in to reorder favorites, track deliveries, and discover something new.
            </p>
          </div>

          {/* Bottom features list */}
          <div className="relative z-10 space-y-3 pt-8 border-t border-white/10">
            {[
              'Track every order in real time',
              'Save your favorite products',
              'Exclusive member-only deals'
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-[#D4C4B0] text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* ─── RIGHT — Form ─── */}
        <div className="p-8 md:p-12 flex flex-col justify-center">

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[#7A6A5A] hover:text-orange-600 text-sm font-semibold mb-8 self-start transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <p className="eyebrow mb-2">Good to see you</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#3D1A00] mb-2">Sign in</h2>
            <p className="text-[#7A6A5A] text-sm">Continue your MeroGadget journey.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8998A] pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-[#A8998A] uppercase tracking-widest">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8998A] pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Enter your password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white py-3.5 rounded-2xl font-bold text-base hover:bg-orange-700 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
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