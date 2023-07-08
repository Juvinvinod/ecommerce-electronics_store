const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const imageOptions = require('../handlers/multer.js');

const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// GET requests
router.get('/', adminController.dashBoard);
router.get('/customers', adminController.allCustomers);
router.get('/categories', adminController.displayCategory);
router.get('/addCategories', adminController.viewAddCategory);
router.get('/products', adminController.displayProducts);
router.get('/addProducts', adminController.viewAddProducts);
router.get('/editProducts', adminController.viewEditProducts);
router.get('/editCategory', adminController.viewEditCategory);

// POST requests
router.post('/customers', catchErrors(adminController.changeAccess));
router.post('/addCategories', adminController.addCategory);
router.post('/editCategory', catchErrors(adminController.editCategory));
router.post(
  '/addProducts',
  imageOptions.upload,
  imageOptions.resize,
  adminController.addProducts
);
router.post(
  '/changeImage',
  imageOptions.updateUpload,
  imageOptions.updateResize,
  adminController.updateImages
);

module.exports = router;
