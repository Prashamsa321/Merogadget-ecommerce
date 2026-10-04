import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: String,       
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: ''
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true
    },

    shippingAddress: {
      fullName: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      postalCode: String,
      country: {
        type: String,
        default: 'Nepal'
      }
    },

    paymentMethod: {
      type: String,
      enum: ['Khalti', 'COD'],
      default: 'COD'
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending'
    },

    orderStatus: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },

    transactionId: {
      type: String,
      default: ''
    },

    pidx: {
      type: String,
      unique: true,
      sparse: true
    },

    statusHistory: [
      {
        status: String,
        comment: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        updatedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    trackingNumber: {
      type: String,
      default: ''
    },

    estimatedDelivery: Date,

    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

orderSchema.pre('save', function () {
  if (!this.orderNumber) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    this.orderNumber = `ORD-${year}${month}-${timestamp}${random}`;
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;