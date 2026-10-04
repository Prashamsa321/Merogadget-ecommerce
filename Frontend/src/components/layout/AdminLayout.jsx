import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const sidebarRef = useRef(null);

  const navItems = [
    { path: "/admin", name: "Dashboard", icon: "📊", dropdown: false },
    {
      path: "#",
      name: "Products",
      icon: "📦",
      dropdown: true,
      dropdownItems: [
        { path: "/admin/products", name: "All Products", icon: "📋" },
        { path: "/admin/products/create", name: "Create Product", icon: "➕" },
        { path: "/admin/categories", name: "Categories", icon: "🏷️" }
      ]
    },
    { path: "/admin/orders", name: "Orders", icon: "🛒", dropdown: false },
    { path: "/admin/users", name: "Users", icon: "👥", dropdown: false },
    { path: "/admin/contacts", name: "Contacts", icon: "✉️", dropdown: false },
    { path: "/admin/settings", name: "Settings", icon: "⚙️", dropdown: false },
  ];

  const isProductsRoute = location.pathname.includes('/admin/products') || location.pathname.includes('/admin/categories');

  useEffect(() => {
    if (isProductsRoute) {
      setOpenDropdown('Products');
    }
  }, [location.pathname]);

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
        if (!isProductsRoute) {
          setOpenDropdown(null);
        }
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProductsRoute]);

  const handleLogout = async () => {
    try {
      await logout();
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
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto"></div>
          </div>
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
        className={`sidebar-container ${isSidebarOpen ? "w-64" : "w-20"} bg-[#3D1A00] text-[#FDF6EC] transition-all duration-300 shadow-xl fixed h-full z-20 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-4 border-b border-[#4A2410] flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Mero<span className="text-orange-400">Gadget</span>
              </h2>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-[#4A2410] transition-colors text-[#D4C4B0]"
          >
            {isSidebarOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="p-4 space-y-2">
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
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                          isAnyDropdownActive
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                            : 'text-[#D4C4B0] hover:bg-[#4A2410] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl flex-shrink-0">{item.icon}</span>
                          {isSidebarOpen && <span className="font-medium truncate">{item.name}</span>}
                        </div>
                        {isSidebarOpen && (
                          <svg
                            className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>

                      {isSidebarOpen && (isDropdownOpen || isAnyDropdownActive) && (
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-orange-500 pl-3">
                          {item.dropdownItems.map((subItem) => (
                            <Link
                              key={subItem.path}
                              to={subItem.path}
                              className={`flex items-center gap-3 px-4 py-2 rounded-2xl transition-all duration-200 ${
                                location.pathname === subItem.path
                                  ? 'bg-orange-600 text-white'
                                  : 'text-[#A8998A] hover:bg-[#4A2410] hover:text-white'
                              }`}
                            >
                              <span className="text-base flex-shrink-0">{subItem.icon}</span>
                              <span className="text-sm truncate">{subItem.name}</span>
                            </Link>
                          ))}
                        </div>
                      )}

                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-[#3D1A00] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
                          {item.name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative group w-full">
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 w-full ${
                          isActive
                            ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30"
                            : "text-[#D4C4B0] hover:bg-[#4A2410] hover:text-white"
                        }`}
                      >
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        {isSidebarOpen && <span className="font-medium truncate">{item.name}</span>}
                      </Link>
                      {!isSidebarOpen && (
                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-[#3D1A00] text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-lg">
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

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 w-full p-4 border-t border-[#4A2410]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-[#4A2410] transition-colors text-[#D4C4B0] hover:text-white"
          >
            <span className="text-xl flex-shrink-0">🚪</span>
            {isSidebarOpen && <span className="font-medium truncate">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Navbar */}
        <header className="bg-white shadow-soft px-6 py-4 flex justify-between items-center sticky top-0 z-10 border-b border-orange-100">
          <div className="flex items-center gap-2"></div>

          <div className="flex items-center gap-2">
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-orange-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="hidden md:block text-sm font-semibold text-[#3D1A00]">
                  {user?.name?.split(' ')[0] || user?.email?.split('@')[0]}
                </span>
                <svg className="w-4 h-4 text-[#A8998A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-hover border border-orange-100 py-2 z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-orange-100 bg-[#FFF4E6]">
                      <p className="text-sm font-bold text-[#3D1A00] truncate">{user?.name}</p>
                      <p className="text-xs text-[#7A6A5A] truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/admin/profile"
                      className="block px-4 py-2.5 text-sm text-[#3D1A00] hover:bg-orange-50 transition-colors font-medium"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span className="inline mr-2">👤</span>
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <span className="inline mr-2">🚪</span>
                      Logout
                    </button>
                  </div>
                </>
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
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }

        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: #4A2410; border-radius: 4px; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #C2410C; border-radius: 4px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #F15A29; }
      `}</style>
    </div>
  );
}

export default AdminLayout;