const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const validator = require('../handlers/validators');

const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// homepage
router.get('/', userController.homePage); // display homepage

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

// forgot password
router.get('/forgotPassword', authController.viewForgotPass); // view forgot password page
router.post('/forgotPassword', authController.forgotPass); // check the entered email address
router.post('/otp/reset', authController.resetOtpVerify); // check the otp entered by user
router.get('/changePassword', authController.viewChangePass); // view change password page
router.post(
  '/changePassword',
  authController.validateResetPass,
  authController.changePassword
); // reset the password of user

// product
router.get('/productDetails/:id', userController.productDetails); // show product detail

// product categories
router.get('/categories', userController.viewCategories);

// filter products by radio button
router.get('/getProducts', catchErrors(userController.getRadioProducts));

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
); // update the user password

// address page
router.get(
  '/addAddress',
  authController.isLoggedIn,
  userController.viewAddressPage
); // show  add address page
router.post(
  '/addAddress',
  authController.isLoggedIn,
  validator.validateAddress,
  catchErrors(userController.addAddress)
); // add entered address to user
router.get(
  '/editAddress',
  authController.isLoggedIn,
  userController.viewEditAddress
); // display edit address page
router.post(
  '/editAddress',
  authController.isLoggedIn,
  userController.updateAddress
); // update user address
router.get(
  '/editAddress/:id',
  authController.isLoggedIn,
  userController.deleteAddress
); // delete user address

// cart
router.post(
  '/addToCart',
  authController.isLoggedIn,
  catchErrors(userController.addToCart)
); // add product to user cart
router.get('/cart', userController.displayCart); // display user cart
router.put(
  '/cartDelete/:id',
  authController.isLoggedIn,
  userController.deleteCartItem
); // delete the card in cart and update data
router.put(
  '/productDec',
  authController.isLoggedIn,
  catchErrors(userController.decQuantity)
); // decrease the number of products in cart
router.put(
  '/productInc',
  authController.isLoggedIn,
  catchErrors(userController.incQuantity)
); // increase the number of products in cart

router.get(
  '/quantityCheck',
  authController.isLoggedIn,
  userController.checkQuantity
); // check if the product selected has enough stocks

// checkout
router.get('/checkout', authController.isLoggedIn, userController.viewCheckout); // show checkout page
router.post(
  '/checkout',
  authController.isLoggedIn,
  catchErrors(userController.checkout)
); // place order

// orders
router.get(
  '/orders',
  authController.isLoggedIn,
  catchErrors(userController.viewOrders)
); // view all orders placed by user
router.get(
  '/order/:id',
  authController.isLoggedIn,
  userController.getOrderedProduct
); // display individual order
router.put(
  '/cancelOrder/:id',
  authController.isLoggedIn,
  userController.cancelOrder
); // change status of order to cancelled
router.put(
  '/returnOrder/:id',
  authController.isLoggedIn,
  userController.returnOrder
); // change status of order to delivered

// wishlist
router.get('/wishlist', authController.isLoggedIn, userController.viewWishList);
router.get('/addToWishlist/:id', userController.addToWishlist);
router.delete('/removeFromWishlist/:id', userController.removeFromWishlist);

module.exports = router;
