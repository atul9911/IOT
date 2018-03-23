 var On = {};
 On['connected']   		= "connected";
 On['disconnect'] 		= "disconnect";
 On['add_Node'] 		= "add_Node";
 On['chat_message'] 	= "chat message";
 On['DeviceType'] 		= "DeviceType";
 On['wifi_details'] 	= "wifi_details";
 On['wifi_details_rec'] = "wifi_details_rec";
 On['get_wifi_details'] = "get_wifi_details";
 On['Node_change'] 		= "Node_change";
 On['Node_info'] 		= "Node_info";
 On['Node_all']         = "Node_all";
 On['Node_devices']     = "Node_devices";
 On['Node_devices_IR']  = "Node_devices_IR";
 On['Node_power']       = "Node_power";
 On['Node_IR_delete']   = "Node_IR_delete";
 On['Node_delete']      = "Node_delete";
 On['bulb'] 			= "bulb";
 On['fan'] 				= "fan";
 On['new_user'] 		= "new user";
 On['addDevice']		= "addDevice";
 On['findHub']			= "findHub";
 On['dummy']            = "dummy";
 On['addIRDevice']      = "addIRDevice";

  
var Emit = {};
 Emit['wifi_details']    = "wifi_details";
 Emit['add_Node'] 	     = "add_Node";
 Emit['ack'] 		     = "ack";
 Emit['chat_message']    = "chat message";
 Emit['bulb'] 		     = "bulb";
 Emit['fan'] 		     = "fan";
 Emit['dummy']           = "dummy";
 Emit['Node_change']     = "Node_change";
 Emit['Node_info'] 	     = "Node_info";
 Emit['Node_devices']    = "Node_devices";
 Emit['Node_all']        = "Node_all";
 Emit['Node_devices_IR'] = "Node_devices_IR";
 Emit['Node_power']      = "Node_power";
 Emit['Node_IR_delete']  = "Node_IR_delete";
 Emit['Node_delete']     = "Node_delete";
 Emit['addIRDevice']     = "addIRDevice";
 Emit['addDevice']	     = "addDevice";

 
 exports.On   = On;
 exports.Emit = Emit;

