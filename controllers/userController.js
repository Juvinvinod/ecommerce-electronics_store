const mongoose = require('mongoose');

const Product = mongoose.model('Product');
const Category = mongoose.model('Category');
const Address = mongoose.model('Address');
const Cart = mongoose.model('Cart');
const Order = mongoose.model('Order');
const Coupon = mongoose.model('Coupon');

const User = mongoose.model('User');
const promisify = require('es6-promisify');
const { body, validationResult } = require('express-validator');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mail = require('../handlers/mail');
const helpers = require('../helper');

// display home page
const homePage = async (req, res) => {
  const categories = await Category.find({});
  const products = await Product.find({});
  const pictures = await Product.aggregate([
    { $group: { _id: '$category_name', firstDocument: { $first: '$$ROOT' } } },
  ]);
  await Product.find({ status: true })
    .limit(8)
    .then((result) => {
      res.render('home', { result, categories, products, pictures });
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
  const { id } = req.params;
  let wish = false;
  const categories = await Category.find({});
  const document = await Product.find({ _id: id });
  if (req?.user?.wishlist?.includes(id)) {
    wish = true;
  }
  res.render('productDetails', { categories, document, wish });
};

// Display different categories
const viewCategories = async (req, res) => {
  const categories = await Category.find({});
  const filter = 0;
  const key = req.query.key ?? '';
  const { category } = req.query;
  if (!category) {
    const products = await Product.find({
      product_name: new RegExp(key, 'i'),
    });
    res.render('categories', { categories, products, category, filter, key });
  } else {
    const products = await Product.find({ category_id: category });
    res.render('categories', { categories, products, category, filter, key });
  }
};

// change products in category page based on the radio buttons
const getRadioProducts = async (req, res) => {
  const { category } = req.query;
  const filter = parseInt(req.query.filter) ?? '';
  const key = req.query.key ?? '';
  if (!filter && category) {
    const products = await Product.find({
      product_name: new RegExp(key, 'i'),
      category_id: category,
    }).lean();
    return res.send({
      data: 'this is data',
      products,
      filter,
    });
  }
  if (category && filter !== 0) {
    const products = await Product.find({
      product_name: new RegExp(key, 'i'),
      category_id: category,
    })
      .sort({ price: filter })
      .lean();
    return res.send({
      data: 'this is data',
      products,
      filter,
    });
  }
  if (!category && filter) {
    const products = await Product.find({ product_name: new RegExp(key, 'i') })
      .sort({ price: filter })
      .lean();
    return res.send({
      data: 'this is data',
      products,
      filter,
    });
  }
  if (!category && !filter) {
    const products = await Product.find({
      product_name: new RegExp(key, 'i'),
    }).lean();
    return res.send({
      data: 'this is data',
      products,
      filter,
    });
  }
};

// display userprofile page
const viewUserProfile = async (req, res) => {
  const { user } = req;
  const categories = await Category.find({});
  const address = await Address.find({ user_id: user._id });
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
  if (req.user.wishlist) {
    await User.updateOne({ _id: userId }, { $pull: { wishlist: productId } });
  }
  const wishlistSize = req.user.wishlist.length - 1;
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
  res.json({ success: true, wishlistSize });
};

// function to find the total cost of products added in the cart
function totalAmount(products) {
  let totalPrice = 0;
  for (let i = 0; i < products.length; i++) {
    const document = products[i];
    totalPrice += document.product.price * document.quantity;
  }
  return totalPrice;
}

// display all the products added in the cart
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

// delete a product in cart
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

// decrement the quantity of product added in cart
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

// increment the quantity of products added in cart
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

// check whether the product added in cart has enough stock left
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

// display the checkout page
const viewCheckout = async (req, res) => {
  const userId = req.user._id;
  const address = await Address.find({ user_id: userId });
  const carts = await Cart.find({ user: userId }).populate('product');
  const categories = await Category.find({});
  const total = totalAmount(carts);
  res.render('checkOut', { categories, address, total });
};

// create the order based on the type of payment chosen by the user
const checkout = async (req, res) => {
  if (req.body.payment === 'cod') {
    const userId = req.user._id;
    const { couponName } = req.body;
    if (couponName) {
      const couponInfo = await Coupon.findOne({ code: couponName });
      if (!couponInfo) {
        return res.status(400).send({ message: 'Coupon name not valid' });
      }
      couponInfo.users.push(userId);
      await couponInfo.save();
    }
    const cartItems = await Cart.find({ user: userId });
    const productArray = cartItems.map((item) => ({
      product_id: item.product,
      quantity: item.quantity,
    }));
    for (const item of productArray) {
      const id = item.product_id;
      const { quantity } = item;
      await Product.findOneAndUpdate(
        { _id: id },
        { $inc: { stock: -quantity } }
      );
    }
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
    res.status(200).send({
      msg: 'Order placed',
    });
  }

  if (req.body.payment === 'online') {
    try {
      const userId = req.user._id;
      const { address } = req.body;

      // const carts = await Cart.find({ user: userId }).populate('product');
      const amount = req.body.totalAmount;
      const lastOrder = await Order.find().sort({ _id: -1 }).limit(1);
      let orderId = 'EMRT000001';
      if (lastOrder.length > 0) {
        const lastOrderId = lastOrder[0].order_id;
        const orderIdNumber = parseInt(lastOrderId.slice(4));
        orderId = `EMRT${`000000${orderIdNumber + 1}`.slice(-6)}`;
      }
      const razorpayInstance = new Razorpay({
        key_id: 'rzp_test_ceFacoW5d4WL7R',
        key_secret: process.env.RAZORPAY_SECRET,
      });

      const options = await razorpayInstance.orders.create({
        amount: amount * 100,
        currency: 'INR',
        receipt: orderId,
      });
      const userDetails = await User.findOne({ _id: userId });

      res.status(201).json({
        success: true,
        options,
        amount,
        userDetails,
        address,
      });
    } catch (err) {
      console.error(`Error Online Payment:`, err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

// verify whether the online payment was successful
const verifyOnlinePayment = async (req, res) => {
  try {
    const { payment } = req.body;
    const orderDetails = req.body.order;
    let hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    hmac.update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`);
    hmac = hmac.digest('hex');
    if (hmac === req.body.payment.razorpay_signature) {
      const { userId } = req.body;
      const cartItems = await Cart.find({ user: userId });
      const productArray = cartItems.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
      }));
      for (const item of productArray) {
        const id = item.product_id;
        const { quantity } = item;
        await Product.findOneAndUpdate(
          { _id: id },
          { $inc: { stock: -quantity } }
        );
      }
      const newOrder = new Order({
        order_id: orderDetails.receipt,
        user: userId,
        product: productArray,
        address: req.body.address,
        total_amount: orderDetails.amount / 100,
        payment_method: 'Online',
      });
      await newOrder.save();
      await Cart.deleteMany({ user: userId });
      const orderId = orderDetails.receipt;
      res.status(200).send({ orderId });
    }
  } catch (err) {
    console.error(`Error Verify Online Payment:`, err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

// view all the orders placed by the user
const viewOrders = async (req, res) => {
  const userId = req.user._id;
  const categories = await Category.find({});
  const orders = await Order.find({ user: userId })
    .populate({
      path: 'product.product_id',
      model: 'Product',
    })
    .sort({ order_id: -1 });
  console.log(orders);
  res.render('orderHistory', { categories, orders });
};

// display in detail the selected order
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

// cancel the order previously placed
const cancelOrder = async (req, res) => {
  const _id = req.params.id;
  await Order.updateOne(
    { _id },
    {
      $set: {
        status: 'cancelled',
      },
    }
  );
  return res.json({
    msg: 'status changed',
  });
};

// return the ordered product after it has been delivered
const returnOrder = async (req, res) => {
  const _id = req.params.id;
  await Order.updateOne(
    { _id },
    {
      $set: {
        status: 'returnProcessing',
      },
    }
  );
  return res.json({
    msg: 'status changed',
  });
};

// display user wishlist page
const viewWishList = async (req, res) => {
  const wishlist = req?.user?.wishlist ?? [];
  const categories = await Category.find({});
  const products = await Product.find({
    _id: { $in: wishlist },
  }).lean();
  res.render('wishList', { categories, products });
};

// add the product to wishlist
const addToWishlist = async (req, res) => {
  const _id = req.user.id;
  const productId = req.params.id;
  await User.updateOne({ _id }, { $addToSet: { wishlist: productId } });
  res.json({ success: true });
};

// remove the product from wishlist
const removeFromWishlist = async (req, res) => {
  const _id = req.user.id;
  const productId = req.params.id;
  const wishlistSize = req.user.wishlist.length - 1;
  await User.updateOne({ _id }, { $pull: { wishlist: productId } });
  res.json({ success: true, wishlistSize });
};

// apply the coupon to the order in checkout page
const applyCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { couponName } = req.body;
    const carts = await Cart.find({ user: userId }).populate('product');
    const couponInfo = await Coupon.findOne({ code: couponName });
    const newTotalAmount = totalAmount(carts);

    if (!couponName) {
      return res
        .status(400)
        .send({ message: 'Add Coupon Name', newTotalAmount });
    }

    if (!couponInfo) {
      return res
        .status(400)
        .send({ message: 'Coupon name not valid', newTotalAmount });
    }

    const currentDate = new Date();

    if (couponInfo.expiry < currentDate) {
      return res
        .status(400)
        .send({ message: 'Coupon has expired', newTotalAmount });
    }

    if (couponInfo.users.includes(userId)) {
      return res.status(400).send({
        message: 'You have already used this coupon',
        newTotalAmount,
      });
    }

    if (parseInt(req.body.orderTotalAmount) < couponInfo.minAmount) {
      return res.status(400).send({
        message: 'Total is below the minimum required to use this coupon',
        newTotalAmount,
      });
    }

    const discountPercentage = couponInfo.discount / 100;
    let discountAmount = newTotalAmount * discountPercentage;

    if (discountAmount > couponInfo.maxDiscountAmount) {
      discountAmount = couponInfo.maxDiscountAmount;
    }

    const discountTotal = newTotalAmount - discountAmount;

    // couponInfo.users.push(req.body.userId);
    // await couponInfo.save();
    res.status(200).send({
      message: 'Coupon added',
      discountTotal,
      newTotalAmount,
      discountAmount,
    });
  } catch (err) {
    console.error(`Error Render Cart Page : ${err}`);
    res.redirect('/');
  }
};

// delete the coupon that is applied to a order in checkout page
const deleteCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const carts = await Cart.find({ user: userId }).populate('product');
    const newTotalAmount = totalAmount(carts);
    res.status(200).send({ message: 'Coupon Removed', newTotalAmount });
  } catch (err) {
    console.error(`Error Render Cart Page : ${err}`);
    res.redirect('/');
  }
};

// display all the coupons available to the user
const viewCoupons = async (req, res) => {
  const categories = await Category.find({});
  const coupons = await Coupon.find({ un_list: false });
  res.render('couponList', { categories, coupons });
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
  cancelOrder,
  returnOrder,
  getRadioProducts,
  viewWishList,
  addToWishlist,
  removeFromWishlist,
  verifyOnlinePayment,
  applyCoupon,
  deleteCoupon,
  viewCoupons,
};
