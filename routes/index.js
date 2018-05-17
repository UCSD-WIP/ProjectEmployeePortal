var express = require('express');
var db = require('../utils/db.js');
var auth = require('../utils/auth.js');
var passport = require('passport');
var router = express.Router();

const buildMessage = function(req) {
  return {
    title: 'Title',
    user: req.user,
    error: req.flash('error'),
    warning: req.flash('warning'),
    info: req.flash('info'),
    success: req.flash('success'),
  }
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', buildMessage(req));
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', buildMessage(req));
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register', buildMessage(req));
});

/* POST login - authenticate user */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  successFlash: true,
  failureFlash: true, 
  session: true
}));

/* POST register - try to register a new user */
router.post('/register', function(req, res, next) {

  // Check if all fields exist
  if(req.body.username && req.body.password && req.body.password_confirm) {

    // Ensure password and confirmation password match
    if(req.body.password != req.body.password_confirm) {
      req.flash('error', 'Passwords provided do not match');
      res.redirect('/register');
      return next();
    }

    // Register a new candidate
    return auth.registerCandidate(req.body.username, req.body.password)
      .then(() => {
        req.flash('success', "Account successfully registered");
        res.redirect('/login');
        return next();
      }).catch((err) => {
        if(err instanceof auth.AuthenticationError) {
          req.flash('error', err.message);
        } else {
          console.error(err)
          req.flash('error', "An internal server error has occured"); // hide server error
        }
        res.redirect('/register');
        return next();
      });      

  } else {
    req.flash('error', "Please include all input.");
    res.redirect('/register');
    return next();
  }
});

module.exports = router;
