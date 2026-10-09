import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminReports = () => {
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [reports, setReports] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    topProducts: [],
    categoryStats: [],
    dailySales: [],
    monthlyRevenue: [],
    monthlyOrders: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const fetchReportData = async () => {
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

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      // Top products
      const productSales = {};
      orders.forEach(order => {
        (order.items || []).forEach(item => {
          const key = item.name || item.productId;
          if (!productSales[key]) {
            productSales[key] = { name: item.name, image: item.image, qty: 0, revenue: 0 };
          }
          productSales[key].qty += item.quantity || 0;
          productSales[key].revenue += (item.price || 0) * (item.quantity || 0);
        });
      });
      const topProducts = Object.values(productSales)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 6);

      // Categories
      const categoryStats = {};
      products.forEach(p => {
        const cat = p.category || 'Other';
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
      });
      const categoryData = Object.entries(categoryStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Daily sales
      const dailySales = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === date.getTime();
        });
        dailySales.push({
          label: dayLabel,
          value: dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
        });
      }

      // Monthly
      const monthlyRevenue = [];
      const monthlyOrders = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
        const monthOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
        });
        monthlyRevenue.push({
          label: monthLabel,
          value: monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
        });
        monthlyOrders.push({ label: monthLabel, value: monthOrders.length });
      }

      setReports({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: products.length,
        totalUsers: users.length,
        avgOrderValue,
        topProducts,
        categoryStats: categoryData,
        dailySales,
        monthlyRevenue,
        monthlyOrders
      });
    } catch (err) {
      console.error('Report fetch error:', err);
      toastError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const maxSales = Math.max(...reports.dailySales.map(d => d.value), 1);
  const maxMonthlyRevenue = Math.max(...reports.monthlyRevenue.map(m => m.value), 1);
  const maxMonthlyOrders = Math.max(...reports.monthlyOrders.map(m => m.value), 1);
  const maxTopProduct = Math.max(...reports.topProducts.map(p => p.qty), 1);

  const buildLinePoints = (data, maxValue) => {
    if (data.length === 0) return '';
    const step = 100 / Math.max(data.length - 1, 1);
    return data.map((d, i) => {
      const x = i * step;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');
  };

  const buildAreaPoints = (data, maxValue) => {
    if (data.length === 0) return '';
    const step = 100 / Math.max(data.length - 1, 1);
    const points = data.map((d, i) => {
      const x = i * step;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');
    return `0,100 ${points} 100,100`;
  };

  const pieColors = [
    '#3B82F6',
    '#F59E0B',
    '#10B981',
    '#8B5CF6'
  ];

  const barColors = [
    '#EF4444', '#3B82F6', '#84CC16',
    '#FACC15', '#F472B6', '#A855F7'
  ];

  // Donut slices
  const donutSlices = (() => {
    const total = reports.categoryStats.reduce((s, c) => s + c.count, 0);
    if (total === 0) return [];

    return reports.categoryStats.map((item, i) => ({
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="eyebrow mb-1">Insights</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Reports</h1>
          <p className="text-[#7A6A5A] mt-1 text-sm">Sales, purchase & revenue analytics</p>
        </div>
        <button
          onClick={fetchReportData}
          className="text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-full transition-colors font-semibold shadow-md shadow-orange-500/20"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Orders</p>
          <p className="text-xl font-bold text-[#3D1A00]">{reports.totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Revenue</p>
          <p className="text-xl font-bold text-green-600">रु {reports.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Products</p>
          <p className="text-xl font-bold text-blue-600">{reports.totalProducts}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Users</p>
          <p className="text-xl font-bold text-purple-600">{reports.totalUsers}</p>
        </div>
      </div>

      {/* ═══ Row: Top Selling + Donut ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Top Selling Products — animated bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-[#3D1A00]">Top Selling Products</h3>
              <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">By quantity sold</p>
            </div>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">
              Top {reports.topProducts.length}
            </span>
          </div>

          {reports.topProducts.length === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-12">No sales data yet</p>
          ) : (
            <div className="flex items-end justify-around gap-3" style={{ height: '220px' }}>
              {reports.topProducts.map((product, i) => {
                const heightPct = animated ? Math.max((product.qty / maxTopProduct) * 100, 4) : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full">
                    <span
                      className="text-[10px] font-bold text-orange-600 mb-1 transition-opacity duration-500"
                      style={{ opacity: animated ? 1 : 0 }}
                    >
                      {product.qty}
                    </span>
                    <div
                      className="w-10 sm:w-14 rounded-t-sm cursor-pointer hover:opacity-85"
                      style={{
                        height: `${heightPct}%`,
                        background: barColors[i % barColors.length],
                        transition: `height 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s`
                      }}
                      title={`${product.name} — ${product.qty} sold`}
                    />
                    <span className="text-[10px] font-semibold text-[#3D1A00] leading-tight text-center mt-2 w-full truncate">
                      {product.name.length > 10 ? `${product.name.slice(0, 10)}…` : product.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donut chart — self-drawing animation */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-[#3D1A00]">Products by Category</h3>
            <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">Distribution</p>
          </div>

          {donutSlices.length === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-12">No products yet</p>
          ) : (
            <>
              <div className="relative w-full aspect-square max-w-[200px] mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {donutSlices.map((slice, i) => {
                    const sliceLength = (slice.percentNum / 100) * DONUT_CIRCUMFERENCE;

                    let cumulativeOffset = 0;
                    for (let j = 0; j < i; j++) {
                      cumulativeOffset += (donutSlices[j].percentNum / 100) * DONUT_CIRCUMFERENCE;
                    }

                    const dashOffset = animated
                      ? -cumulativeOffset
                      : sliceLength + cumulativeOffset;

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
                          transition: `stroke-dashoffset 0.9s cubic-bezier(0.65, 0, 0.35, 1) ${i * 0.18}s`
                        }}
                      >
                        <title>{slice.label}: {slice.count} ({slice.percent}%)</title>
                      </circle>
                    );
                  })}
                </svg>

                {donutSlices.map((slice, i) => {
                  let cumulative = 0;
                  for (let j = 0; j < i; j++) {
                    cumulative += donutSlices[j].percentNum;
                  }
                  const midPercent = (cumulative + slice.percentNum / 2) / 100;
                  const midAngle = midPercent * 2 * Math.PI;

                  const labelRadius = DONUT_RADIUS;
                  const x = 50 + labelRadius * Math.sin(midAngle);
                  const y = 50 - labelRadius * Math.cos(midAngle);

                  return (
                    <span
                      key={`label-${i}`}
                      className="absolute text-[9px] font-bold text-white pointer-events-none"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                        opacity: animated ? 1 : 0,
                        transition: `opacity 0.4s ease-out ${1.2 + i * 0.15}s`
                      }}
                    >
                      {slice.percent}%
                    </span>
                  );
                })}
              </div>

              <div className="space-y-2">
                {donutSlices.map((slice, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: slice.color }}
                      />
                      <span className="text-[#3D1A00] font-semibold truncate">{slice.label}</span>
                    </div>
                    <span className="font-bold text-[#7A6A5A] flex-shrink-0 ml-2">
                      {slice.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ═══ Sales bar chart — matches Top Selling style ═══ */}
      <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#3D1A00]">Sales</h3>
            <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">Last 7 days</p>
          </div>
          <span className="text-[10px] font-bold text-orange-600">
            रु {Math.round(reports.dailySales.reduce((s, d) => s + d.value, 0) / 1000)}k total
          </span>
        </div>

        <div className="flex items-end justify-around gap-3" style={{ height: '220px' }}>
          {reports.dailySales.map((day, i) => {
            const rawHeight = maxSales > 0 ? (day.value / maxSales) * 100 : 0;
            const heightPct = animated ? Math.max(rawHeight, 4) : 0;

            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full">
                <span
                  className="text-[10px] font-bold text-orange-600 mb-1 transition-opacity duration-500"
                  style={{ opacity: animated ? 1 : 0, transitionDelay: `${0.3 + i * 0.06}s` }}
                >
                  {day.value > 0 ? `रु${Math.round(day.value / 1000)}k` : '₹0'}
                </span>

                <div
                  className="w-10 sm:w-14 rounded-t-sm cursor-pointer hover:opacity-85"
                  style={{
                    height: `${heightPct}%`,
                    background: day.value > 0
                      ? 'linear-gradient(to top, #EA580C, #F97316)'
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

        {reports.dailySales.every(d => d.value === 0) && (
          <p className="text-center text-[10px] text-[#A8998A] mt-3 italic">
            No sales recorded in the last 7 days
          </p>
        )}
      </div>

      {/* ═══ Revenue + Orders line charts ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#3D1A00]">Revenue Trend</h3>
              <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">Last 6 months</p>
            </div>
            <span className="text-[10px] font-bold text-orange-600">
              रु {Math.round(reports.monthlyRevenue.reduce((s, m) => s + m.value, 0) / 1000)}k total
            </span>
          </div>

          <div className="relative h-32">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="smallRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F15A29" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#F15A29" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="50" x2="100" y2="50" stroke="#F0DFC5" strokeWidth="0.3" strokeDasharray="2,2" />

              <polygon
                points={buildAreaPoints(reports.monthlyRevenue, maxMonthlyRevenue)}
                fill="url(#smallRevenueGrad)"
                style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease-out 0.6s' }}
              />

              <polyline
                points={buildLinePoints(reports.monthlyRevenue, maxMonthlyRevenue)}
                fill="none"
                stroke="#F15A29"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  strokeDasharray: 300,
                  strokeDashoffset: animated ? 0 : 300,
                  transition: 'stroke-dashoffset 1.4s ease-out 0.2s'
                }}
              />

              {reports.monthlyRevenue.map((m, i) => {
                const step = 100 / Math.max(reports.monthlyRevenue.length - 1, 1);
                const x = i * step;
                const y = 100 - (m.value / maxMonthlyRevenue) * 100;
                return (
                  <circle
                    key={i} cx={x} cy={y} r="1.2" fill="#F15A29" stroke="#fff" strokeWidth="0.6"
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
          <div className="flex justify-between mt-2">
            {reports.monthlyRevenue.map((m, i) => (
              <span key={i} className="text-[9px] font-semibold text-[#7A6A5A]">{m.label}</span>
            ))}
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#3D1A00]">Orders Trend</h3>
              <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">Last 6 months</p>
            </div>
            <span className="text-[10px] font-bold text-[#3D1A00]">
              {reports.monthlyOrders.reduce((s, m) => s + m.value, 0)} total
            </span>
          </div>

          <div className="relative h-32">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
              <defs>
                <linearGradient id="smallOrdersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3D1A00" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3D1A00" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="50" x2="100" y2="50" stroke="#F0DFC5" strokeWidth="0.3" strokeDasharray="2,2" />

              <polygon
                points={buildAreaPoints(reports.monthlyOrders, maxMonthlyOrders)}
                fill="url(#smallOrdersGrad)"
                style={{ opacity: animated ? 1 : 0, transition: 'opacity 0.8s ease-out 0.6s' }}
              />

              <polyline
                points={buildLinePoints(reports.monthlyOrders, maxMonthlyOrders)}
                fill="none"
                stroke="#3D1A00"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{
                  strokeDasharray: 300,
                  strokeDashoffset: animated ? 0 : 300,
                  transition: 'stroke-dashoffset 1.4s ease-out 0.4s'
                }}
              />

              {reports.monthlyOrders.map((m, i) => {
                const step = 100 / Math.max(reports.monthlyOrders.length - 1, 1);
                const x = i * step;
                const y = 100 - (m.value / maxMonthlyOrders) * 100;
                return (
                  <circle
                    key={i} cx={x} cy={y} r="1.2" fill="#3D1A00" stroke="#fff" strokeWidth="0.6"
                    vectorEffect="non-scaling-stroke"
                    style={{
                      opacity: animated ? 1 : 0,
                      transition: `opacity 0.4s ease-out ${1.4 + i * 0.08}s`
                    }}
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between mt-2">
            {reports.monthlyOrders.map((m, i) => (
              <span key={i} className="text-[9px] font-semibold text-[#7A6A5A]">{m.label}</span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminReports;