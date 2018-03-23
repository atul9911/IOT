
var DeviceState = {On:"On",Off:"off"};

var DeviceType = {};

DeviceType['Default']  = "Default";
DeviceType['IR']  = "IR";

exports.DeviceType = DeviceType;

module.exports = function Device(id,type){	
	
	this.currentState = function(){
		return this.curentState_;
	};

	this.setId = function(id){
		this.id_ = id;
	};

	this.id = function(){
		return this.id_;
	};

	this.switchState = function(){
		if(this.curentState_ == DeviceState.Off){
			this.setCurrentState(DeviceState.On);
			return;
		}
		this.setCurrentState(DeviceState.Off);	
	};
	this.setCurrentState = function(state){
		this.curentState_ = state;
		// console.log("DeviceState : " + this.curentState_);
	}; 

	this.type = function(){
		return this.type_;
	};

	this.setType = function(type){
		this.type_  = type;
	};
	

	// call class functions and variables
	this.setCurrentState('false');
	this.setType(type);
	this.setId(id);
};