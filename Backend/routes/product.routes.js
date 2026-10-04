import express from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes
router.get('/getproduct', getAllProducts)
router.get('/getproduct/:id', getProductById)

// Admin only routes
router.post('/createproduct', protect, createProduct)
router.put('/updateproduct/:id', protect, updateProduct)
router.delete('/deleteproduct/:id', protect, deleteProduct)

export default router