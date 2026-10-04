import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
  createCODOrder
} from '../controllers/order.controller.js';

const router = express.Router();

// ✅ User routes
router.get('/', protect, getUserOrders);           // GET /api/orders
router.get('/my-orders', protect, getUserOrders);  // GET /api/orders/my-orders
router.post('/create', protect, createOrder);      // POST /api/orders/create
router.post('/cod', protect, createCODOrder);      // POST /api/orders/cod

// Admin routes (specific paths first, generic /:id LAST)
router.get('/admin/all', protect, getAllOrders);
router.get('/admin/stats', protect, getOrderStats);
router.put('/admin/:id/status', protect, updateOrderStatus);
router.delete('/admin/:id', protect, deleteOrder);

// Generic (must be last — otherwise catches /admin/*)
router.get('/:id', protect, getOrderById);

export default router;