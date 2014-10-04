var express = require("express");
var app = express();
var WebSocket = require("ws");
var WebSocketServer = WebSocket.Server;
var morgan = require("morgan");

var myoWS = new WebSocket("ws://127.0.0.1:7204/myo/1");
var wss = new WebSocketServer({port: 2345});

wss.broadcast = function(data){
	for (var i in this.clients)
        this.clients[i].send(data);
    console.log('broadcasted: %s', data);
}

/*myoWS.on('message', function(myo){
	wss.broadcast(myo);
});*/
