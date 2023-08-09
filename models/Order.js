const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderSchema = new Schema({
  order_id: {
    type: String,
    unique: true,
    required: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
    required: true,
  },
  product: [
    {
      product_id: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Product',
      },
      quantity: Number,
    },
  ],
  address: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Address',
    required: true,
  },
  status: {
    type: String,
    default: 'pending',
  },
  total_amount: {
    type: Number,
    required: true,
  },
  payment_method: {
    type: String,
    required: true,
  },
  orderTime: {
    type: Date,
    // default: Date.now(),
    default: new Date(),
  },
  coupon_used: {
    type: String,
  },
});

module.exports = mongoose.model('Order', orderSchema);
