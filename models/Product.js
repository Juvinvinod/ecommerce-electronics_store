const mongoose = require('mongoose');

const { Schema } = mongoose;

const productSchema = new Schema({
  product_image1: {
    type: String,
    // required: true,
  },
  product_image2: {
    type: String,
    // required: true,
  },
  product_image3: {
    type: String,
    // required: true,
  },
  product_image4: {
    type: String,
    // required: true,
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
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
});

module.exports = mongoose.model('Product', productSchema);
