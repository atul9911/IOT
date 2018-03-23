'use strict';
var Model = require('../models/scheduleModel');


module.exports = {
	init:function (options) {
		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var startTime = date;
		startTime.setHours(0,0,0,0);
		var endTime = date;
		endTime.setHours(23,59,59,999);

		var filter = {
			next_execution_time : hours + ':' + minutes,
			$and : [{next_execution_date : {$gte:startTime.getTime()}},{next_execution_date : {$lte:endTime.getTime()}}]
		};

		var query = Model.find(filter);
		query.exec(function(err,res){
			//Logic will come here
		});


		// body...
	}
};

(function(){
	
}())