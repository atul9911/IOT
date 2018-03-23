var Node = require('./Node');
var DeviceState = {Online:"Online",Offline:"Offline"};
var mosca = require('mosca');
var global_index = require('./index');


module.exports = function Hub(uniqueID,socket){
	this.uniqueID_ = uniqueID;
	this.Nodes = [];
	this.MobileDevices = [];
	this.curentState_;
	this.wifi_details;
	this.socket = socket;
	this.check_alive;

    this.addNode = function(name,type){
        var node = new Node(name,type);
        this.Nodes.push(node);
        return node;
    };

    this.nodeCount = function(){
        return this.Nodes.length;
    };



    this.removeNode = function(node){
		this.Nodes.splice(this.Nodes.indexOf(node), 1);
	};

	this.addMobileDevice = function(mobileDevice){
		if(!this.mobileDeviceExits(mobileDevice.id)){
				this.MobileDevices.push(mobileDevice);		
		}
		return 1;
	};

	this.removeMobileDeive = function(mobileDevice){
		this.MobileDevices.splice(this.MobileDevices.indexOf(mobileDevice),1);
	};

	this.mobileDeviceCount = function(){
		return this.MobileDevices.length;
	};
	this.mobileDeviceExits =function(socketId){
	    var output = this.MobileDevices.filter(function(item){  return item.id == socketId; });

	   	if(Object.keys(output).length === 0){
	    	return false;
	    }
	    return true;
	    // if(output.isEmpty())
	    // {
	    //       return false;
	    // }
	    // return true;
	}

	this.uniqueID = function(){
		return this.uniqueID_;
	};

	this.setUniqueID = function(uniqueID){
		this.uniqueID_ = uniqueID;
	};

	this.curentState = function(){
		return this.curentState_;
	};

	this.switchState = function(){
		if(this.curentState_ == DeviceState.Offline){
			 this.setCurrentState(DeviceState.Online);
			return;
		}
		this.setCurrentState(DeviceState.Offline);	
	};
	this.setCurrentState = function(state){
		this.curentState_ = state;
	};

	this.setWifiDetails = function(wifiDetails){
		// console.log(wifiDetails);
	};
	this.printNodes = function(){
		console.log("length : " + this.Nodes.length);
		for (var i = 0; i < this.Nodes.length ; i++) {
			console.log(this.Nodes[i].id());
		}
	}; 

	this.broadCastToMobieDevices = function(data,event){
		console.log("BroadCast To Mobie Devices");

		for (var i = 0; i < this.MobileDevices.length; i++){
			this.MobileDevices[i].emit(event,data);
		}
	};
	this.emit = function(event,message){

	       // console.log("SOCKET ID : " + socket.id);
	       // console.log(message);
		    // socket.emit(event,message);
        console.log("Publish to Hub");

		var  topic = this.uniqueID_+"/"+event;

        var message_ = {
            topic: topic,
            payload:JSON.stringify(message), // or a Buffer
            qos: 0, // 0, 1, or 2
            retain: false // or true
        };

        global_index.server.publish(message_, function() {
            console.log(message_.payload);
        });
	};

	this.getNode =function(nodeId){

		console.log("GET NODE" );
		console.log("GET NODE : "  + nodeId);
		console.log("GET NODE : NODES COUNT "  + this.Nodes.length );

		this.printNodes();

		console.log("GET NODE : ENTERING THE LOOP");
		for (var i = 0; i < this.Nodes.length; i++) {

			console.log("GET NODE : ID "  + this.Nodes[i].id());
		
			if(this.Nodes[i].id() == nodeId){
				console.log("NODE FOUND");
				return this.Nodes[i];
			}else{
			//	return null;
			}
		}
		console.log("NODE NOT FOUND");
		return null;
	};
	this.checkAlive = function(data){
		this.check_alive = data;
	};
	this.isAlive = function(){
		return this.check_alive;
	};
	this.sendHeartBeat = function(){
		  //  socket.emit('heartbeat',"true");
		  //  socket.emit(Events.On.dummy,'hi');
		    socket.send('hi');    
	};
	this.getDateTime = function(){

	    var date = new Date();

	    var hour = date.getHours();
	    hour = (hour < 10 ? "0" : "") + hour;

	    var min  = date.getMinutes();
	    min = (min < 10 ? "0" : "") + min;

	    var sec  = date.getSeconds();
	    sec = (sec < 10 ? "0" : "") + sec;

	    var year = date.getFullYear();

	    var month = date.getMonth() + 1;
	    month = (month < 10 ? "0" : "") + month;

	    var day  = date.getDate();
	    day = (day < 10 ? "0" : "") + day;

	    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

	};
}










