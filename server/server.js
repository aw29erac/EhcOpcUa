/*global require,setInterval,console */
var opcua = require("node-opcua"); //Module einbinden
var tp = require("./types.js");

// Let's create an instance of OPCUAServer
var server = new opcua.OPCUAServer({
    port: 4334, // the port of the listening socket of the server
    resourcePath: "UA/FAPS", // this path will be added to the endpoint resource name
     buildInfo : {
        productName: "FAPSServer1",
        buildNumber: "7658",
        buildDate: new Date()
    }
});

function post_initialize() {
    console.log("initialized");
    function construct_my_address_space(server) {
    
        // declare some folders
    	tp.declareFolders(server);
    	
    	//types.test;        
    }
    
    construct_my_address_space(server);
    
    server.start(function() {
        console.log("Server is now listening ... ( press CTRL+C to stop)");
        console.log("Server name: ", server.buildInfo.productName);
        console.log("Server number: ", server.buildInfo.buildNumber);
        console.log("Date: ", server.buildInfo.buildDate);
        console.log("port ", server.endpoints[0].port);
        var endpointUrl = server.endpoints[0].endpointDescriptions()[0].endpointUrl;
        console.log(" the primary server endpoint url is ", endpointUrl );
    });
}

server.initialize(post_initialize);

//setTimeout(function(){
//	console.log("Server is shutting down in 10 seconds!");
//    server.shutdown(10000, function(){ // Server schließt in 10000ms ?
//    	 console.log(" shutting down completed ");
//    	 process.exit(1);
//    });
//},30000);//30 Sekunden dann wird Server beendet

