var express = require('express');
var db = require('../utils/db.js');
var auth = require('../utils/auth.js');
var passport = require('passport');
var router = express.Router();

/**
 * Returns the message data to be sent in the response
 *
 * @param {Object} req - request data from client
 */
function buildMessage(req) {
  return {
    title: 'Title',
    user: req.user,
    error: req.flash('error'),
    warning: req.flash('warning'),
    info: req.flash('info'),
    success: req.flash('success'),
  }
}

function buildStoriesMessage(req) {
  return {
    title: 'Title',
    style: 'stylesheets/style_stories.css',
    user: req.user,
    error: req.flash('error'),
    warning: req.flash('warning'),
    info: req.flash('info'),
    success: req.flash('success'),
    stories: [
      {
        title: "title1",
        description: "hello world!"
      },
      {
        title: "title2",
        description: "ENG 100D"
      },
      {
        title: "title3",
        description: "Coding"
      },
      {
        title: "title4",
        description: "UC San Diego"
      },
      {
        title: "title5",
        description: "Bootstrap"
      },
      {
        title: "title6",
        description: "I can't wait for summer."
      }
    ]
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

/* GET stories page */
router.get('/stories', function(req, res, next) {
  res.render('stories', buildStoriesMessage(req));
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
  if (req.body.username && req.body.password && req.body.password_confirm) {

    // Ensure password and confirmation password match
    if (req.body.password != req.body.password_confirm) {
      req.flash('error', 'Passwords provided do not match');
      return res.redirect('/register');
    }

    // Register a new candidate
    return auth.registerCandidate(req.body.username, req.body.password)
      .then(() => {
        req.flash('success', "Account successfully registered");
        return res.redirect('/login');
      }).catch((err) => {
        if (err instanceof auth.AuthenticationError) {
          req.flash('error', err.message);
        } else {
          console.error(err)
          req.flash('error', "An internal server error has occured"); // hide server error
        }
        return res.redirect('/register');
      });

  } else {
    req.flash('error', "Please include all input.");
    return res.redirect('/register');
  }
});

module.exports = router;
