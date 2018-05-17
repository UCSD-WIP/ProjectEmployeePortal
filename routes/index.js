var express = require('express');
var db = require('../utils/db.js');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Title' });
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register');
});

module.exports = router;
