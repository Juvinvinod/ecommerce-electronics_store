const mongoose = require('mongoose');

const { Schema } = mongoose;

const orderSchema = new Schema({
  order_id: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
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
  },
  status: {
    type: String,
    default: 'pending',
  },
  total_amount: Number,
  payment_method: String,
  orderTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Order', orderSchema);
