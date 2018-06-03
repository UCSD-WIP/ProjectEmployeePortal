var createError = require('http-errors');
var express = require('express');
var passport = require('passport');
var path = require('path');
var cookieParser = require('cookie-parser');
var hbs = require('hbs');
var fs = require('fs');
var flash = require('connect-flash');
var session = require('express-session');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// Database setup
var db = require('./utils/db.js');


/* Handlebars View Engine Configuration */
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register partials
hbs.registerPartial("alerts", fs.readFileSync("views/alerts.hbs", 'utf8'));
hbs.registerPartial("navbar", fs.readFileSync("views/navbar.hbs", 'utf8'));

// Register helpers
hbs.registerHelper('if_equals', function(arg1, arg2, options) {
  return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

/* Express Configuration */
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret: "sshh secret"}));
app.use(passport.initialize())
app.use(passport.session());
app.use(flash());

app.use('/', indexRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
