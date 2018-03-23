#!/usr/bin/env node

'use strict';

/* jslint node: true */

var redis = require('../lib/redis');
var jwt = require('jsonwebtoken');

module.exports.middleware = function () {
	var fetchToken = function (req, res, next) {
		var access_token;
		if (req.cookies && req.cookies.Auth) {
			access_token = req.cookies.Auth;
			req.access_token = access_token;
			next();
		} else if (req.query && req.query.token) {
			access_token = req.query.token;
			req.access_token = access_token;
			next();
		} else if (req.headers && req.headers['x-access-token']) {
			access_token = req.headers['x-access-token'];
			req.access_token = access_token;
			next();
		} else {
			var err = new Error('No Access Token Found');
			err.status = 401;
			return next(err);
		}
	};

	fetchToken.unless = require('express-unless');
	return fetchToken;
};


module.exports.validateToken = function (req, res, next) {
	var access_token = req.access_token;
	jwt.verify(access_token, '1a2b3c4d5e', function (err) {
		if (err) {
			err.status = 401;
			return next(err);
		}
		return next();
	});
};

module.exports.validateUser = function(req,res,next){
	var access_token = req.access_token;
	var err ;

	if(!access_token){
		err = new Error('Invalid Token');
		err.status = 401;
		return next(err);
	}

	redis.fetchTokenUser(access_token,function(err,data){
		if(err){
			err.status = 401;
			return next(err);
		}

		if(!data){
			err = new Error('No User Found for this token');
			err.status = 404;
			return next(err);
		}

		if(data.webToken !== access_token){
			err = new Error('Invalid access token');
			err.status = 400;
			return next(err);
		}

		req.user = data;
		return next();
	});
};




