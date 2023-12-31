const mongoose = require('mongoose');

const Category = mongoose.model('Category');

// middleware to check for admin
const adminChecker = (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect('/admin/login');
    }
    if (req.user.isAdmin) {
      next();
    }
  } catch (error) {
    error.status = 500;
    error.message = 'Internal server error';
    next(error);
  }
};

// check if the admin is already logged in
const existingAdminChecker = (req, res, next) => {
  if (!req.user) {
    next();
  } else {
    res.redirect('/admin');
  }
};

// check if the user is already logged in
const isLoggedIn = async (req, res, next) => {
  try {
    if (req.isAuthenticated() && req.session.isOTPVerified) {
      next();
      return;
    }
    const categories = await Category.find({});
    res.render('login', { categories });
  } catch (error) {
    error.status = 500;
    error.message = 'Internal server error';
    next(error);
  }
};

// function to prevent going back to otp page after logging in
const otpSessionCheck = (req, res, next) => {
  try {
    if (req.session.isOTPVerified === true) {
      res.redirect('/');
    } else {
      next();
    }
  } catch (error) {
    error.status = 500;
    error.message = 'Internal server error';
    next(error);
  }
};

module.exports = {
  adminChecker,
  isLoggedIn,
  otpSessionCheck,
  existingAdminChecker,
};
