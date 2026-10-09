import Subscriber from '../models/Subscriber.js';

export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email' });
    }

    const normalized = email.trim().toLowerCase();

    const existing = await Subscriber.findOne({ email: normalized });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You are already subscribed' });
    }

    const subscriber = new Subscriber({ email: normalized });
    await subscriber.save();

    res.status(201).json({
      success: true,
      message: 'Subscribed successfully',
      subscriber
    });
  } catch (error) {
    console.error('Subscribe error:', error);

    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'You are already subscribed' });
    }

    res.status(500).json({ success: false, message: 'Error subscribing', error: error.message });
  }
};

export const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find({}).sort({ subscribedAt: -1 });
    res.status(200).json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({ success: false, message: 'Error fetching subscribers', error: error.message });
  }
};

export const getSubscriberStats = async (req, res) => {
    try {
      const total = await Subscriber.countDocuments();
  
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
  
      const dailyRaw = await Subscriber.aggregate([
        { $match: { subscribedAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$subscribedAt', timezone: '+05:45' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      const dailyMap = {};
      dailyRaw.forEach(d => { dailyMap[d._id] = d.count; });
  
      const daily = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const key = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kathmandu' });
        const label = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          timeZone: 'Asia/Kathmandu'
        });
        daily.push({
          date: key,
          label,
          count: dailyMap[key] || 0
        });
      }
  
      const last7Days = daily.reduce((sum, d) => sum + d.count, 0);
  
      const recentSubscribers = await Subscriber.find({})
        .sort({ subscribedAt: -1 })
        .limit(20)
        .select('email subscribedAt');
  
      res.status(200).json({
        success: true,
        total,
        last7Days,
        daily,
        recentSubscribers
      });
    } catch (error) {
      console.error('Subscriber stats error:', error);
      res.status(500).json({ success: false, message: 'Error fetching subscriber stats', error: error.message });
    }
  };