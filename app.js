#!/usr/bin/env node

'use strict';

/* jslint node: true */


var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var mongoose = require('mongoose');

var options = {
  server: {
    socketOptions: {
      socketTimeoutMS: 10000
    }
  }
};

var db = mongoose.connect('mongodb://127.0.0.1:27017/mqtt', options).connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('timeout', function () {
  console.log('Timeout');
  process.exit(0);
});

var app = express();
var router = express.Router();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', process.env.PORT || 3006);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);
// error handlers

// development error handler
// will print stacktrace
app.use(router);
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

require('./routes')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


db.once('open', function () {
  console.log('mongo now connected');
  http.createServer(app)
    .on('error', function (err) {
      util.log(err);
      process.exit(1);
    })
    .listen(app.get('port'), function () {
      util.log("IOT App is listening on port: " + app.get('port'));
    });
});
module.exports = app;