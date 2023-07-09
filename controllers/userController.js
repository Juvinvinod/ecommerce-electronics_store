const mongoose = require('mongoose');

const User = mongoose.model('User');
const promisify = require('es6-promisify');
const { body, validationResult } = require('express-validator');
const mail = require('../handlers/mail');

// display home page
const homePage = (req, res) => {
  res.render('home');
};

// display login page
const loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

// display signup page
const signupForm = (req, res) => {
  res.render('signup');
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
    console.log({ error: errors.array() });
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

module.exports = {
  loginForm,
  signupForm,
  signup,
  homePage,
  validateRegister,
};
