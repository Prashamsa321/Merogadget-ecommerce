
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from "cookie-parser";
import dns from "node:dns";


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
import brandRoutes from './routes/brand.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express()

app.use(cookieParser());


dotenv.config()

// Increased limit to handle base64 image uploads (profile photo, product image)
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

dns.setServers(["8.8.8.8", "1.1.1.1"]);
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

// MongoDB connection for Serverless & Local
let isConnected = false
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return
  }
  if (!process.env.MONGO_URI) {
    console.error('CRITICAL: MONGO_URI is not set in environment variables!')
    throw new Error('MONGO_URI is missing in environment variables')
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    })
    isConnected = !!conn.connections[0].readyState
    console.log('MongoDB Connected')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    throw error
  }
}

// Initial connection attempt on cold start
connectDB().catch(err => console.error('Initial DB connect attempt failed:', err.message))

// Middleware to ensure DB connection before handling API routes
app.use(async (req, res, next) => {
  // Allow health/root checks without waiting for DB
  if (req.path === '/' || req.path === '/api' || req.path === '/api/test') {
    return next()
  }
  try {
    await connectDB()
    next()
  } catch (err) {
    console.error('DB middleware error:', err.message)
    return res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: err.message,
      hint: !process.env.MONGO_URI ? 'MONGO_URI is missing from Vercel environment variables' : 'Check MongoDB Atlas Network Access whitelist (0.0.0.0/0)'
    })
  }
})

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

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }
  res.json({
    success: true,
    message: 'API is healthy',
    database: states[dbState] || 'unknown',
    mongoUriConfigured: !!process.env.MONGO_URI
  })
})

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/contact', contactRoutes)
app.use('/api/otp', otpRoutes)
app.use('/api/password', passwordRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/subscribers', subscriberRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/brands', brandRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error:', err)
  res.status(500).json({
    success: false,
    message: 'Something went wrong',
    error: err.message
  })
})

const PORT = process.env.PORT || 5000
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`)
  })
}

export default app