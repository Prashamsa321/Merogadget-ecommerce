import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminAnalytics = () => {
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [animated, setAnimated] = useState(false);
  const [data, setData] = useState({
    totalOrders: 0,
    totalUsers: 0,
    conversionRate: 0,
    totalRevenue: 0,
    customerGrowth: [],
    aovTrend: [],
    repeatVsNew: { repeat: 0, new: 0 },
    paymentSplit: [],
    ordersByDay: [],
    topCustomers: [],
    categoryRevenue: [],
    funnel: { total: 0, valid: 0, delivered: 0 }
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

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const conversionRate = users.length > 0 ? (orders.length / users.length) * 100 : 0;

      // Customer growth — new signups per month (last 6 months)
      const customerGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const label = date.toLocaleDateString('en-US', { month: 'short' });
        const count = users.filter(u => {
          if (!u.createdAt) return false;
          const d = new Date(u.createdAt);
          return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        }).length;
        customerGrowth.push({ label, value: count });
      }

      // AOV trend — avg order value per month (last 6 months)
      const aovTrend = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const label = date.toLocaleDateString('en-US', { month: 'short' });
        const monthOrders = orders.filter(o => {
          const d = new Date(o.createdAt);
          return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
        });
        const monthRevenue = monthOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
        const avg = monthOrders.length > 0 ? Math.round(monthRevenue / monthOrders.length) : 0;
        aovTrend.push({ label, value: avg });
      }

      // Repeat vs New customers
      const userOrderCount = {};
      orders.forEach(o => {
        const key = o.userId?._id || o.userId || o.shippingAddress?.email;
        if (!key) return;
        userOrderCount[key] = (userOrderCount[key] || 0) + 1;
      });
      let repeat = 0, newC = 0;
      Object.values(userOrderCount).forEach(c => {
        if (c >= 2) repeat++;
        else newC++;
      });

      // Payment split
      const paymentCounts = {};
      orders.forEach(o => {
        const method = o.paymentMethod || 'COD';
        paymentCounts[method] = (paymentCounts[method] || 0) + 1;
      });
      const paymentSplit = Object.entries(paymentCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // Orders by day of week
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const ordersByDay = dayNames.map(name => ({ label: name, value: 0 }));
      orders.forEach(o => {
        const d = new Date(o.createdAt);
        ordersByDay[d.getDay()].value++;
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

      // Category revenue
      const productMap = {};
      products.forEach(p => { productMap[p._id] = p.category || 'Uncategorized'; });
      const categoryRevenue = {};
      orders.forEach(o => {
        (o.items || []).forEach(item => {
          const cat = productMap[item.productId] || 'Other';
          categoryRevenue[cat] = (categoryRevenue[cat] || 0) + ((item.price || 0) * (item.quantity || 0));
        });
      });
      const categoryRevArr = Object.entries(categoryRevenue)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      // Order funnel
      const funnel = {
        total: orders.length,
        valid: orders.filter(o => o.orderStatus !== 'Cancelled').length,
        delivered: orders.filter(o => o.orderStatus === 'Delivered').length
      };

      setData({
        totalOrders: orders.length,
        totalUsers: users.length,
        conversionRate,
        totalRevenue,
        customerGrowth,
        aovTrend,
        repeatVsNew: { repeat, new: newC },
        paymentSplit,
        ordersByDay,
        topCustomers,
        categoryRevenue: categoryRevArr,
        funnel
      });
    } catch (err) {
      console.error('Analytics fetch error:', err);
      toastError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  const maxCustomerGrowth = Math.max(...data.customerGrowth.map(d => d.value), 1);
  const maxAOV = Math.max(...data.aovTrend.map(d => d.value), 1);
  const maxOrdersByDay = Math.max(...data.ordersByDay.map(d => d.value), 1);
  const maxCategoryRev = Math.max(...data.categoryRevenue.map(c => c.value), 1);
  const maxPayment = Math.max(...data.paymentSplit.map(p => p.count), 1);
  const repeatTotal = data.repeatVsNew.repeat + data.repeatVsNew.new;

  const barShades = ['#7C2D12', '#9A3412', '#C2410C', '#EA580C', '#F97316', '#FB923C'];

  const buildLinePoints = (values, max) => {
    if (values.length === 0) return '';
    const step = 100 / Math.max(values.length - 1, 1);
    return values.map((v, i) => `${i * step},${100 - (v / max) * 100}`).join(' ');
  };

  // Mini line chart
  const MiniLineChart = ({ data: chartData, maxValue, strokeColor = '#F15A29', height = 160 }) => {
    if (!chartData || chartData.length === 0) {
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
            points={buildLinePoints(chartData.map(d => d.value), maxValue)}
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
          {chartData.map((d, i) => {
            const step = 100 / Math.max(chartData.length - 1, 1);
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
                style={{ opacity: animated ? 1 : 0, transition: `opacity 0.4s ease-out ${1 + i * 0.08}s` }}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  // Mini bar chart
  const MiniBarChart = ({ data: chartData, maxValue, formatValue = (v) => v, height = 160 }) => {
    if (!chartData || chartData.length === 0) {
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
          {chartData.map((d, i) => {
            const rawPct = maxValue > 0 ? (d.value / maxValue) * 100 : 0;
            const heightPct = animated ? Math.max(rawPct, 3) : 0;
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
                    background: barShades[i % barShades.length],
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

  const ChartHeader = ({ title, subtitle, right }) => (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-bold text-[#3D1A00]">{title}</h3>
        {subtitle && <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );

  // Repeat donut slices
  const repeatSlices = (() => {
    if (repeatTotal === 0) return [];
    const repeatPct = (data.repeatVsNew.repeat / repeatTotal) * 100;
    const newPct = (data.repeatVsNew.new / repeatTotal) * 100;
    return [
      { label: 'Repeat', count: data.repeatVsNew.repeat, percentNum: repeatPct, color: '#F15A29' },
      { label: 'New', count: data.repeatVsNew.new, percentNum: newPct, color: '#FBBF24' }
    ];
  })();

  const DONUT_RADIUS = 32;
  const DONUT_STROKE = 16;
  const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <p className="eyebrow mb-1">Insights</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Analytics</h1>
          <p className="text-[#7A6A5A] mt-1 text-sm">Customer behavior, trends & performance</p>
        </div>
        <button
          onClick={fetchAnalyticsData}
          className="text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-full transition-colors font-semibold shadow-md shadow-orange-500/20"
        >
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Total Orders</p>
          <p className="text-xl font-bold text-[#3D1A00]">{data.totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Total Users</p>
          <p className="text-xl font-bold text-[#7C2D12]">{data.totalUsers}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Orders / User</p>
          <p className="text-xl font-bold text-orange-600">{data.conversionRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-soft">
          <p className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Total Revenue</p>
          <p className="text-xl font-bold text-green-600">रु {Math.round(data.totalRevenue / 1000)}k</p>
        </div>
      </div>

      {/* Row 1: Customer Growth (bar) | Repeat vs New (donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader
            title="Customer Growth"
            subtitle="New signups · last 6 months"
            right={<span className="text-[10px] font-bold text-orange-600">+{data.customerGrowth.reduce((s, d) => s + d.value, 0)} this period</span>}
          />
          <MiniBarChart data={data.customerGrowth} maxValue={maxCustomerGrowth} />
          <div className="flex justify-around mt-3">
            {data.customerGrowth.map((d, i) => (
              <span key={i} className="text-[10px] font-semibold text-[#7A6A5A] flex-1 text-center">{d.label}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader title="Repeat vs New" subtitle="Customer loyalty" />
          {repeatTotal === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-8">No customer data</p>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-[160px] aspect-square mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {repeatSlices.map((slice, i) => {
                    const sliceLength = (slice.percentNum / 100) * DONUT_CIRCUMFERENCE;
                    let cumulativeOffset = 0;
                    for (let j = 0; j < i; j++) {
                      cumulativeOffset += (repeatSlices[j].percentNum / 100) * DONUT_CIRCUMFERENCE;
                    }
                    const dashOffset = animated ? -cumulativeOffset : sliceLength + cumulativeOffset;
                    return (
                      <circle
                        key={i}
                        cx="50" cy="50" r={DONUT_RADIUS}
                        fill="none" stroke={slice.color} strokeWidth={DONUT_STROKE}
                        strokeDasharray={`${sliceLength} ${DONUT_CIRCUMFERENCE}`}
                        strokeDashoffset={dashOffset} strokeLinecap="butt"
                        style={{ transition: `stroke-dashoffset 0.9s cubic-bezier(0.65, 0, 0.35, 1) ${i * 0.18}s` }}
                      />
                    );
                  })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-bold text-[#3D1A00]">{repeatTotal}</p>
                  <p className="text-[9px] text-[#A8998A] uppercase tracking-widest font-semibold">Buyers</p>
                </div>
              </div>
              <div className="w-full space-y-2">
                {repeatSlices.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-[#3D1A00] font-semibold">{s.label}</span>
                    </div>
                    <span className="font-bold text-[#7A6A5A]">{s.count} · {s.percentNum.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: AOV Trend (line) | Payment Split (bars) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader
            title="Average Order Value"
            subtitle="Last 6 months"
            right={<span className="text-[10px] font-bold text-orange-600">रु {Math.round(data.aovTrend.reduce((s, d) => s + d.value, 0) / Math.max(data.aovTrend.length, 1)).toLocaleString()} avg</span>}
          />
          <MiniLineChart data={data.aovTrend} maxValue={maxAOV} strokeColor="#C2410C" />
          <div className="flex justify-around mt-3">
            {data.aovTrend.map((d, i) => (
              <span key={i} className="text-[10px] font-semibold text-[#7A6A5A] flex-1 text-center">{d.label}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader title="Payment Method" subtitle="Split by orders" />
          {data.paymentSplit.length === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4 pt-2">
              {data.paymentSplit.map((p, i) => {
                const pct = animated ? (p.count / maxPayment) * 100 : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-[#3D1A00]">{p.name}</span>
                      <span className="text-xs font-bold text-orange-600">{p.count}</span>
                    </div>
                    <div className="h-3 bg-orange-50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: barShades[i % barShades.length],
                          transition: `width 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s`
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

      {/* Row 3: Orders by Day (bars) | Top Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader
            title="Orders by Day of Week"
            subtitle="Distribution"
            right={<span className="text-[10px] font-bold text-orange-600">{data.totalOrders} orders</span>}
          />
          <MiniBarChart data={data.ordersByDay} maxValue={maxOrdersByDay} />
          <div className="flex justify-around mt-3">
            {data.ordersByDay.map((d, i) => (
              <span key={i} className="text-[10px] font-semibold text-[#7A6A5A] flex-1 text-center">{d.label}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
          <ChartHeader title="Top Customers" subtitle="By total spend" />
          {data.topCustomers.length === 0 ? (
            <p className="text-xs text-[#7A6A5A] text-center py-8">No customer data</p>
          ) : (
            <div className="space-y-2">
              {data.topCustomers.map((customer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 bg-[#FFF4E6] rounded-xl border border-orange-100/70 hover:bg-orange-50 transition-all duration-300"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-[#C2410C] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
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

      {/* Row 4: Top Categories by Revenue */}
      <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
        <ChartHeader
          title="Top Categories by Revenue"
          subtitle="Which categories earn the most"
          right={<span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{data.categoryRevenue.length} shown</span>}
        />
        {data.categoryRevenue.length === 0 ? (
          <p className="text-xs text-[#7A6A5A] text-center py-8">No revenue data yet</p>
        ) : (
          <div className="space-y-3 pt-1">
            {data.categoryRevenue.map((cat, i) => {
              const pct = animated ? (cat.value / maxCategoryRev) * 100 : 0;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#3D1A00]">{cat.name}</span>
                    <span className="text-xs font-bold text-orange-600">रु {cat.value.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 bg-orange-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: barShades[i % barShades.length],
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

      {/* Row 5: Order Funnel */}
      <div className="bg-white rounded-2xl p-5 border border-orange-100 shadow-soft">
        <ChartHeader
          title="Order Funnel"
          subtitle="From placed to delivered"
          right={<span className="text-[10px] font-bold text-orange-600">{data.funnel.total} total</span>}
        />
        <div className="space-y-3 pt-1">
          {[
            { label: 'Total Orders', value: data.funnel.total, color: barShades[0] },
            { label: 'Non-Cancelled', value: data.funnel.valid, color: barShades[2] },
            { label: 'Delivered', value: data.funnel.delivered, color: barShades[4] }
          ].map((step, i) => {
            const pct = animated && data.funnel.total > 0 ? (step.value / data.funnel.total) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[#3D1A00]">{step.label}</span>
                  <span className="text-xs font-bold text-orange-600">
                    {step.value} <span className="text-[#A8998A] font-medium">({data.funnel.total > 0 ? ((step.value / data.funnel.total) * 100).toFixed(0) : 0}%)</span>
                  </span>
                </div>
                <div className="h-3 bg-orange-50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      background: step.color,
                      transition: `width 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.15}s`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;