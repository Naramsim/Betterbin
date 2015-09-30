var fs = Npm.require('fs');
var path = Npm.require( 'path' ) ;
var __ROOT_APP_PATH__ = fs.realpathSync('.');
var pastesPath = path.join(__ROOT_APP_PATH__,"pastes");

if(!fs.existsSync(pastesPath)){
	fs.mkdirSync(pastesPath, 0766, function(err){
		if(err){ 
			console.log(err);
			response.send("ERROR! Can't make the directory! \n");    // echo the result back
		}
	});   
}	
var PastesLinks = new Mongo.Collection("pastesLinks"); //connection to Group Collection //var=> not sharable
/* 
Meteor.publish("pasteLinkss", function () { //share db to the client 
	return PastesLinks.find(); // everything
});
*/

Meteor.methods({ //called by Clients
	addPaste: function (name) {
		var filePath = path.join(pastesPath, name + ".txt" );
		var buffer = new Buffer( name );
		fs.writeFileSync( filePath, buffer );
		PastesLinks.insert({
			link: filePath,
			createdAt: new Date(),
			owner : Meteor.uuid(),
			ip : this.connection.clientAddress
		});
	}
});



Meteor.startup(function () {
	// code to run on server at startup
});