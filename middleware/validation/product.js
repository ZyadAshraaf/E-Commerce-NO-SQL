const {
    check,
    body
} = require("express-validator");

let title = body('title', "Please enter valid product title with min 3 charcters and 20 max")
    .isString()
    .isLength({
        min: 3,
        max: 20
    }).trim();

let description = body('description', "Please enter valid product description with min 5 charcters and 100 max")
    .isString()
    .isLength({
        min: 5,
        max: 100
    }).trim();

let price = body('price', 'Please enter valid price').isFloat();

module.exports = [title, price, description]