const passport = require('passport');
const mongoose = require('mongoose');

const User = mongoose.model('User');
const promisify = require('es6-promisify');

const login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!',
});

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.redirect('/login');
};

const logout = function (req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash('success', 'You are now logged out');
    res.redirect('/');
  });
};

module.exports = {
  login,
  logout,
  isLoggedIn,
};
