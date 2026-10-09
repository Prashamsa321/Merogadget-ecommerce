import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

// ─── SVG Icons ───
const Icons = {
  Dashboard: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Products: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  AllProducts: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  CreateProduct: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Categories: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Orders: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6M17 13l1.5 6M9 21h6M12 18v3" />
    </svg>
  ),
  Users: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Contacts: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Reports: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Analytics: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Settings: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Logout: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Profile: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  ChevronDown: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronLeft: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  ChevronRight: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
    </svg>
  ),
};

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastLogin, setLastLogin] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const sidebarRef = useRef(null);

  const navItems = [
    { path: "/admin", name: "Dashboard", icon: Icons.Dashboard, dropdown: false },
    {
      path: "#",
      name: "Products",
      icon: Icons.Products,
      dropdown: true,
      dropdownItems: [
        { path: "/admin/products", name: "All Products", icon: Icons.AllProducts },
        { path: "/admin/products/create", name: "Create Product", icon: Icons.CreateProduct },
        { path: "/admin/categories", name: "Categories", icon: Icons.Categories }
      ]
    },
    { path: "/admin/orders", name: "Orders", icon: Icons.Orders, dropdown: false },
    { path: "/admin/users", name: "Users", icon: Icons.Users, dropdown: false },
    { path: "/admin/contacts", name: "Contacts", icon: Icons.Contacts, dropdown: false },
    {
      path: "#",
      name: "Reports",
      icon: Icons.Reports,
      dropdown: true,
      dropdownItems: [
        { path: "/admin/reports", name: "Reports", icon: Icons.Reports },
        { path: "/admin/analytics", name: "Analytics", icon: Icons.Analytics }
      ]
    },
    { path: "/admin/settings", name: "Settings", icon: Icons.Settings, dropdown: false },
  ];

  const isProductsRoute = location.pathname.includes('/admin/products') || location.pathname.includes('/admin/categories');
  const isReportsRoute = location.pathname.includes('/admin/reports') || location.pathname.includes('/admin/analytics');

  useEffect(() => {
    if (isProductsRoute) {
      setOpenDropdown('Products');
    } else if (isReportsRoute) {
      setOpenDropdown('Reports');
    } else {
      setOpenDropdown(null);
    }
  }, [location.pathname, isProductsRoute, isReportsRoute]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const stored = sessionStorage.getItem('adminLastLogin');
    if (!stored) {
      const now = new Date();
      sessionStorage.setItem('adminLastLogin', now.toISOString());
      setLastLogin(now);
    } else {
      setLastLogin(new Date(stored));
    }
  }, [user]);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  };

  const getNepaliDate = (date) => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kathmandu',
        calendar: 'nepali',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } catch (err) {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kathmandu',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    }
  };

  const getNepaliTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  };

  const formatLastLogin = (date) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const toggleDropdown = (dropdownName) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdownName);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toastError("Please login to access admin panel");
      navigate('/login');
      return;
    }

    if (user && user.role !== 'admin') {
      toastError("Access denied. Admin privileges required.");
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, toastError]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      sessionStorage.removeItem('adminLastLogin');
      success("Logged out successfully");
      setIsProfileOpen(false);
      navigate('/login');
    } catch (error) {
      toastError("Logout failed");
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#7A6A5A]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-gradient-to-b from-[#3D1A00] to-[#2B0F00] text-[#FDF6EC] transition-[width,box-shadow] duration-500 ease-in-out fixed h-full z-20 flex flex-col shadow-2xl`}
      >
        <div className="flex-shrink-0 h-16 px-4 border-b border-[#4A2410]/60 flex items-center justify-between">
          {isSidebarOpen ? (
            <Link
              to="/"
              className="flex items-center gap-2.5 transition-all duration-300"
            >
              <img
                src="/icon.png"
                alt="MeroGadget"
                className="w-9 h-9 rounded-full bg-white/10 p-0.5 object-contain hover:scale-105 transition-transform duration-300"
              />
              <h2 className="text-lg font-bold text-white tracking-tight whitespace-nowrap">
                Mero<span className="text-orange-400">Gadget</span>
              </h2>
            </Link>
          ) : (
            <Link to="/" className="mx-auto">
              <img
                src="/icon.png"
                alt="MeroGadget"
                className="w-9 h-9 rounded-full bg-white/10 p-0.5 object-contain hover:scale-105 transition-transform duration-300"
              />
            </Link>
          )}

          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#4A2410] transition-all duration-300 text-[#D4C4B0] hover:text-white"
              title="Collapse sidebar"
            >
              {Icons.ChevronLeft}
            </button>
          )}
        </div>

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 transition-all duration-300 hover:scale-110 z-30"
            title="Expand sidebar"
          >
            {Icons.ChevronRight}
          </button>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = !item.dropdown && location.pathname === item.path;
              const isDropdownOpen = openDropdown === item.name;
              const isAnyDropdownActive = item.dropdown && item.dropdownItems.some(
                subItem => location.pathname === subItem.path
              );

              return (
                <div key={item.name} className="w-full">
                  {item.dropdown ? (
                    <div className="w-full relative group">
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 ${isAnyDropdownActive
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                            : 'text-[#D4C4B0] hover:bg-[#4A2410] hover:text-white'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0">{item.icon}</span>
                          <span className={`font-medium text-sm truncate transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'}`}>
                            {item.name}
                          </span>
                        </div>
                        {isSidebarOpen && (
                          <span className={`flex-shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}>
                            {Icons.ChevronDown}
                          </span>
                        )}
                      </button>

                      {isSidebarOpen && (
                        <div
                          className={`overflow-hidden transition-all duration-500 ease-in-out ${isDropdownOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="ml-4 space-y-0.5 border-l-2 border-orange-500/50 pl-3">
                            {item.dropdownItems.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                onClick={() => setOpenDropdown(null)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${location.pathname === subItem.path
                                    ? 'bg-orange-600 text-white shadow-md shadow-orange-500/20'
                                    : 'text-[#A8998A] hover:bg-[#4A2410] hover:text-white hover:translate-x-1'
                                  }`}
                              >
                                <span className="flex-shrink-0">{subItem.icon}</span>
                                <span className="truncate">{subItem.name}</span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#3D1A00] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-[#4A2410]">
                          {item.name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative group w-full">
                      <Link
                        to={item.path}
                        onClick={() => setOpenDropdown(null)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-300 w-full ${isActive
                            ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                            : "text-[#D4C4B0] hover:bg-[#4A2410] hover:text-white"
                          }`}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className={`font-medium text-sm truncate transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'}`}>
                          {item.name}
                        </span>
                      </Link>
                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#3D1A00] text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-[#4A2410]">
                          {item.name}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 p-3 border-t border-[#4A2410]/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-[#4A2410] transition-all duration-300 text-[#D4C4B0] hover:text-white group"
          >
            <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">{Icons.Logout}</span>
            <span className={`font-medium text-sm truncate transition-all duration-300 ${isSidebarOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-[margin] duration-500 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-20"}`}>

        {/* Top Header */}
        <header className="bg-white/95 backdrop-blur-md shadow-sm px-6 py-3 sticky top-0 z-10 border-b border-orange-100/70">
          <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center">

            {/* Left: page title / expand button when collapsed */}
            <div className="flex items-center gap-3 shrink-0">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-orange-50 transition-all duration-300 text-[#3D1A00]"
                  title="Expand sidebar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              )}
              <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">
                Admin Panel
              </p>
            </div>

            {/* Right: Date / Time / Last Login + Fullscreen + Profile */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">

              <div className="hidden md:flex items-center gap-3 lg:gap-4">
                <div className="leading-tight text-right shrink-0">
                  <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold">Today</p>
                  <p className="text-xs font-bold text-[#3D1A00] whitespace-nowrap">{getNepaliDate(currentTime)}</p>
                </div>

                <div className="w-px h-8 bg-orange-100 shrink-0" />

                <div className="leading-tight text-right shrink-0">
                  <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold">Time</p>
                  <p className="text-xs font-bold text-[#3D1A00] tabular-nums whitespace-nowrap">{getNepaliTime(currentTime)}</p>
                </div>

                <div className="w-px h-8 bg-orange-100 shrink-0" />

                <div className="leading-tight text-right shrink-0">
                  <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold">Last login</p>
                  <p className="text-xs font-bold text-[#3D1A00] whitespace-nowrap">{formatLastLogin(lastLogin)}</p>
                </div>

                <div className="w-px h-8 bg-orange-100 shrink-0" />
              </div>

                      {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-orange-50 transition-all duration-300 text-[#3D1A00] hover:scale-110 shrink-0"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? (
                // Exit fullscreen — inward arrows (4 corners pointing in)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3v4a2 2 0 0 1-2 2H3" />
                  <path d="M15 3v4a2 2 0 0 0 2 2h4" />
                  <path d="M9 21v-4a2 2 0 0 0-2-2H3" />
                  <path d="M15 21v-4a2 2 0 0 1 2-2h4" />
                </svg>
              ) : (
                // Enter fullscreen — outward arrows (4 corners pointing out)
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9V6a3 3 0 0 1 3-3h3" />
                  <path d="M21 9V6a3 3 0 0 0-3-3h-3" />
                  <path d="M3 15v3a3 3 0 0 0 3 3h3" />
                  <path d="M21 15v3a3 3 0 0 1-3 3h-3" />
                </svg>
              )}
            </button>

              {/* Profile */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-orange-50 transition-all duration-300 group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-[#C2410C] flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform duration-300">
                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-[#3D1A00]">
                    {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
                  </span>
                  <span className={`hidden md:block text-[#A8998A] transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`}>
                    {Icons.ChevronDown}
                  </span>
                </button>

                <div
                  className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-hover border border-orange-100 py-2 z-20 overflow-hidden origin-top-right transition-all duration-200 ${
                    isProfileOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="px-4 py-3 border-b border-orange-100 bg-[#FFF4E6]">
                    <p className="text-sm font-bold text-[#3D1A00] truncate">{user?.name}</p>
                    <p className="text-xs text-[#7A6A5A] truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#3D1A00] hover:bg-orange-50 transition-colors font-medium"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <span>{Icons.Profile}</span>
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <span>{Icons.Logout}</span>
                    Logout
                  </button>
                </div>
              </div>

              {isProfileOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto bg-cream">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }

        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; border-radius: 4px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #C2410C; border-radius: 4px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #F15A29; }
      `}</style>
    </div>
  );
}

export default AdminLayout;