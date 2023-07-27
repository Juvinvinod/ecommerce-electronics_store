const mongoose = require('mongoose');

const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');

const fs = require('fs');

// display dashboard
const dashBoard = (req, res) => {
  res.render('admin/adminHome');
};

// display all the customers and search option
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

// block/unblock customers by changing access
const changeAccess = async (req, res) => {
  const access = req.body.access === 'true';
  const { id } = req.query;
  await User.findByIdAndUpdate(id, { $set: { access } });
  res.redirect('/admin/customers');
};

// find all documents and render categories page
const displayCategory = async (req, res) => {
  await Category.find({}).then((result) => {
    res.render('admin/categories', { result });
  });
};

// using the query send,find the document & render editCategory page
const viewEditCategory = async (req, res) => {
  await Category.findById(req.query.id).then((result) => {
    res.render('admin/editCategories', { result });
  });
};

// search for the old category name  document & update it
const editCategory = async (req, res, next) => {
  const oldName = { _id: req.query.id };
  const check = req.body.name;
  const newName = { category_name: req.body.name };
  const existingCategory = await Category.findOne({
    category_name: { $regex: new RegExp(`^${check}$`, 'i') },
  });
  if (!existingCategory) {
    await Category.findOneAndUpdate(oldName, newName);
    req.flash('success', 'Categories updated');
    res.redirect('/admin/Categories');
  } else {
    const error = new Error('Category already exists');
    error.status = 400;
    next(error);
  }
};

// view addCategories page
const viewAddCategory = (req, res) => {
  res.render('admin/addCategories');
};

// check whether the category already exists,if not add it to the database
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

// find all documents and render products page
const displayProducts = async (req, res) => {
  await Product.find({}).then((result) => {
    res.render('admin/products', { result });
  });
};

// view addProducts page
const viewAddProducts = async (req, res) => {
  await Category.find({}).then((result) => {
    res.render('admin/addProducts', { result });
  });
};

// check if the category already exists,if so then add the product to the database
const addProducts = async (req, res, next) => {
  const findCategory = req.body.category;
  console.log(findCategory);
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
    req.flash('success', 'Product added!');
    res.redirect('/admin/Products');
  } else {
    const error = new Error('Category specified does not exist!');
    error.status = 400;
    next(error);
  }
};

// using the query send,find the document and render editProducts page
const viewEditProducts = async (req, res) => {
  await Product.findById(req.query.id).then((result) => {
    res.render('admin/editProducts', { result });
  });
};

// find the product and update image data in it
const updateImages = async (req, res) => {
  const admin = req.user;
  const productId = req.query.id;
  const { imageNumber } = req.body;
  const newImage = req.body.image;
  const updateObject = {};
  updateObject[`product_image${imageNumber}`] = newImage;
  await Product.findByIdAndUpdate(productId, updateObject);
  await Product.findById(req.query.id).then((result) => {
    res.render('admin/editProducts', { result, admin });
  });
};

// check if the category newly entered already exists.if not, find the product and update data
const updateProducts = async (req, res, next) => {
  const { id } = req.query;
  const { imageNumber } = req.query;
  const imageField = `product_image${imageNumber}`;
  const existingImageField = req.query.imageId;

  if (req.query.imageName && req.query.imageId) {
    // Delete the existing image
    await fs.promises.unlink(`./public/uploads/${existingImageField}`);

    // Update the database to remove the image field
    await Product.findByIdAndUpdate(id, {
      $unset: {
        [imageField]: 1,
      },
    });

    return res.redirect('/admin/products');
  }
  const findCategory = req.body.category_name;
  const found = await Category.findOne({
    category_name: { $regex: new RegExp(`^${findCategory}$`, 'i') },
  });
  if (found) {
    await Product.findByIdAndUpdate(id, {
      $set: {
        product_name: req.body.product_name,
        price: req.body.price,
        stock: req.body.stock,
        description: req.body.description,
        category_name: req.body.category_name,
      },
    });
    res.redirect('/admin/products');
  } else {
    const error = new Error('Category specified does not exist!');
    error.status = 400;
    next(error);
  }
};

// Block/unblock products by changing access
const changeStatus = async (req, res) => {
  const status = req.body.status === 'true';
  const { id } = req.query;
  await Product.findByIdAndUpdate(id, { $set: { status } });
  res.redirect('/admin/products');
};

// list all the orders placed by customers
const listOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate({
      path: 'product.product_id',
      model: 'Product',
    })
    .populate({
      path: 'address',
      model: 'Address',
      populate: {
        path: 'user_id',
        model: 'User',
      },
    });
  res.render('admin/orders', { orders });
};

const orderDetails = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id })
    .populate({
      path: 'product.product_id',
      model: 'Product',
    })
    .populate({
      path: 'address',
      model: 'Address',
      populate: {
        path: 'user_id',
        model: 'User',
      },
    });
  res.render('admin/orderDetails', { order });
};

const editOrder = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  console.log(status);
  console.log(id);
  if (!status) {
    req.flash('message', 'Status not selected');
    return res.redirect('/admin/orders');
  }
  if (status === 'returned') {
    await Order.updateOne(
      { _id: id },
      {
        $set: {
          status,
        },
      }
    );
    req.flash('message', 'Status changed to returned');
    return res.redirect('/admin/orders');
  }
  if (status === 'outForDelivery') {
    await Order.updateOne(
      { _id: id },
      {
        $set: {
          status,
        },
      }
    );
    req.flash('message', 'Status changed to out for delivery');
    return res.redirect('/admin/orders');
  }
  if (status === 'returnProcessing') {
    await Order.updateOne(
      { _id: id },
      {
        $set: {
          status,
        },
      }
    );
    req.flash('message', 'Status changed to return Processing');
    return res.redirect('/admin/orders');
  }
  if (status === 'delivered') {
    await Order.updateOne(
      { _id: id },
      {
        $set: {
          status,
        },
      }
    );
    req.flash('message', 'Status changed to delivered');
    return res.redirect('/admin/orders');
  }
  await Order.updateOne(
    { _id: id },
    {
      $set: {
        status,
      },
    }
  );
  req.flash('message', 'Status changed to pending');
  return res.redirect('/admin/orders');
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
  updateProducts,
  changeStatus,
  listOrders,
  orderDetails,
  editOrder,
};
