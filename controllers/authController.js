const passport = require('passport');
const mongoose = require('mongoose');
const mail = require('../handlers/mail');
const { sendOTP } = require('../handlers/mail');

const User = mongoose.model('User');

const login = (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      // Handle error
      return next(err);
    }
    if (!user) {
      // Handle authentication failure
      req.flash('error', 'Login Failed!');
      return res.redirect('/login');
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
};

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.session.isOTPVerified) {
    next();
    return;
  }
  res.render('login');
};

const otpSessionCheck = (req, res, next) => {
  if (req.session.isOTPVerified === true) {
    res.redirect('/');
  } else {
    next();
  }
};

const logout = function (req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.isOTPVerified = null;
    res.redirect('/');
  });
};

const verifyEmail = (req, res) => {
  res.render('verifyEmail');
};

const emailVerifySuccess = async (req, res) => {
  const userName = req.params.name;
  await User.findOneAndUpdate(
    { name: userName },
    { $set: { isVerified: true } }
  );
  res.render('verifyEmailSuccess');
};

const otpVerifyPage = (req, res) => {
  res.render('otp');
};

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

module.exports = {
  login,
  logout,
  isLoggedIn,
  otpVerifyPage,
  otpVerify,
  verifyEmail,
  emailVerifySuccess,
  otpSessionCheck,
};
