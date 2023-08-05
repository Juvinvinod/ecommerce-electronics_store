const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const middleware = require('../middleware/authentication');
const validator = require('../handlers/validators');

const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// homepage
router.get('/', catchErrors(userController.homePage)); // display homepage
router.get('/search', catchErrors(userController.viewCategories)); // search products

// signup
router.get('/signup', catchErrors(userController.signupForm)); // display signup page
router.post(
  '/signup',
  userController.validateRegister,
  catchErrors(userController.signup)
); // add new user to database

// email
router.get('/verifyEmail', catchErrors(authController.verifyEmail)); // display verifyEmail page
router.get(
  '/verifyEmailSuccess/:name',
  catchErrors(authController.emailVerifySuccess)
); // verify email and display success page

// otp
router.get('/otp', middleware.otpSessionCheck, authController.otpVerifyPage); // check if the user is already logged in.If not then render the otp page
router.post('/otp/login', catchErrors(authController.otpVerify)); // check if the otp entered by user is correct

// login/logout
router.get(
  '/login',
  middleware.isLoggedIn,
  catchErrors(userController.homePage)
); // display loginPage if user not logged in
router.post('/login', authController.login); // check if the user entered the correct credentials
router.get('/logout', authController.logout); // logout the current user

// forgot password
router.get('/forgotPassword', catchErrors(authController.viewForgotPass)); // view forgot password page
router.post('/forgotPassword', catchErrors(authController.forgotPass)); // check the entered email address
router.post('/otp/reset', authController.resetOtpVerify); // check the otp entered by user
router.get('/changePassword', catchErrors(authController.viewChangePass)); // view change password page
router.post(
  '/changePassword',
  authController.validateResetPass,
  catchErrors(authController.changePassword)
); // reset the password of user

// product
router.get('/productDetails/:id', catchErrors(userController.productDetails)); // show product detail

// product categories
router.get('/categories', catchErrors(userController.viewCategories)); // display category page

// filter products by radio button
router.get('/getProducts', catchErrors(userController.getRadioProducts)); // filter products based on the selected radio button

// user profile
router.get(
  '/userProfile',
  middleware.isLoggedIn,
  catchErrors(userController.viewUserProfile)
); // view user profile page of user
router.get(
  '/editProfile',
  middleware.isLoggedIn,
  catchErrors(userController.viewEditProfile)
); // view edit username page
router.post(
  '/editProfile',
  middleware.isLoggedIn,
  catchErrors(userController.updateName)
); // change existing user name

// change user password
router.get(
  '/updatePassword',
  middleware.isLoggedIn,
  catchErrors(userController.displayPasswordChange)
); // display change password page
router.post(
  '/updatePassword',
  middleware.isLoggedIn,
  userController.validateUpdatePass,
  catchErrors(userController.updatePassword)
); // update the user password

// address page
router.get(
  '/addAddress',
  middleware.isLoggedIn,
  catchErrors(userController.viewAddressPage)
); // show  add address page
router.post(
  '/addAddress',
  middleware.isLoggedIn,
  validator.validateAddress,
  catchErrors(userController.addAddress)
); // add entered address to user
router.get(
  '/editAddress',
  middleware.isLoggedIn,
  catchErrors(userController.viewEditAddress)
); // display edit address page
router.post(
  '/editAddress',
  middleware.isLoggedIn,
  catchErrors(userController.updateAddress)
); // update user address
router.get(
  '/editAddress/:id',
  middleware.isLoggedIn,
  catchErrors(userController.deleteAddress)
); // delete user address

// cart
router.post(
  '/addToCart',
  middleware.isLoggedIn,
  catchErrors(userController.addToCart)
); // add product to user cart
router.get('/cart', catchErrors(userController.displayCart)); // display user cart
router.put(
  '/cartDelete/:id',
  middleware.isLoggedIn,
  catchErrors(userController.deleteCartItem)
); // delete the card in cart and update data
router.put(
  '/productDec',
  middleware.isLoggedIn,
  catchErrors(userController.decQuantity)
); // decrease the number of products in cart
router.put(
  '/productInc',
  middleware.isLoggedIn,
  catchErrors(userController.incQuantity)
); // increase the number of products in cart

router.get(
  '/quantityCheck',
  middleware.isLoggedIn,
  catchErrors(userController.checkQuantity)
); // check if the product selected has enough stocks

// checkout
router.get(
  '/checkout',
  middleware.isLoggedIn,
  catchErrors(userController.viewCheckout)
); // show checkout page
router.post(
  '/checkout',
  middleware.isLoggedIn,
  catchErrors(userController.checkout)
); // place order
router.put(
  '/verifyOnlinePayment',
  catchErrors(userController.verifyOnlinePayment)
);

// orders
router.get(
  '/orders',
  middleware.isLoggedIn,
  catchErrors(userController.viewOrders)
); // view all orders placed by user
router.get(
  '/order/:id',
  middleware.isLoggedIn,
  catchErrors(userController.getOrderedProduct)
); // display individual order
router.put(
  '/cancelOrder/:id',
  middleware.isLoggedIn,
  catchErrors(userController.cancelOrder)
); // change status of order to cancelled
router.put(
  '/returnOrder/:id',
  middleware.isLoggedIn,
  catchErrors(userController.returnOrder)
); // change status of order to delivered

// wishlist
router.get(
  '/wishlist',
  middleware.isLoggedIn,
  catchErrors(userController.viewWishList)
); // display wishlist page
router.get('/addToWishlist/:id', catchErrors(userController.addToWishlist)); // add products to wishlist
router.delete(
  '/removeFromWishlist/:id',
  catchErrors(userController.removeFromWishlist)
); // delete products from wishlist

// coupon
router.post('/applyCoupon', catchErrors(userController.applyCoupon)); // apply coupon at checkout
router.delete('/deleteCoupon', catchErrors(userController.deleteCoupon)); // delete coupon which is added at checkout
router.get(
  '/coupons',
  middleware.isLoggedIn,
  catchErrors(userController.viewCoupons)
); // list all coupons available to user

module.exports = router;
