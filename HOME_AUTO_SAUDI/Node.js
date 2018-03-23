var Device = require('./Device');

var NodeType = {Type_4:4,Type_6:6};

module.exports = function Node(id,type) {

	this.powerUsage_=0.0;
	this.Devices    = [];
	this.IRDevices  = [];
	this.type_      = type;
	this.id_        = id;

	this.addDevices = function(number){
		for (var i = 1; i<=number ; i++) {
			this.addDevice(new Device(i,"Default"));
			// console.log("Device Added : " + "Device " + i);
		}
	};
	this.type = function(){
    	return this.type_;
	};

	this.powerUsage = function(){
		return this.powerUsage_;
	};

	this.setPowerUsage = function(){
		return this.powerUsage;
	};

	this.id = function(){
		return this.id_;
	};

	this.addDevice = function(device){

		switch(device.type()){

			case 'Default':
				this.Devices.push(device);
				break;
			case 'IR':
		        this.IRDevices.push(device);
			    break;
		};
	};

	this.removeDevice = function(device){

			switch(device.type){

			case 'Default':
				this.Devices.splice(device);
				break;
			case 'IR':
				var irDeviceId = device.deviceId;
				console.log("IR DEVICE ID " + irDeviceId);
				for (var i = 0; i < this.IRDevices.length; i++) {
						console.log("__IR DEVICE ID (from array object) " + this.IRDevices[i].id());
						//this.IRDevices.splice(this.IRDevices[i]);
				}

				for (var i = 0; i < this.IRDevices.length; i++) {
					if(this.IRDevices[i].id() == irDeviceId){
						console.log("IR DEVICE ID (from array object) " + this.IRDevices[i].id());
						console.log("IR DEVICE ID (from function arg)" + irDeviceId);
						this.IRDevices.splice(i,1);
					}
				}
			    break;
		};

				console.log("ir devices array length" +  this.IRDevices.length);

				for (var i = 0; i < this.IRDevices.length; i++) {
						console.log("__IR DEVICE ID (from array object) " + this.IRDevices[i].id());
						//this.IRDevices.splice(this.IRDevices[i]);
				}


	};


	this.getDevice =function(deviceId){
		console.log("deviceId : " + deviceId + "tpye : " + typeof deviceId);
		console.log("__________________________________________________");
		for (var i = 0; i < this.Devices.length; i++) {
            console.log("deviceId : " + this.Devices[i].id() + "tpye : " + typeof this.Devices[i].id());

            if(this.Devices[i].id() == deviceId){
				return this.Devices[i];
			}
		}
	};



	this.getDevices =function(){
		return this.Devices;
	};

	this.removeDevices =function(){
		this.Devices    = [];
	}
	this.addDevices(this.type_);
}
