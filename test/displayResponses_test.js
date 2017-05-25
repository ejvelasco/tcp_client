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

describe("displayResponse()", () => {
    it("Should display response information in a nice message", () => {
        const sampleMessages = [
            null,
            "Welcome ~~ Jose!", 
            "The time and date are Thu May 25 00:34:01 2017.",
            "The count is 10.",
            "The reply property of the response message does not match the request ID provided.",
            "The time and date are Thu May 25 00:34:01 2017.\nNote: The random number is greater than 30."
        ];
        const sampleResponses = [
            { type:"heartbeat", epoch: 1513789095, show: sampleMessages[0] },
            { type: "welcome", msg: "Welcome ~~ Jose!", show: sampleMessages[1] },
            { msg: { "count": 10 }, show: sampleMessages[3] },
            { msg: { "time": "Thu May 25 00:34:01 2017", "random": 20 }, show: sampleMessages[2] },
            { msg: { "time": "Thu May 25 00:34:01 2017", "random": 35 }, show: sampleMessages[5] }
        ]; 
        let messageShown;
        for( let i = 0; i < sampleResponses.length; i++ ){
            messageShown = client.displayResponse(sampleResponses[i]);
            assert.equal(messageShown, sampleResponses[i].show);
        }
    });
});