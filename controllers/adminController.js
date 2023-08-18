const mongoose = require('mongoose');
const moment = require('moment');

const User = mongoose.model('User');
const Category = mongoose.model('Category');
const Product = mongoose.model('Product');
const Order = mongoose.model('Order');
const Coupon = mongoose.model('Coupon');

const fs = require('fs');

// display login page
const viewAdminLogin = (req, res) => {
  res.render('admin/adminLogin');
};

// display dashboard
const dashBoard = async (req, res) => {
  const orders = await Order.find({});
  const monthlyDataArray = await Order.aggregate([
    { $match: { status: 'delivered' } },
    {
      $group: { _id: { $month: '$orderTime' }, sum: { $sum: '$total_amount' } },
    },
  ]);
  const totalRevenue = await Order.aggregate([
    {
      $group: { _id: null, total: { $sum: '$total_amount' } },
    },
  ]);
  const orderCount = await Order.find({}).count();
  const ordersCompleted = await Order.find({ status: 'delivered' }).count();
  const pendingOrders = await Order.find({ status: 'pending' }).count();
  const ordersOnTheWay = await Order.find({ status: 'outForDelivery' }).count();
  const monthlyDataObject = {};
  monthlyDataArray.map((item) => (monthlyDataObject[item._id] = item.sum));
  const monthlyData = [];
  for (let i = 1; i <= 12; i++) {
    monthlyData[i - 1] = monthlyDataObject[i] ?? 0;
  }
  const payment = await Order.aggregate([
    { $group: { _id: '$payment_method', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  const paymentData = [];
  payment.forEach((item) => {
    paymentData.push(parseFloat(item.count));
  });
  const categoryPrice = await Order.aggregate([
    {
      $unwind: {
        path: '$product',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product.product_id',
        foreignField: '_id',
        as: 'product.products',
      },
    },
    { $unwind: '$product.products' },
    {
      $group: {
        _id: '$product.products.category_name',
        price: { $sum: '$product.products.price' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const category = await Category.aggregate([
    { $group: { _id: '$category_name' } },
    { $sort: { _id: 1 } },
  ]);
  const categoryName = [];
  const totalPrice = [];
  categoryPrice.forEach((item) => {
    totalPrice.push(item.price);
  });
  category.forEach((item) => {
    categoryName.push(item._id);
  });
  res.render('admin/adminHome', {
    orders,
    orderCount,
    ordersCompleted,
    pendingOrders,
    ordersOnTheWay,
    monthlyData,
    totalRevenue,
    paymentData,
    categoryName,
    totalPrice,
  });
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
  const containsSymbolsOrNumbers =
    /[^\w\s]/.test(newName) || /\d/.test(newName);
  if (containsSymbolsOrNumbers) {
    req.flash('error', 'Category name  should not contain symbols or numbers');
    return res.redirect('/admin/Categories');
  }
  const existingCategory = await Category.findOne({
    category_name: { $regex: new RegExp(`^${check}$`, 'i') },
  });
  if (!existingCategory) {
    await Category.findOneAndUpdate(oldName, newName);
    req.flash('success', 'Categories updated');
    res.redirect('/admin/Categories');
  } else {
    req.flash('error', 'Category already exists');
    res.redirect('/admin/Categories');
  }
};

// view addCategories page
const viewAddCategory = (req, res) => {
  res.render('admin/addCategories');
};

// check whether the category already exists,if not add it to the database
const addCategory = async (req, res, next) => {
  const name = req.body.category_name;
  const containsSymbolsOrNumbers = /[^\w\s]/.test(name) || /\d/.test(name);
  if (containsSymbolsOrNumbers) {
    req.flash('error', 'Category name  should not contain symbols or numbers');
    return res.redirect('/admin/Categories');
  }
  const existingCategory = await Category.findOne({
    category_name: { $regex: new RegExp(`^${name}$`, 'i') },
  });
  if (existingCategory) {
    // const error = new Error('Category already exists');
    // error.status = 400;
    // next(error);
    req.flash('error', 'Category already exists');
    res.redirect('/admin/Categories');
  } else {
    await new Category(req.body).save();
    req.flash('success', 'New category added');
    res.redirect('/admin/Categories');
  }
};

// find all documents and render products page
const displayProducts = async (req, res) => {
  let pageNum = parseInt(req.query.page);
  if (!pageNum) {
    pageNum = 1;
  }
  const perPage = 4;
  let docCount;
  const result = await Product.find({})
    .countDocuments()
    .then((documents) => {
      docCount = documents;
      return Product.find({})
        .skip((pageNum - 1) * perPage)
        .limit(perPage);
    });
  const pages = Math.ceil(docCount / perPage);
  res.render('admin/products', { result, docCount, pages, pageNum, perPage });
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
    })
    .sort({ order_id: -1 });
  res.render('admin/orders', { orders });
};

// display all the orders placed by users
const orderDetails = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id }).populate({
    path: 'product.product_id',
    model: 'Product',
  });
  res.render('admin/orderDetails', { order });
};

// change status of orders placed by users
const editOrder = async (req, res) => {
  const userId = req.user._id;
  const { status } = req.body;
  const { id } = req.params;
  if (!status) {
    req.flash('message', 'Status not selected');
    return res.redirect('/admin/orders');
  }
  if (status === 'returned') {
    const order = await Order.findOne({ _id: id });
    if (order.status !== 'returned') {
      const walletInc = order.total_amount;
      if (walletInc !== 0) {
        await User.updateOne({ _id: userId }, { $inc: { wallet: walletInc } });
      }
    } else {
      req.flash('message', 'Product already returned');
      return res.redirect('/admin/orders');
    }
  }
  await Order.updateOne(
    { _id: id },
    {
      $set: {
        status,
      },
    }
  );
  req.flash('message', `Status changed to ${status}`);
  return res.redirect('/admin/orders');
};

// display all the coupons
const viewCoupons = async (req, res) => {
  const coupons = await Coupon.find({});
  res.render('admin/coupons', { coupons });
};

// display add coupon page
const viewAddCoupons = (req, res) => {
  res.render('admin/addCoupons');
};

// create coupon with the data provided
const addCoupon = async (req, res) => {
  const { name } = req.body;
  const { code } = req.body;
  const { minAmount } = req.body;
  const { discount } = req.body;
  const { maxDiscountAmount } = req.body;
  const { expiry } = req.body;
  const exists = await Coupon.find({
    code: { $regex: new RegExp(`^${code}$`, 'i') },
  });
  if (exists.length !== 0) {
    req.flash('error', 'Coupon code already exists');
    return res.redirect('/admin/coupons');
  }
  const coupon = new Coupon({
    name,
    code,
    discount,
    maxDiscountAmount,
    minAmount,
    expiry,
  });
  await coupon.save();
  req.flash('success', 'Coupon added');
  return res.redirect('/admin/coupons');
};

// change the status of coupon to listed
const listCoupons = async (req, res) => {
  const _id = req.body.id;
  await Coupon.updateOne({ _id }, { $set: { un_list: false } });
  res.status(200).send({ message: 'Coupon Removed' });
};

// change the status of coupon to unlisted
const unListCoupons = async (req, res) => {
  const _id = req.body.id;
  await Coupon.updateOne({ _id }, { $set: { un_list: true } });
  res.status(200).send({ message: 'Coupon added' });
};

// view edit coupons page
const viewEditCoupons = async (req, res) => {
  const _id = req.params.id;
  const coupon = await Coupon.find({ _id });
  res.render('admin/editCoupons', { coupon });
};

// update the coupon with the data provided
const editCoupons = async (req, res) => {
  const { name, discount, maxDiscountAmount, minAmount, expiry, code, _id } =
    req.body;

  await Coupon.findByIdAndUpdate(_id, {
    $set: {
      name,
      discount,
      maxDiscountAmount,
      minAmount,
      expiry,
      code,
    },
  });
  req.flash('success', 'Coupon updated');
  res.redirect('/admin/coupons');
};

// display complete details of the order
const orderSummary = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ _id: id })
    .populate({
      path: 'product.product_id',
      model: 'Product',
    })
    .populate({
      path: 'address',
      model: 'Address',
    });
  res.render('admin/orderSummary', { order });
};

// display sales
const getSalesReport = async (req, res) => {
  let startDate = new Date(new Date().setDate(new Date().getDate() - 8));
  let endDate = new Date();
  if (req.query.startDate) {
    startDate = new Date(req.query.startDate);
    startDate.setHours(0, 0, 0, 0);
  }
  if (req.query.endDate) {
    endDate = new Date(req.query.endDate);
    endDate.setHours(24, 0, 0, 0);
  }
  if (req.query.filter === 'thisYear') {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear(), 0, 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(new Date().setDate(new Date().getDate() + 1));
    endDate.setHours(0, 0, 0, 0);
  }
  if (req.query.filter === 'lastYear') {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear() - 1, 0, 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(currentDate.getFullYear() - 1, 11, 31);
    endDate.setHours(0, 0, 0, 0);
  }
  if (req.query.filter === 'thisMonth') {
    const currentDate = new Date();
    startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    endDate.setHours(0, 0, 0, 0);
  }
  if (req.query.filter === 'lastMonth') {
    const currentDate = new Date();
    startDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    endDate.setHours(0, 0, 0, 0);
  }

  const orders = await Order.find({
    orderTime: { $gt: startDate, $lt: endDate },
  })
    .populate({
      path: 'product.product_id',
      model: 'Product',
    })
    .sort({ order_id: -1, orderTime: -1 })
    .lean();

  const orderCount = await Order.find({
    orderTime: { $gt: startDate, $lt: endDate },
  })
    .populate({
      path: 'product.product_id',
      model: 'Product',
    })
    .sort({ order_id: -1, orderTime: -1 })
    .count();
  const totalRevenue = await Order.aggregate([
    {
      $match: {
        status: 'delivered',
        orderTime: {
          $gt: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        sum: { $sum: '$total_amount' },
      },
    },
  ]);
  const totalPending = await Order.aggregate([
    {
      $match: {
        status: 'pending',
        orderTime: {
          $gt: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        sum: { $sum: '$total_amount' },
      },
    },
  ]);
  const ordersDispatched = await Order.aggregate([
    {
      $match: {
        status: 'outForDelivery',
        orderTime: {
          $gt: startDate,
          $lt: endDate,
        },
      },
    },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        sum: { $sum: '$total_amount' },
      },
    },
  ]);
  const byCategory = await Order.aggregate([
    { $match: { orderTime: { $gt: startDate, $lt: endDate } } },
    {
      $unwind: {
        path: '$product',
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product.product_id',
        foreignField: '_id',
        as: 'product.products',
      },
    },
    { $unwind: '$product.products' },
    {
      $group: {
        _id: '$product.products.category_name',
        count: { $sum: 1 },
        price: { $sum: '$product.products.price' },
      },
    },
  ]);
  let filter = req.query.filter ?? '';
  if (!req.query.filter && !req.query.startDate) {
    filter = 'lastWeek';
  }
  res.render('admin/salesReport', {
    orders,
    startDate: moment(
      new Date(startDate).setDate(new Date(startDate).getDate() + 1)
    )
      .utc()
      .format('YYYY-MM-DD'),
    endDate: moment(endDate).utc().format('YYYY-MM-DD'),
    totalRevenue,
    totalPending,
    ordersDispatched,
    byCategory,
    filter,
    orderCount,
  });
};

module.exports = {
  viewAdminLogin,
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
  viewCoupons,
  viewAddCoupons,
  addCoupon,
  listCoupons,
  unListCoupons,
  viewEditCoupons,
  editCoupons,
  orderSummary,
  getSalesReport,
};
