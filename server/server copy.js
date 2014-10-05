var express = require("express");
var app = express();
var request = require("request");
var WebSocket = require("ws");
var morgan = require("morgan");

app.use(morgan('dev'));

var myoWS = new WebSocket("ws://127.0.0.1:7204/myo/1");

var accessToken = "";
var refreshToken = "";
var timer = 0;
var arr = [];
/*var userForm = {
	client_id: "1e6a3acba0ea4f8dcd93be2639b13407",
	client_secret: "030ade9940c62fc1c69a583f91dee014",
	username: "tjrwh2@gmail.com",
	password: "password",
	grant_type: "password"
}

request.post({url: "https://winkapi.quirky.com/oauth2/token", headers: {"Content-Type": "application/json"}, formData: userForm}, function(err, httpResponse, body){
	console.log(body);
	if (httpResponse == 201){*/
		var accessToken = "323441e500f5022c99f672a57d574b7b";
		request({
			url: "https://winkapi.quirky.com/users/me/wink_devices",
			method: "GET",
			headers: {"Authorization": "Bearer " + accessToken}	
		}, recall(error, response, body));
/*	}
});*/
function recall(error, response, body){
    console.log(body);
    body = JSON.parse(body);
    var fist = false;
    
    var state = 0;
    var offset;
    var power = true;
    myoWS.on('message', function(myo){
        data = JSON.parse(myo);
        if (timer >0) {
             timer -= 1;
        }
        if (data[1].type === "orientation" && fist) {
             var o = data[1].orientation;
             var pitch = Math.asin(2.0 * (o.w * o.y - o.x * o.z));
             var roll = Math.atan2(2.0 * (o.w * o.x + o.y * o.z), 1.0 - 2.0 * (o.x * o.x + o.y * o.y));
             var yaw = Math.atan2(2 * (o.w * o.z + o.x * o.y), 1.0 - 2.0 * (o.y * o.y + o.z * o.z));
             if (state == 2) {
                power = false;
                state = 0;
             }
             if (state == 1) {
                offset = roll;
                state = 0;
                power = true;
             }
             else {
                var change = roll - offset;
                var newBrightness = Math.round((body.data[1].desired_state.brightness + change) * 100) / 100;
                if ((Math.abs(change) > .1 || !power) && timer <= 0) {
                    var updateData = {
                        method: "PUT",
                        url: "https://winkapi.quirky.com/light_bulbs/" + body.data[1].light_bulb_id,
                        headers: {"Authorization": "Bearer " + accessToken, "Content-Type": "application/json" },
                        json: {"desired_state": {"powered": power, "brightness": newBrightness}}
                    };
                    console.log(updateData);
                    request(updateData, function(err, res, data){
                            console.log(res.statusCode);
                    });
                    timer = 20;
                }
             }
        }
        if (data[1].type === "pose"){
            if (data[1].pose === "fist"){
                fist = true;
                console.log("Yo");
                state = 1;
                if (!power) {
                    timer = 0;
                }
                power = true;
            }
            else if (data[1].pose === "fingers_spread" && power) {
                console.log("Kill Bill");
                if (power) {
                    timer = 0;
                }
                power = false;
                fist = true;
                state = 2;
            }
            else{
                fist = false;
                state = 0;
            }
        }
    });
};


function init() {
    
    
}

app.listen(3000);

