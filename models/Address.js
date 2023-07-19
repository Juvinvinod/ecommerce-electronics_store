const mongoose = require('mongoose');

const { Schema } = mongoose;

const addressSchema = new Schema({
  building_name: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pin_code: {
    type: Number,
    required: true,
  },
  phone_number: {
    type: Number,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Address', addressSchema);
