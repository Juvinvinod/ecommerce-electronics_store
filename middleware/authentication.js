const mongoose = require('mongoose');

const Category = mongoose.model('Category');

// middleware to check for admin
const adminChecker = (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect('/');
    }
    if (req.user.isAdmin) {
      next();
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.log(error);
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
    console.log(error);
  }
};

// function to prevent going back to otp page after logging in
const otpSessionCheck = (req, res, next) => {
  if (req.session.isOTPVerified === true) {
    res.redirect('/');
  } else {
    next();
  }
};

module.exports = {
  adminChecker,
  isLoggedIn,
  otpSessionCheck,
};
