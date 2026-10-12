import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import CartIcon from '../cart/CartIcon'
import TopAnnouncementBar from './TopAnnouncementBar'
import CategoriesDropdown from './CategoriesDropdown'
import { User, LayoutDashboard, LogOut, Package, LogIn, UserPlus, ShoppingBag } from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { getCartCount, fetchCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location])

  const confirmLogout = (e) => {
    e.preventDefault()
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false)
      logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  if (location.pathname.startsWith('/admin')) {
    return null
  }

  const userInitial = user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'

  return (
    <>
      <TopAnnouncementBar />

      <nav
        className={`sticky top-0 z-50 transition-all duration-500 ${
          isScrolled ? 'backdrop-blur-xl shadow-md' : 'backdrop-blur-sm shadow-sm'
        }`}
        style={{
          backgroundColor: isScrolled ? 'var(--nav-scrolled-bg)' : 'var(--nav-bg)',
          borderBottom: isScrolled ? 'var(--nav-border-scrolled)' : 'var(--nav-border)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="flex justify-between items-center h-16 gap-6">

            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <img
                src="/Logo.png"
                alt="MeroGadget"
                className="h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <span className="text-xl font-bold text-[#3D1A00] tracking-tight hidden sm:block">
                Mero<span className="text-orange-600">Gadget</span>
              </span>
            </Link>

            <div className="hidden md:flex flex-1 items-center justify-center space-x-1">
              {[{ to: '/', label: 'Home' }, { to: '/products', label: 'Products' }, { to: '/about', label: 'About Us' }, { to: '/contact', label: 'Contact' }].map(({ to, label }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                return (
                  <Link
                    key={to}
                    to={to}
                    className="relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 nav-link-item"
                    style={{
                      color: isActive ? '#F15A29' : 'var(--text-secondary)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
                      fontWeight: isActive ? '700' : '500',
                    }}
                  >
                    {label}
                    {isActive && (
                      <span className="nav-active-glow" />
                    )}
                  </Link>
                )
              })}

              <CategoriesDropdown />
            </div>

            {/* ─── Right: cart + user ─── */}
            <div className="hidden md:flex items-center space-x-2 shrink-0">
              {user?.role !== 'admin' && (
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <CartIcon />
                  {getCartCount() > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg"
                      style={{
                        background: 'var(--accent-orange)',
                        boxShadow: 'var(--cart-badge-shadow)'
                      }}
                    >
                      {getCartCount()}
                    </span>
                  )}
                </Link>
              )}

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg focus:outline-none transition-all duration-300"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-xs shadow-lg"
                      style={{ background: 'var(--avatar-gradient)' }}
                    >
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement.innerText = userInitial
                          }}
                        />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <span
                      className="hidden lg:inline text-sm font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {user.name?.split(' ')[0] || user.email?.split('@')[0]}
                    </span>
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-1 w-64 rounded-2xl shadow-2xl py-2 z-10 border animate-scale-in overflow-hidden"
                      style={{
                        backgroundColor: 'var(--dropdown-bg)',
                        borderColor: 'var(--dropdown-border)',
                        backdropFilter: 'blur(40px)',
                        boxShadow: 'var(--dropdown-shadow)'
                      }}
                    >
                      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--divider-color)' }}>
                        <div
                          className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm shrink-0"
                          style={{ background: 'var(--avatar-gradient)' }}
                        >
                          {user.photo ? (
                            <img
                              src={user.photo}
                              alt={user.name || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                                e.currentTarget.parentElement.innerText = userInitial
                              }}
                            />
                          ) : (
                            userInitial
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                            {user.name}
                          </p>
                          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 mx-2 rounded-lg"
                          style={{ color: 'var(--text-primary)' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                            e.currentTarget.style.color = 'var(--accent-cyan)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = 'var(--text-primary)'
                          }}
                        >
                          <span><User className="w-4 h-4" /></span>
                          Profile
                        </Link>

                        {user.role !== 'admin' && (
                          <Link
                            to="/orders"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 mx-2 rounded-lg"
                            style={{ color: 'var(--text-primary)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                              e.currentTarget.style.color = 'var(--accent-cyan)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.color = 'var(--text-primary)'
                            }}
                          >
                            <span><ShoppingBag className="w-4 h-4" /></span>
                            My Orders
                          </Link>
                        )}

                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 mx-2 rounded-lg font-medium"
                            style={{ color: 'var(--accent-cyan)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--cyan-hover-bg)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <span><LayoutDashboard className="w-4 h-4" /></span>
                            Admin Dashboard
                          </Link>
                        )}

                        <div className="mx-4 my-1" style={{ borderTop: 'var(--divider-border)' }}></div>

                        <button
                          onClick={confirmLogout}
                          className="flex items-center gap-3 w-full text-left px-5 py-2.5 text-sm transition-all duration-200 mx-2 rounded-lg"
                          style={{ color: 'var(--error-red)' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error-hover-bg)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <span><LogOut className="w-4 h-4" /></span>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--text-primary)'
                      e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-secondary)'
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 text-sm font-medium rounded-full transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'var(--accent-orange)',
                      color: 'var(--white)',
                      boxShadow: 'var(--register-btn-shadow)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--accent-orange-hover)'
                      e.currentTarget.style.boxShadow = 'var(--register-btn-shadow-hover)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--accent-orange)'
                      e.currentTarget.style.boxShadow = 'var(--register-btn-shadow)'
                    }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* ─── Mobile: cart + menu ─── */}
            <div className="md:hidden flex items-center space-x-2 shrink-0">
              {user?.role !== 'admin' && (
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg transition-all duration-300"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <CartIcon />
                  {getCartCount() > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg"
                      style={{
                        background: 'var(--accent-orange)',
                        boxShadow: 'var(--cart-badge-shadow)'
                      }}
                    >
                      {getCartCount()}
                    </span>
                  )}
                </Link>
              )}

              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ color: 'var(--text-primary)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="md:hidden py-4 space-y-1 animate-slide-down rounded-b-2xl shadow-2xl border-t"
              style={{
                backgroundColor: 'var(--mobile-menu-bg)',
                borderColor: 'var(--dropdown-border)',
                backdropFilter: 'blur(40px)'
              }}
            >
              {[{ to: '/', label: 'Home', icon: '' }, { to: '/products', label: 'Products', icon: '' }, { to: '/about', label: 'About Us', icon: '' }, { to: '/contact', label: 'Contact', icon: '' }].map(({ to, label, icon }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all duration-200 rounded-xl mx-3"
                    style={{
                      color: isActive ? '#F15A29' : 'var(--text-primary)',
                      backgroundColor: isActive ? 'rgba(241,90,41,0.08)' : 'transparent',
                      fontWeight: isActive ? '700' : '500',
                      boxShadow: isActive ? '0 0 12px rgba(241,90,41,0.2)' : 'none',
                    }}
                  >
                    <span className="text-base">{icon}</span>
                    {label}
                  </Link>
                )
              })}

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-xl mx-3 transition-all duration-200"
                  style={{
                    background: 'var(--admin-gradient)',
                    color: 'var(--white)',
                    boxShadow: 'var(--admin-btn-shadow)'
                  }}
                >
                  <span className="text-base"><LayoutDashboard className="w-4 h-4" /></span>
                  Admin Dashboard
                </Link>
              )}

              <div className="mx-4 my-2" style={{ borderTop: 'var(--divider-border)' }}></div>

              {user ? (
                <>
                  <div className="px-5 py-3 mx-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: 'var(--mobile-user-bg)' }}>
                    <div
                      className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-semibold text-sm shrink-0"
                      style={{ background: 'var(--avatar-gradient)' }}
                    >
                      {user.photo ? (
                        <img
                          src={user.photo}
                          alt={user.name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.parentElement.innerText = userInitial
                          }}
                        />
                      ) : (
                        userInitial
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 rounded-xl mx-3"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="text-base"><User className="w-4 h-4" /></span>
                    Profile
                  </Link>
                  {user.role !== 'admin' && (
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 rounded-xl mx-3"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span className="text-base"><ShoppingBag className="w-4 h-4" /></span>
                      My Orders
                    </Link>
                  )}
                  <button
                    onClick={confirmLogout}
                    className="flex items-center gap-3 w-full text-left px-5 py-3 text-sm transition-all duration-200 rounded-xl mx-3 font-medium"
                    style={{ color: 'var(--error-red)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--error-hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="text-base"><LogOut className="w-4 h-4" /></span>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm transition-all duration-200 rounded-xl mx-3"
                    style={{ color: 'var(--text-primary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span className="text-base"><LogIn className="w-4 h-4" /></span>
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium rounded-xl mx-3 transition-all duration-200"
                    style={{
                      background: 'var(--accent-orange)',
                      color: 'var(--white)',
                      boxShadow: 'var(--register-btn-shadow)'
                    }}
                  >
                    <span className="text-base"><UserPlus className="w-4 h-4" /></span>
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <style>{`
          :root {
            --nav-bg: #FFFFFF;
            --nav-scrolled-bg: #FFFFFF;
            --nav-border: 1px solid rgba(241, 90, 41, 0.1);
            --nav-border-scrolled: 1px solid rgba(241, 90, 41, 0.15);

            --text-primary: #3D1A00;
            --text-secondary: #6B6258;

            --accent-orange: #F15A29;
            --accent-orange-hover: #C2410C;
            --accent-cyan: #F15A29;

            --hover-bg: rgba(241, 90, 41, 0.06);
            --dropdown-bg: #FFFFFF;
            --mobile-menu-bg: #FFFFFF;
            --mobile-user-bg: #FFF4E6;

            --dropdown-border: #F0DFC5;
            --divider-color: #F0DFC5;
            --divider-border: 0.5px solid #F0DFC5;

            --cart-badge-shadow: 0 2px 8px rgba(241, 90, 41, 0.4);
            --dropdown-shadow: 0 10px 40px -12px rgba(61, 26, 0, 0.15);
            --register-btn-shadow: 0 2px 8px rgba(241, 90, 41, 0.3);
            --register-btn-shadow-hover: 0 4px 12px rgba(241, 90, 41, 0.4);
            --admin-btn-shadow: 0 4px 12px rgba(241, 90, 41, 0.3);

            --avatar-gradient: linear-gradient(135deg, #F15A29, #C2410C);
            --admin-gradient: linear-gradient(135deg, #F15A29, #C2410C);

            --white: #FFFFFF;
            --error-red: #DC2626;
            --error-hover-bg: rgba(220, 38, 38, 0.08);
            --cyan-hover-bg: rgba(241, 90, 41, 0.08);
          }

          @keyframes scale-in {
            from { opacity: 0; transform: scale(0.95) translateY(-8px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes slide-down {
            from { opacity: 0; transform: translateY(-16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-scale-in { animation: scale-in 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
          .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
          .nav-link-item { position: relative; }
          .nav-active-glow {
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
            height: 2px;
            width: 70%;
            border-radius: 9999px;
            background: #F15A29;
            display: block;
          }
        `}</style>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#3D1A00]/40 backdrop-blur-sm animate-scale-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full border border-orange-100 shadow-2xl">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-center text-[#3D1A00] mb-2">Ready to leave?</h3>
            <p className="text-center text-[#7A6A5A] mb-8 text-sm">
              Are you sure you want to log out of your account? You will need to log back in to manage your orders.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleLogout}
                className="w-full py-3.5 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Yes, log out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3.5 bg-cream border border-orange-200 text-[#3D1A00] rounded-full font-semibold hover:bg-orange-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar