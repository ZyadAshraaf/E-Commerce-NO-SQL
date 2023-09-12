const {
    check,
    body
} = require('express-validator');

const User = require('../../models/user')

let email =
    check('email')
    .isEmail()
    .withMessage("Validate email")
    .custom((value, {
        req
    }) => {
        return User.find({
                email: value
            })
            .then(userDoc => {
                console.log("length : " + userDoc.length);
                if (userDoc.length > 0) {
                    return Promise.reject("Already used email")
                }
            });
    })
    .normalizeEmail();


let password = body("password", "Please enter a valid message min 5 contains charcters and numbers")
    .trim()
    .isLength({
        min: 5
    }).isAlphanumeric();

let confirmPassword = body("confirmPassword")
    .trim()
    .custom((value, {
        req
    }) => {
        if (value !== req.body.password) {
            throw new Error("Passwords have to match")
        }
        return true;
    })

module.exports = [email, password, confirmPassword]