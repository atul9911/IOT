#!/usr/bin/env node

'use strict';

/* jslint node: true */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var node_schema = new Schema({
  Hubid: String,
  Nodeid: String,
  Nodetype: String,
  devices: [{id: String,state: Boolean}],
  irDevices: [{id: String}]
});


var NodeModel = mongoose.model('nodes', node_schema);

module.exports = NodeModel;