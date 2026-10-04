import Product from '../models/Product.js'

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})    
    res.status(200).json({
      success: true,
      count: products.length,
      products: products  // Make sure this is the key
    })
  } catch (error) {
    console.error('Get products error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    })
  }
}

// Get single product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }
    res.status(200).json({
      success: true,
      product: product
    })
  } catch (error) {
    console.error('Get product error:', error)
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    })
  }
}

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json({
      success: true,
      product: product
    })
  } catch (error) {
    console.error('Create product error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    })
  }
}

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }
    res.status(200).json({
      success: true,
      product: product
    })
  } catch (error) {
    console.error('Update product error:', error)
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    })
  }
}

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }
    res.status(200).json({
      success: true,
      message: ` Product deleted successfully`
    })
  } catch (error) {
    console.error('Delete product error:', error)
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    })
  }
}