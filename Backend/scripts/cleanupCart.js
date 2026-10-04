import mongoose from 'mongoose'
import Cart from '../models/cart.js'
import dotenv from 'dotenv'

dotenv.config()

const cleanupCarts = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/test')
    console.log('Connected to MongoDB')
    
    // Remove all carts
    await Cart.deleteMany({})
    console.log('All carts deleted')
    
    // Drop the collection to remove indexes
    await mongoose.connection.db.dropCollection('carts')
    console.log('Carts collection dropped')
    
    console.log('Cleanup completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Cleanup error:', error)
    process.exit(1)
  }
}

cleanupCarts()