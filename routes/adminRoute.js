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

module.exports = router;
