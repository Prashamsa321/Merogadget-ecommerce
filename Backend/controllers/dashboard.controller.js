import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/product.js';
import Subscriber from '../models/Subscriber.js';

const NP_TZ = '+05:45';

const dayKey = (d) => d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' });
const dayLabel = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kathmandu' });

const buildDailyArray = (days) => {
  const out = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    out.push({ date: dayKey(d), label: dayLabel(d), count: 0 });
  }
  return out;
};

export const getDashboardStats = async (req, res) => {
  try {
    // ── Totals ──
    const [totalProducts, totalOrders, totalUsers, totalSubscribers] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Subscriber.countDocuments()
    ]);

    // ── Revenue (from paid or delivered orders) ──
    const revenueAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // ── User growth (last 7 days) ──
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const userAgg = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: NP_TZ } },
          count: { $sum: 1 }
        }
      }
    ]);

    const userGrowth = buildDailyArray(7);
    const userMap = {};
    userAgg.forEach(u => { userMap[u._id] = u.count; });
    userGrowth.forEach(d => { d.count = userMap[d.date] || 0; });

    // ── Revenue trend (last 7 days) ──
    const revenueAgg2 = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: NP_TZ } },
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const revenueTrend = buildDailyArray(7).map(d => ({ ...d, count: 0 }));
    const revMap = {};
    revenueAgg2.forEach(r => { revMap[r._id] = r.total; });
    revenueTrend.forEach(d => { d.count = revMap[d.date] || 0; });

    // ── Order status breakdown ──
    const statusAgg = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);
    const orderStatus = {
      Pending: 0,
      Processing: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };
    statusAgg.forEach(s => {
      if (orderStatus[s._id] !== undefined) orderStatus[s._id] = s.count;
    });

    // ── Top categories (by products sold) ──
    const topCatAgg = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          quantity: { $sum: '$items.quantity' }
        }
      }
    ]);

    const productIds = topCatAgg.map(t => t._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } }).select('category');

    const productCatMap = {};
    products.forEach(p => { productCatMap[p._id.toString()] = p.category || 'Other'; });

    const catTotals = {};
    topCatAgg.forEach(t => {
      const cat = productCatMap[t._id?.toString()] || 'Other';
      catTotals[cat] = (catTotals[cat] || 0) + t.quantity;
    });

    const topCategories = Object.entries(catTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // ── Subscriber stats (7 days) ──
    const subAgg = await Subscriber.aggregate([
      { $match: { subscribedAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$subscribedAt', timezone: NP_TZ } },
          count: { $sum: 1 }
        }
      }
    ]);
    const subscriberGrowth = buildDailyArray(7);
    const subMap = {};
    subAgg.forEach(s => { subMap[s._id] = s.count; });
    subscriberGrowth.forEach(d => { d.count = subMap[d.date] || 0; });

    const recentSubscribers = await Subscriber.find({})
      .sort({ subscribedAt: -1 })
      .limit(20)
      .select('email subscribedAt');

    const last7Subs = subscriberGrowth.reduce((sum, d) => sum + d.count, 0);

    res.status(200).json({
      success: true,
      totals: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        totalSubscribers
      },
      userGrowth,
      revenueTrend,
      orderStatus,
      topCategories,
      subscriberGrowth,
      subscriberStats: {
        total: totalSubscribers,
        last7Days: last7Subs,
        recentSubscribers
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats', error: error.message });
  }
};