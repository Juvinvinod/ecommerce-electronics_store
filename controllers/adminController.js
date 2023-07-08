const mongoose = require('mongoose');

const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Product = mongoose.model('Product');

const dashBoard = (req, res) => {
  res.render('admin/adminHome');
};

const allCustomers = async (req, res) => {
  if (req.query.search) {
    const { search } = req.query;
    await User.find({
      isAdmin: false,
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).then((result) => {
      res.render('admin/customers', {
        userList: result,
      });
    });
  } else {
    await User.find({ isAdmin: false }).then((result) => {
      res.render('admin/customers', {
        userList: result,
      });
    });
  }
};

const changeAccess = async (req, res) => {
  const access = req.body.access === 'true';
  const { id } = req.query;
  await User.findByIdAndUpdate(id, { $set: { access } });
  res.redirect('/admin/customers');
};

const displayCategory = async (req, res) => {
  await Category.find({}).then((result) => {
    res.render('admin/categories', { result });
  });
};

const viewEditCategory = async (req, res) => {
  await Category.findById(req.query.id).then((result) => {
    res.render('admin/editCategory', { result });
  });
};

const editCategory = async (req, res) => {
  const oldName = { _id: req.query.id };
  const newName = { category_name: req.body.name };
  await Category.findOneAndUpdate(oldName, newName);
  res.redirect('/admin/Categories');
};

const viewAddCategory = (req, res) => {
  res.render('admin/addCategories');
};

const addCategory = async (req, res, next) => {
  const name = req.body.category_name;
  const existingCategory = await Category.findOne({
    category_name: { $regex: new RegExp(`^${name}$`, 'i') },
  });
  console.log(existingCategory);
  if (existingCategory) {
    const error = new Error('Category already exists');
    error.status = 400;
    next(error);
  } else {
    await new Category(req.body).save();
    res.redirect('/admin/Categories');
  }
};

const displayProducts = async (req, res) => {
  await Product.find({}).then((result) => {
    res.render('admin/products', { result });
  });
};

const viewAddProducts = (req, res) => {
  res.render('admin/addProducts');
};

const addProducts = async (req, res, next) => {
  const findCategory = req.body.category;
  const found = await Category.findOne({
    category_name: { $regex: new RegExp(`^${findCategory}$`, 'i') },
  });
  if (found) {
    const newProduct = Product({
      product_image1: req.body.image1,
      product_image2: req.body.image2,
      product_image3: req.body.image3,
      product_image4: req.body.image4,
      product_name: req.body.productName,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      description: req.body.description,
      category_name: found.category_name,
      category_id: found._id,
    });
    await newProduct.save();
    res.redirect('/admin/Products');
  } else {
    const error = new Error('Category specified does not exist!');
    error.status = 400;
    next(error);
  }
};

const viewEditProducts = async (req, res) => {
  await Product.findById(req.query.id).then((result) => {
    res.render('admin/editProducts', { result });
  });
};

const updateImages = async (req, res) => {
  const productId = req.query.id;
  console.log(productId);
  const { imageNumber } = req.body;
  console.log(imageNumber);
  const newImage = req.body.image;
  console.log(newImage);
  const updateObject = {};
  updateObject[`product_image${imageNumber}`] = newImage;
  await Product.findByIdAndUpdate(productId, updateObject);
  res.redirect('/admin/Products');
};

module.exports = {
  dashBoard,
  allCustomers,
  changeAccess,
  displayCategory,
  viewAddCategory,
  displayProducts,
  viewAddProducts,
  viewEditProducts,
  addCategory,
  viewEditCategory,
  editCategory,
  addProducts,
  updateImages,
};
