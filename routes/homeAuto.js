'use strict';

var Model = require('../models/scheduleModel');

module.exports = {
	schedule: function(req, res, next) {
		var body = req.body;

		var mandatory_params = ['execution_time', 'node_id', 'device_id', 'execution_days', 'hub_id'];
		mandatory_params.forEach(function(x) {
			if (!body[x])
				return res.json({
					err: 'Mandatory Parameters missing' + x
				});
		});

		var execution_time = body.execution_time;
		execution_time = execution_time.split(':');
		var time_flag = true;
		for (var i = 0; i < execution_time.length; i++) {
			execution_time[i] = Number(execution_time[i]);
			if (!execution_time[i]) {
				time_flag = false;
			}
		}

		if (!time_flag) {
			return res.json({
				err: 'Invalid Time'
			});
		}

		execution_time = execution_time.join(":");
		var node_id = body.node_id;
		var device_id = body.device_id;
		var execution_days = body.execution_days;
		var switch_status = body.switch_status;
		var hub_id = body.hub_id;

		if (!Array.isArray(execution_days))
			execution_days = execution_days.split(',');

		var scheduleData = new Model({
			execution_time: execution_time,
			execution_days: execution_days,
			node_id: node_id,
			device_id: device_id,
			switch_status: switch_status,
			hub_id: hub_id
		});
		
		scheduleData.save(function(err) {
			if (err) {
				return next(err);
			} else{
				res.json({
					success: 'Job created succesfully'
				});
			}
				
		});
	},
	unschedule: function(req, res, next) {
		// body...
	}
};