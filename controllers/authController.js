const passport = require('passport');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const mail = require('../handlers/mail');
const { sendOTP } = require('../handlers/mail');
const validationHelpers = require('../helper');

const Category = mongoose.model('Category');

const User = mongoose.model('User');

// find the user document,send otp and render otp page
const login = (req, res, next) => {
  try {
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

        return res.redirect('/otp');
      });
    })(req, res, next);
  } catch (error) {
    error.status = 500;
    error.message = 'Internal server error';
    next(error);
  }
};

// destroying sessions and logging out
const logout = function (req, res, next) {
  try {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      req.session.isOTPVerified = null;
      res.redirect('/');
    });
  } catch (error) {
    error.status = 500;
    error.message = 'Internal server error';
    next(error);
  }
};

// resend otp
const resendOtp = (req, res) => {
  const { user } = req;
  sendOTP(req, res, user.email);
  req.flash('message', 'Otp send..Please check..!!');
  res.redirect('/otp');
};

// display verify email page
const verifyEmail = async (req, res) => {
  const categories = await Category.find({});
  res.render('verifyEmail', { categories });
};

// mail verification by changing isVerified  to true when user enters the link send to them
const emailVerifySuccess = async (req, res) => {
  const userName = req.params.name;
  await User.findOneAndUpdate(
    { name: userName },
    { $set: { isVerified: true } }
  );
  const categories = await Category.find({});
  res.render('verifyEmailSuccess', { categories });
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
  const user = await User.findOne({
    otpToken: enteredOTP,
    tokenExpires: { $gt: Date.now() },
  });
  if (user) {
    req.session.isOTPVerified = true;
    user.otpToken = undefined;
    user.tokenExpires = undefined;
    await user.save();
    res.redirect('/');
  } else {
    req.flash('error', 'Entered otp is incorrect/expired');
    res.redirect('/otp');
  }
};

// display forgot password page
const viewForgotPass = async (req, res) => {
  const id = 'reset';
  const categories = await Category.find({});
  res.render('forgotPassword', { categories, id });
};

// if the email matches send the reset otp number to the entered mail id
const forgotPass = async (req, res) => {
  const { email } = req.body;
  const document = await User.findOne({ email });
  if (document) {
    mail.resetOTP(req, res, document);
    const categories = await Category.find({});

    res.render('otp', { categories, link: 'reset', document });
  } else {
    req.flash('error', 'Entered email does not exist');
    res.redirect('/forgotPassword');
  }
};

// verify if the entered otp is correct
const resetOtpVerify = async (req, res) => {
  const user = req.query.id;
  const enteredOTP =
    req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4;
  const storedOTP = req.signedCookies.otpReset;
  const username = req.signedCookies.usernameReset;

  if (enteredOTP === storedOTP && username === user) {
    res.clearCookie(storedOTP); // Clear the OTP cookie
    res.clearCookie(username);
    res.redirect('/changePassword');
  } else {
    req.flash('error', 'Entered otp is incorrect');
    res.redirect('/otp');
  }
};

// display reset password page
const viewChangePass = async (req, res) => {
  const validationHelper = validationHelpers.validationChecker;
  const categories = await Category.find({});
  res.render('passwordReset', { categories, validationHelper });
};

// do the necessary checks and update the existing password
const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('errorObject', errors.array());
    return res.redirect('/changePassword');
  }
  const newPass = req.body.password;
  const repeatPass = req.body.passwordConfirm;

  if (newPass === repeatPass) {
    const username = req.signedCookies.usernameReset;
    const updateUser = await User.findOne({ email: username });
    await updateUser.setPassword(newPass);
    await updateUser.save();
    res.clearCookie(username);
    req.flash('success', 'Password reset Success!!');
    res.redirect('/');
  } else {
    req.flash('error', 'Passwords do not match.Try again!!');
    res.redirect('/changePassword');
  }
};

// backend validations for fields in reset password
const validateResetPass = [
  body('password', 'Password Cannot be Blank!').notEmpty().escape(),
  body('passwordConfirm', 'Confirmed Password cannot be blank!')
    .notEmpty()
    .escape(),
];

module.exports = {
  login,
  logout,
  otpVerifyPage,
  otpVerify,
  verifyEmail,
  emailVerifySuccess,
  viewForgotPass,
  forgotPass,
  resetOtpVerify,
  viewChangePass,
  changePassword,
  validateResetPass,
  resendOtp,
};
