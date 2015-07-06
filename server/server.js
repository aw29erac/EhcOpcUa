/*global require,setInterval,console */
var opcua = require("node-opcua");

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

function test(){
	var temperatureSensorTypeParams = {
		    browseName: "TemperatureSensorType",
		};

		var temperatureSensorType = address_space.addObjectType(temperatureSensorTypeParams);

		address_space.addVariable(temperatureSensorType,{
		    browseName:     "Temperature",
		    description:    "The temperature value measured by the sensor",
		    dataType:       "Double",
		    modellingRule:  "Mandatory",
		    value: { dataType: DataType.Double, value: 19.5}
		});
		var parentFolder = address_space.findObject("RootFolder");

    	var temperatureSensor = temperatureSensorType.instantiate({
    	    organizedBy: "RootFolder",
    	    browseName:"MyTemperatureSensor"
    	});
		
}

function declareFolders(server){
	 server.engine.createFolder("RootFolder",{ browseName: "MeineWohnung"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Badezimmer"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Küche"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Schlafzimmer"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Wohnzimmer"});  	
}

function addVariable(server){
	console.log("add Variable Temperatur Bad");
	// add Variable 
	var temperaturBadezimmer = 1;

	// emulate variable1 changing every 500 ms
	setInterval(function(){  temperaturBadezimmer+=1; }, 500);

	server.nodeVariable1 = server.engine.addVariableInFolder("Badezimmer",{
			nodeId: "ns=4;s=temp_bad", // a String NodeId in namespace 4
	        browseName: "TemperaturBadezimmer",
	        dataType: "Double",
	        value: {
	            get: function () {
	                return new opcua.Variant({dataType: opcua.DataType.Double, value: temperaturBadezimmer });
	            }
	        }
	});
}

function post_initialize() {
    console.log("initialized");
    function construct_my_address_space(server) {
    
        // declare some folders
    	declareFolders(server);
    	
    	addVariable(server);
    	
    	//test;        
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


