'use strict';
var mongoose = require('mongoose');

var options = {
  server: {
    socketOptions: {
      socketTimeoutMS: 10000
    },
    useMongoClient: true
  }
};

var db = mongoose.connect('mongodb://127.0.0.1:27017/mqtt', options).connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('timeout', function() {
  console.log('Timeout');
  process.exit(0);
});

var Model = require('../models/scheduleModel');

var runCron = {
	init: function(options, cb) {
		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var currentDay = date.getDay();
		var startTime = date;
		startTime.setHours(0, 0, 0, 0);
		var endTime = date;
		endTime.setHours(23, 59, 59, 999);
		var filter = {
			execution_time: hours + ':' + minutes,
			execution_days : currentDay.toString()
		};

		var query = Model.find(filter);
		query.exec(function(err, res) {
			cb(err || res);
			//Logic will come here
		});


		// body...
	}
};

module.exports = runCron;

(function() {
	runCron.init({}, console.log);
}())