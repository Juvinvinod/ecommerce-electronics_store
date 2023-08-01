const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const imageOptions = require('../handlers/multer.js');

const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// dashboard
router.get('/', adminController.dashBoard);

// customers
router.get(
  '/customers',
  authController.adminChecker,
  adminController.allCustomers
); // display all customers
router.post('/customers', catchErrors(adminController.changeAccess)); // change access of customers

// categories
router.get(
  '/categories',
  authController.adminChecker,
  adminController.displayCategory
); // display all categories
router.get(
  '/addCategories',
  authController.adminChecker,
  adminController.viewAddCategory
); // display addCategory
router.get(
  '/editCategory',
  authController.adminChecker,
  adminController.viewEditCategory
); // display editCategory
router.post('/addCategories', adminController.addCategory); // add new categories
router.post('/editCategory', catchErrors(adminController.editCategory)); // edit existing categories

// products
router.get(
  '/products',
  authController.adminChecker,
  adminController.displayProducts
); // display all products
router.get(
  '/addProducts',
  authController.adminChecker,
  adminController.viewAddProducts
); // display add products
router.get(
  '/editProducts',
  authController.adminChecker,
  adminController.viewEditProducts
); // display edit products
router.post(
  '/addProducts',
  imageOptions.upload,
  imageOptions.resize,
  adminController.addProducts
); // add new products
router.post(
  '/changeImage',
  imageOptions.updateUpload,
  catchErrors(imageOptions.updateResize),
  catchErrors(adminController.updateImages)
); // change existing image of a product
router.post('/editProducts', catchErrors(adminController.updateProducts)); // update existing data of a product
router.post('/products', adminController.changeStatus); // block/unblock products
router.get('/orders', authController.adminChecker, adminController.listOrders); // list all orders made by users
router.get(
  '/editOrder/:id',
  authController.adminChecker,
  adminController.orderDetails
); // list all the orders placed by customers
router.post(
  '/editOrder/:id',
  authController.adminChecker,
  adminController.editOrder
); // update the status of placed order

// coupons
router.get(
  '/coupons',
  authController.adminChecker,
  adminController.viewCoupons
); // display all coupons
router.get(
  '/addCoupons',
  authController.adminChecker,
  adminController.viewAddCoupons
); // display add coupon page
router.post('/addCoupons', catchErrors(adminController.addCoupon)); // add new coupons with the data
router.put('/listCoupons', catchErrors(adminController.listCoupons)); // change status to list-true
router.put('/unListCoupons', catchErrors(adminController.unListCoupons)); // change status to list-false
router.get('/editCoupons/:id', adminController.viewEditCoupons); // display editCoupon page
router.post('/editCoupons', catchErrors(adminController.editCoupons)); // update the coupons with submitted data
module.exports = router;
