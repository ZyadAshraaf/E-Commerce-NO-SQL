const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

const ITEMS_PER_PAGE = 2;


exports.getProducts = (req, res, next) => {
  let page = +req.query.page || 1;
  let totalProducts;
  Product.find().countDocuments()
    .then(numberOfProducts => {
      totalProducts = numberOfProducts;
      console.log(Math.ceil(totalProducts / ITEMS_PER_PAGE));
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(2)
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        totalProducts: totalProducts,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
  let page = +req.query.page || 1;
  let totalProducts;
  Product.find().countDocuments()
    .then(numberOfProducts => {
      totalProducts = numberOfProducts;
      console.log(Math.ceil(totalProducts / ITEMS_PER_PAGE));
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(2)
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        totalProducts: totalProducts,
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
};

exports.getCart = (req, res, next) => {

  req.user.populate('cart.items.productId')
    .then(user => {
      let products = user.cart.items
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })


};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product)
    })
    .then(result => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.removeFromCart(prodId)
    .then(products => {
      res.redirect("/cart");
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
};

exports.getOrders = (req, res, next) => {
  let filter = {
    'user.userId': req.user._id
  }
  Order.find(filter)
    .then(orders => {
      console.log(orders[1].products);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
};


exports.getCheckout = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items;
      console.log(products);
      if (!products) {
        return next(new Error("your cart is empty"))
      }
      let total = 0
      products.forEach(p=>{
        total = total + p.quantity * p.productId.price
      })
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        isAuthenticated: req.user,
        products: products,
        totalSum : total
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
};

exports.postOrders = (req, res, next) => {
  req.user.populate('cart.items.productId')
    .then(user => {
      let products = user.cart.items.map(i => {
        return {
          quantity: i.quantity,
          product: {
            ...i.productId._doc
          }
        }
      })
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user._id
        },
        products: products
      });

      return order.save()
    })
    .then(() => {
      return req.user.clearCart()
    })
    .then(() => {
      res.redirect("/orders")
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    });
}


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error("No order with that id"));
      }

      if (order.user.userId.toString() === req.user._id.toString()) {
        const invoiceName = "invoice-" + orderId + ".pdf"
        const invoicePath = path.join("data", "invoices", invoiceName)
        // fs.readFile(invoicePath, (err, data) => {
        //   if (err) {
        //     return next(err);
        //   }
        //   res.setHeader("Content-Type", "application/pdf")
        //   res.setHeader("Content-Disposition", "attachmnet; filename='" + invoiceName + "'")
        //   return res.send(data);
        // })

        // const file = fs.createReadStream(invoicePath);
        // res.setHeader("Content-Type", "application/pdf")
        // res.setHeader("Content-Disposition", "attachmnet; filename='" + invoiceName + "'")
        // file.pipe(res);

        let price = 0;
        res.setHeader("Content-Type", "application/pdf")
        res.setHeader("Content-Disposition", "attachmnet; filename='" + invoiceName + "'")
        const pdfDoc = new PDFDocument()
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);
        pdfDoc.fontSize(26).text("Order ID : " + orderId, {
          underline: true
        });
        pdfDoc.fontSize(14).text("Products : ");
        order.products.forEach(element => {
          price = price + (element.product.price * element.quantity);
          pdfDoc.fontSize(14).text(element.product.title + " = " +
            element.product.price + " x " +
            element.quantity + " = $" +
            element.product.price * element.quantity);
        });
        pdfDoc.text("_______________________________________________")
        pdfDoc.fontSize(18).text("Total Order Price = $" + price);
        pdfDoc.end();
      } else {

        return next(new Error("Unauthorized"));
      }
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
}