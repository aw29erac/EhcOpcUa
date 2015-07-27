/**
 * Einfacher Client um Daten vom Server zu laden
 */

var opcua = require("node-opcua");
var async = require("async");
var crawler = require('./node_modules/node-opcua/lib/client/node_crawler.js');
var keypress = require('keypress');

var treeify = require('treeify');
var NodeCrawler = opcua.NodeCrawler;
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
 * node crawler
 */
function crawl(nodeId){
	var crawler = new NodeCrawler(the_session);

	crawler.on("browsed",function(element){
//         console.log("->",element.browseName.name,element.nodeId.toString());
    });
	crawler.read(nodeId, function(err, obj){
		if(!err){
			treeify.asLines(obj, true, true, function (line) {
				console.log(line);
			});		
		}
	});	
}
/*
 * Browse "Root Folder" and crawls subfolders of "MeineWohnung" folder
 */
function browse(callback){
	the_session.browse("RootFolder", function(err,browse_result){
		if(!err) {
			browse_result[0].references.forEach(function(item) {
					console.log("my browseName: "+item.browseName.name.toString()+", node ID: "+ item.nodeId.value.toString()+", namespace: "+ item.browseName.namespaceIndex.toString()); 
					// NodeCrawler Versuch
					if(item.browseName.name.toString() == "MeineWohnung"){
						crawl(item.nodeId);		
					}
			}); // -- // -- forEach
		} else {
			console.log("Error: ", err);
		}
		callback(err);
		});
}
/*
 * add Subscription for temp_bad
 * runs 5 seconds
 */
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