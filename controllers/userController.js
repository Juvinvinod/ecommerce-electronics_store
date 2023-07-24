const mongoose = require('mongoose');

const Product = mongoose.model('Product');
const Category = mongoose.model('Category');
const Address = mongoose.model('Address');
const Cart = mongoose.model('Cart');
const Order = mongoose.model('Order');

const User = mongoose.model('User');
const promisify = require('es6-promisify');
const { body, validationResult } = require('express-validator');
const mail = require('../handlers/mail');
const helpers = require('../helper');

// display home page
const homePage = async (req, res) => {
  const categories = await Category.find({});
  const products = await Product.find({});
  await Product.find({ status: true })
    .limit(8)
    .then((result) => {
      res.render('home', { result, categories, products });
    });
};

// display login page
const loginForm = async (req, res) => {
  const categories = await Category.find({});
  console.log(categories);
  res.render('login', { categories });
};

// display signup page
const signupForm = async (req, res) => {
  const categories = await Category.find({});
  res.render('signup', { categories });
};

// form validation for sign up page,works as a middleware
const validateRegister = [
  body('name', 'You must supply a name!').notEmpty().escape(),
  body('email', 'That Email is not valid!')
    .notEmpty()
    .isEmail()
    .escape()
    .normalizeEmail({
      gmail_remove_dots: false,
      remove_extension: false,
      gmail_remove_subaddress: false,
    })
    .custom(async (value) => {
      const user = await User.findByUsername(value);
      if (user) {
        throw new Error('E-mail already in use');
      }
    }),
  body('number', 'Phone Number incorrect!')
    .notEmpty()
    .escape()
    .isLength({ min: 7, max: 10 }),
  body('password', 'Password Cannot be Blank!').notEmpty().escape(),
  body('password-confirm', 'Confirmed Password cannot be blank!')
    .notEmpty()
    .escape(),
  body('password-confirm', 'Oops! Your passwords do not match').custom(
    (value, { req }) => value === req.body.password
  ),
  // there were no errors!
];

// display errors from sign up page form validation,if no errors then add the new user to the database
const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array());
    return res.redirect('signup');
  }
  const user = new User({
    email: req.body.email,
    name: req.body.name,
    number: req.body.number,
  });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  await mail.verifyEmail(user);
  res.redirect('verifyEmail');
};

// detailed view of a product
const productDetails = async (req, res) => {
  const categories = await Category.find({});
  const document = await Product.find({ _id: req.params.id });
  res.render('productDetails', { categories, document });
};

// Display different categories
const viewCategories = async (req, res) => {
  const products = await Product.find({ category_id: req.params.id });
  const categories = await Category.find({});
  res.render('categories', { categories, products });
};

// display userprofile page
const viewUserProfile = async (req, res) => {
  const { user } = req;
  const categories = await Category.find({});
  const address = await Address.find({});
  res.render('userProfile', { categories, user, address });
};

// display editProfile page
const viewEditProfile = async (req, res) => {
  const { user } = req;
  const categories = await Category.find({});
  res.render('editProfile', { categories, user });
};

// update the existing username with data provided
const updateName = async (req, res) => {
  const { id } = req.query;
  const newName = req.body.name;
  await User.findByIdAndUpdate(id, { name: newName });
  res.redirect('/userprofile');
};

// display change password page
const displayPasswordChange = async (req, res) => {
  const validationHelper = helpers.validationChecker;
  const { user } = req;
  const categories = await Category.find({});
  res.render('changePassword', { categories, user, validationHelper });
};

// validation checks for form in changePassword page
const validateUpdatePass = [
  body('password', 'Password Cannot be Blank!').notEmpty().escape(),
  body('newPassword', 'New Password cannot be blank!').notEmpty().escape(),
  body('passwordConfirm', 'Confirmed Password cannot be blank!')
    .notEmpty()
    .escape(),
];

// if validation errors,display it. else,update existing password with new one
const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('errorObject', errors.array());
    return res.redirect('/updatePassword');
  }
  const oldPass = req.body.password;
  const newPass = req.body.newPassword;
  const repeatPass = req.body.passwordConfirm;
  if (newPass !== repeatPass) {
    req.flash('error', 'Entered new Passwords do not match');
    return res.redirect('/updatePassword');
  }
  const document = await User.findOne({ _id: req.query.id });
  try {
    await document.changePassword(oldPass, newPass);
  } catch (error) {
    req.flash('error', 'Entered Password is incorrect');
    return res.redirect('/updatePassword');
  }
  res.redirect('/userProfile');
};

// display add address page
const viewAddressPage = async (req, res) => {
  const { redirect } = req.query;
  const validationHelper = helpers.validationChecker;
  const { user } = req;
  const categories = await Category.find({});
  res.render('addAddress', { categories, user, validationHelper, redirect });
};

// if validation errors,display it. else, add the address to database
const addAddress = async (req, res) => {
  const { redirect } = req.query;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('errorObject', errors.array());
    return res.redirect('/addAddress');
  }
  const newAddress = new Address({
    building_name: req.body.building_name,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    pin_code: req.body.pin_code,
    phone_number: req.body.phone_number,
    user_id: req.user.id,
  });
  await newAddress.save();
  res.redirect(`/${redirect}`);
};

// display edit address page
const viewEditAddress = async (req, res) => {
  const address = await Address.findOne({ _id: req.query.id });
  const categories = await Category.find({});
  res.render('editAddress', { categories, address });
};

// update existing address with new data
const updateAddress = async (req, res) => {
  await Address.findByIdAndUpdate(req.query.id, {
    building_name: req.body.building_name,
    street: req.body.street,
    city: req.body.city,
    state: req.body.state,
    pin_code: req.body.pin_code,
    phone_number: req.body.phone_number,
  });
  res.redirect('/userProfile');
};

// delete the address document in database
const deleteAddress = async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);
  res.redirect('/userProfile');
};

// add products to cart
const addToCart = async (req, res) => {
  const userId = req.user.id;
  const productId = req.body.id;
  const existingProduct = await Cart.findOne({
    user: userId,
    product: productId,
  });
  if (existingProduct) {
    await Cart.findOneAndUpdate(
      { user: userId, product: productId },
      { $inc: { quantity: 1 } }
    );
  } else {
    const newCart = new Cart({
      user: userId,
      product: productId,
    });
    await newCart.save();
  }
  return res.json({
    msg: 'Added to cart',
  });
};

function totalAmount(products) {
  let totalPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const document = products[i];
    totalPrice += document.product.price * document.quantity;
  }
  return totalPrice;
}

const displayCart = async (req, res) => {
  if (req.user) {
    const categories = await Category.find({});
    const carts = await Cart.find({ user: req.user._id }).populate('product');
    const count = await Cart.find({ user: req.user._id }).count();
    const total = totalAmount(carts);
    res.render('cart', { categories, carts, count, total });
  } else {
    req.flash('error', 'Please login to purchase products');
    res.redirect('/login');
  }
};

const deleteCartItem = async (req, res) => {
  const cartId = req.params.id;
  const product = await Cart.findOne({ _id: cartId }).populate('product');
  await Cart.findByIdAndDelete(cartId);
  const carts = await Cart.find({ user: req.user._id }).populate('product');
  const count = await Cart.find({ user: req.user._id }).count();
  const total = totalAmount(carts);
  res.send({
    data: 'this is data',
    count,
    total,
    product,
  });
};

const decQuantity = async (req, res) => {
  const { cartId } = req.query;
  let quantityZero = false;
  await Cart.findOneAndUpdate({ _id: cartId }, { $inc: { quantity: -1 } });
  const carts = await Cart.find({ user: req.user._id }).populate('product');
  const total = totalAmount(carts);
  const product = await Cart.findOne({ _id: cartId }).populate('product');
  if (product.quantity <= 0) {
    await Cart.deleteOne({ _id: cartId });
    quantityZero = true;
  }
  const count = await Cart.find({ user: req.user._id }).count();
  const newPrice = parseInt(product.product.price * product.quantity);
  res.send({
    data: 'this is data',
    quantityZero,
    carts,
    count,
    total,
    newPrice,
    product,
  });
};

const incQuantity = async (req, res) => {
  const userId = req.user._id;
  const { cartId } = req.query;
  await Cart.findOneAndUpdate({ _id: cartId }, { $inc: { quantity: 1 } });
  const carts = await Cart.find({ user: userId }).populate('product');
  const count = await Cart.find({ user: userId }).count();
  const total = totalAmount(carts);
  const product = await Cart.findOne({ _id: cartId }).populate('product');

  const newPrice = parseInt(product.product.price * product.quantity);
  res.send({
    data: 'this is data',
    carts,
    count,
    total,
    newPrice,
    product,
  });
};

const checkQuantity = async (req, res) => {
  const carts = await Cart.find({ user: req.user._id }).populate('product');
  let insufficientStock = false;
  carts.forEach((document) => {
    if (document.quantity > document.product.stock) {
      insufficientStock = true;
    }
  });
  // if (insufficientStock) {
  //   req.flash('message', 'Product with no stock selected');
  //   return res.redirect('/cart');
  // }
  // res.redirect('/checkOut');
  res.send({ data: 'this is data', insufficientStock });
};

const viewCheckout = async (req, res) => {
  const userId = req.user._id;
  const address = await Address.find({ user_id: userId });
  const carts = await Cart.find({ user: userId }).populate('product');
  const categories = await Category.find({});
  const total = totalAmount(carts);
  res.render('checkOut', { categories, address, total });
};

const checkout = async (req, res) => {
  if (req.body.payment === 'cod') {
    const userId = req.user._id;
    const cartItems = await Cart.find({ user: userId });
    const productArray = cartItems.map((item) => ({
      product_id: item.product,
      quantity: item.quantity,
    }));
    const lastOrder = await Order.find().sort({ _id: -1 }).limit(1);
    let orderId = 'EMRT000001';
    if (lastOrder.length > 0) {
      const lastOrderId = lastOrder[0].order_id;
      const orderIdNumber = parseInt(lastOrderId.slice(4));
      orderId = `EMRT${`000000${orderIdNumber + 1}`.slice(-6)}`;
    }
    const newOrder = new Order({
      order_id: orderId,
      user: userId,
      product: productArray,
      address: req.body.address,
      total_amount: req.body.totalAmount,
      payment_method: 'COD',
    });
    await newOrder.save();
    await Cart.deleteMany({ user: userId });
  }
  return res.json({
    msg: 'Order placed',
  });
};

const viewOrders = async (req, res) => {
  const userId = req.user._id;
  const categories = await Category.find({});
  const orders = await Order.find({ user: userId })
    .populate({
      path: 'product.product_id',
      model: 'Product',
    })
    .sort({ orderTime: -1 });
  res.render('orderHistory', { categories, orders });
};

const getOrderedProduct = async (req, res) => {
  const categories = await Category.find({});
  const userId = req.user._id;
  const orderId = req.params.id;
  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate({
      path: 'product.product_id',
      model: 'Product',
    })
    .populate({
      path: 'address',
      model: 'Address',
    });
  res.render('orderedProduct', { categories, order });
};

module.exports = {
  loginForm,
  signupForm,
  signup,
  homePage,
  validateRegister,
  productDetails,
  viewCategories,
  viewUserProfile,
  viewEditProfile,
  updateName,
  displayPasswordChange,
  updatePassword,
  validateUpdatePass,
  viewAddressPage,
  addAddress,
  viewEditAddress,
  updateAddress,
  deleteAddress,
  addToCart,
  displayCart,
  deleteCartItem,
  decQuantity,
  incQuantity,
  viewCheckout,
  checkQuantity,
  checkout,
  viewOrders,
  getOrderedProduct,
};
