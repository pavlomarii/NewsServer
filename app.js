// Modules needed.
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const passport = require('passport');
const config = require('./config');

// Import Routers.
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const articleRouter = require('./routes/articleRouter');

// Connecting to MongoDB.
const mongoose = require('mongoose');
const url = config.mongoUrl;
const connect = mongoose.connect(url);
connect.then((db) => {
  console.log('Connected correctly to server')
}, (err) => {
  console.log(err);
});

// Express App.
var app = express();

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Use some generic Express middlewares.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

// Enable Passport for this app.
app.use(passport.initialize());

// Use of Static Files Server from folder /public.
app.use(express.static(path.join(__dirname, 'public')));

// Use of Routers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/articles', articleRouter);

// Catch 404 and forward to Error Handler.
app.use(function (req, res, next) {
  next(createError(404));
});

// Error Handler.
app.use(function (err, req, res, next) {

  // Set locals, only providing error in development.
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the Error Page.
  res.status(err.status || 500);
  res.render('error');
});

// Export this module to bin/www.
module.exports = app;