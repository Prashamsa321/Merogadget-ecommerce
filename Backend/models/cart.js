import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    default: 0
  },
  name: {
    type: String,
    default: 'Product'
  },
  image: {
    type: String,
    default: ''
  }
})

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

// Remove any pre-save hooks and keep it simple
const Cart = mongoose.model('Cart', cartSchema)
export default Cart