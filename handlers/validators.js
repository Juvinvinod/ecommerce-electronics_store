const { body } = require('express-validator');

const validateAddress = [
  body('building_name', 'Cannot be Blank!').notEmpty().escape(),
  body('street', 'Cannot be Blank!').notEmpty().escape(),
  body('city', 'Cannot be Blank!').notEmpty().escape(),
  body('state', 'Cannot be blank!').notEmpty().escape(),
  body('pin_code', 'Cannot be blank!').notEmpty().escape(),
  body('phone_number', 'Cannot be blank!').notEmpty().escape(),
];

module.exports = {
  validateAddress,
};
