'use strict';

var Model = require('../models/scheduleModel');

module.exports = {
	schedule: function(req, res, next) {
		var body = req.body;
		var next_execution_time = body.next_execution_time;
		var node_id = body.node_id;
		var hub_id = body.hub_id;

		if (!next_execution_time || !node_id || !hub_id)
			return res.json({
				err: 'Mandatory Parameters missing'
			});

		var scheduleData = new Model({
			next_execution_time: next_execution_time,
			next_execution_date : (new Date()).getTime(),
			node_id : node_id,
			hub_id: hub_id
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