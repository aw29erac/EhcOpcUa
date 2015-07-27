/**
 * Code der die Types erstellt
 */
var opcua = require("node-opcua");
/*
 * TODO: 
 * 		correct folder implementation
 * 
 */

function addVariable(server, parent, name){
	console.log("add Variable: "+name);
	var counter = 1;

	// emulate variable1 changing every 500 ms
	setInterval(function(){  counter+=1; }, 500);

	server.nodeVariable1 = server.engine.addVariableInFolder(parent,{
	        browseName: name,
	        dataType: "Double",
	        value: {
	            get: function () {
	                return new opcua.Variant({dataType: opcua.DataType.Double, value: counter });
	            }
	        }
	});
}
/*
 * TODO:
 *  	create subfolders 
 *  	parentFolder must be a String
 */
var declareFolders = function (server){
	console.log("Got some folders");
	
	 server.engine.createFolder("RootFolder",{ browseName: "MeineWohnung"});
	 //debuggen: warum werden diese folder nicht angezeigt?
	 server.engine.createFolder("MeineWohnung",{ browseName: "Badezimmer"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Küche"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Schlafzimmer"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Wohnzimmer"});  	
	 
	 addVariable(server, "RootFolder","Testvariable1" );
	 addVariable(server, "MeineWohnung", "Variable in MeineWohnung");
}

var makeSomeTypes = function (){
	var RaumTypeParams = {
		    browseName: "RaumType"
		};
	var RaumType = address_space.addObjectType(RaumTypeParams);
	
	address_space.addVariable(RaumType,{
	    browseName:     "Raumtemperatur",
	    description:    "Die gemessene Raumtemperatur",
	    dataType:       "Double",
	    modellingRule:  "Mandatory",
	    value: { dataType: DataType.Double, value: 19.5}
	});	
}
/*
 * Bilden von Instanzen der vorher erstellten Types
 */
var instanzenBilden = function(){
	
}

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
		
		// Instantiate
		var parentFolder = address_space.findObject("RootFolder");

    	var temperatureSensor = temperatureSensorType.instantiate({
    	    organizedBy: "RootFolder",
    	    browseName:"MyTemperatureSensor"
    	});
		
}

exports.makeSomeTypes = makeSomeTypes;
exports.declareFolders = declareFolders;
exports.test = test;