const mongoose = require('mongoose');

const Category = mongoose.model('Category');

// middleware to check for admin
const adminChecker = (req, res, next) => {
  if (!req.user) {
    return res.redirect('/');
  }
  if (req.user.isAdmin) {
    next();
  } else {
    res.redirect('/');
  }
};

// check if the user is already logged in
const isLoggedIn = async (req, res, next) => {
  if (req.isAuthenticated() && req.session.isOTPVerified) {
    next();
    return;
  }
  const categories = await Category.find({});
  res.render('login', { categories });
};

module.exports = {
  adminChecker,
  isLoggedIn,
};
