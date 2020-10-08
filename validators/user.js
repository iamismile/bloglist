const { check } = require('express-validator');

const userCreationValidator = [
  check('username')
    .not()
    .isEmpty()
    .withMessage('username is required')
    .isLength({ min: 3 })
    .withMessage('username must be at least 3 chars long'),
  check('password')
    .not()
    .isEmpty()
    .withMessage('password is required')
    .isLength({ min: 3 })
    .withMessage('password must be at least 3 chars long'),
];

module.exports = {
  userCreationValidator,
};
