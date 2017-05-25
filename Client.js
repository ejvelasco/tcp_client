"use strict";

const net = require("net");
const readline = require("readline");
const colors = require("colors");

module.exports = class Client {
    constructor(opts) {
        this.port = opts.port || 3000;
        this.host = opts.host || "127.0.0.1";
        this.user = opts.user || "user";
    }

    connect(){
        const clientScope = this;
        const connectionId = JSON.stringify({ name: this.user });
        const socket = new net.Socket();
        const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
        });

        socket.connect(this.port, this.host);
        socket.on("connect", () => {
            let neatJSON = "";
            let partialJSON = "";
            let chunk = "";
            let parsedJSON = [];
            let lastNewlineIdx = 0;

            socket.write(connectionId);
            
            rl.on("line", (input) => {
                if( input !== null ){
                    const parsedInput = clientScope.parseJSON(input.toString());
                    const requestError = clientScope.isBadRequest(parsedInput);
                    if( requestError.status === false ){
                        socket.write(JSON.stringify(parsedInput));
                    } else{
                        console.log(requestError.message .red);
                    }
                }   
            });

            socket.on("data", function(data) {
                chunk = data.toString();
                lastNewlineIdx = chunk.lastIndexOf("\n");
                //Store valid JSON from current chunk
                neatJSON = chunk.substring(0, lastNewlineIdx + 1);
                //Add partial JSON (if any) from last chunk to the beginning
                neatJSON = (partialJSON + neatJSON).split("\n");
                neatJSON.pop();
                //Parse and display valid JSON
                parsedJSON = neatJSON.map((str) => clientScope.parseJSON(str));
                let displayMessage = "";
                for( let i = 0; i < parsedJSON.length; i++ ){
                    displayMessage = clientScope.displayResponse(parsedJSON[i]);
                    if( displayMessage !== null ){
                        console.log("Server: " .green + displayMessage);
                    }
                }
                //Store partial JSON for next data event
                partialJSON = chunk.substring(lastNewlineIdx + 1, chunk.length);        
            });

            socket.setTimeout(2000, () => {
                console.log("\nTimed out! Disconnecting..." .yellow);
                socket.end();
                rl.close();
            });
        });
        socket.on("close", () => {
            console.log("Reconnecting..\n" .yellow);
            clientScope.connect();
        });
        socket.on("error", (error) => {
            console.log(error .red);
        });
    }
    
    displayResponse(obj){
        let displayMessage = "";
        if( obj === null || obj.type === "heartbeat" ){
            displayMessage = null;
        } else {
            if( obj.msg.hasOwnProperty("count") ){
                displayMessage = "The count is " + obj.msg.count + ".";
            } else if( obj.msg.hasOwnProperty("time") ){
                displayMessage = "The time and date are " + obj.msg.time + ".";
                if( obj.msg.random > 30 ){
                    displayMessage += "\nNote: The random number is greater than 30.";
                }
            } else if( this.requestId !== obj.msg.reply && obj.type !== "welcome" ){
                displayMessage = "The reply property of the response message does not match the request ID provided.";
            } else {
                displayMessage = obj.msg;
            }
        }
        return displayMessage;
    }

    isBadRequest(obj){
        const error = {
            status: false,
            message: ""
        }
        if( obj === null ){
            error.message = "Please enter valid JSON.";
        } else if( obj.hasOwnProperty("request") === false ){
            error.message = "Please include a request property.";
        } else if( obj.request !== "count" && obj.request !== "time" ){
            error.message = "Please set 'request' property to 'count' or 'time'.";
        } else if( (Object.keys(obj).length > 1 && obj.hasOwnProperty("id") === false) || Object.keys(obj).length > 2 ){
            error.message = "Please include only the request and the id (optional) properties.";
        }
        if(error.message !== ""){
            error.status = true;
        } else {
            if( obj.hasOwnProperty("id") === true ){
                this.requestId = obj.id;    
            } else {
                this.requestId = null;
            }
        }
        return error;
    }
    
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
}



