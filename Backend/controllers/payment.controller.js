import Cart from '../models/cart.js';
import axios from 'axios';
import Order from '../models/Order.js';

// Get Khalti key from env with fallback (dev sandbox key)
const KHALTI_KEY = process.env.KHALTI_SECRET_KEY || "live_secret_key_68791341fdd94846a146f0457ff7b455";
const KHALTI_BASE = process.env.KHALTI_BASE_URL || "https://dev.khalti.com/api/v2";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const khaltiPayment = async (req, res) => {
  try {
    const userId = req.user._id;

    const cartitems = await Cart.findOne({ userId });

    if (!cartitems || cartitems.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const amount = cartitems.totalAmount;
    const productId = cartitems.items[0].productId;

    const payload = {
      return_url: `${FRONTEND_URL}/paymentsuccess`,
      website_url: FRONTEND_URL,
      amount: Math.round(amount * 100),
      purchase_order_id: Date.now().toString(),
      purchase_order_name: `Product ${productId}`,
      customer_info: {
        name: req.user.name,
        email: req.user.email,
        phone: "9800000001"
      }
    };

    const response = await axios.post(
      `${KHALTI_BASE}/epayment/initiate/`,
      payload,
      {
        headers: {
          "Authorization": `key ${KHALTI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.error('❌ Khalti initiate error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error initiating payment',
      error: error.response?.data?.detail || error.message
    });
  }
};

export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: "Invalid input"
      });
    }

    // ✅ Idempotency check — if this pidx was already verified, return the order
    const existingOrder = await Order.findOne({ pidx });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
        order: existingOrder
      });
    }

    const response = await axios.post(
      `${KHALTI_BASE}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          "Authorization": `key ${KHALTI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const result = response.data;

    if (result.status === "Completed") {
      const userId = req.user._id;

      const cart = await Cart.findOne({ userId });

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty — order may have already been placed"
        });
      }

      // Convert cart items → order items with proper types
      const orderItems = cart.items.map(item => ({
        productId: item.productId,
        name: item.name || 'Product',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || ''
      }));

      const order = await Order.create({
        userId,
        items: orderItems,
        totalAmount: Number(cart.totalAmount) || 0,
        paymentMethod: "Khalti",
        paymentStatus: "Paid",
        transactionId: result.transaction_id || '',
        pidx: result.pidx || pidx
      });

      // Delete cart after successful order
      await Cart.findOneAndDelete({ userId });

      return res.status(200).json({
        success: true,
        message: "Payment successful",
        order
      });
    }

    return res.status(400).json({
      success: false,
      message: "Payment not completed",
      data: result
    });

  } catch (error) {
    console.error('❌ VERIFY ERROR:', {
      message: error.message,
      stack: error.stack,
      khaltiResponse: error.response?.data
    });

    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Verification failed'
    });
  }
};