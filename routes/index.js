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
router.post('/otp', authController.otpVerify); // check if the otp entered by user is correct

// login/logout
router.get('/login', authController.isLoggedIn, userController.homePage); // display loginPage if user not logged in
router.post('/login', authController.login); // check if the user entered the correct credentials
router.get('/logout', authController.logout); // logout the current user

// product
router.get(
  '/productDetails',
  authController.isLoggedIn,
  userController.productDetails
);

module.exports = router;
