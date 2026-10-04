import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  submitContact,
  getAllContacts,
  getContactById,
  replyToContact,
  deleteContact,
  getContactStats
} from '../controllers/contact.controller.js';

const router = express.Router();

// Public route - anyone can submit contact form
router.post('/', submitContact);

// Admin only routes
router.get('/', protect, getAllContacts);
router.get('/stats', protect, getContactStats);
router.get('/:id', protect, getContactById);
router.put('/:id/reply', protect, replyToContact);
router.delete('/:id', protect, deleteContact);

export default router;