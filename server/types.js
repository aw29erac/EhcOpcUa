/**
 * Code der die Types erstellt
 */

/*
 * TODO: 
 * 		correct folder implementation
 * 
 */
var declareFolders = function (server){
	console.log("Got some folders");
	 var meineWohnung = server.engine.createFolder("RootFolder",{ browseName: "MeineWohnung"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Badezimmer"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Küche"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Schlafzimmer"});
	 server.engine.createFolder("MeineWohnung",{ browseName: "Wohnzimmer"});  	
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