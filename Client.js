"use strict";

const net = require("net");
const readline = require("readline");
const colors = require("colors");

module.exports = class Client {
    constructor(opts) {
        this.port = opts.port;
        this.host = opts.host;
        this.user = opts.user;
    }

    connect(){
        const clientScope = this;
        const connectionId = JSON.stringify({ name: this.user });
        const socket = new net.Socket();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        //connect
        socket.connect(this.port, this.host);
        socket.on("connect", () => {
            //log in
            socket.write(connectionId);
            //will store left over JSON from data events
            let partialJSON = "";
            //data event
            socket.on("data", function(data) {
                //process as much valid JSON as possible and store the rest for the next event
                const processedData = clientScope.processData(data, partialJSON);
                partialJSON = processedData.restJSON;
                //display messages from valid JSON
                let displayMessage = "";
                for( let i = 0; i < processedData.parsedJSON.length; i++ ){
                    displayMessage = clientScope.displayResponse(processedData.parsedJSON[i]);
                    if( displayMessage !== null ){
                        console.log("Server: " .green + displayMessage);
                    }
                }  
            });
            //line event
            rl.on("line", (input) => {
                if( input !== null ){
                    const parsedInput = clientScope.parseJSON(input.toString());
                    const requestError = clientScope.checkRequest(parsedInput);
                    if( requestError.status === false ){
                        socket.write(JSON.stringify(parsedInput));
                    } else{
                        console.log(requestError.message .red);
                    }
                }   
            });
            //configure socket timeout
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
                displayMessage = `The count is ${obj.msg.count}.`;
            } else if( obj.msg.hasOwnProperty("time") ){
                displayMessage = `The time and date are ${obj.msg.time}.`;
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

    checkRequest(obj){
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

    processData(data, restJSON){
        const chunk = data.toString();
        const lastNewlineIdx = chunk.lastIndexOf("\n");
        let parsedJSON;
        //Store as much valid JSON as possible from chunk 
        let neatJSON = chunk.substring(0, lastNewlineIdx + 1);
        //Add leftover JSON (if any) from last chunk to the beginning  
        neatJSON = (restJSON + neatJSON).split("\n");
        neatJSON.pop();
        //Parse the valid JSON from chunk
        parsedJSON = neatJSON.map((str) => this.parseJSON(str));
        //Update partial JSON for next data event
        restJSON = chunk.substring(lastNewlineIdx + 1, chunk.length);  
        //the parsed JSON is returned for display, the remaining JSON is used next data event
        return {
            parsedJSON: parsedJSON,
            restJSON: restJSON
        }
    }
}



