const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// homepage
router.get('/', authController.isLoggedIn, userController.homePage); // display homepage

// signup
router.get('/signup', userController.signupForm); // display signup page
router.post('/signup', userController.validateRegister, userController.signup); // add new user to database

// email
router.get('/verifyEmail', authController.verifyEmail); // display verifyEmail page
router.get('/verifyEmailSuccess/:name', authController.emailVerifySuccess); // verify email and display success page

// otp
router.get(
  '/otp',
  authController.otpSessionCheck,
  authController.otpVerifyPage
); // check if the user is already logged in.If not then render the otp page
router.post('/otp/login', authController.otpVerify); // check if the otp entered by user is correct

// login/logout
router.get('/login', authController.isLoggedIn, userController.homePage); // display loginPage if user not logged in
router.post('/login', authController.login); // check if the user entered the correct credentials
router.get('/logout', authController.logout); // logout the current user

// product
router.get(
  '/productDetails/:id',
  authController.isLoggedIn,
  userController.productDetails
);

// forgot password
router.get('/forgotPassword', authController.viewForgotPass); // view forgot password page
router.post('/forgotPassword', authController.forgotPass); // check the entered email address
router.post('/otp/reset', authController.resetOtpVerify); // check the otp entered by user
router.get('/changePassword', authController.viewChangePass);
router.post(
  '/changePassword',
  authController.validateResetPass,
  authController.changePassword
);

// product categories
router.get('/categories/:id', userController.viewCategories);

// user profile
router.get(
  '/userProfile',
  authController.isLoggedIn,
  userController.viewUserProfile
); // view user profile page of user
router.get(
  '/editProfile',
  authController.isLoggedIn,
  userController.viewEditProfile
); // view edit username page
router.post(
  '/editProfile',
  authController.isLoggedIn,
  userController.updateName
); // change existing user name

// change user password
router.get(
  '/updatePassword',
  authController.isLoggedIn,
  userController.displayPasswordChange
); // display change password page
router.post(
  '/updatePassword',
  authController.isLoggedIn,
  userController.validateUpdatePass,
  userController.updatePassword
);

module.exports = router;
