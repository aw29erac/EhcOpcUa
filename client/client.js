/**
 * Einfacher Client um Daten vom Server zu laden
 */

var opcua = require("node-opcua");
var async = require("async");
var crawler = require('./node_modules/node-opcua/lib/client/node_crawler.js');
var keypress = require('keypress');

var treeify = require('treeify');
var client = new opcua.OPCUAClient();
var endpointUrl = "opc.tcp://" + require("os").hostname() + ":4334/UA/FAPS";
var BrowseDirection = opcua.browse_service.BrowseDirection;
var the_session, the_subscription;

function connect(callback){
    client.connect(endpointUrl,function (err) {
		if(err) {
			console.log(" cannot connect to endpoint :" , endpointUrl );
		} else {
        console.log("connected !... (Press enter to exit)");
		}
    callback(err);
	});
}

function createSession(callback){
    client.createSession( function(err,session) {
    	if(!err) {
    		the_session = session;
    	}
    	callback(err);
    });
}
/*
 * browse subfolders with given namespaceIndex and nodeId of parentFolder
 */
function browseSubfolders(namespace, ni){
	if(typeof ni === "string"){
		console.log("Error: nodId of type String!");
		return;
	}
	var browseDescription = {
			nodeId: ni,
//			nodeId: 1000,
			ns: namespace
//			ns: 0
	}
	console.log("Got this nodeId: "+ni.toString()+" and this namespaceIndex: "+namespace.toString());
	
	the_session.browse( browseDescription ,function (err, itemResults,diagnostics) {
		console.log("Subfolders: ")  
		if (!err) {
			//debuggen: wieso wird hier nichts ausgegeben?
	    	itemResults[0].references.forEach(function(items) {
	    		console.log(items.browseName.toString()+", node ID: "+ items.nodeId.value.toString());
			});
		   }else{
			   console.log(err);
			    console.log(itemResults.toString());
			    console.log(diagnostics);
		}
	});
}
/*
 * Browse "Root Folder" and subfolders of "MeineWohnung" folder
 */
function browse(callback){
	the_session.browse("RootFolder", function(err,browse_result){
		if(!err) {
			browse_result[0].references.forEach(function(item) {
					console.log("my displayName: "+item.displayName.text+", my browseName: "+item.browseName.toString()+", node ID: "+ item.nodeId.value.toString()+", namespace: "+ item.browseName.namespaceIndex.toString()); 
					// NodeCrawler Versuch
					var nodeId = item.nodeId;
					var nodeCrawler = new crawler.NodeCrawler(the_session);
					nodeCrawler.read(nodeId, function(){
	                    if(err){
	                        console.log("Error : trying to read with NodeCrawler ... ", err);
	                        the_session.close(function(err){ // close session
	                            console.log(" session closed");
	                            client.disconnect(function(err){ // disconnect
	                                if (err){ console.log("Error : trying to disconnect ... ",err); 
	                                } else { console.log(" disconnected! "); }
	                            });
	                        });
	                    } else {
	                        console.log("BP5");
	                        treeify.asLines(obj, true, true, function (line) {
	                            console.log(line);
	                        });
	                        var res = obj; // siehe 
	                        console.log(JSON.stringify(res, null, 4));
	                        the_session.close(function(err){ // close session
	                            console.log(" session closed");
	                            client.disconnect(function(err){ // disconnect
	                                if (err){ console.log("Error : trying to disconnect ... ",err); 
	                                } else { console.log(" disconnected! "); }
	                            });
	                        });
	                    } // -- // -- else
				});	
			}); // -- // -- forEach
		} else {
			console.log("Error: ", err);
		}
		callback(err);
		});
}
// read Variable with read          FUNKTIONIERT NICHT
function readVar(callback){
	var max_age = 0;
	var nodes_to_read = [
	   { nodeId: "ns=4;s=temp_bad", attributeId: 13} 
	];
	the_session.read(nodes_to_read, max_age, function(err,nodes_to_read,dataValues) {
	    if (!err) {
	        console.log("Temperatur Bad= " , dataValues[0]);
	    }
	    callback(err);
	});
}

//read Variable Value          FUNKTIONIERT NICHT
function readVariableValue(callback){
	the_session.readVariableValue("ns=4;s=temp_bad", function(err,dataValues) {
	    if (!err) {
	        console.log(" Temperatur Badezimmer °C = " , dataValues);
	    }
	    callback(err);
	});
}
//add Subscription
function addSubscription(callback){
	the_subscription=new opcua.ClientSubscription(the_session,{
	    requestedPublishingInterval: 1000,
	    requestedLifetimeCount: 10,
	    requestedMaxKeepAliveCount: 2,
	    maxNotificationsPerPublish: 10,
	    publishingEnabled: true,
	    priority: 10
	});

	the_subscription.on("started",function(){
	    console.log("subscription started for 5 seconds - subscriptionId=",the_subscription.subscriptionId);
	}).on("keepalive",function(){
	    console.log("keepalive");
	}).on("terminated",function(){
	    callback();
	});

	setTimeout(function(){
	    the_subscription.terminate();
	},5000);//5 Sekunden dann wird Subscription beendet

	// install monitored item
	var monitoredItem  = the_subscription.monitor({
	    nodeId: opcua.resolveNodeId("ns=4;s=temp_bad"),
	    attributeId: 13
	},
	{
	    samplingInterval: 100,
	    discardOldest: true,
	    queueSize: 10
	},
	opcua.read_service.TimestampsToReturn.Both
	);
	console.log("-------------------------------------");

	monitoredItem.on("changed",function(dataValue){
	   console.log(" Temperatur Bad = ",dataValue.value.value);
	});
}
/*
 * close Session hitting "enter"
 */
function closeSession(callback){
	//make `process.stdin` begin emitting "keypress" events 
	keypress(process.stdin);

	//listen for the "keypress" event 
	process.stdin.on('keypress', function (ch, key) {
		if (key && key.name == 'enter'){
			the_session.close(function(err){
			    if(err) {
			        console.log("session closed failed ?");
			    }else{
			    	console.log("Closing Session");
			    }
			    callback();
			});			
		}
	});
	process.stdin.resume();
}

async.series([
    // step 1 : connect to
	connect,

    // step 2 : createSession
	createSession,

    // step 3 : browse
    browse,
    
    //step 4 : read Variable Value
//    readVariableValue,
    
    //step 5 : read Variable
//    readVar,
    
    //setp 6 : add Subscription
    //addSubscription,
    
    //step 5 : close_session
    closeSession
    
],
function(err) {
    if (err) {
        console.log(" failure ",err);
    } else {
        console.log("done!");
    }
    console.log("Client disconnected!");
    client.disconnect(function(){});
    process.exit();
}) ;