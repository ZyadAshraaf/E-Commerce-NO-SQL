const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');

const {
    checkIfLoggedIn
} = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', checkIfLoggedIn, shopController.getCart);

router.post('/cart', checkIfLoggedIn, shopController.postCart);

router.post('/cart-delete-item', checkIfLoggedIn, shopController.postCartDeleteProduct);

router.get('/orders', checkIfLoggedIn, shopController.getOrders);
router.post('/create-order', checkIfLoggedIn, shopController.postOrders);
router.get('/orders/:orderId', checkIfLoggedIn, shopController.getInvoice);

router.get('/checkout', checkIfLoggedIn, shopController.getCheckout);

module.exports = router;