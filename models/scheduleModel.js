#!/usr/bin/env node

'use strict';

/* jslint node: true */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var scheduleModelSchema = new Schema({
	next_execution_date : Number,
	next_execution_time : String,
	offset_days : {
		type:Number,
		default: 0
	},
	hub_id :String,
	node_id: String, 
	created_at : 'Date',
	updated_at : 'Date'
});

// on every save, add the date
scheduleModelSchema.pre('save', function (next) {	// get the current date
	var currentDate = new Date();
	this.updated_at = currentDate;
	if (!this.created_at)
		this.created_at = currentDate;

	next();
});

// on every save, add the date
scheduleModelSchema.pre('update', function (next) {
	var currentDate = new Date();
	this.updated_at = currentDate;
	next();
});


var ScheduleModel = mongoose.model('ScheduleModel', scheduleModelSchema);

module.exports = ScheduleModel;