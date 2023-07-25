const mongoose = require('mongoose');

const { Schema } = mongoose;

const categoriesSchema = new Schema({
  category_name: {
    type: String,
    required: true,
  },
  // category_image: {
  //   type: String,
  //   required: true,
  // },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

// const subCategoriesSchema = new Schema({
//   category: {
//     type: Schema.Types.ObjectId,
//     ref: 'Category',
//   },
//   sub_category_name: {
//     type: String,
//     required: true,
//   },
// });

module.exports = mongoose.model('Category', categoriesSchema);
// module.exports = mongoose.model('SubCategory', subCategoriesSchema);
