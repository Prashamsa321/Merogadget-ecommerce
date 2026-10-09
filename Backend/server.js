import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from "cookie-parser";


import authRoutes from './routes/auth.routes.js'
import cartRoutes from './routes/cart.routes.js'
import productRoutes from './routes/product.routes.js'
import categoryRoutes from './routes/category.routes.js';
import contactRoutes from './routes/contact.routes.js';
import otpRoutes from './routes/otp.routes.js';
import passwordRoutes from './routes/password.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/paymentRoute.js';
import subscriberRoutes from './routes/subscriber.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express()

app.use(cookieParser());


dotenv.config()

app.use(express.json())

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.100.72:3001',
    'http://192.168.56.1:3001',
    'http://192.168.100.72:5000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))



// Routes
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes); 
app.use('/api/contact', contactRoutes)
app.use('/api/otp', otpRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/dashboard', dashboardRoutes);


// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err)
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: err.message
  })
})

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI  || 'mongodb://localhost:27017/test')
    console.log('MongoDB Connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

connectDB()

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
  console.log(`Network access: http://192.168.100.72:${PORT}`)
})

