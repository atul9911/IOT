var mongoose = require('mongoose');
var async = require('async');
var Node = require('./Node');
var domain = require('domain').create();

domain.on('error', function(er) {
    console.log('Oh no, something wrong with DB');
});

domain.run(function() {
	
	mongoose.connect('mongodb://localhost/nodes',function(err){
	  
		  if(err){
		    console.log(err);
		  }else{ 
		    console.log('connected to mongodb!');
		  }
	});

});


var node_schema = mongoose.Schema({
  Hubid: String,
  Nodeid: String,
  Nodetype: String,
  devices: [{id: String,state: Boolean}],
  irDevices: [{id: String}]
});

var node_model = mongoose.model('nodes', node_schema);

module.exports = {

	addNode : function(data){
			var node = new node_model;


			var Hubid = data.hubid;
			var Nodeid = data.node.id();
			var Nodetype = data.node.type();
			var devices = data.node.getDevices();


			node.Hubid   = Hubid;
			node.Nodeid  = Nodeid;
			node.Nodetype = Nodetype;

			for(var i=0;i<devices.length;i++){
				var id = devices[i].id();
				var state =  devices[i].currentState();
				node.devices.push({id: id,state: state});
			}

			node.save(function(argument) {
				// body...
				console.log(argument);
			});

			console.log("Add node to database");
	},
	addDevice : function(data){
//		{node: node,hubid: socket.Hub.uniqueID(),deviceType : "IR"}

		switch(data.deviceType){
			case 'Default':
				this.Devices.push(device);
				break;
			case 'IR':
				var Hubid = data.hubid;
				var Nodeid = data.node.id();
				var Nodetype = data.node.type();
				var DeviceId = data.deviceId;

				console.log("Hubid : " + Hubid);
				console.log("Nodeid : " + Nodeid);
				console.log("Devices Id : " + DeviceId);

				mongoose.model('nodes').find({Hubid: Hubid,Nodeid: Nodeid},function(err,docs){
					console.log(docs);
					for (var i = 0; i < docs.length; i++) {
						docs[i].irDevices.push({id: DeviceId});
						docs[i].save(function(err,resut){
							if(err){
								console.log(err);
							}
						});
					};
		 		});
				break;
		};
	},
	removeDevice: function(data){
		
		var hubid      = data.hubid;
		var nodeid     = data.nodeid;
		var deviceId   = data.deviceId;
		var deviceType = data.deviceType;
		var hubid      = data.hubid;

		if(deviceType=="IR"){

			mongoose.model('nodes').update({Hubid: hubid,Nodeid: nodeid},{$pull:{"irDevices": {id:deviceId}}},function(err,docs){
					console.log(docs);
					console.log(err);
			});
		}
	},
	removeNode: function(data){
																										
		var hubid  = data.hubid;
		var nodeid = data.nodeid;
		mongoose.model('nodes').findOneAndRemove({Hubid:hubid,Nodeid:nodeid},function(err,docs){
			console.log(docs);
			console.log(err);
		});
	},
    addDevices: function(node){

	},
	find : function(data){
		    mongoose.model('nodes').find(data,function(err,docs){

		    	return docs;
		 	});
	
	},
	setDeviceState: function(data){
		
		var Hubid = data.hubid;
		var deviceId = data.deviceId;
		var state = data.state;
		var nodeId = data.nodeId;
		mongoose.model('nodes').update({"Hubid":Hubid,"Nodeid":nodeId,"devices.id":deviceId},{$set:{"devices.$.state":state}},{multi:true},function(err,docs){
			console.log(err);
			console.log(docs);
		});

	}
}


