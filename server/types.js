/**
 * Code der die Types, Ordner und Variablen erstellt
 */
var opcua = require("node-opcua");
/*
 *	add variable with given name and parent object 
 */
function addVariable(server, parent, browseName){
	console.log("add Variable: "+browseName);
	var counter = 1;

	// emulate variable1 changing every 500 ms
	setInterval(function(){  counter+=1; }, 500);

	server.nodeVariable1 = server.engine.addVariableInFolder(parent,{
	        browseName: browseName,
	        dataType: "Double",
	        value: {
	        	/**
	             * returns the  current value as a Variant
	             * @method get
	             * @return {Variant}
	             */
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
	 var parentFolder = server.engine.createFolder("RootFolder",{ browseName: "MeineWohnung"});
	 //debuggen: warum werden diese folder nicht angezeigt?
	 server.engine.createFolder(parentFolder,{ browseName: "Badezimmer"});
	 server.engine.createFolder(parentFolder,{ browseName: "Küche"});
	 server.engine.createFolder(parentFolder,{ browseName: "Schlafzimmer"});
	 server.engine.createFolder(parentFolder,{ browseName: "Wohnzimmer"});  	
	 
	 addVariable(server, "RootFolder","Testvariable1" );
	 addVariable(server, parentFolder, "Variable in MeineWohnung");
}
/*
 * add types and mandatory variables
 * 
 * TODO:
 * 		Läuft ned! 
 * 		Beispiele anschauen vllt simple_client.js
 * 					oder 
 */
var makeSomeTypes = function (address_space){
	var RaumTypeParams = {
		    browseName: "RaumType"
		};
	//Fehler!
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
var makeRoom = function(address_space, roomName, parentName){
	var parentFolder = address_space.findObject(parentName);

	var room = RaumType.instantiate({
	    organizedBy: parentName,
	    browseName:roomName
	});
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
exports.makeRoom = makeRoom;
exports.makeSomeTypes = makeSomeTypes;
exports.declareFolders = declareFolders;
exports.test = test;