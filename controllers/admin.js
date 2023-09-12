const {
  validationResult
} = require('express-validator');
const Product = require('../models/product');

const fileHilper = require('../util/file');


exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    isAuthenticated: req.session.isLoggedIn,
    errorMessage: []
  });
};

exports.postAddProduct = (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      isAuthenticated: req.session.isLoggedIn,
      product: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
      },
      errorMessage: errors.array()[0].msg,
    });
  }

  if (!req.file) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      isAuthenticated: req.session.isLoggedIn,
      product: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description
      },
      errorMessage: "Please upload an image",
    });
  }

  let image = req.file;
  let imageUrl = image.path;
  console.log(image);

  let productObj = {
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    imageUrl: imageUrl,
    userId: req.user._id
  }
  const product = new Product(productObj);
  product.save()
    .then(result => {
      res.redirect('/');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      } else {
        if (product.userId.toString() !== req.user._id.toString()) {
          return res.redirect("/");
        }
        res.render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/edit-product',
          editing: editMode,
          product: product,
          hasError: false,
          isAuthenticated: req.session.isLoggedIn,
          errorMessage: []
        })
      };
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedtitle = req.body.title;
  const updatedprice = req.body.price;
  const updateddescription = req.body.description;
  const updatedimage = req.file
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      isAuthenticated: req.session.isLoggedIn,
      product: {
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        _id: prodId
      },
      errorMessage: errors.array()[0].msg,
    });
  }
  Product.findById(prodId)
    .then(product => {
      console.log(product);
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = updatedtitle;
      product.price = updatedprice;
      product.description = updateddescription;
      if (updatedimage) {
        fileHilper(product.imageUrl);
        product.imageUrl = updatedimage.path;

      }
      return product.save();
    })
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500
      return next(error);
    })
};

exports.getProducts = (req, res, next) => {
  Product.find({
      userId: req.user._id
    })
    // .select('title price imageUrl -_id')
    // .populate('userId', 'name')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return next(new Error("Wrong id for deleteing product"))
      }

      fileHilper(product.imageUrl);
      return Product.deleteOne({
        _id: prodId,
        userId: req.user._id
      })
    })
    .then(result => {
      console.log("Deleted");
      res.status(200).json({message:"Deletion Successed"})
    })
    .catch(err => {
      res.status(500).json({message:"Deletion Failed"})
    })
};