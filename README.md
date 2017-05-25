## Description
This is a concise TCP client that plays with a server in a number of ways.
## Client
The Client class and its methods are defined in Client.js. Explanatory comments have been added where necessary. 
## Example
The example.js file is a Client class instance that actually interacts with a server. 
## Tests
The test suite provided tests the methods of the Client class, specifically on the principal features mentioned below. 
## The example features the following:
* Connects and provides credentials to the server.
* Listens for a heartbeat and times out after 2 seconds without a heartbeat.
* Handles input from STDIN so a user can manually send JSON data to the server.
* Supports 2 requests: count and time, and an optional ID property. 
* Processes responses only for requests your client sends.
* Validates outgoing input, and also handles malformed JSON sent by the server.
* Displays response messages in a nice way.
* Notifies user if the random number from a time request is greater than 30.

