const mongoose = require('mongoose');

const { Schema } = mongoose;

const cartSchema = new Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User',
  },
  product: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Product',
  },
  quantity: {
    type: Number,
    default: 1,
  },
});

module.exports = mongoose.model('Cart', cartSchema);
