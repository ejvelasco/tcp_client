"use strict";

const net = require("net");
const colors = require("colors");   
const readline = require("readline");
const assert = require("chai").assert;
const Client = require("../Client");
const options = {
    port: 9432,
    host: "35.184.58.167",
    user: "Jose"
} 
const client =  new Client(options);
client.connect();

describe("isBadRequest()", () => {
    it("Should check input is formatted properly and show a helpful error message if necessary", () => {
        const errorMessages = [ 
            "Please include a request property.", 
            "Please set 'request' property to 'count' or 'time'.",
            "Please include only the request and the id (optional) properties.",
        ];
        const sampleInput = [
            { input: { request: "other" }, error: errorMessages[1] },
            { input: { any: "any" }, error: errorMessages[0] },
            { input: { request: "time", id: "id", other: "other"  }, error: errorMessages[2] },
            { input: { request: "other", id: "id" }, error: errorMessages[1] }
        ];
        let requestError;
        for( let i = 0; i < sampleInput.length; i++ ){
            requestError = client.isBadRequest(sampleInput[i]["input"]);
            assert.equal(requestError.message, sampleInput[i]["error"]);
        }
    });
});