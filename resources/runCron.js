'use strict';
var mongoose = require('mongoose');

var options = {
  server: {
    socketOptions: {
      socketTimeoutMS: 10000
    },
    useMongoClient: true
  }
};

var db = mongoose.connect('mongodb://127.0.0.1:27017/mqtt', options).connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('timeout', function() {
  console.log('Timeout');
  process.exit(0);
});

var Model = require('../models/scheduleModel');

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
			execution_days : currentDay.toString()
		};

		var query = Model.find(filter);
		query.exec(function(err, res) {
			cb(err || res);

					var nodeId = JSON.parse(packet.payload.toString().trim()).nId;
                    var deviceId  = JSON.parse(packet.payload.toString().trim()).dId;
                    var deviceState  = JSON.parse(packet.payload.toString().trim()).dState;
                    var hubId  = data[0];
                    
                    var hub = HubController.GetHub(hubId);

                    if(hub==null){
                        console.log("hub is null");
                        return;
                    }

                    var node =  hub.getNode(nodeId);

                    if(node == null){
                        console.log("node is null");
                        return;
                    }

                    console.log("node type " + node.type());
                    var node_type = node.type();
                    console.log("device id " + deviceId);
                    console.log("device State " + deviceState);

                    if(node_type >= deviceId){

                        var device = node.getDevice(deviceId);
                        if(device==null){
                            console.log("device is null");
                            return;
                        }
                        device.setCurrentState(deviceState);

                        var Hubid_ = hub.uniqueID();
                        var deviceId_ = deviceId;
                        var state_ = (deviceState == 'true');

                        console.log("Device state" + state_);
                        Database.setDeviceState({hubid:Hubid_,nodeId:nodeId,deviceId:deviceId_,state:state_});

			//Logic will come here
			//Rohan Please paste your logic here only 
			//Please verify we are getting all the required input parameters
			/*
				db Result for this query would like this
				{
					"_id" : ObjectId("5ab60e0c8c95886e3f6acfc4"),
					"created_at" : ISODate("2018-03-24T08:36:28.256Z"),
					"updated_at" : ISODate("2018-03-24T08:36:28.256Z"),
					"execution_time" : "16:30",
					"node_id" : "1",
					"switch_status" : true,
					"execution_days" : [
						"1",
						"2",
						"3",
						"4"
					],
					"__v" : 0
				}
			*/
			
		});


		// body...
	}
};

module.exports = runCron;

(function() {
	runCron.init({}, console.log);
}())