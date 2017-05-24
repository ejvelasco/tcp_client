"use strict";

const net = require("net");

class Client {

    parseJSON(json){
        try {
            const parsedJSON = JSON.parse(json);
            if ( parsedJSON && typeof parsedJSON === "object" ) {
                return parsedJSON;
            } else {
                return null;
            }
        } catch (e) {
            return null;
        }
    }

    displayResponses(arr){
        for( let i = 0; i < arr.length; i++ ){
            if( arr[i].type === "heartbeat" ){
                console.log("heartbeat yo");
            }
        }
    }

    receiveInput(){
        
    }

    connect(port, host, user){
    	const connectionId = JSON.stringify({ name: user });
    	const socket = new net.Socket();
    	const clientScope = this;
        socket.connect(port, host);
    	socket.on('connect', () => {
            let neatJSON = "";
            let partialJSON = "";
            let chunk = "";
            let parsedJSON = [];
            let lastNewlineIdx = 0;
            socket.write(connectionId);
            socket.on('data', function(data) {
                chunk = data.toString();
                lastNewlineIdx = chunk.lastIndexOf("\n");
                //Store valid JSON from current chunk
                neatJSON = chunk.substring(0, lastNewlineIdx + 1);
                //Add partial JSON (if any) from last chunk to the beginning
                neatJSON = (partialJSON + neatJSON).split("\n");
                neatJSON.pop();
                //Parse and display valid JSON
                parsedJSON = neatJSON.map((str) => clientScope.parseJSON(str));
                clientScope.displayResponses(parsedJSON);
                //Store partial JSON for next data event
                partialJSON = chunk.substring(lastNewlineIdx + 1, chunk.length);        
            });
    	    socket.setTimeout(2000, () => {
    	    	console.log("\nTimed out! Disconnecting...");
    	    	socket.end();
    	    });
    	});
	}

}

const client =  new Client();
const port = 9432;
const host = '35.184.58.167';
client.connect(port, host, "Jose");


