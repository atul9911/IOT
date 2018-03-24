#!/usr/bin/env node

'use strict';

/* jslint node: true */

/*var auth = require('./auth');
var users = require('./users');
*/
var homeAuto = require('./homeAuto');

module.exports = function (app) {
	app.get('/', function (req, res) {
		res.render('index', {
			title: 'Express'
		});
	});

	app.post('/device/schedule',homeAuto.schedule);
	app.put('/device/schedule',homeAuto.unschedule);
	app.get('/device/schedule',homeAuto.fetch);


};