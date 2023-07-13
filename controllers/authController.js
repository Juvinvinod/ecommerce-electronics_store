const passport = require('passport');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const mail = require('../handlers/mail');
const { sendOTP } = require('../handlers/mail');

const Category = mongoose.model('Category');

const User = mongoose.model('User');

// find the user document,send otp and render otp page
const login = (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      // Handle error
      return next(err);
    }
    if (!user) {
      // Handle authentication failure
      req.flash('error', 'Email/Password Incorrect!');
      return res.redirect('/login');
    }

    if (!user.access) {
      req.flash('error', 'Access Denied!');
      return res.redirect('/login');
    }

    if (!user.isVerified) {
      req.flash('error', 'Email not verified');
      return res.redirect('/login');
    }

    // check if the user is an admin
    if (user.isAdmin) {
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.redirect('/admin');
      });
      return;
    }

    // Generate and send OTP
    sendOTP(req, res, user.email);

    // Call req.logIn to maintain the session
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      console.log(req.user);

      return res.redirect('/otp');
    });
  })(req, res, next);
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

// function to prevent going back to otp page after logging in
const otpSessionCheck = (req, res, next) => {
  if (req.session.isOTPVerified === true) {
    res.redirect('/');
  } else {
    next();
  }
};

// destroying sessions and logging out
const logout = function (req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.isOTPVerified = null;
    res.redirect('/');
  });
};

// display verify email page
const verifyEmail = (req, res) => {
  res.render('verifyEmail');
};

// mail verification by changing isVerified  to true when user enters the link send to them
const emailVerifySuccess = async (req, res) => {
  const userName = req.params.name;
  await User.findOneAndUpdate(
    { name: userName },
    { $set: { isVerified: true } }
  );
  res.render('verifyEmailSuccess');
};

// display otp page
const otpVerifyPage = async (req, res) => {
  const document = null;
  const categories = await Category.find({});
  res.render('otp', { categories, link: 'login', document });
};

// verify if the otp entered by the user is correct
const otpVerify = async (req, res) => {
  const enteredOTP =
    req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
  const storedOTP = req.signedCookies.otp;
  const { username } = req.signedCookies;
  if (enteredOTP === storedOTP) {
    req.session.isOTPVerified = true;
    res.clearCookie(storedOTP); // Clear the OTP cookie
    res.clearCookie(username);
    res.redirect('/');
  } else {
    req.flash('error', 'Entered otp is incorrect');
    res.redirect('/otp');
  }
};

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

const viewForgotPass = async (req, res) => {
  const id = 'reset';
  const categories = await Category.find({});
  res.render('forgotPassword', { categories, id });
};

const forgotPass = async (req, res) => {
  const { email } = req.body;
  const document = await User.findOne({ email });
  if (document) {
    mail.resetOTP(req, res, document);
    const categories = await Category.find({});
    console.log(document);
    res.render('otp', { categories, link: 'reset', document });
  } else {
    console.log(req.body.email);
    req.flash('error', 'Entered email does not exist');
    res.redirect('/forgotPassword');
  }
};

const resetOtpVerify = async (req, res) => {
  const user = req.query.id;
  console.log(req.signedCookies);
  const enteredOTP =
    req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
  const storedOTP = req.signedCookies.otpReset;
  const username = req.signedCookies.usernameReset;
  // console.log(username);
  // console.log(user);
  // console.log(storedOTP);
  // console.log(enteredOTP);
  if (enteredOTP === storedOTP && username === user) {
    res.clearCookie(storedOTP); // Clear the OTP cookie
    res.clearCookie(username);
    res.redirect('/changePassword');
  } else {
    req.flash('error', 'Entered otp is incorrect');
    res.redirect('/otp');
  }
};

const viewChangePass = async (req, res) => {
  const categories = await Category.find({});
  res.render('passwordReset', { categories });
};

const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log({ error: errors.array() });
    req.flash('errorObject', errors.array());
    return res.redirect('/changePassword');
  }
  const newPass = req.body.password;
  const repeatPass = req.body.passwordConfirm;
  console.log(newPass);
  console.log(repeatPass);
  if (newPass === repeatPass) {
    const username = req.signedCookies.usernameReset;
    const updateUser = await User.findOne({ email: username });
    await updateUser.setPassword(newPass);
    await updateUser.save();
    req.flash('success', 'Password reset Success!!');
    res.redirect('/');
  } else {
    req.flash('error', 'Passwords do not match.Try again!!');
    res.redirect('/changePassword');
  }
};

const validateResetPass = [
  body('password', 'Password Cannot be Blank!').notEmpty().escape(),
  body('passwordConfirm', 'Confirmed Password cannot be blank!')
    .notEmpty()
    .escape(),
];

module.exports = {
  login,
  logout,
  isLoggedIn,
  otpVerifyPage,
  otpVerify,
  verifyEmail,
  emailVerifySuccess,
  otpSessionCheck,
  adminChecker,
  viewForgotPass,
  forgotPass,
  resetOtpVerify,
  viewChangePass,
  changePassword,
  validateResetPass,
};
