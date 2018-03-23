'use strict';

var Model = require('../models/scheduleModel');

module.exports = {
	schedule: function(req, res, next) {
		var body = req.body;
		
		var mandatory_params = ['execution_time','node_id' ,'device_id' ,'execution_days'];
		mandatory_params.forEach(function(x){
			if (!body[x])
			return res.json({
				err: 'Mandatory Parameters missing' + x
			});
		});

		var execution_time = body.execution_time;
		var node_id = body.node_id;
		var device_id = body.hub_id;
		var execution_days = body.execution_days;
		var switch_status = body.switch_status;

		if(!Array.isArray(execution_days))
			execution_days = execution_days.split(',');
		
		var scheduleData = new Model({
			execution_time: execution_time,
			execution_days : execution_days,
			node_id : node_id,
			device_id: device_id,
			switch_status :switch_status
		});

		scheduleData.save(function (err) {
			if (err)
				return next(err);
			res.json({
				success: 'Job created succesfully'
			});
		});
	},
	unschedule: function(req, res, next) {
		// body...
	}
};