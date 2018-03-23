'use strict';

var moment = require('moment');


module.exports = {
	calculateNextMin: function(inputTime) {
		var m = moment(inputTime);
		var roundUp = m.minute() || m.second() || m.millisecond() ? m.add(1, 'hour').startOf('hour') : m.startOf('hour');
		return roundUp;
	}
}