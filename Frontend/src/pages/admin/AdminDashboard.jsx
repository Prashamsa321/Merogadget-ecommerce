import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import dashboardService from '../../services/dashboardService';
import {
  Package, ShoppingCart, Users, DollarSign, Mail,
  Zap, Plus, Eye, RefreshCw, TrendingUp
} from 'lucide-react';

const CountUp = ({ end, duration = 1200, prefix = '', suffix = '' }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= end) {
        setVal(end);
        clearInterval(t);
      } else {
        setVal(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(t);
  }, [end, duration]);
  return <>{prefix}{val.toLocaleString()}{suffix}</>;
};

// ── Line Chart ──
const LineChart = ({ data, color = '#F15A29', formatValue = (v) => v }) => {
  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-[#A8998A] text-sm">No data yet</div>;
  }
  const max = Math.max(...data.map(d => d.count), 1);
  const w = 100;
  const h = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (d.count / max) * h;
    return { x, y, ...d };
  });
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${w} ${h} L 0 ${h} Z`;

  return (
    <div className="w-full">
      <div className="relative h-40">
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} className="animate-[fadeArea_1s_ease-out]" />
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="animate-[drawLine_1.5s_ease-out]"
            style={{ strokeDasharray: 500, strokeDashoffset: 0 }}
          />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" className="hover:r-2 transition-all" />
          ))}
        </svg>
        <div className="absolute -top-1 left-0 right-0 flex justify-between pointer-events-none">
          {points.map((p, i) => (
            <div key={i} className="text-[10px] font-bold text-orange-600 opacity-0 hover:opacity-100 transition-opacity">
              {formatValue(p.count)}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-2">
        {data.map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-[10px] text-[#A8998A] font-semibold uppercase">{d.label.split(' ')[0]}</p>
            <p className="text-[10px] text-[#3D1A00] font-bold">{d.label.split(' ')[1]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Donut Chart ──
const DonutChart = ({ data }) => {
  const items = Object.entries(data).map(([label, value]) => ({ label, value }));
  const total = items.reduce((sum, i) => sum + i.value, 0);

  const colors = {
    Pending: '#F59E0B',
    Processing: '#3B82F6',
    Shipped: '#8B5CF6',
    Delivered: '#10B981',
    Cancelled: '#EF4444'
  };

  let cumulative = 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#FFF4E6" strokeWidth="12" />
          {total > 0 && items.map((item, i) => {
            const pct = item.value / total;
            const dash = pct * circumference;
            const offset = circumference - cumulative;
            cumulative += dash;
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={colors[item.label] || '#A8998A'}
                strokeWidth="12"
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                className="transition-all duration-1000 ease-out animate-[drawDonut_1.2s_ease-out]"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-[#3D1A00]">{total}</p>
          <p className="text-[10px] text-[#A8998A] font-semibold uppercase tracking-widest">Orders</p>
        </div>
      </div>
      <div className="mt-4 w-full space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[item.label] || '#A8998A' }}></span>
              <span className="text-[#5C4B3A] font-medium">{item.label}</span>
            </div>
            <span className="text-[#3D1A00] font-bold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TopCategoriesBars = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-[#A8998A] text-sm">No category data yet</div>;
  }
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((cat, i) => (
        <div key={i} className="animate-[slideIn_0.5s_ease-out_forwards]" style={{ animationDelay: `${i * 100}ms`, opacity: 0 }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#3D1A00] truncate pr-2">{cat.name}</span>
            <span className="text-xs font-bold text-orange-600">{cat.value}</span>
          </div>
          <div className="h-2 bg-orange-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(cat.value / max) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      if (data?.success) {
        setStats(data);
      } else {
        toastError('Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      toastError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const statsCards = [
    { title: 'Total Products', value: stats.totals.totalProducts, icon: Package, color: 'from-blue-500 to-blue-600', link: '/admin/products', prefix: '' },
    { title: 'Total Orders', value: stats.totals.totalOrders, icon: ShoppingCart, color: 'from-orange-500 to-orange-600', link: '/admin/orders', prefix: '' },
    { title: 'Total Users', value: stats.totals.totalUsers, icon: Users, color: 'from-purple-500 to-purple-600', link: '/admin/users', prefix: '' },
    { title: 'Total Revenue', value: stats.totals.totalRevenue, icon: DollarSign, color: 'from-green-500 to-green-600', link: '/admin/analytics', prefix: 'रु ' },
    { title: 'Subscribers', value: stats.totals.totalSubscribers, icon: Mail, color: 'from-pink-500 to-pink-600', link: '/admin', prefix: '' },
  ];

  const maxSubCount = Math.max(...stats.subscriberGrowth.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes fadeArea { from { opacity: 0 } to { opacity: 1 } }
        @keyframes drawLine { from { stroke-dashoffset: 500 } to { stroke-dashoffset: 0 } }
        @keyframes drawDonut { from { stroke-dasharray: 0 500 } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10px) } to { opacity: 1; transform: translateX(0) } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9) } 100% { opacity: 1; transform: scale(1) } }
        .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
        .animate-popIn { animation: popIn 0.4s ease-out forwards; }
      `}</style>

      {/* Welcome Section */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft animate-slideUp">
        <div className="flex items-center gap-5">
          
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              to={stat.link}
              className="group bg-white rounded-3xl overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-1 border border-orange-100 block animate-slideUp"
              style={{ animationDelay: `${index * 80}ms`, opacity: 0 }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
                  </div>
                </div>
                <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-[#3D1A00]">
                  {stat.prefix}<CountUp end={stat.value} />
                </p>
                <div className="mt-4 text-sm text-orange-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Subscriber Growth + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft animate-slideUp">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-[#3D1A00] text-lg">Subscriber Growth</h3>
              <p className="text-sm text-[#7A6A5A] mt-0.5">Last 7 days</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Last 7 days</p>
                <p className="text-2xl font-bold text-orange-600">+{stats.subscriberStats.last7Days}</p>
              </div>
              <div className="w-px h-10 bg-orange-100"></div>
              <div className="text-right">
                <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Total</p>
                <p className="text-2xl font-bold text-[#3D1A00]">{stats.subscriberStats.total}</p>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 pb-2">
            {stats.subscriberGrowth.map((day, i) => {
              const heightPct = day.count === 0 ? 6 : Math.max((day.count / maxSubCount) * 100, 12);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  <span className="text-xs font-bold text-orange-600 mb-1">{day.count}</span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-700 ease-out hover:from-orange-600 hover:to-orange-500"
                    style={{ height: `${heightPct}%`, animation: `popIn 0.6s ease-out ${i * 80}ms forwards`, opacity: 0 }}
                  ></div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between gap-3 mt-3 pt-3 border-t border-orange-100">
            {stats.subscriberGrowth.map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <p className="text-[10px] text-[#A8998A] font-semibold uppercase tracking-wider">
                  {day.label.split(' ')[0]}
                </p>
                <p className="text-xs text-[#3D1A00] font-bold">
                  {day.label.split(' ')[1]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft animate-slideUp">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#3D1A00] text-lg">Recent Subscribers</h3>
              <p className="text-sm text-[#7A6A5A] mt-0.5">Who subscribed</p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              {stats.subscriberStats.recentSubscribers.length}
            </span>
          </div>

          {stats.subscriberStats.recentSubscribers.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <Mail className="w-10 h-10 text-orange-200 mb-3" strokeWidth={1.5} />
              <p className="text-[#A8998A] text-sm">No subscribers yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stats.subscriberStats.recentSubscribers.map((sub, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-[#FFF4E6] rounded-2xl hover:bg-orange-50 transition-colors animate-slideUp"
                  style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {sub.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3D1A00] break-all leading-snug" title={sub.email}>
                      {sub.email}
                    </p>
                    <p className="text-xs text-[#7A6A5A] mt-0.5">
                      {new Date(sub.subscribedAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Growth + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[#3D1A00] text-lg">User Growth</h3>
              <p className="text-sm text-[#7A6A5A] mt-0.5">New signups · last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-orange-600 text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              +{stats.userGrowth.reduce((s, d) => s + d.count, 0)}
            </div>
          </div>
          <LineChart data={stats.userGrowth} color="#F15A29" />
        </div>

        <div className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft animate-slideUp">
          <div className="mb-6">
            <h3 className="font-bold text-[#3D1A00] text-lg">Order Status</h3>
            <p className="text-sm text-[#7A6A5A] mt-0.5">Breakdown by status</p>
          </div>
          <DonutChart data={stats.orderStatus} />
        </div>
      </div>

      {/* Revenue Trend + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-[#3D1A00] text-lg">Revenue Trend</h3>
              <p className="text-sm text-[#7A6A5A] mt-0.5">Daily revenue · last 7 days</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">7-day total</p>
              <p className="text-lg font-bold text-green-600">
                रु {stats.revenueTrend.reduce((s, d) => s + d.count, 0).toLocaleString()}
              </p>
            </div>
          </div>
          <LineChart data={stats.revenueTrend} color="#10B981" formatValue={(v) => `रु ${v.toLocaleString()}`} />
        </div>

        <div className="lg:col-span-1 bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft animate-slideUp">
          <div className="mb-6">
            <h3 className="font-bold text-[#3D1A00] text-lg">Top Categories</h3>
            <p className="text-sm text-[#7A6A5A] mt-0.5">By units sold</p>
          </div>
          <TopCategoriesBars data={stats.topCategories} />
        </div>
      </div>

      {/* Quick Actions — full width, no Admin Info */}
      <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-soft animate-slideUp">
        <h3 className="font-bold text-[#3D1A00] mb-5 flex items-center gap-2 text-lg">
          <Zap className="w-5 h-5 text-orange-500" strokeWidth={2.2} fill="currentColor" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/products/create"
            className="flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-3 rounded-full hover:bg-orange-700 transition-all duration-300 font-bold shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add New Product
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center justify-center gap-2 bg-cream border border-orange-200 text-[#3D1A00] px-4 py-3 rounded-full hover:bg-orange-50 transition-all duration-300 font-bold hover:-translate-y-0.5"
          >
            <Eye className="w-4 h-4" strokeWidth={2.5} />
            View All Orders
          </Link>
          <button
            onClick={fetchDashboardData}
            className="flex items-center justify-center gap-2 bg-cream border border-orange-200 text-[#3D1A00] px-4 py-3 rounded-full hover:bg-orange-50 transition-all duration-300 font-bold hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;