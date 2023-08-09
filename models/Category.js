const mongoose = require('mongoose');

const { Schema } = mongoose;

const categoriesSchema = new Schema({
  category_name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Category', categoriesSchema);
