const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  product_image1: {
    type: String,
  },
  product_image2: {
    type: String,
  },
  product_image3: {
    type: String,
  },
  product_image4: {
    type: String,
  },
  product_name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  offer_price: {
    type: Number,
  },
  status: {
    type: Boolean,
    default: true,
  },
  category_name: {
    type: String,
    required: true,
  },
  category_id: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);
