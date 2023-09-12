const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const productValidtor = require('../middleware/validation/product')

const {
    checkIfLoggedIn
} = require('../middleware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', checkIfLoggedIn, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', checkIfLoggedIn, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', checkIfLoggedIn, productValidtor, adminController.postAddProduct);

router.get('/edit-product/:productId', checkIfLoggedIn, adminController.getEditProduct);

router.post('/edit-product', checkIfLoggedIn, productValidtor,adminController.postEditProduct);

router.delete('/product/:productId', checkIfLoggedIn, adminController.deleteProduct);

module.exports = router;