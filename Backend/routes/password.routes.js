import express from 'express';
import {
  forgotPassword,
  verifyResetOTP,
  resetPassword
} from '../controllers/password.controller.js';

const router = express.Router();

router.post('/forgot', forgotPassword);
router.post('/verify-otp', verifyResetOTP);
router.post('/reset', resetPassword);

export default router;