import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { 
  register, 
  login, 
  getMe,
  updateProfile,
  changePassword,
  updateUserRole,
  deleteUser
} from '../controllers/auth.controller.js';
import User from '../models/User.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/change-password', protect, changePassword);  // Change password endpoint

// Admin only routes
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const users = await User.find({}).select('-password');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id/role', protect, updateUserRole);
router.delete('/users/:id', protect, deleteUser);

export default router;