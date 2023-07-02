const express = require('express');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

// GET requests
router.get('/', adminController.dashBoard);

module.exports = router;
