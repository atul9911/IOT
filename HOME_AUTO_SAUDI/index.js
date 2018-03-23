var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http, {'pingInterval': 2000, 'pingTimeout': 3600000});
var readlineSync = require('readline-sync');
var readline = require('readline');
var typeOf = require('typeof');
var net = require('net');
var fs = require("fs");
var mongoose = require('mongoose');
var mosca = require('mosca');


var ascoltatore = {
    //using ascoltatore
    type: 'mongo',
    url: 'mongodb://localhost:27017/mqtt',
    pubsubCollection: 'ascoltatori',
    mongo: {}
};

var settings = {
    port: 1883,
    backend: ascoltatore
};

var server = new mosca.Server(settings);

exports.server  = server;


server.on('clientConnected', function(client) {
    console.log('client connected', client.id);
    var hub = HubController.AddHub(client.id,null);

    mongoose.model('nodes').find({Hubid: client.id},function(err,docs){

        for(var docs_i=0; docs_i < docs.length; docs_i++){

            var node_docs = docs[docs_i];
            var nodeId   = node_docs.Nodeid;
            var hubId    = node_docs.Hubid;
            var nodeType = node_docs.Nodetype;
            var devices =  node_docs.devices;
            var irDevices = node_docs.irDevices;

            console.log("adding node to Hub");
            //
            var node = hub.addNode(nodeId,nodeType);

            //CHECK
            if(node==null){
                return;
            }
            if((devices.length!=0) || devices!=null){
                node.removeDevices();
            }

            for(var i = 0; i < devices.length; i++){
                var device = new Device(devices[i].id,"Default");
                device.setCurrentState(devices[i].state);
                node.addDevice(device);
            }



            for (var i = 0; i < irDevices.length; i++) {
                node.addDevice(new Device(irDevices[i].id,"IR"));
            }
        }
        console.log("HUB : " );
	for(var i=0;i<hub.Nodes.length;i++){
                 console.log("NODE ID : " + hub.Nodes[i].id());
        	console.log(hub.Nodes[i].Devices);
	}
    });
     
  

});

// fired when a message is received
server.on('published', function(packet, client) {


    console.log("RAW : " + " PayLoad: ", packet.payload.toString() + "  " + " Topic: " + packet.topic);


    var payload = packet.payload.toString();
    var topic =  packet.topic;

    if(topic.charAt(0) != '$'  ){
        if(topic != "outTopic" ) {

            console.log("DATA : " + topic);

            var data = topic.split('/');
            for(var i=0;i<data.length;i++){

                console.log("DATA : ["+ i + "] " + data[i]);
            }

            if(client==null){
                console.log("echo to server")
                return;
            }
            switch (data[1]){

                case "Node_power":

                    var nodeId = JSON.parse(packet.payload.toString().trim()).nId;
                    var power  = JSON.parse(packet.payload.toString().trim()).power;
                    var hubId  = data[0];


                    var response_obj = {};
                    response_obj['nodeId']   = nodeId;
                    response_obj['power']    = power;


                    var hub = HubController.GetHub(hubId);

                    if(hub==null){
                        console.log("hub is null");
                        return;
                    }

                    var node = hub.getNode(nodeId);
                    if(node==null){
                        console.log("node is null");
                        return;
                    }
                    hub.broadCastToMobieDevices(response_obj,Events.Emit.Node_power);
                    break;
                case "Node_change":

                    var nodeId = JSON.parse(packet.payload.toString().trim()).nId;
                    var deviceId  = JSON.parse(packet.payload.toString().trim()).dId;
                    var deviceState  = JSON.parse(packet.payload.toString().trim()).dState;
                    var hubId  = data[0];

                    var response_obj = {};
                    response_obj['nodeId'] = nodeId;
                    response_obj['deviceId'] = deviceId;
                    response_obj['deviceState'] = deviceState;

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

                    }
                    hub.broadCastToMobieDevices(response_obj,Events.Emit.Node_change);
                    break;
                case "testTopic":
                    break;
                case "wifi_details":
                    break;
                case "add_Node":

                    var nodeId = JSON.parse(packet.payload.toString().trim()).nodeId;
                    var type  = JSON.parse(packet.payload.toString().trim()).type;
                    var hubId  = data[0];
                    var hub = HubController.GetHub(hubId);
                    if(hub==null){
                        console.log("nodes is null");
                        return;
                    }
                    console.log("NodeId = " + nodeId);
                    var node = hub.addNode(nodeId,type);
                    if(node==null){
                        console.log("nodes is null");
                        return;
                    }
                    Database.addNode({hubid: hub.uniqueID(), node: node});
                    hub.broadCastToMobieDevices({'nodeId':node.id(),'type':node.type()},Events.Emit.add_Node);
                    break;
                case "dummy":
                    break;
                case "Node_IR_delete":

                    var nodeId = JSON.parse(packet.payload.toString().trim()).nId;
                    var deviceId  = JSON.parse(packet.payload.toString().trim()).dId;
                    var hubId  = data[0];
                    var hub = HubController.GetHub(hubId);

                    var response_obj = {};
                    var node = hub.getNode(nodeId);

                    if(node==null){
                        console.log("nodes is null");
                        return;
                    }
                    var device_data = {};
                    device_data['success'] = "true";
                    device_data['type'] = "IR";
                    device_data['deviceId'] = deviceId;

                    node.removeDevice(device_data);
                    Database.removeDevice({nodeid: nodeId,hubid: hub.uniqueID(),deviceType : "IR",deviceId:deviceId});
                    hub.broadCastToMobieDevices(device_data,Events.Emit.Node_IR_delete);
                    break;
                case "addIRDevice":

                    var nodeId = JSON.parse(packet.payload.toString().trim()).nId;
                    var deviceId  = JSON.parse(packet.payload.toString().trim()).dId;
                    var success  = JSON.parse(packet.payload.toString().trim()).s;

                    console.log("SUCCESS : " + success);

                    if(success=="t"){
                        success = "true"
                    }else{
                        success = "false"
                    }

                    var hubId  = data[0];
                    var hub = HubController.GetHub(hubId);

                    var response_obj = {};
                            response_obj['nodeId']      = nodeId;
                            response_obj['deviceId']    = deviceId;
                            response_obj['deviceState'] = "true";
                            response_obj['success']     = success;
                            console.log("deviceId :" + deviceId);

                           if(success=="true"){

                                var node = hub.getNode(nodeId);
                                if(node==null){
                                    console.log("node is null");
                                    return;
                                }
                                node.addDevice(new Device(deviceId,"IR"));
                                Database.addDevice({node: node,hubid: hub.uniqueID(),deviceType : "IR",deviceId: deviceId});
                            }
                            hub.broadCastToMobieDevices(response_obj,Events.Emit.addIRDevice);
                    break;
                case "wifi_details_rec":

                    var hubId  = data[0];
                    var hub = HubController.GetHub(hubId);
                    console.log("wifi_details_rec");
                    console.log(payload);
                    response_obj={};
                    response_obj['message'] = payload;
                    hub.broadCastToMobieDevices(response_obj,Events.On.wifi_details)
                    break;
            }
        }
    }
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
    console.log('Mosca server is up and running');
}


//classes 
var Hub = require('./Hub');
var HubController = require('./HubController');
var Device = require('./Device');
var Events = require('./Events');
var Database = require('./Database');
///

var DeviceType = {Mobile:"Mobile",Hub:"Hub"};
connections = [];
// var db = new Database();
http.listen(3000, function(){
  console.log('listening on port :3000');
});



var stdin = process.openStdin();
stdin.setEncoding( 'utf8' );
stdin.on('data', function(chunk) {

  if(chunk.toString().trim() ==='rohan'){
    console.log("I am the greatest");

  }else if(chunk.toString().trim() ==='Hubs'){
    HubController.PrintHubs();

  }else if(chunk.toString().trim() ==='wifi'){

          var response_obj = {};
          response_obj['success'] = "true";
          response_obj['message'] = ['Circular Blue','mightycartoon'] ;

          io.emit(Events.Emit.wifi_details ,{ message: JSON.stringify(response_obj) } );
  }else if(chunk.toString().trim() ==='addNode'){

          var response_obj = {};
          response_obj['success'] = "true";
          response_obj['message'] = " " ;
          io.emit(Events.Emit.add_Node,{ message: JSON.stringify(response_obj) } );
  }else if(chunk.toString().trim() ==='power'){

  } else{
    console.log("command not found")
  }

 });


app.get('/', function(req, res){
   res.sendFile(__dirname + '/index.html');
});




io.on('ping',function(data){
  console.log('ping  ' + data);
});
io.on('pong',function(data){
  console.log('pong  ' + data);
});

///

io.on('connection', function(socket){
 
  connections.push(socket);
  console.log('connected %s sockets connected', connections.length);
  // console.log('transport ' + socket.io.engine.transport.name);
  console.log(socket.conn.transport.name);

  var socketId = socket.id;
  var clientIp = socket.request.connection.remoteAddress;
  //On connection request
  var NewObject = {};
  NewObject['success'] = "true";
  NewObject['message'] = "connected";
        
  socket.emit(Events.Emit.ack ,{ message: JSON.stringify(NewObject) } );
 // socket.emit(Events.Emit.ack ,JSON.stringify(NewObject));

  console.log("socket ID : " + socketId);
  console.log("Client IP : " + clientIp);


    socket.on("packet", function(type, data) {
        console.log("received ping");
    });

socket.on("packetCreate", function(type, data) {
    console.log("sending pong");
});

socket.on('ping',function(data){
  console.log('ping  ' + data );
});
socket.on('pong',function(data){
  console.log('pong  ' + data );
});

  socket.on(Events.On.add_Node,function(data){

        if(socket==null){
          return;
        }
        if(socket.Hub==null){
          return;
        }

    switch(socket.DeviceType){

      case DeviceType.Mobile:
      console.log("Mobile : ");
      console.log(data);
        var response_obj = {};
          response_obj['success'] = "true";
          response_obj['message'] = " " ;

          socket.Hub.emit(Events.Emit.add_Node,response_obj);
        break;
      case DeviceType.Hub:
      console.log("Hub :");
      console.log(data);

      var node = socket.Hub.addNode(data.nodeId,data.type);
      //DATABASE

      // var db_obj = {};
      // {Hubid: socket.Hub.uniqueID(), Nodeid: data.nodeId}
      Database.addNode({hubid: socket.Hub.uniqueID(), node: node});
      socket.Hub.broadCastToMobieDevices({'nodeId':node.id(),'type':node.type()},Events.Emit.add_Node);
        break;
    }
    console.log("add node ");  
  });

  socket.on(Events.On.Node_info,function(data){

        if(socket==null){
          return;
        }
        if(socket.Hub==null){
          return;
        }

    var node = socket.Hub.getNode(data.nodeId);


    if(node ==  null){
      return;
    }

    socket.emit(Events.Emit.Node_info,node);
  });


  socket.on(Events.On.chat_message, function(msg){
  	console.log('message: ' + msg);
  	io.emit('chat message', msg);
      var message = {
          topic: 'inTopic',
          payload: msg, // or a Buffer
          qos: 0, // 0, 1, or 2
          retain: false // or true
      };
      server.publish(message, function() {
          console.log("Out : " + message.payload.toString());
      });
  });

  socket.on(Events.On.addDevice, function(data,callback){ 

    //CHECK
    if(socket==null){
      return;
    }

    // console.log(data);
    var deviceType,uniqueID;  
    deviceType = data.deviceType;
    uniqueID   = data.uniqueID; 
    // console.log("uniqueID" + uniqueID); 
    // console.log("deviceType" + deviceType); 
    console.log(data);


    switch(deviceType)
    { 
      case DeviceType.Hub:

        var hub_temp = HubController.AddHub(uniqueID,socket);
        // Database.find({});
        // Person.findOne({ 'name.last': 'Ghost' }, 'name occupation', function (err, person) {

        var response_obj = {};

        if(hub_temp != null){
          console.log("Hub Added");
          response_obj['success'] = "true";
          response_obj['message'] = "Hub Added";


          socket.DeviceType = DeviceType.Hub; 
          socket.Hub = hub_temp;

            //CHECK
          if(socket.Hub==null){
            return;
          }
          console.log(uniqueID);
          mongoose.model('nodes').find({Hubid: uniqueID},function(err,docs){

              for(var docs_i=0; docs_i < docs.length; docs_i++){

                  var node_docs = docs[docs_i];
                  var nodeId   = node_docs.Nodeid;
                  var hubId    = node_docs.Hubid;
                  var nodeType = node_docs.Nodetype;
                  var devices =  node_docs.devices;
                  var irDevices = node_docs.irDevices;
        
                  console.log("adding node to Hub");
                  var node = socket.Hub.addNode(nodeId,nodeType);

                  //CHECK
                  if(node==null){
                    return;
                  }



                  if((devices.length!=0) || devices!=null){
                    node.removeDevices();
                  }

                  for(var i = 0; i < devices.length; i++){
                    var device = new Device(devices[i].id,"Default");
                    device.setCurrentState(devices[i].state);
                    node.addDevice(device);
                  }



                  for (var i = 0; i < irDevices.length; i++) {
                      node.addDevice(new Device(irDevices[i].id,"IR"));                    
                  }
               } 
          });            

       }else{
          console.log("Hub Not Added")
          response_obj['success'] = "false";
          response_obj['message'] = "Hub Not Added";
       }
       socket.emit(Events.Emit.ack, { message: JSON.stringify(response_obj) } );
        setTimeout(function() {
            socket.emit(Events.On.dummy,"data");
          // HubController.UpdateDevices();
        }, 3000);

        break;

      case DeviceType.Mobile:
        var response_obj = {};
          console.log('Mobile connected');
 //          if(HubController.HubExists(uniqueID)){
          if(server.clients[uniqueID]!=undefined){
               console.log("Hub Exists");
               var Hub_temp = HubController.GetHub(uniqueID);
               socket.Hub = Hub_temp;
               if(socket.Hub==null){
                 console.log("Hub is null");
                 return;
               }
               if(Hub_temp.addMobileDevice(socket)==1){
                  console.log("Mobile device added");
                 // callback(true);
                  socket.DeviceType = DeviceType.Mobile;
                  response_obj['success'] = "true";
                  response_obj['message'] = "Mobile Added";
               }else{
                  response_obj['success'] = "false";
                  response_obj['message'] = "Mobile Not Added";
               }
              // mobiles.push(socket);
          }else{
              //  callback(false);
                response_obj['success'] = "false";
                response_obj['message'] = "Hub not found";
          }
          socket.emit(Events.Emit.addDevice,response_obj);
          break;

        }
     
  });

  socket.on(Events.On.wifi_details,function(data){
    if(socket==null){
      return;
    }
    if(socket.Hub==null){
      return;
    }


    socket.Hub.setWifiDetails(data);
    var response_obj = {};
    response_obj['success'] = "true";
    response_obj['message'] = [data.wifi_name,data.wifi_pass] ;
    socket.Hub.emit(Events.Emit.wifi_details ,response_obj);
    console.log('wifi_details');
    console.log(response_obj);
  });

  socket.on(Events.On.wifi_details_rec,function(wifi_details){
    console.log("wifi_details_rec");
    console.log(wifi_details);
    socket.Hub.broadCastToMobieDevices(wifi_details,Events.On.wifi_details);
  });

   socket.on(Events.On.get_wifi_details,function(data,callback){

    callback(socket.wifi_details.toString());
    //socket.hub.emit('wifi_details',data);
    console.log("data" + data + " callback "  +  socket.wifi_details.toString());
  });

   socket.on(Events.On.Node_change,function(data){

    if(socket == null){
      return;
    }
    if(socket.Hub==null){
      return;
    }
        console.log(data);
        switch(socket.DeviceType){
          case DeviceType.Mobile:
              console.log("Mobile : ");
              console.log(data);
              var response_obj = {};
              response_obj['success'] = "true";
              response_obj['nId'] = data.nodeId;
              response_obj['dId'] = data.deviceId;
              response_obj['dState'] = data.deviceState;
              socket.Hub.emit(Events.Emit.Node_change,response_obj);
          break;
          case DeviceType.Hub:
            console.log("Hub : ");
            console.log(data);
            var response_obj = {};
            response_obj['nodeId'] = data.nId;
            response_obj['deviceId'] = data.dId;
            response_obj['deviceState'] = data.dState;


  
             var node =  socket.Hub.getNode(data.nId);
             if(node == null){
               console.log("node is null");
               return;
             }
             console.log("node type" + node.type());
             var node_type = node.type();
             console.log("device id" + data.dId);


             if(node_type >= data.dId){

               var device = node.getDevice(data.dId);
               if(device==null){
                 console.log("device is null");
                 return;
               }
               device.setCurrentState(data.dState);

                var Hubid_ = socket.Hub.uniqueID();
                var deviceId_ = data.dId;
                var state_ = (data.dState == 'true');

                console.log("Device state" + state_);
               Database.setDeviceState({hubid:Hubid_,deviceId:deviceId_,state:state_});

             }



            socket.Hub.broadCastToMobieDevices(response_obj,Events.Emit.Node_change);
          break;
        }
   });

   socket.on(Events.On.addIRDevice,function(data){


        if(socket==null){
          console.log("socket in null");
          return;
        }
        if(socket.Hub==null){
          console.log("Hub is null");
          return;
        }





        console.log("ADD IR DEVICE");
        console.log(data);
        switch(socket.DeviceType){
          case DeviceType.Mobile:
            console.log("Mobile : ");
            console.log(data);
              var response_obj = {};
              response_obj['success'] = "true";
              response_obj['nId'] = data.nodeId;
              socket.Hub.emit(Events.Emit.addIRDevice,response_obj);
          break;
          case DeviceType.Hub:
            console.log("Hub : ");
            console.log(data);
            var response_obj = {};
            response_obj['nodeId']      = data.nId;
            response_obj['deviceId']    = data.dId;
            response_obj['deviceState'] = "true"; 
            response_obj['success']     = data.success; 

            console.log("deviceId :" + data.dId);



          if(data.success=="true"){

            var node = socket.Hub.getNode(data.nId);
            if(node==null){
              console.log("node is null");
              return;
            }
            node.addDevice(new Device(data.dId,"IR"));  
            Database.addDevice({node: node,hubid: socket.Hub.uniqueID(),deviceType : "IR",deviceId: data.dId});
          }
          socket.Hub.broadCastToMobieDevices(response_obj,Events.Emit.addIRDevice);
          break;
        }
   });

   socket.on(Events.On.Node_all,function(data){

        if(socket==null){
          console.log("socket in null");
          return;
        }
        if(socket.Hub==null){
          console.log("Hub is null");
          return;
        }
        if(socket.Hub.Nodes==null){
          console.log("Nodes is null");
          return;
        }
        var nodes = []; 
        for (var i = 0; i < socket.Hub.Nodes.length; i++) {

            nodes.push({'nodeId':socket.Hub.Nodes[i].id(),'type':socket.Hub.Nodes[i].type()});
        }
        socket.emit(Events.Emit.Node_all,nodes);
   });

   socket.on(Events.On.Node_devices_IR,function(data){

    if(socket==null){
           console.log("socket is null");
           return;
       }
    if(socket.Hub==null){
      console.log("Hub is null");
      return;
    }

        var node =  socket.Hub.getNode(data.nodeId);
        if(node==null){
            console.log("node is null");
            return;
        }
        // console.log(node);
        var irDevice = [];
        console.log("IR DEVICES FOR NODE : " + node.id());
        for (var i = 0; i < node.IRDevices.length; i++) {
           console.log(node.IRDevices[i].id());
           irDevice.push(node.IRDevices[i].id());
        }
        socket.emit(Events.Emit.Node_devices_IR,irDevice);
   });

   socket.on(Events.On.Node_devices,function(data){
    if(socket==null){
      console.log("socket is null");
      return;
    }
    if(socket.Hub==null){
      console.log("Hub is null");
      return;
    }

          var node =  socket.Hub.getNode(data.nodeId);

          if(node==null){
            console.log("node is null");
            return;
          }
          if(node.Devices==null){
            console.log("Devices is null");
            return;
          }

          var devices = [];
          for (var j = 0; j < node.Devices.length; j++) {
              // console.log("device id " + node.Devices[j].id());
              // console.log("current State " + node.Devices[j].currentState());
              devices.push({'id':node.Devices[j].id(),'state':node.Devices[j].currentState()});
          }
           
           console.log("Node devices : ")
           console.log(devices);
          // console.log(node.getDevices());

          socket.emit(Events.Emit.Node_devices,devices);
   });
  socket.on(Events.On.Node_power,function(data){

      if(socket==null){
        console.log("socket is null");
        return;
      }
      if(socket.Hub==null){
        console.log("Hub is null");
        return;
      }

        console.log("NODE POWER");
        console.log(data);
        switch(socket.DeviceType){
          case DeviceType.Mobile:
            console.log("Mobile : ");
            console.log(data);
              var response_obj = {};
              response_obj['success'] = "true";
              response_obj['nId'] = data.nodeId;

              socket.Hub.emit(Events.Emit.Node_power,response_obj);
          break;
          case DeviceType.Hub:
            console.log("Hub : ");
            console.log(data);
//            { nId: '4234567890', success: 'true', dId: '11' }
            var response_obj = {};
            response_obj['nodeId']   = data.nId;
            response_obj['power']    = data.power;     

            var node = socket.Hub.getNode(data.nId);
          //  node.addDevice(new Device(data.dId,"IR"));
          if(node==null){
              console.log("node is null");
              return;
          }

            socket.Hub.broadCastToMobieDevices(response_obj,Events.Emit.Node_power);
          break;
        }
   });

  socket.on(Events.On.Node_IR_delete,function(data){

      if(socket==null){
        console.log("socket is null");
        return;
      }
      if(socket.Hub==null){
        console.log("hub is null");
        return;
      }

        switch(socket.DeviceType){
          case DeviceType.Mobile:
            console.log("Mobile : ");
            console.log(data);
              var response_obj        = {};
              response_obj['success'] = "true";
              response_obj['nId']     = data.nodeId;
              response_obj['dId']     = data.deviceId;
              socket.Hub.emit(Events.Emit.Node_IR_delete,response_obj);
          break;
          case DeviceType.Hub:
            console.log("Hub : ");
            console.log(data);
//            { nId: '4234567890', success: 'true', dId: '11' }
            var response_obj = {};
            var node = socket.Hub.getNode(data.nId);

            if(node==null){
              console.log("nodes is null");
              return;
            }
            var device_data = {};
            device_data['success'] = "true";
            device_data['type'] = "IR";
            device_data['deviceId'] = data.dId;

            node.removeDevice(device_data);
            Database.removeDevice({nodeid: data.nId,hubid: socket.Hub.uniqueID(),deviceType : "IR",deviceId: data.dId});

             socket.Hub.broadCastToMobieDevices(device_data,Events.Emit.Node_IR_delete);
          break;
        }
  });
  socket.on(Events.On.Node_delete,function(data){
    //removeNode

    if(socket==null){
      console.log("socket is null");
      return;
    }
    if(socket.Hub==null){
      console.log("hub is null");
      return;
    }
    var node  = socket.Hub.getNode(data.nodeId);

    if(node==null){
      console.log("node is null");
      return;
    }




    socket.Hub.removeNode(node);
    Database.removeNode({hubid:socket.Hub.uniqueID(),nodeid: data.nodeId});

    var device_data = {};
    device_data['success'] = "true";
    device_data['nodeId'] = data.nodeId;
    socket.Hub.broadCastToMobieDevices(device_data,Events.Emit.Node_delete);
  });



    socket.on(Events.On.dummy,function(data){

        console.log("dummy -> received : ");
        console.log(data);

        if(socket.Hub==null){
            data["success"] = "false";
        }
        socket.emit(Events.On.dummy,data);
        console.log("dummy -> sent : ");
        console.log(data);
    });

   socket.on('check_alive',function(data){
    console.log("data : " + data);
    // socket.Hub.checkAlive(true);    
  });

  socket.on(Events.On.disconnect ,function(data){

    if(socket==null){
      console.log("socket is null");
      return;
    }
    if(socket.Hub==null){
      console.log("hub is null");
      return;
    }
    if(socket.Hub.MobileDevices==null){
      console.log("MobileDevices is null");
      return;
    }

    switch(socket.DeviceType){

      case DeviceType.Hub:
        if(data == "transport close"){

          console.log("transport close for Hub");

        }else if(data == "ping timeout"){

          console.log("ping timeout for Hub");

        }else{

        }
        console.log("TIME : " + socket.Hub.getDateTime());
            break;
        case DeviceType.Mobile:

        if(data == "transport close"){
          console.log("transport close for Mobile");
        }else if(data == "ping timeout"){
          console.log("ping timeout for Mobile");
        }

        console.log("Mobile Deives length" + socket.Hub.MobileDevices.length);
        socket.Hub.MobileDevices.splice(socket,1);
        console.log("Mobile Deives length" + socket.Hub.MobileDevices.length);
        console.log("TIME : " + socket.Hub.getDateTime());
        break;
    }
    connections.splice(connections.indexOf(socket),1);
		console.log('Disconnected %s sockets connected',connections.length);
	});

});




