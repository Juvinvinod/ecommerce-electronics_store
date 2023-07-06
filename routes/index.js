const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// GET REQUESTS
router.get('/', authController.isLoggedIn, userController.homePage);
router.get('/login', authController.isLoggedIn, userController.homePage);
router.get('/signup', userController.signupForm);
router.get('/logout', authController.logout);
router.get(
  '/otp',
  authController.otpSessionCheck,
  authController.otpVerifyPage
);
router.get('/verifyEmail', authController.verifyEmail);
router.get('/verifyEmailSuccess/:name', authController.emailVerifySuccess);

// POST REQUESTS
router.post('/signup', userController.validateRegister, userController.signup);
router.post('/login', authController.login);
router.post('/otp', authController.otpVerify);

module.exports = router;
