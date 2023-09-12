const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const {
  validationResult
} = require('express-validator');

const User = require('../models/user');


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "zyad.ashraaf@gmail.com",
    pass: "mcpoqniuxdgfxvge"
  }
});




exports.getLogin = (req, res, next) => {
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: req.flash('error'),
    oldInput: {
      email: "",
      password: ""
    },
    validationErrors : []
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: req.flash("error"),
    oldInput: {
      email: "",
      password: "", 
      confirmPassword : "",
    },
    validationErrors : []
  });
};

exports.postLogin = (req, res, next) => {
  let email = req.body.email
  let password = req.body.password
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password
      },
      validationErrors : errors.array()
    });

  }
  User.findOne({
      email: email
    })
    .then(user => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save(err => {
              console.log(err);
              return res.redirect("/");
            })
          } else {
            req.flash("error", "Invalid email or password");
            return res.redirect("/login");
          }
        })
        .catch(err => {
          console.log(err)
          res.redirect("/login");

        })
    })
    .catch(err =>{
      const error = new Error(err);
      error.httpStatusCode=500
      return next(error);
    })

};

exports.postSignup = (req, res, next) => {
  let email = req.body.email
  let password = req.body.password
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password, 
        confirmPassword : req.body.confirmPassword
      },
      validationErrors : errors.array()
    });
  }
  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      let user = new User({
        email: email,
        password: hashedPassword,
        cart: {
          items: []
        }
      });
      return user.save();
    })
    .then(result => {
      res.redirect("/login");
      const options = {
        from: "zyad.ashraaf@gmail.com",
        to: email,
        subject: "Welcome on board !",
        text: "Welcome"
      }

      return transporter.sendMail(options, err => {
        console.log(err);
      })
    })
    .catch(err =>{
      const error = new Error(err);
      error.httpStatusCode=500
      return next(error);
    })

};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};


exports.getReset = (req, res, next) => {
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'reset',
    errorMessage: req.flash("error")
  });


}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset")
    }
    const token = buffer.toString('hex');
    User.findOne({
        email: req.body.email
      })
      .then(user => {
        if (!user) {
          req.flash("error", "No account Found with this email please signup");
          return res.redirect("/reset")
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save()
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'zyad.ashraaf@gmail.com',
          subject: 'Password reset',
          html: `
            <p>You requested a password reset</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
          `
        });

      })
      .catch(err =>{
        const error = new Error(err);
        error.httpStatusCode=500
        return next(error);
      })
  })
}


exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
      resetToken: token,
      resetTokenExpiration: {
        $gt: Date.now()
      }
    })
    .then(user => {
      if (user) {
        res.render('auth/new-password', {
          path: '/new-password',
          pageTitle: 'new-password',
          errorMessage: req.flash("error"),
          userId: user._id.toString(),
          passwordToken: token
        });
      }
    })


}


exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: {
        $gt: Date.now()
      }
    })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12)

    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();

    })
    .then(result => {
      res.redirect("/login")
    })
    .catch(err =>{
      const error = new Error(err);
      error.httpStatusCode=500
      return next(error);
    });

}