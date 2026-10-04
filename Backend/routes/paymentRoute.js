import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { khaltiPayment , verifyKhaltiPayment } from '../controllers/payment.controller.js';

const router = express.Router();


// Payment routes
router.post('/khalti', protect, khaltiPayment);
router.post('/verify', protect, verifyKhaltiPayment);

export default router;