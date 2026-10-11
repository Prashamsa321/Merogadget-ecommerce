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

// Increased limit to handle base64 image uploads (profile photo, product image)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://192.168.100.72:3001',
  'http://192.168.56.1:3001',
  'http://192.168.100.72:5000',
  'https://merogadget-ecommerce.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : []),
]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true)

    const isAllowed =
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')

    if (isAllowed) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
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


// Root & health check routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working',
    environment: process.env.NODE_ENV || 'development'
  })
})

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working'
  })
})

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
let isConnected = false
const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/test')
    isConnected = !!conn.connections[0].readyState
    console.log('MongoDB Connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    if (!process.env.VERCEL) {
      process.exit(1)
    }
  }
}

connectDB()

// Middleware to ensure DB connection in serverless environments
app.use(async (req, res, next) => {
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('Database connection error in middleware:', err)
    next(err)
  }
})

const PORT = process.env.PORT || 5000
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
  })
}

export default app