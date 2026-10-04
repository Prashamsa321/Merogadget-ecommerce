import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const testEmail = async () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('Email configuration is working!');
  } catch (error) {
    console.error('Email configuration error:', error.message);
  }
};

testEmail();