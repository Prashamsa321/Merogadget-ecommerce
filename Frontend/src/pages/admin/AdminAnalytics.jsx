import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminAnalytics = () => {
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [data, setData] = useState({
    dailySales: [],
    monthlyRevenue: [],
    categoryStats: [],
    topCustomers: [],
    conversionRate: 0,
    totalOrders: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setAnimated(false);

      const [ordersRes, productsRes, usersRes] = await Promise.allSettled([
        api.get('/orders/admin/all?limit=500'),
        api.get('/products/getproduct'),
        api.get('/auth/users')
      ]);

      const orders = ordersRes.value?.data?.orders || [];
      const products = productsRes.value?.data?.products || [];
      const users = usersRes.value?.data?.users || [];

      // Daily sales (last 7 days)
      const dailySales = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayTotal = orders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            orderDate.setHours(0, 0, 0, 0);
            return orderDate.getTime() === date.getTime();
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        dailySales.push({ label: dayLabel, value: dayTotal });
      }

      // Monthly revenue (last 6 months)
      const monthlyRevenue = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        const monthTotal = orders
          .filter(o => {
            const orderDate = new Date(o.createdAt);
            return orderDate.getMonth() === date.getMonth() &&
                   orderDate.getFullYear() === date.getFullYear();
          })
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        monthlyRevenue.push({ label: monthLabel, value: monthTotal });
      }

      // Category stats
      const categoryStats = {};
      products.forEach(p => {
        const cat = p.category || 'Uncategorized';
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
      });

      // Top customers
      const customerSpend = {};
      orders.forEach(o => {
        const name = o.shippingAddress?.fullName || o.userId?.name || 'Unknown';
        const email = o.shippingAddress?.email || o.userId?.email || '';
        if (!customerSpend[name]) {
          customerSpend[name] = { name, email, orders: 0, total: 0 };
        }
        customerSpend[name].orders += 1;
        customerSpend[name].total += o.totalAmount || 0;
      });
      const topCustomers = Object.values(customerSpend)
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      const conversionRate = users.length > 0 ? (orders.length / users.length) * 100 : 0;

      setData({
        dailySales,
        monthlyRevenue,
        categoryStats: Object.entries(categoryStats)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        topCustomers,
        conversionRate,
        totalOrders: orders.length,
        totalUsers: users.length
      });
    } catch (err) {
      console.error('Analytics fetch error:', err);
      toastError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const maxDailySales = Math.max(...data.dailySales.map(d => d.value), 1);
  const maxMonthlyRevenue = Math.max(...data.monthlyRevenue.map(d => d.value), 1);
  const maxCategoryCount = Math.max(...data.categoryStats.map(c => c.count), 1);
  const totalRevenue = data.monthlyRevenue.reduce((s, m) => s + m.value, 0);

  // SVG line chart helpers
  const buildLinePoints = (values, max) => {
    if (values.length === 0) return '';
    const step = 100 / Math.max(values.length - 1, 1);
    return values
      .map((v, i) => `${i * step},${100 - (v / max) * 100}`)
      .join(' ');
  };

  const buildAreaPoints = (values, max) => {
    if (values.length === 0) return '';
    const step = 100 / Math.max(values.length - 1, 1);
    const pts = values
      .map((v, i) => `${i * step},${100 - (v / max) * 100}`)
      .join(' ');
    return `0,100 ${pts} 100,100`;
  };

  // Category palette
  const pieColors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4'];

  // Donut slices
  const donutSlices = (() => {
    const total = data.categoryStats.reduce((s, c) => s + c.count, 0);
    if (total === 0) return [];
    return data.categoryStats.slice(0, 6).map((item, i) => ({
      color: pieColors[i % pieColors.length],
      label: item.name,
      count: item.count,
      percent: ((item.count / total) * 100).toFixed(1),
      percentNum: (item.count / total) * 100
    }));
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const DONUT_RADIUS = 32;
  const DONUT_STROKE = 16;
  const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

  return (
    <div className="space-y-5">

      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="eyebrow mb-1">Insights</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Analytics</h1>
          <p className="text-[#7A6A5A] mt-1 text-sm">Deep dive into your store performance</p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          className="text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-full transition-all duration-300 font-semibold shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ═══ KPI Cards — top row ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Orders */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft hover:shadow-card transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-2xl font-bold text-[#3D1A00]">{data.totalOrders}</p>
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-1">Total Orders</p>
        </div>

        {/* Users */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft hover:shadow-card transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-[#3D1A00]">{data.totalUsers}</p>
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-1">Total Users</p>
        </div>

        {/* Conversion */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft hover:shadow-card transition-all duration-300 group">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{data.conversionRate.toFixed(1)}%</p>
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-1">Orders / User</p>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-to-br from-[#3D1A00] to-[#5C3317] rounded-2xl p-5 shadow-soft hover:shadow-card transition-all duration-300 group text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-white">रु {Math.round(totalRevenue / 1000)}k</p>
          <p className="text-[10px] text-orange-200 uppercase tracking-widest font-semibold mt-1">Total Revenue</p>
        </div>
      </div>

      {/* ═══ Row: Daily Sales (bar) + Category Donut ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Daily Sales Bar Chart (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#3D1A00]">Daily Sales</h3>
              <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">Last 7 days performance</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold">Peak</p>
              <p className="text-sm font-bold text-orange-600">रु {maxDailySales.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-end justify-around gap-3" style={{ height: '220px' }}>
            {data.dailySales.map((day, i) => {
              const heightPct = animated ? Math.max((day.value / maxDailySales) * 100, 4) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full">
                  <span
                    className="text-[10px] font-bold text-orange-600 mb-1 transition-opacity duration-500"
                    style={{ opacity: animated ? 1 : 0, transitionDelay: `${0.3 + i * 0.06}s` }}
                  >
                    {day.value > 0 ? `रु${Math.round(day.value / 1000)}k` : '—'}
                  </span>
                  <div
                    className="w-10 sm:w-14 rounded-t-sm cursor-pointer hover:opacity-85"
                    style={{
                      height: `${heightPct}%`,
                      background: day.value > 0
                        ? 'linear-gradient(to top, #EA580C, #FB923C)'
                        : '#FED7AA',
                      transition: `height 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.06}s`
                    }}
                    title={`${day.label}: रु ${day.value.toLocaleString()}`}
                  />
                  <span className="text-[10px] font-semibold text-[#3D1A00] mt-2">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Donut (1/3) */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#3D1A00]">Categories</h3>
            <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">Product distribution</p>
          </div>

          {donutSlices.length === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-12">No data yet</p>
          ) : (
            <>
              <div className="relative w-full aspect-square max-w-[180px] mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {donutSlices.map((slice, i) => {
                    const sliceLength = (slice.percentNum / 100) * DONUT_CIRCUMFERENCE;
                    let cumulativeOffset = 0;
                    for (let j = 0; j < i; j++) {
                      cumulativeOffset += (donutSlices[j].percentNum / 100) * DONUT_CIRCUMFERENCE;
                    }
                    const dashOffset = animated ? -cumulativeOffset : sliceLength + cumulativeOffset;

                    return (
                      <circle
                        key={i}
                        cx="50"
                        cy="50"
                        r={DONUT_RADIUS}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth={DONUT_STROKE}
                        strokeDasharray={`${sliceLength} ${DONUT_CIRCUMFERENCE}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="butt"
                        style={{
                          transition: `stroke-dashoffset 0.9s cubic-bezier(0.65, 0, 0.35, 1) ${i * 0.15}s`
                        }}
                      />
                    );
                  })}
                </svg>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-bold text-[#3D1A00]">
                    {data.categoryStats.reduce((s, c) => s + c.count, 0)}
                  </p>
                  <p className="text-[9px] text-[#A8998A] uppercase tracking-widest font-semibold">Products</p>
                </div>
              </div>

              <div className="space-y-1.5">
                {donutSlices.slice(0, 4).map((slice, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: slice.color }} />
                      <span className="text-[#3D1A00] font-semibold truncate">{slice.label}</span>
                    </div>
                    <span className="font-bold text-[#7A6A5A] flex-shrink-0 ml-2">
                      {slice.count} · {slice.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ Row: Revenue line + Top Customers ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Revenue Trend line chart (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#3D1A00]">Revenue Trend</h3>
              <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">Last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold">Total</p>
              <p className="text-sm font-bold text-orange-600">रु {totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="relative h-48">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="analyticsRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F15A29" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F15A29" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y, i) => (
                <line key={i} x1="0" y1={y} x2="100" y2={y} stroke="#F0DFC5" strokeWidth="0.2" strokeDasharray={i === 4 ? "0" : "2,2"} />
              ))}

              <polygon
                points={buildAreaPoints(data.monthlyRevenue.map(m => m.value), maxMonthlyRevenue)}
                fill="url(#analyticsRevenueGrad)"
                style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease-out 0.6s' }}
              />

              <polyline
                points={buildLinePoints(data.monthlyRevenue.map(m => m.value), maxMonthlyRevenue)}
                fill="none"
                stroke="#F15A29"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  strokeDasharray: 300,
                  strokeDashoffset: animated ? 0 : 300,
                  transition: 'stroke-dashoffset 1.4s ease-out 0.2s'
                }}
              />

              {data.monthlyRevenue.map((m, i) => {
                const step = 100 / Math.max(data.monthlyRevenue.length - 1, 1);
                const x = i * step;
                const y = 100 - (m.value / maxMonthlyRevenue) * 100;
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="1.4"
                    fill="#fff"
                    stroke="#F15A29"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                    style={{
                      opacity: animated ? 1 : 0,
                      transition: `opacity 0.4s ease-out ${1.2 + i * 0.08}s`
                    }}
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-orange-100">
            {data.monthlyRevenue.map((m, i) => (
              <div key={i} className="text-center">
                <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold">{m.label}</p>
                <p className="text-[10px] font-bold text-[#3D1A00] mt-0.5">
                  रु{Math.round(m.value / 1000)}k
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers (1/3) */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#3D1A00]">Top Customers</h3>
            <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">By total spend</p>
          </div>

          {data.topCustomers.length === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-12">No customer data</p>
          ) : (
            <div className="space-y-2.5">
              {data.topCustomers.map((customer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 bg-[#FFF4E6] rounded-xl border border-orange-100/70 hover:bg-orange-50 transition-all duration-300 hover:translate-x-0.5"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-[#C2410C] text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#3D1A00] truncate">{customer.name}</p>
                    <p className="text-[10px] text-[#7A6A5A] truncate">{customer.orders} orders</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-orange-600">रु {customer.total.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Row: Category bars ═══ */}
      <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#3D1A00]">Products by Category</h3>
            <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">Inventory distribution</p>
          </div>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
            {data.categoryStats.length} categories
          </span>
        </div>

        {data.categoryStats.length === 0 ? (
          <p className="text-xs text-[#7A6A5A] text-center py-8">No products yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {data.categoryStats.map((cat, i) => {
              const pct = (cat.count / maxCategoryCount) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: pieColors[i % pieColors.length] }}
                      />
                      <span className="text-xs font-semibold text-[#3D1A00] truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#7A6A5A] flex-shrink-0">{cat.count}</span>
                  </div>
                  <div className="w-full bg-orange-50 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: animated ? `${pct}%` : '0%',
                        background: pieColors[i % pieColors.length],
                        transitionDelay: `${i * 0.05}s`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminAnalytics;