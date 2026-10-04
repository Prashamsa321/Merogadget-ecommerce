import Order from '../models/Order.js';
import Cart from '../models/cart.js';
import Product from '../models/Product.js';

// Create new order (from cart — used by Khalti flow if needed)
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod, notes } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      name: item.name || 'Product',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image || ''
    }));

    const order = new Order({
      userId,                                     // ✅ was "user"
      items: orderItems,
      totalAmount: Number(cart.totalAmount) || 0,
      shippingAddress: {
        fullName: shippingAddress?.fullName || '',
        email: shippingAddress?.email || '',
        phone: shippingAddress?.phone || '',
        address: shippingAddress?.address || '',
        city: shippingAddress?.city || '',
        postalCode: shippingAddress?.postalCode || '',
        country: shippingAddress?.country || 'Nepal'
      },
      paymentMethod: paymentMethod || 'COD',
      notes: notes || '',
      orderStatus: 'Pending',                    // ✅ capitalized
      paymentStatus: 'Pending',                  // ✅ capitalized
      statusHistory: [{
        status: 'Pending',
        comment: 'Order placed successfully',
        updatedBy: userId
      }]
    });

    await order.save();

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// ✅ NEW — Cash on Delivery order (from checkout page)
export const createCODOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, items, totalAmount, subtotal, shipping } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    const orderItems = items.map(item => ({
      productId: item.productId || item._id,
      name: item.name || 'Product',
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image || ''
    }));

    const order = new Order({
      userId,
      items: orderItems,
      totalAmount: Number(totalAmount) || 0,
      shippingAddress: {
        fullName: shippingAddress?.fullName || '',
        email: shippingAddress?.email || '',
        phone: shippingAddress?.phone || '',
        address: shippingAddress?.address || '',
        city: shippingAddress?.city || shippingAddress?.district || '',
        postalCode: shippingAddress?.postalCode || '',
        country: shippingAddress?.country || 'Nepal'
      },
      paymentMethod: 'COD',
      paymentStatus: 'Pending',
      orderStatus: 'Pending',
      statusHistory: [{
        status: 'Pending',
        comment: 'Order placed via Cash on Delivery',
        updatedBy: userId
      }]
    });

    await order.save();

    // Clear cart
    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cart.save();
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    console.error('Create COD order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      orders,
      totalOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / limit)
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });  // ✅ userId

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, trackingNumber, estimatedDelivery, comment } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        comment: comment || `Order status updated to ${orderStatus}`,
        updatedBy: req.user._id,
        updatedAt: new Date()
      });
    }

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
};

// Delete order (admin)
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};

// Get order statistics (admin)
export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'Pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'Processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'Shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'Cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pending: pendingOrders,
        processing: processingOrders,
        shipped: shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};