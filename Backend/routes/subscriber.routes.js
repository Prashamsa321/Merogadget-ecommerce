import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  subscribe,
  getAllSubscribers,
  getSubscriberStats
} from '../controllers/subscriber.controller.js';

const router = express.Router();

router.post('/', subscribe);
router.get('/', protect, getAllSubscribers);
router.get('/stats', protect, getSubscriberStats);

export default router;