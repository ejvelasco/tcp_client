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

describe("parseJSON()", () => {
    it("Should parse JSON safely, without causing the client to crash if malformed JSON is received", () => {
        const badJSON = [
            { json: '{ "request": "other" ' },  
            { json: '{ "any": "any }' },
            { json: 123 },
            { json: '{' },
            { json: '{ "any"' },
            { json: '' },
            { json: 'any' },
            { json: false }
        ];
        let parsedJSON;
        for( let i = 0; i < badJSON.length; i++ ){
            parsedJSON = client.parseJSON(badJSON[i]["json"]);
            assert.equal(parsedJSON, null);
        }
    });
});