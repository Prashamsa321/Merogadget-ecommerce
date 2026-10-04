import express from 'express';
import {
  sendRegistrationOTP,
  verifyOTP,
  resendOTP
} from '../controllers/otp.controller.js';

const router = express.Router();

router.post('/send', sendRegistrationOTP);
router.post('/verify', verifyOTP);
router.post('/resend', resendOTP);

export default router;