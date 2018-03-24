'use strict';

var mongoose = require('mongoose');
var async = require('async');
var Node = require('./Node');
var NodeModel = require('../models/node');

module.exports = {
	addNode: function(data) {
		var node = {
			devices:[]
		};

		var Hubid = data.hubid;
		var Nodeid = data.node.id();
		var Nodetype = data.node.type();
		var devices = data.node.getDevices();
		node.Hubid = Hubid;
		node.Nodeid = Nodeid;
		node.Nodetype = Nodetype;

		for (var i = 0; i < devices.length; i++) {
			var id = devices[i].id();
			var state = devices[i].currentState();
			node.devices.push({
				id: id,
				state: state
			});
		}

		NodeModel.save(node,function(err,res) {
			console.log(err ||res);
		});
	},
	addDevice: function(data) {
		switch (data.deviceType) {
			case 'Default':
				this.Devices.push(device);
				break;
			case 'IR':
				var Hubid = data.hubid;
				var Nodeid = data.node.id();
				var Nodetype = data.node.type();
				var DeviceId = data.deviceId;
				NodeModel.find({
					Hubid: Hubid,
					Nodeid: Nodeid
				}, function(err, docs) {
					console.log(docs);
					for (var i = 0; i < docs.length; i++) {
						docs[i].irDevices.push({
							id: DeviceId
						});
						docs[i].save(function(err, resut) {
							if (err) {
								console.log(err);
							}
						});
					};
				});
				break;
		};
	},
	removeDevice: function(data) {
		var hubid = data.hubid;
		var nodeid = data.nodeid;
		var deviceId = data.deviceId;
		var deviceType = data.deviceType;
		var hubid = data.hubid;

		if (deviceType == "IR") {
			NodeModel.update({
				Hubid: hubid,
				Nodeid: nodeid
			}, {
				$pull: {
					"irDevices": {
						id: deviceId
					}
				}
			}, function(err, docs) {
				console.log(docs);
				console.log(err);
			});
		}
	},
	removeNode: function(data) {
		var hubid = data.hubid;
		var nodeid = data.nodeid;
		NodeModel.findOneAndRemove({
			Hubid: hubid,
			Nodeid: nodeid
		}, function(err, docs) {
			console.log(docs);
			console.log(err);
		});
	},
	addDevices: function(node) {

	},
	find: function(data) {
		NodeModel.find(data, function(err, docs) {
			return docs;
		});

	},
	setDeviceState: function(data) {
		var Hubid = data.hubid;
		var deviceId = data.deviceId;
		var state = data.state;
		var nodeId = data.nodeId;
		NodeModel.update({
			"Hubid": Hubid,
			"Nodeid": nodeId,
			"devices.id": deviceId
		}, {
			$set: {
				"devices.$.state": state
			}
		}, {
			multi: true
		}, function(err, docs) {
			console.log(err);
			console.log(docs);
		});

	}
}