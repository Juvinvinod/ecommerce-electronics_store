const mongoose = require('mongoose');

const User = mongoose.model('User');
const promisify = require('es6-promisify');

const homePage = (req, res) => {
  res.render('home');
};

const loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

const signupForm = (req, res) => {
  res.render('signup', { title: 'Login' });
};

const signup = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  const register = promisify(User.register, User);
  await register(user, req.body.password);
  next();
};

module.exports = {
  loginForm,
  signupForm,
  signup,
  homePage,
};
