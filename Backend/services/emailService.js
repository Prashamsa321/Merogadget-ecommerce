import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  // For Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('gmail')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  
  // For other SMTP (if you have different email service)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    
    // Verify transporter
    await transporter.verify();
    
    const mailOptions = {
      from: `"MeroGadget" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - MeroGadget Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; text-align: center;">
            <h2 style="color: #1a1a2e; margin-bottom: 20px;">Welcome to MeroGadget!</h2>
            <div style="width: 60px; height: 60px; background-color: #1a1a2e; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="font-size: 30px;">🛒</span>
            </div>
            <p style="color: #333; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #555; margin: 20px 0;">Thank you for registering with MeroGadget! Please use the following OTP to verify your email address:</p>
            <div style="background-color: #1a1a2e; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #ffffff; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #777; font-size: 14px;">This OTP is valid for <strong> only 1 minutes</strong>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
            <p>© 2024 MeroGadget. All rights reserved.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    // console.error('Email sending error details:', error);
    return false;
  }
};

// For development - log OTP to console instead of sending email
export const sendOTPDev = (email, otp, name) => {
 
  return true;
};


export const sendPasswordResetOTP = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"MeroGadget" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - MeroGadget',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; text-align: center;">
            <h2 style="color: #1a1a2e; margin-bottom: 20px;">Password Reset Request</h2>
            <div style="width: 60px; height: 60px; background-color: #FF6200; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <span style="font-size: 30px;">🔒</span>
            </div>
            <p style="color: #333; font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="color: #555; margin: 20px 0;">We received a request to reset your password. Use the following OTP to proceed:</p>
            <div style="background-color: #FF6200; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #ffffff; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #777; font-size: 14px;">This OTP is valid for <strong>only 1 minutes</strong>.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
            <p>© 2024 MeroGadget. All rights reserved.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Password reset email error:', error);
    return false;
  }
};
