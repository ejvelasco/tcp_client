"use strict";

const net = require("net");
const colors = require("colors");   
const readline = require("readline");
const assert = require("chai").assert;
const Client = require("../Client");
const options = {
    port: 3000,
    host: "127.0.0.1",
    user: "Jose"
}  

function areEqualObjects(objOne, objTwo){
    const keysOne = Object.keys(objOne);
    const keysTwo = Object.keys(objTwo);
    if( keysOne.length !== keysTwo.length ){
        return false;
    }
    let areEqual = true;
    for( let i = 0; i < keysOne.length; i++ ){
        if( objOne[keysOne[i]] !== objTwo[keysOne[i]] ){
            areEqual = false;
            break;
        }
    }
    return areEqual;
}

describe("connect()", () => {
    describe("socket.on('connect')", () => {
        it("Should log in as client", (done) => {
            const testServer = net.createServer((socket) => {
                socket.on("data", (data) => {
                    const firstMessageReceived = testClient.parseJSON(data.toString().trim());
                    assert.equal(firstMessageReceived.name, "Jose");
                    testServer.close();
                    done();
                });
            });    
            const testClient = new Client(options);
            testServer.listen(3000, "127.0.0.1", () => {
                testClient.connect();
            });
        });
    });
    describe("socket.on('data')", () => {
        it("Should process multiple incoming data chunks properly.", (done) => {
            const neatJSON = '{"message": "message"}\n';
            const message = JSON.parse(neatJSON);
            const testServer = net.createServer((socket) => {
                let messageJSON = "";
                for( let i = 0; i < Math.exp(10, 6); i++ ){
                    messageJSON += neatJSON;    
                }
                socket.write(messageJSON);
                socket.end();
            });
            const client = new Client(options);
            const testClient = new net.Socket();
            testServer.listen(4000, "127.0.0.1", () => {
                testClient.connect(4000, "127.0.0.1");
                let partialJSON = "";
                testClient.on("data", (data) => {
                    const processedData = client.processData(data, partialJSON);
                    partialJSON = processedData.restJSON;
                    for( let i = 0; i < processedData.parsedJSON.length; i++ ){
                        assert.equal(areEqualObjects(processedData.parsedJSON[i], message), true);
                    }
                });
                testClient.on("close", () => {
                    testServer.close();
                    done();
                });
            });
        });
    });
});