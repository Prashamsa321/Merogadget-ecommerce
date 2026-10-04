import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [productsRes, usersRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products/getproduct', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/auth/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { orders: [] } }))
      ]);

      const products = productsRes.data.products || [];
      const totalProducts = products.length;
      const users = usersRes.data.users || [];
      const totalUsers = users.length;
      const orders = ordersRes.data.orders || [];
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toastError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: '📦',
      color: 'from-blue-500 to-blue-600',
      link: '/admin/products',
      prefix: ''
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: '🛒',
      color: 'from-orange-500 to-orange-600',
      link: '/admin/orders',
      prefix: ''
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'from-purple-500 to-purple-600',
      link: '/admin/users',
      prefix: ''
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue,
      icon: '💰',
      color: 'from-green-500 to-green-600',
      link: '/admin/analytics',
      prefix: 'रु '
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
            👋
          </div>
          <div>
            <p className="eyebrow mb-1">Welcome back</p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">
              Hello, {user?.name}!
            </h1>
            <p className="text-[#7A6A5A] mt-1 text-sm md:text-base">
              Here's what's happening with your store today.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statsCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group bg-white rounded-3xl overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-orange-100 block"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-[#3D1A00]">
                {stat.prefix}{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
              </p>
              <div className="mt-4 text-sm text-orange-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                View Details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions + Admin Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-soft">
          <h3 className="font-bold text-[#3D1A00] mb-5 flex items-center gap-2 text-lg">
            <span className="text-xl">⚡</span>
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/admin/products/create"
              className="block w-full text-center bg-orange-600 text-white px-4 py-3 rounded-full hover:bg-orange-700 transition-all duration-300 font-bold shadow-lg shadow-orange-500/20"
            >
              + Add New Product
            </Link>
            <Link
              to="/admin/orders"
              className="block w-full text-center bg-cream border border-orange-200 text-[#3D1A00] px-4 py-3 rounded-full hover:bg-orange-50 transition-all duration-300 font-bold"
            >
              View All Orders
            </Link>
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-soft">
          <h3 className="font-bold text-[#3D1A00] mb-5 flex items-center gap-2 text-lg">
            <span className="text-xl">ℹ️</span>
            Admin Info
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-[#FFF4E6] rounded-2xl">
              <span className="text-[#A8998A] w-16 text-xs uppercase tracking-widest font-semibold">Name</span>
              <span className="text-[#3D1A00] font-semibold">{user?.name}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#FFF4E6] rounded-2xl">
              <span className="text-[#A8998A] w-16 text-xs uppercase tracking-widest font-semibold">Email</span>
              <span className="text-[#3D1A00] font-medium truncate">{user?.email}</span>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            className="mt-5 w-full text-center text-sm text-orange-600 hover:text-orange-700 transition-colors flex items-center justify-center gap-1 font-semibold"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;