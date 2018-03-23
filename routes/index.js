#!/usr/bin/env node

'use strict';

/* jslint node: true */

var auth = require('./auth');
var users = require('./users');

module.exports = function (app) {

	//fetch access token from query or headers or cookie

	app.use(auth.middleware().unless({
		path: ['/user/create', '/user/login']
	}));

	app.get('/', function (req, res) {
		res.render('index', {
			title: 'Express'
		});
	});

	app.post('/user/login', users.login);
	app.put('/user/create', users.create);
	app.all('*', auth.validateToken, auth.validateUser);
	app.get('/user/list', users.list);
	app.post('/user/logout',users.logout);
	app.post('user/changePassword',users.changePassword);
};