'use strict';
var mongoose = require('mongoose');
var async = require('async');
var HubController = require('../HOME_AUTO_SAUDI/HubController');
var Database = require('../HOME_AUTO_SAUDI/Database');
var util = require('util');
var Model = require('../models/scheduleModel');
var NodeModel = require('../models/node');

var runCron = {
	init: function(options, cb) {
		var date = new Date();
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var currentDay = date.getDay();
		var startTime = date;
		startTime.setHours(0, 0, 0, 0);
		var endTime = date;
		endTime.setHours(23, 59, 59, 999);
		var filter = {
			execution_time: hours + ':' + minutes,
			execution_days: currentDay.toString(),
			isEnabled: true
		};

		var query = Model.find(filter);
		query.exec(function(err, res) {
			if (err || !res) {
				return cb('Unable to fetch data from database');
			}

			if (!res.length) {
				return cb('No device scheduled fot this time:' + filter.execution_time);
			}

			async.eachLimit(res, 5, updateDevice, finalize);

			function updateDevice(device, callback) {
				var nodeId = device.node_id;
				var deviceId = device.device_id;
				var deviceState = device.switch_status;
				var hubId = device.hub_id;

				var nodeFilter = {
					Nodeid: nodeId,
					Hubid: hubId,
					devices: {
						$elemMatch: {
							id: deviceId
						}
					}

				};
				NodeModel.find(nodeFilter).exec(processNodeData);

				function processNodeData(err, nodeData) {
					if (err || !nodeData) {
						return callback('Error while fetching data');

					}

					if (!nodeData.length) {
						return callback('No hub data present with the filters:' + JSON.stringify(nodeFilter));
					}

					device.setCurrentState(deviceState);

					var Hubid_ = hub.uniqueID();
					var deviceId_ = deviceId;
					var state_ = (deviceState == 'true');

					Database.setDeviceState({
						hubid: Hubid_,
						nodeId: nodeId,
						deviceId: deviceId_,
						state: state_
					});
				}

				/*				var hub = HubController.GetHub(hubId);

								if (hub == null) {
									return callback('No Hub found with this hub id:' + hubId);
								}

								var node = hub.getNode(nodeId);

								if (node == null) {
									return callback('No Node found with this hub id:' + nodeId);
								}

								var node_type = node.type();

								if (node_type >= deviceId) {
									var device = node.getDevice(deviceId);
									if (device == null) {
										return callback('No device found with device id : ' + deviceId);
									}
									device.setCurrentState(deviceState);

									var Hubid_ = hub.uniqueID();
									var deviceId_ = deviceId;
									var state_ = (deviceState == 'true');

									Database.setDeviceState({
										hubid: Hubid_,
										nodeId: nodeId,
										deviceId: deviceId_,
										state: state_
									});
								}*/
			}

			function finalize(err) {
				if (err) {
					util.log(err);
					return cb(err);
				}
				return cb();
				// body...
			}
		});
	}
};

module.exports = runCron;

(function() {
	runCron.init({}, console.log);
}())