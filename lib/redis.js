#!/usr/bin/env node

'use strict';

/* jslint node: true */

var client = require('redis').createClient();

var redis = {
	createToken: function (data, cb) {
		if (!data) {
			return cb(new Error('data Missing'));
		}
		var webToken = data.webToken;

		if (!webToken) {
			return cb(new Error('Web Token Missing'));
		}
		client.set(webToken, JSON.stringify(data), function (err, response) {
			if (err) {
				return cb(new Error(err));
			}
			if (response) {
				client.expire(webToken, 3600, function (err, res) {
					if (err) {
						return cb(new Error('Can not set the expire value for the token key'));
					}
					if (res) {
						return cb();
					} else {
						return cb(new Error('Expiration not set on redis'));
					}
				});
			} else {
				return cb(new Error('Token not set in redis'));
			}
		});
	},

	fetchTokenUser: function (token, cb) {
		if (!token) {
			return cb(new Error('Token Missing from request'));
		}
		var data;

		client.get(token, function (err, user) {
			if (err) {
				return cb(err);
			}

			if(!user){
				err = new Error('Login Required');
				err.status = 401;
				return cb(err);
			}

			try {
				data = JSON.parse(user);
			} catch (exc) {
				console.log(exc);
				return cb(exc);
			}
			cb('', data);
		});
	},

	expire: function (token) {
		if (!token) {
			return new Error('No token Found');
		}
		client.expire(token, 0);
		return token !== null;
	}
};


module.exports = redis;