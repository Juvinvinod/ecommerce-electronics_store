const mongoose = require('mongoose');

const { Schema } = mongoose;
const couponSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    minAmount: {
      type: String,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    maxDiscountAmount: {
      type: Number,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    un_list: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
