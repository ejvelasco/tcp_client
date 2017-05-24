"use strict";

const net = require("net");

class Client {

    parseJSON(json){
        try {
            const parsedJSON = JSON.parse(json);
            if ( parsedJSON && typeof parsedJSON === "object" ) {
                return parsedJSON;
            } else{
                return null;
            }
        } catch (e) {
            return null;
        }
    }

    processData(arr){

    }

    connect(port, host, user){
    	const connectionId = JSON.stringify({ name: user });
    	const socket = new net.Socket();
    	socket.connect(port, host);
    	socket.on('connect', () => {
    		socket.write(connectionId);
    	    socket.on('data', (data) => {
    	    	console.log(data);
    	    });
    	    socket.setTimeout(2000, () => {
    	    	console.log("\nTime out! Disconnecting..." .yellow);
    	    	socket.end();
    	    });
    	});
	}

}

const client =  new Client();
const port = 9432;
const host = '35.184.58.167';
client.connect(port, host, "Jose");


