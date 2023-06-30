const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// GET REQUESTS
router.get('/', authController.isLoggedIn, userController.homePage);
router.get('/login', userController.loginForm);
router.get('/signup', userController.signupForm);
router.get('/logout', authController.logout);

// POST REQUESTS
router.post('/signup', userController.signup, authController.login);
router.post('/login', authController.login);

module.exports = router;
