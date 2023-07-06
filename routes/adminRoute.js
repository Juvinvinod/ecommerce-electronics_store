const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const { catchErrors } = require('../handlers/errorHandlers');

const router = express.Router();

// GET requests
router.get('/', adminController.dashBoard);
router.get('/customers', adminController.allCustomers);
router.get('/category', adminController.displayCategory);
router.get('/addCategory', adminController.viewAddCategory);
router.get('/products', adminController.displayProducts);
router.get('/addProducts', adminController.addProducts);
router.get('/editProducts', adminController.editProducts);

// POST requests
router.post('/customers', catchErrors(adminController.changeAccess));
router.post('/addCategory', adminController.addCategory);

module.exports = router;
