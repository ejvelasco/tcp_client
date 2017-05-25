"use strict";

const net = require("net");
const colors = require("colors");   
const readline = require("readline");
const assert = require("chai").assert;
const Client = require("../Client");
 
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
            const options = {
                port: 3000,
                host: "127.0.0.1",
                user: "Jose"
            }    
            const testClient = new Client(options);
            testServer.listen(3000, "127.0.0.1", () => {
                testClient.connect();
            });
        });
    });
});