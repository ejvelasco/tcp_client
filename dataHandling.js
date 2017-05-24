const net = require("net");
const testServerTwo = net.createServer((socket) => {
    let message = '{"message":"message"}\n';
    let strMessage = ""; 
        for( let i = 0; i < 10000; i++ ){
            strMessage += message;    
        }
        socket.write(strMessage);
    socket.end();
});
const safelyParseJSON = function(json){
    try {
        const parsedJSON = JSON.parse(json);
        if ( parsedJSON && typeof parsedJSON === "object" ) {
            return parsedJSON;
        } else{
            return null;
        }
    } catch (e) {
        console.log(e)
        return null;
    }
}
testServerTwo.listen(4000, "127.0.0.1", () => {
    const testClientTwo = new net.Socket();
    testClientTwo.connect(4000, "127.0.0.1");
    let data = "";
    let buffer = "";
    let messages = [];
    let counter = 0;
    testClientTwo.on('data', function(chunk) {
        chunk = chunk.toString();
        data = (chunk.substring(0, chunk.lastIndexOf("\n") + 1));
        data = (buffer + data).split("\n");
        data.pop();
        data = data.map((str) => safelyParseJSON(str));
        counter += data.length;
        messages = messages.concat(data);
        console.log(messages.length);
        buffer = chunk.substring(chunk.lastIndexOf("\n")+1, chunk.length);        
    });
    testClientTwo.on("close", () => {
        console.log(messages.length, counter);
        testServerTwo.close();
    });
});