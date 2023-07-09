const passport = require('passport');
const mongoose = require('mongoose');
const mail = require('../handlers/mail');
const { sendOTP } = require('../handlers/mail');

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
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated() && req.session.isOTPVerified) {
    next();
    return;
  }
  res.render('login');
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
const otpVerifyPage = (req, res) => {
  res.render('otp');
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
