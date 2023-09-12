const {body} = require('express-validator');

let email = body("email").isEmail().withMessage("Please enter valid email").normalizeEmail();

module.exports = email;