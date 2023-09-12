const express = require('express');
const {
    checkIfNotLoggedIn
} = require('../middleware/is-auth')
const SignupValidator = require('../middleware/validation/signup')
const LoginValidator = require('../middleware/validation/login')
const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', checkIfNotLoggedIn, authController.getLogin);
router.post('/login', checkIfNotLoggedIn, LoginValidator, authController.postLogin);

router.get('/signup', checkIfNotLoggedIn, authController.getSignup);
router.post('/signup', checkIfNotLoggedIn, SignupValidator, authController.postSignup);

router.get('/reset', checkIfNotLoggedIn, authController.getReset);
router.post('/reset', checkIfNotLoggedIn, authController.postReset);

router.get('/reset', checkIfNotLoggedIn, authController.getReset);
router.post('/reset', checkIfNotLoggedIn, authController.postReset);

router.get('/reset/:token', checkIfNotLoggedIn, authController.getNewPassword);
router.post('/new-password', checkIfNotLoggedIn, authController.postNewPassword);

router.post('/logout', authController.postLogout);
module.exports = router;