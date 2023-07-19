const mongoose = require('mongoose');

const Product = mongoose.model('Product');
const Category = mongoose.model('Category');
const Address = mongoose.model('Address');

const User = mongoose.model('User');
const promisify = require('es6-promisify');
const { body, validationResult } = require('express-validator');
const mail = require('../handlers/mail');
const validationHelpers = require('../helper');

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
  console.log(document);
  res.render('productDetails', { categories, document });
};

// Display different categories
const viewCategories = async (req, res) => {
  const products = await Product.find({ category_id: req.params.id });
  const categories = await Category.find({});
  res.render('categories', { categories, products });
};

const viewUserProfile = async (req, res) => {
  const { user } = req;
  const categories = await Category.find({});
  const address = await Address.find({});
  res.render('userProfile', { categories, user, address });
};

const viewEditProfile = async (req, res) => {
  const { user } = req;
  const categories = await Category.find({});
  res.render('editProfile', { categories, user });
};

const updateName = async (req, res) => {
  const { id } = req.query;
  const newName = req.body.name;
  console.log(newName);
  await User.findByIdAndUpdate(id, { name: newName });
  res.redirect('/userprofile');
};

const displayPasswordChange = async (req, res) => {
  const validationHelper = validationHelpers.validationChecker;
  const { user } = req;
  const categories = await Category.find({});
  res.render('changePassword', { categories, user, validationHelper });
};

const validateUpdatePass = [
  body('password', 'Password Cannot be Blank!').notEmpty().escape(),
  body('newPassword', 'New Password cannot be blank!').notEmpty().escape(),
  body('passwordConfirm', 'Confirmed Password cannot be blank!')
    .notEmpty()
    .escape(),
];

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

const viewAddressPage = async (req, res) => {
  const validationHelper = validationHelpers.validationChecker;
  const { user } = req;
  const categories = await Category.find({});
  res.render('addAddress', { categories, user, validationHelper });
};

const addAddress = async (req, res) => {
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
  res.redirect('/userProfile');
};

const viewEditAddress = async (req, res) => {
  const address = await Address.findOne({ _id: req.query.id });
  const categories = await Category.find({});
  res.render('editAddress', { categories, address });
};

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

const deleteAddress = async (req, res) => {
  await Address.findByIdAndDelete(req.params.id);
  res.redirect('/userProfile');
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
};
