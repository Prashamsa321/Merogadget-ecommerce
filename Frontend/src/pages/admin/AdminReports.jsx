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
    monthlyOrders: [],
    orderStatusBreakdown: []
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

      // Top products — group by productId (fallback to name)
      const productSales = {};
      orders.forEach(order => {
        (order.items || []).forEach(item => {
          const key = item.productId || item.name;
          if (!key) return;
          if (!productSales[key]) {
            productSales[key] = {
              name: item.name || 'Unknown',
              image: item.image,
              qty: 0,
              revenue: 0
            };
          }
          productSales[key].qty += Number(item.quantity) || 0;
          productSales[key].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
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

      // Daily sales — last 7 days
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

      // Monthly revenue + orders
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

      // Order status breakdown
      const statusCounts = {
        Pending: 0,
        Processing: 0,
        Shipped: 0,
        Delivered: 0,
        Cancelled: 0
      };
      orders.forEach(o => {
        const s = o.orderStatus || 'Pending';
        if (statusCounts[s] !== undefined) statusCounts[s]++;
      });
      const orderStatusBreakdown = Object.entries(statusCounts).map(([name, count]) => ({
        name,
        count
      }));

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
        monthlyOrders,
        orderStatusBreakdown
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
  const maxTopProduct = Math.max(...reports.topProducts.map(p => p.qty), 1);
  const maxStatusCount = Math.max(...reports.orderStatusBreakdown.map(s => s.count), 1);

  const buildLinePoints = (data, maxValue) => {
    if (data.length === 0) return '';
    const step = 100 / Math.max(data.length - 1, 1);
    return data.map((d, i) => {
      const x = i * step;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');
  };

  const pieColors = ['#3D1A00', '#7C2D12', '#C2410C', '#F15A29'];
  const barShades = ['#7C2D12', '#9A3412', '#C2410C', '#EA580C', '#F97316', '#FB923C'];

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

  // Reusable mini bar chart
  const MiniBarChart = ({ data, maxValue, formatValue = (v) => v, height = 160 }) => {
    if (!data || data.length === 0) {
      return <p className="text-xs text-[#7A6A5A] text-center py-8">No data</p>;
    }
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="border-t border-dashed border-orange-100"></div>
          ))}
        </div>

        <div className="relative flex items-end justify-around gap-2 h-full">
          {data.map((d, i) => {
            const rawPct = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
            const heightPct = animated ? Math.max(rawPct, 3) : 0;
            const shade = barShades[i % barShades.length];
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end min-w-0 h-full">
                <span
                  className="text-[10px] font-bold text-orange-700 mb-1 transition-opacity duration-500"
                  style={{ opacity: animated ? 1 : 0, transitionDelay: `${i * 0.06}s` }}
                >
                  {formatValue(d.value)}
                </span>
                <div
                  className="w-full max-w-[28px] rounded-t-sm cursor-pointer hover:opacity-85"
                  style={{
                    height: `${heightPct}%`,
                    background: shade,
                    transition: `height 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.06}s`
                  }}
                  title={`${d.label}: ${formatValue(d.value)}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Reusable mini line chart
  const MiniLineChart = ({ data, maxValue, strokeColor = '#F15A29', height = 160 }) => {
    if (!data || data.length === 0) {
      return <p className="text-xs text-[#7A6A5A] text-center py-8">No data</p>;
    }
    return (
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="border-t border-dashed border-orange-100"></div>
          ))}
        </div>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="relative w-full h-full overflow-visible">
          <polyline
            points={buildLinePoints(data, maxValue)}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{
              strokeDasharray: 400,
              strokeDashoffset: animated ? 0 : 400,
              transition: 'stroke-dashoffset 1.4s ease-out 0.2s'
            }}
          />
          {data.map((d, i) => {
            const step = 100 / Math.max(data.length - 1, 1);
            const x = i * step;
            const y = 100 - (d.value / maxValue) * 100;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.6"
                fill={strokeColor}
                stroke="#fff"
                strokeWidth="0.8"
                vectorEffect="non-scaling-stroke"
                style={{
                  opacity: animated ? 1 : 0,
                  transition: `opacity 0.4s ease-out ${1 + i * 0.08}s`
                }}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const ChartHeader = ({ title, subtitle, right }) => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-bold text-[#3D1A00]">{title}</h3>
        {subtitle && <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );

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
          Refresh
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
        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Products</p>
          <p className="text-xl font-bold text-orange-600">{reports.totalProducts}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Users</p>
          <p className="text-xl font-bold text-[#7C2D12]">{reports.totalUsers}</p>
        </div>
      </div>

      {/* Row 1: Top Selling (bars) | Products by Category (donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader
            title="Top Selling Products"
            subtitle="By quantity sold"
            right={<span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Top {reports.topProducts.length}</span>}
          />
          {reports.topProducts.length === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-8">No sales data yet</p>
          ) : (
            <>
              <MiniBarChart
                data={reports.topProducts.map(p => ({ label: p.name, value: p.qty }))}
                maxValue={maxTopProduct}
                formatValue={(v) => v}
              />
              <div className="flex justify-around gap-2 mt-3">
                {reports.topProducts.map((p, i) => (
                  <span key={i} className="text-[10px] font-semibold text-[#3D1A00] text-center flex-1 min-w-0 truncate" title={p.name}>
                    {p.name.length > 8 ? `${p.name.slice(0, 8)}…` : p.name}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader title="Products by Category" subtitle="Distribution" />
          {donutSlices.length === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-8">No products yet</p>
          ) : (
            <div className="grid grid-cols-[180px_1fr] gap-4 items-center">
              <div className="relative w-full aspect-square">
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
                        style={{ transition: `stroke-dashoffset 0.9s cubic-bezier(0.65, 0, 0.35, 1) ${i * 0.18}s` }}
                      >
                        <title>{slice.label}: {slice.count} ({slice.percent}%)</title>
                      </circle>
                    );
                  })}
                </svg>
              </div>
              <div className="space-y-2">
                {donutSlices.map((slice, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: slice.color }} />
                      <span className="text-[#3D1A00] font-semibold truncate">{slice.label}</span>
                    </div>
                    <span className="font-bold text-[#7A6A5A] flex-shrink-0 ml-2">{slice.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Sales (line) | Revenue Trend (line) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader
            title="Sales"
            subtitle="Last 7 days"
            right={<span className="text-[10px] font-bold text-orange-600">रु {Math.round(reports.dailySales.reduce((s, d) => s + d.value, 0) / 1000)}k</span>}
          />
          <MiniLineChart
            data={reports.dailySales}
            maxValue={maxSales}
            strokeColor="#F15A29"
          />
          <div className="flex justify-around mt-3">
            {reports.dailySales.map((d, i) => (
              <span key={i} className="text-[10px] font-semibold text-[#7A6A5A] flex-1 text-center">{d.label}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader
            title="Revenue Trend"
            subtitle="Last 6 months"
            right={<span className="text-[10px] font-bold text-orange-600">रु {Math.round(reports.monthlyRevenue.reduce((s, m) => s + m.value, 0) / 1000)}k</span>}
          />
          <MiniLineChart
            data={reports.monthlyRevenue}
            maxValue={maxMonthlyRevenue}
            strokeColor="#C2410C"
          />
          <div className="flex justify-around mt-3">
            {reports.monthlyRevenue.map((m, i) => (
              <span key={i} className="text-[10px] font-semibold text-[#7A6A5A] flex-1 text-center">{m.label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Orders Trend (bars) | Order Status (horizontal bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader
            title="Orders Trend"
            subtitle="Last 6 months"
            right={<span className="text-[10px] font-bold text-[#3D1A00]">{reports.monthlyOrders.reduce((s, m) => s + m.value, 0)} total</span>}
          />
          <MiniBarChart
            data={reports.monthlyOrders}
            maxValue={Math.max(...reports.monthlyOrders.map(m => m.value), 1)}
            formatValue={(v) => v}
          />
          <div className="flex justify-around mt-3">
            {reports.monthlyOrders.map((m, i) => (
              <span key={i} className="text-[10px] font-semibold text-[#7A6A5A] flex-1 text-center">{m.label}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader title="Order Status" subtitle="Breakdown" />
          {reports.orderStatusBreakdown.every(s => s.count === 0) ? (
            <p className="text-xs text-[#7A6A5A] text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3 pt-2">
              {reports.orderStatusBreakdown.map((s, i) => {
                const pct = animated ? (s.count / maxStatusCount) * 100 : 0;
                const shade = barShades[i % barShades.length];
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-[#3D1A00]">{s.name}</span>
                      <span className="text-xs font-bold text-orange-600">{s.count}</span>
                    </div>
                    <div className="h-2.5 bg-orange-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: shade,
                          transition: `width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.08}s`
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

    </div>
  );
};

export default AdminReports;