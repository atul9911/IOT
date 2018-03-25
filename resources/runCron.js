'use strict';
var mongoose = require('mongoose');
var async = require('async');
var HubController = require('../HOME_AUTO_SAUDI/HubController');
var Database = require('../HOME_AUTO_SAUDI/Database');
var util = require('util');
var Model = require('../models/scheduleModel');
var NodeModel = require('../models/node');
var Device = require('../HOME_AUTO_SAUDI/Device');
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');


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
		var mqttClient = options.mqttClient;


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

				var hub = HubController.AddHub(hubId, null);

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

				function processNodeData(err, docs) {
					if (err || !docs) {
						return callback('Error while fetching data');

					}

					if (!docs.length) {
						return callback('No hub data present with the filters:' + JSON.stringify(nodeFilter));
					}

					for (var docs_i = 0; docs_i < docs.length; docs_i++) {

						var node_docs = docs[docs_i];
						var nodeId = node_docs.Nodeid;
						var hubId = node_docs.Hubid;
						var nodeType = node_docs.Nodetype;
						var devices = node_docs.devices;
						var irDevices = node_docs.irDevices;

						console.log("adding node to Hub");
						//
						var node = hub.addNode(nodeId, nodeType);

						//CHECK
						if (node == null) {
							return;
						}
						if ((devices.length != 0) || devices != null) {
							node.removeDevices();
						}

						for (var i = 0; i < devices.length; i++) {
							if (devices[i].id == deviceId) {
								var device = new Device(devices[i].id, "Default");
								device.setCurrentState(deviceState);
								node.addDevice(device);
							}

						}
						for (var i = 0; i < irDevices.length; i++) {
							node.addDevice(new Device(irDevices[i].id, "IR"));
						}
					}
					console.log("HUB : ");
					for (var i = 0; i < hub.Nodes.length; i++) {
						console.log("NODE ID : " + hub.Nodes[i].id());
						console.log(hub.Nodes[i].Devices);
					}

					var publishMessage = {
						success: true,
						nId: nodeId,
						dId: deviceId,
						dState: deviceState
					}

					//client.subscribe('Node_change');
					client.publish('Node_change', JSON.stringify(publishMessage), {
						qos: 0, // 0, 1, or 2
						retain: false // or true
					}, function(err) {
						util.log(err || 'Message published');
						if (err) {
							return callback('Mqtt Error');
						}

						var Hubid_ = hub.uniqueID();
						var deviceId_ = deviceId;
						var state_ = (deviceState);

						console.log("Device state" + state_);
						Database.setDeviceState({
							hubid: Hubid_,
							nodeId: nodeId,
							deviceId: deviceId_,
							state: state_
						});
					});

					// var message = {
					// 	topic: 'inTopic',
					// 	payload: publishMessage, // or a Buffer
					// 	qos: 0, // 0, 1, or 2
					// 	retain: false // or true
					// };

				}
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