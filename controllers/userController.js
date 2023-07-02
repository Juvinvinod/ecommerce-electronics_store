const mongoose = require('mongoose');

const User = mongoose.model('User');
const promisify = require('es6-promisify');
const { body, matchedData, validationResult } = require('express-validator');

const homePage = (req, res) => {
  res.render('home');
};

const loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

const signupForm = (req, res) => {
  res.render('signup');
};

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
  body('password', 'Password Cannot be Blank!').notEmpty().escape(),
  body('password-confirm', 'Confirmed Password cannot be blank!')
    .notEmpty()
    .escape(),
  body('password-confirm', 'Oops! Your passwords do not match').custom(
    (value, { req }) => value === req.body.password
  ),
  // there were no errors!
];

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log({ error: errors.array() });
    req.flash('error', errors.array());
    return res.redirect('signup');
  }
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
  validateRegister,
};
