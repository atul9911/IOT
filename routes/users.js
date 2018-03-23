#!/usr/bin/env node

'use strict';

/* jslint node: true */

var Model = require('../models/user');
var jwt = require('jsonwebtoken');
var redis = require('../lib/redis');

var users = {
	list: function (req, res, next) {
		var user = req.user;
		var err;

		if (!user) {
			err = new Error('Login Required');
			err.status = 401;
			return next(err);
		}

		if (user.role !== 'admin') {
			err = new Error('Unauthorized access');
			err.status = 401;
			return next(err);
		}

		Model.find({}, 'name email role created_at updated_at', function (err, data) {
			if (err)
				next(err);
			else
				return res.json(data);
		});
	},

	create: function (req, res, next) {
		var body = req.body;
		var name = body.name;
		var email = body.email;
		var role = body.role || 'user';
		var password = body.password;

		if (!name || !email || !password)
			return res.json({
				err: 'Mandatory Parameters missing'
			});

		var user = new Model({
			name: name,
			email: email,
			role: role,
			password: password
		});

		user.save(function (err) {
			if (err)
				return next(err);
			res.json({
				success: 'User created succesfully'
			});
		});
	},
	login: function (req, res, next) {
		var body = req.body;
		var email = body.email;
		var password = body.password;

		if (!email || !password) {
			return res.sendStatus(400).json({
				err: 'username/password missing'
			});
		}

		Model.findOne({
			email: body.email
		}, function (err, user) {
			if (err)
				return res.send(err);
			if (!user.comparePassword(body.password)) {
				return res.send(401, {
					err: 'Unauthorized Access'
				});
			}

			var webToken = jwt.sign({
				email: user.email,
				role: user.role
			}, '1a2b3c4d5e', {
				expiresIn: 60
			});

			var data = {
				email: user.email,
				role: user.role,
				webToken: webToken
			};

			redis.createToken(data, function (err) {
				if (err)
					return next(err);
				res.cookie('Auth', webToken, {
					expires: new Date(Date.now() + 3600000),
					httpOnly: true
				});
				res.set('x-access-token', webToken);
				return res.json({
					success: 'succesfully login'
				});
			});
		});
	},

	logout: function (req, res) {
		var expire = redis.expire(req.access_token);
		if (expire) {
			delete req.user;
			return res.sendStatus(200).send('Log Out Succesfully');
		}
	},
	changePassword: function (req, res, next) {
		var user = req.user;
		var password = req.body && req.body.password;
		var err;
		if (!user) {
			err = new Error('Login Required');
			err.status = 401;
			return next(err);
		}

		if (!password) {
			err = new Error('Password Missing');
			err.status = 401;
			return next(err);
		}

		var query = {
			email: user.email
		};
		
		Model.update(query, {
			password: password
		}, function (e, doc) {
			if (e) {
				return next(e);
			}
			console.log(doc);
			res.sendStatus(200).send('Password Updated');
		});


	}
};

module.exports = users;