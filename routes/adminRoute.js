const express = require('express');
const adminController = require('../controllers/adminController');
const middleware = require('../middleware/authentication');
const imageOptions = require('../handlers/multer.js');

const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// dashboard
router.get('/', catchErrors(adminController.dashBoard));

// sales report
router.get(
  '/salesReport',
  middleware.adminChecker,
  adminController.getSalesReport
);

// customers
router.get(
  '/customers',
  middleware.adminChecker,
  catchErrors(adminController.allCustomers)
); // display all customers
router.post('/customers', catchErrors(adminController.changeAccess)); // change access of customers

// categories
router.get(
  '/categories',
  middleware.adminChecker,
  catchErrors(adminController.displayCategory)
); // display all categories
router.get(
  '/addCategories',
  middleware.adminChecker,
  adminController.viewAddCategory
); // display addCategory
router.get(
  '/editCategory',
  middleware.adminChecker,
  catchErrors(adminController.viewEditCategory)
); // display editCategory
router.post('/addCategories', catchErrors(adminController.addCategory)); // add new categories
router.post('/editCategory', catchErrors(adminController.editCategory)); // edit existing categories

// products
router.get(
  '/products',
  middleware.adminChecker,
  catchErrors(adminController.displayProducts)
); // display all products
router.get(
  '/addProducts',
  middleware.adminChecker,
  catchErrors(adminController.viewAddProducts)
); // display add products
router.get(
  '/editProducts',
  middleware.adminChecker,
  catchErrors(adminController.viewEditProducts)
); // display edit products
router.post(
  '/addProducts',
  imageOptions.upload,
  imageOptions.resize,
  catchErrors(adminController.addProducts)
); // add new products
router.post(
  '/changeImage',
  imageOptions.updateUpload,
  catchErrors(imageOptions.updateResize),
  catchErrors(adminController.updateImages)
); // change existing image of a product
router.post('/editProducts', catchErrors(adminController.updateProducts)); // update existing data of a product
router.post('/products', catchErrors(adminController.changeStatus)); // block/unblock products

// orders
router.get(
  '/orders',
  middleware.adminChecker,
  catchErrors(adminController.listOrders)
); // list all orders made by users
router.get(
  '/editOrder/:id',
  middleware.adminChecker,
  catchErrors(adminController.orderDetails)
); // display the order placed by customers for editing status
router.post(
  '/editOrder/:id',
  middleware.adminChecker,
  adminController.editOrder
); // update the status of placed order
router.get(
  '/orderSummary/:id',
  middleware.adminChecker,
  adminController.orderSummary
);

// coupons
router.get(
  '/coupons',
  middleware.adminChecker,
  catchErrors(adminController.viewCoupons)
); // display all coupons
router.get(
  '/addCoupons',
  middleware.adminChecker,
  adminController.viewAddCoupons
); // display add coupon page
router.post('/addCoupons', catchErrors(adminController.addCoupon)); // add new coupons with the data
router.put('/listCoupons', catchErrors(adminController.listCoupons)); // change status to list-true
router.put('/unListCoupons', catchErrors(adminController.unListCoupons)); // change status to list-false
router.get('/editCoupons/:id', catchErrors(adminController.viewEditCoupons)); // display editCoupon page
router.post('/editCoupons', catchErrors(adminController.editCoupons)); // update the coupons with submitted data
module.exports = router;
